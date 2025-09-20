import express from "express";
import { exec } from 'child_process';
import { promisify } from 'util';
import { checkForUsersTable, initializeDb, initializeFolders, updateLegacyTables, updateVideoPaths } from "../controllers/initialize.controller.js";

const router = express.Router();

router.get("/db", initializeDb);
router.get("/folders", initializeFolders);
router.get("/updateLegacyTables", updateLegacyTables);
router.get("/updateVideosTable", updateVideoPaths);
router.get("/checkForUsersTable", checkForUsersTable);


export default router;