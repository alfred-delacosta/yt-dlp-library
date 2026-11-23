import '@dotenvx/dotenvx/config';
import { spawn } from "child_process";
import {
  createVideoProcessingFolder,
  moveFilesFromProcessingFolder,
} from "../utils/fileOperations.js";
import {
  setSSEHeaders,
  sseProcessOutput,
  resolveDownloadOptions,
  buildDownloadArgs,
} from "../utils/ytdlpOperations.js";

// Using Server-Sent Events (SSE)

const failDownloadOptions = (res, message) => {
  setSSEHeaders(res);
  res.write(`data: Error: ${message}\n\n`);
  res.end();
};

const runDownload = async (req, res, downloadOption) => {
  try {
    const { videoUrl } = req.body;
    const resolved = resolveDownloadOptions(req.body);
    if (!resolved.ok) {
      failDownloadOptions(res, resolved.message);
      return;
    }

    setSSEHeaders(res);
    const tempDir = await createVideoProcessingFolder(req, res);

    const ytdlpProcess = spawn(
      "yt-dlp",
      buildDownloadArgs({
        type: downloadOption,
        videoUrl,
        ...resolved.options,
      }),
      { cwd: tempDir }
    );

    sseProcessOutput(req, res, ytdlpProcess);

    ytdlpProcess.on("close", async (code) => {
      try {
        res.write(`data: Process exited with code ${code}\n\n`);

        await moveFilesFromProcessingFolder(req, res, tempDir, videoUrl, downloadOption);
        res.end();
      } catch (error) {
        console.error(error);
        res.status(400).json({ message: "There was an error!" });
      }
    });

    req.on("close", () => {
      if (!ytdlpProcess.killed) {
        ytdlpProcess.kill();
      }
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "There was an error updating yt-dlp." });
  }
};

export const updateYtDlp = async (req, res) => {
  try {
    setSSEHeaders(res);

    const ytdlpProcess = await spawn("yt-dlp", ["--update"]);

    sseProcessOutput(req, res, ytdlpProcess);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "There was an error updating yt-dlp." });
  }
};

export const downloadRegular = async (req, res) => {
  await runDownload(req, res, "regular");
};

export const downloadX = async (req, res) => {
  await runDownload(req, res, "x");
};

export const downloadMp3 = async (req, res) => {
  await runDownload(req, res, "mp3");
};

export const downloadMp4 = async (req, res) => {
  await runDownload(req, res, "mp4");
};
