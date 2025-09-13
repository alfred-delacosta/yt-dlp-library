import express from 'express';
import { checkAuth } from '../middleware/jwt.middleware.js';
import { getMp3ById, getMp3s } from '../controllers/mp3s.controller.js';


const router = express.Router();

router.get("/", checkAuth, getMp3s)
router.get("/:id", checkAuth, getMp3ById)


export default router;