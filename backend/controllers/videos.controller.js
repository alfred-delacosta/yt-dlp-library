import { sqlDeleteVideo, getAllVideosForUser, sqlGetVideo, getVideoCountForUser } from "../db/queries.videos.js"
import { sqlSearchVideos } from "../db/queries.search.js";

export const getVideos = async (req, res) => {
    try {
        const videos = await getAllVideosForUser(req.userId);
        console.log(videos);

        res.json(videos.reverse());
    } catch (error) {
        console.error(error);
        res.send(400).json({ message: 'There was an error getting the videos for the user.' })
    }
}

export const getVideoById = async (req, res) => {
    try {
        const videoId = req.params.id;
        const video = await sqlGetVideo(req.userId, videoId);

        res.json(video);
    } catch (error) {
        console.error(error);
        res.send(400).json({ message: 'There was an error getting the videos for the user.' })
    }
}

export const getUserVideoCount = async (req, res) => {
    try {
        const count = await getVideoCountForUser(req.userId);
        res.json(count);
    } catch (error) {
        console.error(error);
        res.send(400).json({ message: 'There was an error getting the videos for the user.' })
    }
}

export const deleteVideoByIdAndUserId = async (req, res) => {
    const videoId = req.params.id;

    try {
        const deleteResults = await sqlDeleteVideo(req.userId, videoId);
        res.json(deleteResults);
    } catch (error) {
        console.error(error);
        res.send(400).json({ message: 'There was an error getting the deleting the video for the user.' })
    }
}

export const searchVideos = async (req, res) => {
    try {
        const { searchTerm } = req.body;
        const count = await sqlSearchVideos(searchTerm, req.userId);
        res.json(count);
    } catch (error) {
        console.error(error);
        res.send(400).json({ message: 'There was an error searching for the video.' })
    }
}