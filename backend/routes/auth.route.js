import express from "express";
import { login, logOut, signUp, verifyEmail, forgotPassword, resetPassword, getNewAccessToken } from "../controllers/auth.controller.js";
import { verifyToken } from '../middleware/jwt.middleware.js';

const router = express.Router();

router.post("/signup", signUp);

router.post("/login", login);

router.post("/logout", logOut);

router.post("/verify-email", verifyEmail);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password/:token", resetPassword);

router.get("/getNewAccessToken", verifyToken, getNewAccessToken)

export default router;