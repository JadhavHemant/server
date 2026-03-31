const jwt = require("jsonwebtoken");

const getCookieToken = (req) => {
  const rawCookie = req.headers.cookie;
  if (!rawCookie) {
    return null;
  }

  const cookies = Object.fromEntries(
    rawCookie.split(";").map((entry) => {
      const [name, ...valueParts] = entry.trim().split("=");
      return [name, decodeURIComponent(valueParts.join("="))];
    })
  );

  return cookies.accessToken || null;
};

const verifyAccessToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
  const token = bearerToken || getCookieToken(req);

  if (!token) {
    return res.status(401).json({ message: "Access token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = { verifyAccessToken };
