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

export const sqlListVideosForDuplicateScan = async (userId) => {
    const [results] = await pool.execute(
        `SELECT videos.id, videos.name, videos.link, videos.ext, videos.downloadDate, videos.videoPath, videos.serverPath,
                thumbnails.id AS thumbnailId, thumbnails.thumbnailPath
         FROM videos
         LEFT JOIN thumbnails ON videos.id = thumbnails.videoId
         WHERE videos.userId = ?`,
        [userId]
    );
    return results;
}

export const sqlDeleteVideoRowsOnly = async (userId, ids) => {
    const connection = await pool.getConnection();
    const placeholders = ids.map(() => "?").join(", ");
    try {
        await connection.beginTransaction();
        const [owned] = await connection.execute(
            `SELECT id FROM videos WHERE userId = ? AND id IN (${placeholders})`,
            [userId, ...ids]
        );
        if (owned.length !== ids.length) {
            await connection.rollback();
            return false;
        }
        await connection.execute(
            `DELETE FROM thumbnails WHERE videoId IN (${placeholders})`,
            ids
        );
        const [deleted] = await connection.execute(
            `DELETE FROM videos WHERE userId = ? AND id IN (${placeholders})`,
            [userId, ...ids]
        );
        if (deleted.affectedRows !== ids.length) {
            await connection.rollback();
            return false;
        }
        await connection.commit();
        return true;
    } catch (error) {
        try {
            await connection.rollback();
        } catch (rollbackError) {
            console.error(rollbackError);
        }
        throw error;
    } finally {
        connection.release();
    }
}

export const sqlDeleteVideo = async (userId, videoId) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        await connection.execute("DELETE FROM thumbnails WHERE videoId = ?;", [videoId]);
        const [results] = await connection.execute(
            "DELETE FROM videos WHERE userId = ? AND id = ?;",
            [userId, videoId]
        );
        if (results.affectedRows !== 1) {
            await connection.rollback();
            return false;
        }
        await connection.commit();
        return true;
    } catch (error) {
        try {
            await connection.rollback();
        } catch (rollbackError) {
            console.error(rollbackError);
        }
        throw error;
    } finally {
        connection.release();
    }
}

export const sqlCheckVideoByLink = async (userId, videoId) => {
    const [ results, fields ] = await pool.execute(
        'SELECT * from videos where userId = ? AND link like ?;', 
        [userId, videoLink]
    );
    return results;
}

export const sqlAddSubtitlesToVideo = async (videoId, subtitles) => {
    const [ results, fields ] = await pool.execute(`UPDATE videos SET subtitles = ? WHERE id = ?;`, [subtitles, videoId]);

    return results;
}

export const sqlAddSubtitlesFileToVideo= async (videoId, subtitlesFilePath) => {
    const [ results, fields ] = await pool.execute(`UPDATE videos SET subtitlesFile = ? WHERE id = ?;`, [subtitlesFilePath, videoId]);

    return results;
}