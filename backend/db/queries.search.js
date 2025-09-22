import { pool } from "./db.pool.js"

export const sqlSearchVideos = async (searchTerm, userId) => {
    const [ results, fields ] = await pool.execute(`SELECT videos.*, thumbnails.id as thumbnailId, thumbnails.videoId, thumbnails.thumbnailPath FROM videos left join thumbnails on videos.id = thumbnails.videoId WHERE videos.name LIKE CONCAT('%', ?, '%') OR videos.description LIKE CONCAT('%', ?, '%') AND userId = ?;`, [searchTerm, searchTerm, userId]);

    return results;
}

export const sqlSearchMp3s = async (searchTerm, userId) => {
    const [ results, fields ] = await pool.execute(`SELECT * FROM mp3s WHERE name LIKE CONCAT('%', ?, '%') OR description LIKE CONCAT('%', ?, '%') AND userId = ?;`, [searchTerm, searchTerm, userId]);

    return results;
}