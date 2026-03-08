import { sqlDeleteVideo, getAllVideosForUser, sqlGetVideo, getVideoCountForUser, sqlUpdateVideo, sqlAddSubtitlesToVideo, sqlAddSubtitlesFileToVideo } from "../db/queries.videos.js"
import { sqlSearchVideos } from "../db/queries.search.js";
import { Readable } from "stream";
import path from 'path';
import fs from 'fs/promises';
import fsSync from 'fs';
import FormDataGrok from '../utils/form-data-grok.js';
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
        return res.json({ message: "File successfully copied to Jellyfin. " })
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
                        '--highlight_words',
                        'True',
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
                        const subtitlesFileLocation = path.join(__dirname, '..', 'media', 'subtitles', subtitleName);
                        const subtitlesTxt = await readFile(path.join(tempDir, `${whisperXFilesNamePrefix}.txt`), 'utf-8');
                        await copyFile(path.join(tempDir, subtitleName), subtitlesFileLocation);
                        res.write(`Subtitles moved to subtitle folder successfully.\n\n`);
                        const sqlResponse = await sqlAddSubtitlesToVideo(videoId, subtitlesTxt);
                        const sqlResponse2 = await sqlAddSubtitlesFileToVideo(videoId, subtitlesFileLocation)
                        //   res.write(`Subtitles saved to db successfully.\n\n`);
                        await rm(tempDir, { recursive: true, force: true });
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

export const whisperXAPIConvertVideoToMp4 = async (req, res) => {
    try {
        const videoId = req.params.id;
        const queryResults = await sqlGetVideo(req.userId, videoId);
        const video = queryResults[0];
        const videoPath = video.serverPath;
        const videoName = `${video.name}${video.ext}`

        // Read the file
        const fileBuffer = await fs.readFile(videoPath);
        // Convert Buffer to Blob
        const fileBlob = new Blob([fileBuffer], { type: 'video/mp4' });


        // Create the form
        const form = new FormData();
        form.append('video', fileBlob, videoName)

        const whisperXApiResponse = await fetch(`${env.WHISPER_X_API_URL}/ffmpeg/convertVideoToMp3`, {
            method: 'POST',
            body: form
        });

        //#region Handling the file download from the response
        // Extract filename from Content-Disposition header
        const contentDisposition = whisperXApiResponse.headers.get('Content-Disposition');
        let downloadFileName = `${videoName}.mp3`; // Default
        if (contentDisposition) {
            const match = contentDisposition.match(/filename=([^;]+)/);
            if (match) {
                downloadFileName = match[1].replace(/"/g, ''); // Remove quotes
            }
        }

        // Sanitize filename and set save path
        const sanitizedName = path.basename(downloadFileName).replace(/[^a-zA-Z0-9._\-]/g, '_');
        const saveDir = path.resolve(__dirname, '..', 'temp'); // Adjust folder as needed (e.g., `./downloads/${req.userId}`)
        await fs.mkdir(saveDir, { recursive: true }); // Ensure directory exists
        const savePath = path.join(saveDir, sanitizedName);

        // Pipe response body to file
        const writer = fsSync.createWriteStream(savePath);
        const reader = whisperXApiResponse.body;

        // Convert Web ReadableStream to Node.js Readable stream
        const nodeReader = Readable.fromWeb(reader);

        nodeReader.pipe(writer);

        // Wait for piping to complete
        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
            nodeReader.on('error', reject);
        });

        //#endregion

        // Respond to client with success and file info
        res.status(200).json({
            message: 'Video converted and downloaded successfully',
            originalVideo: videoName,
            downloadedFile: sanitizedName,
            downloadPath: savePath
        });

        // if (whisperXApiResponse.ok) {
        //     console.log(whisperXApiResponse);
        //     const data = await whisperXApiResponse.json();
        //     res.json(data);
        // } else {
        //     res.status(whisperXApiResponse.status).json({ error: `API responded with ${whisperXApiResponse.status}` });
        // }
    } catch (error) {
        console.error(error);
        res.send(400).json({ message: 'There was an error with converting the video through the WhisperX API.' })
    }
}

