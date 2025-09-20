import express from "express";
import { checkForAppInitialization, checkForUsersTable, checkLegacyAppUpdated, checkLegacyAppUser, createMaintenanceTableEntry, initializeDb, initializeFolders, initializeMaintenanceTable, initializeMp3sTable, initializeThumbnailsTable, initializeUsersTable, initializeVideosTable, setLegacyAppUpdated, setLegacyAppUser, updateLegacyTables, updateVideoPaths } from "../controllers/initialize.controller.js";

const router = express.Router();

router.get("/db", initializeDb);
router.get("/maintenance", initializeMaintenanceTable);
router.get("/users", initializeUsersTable);
router.get("/videos", initializeVideosTable);
router.get("/thumbnails", initializeThumbnailsTable);
router.get("/mp3s", initializeMp3sTable);
router.get("/folders", initializeFolders);
router.get("/updateLegacyTables", updateLegacyTables);
router.get("/updateVideosTable", updateVideoPaths);
router.get("/checkForUsersTable", checkForUsersTable);
router.get("/checkInitialization", checkForAppInitialization);
router.get("/checkLegacyAppUser", checkLegacyAppUser);
router.get("/checkLegacyAppUpdated", checkLegacyAppUpdated);

router.post("/maintenance", createMaintenanceTableEntry);
router.post("/setLegacyAppUser", setLegacyAppUser);
router.post("/setLegacyAppUpdated", setLegacyAppUpdated);

export default router;