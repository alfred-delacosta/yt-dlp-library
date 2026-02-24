import { spawn } from "child_process";
import { promisify } from "util";
import {
  createVideoProcessingFolder,
  moveFilesFromProcessingFolder,
  rootFolder,
} from "../utils/fileOperations.js";
import path from "path";
import { setSSEHeaders, sseProcessOutput } from "../utils/ytdlpOperations.js";

// Using Server-Sent Events (SSE)

export const convertToMp4 = async (req, res) => {
  try {
    const videoId = req.params.id;
    const queryResults = await sqlGetVideo(req.userId, videoId);
    const videoUrl = queryResults[0].link;
    const serverPath = queryResults[0].serverPath;
    const videoNameWithExtension = `${queryResults[0].name}-MP4.${queryResults[0].ext}`;

    setSSEHeaders(res);
    const tempDir = await createVideoProcessingFolder(req, res);
    const tempVideoFullPath = `${path.join(tempDir, videoNameWithExtension)}`

    const ffmpegProcess = spawn(
      "ffmpeg",
      [
        '-loglevel',
        'verbose',
        '-i',
        serverPath,
        tempVideoFullPath
      ],
      { cwd: tempDir }
    );

    sseProcessOutput(req, res, ffmpegProcess);

    // Handle process completion
    ffmpegProcess.on("close", async (code) => {
      try {
        res.write(`data: Process exited with code ${code}\n\n`);

        await moveFilesFromProcessingFolder(req, res, tempDir, videoUrl);
        res.end();
      } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'There was an error!' })
      }
    });

    // Clean up if client disconnects
    req.on("close", () => {
      if (!ffmpegProcess.killed) {
        ffmpegProcess.kill(); // Terminate ytdlpProcess
      }
    });
  } catch (error) {
    console.log("There was an error converting the video to MP4.")
    console.error(error);
    res.status(400).json({ message: "There was an error converting the video to MP4." });
  }
};
