import { pool } from "./db.pool.js"

function monthKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
}

function lastTwelveMonths() {
    const months = [];
    const now = new Date();
    for (let i = 11; i >= 0; i -= 1) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push(monthKey(date));
    }
    return months;
}

function mergeOptionCounts(rows) {
    const map = new Map();
    for (const row of rows) {
        const option = row.option || "unknown";
        map.set(option, (map.get(option) || 0) + Number(row.count || 0));
    }
    return [...map.entries()].map(([option, count]) => ({ option, count }));
}

export const getStatsForUser = async (userId) => {
    const [[videoCountRow]] = await pool.execute(
        "SELECT COUNT(*) AS count FROM videos WHERE userId = ?",
        [userId]
    );
    const [[mp3CountRow]] = await pool.execute(
        "SELECT COUNT(*) AS count FROM mp3s WHERE userId = ?",
        [userId]
    );

    const [lastVideos] = await pool.execute(
        `SELECT videos.id, videos.name, videos.downloadDate, thumbnails.thumbnailPath
         FROM videos
         LEFT JOIN thumbnails ON videos.id = thumbnails.videoId
         WHERE videos.userId = ?
         ORDER BY videos.downloadDate DESC, videos.id DESC
         LIMIT 1`,
        [userId]
    );
    const [lastMp3s] = await pool.execute(
        `SELECT id, name, downloadDate
         FROM mp3s
         WHERE userId = ?
         ORDER BY downloadDate DESC, id DESC
         LIMIT 1`,
        [userId]
    );

    const [downloadLogRows] = await pool.execute(
        `SELECT downloadOption AS \`option\`, COUNT(*) AS count
         FROM downloads
         WHERE userId = ?
         GROUP BY downloadOption`,
        [userId]
    );

    let downloadOptions = mergeOptionCounts(downloadLogRows);
    if (downloadOptions.length === 0) {
        const [videoOptions] = await pool.execute(
            `SELECT downloadOption AS \`option\`, COUNT(*) AS count
             FROM videos
             WHERE userId = ? AND downloadOption IS NOT NULL
             GROUP BY downloadOption`,
            [userId]
        );
        const [mp3Options] = await pool.execute(
            `SELECT downloadOption AS \`option\`, COUNT(*) AS count
             FROM mp3s
             WHERE userId = ? AND downloadOption IS NOT NULL
             GROUP BY downloadOption`,
            [userId]
        );
        downloadOptions = mergeOptionCounts([...videoOptions, ...mp3Options]);
    }

    const months = lastTwelveMonths();
    const [downloadMonthRows] = await pool.execute(
        `SELECT DATE_FORMAT(downloadedAt, '%Y-%m') AS month, mediaType, COUNT(*) AS count
         FROM downloads
         WHERE userId = ? AND downloadedAt >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
         GROUP BY month, mediaType`,
        [userId]
    );

    let monthRows = downloadMonthRows;
    if (monthRows.length === 0) {
        const [videoMonths] = await pool.execute(
            `SELECT DATE_FORMAT(downloadDate, '%Y-%m') AS month, 'video' AS mediaType, COUNT(*) AS count
             FROM videos
             WHERE userId = ? AND downloadDate >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
             GROUP BY month`,
            [userId]
        );
        const [mp3Months] = await pool.execute(
            `SELECT DATE_FORMAT(downloadDate, '%Y-%m') AS month, 'mp3' AS mediaType, COUNT(*) AS count
             FROM mp3s
             WHERE userId = ? AND downloadDate >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
             GROUP BY month`,
            [userId]
        );
        monthRows = [...videoMonths, ...mp3Months];
    }

    const byMonth = Object.fromEntries(
        months.map((month) => [month, { month, videos: 0, mp3s: 0 }])
    );
    for (const row of monthRows) {
        const bucket = byMonth[row.month];
        if (!bucket) continue;
        const count = Number(row.count) || 0;
        if (row.mediaType === "mp3") bucket.mp3s += count;
        else bucket.videos += count;
    }

    const [tagUsage] = await pool.execute(
        `SELECT tagged.id, tagged.name, tagged.count
         FROM (
            SELECT tags.id, tags.name,
                   (SELECT COUNT(*) FROM video_tags WHERE video_tags.tagId = tags.id) +
                   (SELECT COUNT(*) FROM mp3_tags WHERE mp3_tags.tagId = tags.id) AS count
            FROM tags
            WHERE tags.userId = ?
         ) tagged
         WHERE tagged.count > 0
         ORDER BY tagged.count DESC, tagged.name ASC
         LIMIT 12`,
        [userId]
    );

    const [[subtitleRow]] = await pool.execute(
        `SELECT
            SUM(CASE WHEN (subtitles IS NOT NULL AND subtitles <> '') OR (subtitlesFile IS NOT NULL AND subtitlesFile <> '') THEN 1 ELSE 0 END) AS withSubtitles,
            SUM(CASE WHEN (subtitles IS NULL OR subtitles = '') AND (subtitlesFile IS NULL OR subtitlesFile = '') THEN 1 ELSE 0 END) AS withoutSubtitles
         FROM videos
         WHERE userId = ?`,
        [userId]
    );

    const lastVideo = lastVideos[0]
        ? {
            id: Number(lastVideos[0].id),
            name: lastVideos[0].name,
            downloadDate: lastVideos[0].downloadDate,
            thumbnailPath: lastVideos[0].thumbnailPath || null,
        }
        : null;
    const lastMp3 = lastMp3s[0]
        ? {
            id: Number(lastMp3s[0].id),
            name: lastMp3s[0].name,
            downloadDate: lastMp3s[0].downloadDate,
        }
        : null;

    return {
        videoCount: Number(videoCountRow.count) || 0,
        mp3Count: Number(mp3CountRow.count) || 0,
        lastVideo,
        lastMp3,
        downloadOptions,
        downloadsByMonth: months.map((month) => byMonth[month]),
        tagUsage: tagUsage.map((row) => ({
            id: Number(row.id),
            name: row.name,
            count: Number(row.count) || 0,
        })),
        subtitleCoverage: {
            with: Number(subtitleRow?.withSubtitles) || 0,
            without: Number(subtitleRow?.withoutSubtitles) || 0,
        },
    };
};
