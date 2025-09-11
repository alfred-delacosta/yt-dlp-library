import express from "express";
import { updateYtDlp, downloadRegular } from "../controllers/yt-dlp.controller.js";

const router = express.Router();

router.get("/update", updateYtDlp);
router.post("/download/regular", downloadRegular);

export default router;