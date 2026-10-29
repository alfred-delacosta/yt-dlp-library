import { getStatsForUser } from "../db/queries.stats.js";

export const getStats = async (req, res) => {
    try {
        const stats = await getStatsForUser(req.userId);
        return res.json(stats);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "There was an error loading stats." });
    }
};
