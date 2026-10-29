import { pool } from "./db.pool.js"

export const sqlSearchVideos = async (searchTerm, userId) => {
    const [results] = await pool.execute(
        `SELECT videos.*, thumbnails.id as thumbnailId, thumbnails.videoId, thumbnails.thumbnailPath
         FROM videos
         LEFT JOIN thumbnails ON videos.id = thumbnails.videoId
         WHERE videos.userId = ?
           AND (
             videos.name LIKE CONCAT('%', ?, '%')
             OR videos.description LIKE CONCAT('%', ?, '%')
             OR videos.subtitles LIKE CONCAT('%', ?, '%')
             OR EXISTS (
               SELECT 1
               FROM video_tags
               INNER JOIN tags ON tags.id = video_tags.tagId
               WHERE video_tags.videoId = videos.id
                 AND tags.userId = videos.userId
                 AND tags.name LIKE CONCAT('%', ?, '%')
             )
           )`,
        [userId, searchTerm, searchTerm, searchTerm, searchTerm]
    );
    return results;
}

export const sqlSearchMp3s = async (searchTerm, userId) => {
    const [results] = await pool.execute(
        `SELECT mp3s.*
         FROM mp3s
         WHERE mp3s.userId = ?
           AND (
             mp3s.name LIKE CONCAT('%', ?, '%')
             OR mp3s.description LIKE CONCAT('%', ?, '%')
             OR EXISTS (
               SELECT 1
               FROM mp3_tags
               INNER JOIN tags ON tags.id = mp3_tags.tagId
               WHERE mp3_tags.mp3Id = mp3s.id
                 AND tags.userId = mp3s.userId
                 AND tags.name LIKE CONCAT('%', ?, '%')
             )
           )`,
        [userId, searchTerm, searchTerm, searchTerm]
    );
    return results;
}
