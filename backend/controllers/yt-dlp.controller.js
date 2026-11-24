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
import {
  harvestCookiesWithChrome,
  cleanupCookieFile,
} from "../utils/cookieHarvest.js";

// Using Server-Sent Events (SSE)

const failDownloadOptions = (res, message) => {
  setSSEHeaders(res);
  res.write(`data: Error: ${message}\n\n`);
  res.end();
};

const runDownload = async (req, res, downloadOption) => {
  let cookiesPath = null;
  try {
    const { videoUrl } = req.body;
    const resolved = resolveDownloadOptions(req.body);
    if (!resolved.ok) {
      failDownloadOptions(res, resolved.message);
      return;
    }

    setSSEHeaders(res);
    const tempDir = await createVideoProcessingFolder(req, res);

    const options = { ...resolved.options };

    if (options.cookieSource === "harvest") {
      res.write(`data: Harvesting cookies via Google Chrome…\n\n`);
      try {
        cookiesPath = await harvestCookiesWithChrome({
          url: videoUrl,
          outputDir: tempDir,
        });
        options.cookiesPath = cookiesPath;
        res.write(`data: Cookies harvested. Starting yt-dlp…\n\n`);
      } catch (harvestError) {
        const message = harvestError?.message || String(harvestError);
        console.error(harvestError);
        res.write(`data: Error: ${message}\n\n`);
        res.end();
        return;
      }
    }

    const ytdlpProcess = spawn(
      "yt-dlp",
      buildDownloadArgs({
        type: downloadOption,
        videoUrl,
        ...options,
      }),
      { cwd: tempDir }
    );

    sseProcessOutput(req, res, ytdlpProcess);

    ytdlpProcess.on("close", async (code) => {
      try {
        res.write(`data: Process exited with code ${code}\n\n`);
        // Remove cookie file before scanning the processing folder for media.
        await cleanupCookieFile(cookiesPath);
        cookiesPath = null;

        await moveFilesFromProcessingFolder(req, res, tempDir, videoUrl, downloadOption);
        res.end();
      } catch (error) {
        console.error(error);
        await cleanupCookieFile(cookiesPath);
        cookiesPath = null;
        res.status(400).json({ message: "There was an error!" });
      }
    });

    req.on("close", () => {
      if (!ytdlpProcess.killed) {
        ytdlpProcess.kill();
      }
      cleanupCookieFile(cookiesPath);
      cookiesPath = null;
    });
  } catch (error) {
    console.error(error);
    await cleanupCookieFile(cookiesPath);
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
