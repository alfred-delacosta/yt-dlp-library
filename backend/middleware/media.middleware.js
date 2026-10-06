import { AuthTokenError, mediaCookieName, verifyMediaToken } from "../utils/authTokens.js";
import { familyIsActive } from "../service/sessions.js";

export async function requireMediaAccess(req, res, next) {
  try {
    const token = req.cookies?.[mediaCookieName()];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const { userId, familyId } = verifyMediaToken(token);
    const active = await familyIsActive(familyId);
    if (!active) return res.status(401).json({ message: "Unauthorized" });

    req.userId = userId;
    return next();
  } catch (error) {
    if (!(error instanceof AuthTokenError) && error?.name !== "JsonWebTokenError" && error?.name !== "TokenExpiredError") {
      console.error("Media access check failed", error);
    }
    return res.status(401).json({ message: "Unauthorized" });
  }
}
