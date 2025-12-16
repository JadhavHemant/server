const jwt = require('jsonwebtoken');
const { appPool } = require('../config/db');

const refreshAccessToken = async (req, res) => {
  const { refreshToken } = req.body;

  console.log("created.....")
  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token is required' });
    
  }
  try {
    const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const result = await appPool.query(
      'SELECT * FROM refresh_tokens WHERE "Token" = $1 AND "Revoked" = FALSE AND "ExpiresAt" > NOW()',
      [refreshToken]
    );
    if (result.rows.length === 0) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }
    const newAccessToken = jwt.sign({
      userId: payload.userId,
      email: payload.email,
      userTypeId: payload.userTypeId,
    }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
    return res.status(200).json({ accessToken: newAccessToken });
    
  } catch (err) {
    console.error('Token verification error:', err);
    return res.status(403).json({ message: 'Invalid refresh token' });
  }
};

module.exports = { refreshAccessToken };
