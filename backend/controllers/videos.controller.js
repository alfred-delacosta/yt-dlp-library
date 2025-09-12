import { getAllVideosForUser, getVideo } from "../db/queries.videos.js"

export const getVideos = async (req, res) => {
    try {
        const videos = await getAllVideosForUser(req.userId);

        res.json(videos);
    } catch (error) {
        console.error(error);
        res.send(400).json({ message: 'There was an error getting the videos for the user.' })
    }
}

export const getVideoById = async (req, res) => {
    try {
        const videoId = req.params.id;
        const video = await getVideo(req.userId, videoId);

        res.json(video);
    } catch (error) {
        console.error(error);
        res.send(400).json({ message: 'There was an error getting the videos for the user.' })
    }
}