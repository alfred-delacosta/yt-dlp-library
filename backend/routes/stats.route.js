import express from "express";
import { checkAuth } from "../middleware/jwt.middleware.js";
import { getStats } from "../controllers/stats.controller.js";

const router = express.Router();

router.get("/", checkAuth, getStats);

export default router;
