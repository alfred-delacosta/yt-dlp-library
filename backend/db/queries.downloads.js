import { pool } from "./db.pool.js"

export const sqlAddDownload = async ({ userId, downloadOption, mediaType, mediaId }) => {
    const [results] = await pool.execute(
        `INSERT INTO downloads (userId, downloadOption, mediaType, mediaId, downloadedAt)
         VALUES (?, ?, ?, ?, NOW())`,
        [userId, downloadOption, mediaType, mediaId ?? null]
    );
    return results;
};
