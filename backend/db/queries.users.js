import { pool } from "./db.pool.js"

export const checkForUserByEmail = async (email) => {
    const [ results ] = await pool.execute(
        'SELECT id, email, password FROM users WHERE LOWER(email) = ? LIMIT 1;',
        [email]
    );
    return results;
}

export const createNewUser = async (email, hashedPassword) => {
    const [ results ] = await pool.execute(
        'INSERT INTO users (email, password, lastLoginDate, resetPasswordToken, resetPasswordTokenExpiresAt) VALUES (?, ?, NULL, NULL, NULL)',
        [email, hashedPassword]
    );
    return results;
}

export const updateUserLastLoginDate = async (userId) => {
    const [ results ] = await pool.execute('UPDATE users SET lastLoginDate = NOW() WHERE id = ?;', [userId]);
    return results;
}

export const getPublicUser = async (userId) => {
    const [ results ] = await pool.execute(
        'SELECT id, email, lastLoginDate FROM users WHERE id = ?;',
        [userId]
    );
    return results[0] ?? null;
}

export const setPasswordReset = async (userId, tokenHash, expiresAt) => {
    await pool.execute(
        'UPDATE users SET resetPasswordToken = ?, resetPasswordTokenExpiresAt = ? WHERE id = ?;',
        [tokenHash, expiresAt, userId]
    );
}

export const findUserByResetTokenHash = async (tokenHash) => {
    const [ results ] = await pool.execute(
        'SELECT id, resetPasswordTokenExpiresAt AS expiresAt FROM users WHERE resetPasswordToken = ? LIMIT 1;',
        [tokenHash]
    );
    return results[0] ?? null;
}

export const updatePasswordAndClearReset = async (userId, passwordHash) => {
    await pool.execute(
        'UPDATE users SET password = ?, resetPasswordToken = NULL, resetPasswordTokenExpiresAt = NULL WHERE id = ?;',
        [passwordHash, userId]
    );
}
