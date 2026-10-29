import {
    setTagsForMp3,
    setTagsForVideo,
    sqlCreateTag,
    sqlDeleteTag,
    sqlGetTagForUser,
    sqlListTagsForUser,
    sqlRenameTag,
} from "../db/queries.tags.js";

const MAX_TAGS_PER_ITEM = 50;

export function normalizeTagName(value) {
    const name = String(value ?? "").trim().replace(/\s+/g, " ");
    if (!name || name.length > 80) return null;
    return name;
}

function parseId(value) {
    const id = Number(value);
    if (!Number.isInteger(id) || id < 1) return null;
    return id;
}

function parseTagIds(value) {
    if (!Array.isArray(value)) return null;
    if (value.length > MAX_TAGS_PER_ITEM) return null;
    const ids = [];
    const seen = new Set();
    for (const item of value) {
        const id = parseId(item);
        if (!id) return null;
        if (seen.has(id)) continue;
        seen.add(id);
        ids.push(id);
    }
    return ids;
}

export const listTags = async (req, res) => {
    try {
        const tags = await sqlListTagsForUser(req.userId);
        return res.json(tags);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "There was an error listing tags." });
    }
};

export const createTag = async (req, res) => {
    const name = normalizeTagName(req.body?.name);
    if (!name) {
        return res.status(400).json({ message: "Tag name is required." });
    }

    try {
        const tag = await sqlCreateTag(req.userId, name);
        return res.status(201).json(tag);
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ message: "A tag with that name already exists." });
        }
        console.error(error);
        return res.status(500).json({ message: "There was an error creating the tag." });
    }
};

export const renameTag = async (req, res) => {
    const tagId = parseId(req.params.id);
    const name = normalizeTagName(req.body?.name);
    if (!tagId) return res.status(400).json({ message: "Tag id is invalid." });
    if (!name) return res.status(400).json({ message: "Tag name is required." });

    try {
        const updated = await sqlRenameTag(req.userId, tagId, name);
        if (!updated) return res.status(404).json({ message: "Tag not found." });
        const tag = await sqlGetTagForUser(req.userId, tagId);
        return res.json(tag);
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ message: "A tag with that name already exists." });
        }
        console.error(error);
        return res.status(500).json({ message: "There was an error renaming the tag." });
    }
};

export const deleteTag = async (req, res) => {
    const tagId = parseId(req.params.id);
    if (!tagId) return res.status(400).json({ message: "Tag id is invalid." });

    try {
        const deleted = await sqlDeleteTag(req.userId, tagId);
        if (!deleted) return res.status(404).json({ message: "Tag not found." });
        return res.json({ message: "Tag deleted." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "There was an error deleting the tag." });
    }
};

export const setVideoTagsHandler = async (req, res) => {
    const videoId = parseId(req.params.id);
    const tagIds = parseTagIds(req.body?.tagIds);
    if (!videoId) return res.status(400).json({ message: "Video id is invalid." });
    if (!tagIds) return res.status(400).json({ message: "Tag ids are invalid." });

    try {
        const result = await setTagsForVideo(req.userId, videoId, tagIds);
        if (!result.ok) return res.status(result.status).json({ message: result.message });
        return res.json({ tags: result.tags });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "There was an error updating tags." });
    }
};

export const setMp3TagsHandler = async (req, res) => {
    const mp3Id = parseId(req.params.id);
    const tagIds = parseTagIds(req.body?.tagIds);
    if (!mp3Id) return res.status(400).json({ message: "MP3 id is invalid." });
    if (!tagIds) return res.status(400).json({ message: "Tag ids are invalid." });

    try {
        const result = await setTagsForMp3(req.userId, mp3Id, tagIds);
        if (!result.ok) return res.status(result.status).json({ message: result.message });
        return res.json({ tags: result.tags });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "There was an error updating tags." });
    }
};

