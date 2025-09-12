import { pool } from "./db.pool.js"

export const getAllVideosForUser = async (userId) => {
    const [ results, fields ] = await pool.execute('SELECT * FROM videos WHERE userId = ?;', [userId]);

    return results;
}

export const addVideoToDb = async (file, description, userId) => {
    const [ results, fields ] = await pool.execute('INSERT INTO `videos` (`id`, `name`, `description`, `ext`, `downloadDate`, `link`, `type`, `videoPath`, `userId`) VALUES (NULL, ?, ?, ?, NOW(), ?, ?, ?, ?);', [file.basename, description, file.extension, file.link, 0, file.path, userId]);

    return results;
}