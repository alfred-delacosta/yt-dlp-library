import express from "express";
import { exec } from 'child_process';
import { promisify } from 'util';
import { initialize } from "../controllers/initialize.controller.js";

const router = express.Router();

router.get("/", initialize);


export default router;