import { pool } from "./db.pool.js"

export const getAllVideosForUser = async (userId) => {
    const [ results, fields ] = await pool.execute('SELECT * FROM videos LEFT JOIN thumbnails on videos.id = thumbnails.videoId WHERE userId = ?;', [userId]);
    return results;
}

export const getVideoCountForUser = async (userId) => {
    const [ results, fields ] = await pool.execute('SELECT COUNT(*) FROM videos where userId = ?;', [userId]);
    return results;
}

export const getVideo = async (userId, videoId) => {
    const [ results, fields ] = await pool.execute('SELECT * FROM videos LEFT JOIN thumbnails on videos.id = thumbnails.videoId WHERE userId = ? AND id = ?;', [userId, videoId]);
    return results;
}

export const addVideoToDb = async (file, description, userId) => {
    const [ results, fields ] = await pool.execute('INSERT INTO `videos` (`id`, `name`, `description`, `ext`, `downloadDate`, `link`, `type`, `videoPath`, `userId`) VALUES (NULL, ?, ?, ?, NOW(), ?, ?, ?, ?);', [file.basename, description, file.extension, file.link, 0, file.path, userId]);

    return results;
}