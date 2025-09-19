import { pool } from "./db.pool.js"

export const getAllVideosForUser = async (userId) => {
    const [ results, fields ] = await pool.execute('SELECT * FROM videos LEFT JOIN thumbnails on videos.id = thumbnails.videoId WHERE userId = ?;', [userId]);
    return results;
}

export const getVideoCountForUser = async (userId) => {
    const [ results, fields ] = await pool.execute('SELECT COUNT(*) FROM videos where userId = ?;', [userId]);
    return results;
}

export const sqlGetVideo = async (userId, videoId) => {
    const [ results, fields ] = await pool.execute('SELECT * FROM videos LEFT JOIN thumbnails on videos.id = thumbnails.videoId WHERE userId = ? AND id = ?;', [userId, videoId]);
    return results;
}

export const sqlAddVideo = async (file, description, userId) => {
    const [ results, fields ] = await pool.execute('INSERT INTO `videos` (`id`, `name`, `description`, `ext`, `downloadDate`, `link`, `type`, `videoPath`, `userId`, `serverPath`) VALUES (NULL, ?, ?, ?, NOW(), ?, ?, ?, ?, ?);', [file.basename, description, file.extension, file.link, 0, file.path, userId, file.serverPath]);

    return results;
}

export const sqlUpdateVideoPaths = async (videoPath, serverPath, videoId) => {
    const [ results, fields ] = await pool.execute(`UPDATE videos SET videoPath = ?, serverPath = ? WHERE id = ?;`, [videoPath, serverPath, videoId]);

    return results;
}

export const sqlDeleteVideo = async (userId, videoId) => {
    const [ results, fields ] = await pool.execute('DELETE FROM videos WHERE userId = ? AND id = ?;', [userId, videoId]);
    return results;
}