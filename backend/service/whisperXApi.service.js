import { Readable } from "stream";
import path from 'path';
import fs from 'fs/promises';
import fsSync from 'fs';
import { copyFile, readFile, rm } from "fs/promises";
import "@dotenvx/dotenvx/config";
import { __dirname, __filename } from "../utils/fileOperations.js";

const env = process.env;

export const whisperXApiConvertToMp3 = async (video) => {
    const videoPath = video.serverPath;
    const videoName = `${video.id}-${video.name}${video.ext}`;

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

    return savePath;
};

export const whisperXApiTranscribe = async (mp3Path, video) => {
    const videoPath = video.serverPath;
    const videoName = `${video.id}-${video.name}${video.ext}`;

    // Read the file
    const mp3FileBuffer = await fs.readFile(mp3Path);
    // Convert Buffer to Blob
    const mp3FileBlob = new Blob([mp3FileBuffer], { type: 'audio/mpeg' });

    // Create the form
    const mp3Form = new FormData();
    mp3Form.append('mp3', mp3FileBlob, videoName)

    const whisperXApiTranscribeVideo = await fetch(`${env.WHISPER_X_API_URL}/whisperx/generateSubtitles`, {
        method: 'POST',
        body: mp3Form
    });

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
    const saveDir = path.resolve(__dirname, '..', 'temp'); // Adjust folder as needed (e.g., `./downloads/${req.userId}`)
    await fs.mkdir(saveDir, { recursive: true }); // Ensure directory exists
    const mp3SavePath = path.join(saveDir, mp3SanitizedName);

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

    return mp3SavePath;
}

export const whisperXApiGetSubtitlesText = async (video) => {
    const videoName = `${video.id}-${video.name}`;

    const fetchRes = await fetch(`${env.WHISPER_X_API_URL}/subtitles/text/${videoName}`);
    const data = await fetchRes.json();

    return data.subtitles;
}