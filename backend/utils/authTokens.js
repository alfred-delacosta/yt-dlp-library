import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import "@dotenvx/dotenvx/config";

export const TOKEN_ISSUER = "yt-dlp-library";
export const ACCESS_AUDIENCE = "yt-dlp-library-api";
export const MEDIA_AUDIENCE = "yt-dlp-library-media";
const ACCESS_USE = "access";
const MEDIA_USE = "media";

export class AuthTokenError extends Error {
  constructor(message) {
    super(message);
    this.name = "AuthTokenError";
  }
}

export function refreshTtlMs() {
  const days = Number(process.env.JWT_NUMBER_OF_DAYS_EXPIRATION);
  const safeDays = Number.isFinite(days) && days > 0 ? days : 7;
  return Math.round(safeDays * 24 * 60 * 60 * 1000);
}

export function accessTtlSeconds() {
  const minutes = Number(process.env.ACCESS_TOKEN_NUMBER_OF_MINUTES_EXPIRATION);
  const safeMinutes = Number.isFinite(minutes) && minutes > 0 ? minutes : 15;
  return Math.round(safeMinutes * 60);
}

function accessSecret() {
  const secret = process.env.ACCESS_TOKEN_SECRET;
  if (!secret) throw new AuthTokenError("ACCESS_TOKEN_SECRET is not set");
  return secret;
}

function cookieSecure() {
  return process.env.ENVIRONMENT === "production";
}

export function refreshCookieName() {
  return cookieSecure() ? "__Secure-refresh" : "refresh";
}

export function mediaCookieName() {
  return cookieSecure() ? "__Secure-media" : "media";
}

export function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: cookieSecure(),
    sameSite: "strict",
    path: "/api/auth",
    maxAge: refreshTtlMs(),
  };
}

export function mediaCookieOptions() {
  return {
    httpOnly: true,
    secure: cookieSecure(),
    sameSite: "strict",
    path: "/media",
    maxAge: refreshTtlMs(),
  };
}

export function applyRefreshCookie(res, token) {
  res.cookie(refreshCookieName(), token, refreshCookieOptions());
}

export function applyMediaCookie(res, token) {
  res.cookie(mediaCookieName(), token, mediaCookieOptions());
}

export function clearRefreshCookie(res) {
  res.clearCookie(refreshCookieName(), refreshCookieOptions());
}

export function clearMediaCookie(res) {
  res.clearCookie(mediaCookieName(), mediaCookieOptions());
}

export function clearAuthCookies(res) {
  clearRefreshCookie(res);
  clearMediaCookie(res);
}

export function signAccessToken(userId) {
  return jwt.sign(
    { token_use: ACCESS_USE, jti: crypto.randomUUID() },
    accessSecret(),
    {
      algorithm: "HS256",
      subject: String(userId),
      expiresIn: accessTtlSeconds(),
      issuer: TOKEN_ISSUER,
      audience: ACCESS_AUDIENCE,
    }
  );
}

export function verifyAccessToken(token) {
  const decoded = jwt.verify(token, accessSecret(), {
    algorithms: ["HS256"],
    issuer: TOKEN_ISSUER,
    audience: ACCESS_AUDIENCE,
  });
  if (decoded.token_use !== ACCESS_USE) {
    throw new AuthTokenError("Access token use is invalid");
  }
  const userId = Number(decoded.sub);
  if (!Number.isInteger(userId) || userId < 1) {
    throw new AuthTokenError("Access token subject is invalid");
  }
  return { userId };
}

export function signMediaToken(userId, familyId) {
  if (!familyId) throw new AuthTokenError("Media token family is missing");
  return jwt.sign(
    { token_use: MEDIA_USE, family_id: familyId },
    accessSecret(),
    {
      algorithm: "HS256",
      subject: String(userId),
      expiresIn: Math.floor(refreshTtlMs() / 1000),
      issuer: TOKEN_ISSUER,
      audience: MEDIA_AUDIENCE,
    }
  );
}

export function verifyMediaToken(token) {
  const decoded = jwt.verify(token, accessSecret(), {
    algorithms: ["HS256"],
    issuer: TOKEN_ISSUER,
    audience: MEDIA_AUDIENCE,
  });
  if (decoded.token_use !== MEDIA_USE || typeof decoded.family_id !== "string" || decoded.family_id.length < 1) {
    throw new AuthTokenError("Media token is invalid");
  }
  const userId = Number(decoded.sub);
  if (!Number.isInteger(userId) || userId < 1) {
    throw new AuthTokenError("Media token subject is invalid");
  }
  return { userId, familyId: decoded.family_id };
}

export function generateRefreshToken() {
  const raw = crypto.randomBytes(32).toString("base64url");
  return { raw, hash: hashOpaqueToken(raw) };
}

export function hashOpaqueToken(token) {
  return crypto.createHash("sha256").update(String(token)).digest("hex");
}

export function create256BitLongString() {
  return crypto.randomBytes(32).toString("hex");
}

export function create512BitLongString() {
  return crypto.randomBytes(64).toString("hex");
}
