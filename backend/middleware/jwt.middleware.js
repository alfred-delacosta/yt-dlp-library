import { AuthTokenError, verifyAccessToken } from "../utils/authTokens.js";

function isExpectedTokenError(error) {
  return (
    error instanceof AuthTokenError ||
    error?.name === "TokenExpiredError" ||
    error?.name === "JsonWebTokenError" ||
    error?.name === "NotBeforeError"
  );
}

export const checkAuth = async (req, res, next) => {
  try {
    const header = req.get("Authorization") || "";
    const match = header.match(/^Bearer\s+(\S+)$/i);
    if (!match) return res.status(401).json({ message: "Unauthorized" });

    const { userId } = verifyAccessToken(match[1]);
    req.userId = userId;
    return next();
  } catch (error) {
    if (!isExpectedTokenError(error)) {
      console.error("Access token check failed", error);
    }
    return res.status(401).json({ message: "Unauthorized" });
  }
};
