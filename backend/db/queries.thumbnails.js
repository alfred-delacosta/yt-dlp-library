import { pool } from "./db.pool.js"

export const addThumbnailToDb = async (file, videoId) => {
    const [ results, fields ] = await pool.execute('INSERT INTO `thumbnails` (`id`, `name`, `videoId`, `thumbnailPath`, `serverPath`) VALUES (NULL, ?, ?, ?, ?);', [file.basename, videoId, file.path, file.serverPath]);

    return results;
}

export const getAllThumbnails = async () => {
    const [ results, fields ] = await pool.execute('SELECT * FROM thumbnails;');
    return results;
}

export const sqlUpdateThumbnailPaths = async (thumbnailPath, serverPath, thumbnailId) => {
    const [ results, fields ] = await pool.execute(`UPDATE thumbnails SET thumbnailPath = ?, serverPath = ? WHERE id = ?;`, [thumbnailPath, serverPath, thumbnailId]);

    return results;
}
