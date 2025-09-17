import express from "express";
import { login, logOut, signUp, verifyEmail, forgotPassword, resetPassword, getNewAccessToken, isAuthorized, checkRefreshToken } from "../controllers/auth.controller.js";
import { checkAuth, verifyToken } from '../middleware/jwt.middleware.js';

const router = express.Router();

router.post("/signup", signUp);

router.post("/login", login);

router.post("/logout", logOut);

router.post("/verify-email", verifyEmail);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password/:token", resetPassword);

router.get("/getNewAccessToken", verifyToken, getNewAccessToken)

router.get("/checkAuth", checkAuth, isAuthorized);

router.get("/checkRefreshToken", verifyToken, checkRefreshToken);

export default router;