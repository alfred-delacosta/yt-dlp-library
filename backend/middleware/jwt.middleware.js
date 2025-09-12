import jwt from "jsonwebtoken";
import { verifyAccessToken } from "../utils/jwt.js";

export const verifyToken = (req, res, next) => {
  const token = req.cookies.token;

  try {
    if (!token)
      return res
        .status(401)
        .json({ message: "Unauthorized - No token provided." });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded)
      return res.status(401).json({ message: "Unauthorized - Invalid token." });

    req.userId = decoded.userId;

    next();
  } catch (error) {
    console.error(
      "There was an error in the verifyToken Middleware",
      error.message
    );
  }
};

export const checkAuth = async (req, res, next) => {
  try {
    // Confirm AccessToken is still valid
    const authorizationHeader = req.get("Authorization");
    if (!authorizationHeader) return res.status(401).json({ message: "No Access Token Received." })
    // eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImlhdCI6MTc1NzcxMzU3MSwiZXhwIjoxNzU3NzE0NDcxfQ.kmzPelt9eXpC7soYGha6LJHjIPSMTNZCz1Fdz6iwPmk
    const accessToken = authorizationHeader.split("Bearer ")[1];

    if (!accessToken || accessToken === undefined || accessToken === "") {
      return res.status(401).json({ message: "Invalid Access Token" });
    }

    const valid = verifyAccessToken(accessToken);

    if (!valid) {
      return res.status(401).json({ message: "Invalid Access Token" });
    }
  } catch (error) {
    console.log("Error in checkAuth: ", error);
    return res.status(400).json({ message: error.message });
  }

  // Validate refresh token
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Unauthorized - No token provided." });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) return res.status(401).json({ message: "Unauthorized - Invalid token." });

    req.userId = decoded.userId;

    next();
  } catch (error) {
    console.error(
      "There was an error in the verifyToken Middleware",
      error.message
    );
  }
};
