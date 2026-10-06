import express from "express";
import {
  login,
  logOut,
  signUp,
  verifyEmail,
  forgotPassword,
  resetPassword,
  refreshSession,
  isAuthorized,
  listSessions,
  logoutOthers,
} from "../controllers/auth.controller.js";
import { checkAuth } from "../middleware/jwt.middleware.js";
import { rateLimit } from "../middleware/rateLimit.js";

const router = express.Router();

const loginLimit = rateLimit({ name: "login", windowMs: 15 * 60 * 1000, max: 10 });
const signupLimit = rateLimit({ name: "signup", windowMs: 60 * 60 * 1000, max: 5 });
const refreshLimit = rateLimit({ name: "refresh", windowMs: 15 * 60 * 1000, max: 60 });
const forgotLimit = rateLimit({ name: "forgot-password", windowMs: 60 * 60 * 1000, max: 5 });
const resetLimit = rateLimit({ name: "reset-password", windowMs: 60 * 60 * 1000, max: 10 });

router.post("/signup", signupLimit, signUp);
router.post("/login", loginLimit, login);
router.post("/logout", logOut);
router.post("/verify-email", verifyEmail);
router.post("/forgot-password", forgotLimit, forgotPassword);
router.post("/reset-password/:token", resetLimit, resetPassword);
router.post("/refresh", refreshLimit, refreshSession);
router.get("/checkAuth", checkAuth, isAuthorized);
router.get("/sessions", checkAuth, listSessions);
router.post("/logout-others", checkAuth, logoutOthers);

export default router;
