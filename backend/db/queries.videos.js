import { pool } from "./db.pool.js"

export const getAllVideosForUser = async (userId) => {
    const [ results, fields ] = await pool.execute('SELECT videos.*, thumbnails.id as thumbnailId, thumbnails.videoId, thumbnails.thumbnailPath FROM videos left join thumbnails on videos.id = thumbnails.videoId WHERE videos.userId = ?;', [userId]);
    return results;
}

export const getVideoCountForUser = async (userId) => {
    const [ results, fields ] = await pool.execute('SELECT COUNT(*) FROM videos where userId = ?;', [userId]);
    return results;
}

export const sqlGetVideo = async (userId, videoId) => {
    const [ results, fields ] = await pool.execute('SELECT videos.*, thumbnails.id as thumbnailId, thumbnails.videoId, thumbnails.thumbnailPath FROM videos left join thumbnails on videos.id = thumbnails.videoId WHERE videos.userId = ? AND videos.id = ?;', [userId, videoId]);
    return results;
}

export const sqlAddVideo = async (file, description="No description", userId) => {
    const [ results, fields ] = await pool.execute('INSERT INTO `videos` (`id`, `name`, `description`, `ext`, `downloadDate`, `link`, `type`, `videoPath`, `userId`, `serverPath`) VALUES (NULL, ?, ?, ?, NOW(), ?, ?, ?, ?, ?);', [file.basename, description, file.extension, file.link, 0, file.path, userId, file.serverPath]);

    return results;
}

export const sqlUpdateVideo = async (video) => {
    const [ results, fields ] = await pool.execute(`UPDATE videos SET name = ?, description = ?, ext = ?, link = ?, type = ?, videoPath = ?, userId = ?, serverPath = ? WHERE id = ?;`, [video.name, video.description, video.ext, video.link, video.type, video.videoPath, video.userId, video.serverPath, video.id]);

    return results;
}

export const sqlUpdateVideoPaths = async (videoPath, serverPath, videoId) => {
    const [ results, fields ] = await pool.execute(`UPDATE videos SET videoPath = ?, serverPath = ?, userId = 1 WHERE id = ?;`, [videoPath, serverPath, videoId]);

    return results;
}

export const sqlDeleteVideo = async (userId, videoId) => {
    const [ results, fields ] = await pool.execute('DELETE FROM videos WHERE userId = ? AND id = ?;', [userId, videoId]);
    return results;
}