import jwt from "jsonwebtoken";
import { verifyAccessToken } from "../utils/jwt.js";


export const verifyToken = (req, res, next) => {
  const token = req.cookies.token;

  try {
    if (!token)
      return res.status(401).json({ message: "Unauthorized - No token provided." });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (!token)
      return res.status(401).json({ message: "Unauthorized - Invalid token." });
    
    req.userId = decoded.userId;
    
    next();
  } catch (error) {
    console.error("There was an error in the verifyToken Middleware", error.message);
  }
};

export const checkAuth = async (req, res) => {
  try {
    // Confirm AccessToken is still valid
    const accessToken = req.get('Authorization');

    if (!accessToken || accessToken === undefined || accessToken === '') {
      return res.status(401).json({ message: "Invalid Access Token" });
    }

    const valid = verifyAccessToken(accessToken);

    if (!valid) {
      return res.status(401).json({ message: "Invalid Access Token" });
    } else {
      next();
    }

  } catch (error) {
    console.log("Error in checkAuth: ", error);
    res.status(400).json({ message: error.message })
  }
};
