import express from "express";
import { checkAuth } from "../middleware/jwt.middleware.js";
import { requireAuthWhenInitialized } from "../middleware/initializedAuth.middleware.js";
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

const setup = requireAuthWhenInitialized;

router.get("/db", setup, initializeDb);
router.get("/maintenance", setup, initializeMaintenanceTable);
router.get("/users", setup, initializeUsersTable);
router.get("/videos", setup, initializeVideosTable);
router.get("/thumbnails", setup, initializeThumbnailsTable);
router.get("/mp3s", setup, initializeMp3sTable);
router.get("/folders", setup, initializeFolders);
router.get("/checkForUsersTable", setup, checkForUsersTable);
router.post("/maintenance", setup, createMaintenanceTableEntry);
router.get("/checkInitialization", checkForAppInitialization);

router.get("/updateLegacyTables", checkAuth, updateLegacyTables);
router.get("/updateSubtitlesColumn", checkAuth, updateSubtitlesColumn);
router.get("/updateVideosTable", checkAuth, updateVideoPaths);
router.get("/checkLegacyUpdateEnabled", checkAuth, checkLegacyUpdateEnabled);
router.get("/backupDatabase", checkAuth, backupDatabase);
router.post("/restoreDatabase", checkAuth, upload.single("backup"), restoreDatabase);
router.get("/updateMp3sTable", checkAuth, updateMp3Paths);
router.get("/updateThumbnailsTable", checkAuth, updateThumbnailPaths);
router.get("/checkLegacyAppUser", checkAuth, checkLegacyAppUser);
router.get("/checkLegacyAppUpdated", checkAuth, checkLegacyAppUpdated);
router.post("/setLegacyAppUser", checkAuth, setLegacyAppUser);
router.post("/setLegacyAppUpdated", checkAuth, setLegacyAppUpdated);

export default router;