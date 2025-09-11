import { pool } from "./db.pool.js"

export const addMp3ToDb = async (file, description="") => {
    const [ results, fields ] = await pool.execute('INSERT INTO `mp3s` (`id`, `name`, `description`, `downloadDate`, `link`, `mp3Path`) VALUES (NULL, ?, ?, ?, ?, ?);', [file.name, description, file.downloadDate, file.link, file.mp3Path]);

    return results;
}