export const whisperXApiTranscribeVideo = async (req, res) => {
    try {
        const videoId = req.params.id;
        const queryResults = await sqlGetVideo(req.userId, videoId);
        const video = queryResults[0];
        const videoPath = video.serverPath;
        const videoName = `${video.name}${video.ext}`

        // Read the file
        const fileBuffer = await fs.readFile(videoPath);
        // Convert Buffer to Blob
        const fileBlob = new Blob([fileBuffer], { type: 'video/mp4' });


        // Create the form
        const form = new FormData();
        form.append('video', fileBlob, videoName)

        const whisperXApiResponse = await fetch(`${env.WHISPER_X_API_URL}/ffmpeg/convertVideoToMp3`, {
            method: 'POST',
            body: form
        });

        //#region Handling the file download from the response
        // Extract filename from Content-Disposition header
        const contentDisposition = whisperXApiResponse.headers.get('Content-Disposition');
        let downloadFileName = `${videoName}.mp3`; // Default
        if (contentDisposition) {
            const match = contentDisposition.match(/filename=([^;]+)/);
            if (match) {
                downloadFileName = match[1].replace(/"/g, ''); // Remove quotes
            }
        }

        // Sanitize filename and set save path
        const sanitizedName = path.basename(downloadFileName).replace(/[^a-zA-Z0-9._\-]/g, '_');
        const saveDir = path.resolve(__dirname, '..', 'temp'); // Adjust folder as needed (e.g., `./downloads/${req.userId}`)
        await fs.mkdir(saveDir, { recursive: true }); // Ensure directory exists
        const savePath = path.join(saveDir, sanitizedName);

        // Pipe response body to file
        const writer = fsSync.createWriteStream(savePath);
        const reader = whisperXApiResponse.body;

        // Convert Web ReadableStream to Node.js Readable stream
        const nodeReader = Readable.fromWeb(reader);

        nodeReader.pipe(writer);

        // Wait for piping to complete
        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
            nodeReader.on('error', reject);
        });
        //#endregion

        // TODO: Move all of these to a service eventually...

        //#region WhisperXAPI subtitle generation

        // Read the file
        const mp3FileBuffer = await fs.readFile(savePath);
        // Convert Buffer to Blob
        const mp3FileBlob = new Blob([mp3FileBuffer], { type: 'audio/mpeg' });

        // Create the form
        const mp3Form = new FormData();
        mp3Form.append('mp3', mp3FileBlob, videoName)

        const whisperXApiTranscribeVideo = await fetch(`${env.WHISPER_X_API_URL}/whisperx/generateSubtitles`, {
            method: 'POST',
            body: mp3Form
        });

        //#region Handling the file download from the response
        // Extract filename from Content-Disposition header
        const mp3ContentDisposition = whisperXApiTranscribeVideo.headers.get('Content-Disposition');
        let mp3DownloadFileName = `${videoName}.vtt`; // Default
        if (mp3ContentDisposition) {
            const match = mp3ContentDisposition.match(/filename=([^;]+)/);
            if (match) {
                mp3DownloadFileName = match[1].replace(/"/g, ''); // Remove quotes
            }
        }

        // Sanitize filename and set save path
        const mp3SanitizedName = path.basename(mp3DownloadFileName).replace(/[^a-zA-Z0-9._\-]/g, '_');
        const mp3SaveDir = path.resolve(__dirname, '..', 'temp'); // Adjust folder as needed (e.g., `./downloads/${req.userId}`)
        await fs.mkdir(saveDir, { recursive: true }); // Ensure directory exists
        const mp3SavePath = path.join(mp3SaveDir, mp3SanitizedName);

        // Pipe response body to file
        const mp3Writer = fsSync.createWriteStream(mp3SavePath);
        const mp3Reader = whisperXApiTranscribeVideo.body;

        // Convert Web ReadableStream to Node.js Readable stream
        const mp3NodeReader = Readable.fromWeb(mp3Reader);

        mp3NodeReader.pipe(mp3Writer);

        // Wait for piping to complete
        await new Promise((resolve, reject) => {
            mp3Writer.on('finish', resolve);
            mp3Writer.on('error', reject);
            mp3NodeReader.on('error', reject);
        });

        //#endregion

        // Respond to client with success and file info
        res.status(200).json({
            message: 'Video converted and downloaded successfully',
            originalVideo: videoName,
            downloadedFile: sanitizedName,
            downloadPath: savePath
        });

        // if (whisperXApiResponse.ok) {
        //     console.log(whisperXApiResponse);
        //     const data = await whisperXApiResponse.json();
        //     res.json(data);
        // } else {
        //     res.status(whisperXApiResponse.status).json({ error: `API responded with ${whisperXApiResponse.status}` });
        // }
    } catch (error) {
        console.error(error);
        res.send(400).json({ message: 'There was an error with converting the video through the WhisperX API.' })
    }
}