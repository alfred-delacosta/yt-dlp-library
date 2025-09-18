import express from 'express';
import { checkAuth } from '../middleware/jwt.middleware.js';
import { deleteMp3ByIdAndUserId, getMp3ById, getMp3s, getUserMp3Count, searchMp3s } from '../controllers/mp3s.controller.js';


const router = express.Router();

router.get("/", checkAuth, getMp3s)
router.get("/count", checkAuth, getUserMp3Count);
router.get("/:id", checkAuth, getMp3ById)
router.delete("/:id", checkAuth, deleteMp3ByIdAndUserId);
router.post("/search", checkAuth, searchMp3s);


export default router;