import express from "express";
import { checkAuth } from "../middleware/jwt.middleware.js";
import { checkForAppInitialization, checkForUsersTable, checkLegacyAppUpdated, checkLegacyAppUser, createMaintenanceTableEntry, initializeDb, initializeFolders, initializeMaintenanceTable, initializeMp3sTable, initializeThumbnailsTable, initializeUsersTable, initializeVideosTable, setLegacyAppUpdated, setLegacyAppUser, updateLegacyTables, updateMp3Paths, updateThumbnailPaths, updateVideoPaths, updateSubtitlesColumn, checkLegacyUpdateEnabled, backupDatabase } from "../controllers/initialize.controller.js";

const router = express.Router();

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