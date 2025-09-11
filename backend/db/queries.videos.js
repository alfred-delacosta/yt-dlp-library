import { pool } from "./db.pool.js"

export const addVideoToDb = async (file, description) => {
    const [ results, fields ] = await pool.execute('INSERT INTO `videos` (`id`, `name`, `description`, `ext`, `downloadDate`, `link`, `type`, `videoPath`) VALUES (NULL, ?, ?, ?, NOW(), ?, ?, ?);', [file.basename, description, file.extension, file.link, 0, file.path]);

    return results;
}