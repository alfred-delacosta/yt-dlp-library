import express from 'express';
import { checkAuth } from '../middleware/jwt.middleware.js';
import { getVideos, getVideoById } from '../controllers/videos.controller.js';

const router = express.Router();

router.get("/", checkAuth, getVideos)
router.get("/:id", checkAuth, getVideoById)


export default router;