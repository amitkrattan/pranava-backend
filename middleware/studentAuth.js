const jwt = require("jsonwebtoken");

module.exports = function studentAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer "))
    return res.status(401).json({ error: "Token missing" });

  try {
    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "TEMP_SECRET");

    if (decoded.role !== "student")
      return res.status(403).json({ error: "Forbidden" });

    req.student = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
};
