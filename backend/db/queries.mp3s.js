import { pool } from "./db.pool.js"

export const addMp3ToDb = async (file, description="", userId) => {
    console.log(file);
    const [ results, fields ] = await pool.execute('INSERT INTO `mp3s` (`id`, `name`, `description`, `downloadDate`, `link`, `mp3Path`, `userId`) VALUES (NULL, ?, ?, NOW(), ?, ?, ?);', [file.basename, description, file.link, file.path, userId]);

    return results;
}