import express from "express";
import { checkAuth } from "../middleware/jwt.middleware.js";
import multer from "multer";
import fs from "fs";
import path from "path";
import os from "os";
import { checkForAppInitialization, checkForUsersTable, checkLegacyAppUpdated, checkLegacyAppUser, createMaintenanceTableEntry, initializeDb, initializeFolders, initializeMaintenanceTable, initializeMp3sTable, initializeThumbnailsTable, initializeUsersTable, initializeVideosTable, setLegacyAppUpdated, setLegacyAppUser, updateLegacyTables, updateMp3Paths, updateThumbnailPaths, updateVideoPaths, updateSubtitlesColumn, checkLegacyUpdateEnabled, backupDatabase, restoreDatabase } from "../controllers/initialize.controller.js";

const router = express.Router();

const uploadDir = path.join(os.tmpdir(), "yt-dlp-db-uploads");
fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + (path.extname(file.originalname) || ".sql"));
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 500 },
  fileFilter: (req, file, cb) => {
    if (file.originalname.endsWith(".sql") || file.mimetype === "application/sql" || file.mimetype === "text/plain") {
      cb(null, true);
    } else {
      cb(new Error("Only SQL backup files are allowed"));
    }
  }
});

router.get("/db", initializeDb);
router.get("/maintenance", initializeMaintenanceTable);
router.get("/users", initializeUsersTable);
router.get("/videos", initializeVideosTable);
router.get("/thumbnails", initializeThumbnailsTable);
router.get("/mp3s", initializeMp3sTable);
router.get("/folders", initializeFolders);
router.get("/updateLegacyTables", updateLegacyTables);
router.get("/updateSubtitlesColumn", updateSubtitlesColumn);
router.get("/updateVideosTable", updateVideoPaths);
router.get("/checkLegacyUpdateEnabled", checkLegacyUpdateEnabled);
router.get("/backupDatabase", checkAuth, backupDatabase);
router.post("/restoreDatabase", checkAuth, upload.single("backup"), restoreDatabase);
router.get("/updateMp3sTable", updateMp3Paths);
router.get("/updateThumbnailsTable", updateThumbnailPaths);
router.get("/checkForUsersTable", checkForUsersTable);
router.get("/checkInitialization", checkForAppInitialization);
router.get("/checkLegacyAppUser", checkLegacyAppUser);
router.get("/checkLegacyAppUpdated", checkLegacyAppUpdated);

router.post("/maintenance", createMaintenanceTableEntry);
router.post("/setLegacyAppUser", setLegacyAppUser);
router.post("/setLegacyAppUpdated", setLegacyAppUpdated);

export default router;