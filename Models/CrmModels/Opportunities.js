const { appPool } = require("../../config/db")

const  Opportunities= async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS "Opportunities" (
    "Id" SERIAL PRIMARY KEY,
    "CompanyId" INT REFERENCES "Companies"("Id") ON DELETE CASCADE,
    "AccountId" INT REFERENCES "Accounts"("Id") ON DELETE SET NULL,
    "ContactId" INT REFERENCES "Contacts"("Id") ON DELETE SET NULL,
    "OpportunityName" VARCHAR(255) NOT NULL,
    "SalesStageId" INT REFERENCES "SalesStages"("Id"),
    "LeadSourceId" INT REFERENCES "LeadSources"("Id"),
    "ProductCategoryId" INT REFERENCES "ProductCategories"("Id"),
    "IndustryId" INT REFERENCES "Industries"("Id"),
    "BudgetAmount" NUMERIC(15,2),
    "EstCloseDate" DATE,
    "Description" TEXT,
    "QualificationComments" TEXT,
    "DetailedSummary" TEXT,
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
    await appPool.query('ALTER TABLE "Opportunities" ADD COLUMN IF NOT EXISTS "UpdatedBy" INT REFERENCES "Users"("UserId") ON DELETE SET NULL;');
    console.log("✅ Opportunities table ready")
}

module.exports = { Opportunities };
