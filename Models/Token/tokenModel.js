const { appPool } = require('../../config/db');

const createTokenTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS "refresh_tokens" (
      "Id" SERIAL PRIMARY KEY,
      "UserId" INT REFERENCES "Users"("UserId"),
      "Token" TEXT NOT NULL,
      "ExpiresAt" TIMESTAMP NOT NULL,
      "CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      "Revoked" BOOLEAN DEFAULT FALSE
    );
  `;
  await appPool.query(query);
  console.log("✅ refresh_tokens table ready");
};

module.exports = { createTokenTable };
