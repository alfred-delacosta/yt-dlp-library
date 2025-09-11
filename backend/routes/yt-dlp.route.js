import express from "express";
import { updateYtDlp, downloadRegular, downloadX, downloadMp3, downloadMp4 } from "../controllers/yt-dlp.controller.js";

const router = express.Router();

router.get("/update", updateYtDlp);
router.post("/download/regular", downloadRegular);
router.post("/download/x", downloadX);
router.post("/download/mp3", downloadMp3);
router.post("/download/mp4", downloadMp4);

export default router;