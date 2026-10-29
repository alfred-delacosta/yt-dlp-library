import { pool } from "./db.pool.js"

function groupById(rows, key) {
    const map = {};
    for (const row of rows) {
        const id = Number(row[key]);
        if (!map[id]) map[id] = [];
        map[id].push({ id: Number(row.id), name: row.name });
    }
    return map;
}

export const sqlListTagsForUser = async (userId) => {
    const [results] = await pool.execute(
        `SELECT tags.id, tags.name, tags.createdAt,
                (SELECT COUNT(*) FROM video_tags WHERE video_tags.tagId = tags.id) AS videoCount,
                (SELECT COUNT(*) FROM mp3_tags WHERE mp3_tags.tagId = tags.id) AS mp3Count
         FROM tags
         WHERE tags.userId = ?
         ORDER BY tags.name ASC`,
        [userId]
    );
    return results.map((row) => ({
        id: Number(row.id),
        name: row.name,
        createdAt: row.createdAt,
        videoCount: Number(row.videoCount) || 0,
        mp3Count: Number(row.mp3Count) || 0,
    }));
};

export const sqlCreateTag = async (userId, name) => {
    const [results] = await pool.execute(
        "INSERT INTO tags (userId, name) VALUES (?, ?)",
        [userId, name]
    );
    return { id: Number(results.insertId), name, videoCount: 0, mp3Count: 0 };
};

export const sqlRenameTag = async (userId, tagId, name) => {
    const [results] = await pool.execute(
        "UPDATE tags SET name = ? WHERE id = ? AND userId = ?",
        [name, tagId, userId]
    );
    return results.affectedRows === 1;
};

export const sqlDeleteTag = async (userId, tagId) => {
    const [results] = await pool.execute(
        "DELETE FROM tags WHERE id = ? AND userId = ?",
        [tagId, userId]
    );
    return results.affectedRows === 1;
};

export const sqlGetTagForUser = async (userId, tagId) => {
    const [results] = await pool.execute(
        `SELECT tags.id, tags.name, tags.createdAt,
                (SELECT COUNT(*) FROM video_tags WHERE video_tags.tagId = tags.id) AS videoCount,
                (SELECT COUNT(*) FROM mp3_tags WHERE mp3_tags.tagId = tags.id) AS mp3Count
         FROM tags
         WHERE tags.userId = ? AND tags.id = ?`,
        [userId, tagId]
    );
    const row = results[0];
    if (!row) return null;
    return {
        id: Number(row.id),
        name: row.name,
        createdAt: row.createdAt,
        videoCount: Number(row.videoCount) || 0,
        mp3Count: Number(row.mp3Count) || 0,
    };
};

export const getTagsForVideoIds = async (userId, videoIds) => {
    if (!videoIds.length) return {};
    const placeholders = videoIds.map(() => "?").join(", ");
    const [rows] = await pool.execute(
        `SELECT video_tags.videoId, tags.id, tags.name
         FROM video_tags
         INNER JOIN tags ON tags.id = video_tags.tagId
         WHERE tags.userId = ? AND video_tags.videoId IN (${placeholders})
         ORDER BY tags.name ASC`,
        [userId, ...videoIds]
    );
    return groupById(rows, "videoId");
};

export const getTagsForMp3Ids = async (userId, mp3Ids) => {
    if (!mp3Ids.length) return {};
    const placeholders = mp3Ids.map(() => "?").join(", ");
    const [rows] = await pool.execute(
        `SELECT mp3_tags.mp3Id, tags.id, tags.name
         FROM mp3_tags
         INNER JOIN tags ON tags.id = mp3_tags.tagId
         WHERE tags.userId = ? AND mp3_tags.mp3Id IN (${placeholders})
         ORDER BY tags.name ASC`,
        [userId, ...mp3Ids]
    );
    return groupById(rows, "mp3Id");
};

export const attachVideoTags = async (userId, videos) => {
    const list = Array.isArray(videos) ? videos : [];
    if (list.length === 0) return list;
    const map = await getTagsForVideoIds(userId, list.map((item) => item.id));
    return list.map((item) => ({ ...item, tags: map[Number(item.id)] || [] }));
};

export const attachMp3Tags = async (userId, mp3s) => {
    const list = Array.isArray(mp3s) ? mp3s : [];
    if (list.length === 0) return list;
    const map = await getTagsForMp3Ids(userId, list.map((item) => item.id));
    return list.map((item) => ({ ...item, tags: map[Number(item.id)] || [] }));
};

async function replaceMediaTags(connection, { userId, mediaId, tagIds, mediaTable, mediaIdColumn, joinTable, joinMediaColumn }) {
    const [owned] = await connection.execute(
        `SELECT id FROM ${mediaTable} WHERE id = ? AND userId = ?`,
        [mediaId, userId]
    );
    if (owned.length !== 1) {
        return { ok: false, status: 404, message: "Media not found." };
    }

    if (tagIds.length > 0) {
        const placeholders = tagIds.map(() => "?").join(", ");
        const [ownedTags] = await connection.execute(
            `SELECT id FROM tags WHERE userId = ? AND id IN (${placeholders})`,
            [userId, ...tagIds]
        );
        if (ownedTags.length !== tagIds.length) {
            return { ok: false, status: 400, message: "One or more tags are invalid." };
        }
    }

    await connection.execute(
        `DELETE FROM ${joinTable} WHERE ${joinMediaColumn} = ?`,
        [mediaId]
    );

    if (tagIds.length > 0) {
        const values = tagIds.map(() => "(?, ?)").join(", ");
        const params = tagIds.flatMap((tagId) => [mediaId, tagId]);
        await connection.execute(
            `INSERT INTO ${joinTable} (${joinMediaColumn}, tagId) VALUES ${values}`,
            params
        );
    }

    return { ok: true };
}

export const setTagsForVideo = async (userId, videoId, tagIds) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const result = await replaceMediaTags(connection, {
            userId,
            mediaId: videoId,
            tagIds,
            mediaTable: "videos",
            mediaIdColumn: "id",
            joinTable: "video_tags",
            joinMediaColumn: "videoId",
        });
        if (!result.ok) {
            await connection.rollback();
            return result;
        }
        await connection.commit();
        const tags = (await getTagsForVideoIds(userId, [videoId]))[videoId] || [];
        return { ok: true, tags };
    } catch (error) {
        try { await connection.rollback(); } catch { /* ignore */ }
        throw error;
    } finally {
        connection.release();
    }
};

export const setTagsForMp3 = async (userId, mp3Id, tagIds) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const result = await replaceMediaTags(connection, {
            userId,
            mediaId: mp3Id,
            tagIds,
            mediaTable: "mp3s",
            mediaIdColumn: "id",
            joinTable: "mp3_tags",
            joinMediaColumn: "mp3Id",
        });
        if (!result.ok) {
            await connection.rollback();
            return result;
        }
        await connection.commit();
        const tags = (await getTagsForMp3Ids(userId, [mp3Id]))[mp3Id] || [];
        return { ok: true, tags };
    } catch (error) {
        try { await connection.rollback(); } catch { /* ignore */ }
        throw error;
    } finally {
        connection.release();
    }
};
