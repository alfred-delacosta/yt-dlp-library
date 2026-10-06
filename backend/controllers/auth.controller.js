import crypto from "node:crypto";
import {
  applyMediaCookie,
  applyRefreshCookie,
  clearAuthCookies,
  hashOpaqueToken,
  refreshCookieName,
  signAccessToken,
  signMediaToken,
} from "../utils/authTokens.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import {
  checkForUserByEmail,
  createNewUser,
  findUserByResetTokenHash,
  getPublicUser,
  setPasswordReset,
  updatePasswordAndClearReset,
  updateUserLastLoginDate,
} from "../db/queries.users.js";
import {
  issueSession,
  listSessions as listUserSessions,
  revokeOtherSessions,
  revokeSession,
  revokeUserSessions,
  rotateSession,
} from "../service/sessions.js";
import { ensureAuthSchema } from "../db/refreshTokenStore.js";

const GENERIC_SIGNUP = "Unable to create an account.";
const GENERIC_LOGIN = "Invalid credentials";
const GENERIC_RESET = "If an account exists for that email, reset instructions have been recorded.";

function normalizeEmail(email) {
  if (typeof email !== "string") return "";
  return email.trim().toLowerCase();
}

function passwordError(password, { requiredLength }) {
  if (typeof password !== "string" || password.length < 1) {
    return requiredLength ? "Password must be at least 8 characters." : GENERIC_LOGIN;
  }
  if (password.length > 200) return requiredLength ? "Password is too long." : GENERIC_LOGIN;
  if (requiredLength && password.length < 8) return "Password must be at least 8 characters.";
  return null;
}

function emailError(email) {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email.";
  return null;
}

async function startSession(res, userId, userAgent) {
  const session = await issueSession(userId, userAgent);
  applyRefreshCookie(res, session.raw);
  applyMediaCookie(res, signMediaToken(userId, session.familyId));
  return signAccessToken(userId);
}

export const signUp = async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = req.body?.password;
    const invalidEmail = emailError(email);
    if (invalidEmail) return res.status(400).json({ message: invalidEmail });
    const invalidPassword = passwordError(password, { requiredLength: true });
    if (invalidPassword) return res.status(400).json({ message: invalidPassword });

    const existing = await checkForUserByEmail(email);
    if (existing.length > 0) return res.status(400).json({ message: GENERIC_SIGNUP });

    const hashedPassword = await hashPassword(password);
    const dbResults = await createNewUser(email, hashedPassword);
    const userId = Number(dbResults.insertId);
    const accessToken = await startSession(res, userId, req.get("user-agent"));
    const user = await getPublicUser(userId);
    return res.status(201).json({ message: "User created successfully!", accessToken, user });
  } catch (error) {
    console.error("Error in signup function: ", error);
    return res.status(400).json({ message: GENERIC_SIGNUP });
  }
};

export const login = async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = req.body?.password;
    if (!email || passwordError(password, { requiredLength: false })) {
      return res.status(400).json({ message: GENERIC_LOGIN });
    }

    const [user] = await checkForUserByEmail(email);
    const passwordOk = await verifyPassword(user?.password, password);
    if (!user || !passwordOk) return res.status(400).json({ message: GENERIC_LOGIN });

    await updateUserLastLoginDate(user.id);
    const accessToken = await startSession(res, user.id, req.get("user-agent"));
    const publicUser = await getPublicUser(user.id);
    return res.status(200).json({
      message: "Logged in successfully.",
      user: publicUser,
      accessToken,
    });
  } catch (error) {
    console.error("Error in login function: ", error);
    return res.status(400).json({ message: GENERIC_LOGIN });
  }
};

export const logOut = async (req, res) => {
  try {
    await revokeSession(req.cookies?.[refreshCookieName()]);
  } catch (error) {
    console.error("Error in logout function: ", error);
  }
  clearAuthCookies(res);
  return res.status(200).json({ message: "Logged out successfully." });
};

export const refreshSession = async (req, res) => {
  try {
    const result = await rotateSession(req.cookies?.[refreshCookieName()], req.get("user-agent"));
    if (!result.ok) {
      clearAuthCookies(res);
      const code = result.reason === "reused" ? "refresh_reused" : "refresh_failed";
      return res.status(401).json({ message: "Unauthorized", code });
    }

    const user = await getPublicUser(result.userId);
    if (!user) {
      clearAuthCookies(res);
      return res.status(401).json({ message: "Unauthorized", code: "refresh_failed" });
    }

    applyRefreshCookie(res, result.refreshToken);
    applyMediaCookie(res, signMediaToken(result.userId, result.familyId));
    return res.status(200).json({
      accessToken: signAccessToken(result.userId),
      user,
    });
  } catch (error) {
    console.error("Error refreshing session: ", error);
    return res.status(401).json({ message: "Unauthorized", code: "refresh_failed" });
  }
};

export const listSessions = async (req, res) => {
  try {
    const sessions = await listUserSessions(req.userId, req.cookies?.[refreshCookieName()]);
    return res.status(200).json({ sessions });
  } catch (error) {
    console.error("Error listing sessions: ", error);
    return res.status(400).json({ message: "Unable to list sessions." });
  }
};

export const logoutOthers = async (req, res) => {
  try {
    const result = await revokeOtherSessions(req.userId, req.cookies?.[refreshCookieName()]);
    if (!result.ok) return res.status(401).json({ message: "Unauthorized" });
    return res.status(200).json({ message: "Other sessions were signed out." });
  } catch (error) {
    console.error("Error signing out other sessions: ", error);
    return res.status(400).json({ message: "Unable to sign out other sessions." });
  }
};

export const verifyEmail = async (req, res) => {
  return res.status(501).json({ message: "Email verification is not available." });
};

export const forgotPassword = async (req, res) => {
  try {
    await ensureAuthSchema();
    const email = normalizeEmail(req.body?.email);
    if (!emailError(email)) {
      const [user] = await checkForUserByEmail(email);
      if (user) {
        const rawToken = crypto.randomBytes(32).toString("base64url");
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
        await setPasswordReset(user.id, hashOpaqueToken(rawToken), expiresAt);
      }
    }
    return res.status(200).json({ message: GENERIC_RESET });
  } catch (error) {
    console.error("Error in forgotPassword: ", error);
    return res.status(400).json({ message: "Unable to start a password reset." });
  }
};

export const resetPassword = async (req, res) => {
  try {
    await ensureAuthSchema();
    const rawToken = req.params?.token;
    const password = req.body?.newPassword;
    const invalidPassword = passwordError(password, { requiredLength: true });
    if (typeof rawToken !== "string" || rawToken.length < 20 || rawToken.length > 200) {
      return res.status(400).json({ message: "Invalid or expired reset token." });
    }
    if (invalidPassword) return res.status(400).json({ message: invalidPassword });

    const user = await findUserByResetTokenHash(hashOpaqueToken(rawToken));
    const expiresAt = user ? new Date(user.expiresAt).getTime() : 0;
    if (!user || !Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
      return res.status(400).json({ message: "Invalid or expired reset token." });
    }

    await updatePasswordAndClearReset(user.id, await hashPassword(password));
    await revokeUserSessions(user.id);
    clearAuthCookies(res);
    return res.status(200).json({ message: "Password reset successful." });
  } catch (error) {
    console.error("Error in resetPassword: ", error);
    return res.status(400).json({ message: "Unable to reset password." });
  }
};

export const isAuthorized = async (req, res) => {
  return res.status(200).json({ message: "Tokens are valid!", isAuthorized: true });
};
