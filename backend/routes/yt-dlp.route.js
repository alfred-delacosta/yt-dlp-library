import express from "express";
import { updateYtDlp, downloadRegular, downloadX, downloadMp3, downloadMp4 } from "../controllers/yt-dlp.controller.js";
import { checkAuth } from "../middleware/jwt.middleware.js";

const router = express.Router();

router.get("/update", updateYtDlp);
router.post("/download/regular", checkAuth, downloadRegular);
router.post("/download/x", checkAuth, downloadX);
router.post("/download/mp3", checkAuth, downloadMp3);
router.post("/download/mp4", checkAuth, downloadMp4);

export default router;