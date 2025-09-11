import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

export const __filename = fileURLToPath(import.meta.url);

export const __dirname = path.dirname(__filename);

export const rootFolder = path.join(__dirname, '../');

export const createFolders = async () => {
    try {
        // Create the _processing folder
        await fs.mkdir(path.join(rootFolder, 'media'));
        await fs.mkdir(path.join(rootFolder, 'media', '_processing'));
        await fs.mkdir(path.join(rootFolder, 'media', 'mp3s'));
        await fs.mkdir(path.join(rootFolder, 'media', 'videos'));
        await fs.mkdir(path.join(rootFolder, 'media', 'videos', 'thumbnails'));

        return true;
    } catch (error) {
        throw error;
    }
}