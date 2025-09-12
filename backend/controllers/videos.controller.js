import { getAllVideosForUser } from "../db/queries.videos.js"

export const getVideos = async (req, res) => {
    try {
        const videos = await getAllVideosForUser(req.userId);

        res.json(videos);
    } catch (error) {
        console.error(error);
        res.send(400).json({ message: 'There was an error getting the videos for the user.' })
    }
}