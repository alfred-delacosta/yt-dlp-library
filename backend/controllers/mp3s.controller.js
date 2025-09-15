import { getAllMp3sForUser, getMp3, getMp3CountForUser } from "../db/queries.mp3s.js"

export const getMp3s = async (req, res) => {
    try {
        const mp3s = await getAllMp3sForUser(req.userId);

        res.json(mp3s);
    } catch (error) {
        console.error(error);
        res.send(400).json({ message: 'There was an error getting the videos for the user.' })
    }
}

export const getMp3ById = async (req, res) => {
    try {
        const mp3Id = req.params.id;
        const mp3 = await getMp3(req.userId, mp3Id);

        res.json(mp3);
    } catch (error) {
        console.error(error);
        res.send(400).json({ message: 'There was an error getting the videos for the user.' })
    }
}

export const getUserMp3Count = async (req, res) => {
    try {
        const count = await getMp3CountForUser(req.userId);

        return res.json(count);
    } catch (error) {
        console.error(error);
        return res.send(400).json({ message: 'There was an error getting the videos for the user.' })
    }
}