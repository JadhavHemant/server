const { appPool } = require("../../config/db")

const  Presales= async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS "Presales" (
    "Id" SERIAL PRIMARY KEY,
    "CompanyId" INT REFERENCES "Companies"("Id") ON DELETE CASCADE,
    "LeadId" INT REFERENCES "Leads"("Id") ON DELETE SET NULL,
    "OpportunityId" INT REFERENCES "Opportunities"("Id") ON DELETE SET NULL,
    "ClientName" VARCHAR(255),
    "RelatedTo" VARCHAR(255),
    "StartDate" TIMESTAMP,
    "EndDate" TIMESTAMP,
    "ETA" TIMESTAMP,
    "DurationMinutes" INT,
    "Status" VARCHAR(50) DEFAULT 'Pending',
    "Hyperscaler" VARCHAR(100),
    "FollowUpTriggerStatus" VARCHAR(50),
    "TaskTypeId" INT REFERENCES "TaskTypes"("Id"),
    "Documents" TEXT[],
    "DetailedSummary" TEXT,
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
    console.log("✅ Presales table ready")
}

module.exports = { Presales };