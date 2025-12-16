const { appPool } = require("../../config/db")

const Accounts = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS "Accounts" (
    "Id" SERIAL PRIMARY KEY,
    "CompanyId" INT REFERENCES "Companies"("Id") ON DELETE CASCADE,
    "Name" VARCHAR(255) NOT NULL,
    "Website" VARCHAR(255),
    "Description" TEXT,
    "IndustryId" INT REFERENCES "Industries"("Id") ON DELETE CASCADE,
    "CreatedBy" INT REFERENCES "Users"("UserId") ON DELETE CASCADE,
    "CreatedAt" TIMESTAMP DEFAULT NOW(),
    "UpdatedAt" TIMESTAMP DEFAULT NOW(),
    "IsActive" BOOLEAN DEFAULT TRUE,
    "IsDeleted" BOOLEAN DEFAULT FALSE,
    "Flag" BOOLEAN DEFAULT TRUE
);
    
    `
    await appPool.query(query);
    console.log("✅ Accounts table ready")
}

module.exports = { Accounts };