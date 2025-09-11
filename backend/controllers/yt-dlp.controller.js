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

export const updateYtDlp = async (req, res) => {
  try {
    setSSEHeaders(res);

    const ytdlpProcess = await spawn("yt-dlp", ["--update"]);

    sseProcessOutput(req, res, ytdlpProcess);
  } catch (error) {
    console.error(error);
    res.send(400).json({ message: "There was an error updating yt-dlp." });
  }
};

export const downloadRegular = async (req, res) => {
  try {
    const { videoUrl } = req.body;
    setSSEHeaders(res);
    const tempDir = await createVideoProcessingFolder(req, res);

    const ytdlpProcess = spawn(
      "yt-dlp",
      [
        "--windows-filenames",
        "--restrict-filenames",
        "--write-description",
        "--write-subs",
        "--write-thumbnail",
        "--embed-subs",
        videoUrl,
      ],
      { cwd: tempDir }
    );

    sseProcessOutput(req, res, ytdlpProcess);

    // Handle process completion
    ytdlpProcess.on("close", async (code) => {
      try {
        res.write(`data: Process exited with code ${code}\n\n`);

        await moveFilesFromProcessingFolder(req, res, tempDir, videoUrl);
        res.end();
      } catch (error) {
        console.error(error);
        res.send(400).json({ message: 'There was an error!' })
      }
    });

    // Clean up if client disconnects
    req.on("close", () => {
      if (!ytdlpProcess.killed) {
        ytdlpProcess.kill(); // Terminate ytdlpProcess
      }
    });
  } catch (error) {
    console.error(error);
    res.send(400).json({ message: "There was an error updating yt-dlp." });
  }
};

export const downloadX = async (req, res) => {
  try {
    const { videoUrl } = req.body;
    setSSEHeaders(res);
    const tempDir = await createVideoProcessingFolder(req, res);

    const ytdlpProcess = spawn(
      "yt-dlp",
      [
        "--write-description",
        "--write-subs",
        "--write-thumbnail",
        "--embed-subs",
        '-o', 
        '%(uploader_id)s-%(id)s-%(upload_date)s.%(ext)s',
        videoUrl,
      ],
      { cwd: tempDir }
    );

    sseProcessOutput(req, res, ytdlpProcess);

    // Handle process completion
    ytdlpProcess.on("close", async (code) => {
      try {
        res.write(`data: Process exited with code ${code}\n\n`);

        await moveFilesFromProcessingFolder(req, res, tempDir, videoUrl);
        res.end();
      } catch (error) {
        console.error(error);
        res.send(400).json({ message: 'There was an error!' })
      }
    });

    // Clean up if client disconnects
    req.on("close", () => {
      if (!ytdlpProcess.killed) {
        ytdlpProcess.kill(); // Terminate ytdlpProcess
      }
    });
  } catch (error) {
    console.error(error);
    res.send(400).json({ message: "There was an error updating yt-dlp." });
  }
};

export const downloadMp3 = async (req, res) => {
  try {
    const { videoUrl } = req.body;
    setSSEHeaders(res);
    const tempDir = await createVideoProcessingFolder(req, res);

    const ytdlpProcess = spawn(
      "yt-dlp",
      [
        "--restrict-filenames",
        "--write-description",
        "--embed-thumbnail",
        '-t', 
        'mp3',
        videoUrl,
      ],
      { cwd: tempDir }
    );

    sseProcessOutput(req, res, ytdlpProcess);

    // Handle process completion
    ytdlpProcess.on("close", async (code) => {
      try {
        res.write(`data: Process exited with code ${code}\n\n`);

        await moveFilesFromProcessingFolder(req, res, tempDir, videoUrl);
        res.end();
      } catch (error) {
        console.error(error);
        res.send(400).json({ message: 'There was an error!' })
      }
    });

    // Clean up if client disconnects
    req.on("close", () => {
      if (!ytdlpProcess.killed) {
        ytdlpProcess.kill(); // Terminate ytdlpProcess
      }
    });
  } catch (error) {
    console.error(error);
    res.send(400).json({ message: "There was an error updating yt-dlp." });
  }
};

export const downloadMp4 = async (req, res) => {
  try {
    const { videoUrl } = req.body;
    setSSEHeaders(res);
    const tempDir = await createVideoProcessingFolder(req, res);

    const ytdlpProcess = spawn(
      "yt-dlp",
      [
        "--windows-filenames",
        "--restrict-filenames",
        "--write-description",
        "--write-subs",
        "--write-thumbnail",
        "--embed-subs",
        "-t",
        "mp4",
        videoUrl,
      ],
      { cwd: tempDir }
    );

    sseProcessOutput(req, res, ytdlpProcess);

    // Handle process completion
    ytdlpProcess.on("close", async (code) => {
      try {
        res.write(`data: Process exited with code ${code}\n\n`);

        await moveFilesFromProcessingFolder(req, res, tempDir, videoUrl);
        res.end();
      } catch (error) {
        console.error(error);
        res.send(400).json({ message: 'There was an error!' })
      }
    });

    // Clean up if client disconnects
    req.on("close", () => {
      if (!ytdlpProcess.killed) {
        ytdlpProcess.kill(); // Terminate ytdlpProcess
      }
    });
  } catch (error) {
    console.error(error);
    res.send(400).json({ message: "There was an error updating yt-dlp." });
  }
};
