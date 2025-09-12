import { pool } from "./db.pool.js"

export const getAllMp3sForUser = async (userId) => {
    const [ results, fields ] = await pool.execute('SELECT * FROM mp3s WHERE userId = ?;', [userId]);
    return results;
}

export const getMp3 = async (userId, mp3Id) => {
    const [ results, fields ] = await pool.execute('SELECT * FROM mp3s WHERE userId = ? AND id = ?;', [userId, mp3Id]);
    return results;
}

export const addMp3ToDb = async (file, description="", userId) => {
    console.log(file);
    const [ results, fields ] = await pool.execute('INSERT INTO `mp3s` (`id`, `name`, `description`, `downloadDate`, `link`, `mp3Path`, `userId`) VALUES (NULL, ?, ?, NOW(), ?, ?, ?);', [file.basename, description, file.link, file.path, userId]);

    return results;
}