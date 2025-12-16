const { appPool } = require("../../config/db")

const  Leads= async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS "Leads" (
    "Id" SERIAL PRIMARY KEY,
    "CompanyId" INT REFERENCES "Companies"("Id") ON DELETE CASCADE,
    "AccountId" INT REFERENCES "Accounts"("Id") ON DELETE SET NULL,
    "ContactId" INT REFERENCES "Contacts"("Id") ON DELETE SET NULL,
    "LeadSourceId" INT REFERENCES "LeadSources"("Id"),
    "ProductCategoryId" INT REFERENCES "ProductCategories"("Id"),
    "FollowupTypeId" INT REFERENCES "FollowupTypes"("Id"),
    "IndustryId" INT REFERENCES "Industries"("Id"),
    "Status" VARCHAR(50) DEFAULT 'New',
    "Rating" INT,
    "Description" TEXT,
    "Comments" TEXT,
    "AssignedTo" INT REFERENCES "Users"("UserId"),
    "AssignedFrom" INT REFERENCES "Users"("UserId"),
    "CreatedBy" INT REFERENCES "Users"("UserId"),
    "CreatedAt" TIMESTAMP DEFAULT NOW(),
    "UpdatedAt" TIMESTAMP DEFAULT NOW(),
    "IsActive" BOOLEAN DEFAULT TRUE,
    "IsDeleted" BOOLEAN DEFAULT FALSE,
    "Flag" BOOLEAN DEFAULT TRUE
);
    `
    await appPool.query(query);
    console.log("✅ Leads table ready")
}

module.exports = { Leads };