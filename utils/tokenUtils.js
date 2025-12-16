const jwt = require('jsonwebtoken');
const { appPool } = require('../config/db');

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;
const generateTokens = async (user) => {
  const payload = {
    userId: user.UserId,
    email: user.Email,
    userTypeId: user.UserTypeId,
  };
  const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
  const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: Math.floor(REFRESH_TOKEN_EXPIRY_MS / 1000) + 's',
  });
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS);
  await appPool.query(
    'INSERT INTO refresh_tokens ("UserId", "Token", "ExpiresAt") VALUES ($1, $2, $3)',
    [user.UserId, refreshToken, expiresAt]
  );
  return { accessToken, refreshToken };
};

const verifyToken = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch (err) {
    return null;
  }
};

module.exports = {
  generateTokens,
  verifyToken,
};
