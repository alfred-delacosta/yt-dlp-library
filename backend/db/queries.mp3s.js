import { pool } from "./db.pool.js"

export const addMp3ToDb = async (file, description="") => {
    console.log(file);
    const [ results, fields ] = await pool.execute('INSERT INTO `mp3s` (`id`, `name`, `description`, `downloadDate`, `link`, `mp3Path`) VALUES (NULL, ?, ?, NOW(), ?, ?);', [file.basename, description, file.link, file.path]);

    return results;
}