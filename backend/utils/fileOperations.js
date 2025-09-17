import path from "path";
import fs from "fs/promises";
import { randomUUID } from "crypto";
import { fileURLToPath } from "url";
import getFileParts from "./fileUtils.js";
import { sqlAddVideo } from "../db/queries.videos.js";
import { addThumbnailToDb } from "../db/queries.thumbnails.js";
import { addMp3ToDb } from "../db/queries.mp3s.js";

export const __filename = fileURLToPath(import.meta.url);

export const __dirname = path.dirname(__filename);

export const rootFolder = path.join(__dirname, "../");

export const getRandomUUID = () => {
  return randomUUID();
};

export const createFolders = async () => {
  try {
    // Create the _processing folder
    await fs.mkdir(path.join(rootFolder, "media"));
    await fs.mkdir(path.join(rootFolder, "media", "_processing"));
    await fs.mkdir(path.join(rootFolder, "media", "mp3s"));
    await fs.mkdir(path.join(rootFolder, "media", "videos"));
    await fs.mkdir(path.join(rootFolder, "media", "videos", "thumbnails"));

    return true;
  } catch (error) {
    throw error;
  }
};

export const createVideoProcessingFolder = async (req, res) => {
  try {
    const folderName = getRandomUUID();
    const folderPath = path.join(
      rootFolder,
      "media",
      "_processing",
      folderName
    );
    await fs.mkdir(folderPath);
    return folderPath;
  } catch (error) {
    console.error(error);
    res
      .send(400)
      .json({ message: "There was an error creating the random folder." });
  }
};

export const deleteVideoProcessingFolder = async (req, res, videoProcessingFolder) => {
  try {
    await fs.rmdir(videoProcessingFolder);
  } catch (error) {
    console.error(error);
    res.status(400).json({
      message: "There was an error deleting the processing video directory.",
    });
  }
};

export const moveFilesFromProcessingFolder = async (req, res,videoProcessingFolder, link) => {
  try {
    let video, thumbnail, subtitle, description, mp3, videoId = undefined;
    const folderContents = await fs.readdir(videoProcessingFolder);
    let files = [];

    folderContents.forEach((file) => {
      const fileParts = getFileParts(file);
      files.push(fileParts);
    });

    for (let file of files) {
      // Handle the videos
      if (file.fileType === "video") {
        video = file;
        const oldPath = path.join(videoProcessingFolder, file.fullFileName);

        const serverPath = path.join(
          rootFolder,
          "media",
          "videos",
          file.fullFileName
        );
        const newPath = path.join(
          "media",
          "videos",
          file.fullFileName
        );
        video.path = newPath;
        video.serverPath = serverPath;
        video.link = link;

        // Move the video
        await fs.rename(oldPath, newPath);
        res.write("data: Video file moved\n\n");
      }
      // Handle Thumbnails
      else if (file.fileType === "thumbnail") {
        thumbnail = file;
        const oldPath = path.join(videoProcessingFolder, file.fullFileName);

        const serverPath = path.join(
          rootFolder,
          "media",
          "videos",
          "thumbnails",
          file.fullFileName
        );
        const newPath = path.join(
          "media",
          "videos",
          "thumbnails",
          file.fullFileName
        );
        thumbnail.serverPath = serverPath;
        thumbnail.path = newPath;

        // Move the Thumbnail
        await fs.rename(oldPath, newPath);
        res.write("data: Thumbnail file moved\n\n");
      }
      // Handle MP3
      else if (file.fileType === "audio") {
        mp3 = file;
        const oldPath = path.join(videoProcessingFolder, file.fullFileName);

        const serverPath = path.join(
          rootFolder,
          "media",
          "mp3s",
          file.fullFileName
        );
        const newPath = path.join(
          "media",
          "mp3s",
          file.fullFileName
        );
        mp3.path = newPath;
        mp3.serverPath = serverPath;
        mp3.link = link;

        // Move the MP3
        await fs.rename(oldPath, newPath);
        res.write("data: MP3 file moved\n\n");
      }
      // Description
      else if (file.fileType === "description") {
        description = await fs.readFile(
          path.join(videoProcessingFolder, file.fullFileName),
          { encoding: "UTF-8" }
        );
        res.write("data: Description file found...\n\n");
      }
    }

    if (video !== undefined) {
        const queryResults = await sqlAddVideo(video, description, req.userId);
        videoId = queryResults.insertId;
        res.write("data: Video added to database!\n\n");
    }

    if (thumbnail !== undefined) {
        const thumbnailResults = await addThumbnailToDb(thumbnail, videoId);
        res.write("data: Thumbnail added to database!\n\n");
    }

    if (mp3 !== undefined) {
        const queryResults = await addMp3ToDb(mp3, description, req.userId);
        res.write("data: MP3 added to database!\n\n");
    }

    // Delete the video processing folder
    await fs.rm(videoProcessingFolder, { recursive: true, force: true});
    res.write("data: Processing folder deleted.\n\n");

  } catch (error) {
    console.log(error);
    return error;
  }
};
