const jwt = require("jsonwebtoken");
const Student = require("../models/Student");

exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      console.log("Token received:", token);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded token ID:", decoded.id);
      const user = await Student.findById(decoded.id).select("-password");
      
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }
      
      req.user = user;
      next();
    } catch (error) {
      console.error("Token verification error:", error);
      return res.status(401).json({ error: "Not authorized, token failed" });
    }
  } else {
    console.log("No token found in request headers");
    return res.status(401).json({ error: "Not authorized, no token" });
  }
};
