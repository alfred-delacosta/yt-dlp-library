import jwt from "jsonwebtoken";


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
