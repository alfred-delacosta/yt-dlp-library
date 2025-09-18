import { getAllMp3sForUser, getMp3, getMp3CountForUser, sqlDeleteMp3 } from "../db/queries.mp3s.js"
import { sqlSearchMp3s } from "../db/queries.search.js";

export const getMp3s = async (req, res) => {
    try {
        const mp3s = await getAllMp3sForUser(req.userId);

        res.json(mp3s.reverse());
    } catch (error) {
        console.error(error);
        res.send(400).json({ message: 'There was an error getting the mp3s for the user.' })
    }
}

export const getMp3ById = async (req, res) => {
    try {
        const mp3Id = req.params.id;
        const mp3 = await getMp3(req.userId, mp3Id);

        res.json(mp3);
    } catch (error) {
        console.error(error);
        res.send(400).json({ message: 'There was an error getting the mp3 for the user.' })
    }
}

export const getUserMp3Count = async (req, res) => {
    try {
        const count = await getMp3CountForUser(req.userId);

        return res.json(count);
    } catch (error) {
        console.error(error);
        return res.send(400).json({ message: 'There was an error getting the mp3s for the user.' })
    }
}

export const deleteMp3ByIdAndUserId = async (req, res) => {
    const mp3Id = req.params.id;

    try {
        const deleteResults = await sqlDeleteMp3(req.userId, mp3Id);
        res.json(deleteResults);
    } catch (error) {
        console.error(error);
        res.send(400).json({ message: 'There was an error getting the deleting the mp3 for the user.' })
    }
}

export const searchMp3s = async (req, res) => {
    try {
        const { searchTerm } = req.body;
        const count = await sqlSearchMp3s(searchTerm, req.userId);
        res.json(count);
    } catch (error) {
        console.error(error);
        res.send(400).json({ message: 'There was an error searching for the mp3.' })
    }
}