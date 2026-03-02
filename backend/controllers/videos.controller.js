import { sqlDeleteVideo, getAllVideosForUser, sqlGetVideo, getVideoCountForUser, sqlUpdateVideo, sqlAddSubtitlesToVideo, sqlAddSubtitlesFileToVideo } from "../db/queries.videos.js"
import { sqlSearchVideos } from "../db/queries.search.js";
import path from 'path';
import { copyFile, readFile, rm } from "fs/promises";
import "@dotenvx/dotenvx/config";
const env = process.env;
import { fileURLToPath } from 'url';
import {
    createVideoProcessingFolder
  } from "../utils/fileOperations.js";
  import { setSSEHeaders, sseProcessOutput } from "../utils/ytdlpOperations.js";
  import { spawn } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getVideos = async (req, res) => {
    try {
        const videos = await getAllVideosForUser(req.userId);

        res.json(videos.reverse());
    } catch (error) {
        console.error(error);
        res.send(400).json({ message: 'There was an error getting the videos for the user.' })
    }
}

export const getVideoById = async (req, res) => {
    try {
        const videoId = req.params.id;
        const video = await sqlGetVideo(req.userId, videoId);

        res.json(video);
    } catch (error) {
        console.error(error);
        res.send(400).json({ message: 'There was an error getting the videos for the user.' })
    }
}

export const getUserVideoCount = async (req, res) => {
    try {
        const count = await getVideoCountForUser(req.userId);
        res.json(count);
    } catch (error) {
        console.error(error);
        res.send(400).json({ message: 'There was an error getting the videos for the user.' })
    }
}

export const deleteVideoByIdAndUserId = async (req, res) => {
    const videoId = req.params.id;

    try {
        const deleteResults = await sqlDeleteVideo(req.userId, videoId);
        res.json(deleteResults);
    } catch (error) {
        console.error(error);
        res.send(400).json({ message: 'There was an error getting the deleting the video for the user.' })
    }
}

export const searchVideos = async (req, res) => {
    try {
        const { searchTerm } = req.body;
        const results = await sqlSearchVideos(searchTerm, req.userId);
        res.json(results);
    } catch (error) {
        console.error(error);
        res.send(400).json({ message: 'There was an error searching for the video.' })
    }
}

export const updateVideo = async (req, res) => {
    try {
        const video = req.body;
        const results = await sqlUpdateVideo(video);
        res.json(results)
    } catch (error) {
        console.error(error);
        res.send(400).json({ message: 'There was an error updating the video.' })
    }
}

export const moveVideoToJellyfin = async (req, res) => {
    try {
        const videoId = req.params.id;
        const queryResults = await sqlGetVideo(req.userId, videoId);
        const serverPath = queryResults[0].serverPath;
        const jellyfinPath = env.JELLYFIN_FOLDER_PATH;

        await copyFile(serverPath, path.join(jellyfinPath, `${queryResults[0].name}.${queryResults[0].ext}`));
        return res.json({ message: "File successfully copied to Jellyfin. "})
    } catch (error) {
        console.error(error);
        res.send(400).json({ message: 'There was an error copying the video.' })
    }
}

export const generateSubtitles = async (req, res) => {
    try {
        const videoId = req.params.id;
        const queryResults = await sqlGetVideo(req.userId, videoId);
        const video = queryResults[0];
        const videoPath = video.serverPath;
        const audioFileName = `${video.id}-${video.name}-subtitle.mp3`;
        const whisperXFilesNamePrefix = `${video.id}-${video.name}-subtitle`;
        const subtitleName = `${video.id}-${video.name}-subtitle.vtt`;

        //#region FFMPEG Conversion
        setSSEHeaders(res);
        const tempDir = await createVideoProcessingFolder(req, res);
        const audioFilePath = path.join(tempDir, audioFileName);
    
        // "ffmpeg -i `"$InputFile`" -c:a libmp3lame -ar 16000 -ac 1 -b:a 128k -map 0:a:0 -y `"$outputFile`""
        const ffmpegProcess = spawn(
          "ffmpeg",
          [
            '-loglevel', 
            'verbose',
            "-i",
            videoPath,
            // "-c:a",
            // "libmp3lame",
            // "-ar",
            // "16000",
            // "-ac",
            // "1",
            // "-b:a",
            // "128k",
            // "-map",
            // "0:a:0",
            // "-y",
            audioFilePath
          ],
          { cwd: tempDir }
        );
    
        sseProcessOutput(req, res, ffmpegProcess);
    
        // Handle process completion
        ffmpegProcess.on("exit", async (code) => {
          try {           
            //#region WhisperX
            const whisperX = spawn(
                "whisperx",
                // Uncomment below for CUDA per 02-23-2026 documentation
                // [
                //     '--language',
                //     'en',
                //     '--compute_type',
                //     'float32',
                //     audioFilePath
                // ],
                // Uncomment below for CPU per 02-23-2026 documentation
                [
                    '--language',
                    'en',
                    '--compute_type',
                    'int8',
                    '--device',
                    'cpu',
                    audioFilePath
                ],
                { cwd: tempDir }
              );
            
              sseProcessOutput(req, res, whisperX);

              // Handle process completion
              whisperX.on("exit", async (code) => {
                try {
                  res.write(`data: Process exited with code ${code}\n\n`);
                  res.write(`Subtitles generated successfully.\n\n`);
                  const subtitlesFileLocation = path.join(__dirname,'..', 'media', 'subtitles', subtitleName);
                  const subtitlesTxt = await readFile(path.join(tempDir, `${whisperXFilesNamePrefix}.txt`), 'utf-8');
                  await copyFile(path.join(tempDir, subtitleName), subtitlesFileLocation);
                  res.write(`Subtitles moved to subtitle folder successfully.\n\n`);
                  const sqlResponse = await sqlAddSubtitlesToVideo(videoId, subtitlesTxt);
                  const sqlResponse2 = await sqlAddSubtitlesFileToVideo(videoId, subtitlesFileLocation)
                  res.write(`Subtitles saved to db successfully.\n\n`);
                  await rm(tempDir, { recursive: true, force: true});
                  res.write("data: Processing folder deleted.\n\n");

                  res.status(200).send();
                } catch (error) {
                  console.error(error);
                  res.status(400).json({ message: 'There was an error!' })
                }
              });
          
              // Clean up if client disconnects
            //   req.on("close", () => {
            //     if (!whisperFasterProcess.killed) {
            //       whisperFasterProcess.kill(); // Terminate whisper-faster process
            //     }
            //   });

              //#endregion
          } catch (error) {
            console.error(error);
            res.status(400).json({ message: 'There was an error!' })
          }
        });
    
        // Clean up if client disconnects
        // req.on("close", () => {
        //   if (!ffmpegProcess.killed) {
        //     ffmpegProcess.kill(); // Terminate ytdlpProcess
        //   }
        // });
        //#endregion


        // res.json(video);
    } catch (error) {
        console.error(error);
        res.send(400).json({ message: 'There was an error generating the subtitles.' })
    }
}