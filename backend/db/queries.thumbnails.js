import { pool } from "./db.pool.js"

export const addThumbnailToDb = async (file, videoId) => {
    const [ results, fields ] = await pool.execute('INSERT INTO `thumbnails` (`id`, `name`, `videoId`, `thumbnailPath`) VALUES (NULL, ?, ?, ?);', [file.basename, videoId, file.path]);

    return results;
}