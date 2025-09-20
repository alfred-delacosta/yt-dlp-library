import { pool } from "./db.pool.js"

export const getAllMp3s = async () => {
    const [ results, fields ] = await pool.execute('SELECT * FROM mp3s;');
    return results;
}

export const getAllMp3sForUser = async (userId) => {
    const [ results, fields ] = await pool.execute('SELECT * FROM mp3s WHERE userId = ?;', [userId]);
    return results;
}

export const getMp3CountForUser = async (userId) => {
    const [ results, fields ] = await pool.execute('SELECT COUNT(*) FROM mp3s where userId = ?;', [userId]);
    return results;
}

export const getMp3 = async (userId, mp3Id) => {
    const [ results, fields ] = await pool.execute('SELECT * FROM mp3s WHERE userId = ? AND id = ?;', [userId, mp3Id]);
    return results;
}

export const sqlUpdateMp3Paths = async (mp3Path, serverPath, mp3Id) => {
    const [ results, fields ] = await pool.execute(`UPDATE mp3s SET mp3Path = ?, serverPath = ?, userId = 1 WHERE id = ?;`, [mp3Path, serverPath, mp3Id]);

    return results;
}


export const sqlDeleteMp3 = async (userId, mp3Id) => {
    const [ results, fields ] = await pool.execute('DELETE FROM mp3s WHERE userId = ? AND id = ?;', [userId, mp3Id]);
    return results;
}

export const addMp3ToDb = async (file, description="", userId) => {
    const [ results, fields ] = await pool.execute('INSERT INTO `mp3s` (`id`, `name`, `description`, `downloadDate`, `link`, `mp3Path`, `userId`, `serverPath`) VALUES (NULL, ?, ?, NOW(), ?, ?, ?, ?);', [file.basename, description, file.link, file.path, userId, file.serverPath]);

    return results;
}