import { pool } from "./db.pool.js"

export const addThumbnailToDb = async (file, videoId) => {
    const [ results, fields ] = await pool.execute('INSERT INTO `thumbnails` (`id`, `name`, `videoId`, `thumbnailPath`, `serverPath`) VALUES (NULL, ?, ?, ?, ?);', [file.basename, videoId, file.path, file.serverPath]);

    return results;
}