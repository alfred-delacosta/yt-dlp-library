import express from 'express';
import { checkAuth } from '../middleware/jwt.middleware.js';
import { getVideos } from '../controllers/videos.controller.js';

const router = express.Router();

router.get("/", checkAuth, getVideos)

export default router;