import express from 'express';
import { checkAuth } from '../middleware/jwt.middleware.js';
import { getVideos, getVideoById, getUserVideoCount } from '../controllers/videos.controller.js';

const router = express.Router();

router.get("/", checkAuth, getVideos)
router.get("/count", checkAuth, getUserVideoCount);
router.get("/:id", checkAuth, getVideoById)


export default router;