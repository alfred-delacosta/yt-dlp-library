import express from "express";
import { checkAuth } from "../middleware/jwt.middleware.js";
import { createTag, deleteTag, listTags, renameTag } from "../controllers/tags.controller.js";

const router = express.Router();

router.get("/", checkAuth, listTags);
router.post("/", checkAuth, createTag);
router.patch("/:id", checkAuth, renameTag);
router.delete("/:id", checkAuth, deleteTag);

export default router;
