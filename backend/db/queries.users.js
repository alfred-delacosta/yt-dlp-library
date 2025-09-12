import { pool } from "./db.pool.js"

export const checkForUserByEmail = async (email) => {
    const [ results, fields ] = await pool.execute('SELECT * FROM USERS WHERE email = ?;', [email]);
    return results;
}

export const createNewUser = async (email, hashedPassword) => {
    const [ results, fields ] = await pool.execute('INSERT INTO users (email, password, lastLoginDate, resetPasswordToken, resetPasswordTokenExpiresAt) VALUES (?, ?, NULL, NULL, NULL)', [email, hashedPassword]);
    return results;
}

export const updateUserLastLoginDate = async (userId) => {
    const [ results, fields ] = await pool.execute('UPDATE users SET lastLoginDate = NOW() WHERE id = ?;', [userId]);
    return results;
}

export const getUser = async (userId) => {
    const [ results, fields ] = await pool.execute('SELECT * FROM users WHERE id = ?;', [userId]);
    return results;
}