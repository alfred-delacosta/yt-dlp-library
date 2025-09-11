import express from "express";
import { exec } from 'child_process';
import { promisify } from 'util';
import { initializeDb, initializeFolders } from "../controllers/initialize.controller.js";

const router = express.Router();

router.get("/db", initializeDb);
router.get("/folders", initializeFolders);


export default router;