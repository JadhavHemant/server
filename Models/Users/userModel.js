const { appPool } = require("../../config/db");

const createUsersTable = async () => {
  const existingTable = await appPool.query(`SELECT to_regclass('public."Users"') AS name;`);

  if (existingTable.rows[0]?.name) {
    console.log("Users table ready");
    return;
  }

  await appPool.query(`
    CREATE TABLE "Users" (
      "UserId" SERIAL PRIMARY KEY,
      "Name" VARCHAR(255) NOT NULL,
      "Email" VARCHAR(255) NOT NULL UNIQUE,
      "RoleId" INT REFERENCES "Roles"("Id"),
      "Password" VARCHAR(255) NOT NULL,
      "MobileNumber" VARCHAR(15),
      "CompanyId" INT REFERENCES "Companies"("Id") ON DELETE CASCADE,
      "UserTypeId" INT REFERENCES "UserTypes"("Id") ON DELETE CASCADE,
      "ReportingManagerId" INT REFERENCES "Users"("UserId") ON DELETE SET NULL,
      "DepartmentId" INT,
      "DesignationId" INT,
      "HierarchyLevel" INT DEFAULT 0,
      "HierarchyPath" TEXT,
      "CreatedBy" INT REFERENCES "Users"("UserId"),
      "Address" TEXT,
      "City" VARCHAR(100),
      "State" VARCHAR(100),
      "Country" VARCHAR(100),
      "PostalCode" VARCHAR(20),
      "userImage" TEXT,
      "FirstName" VARCHAR(255),
      "LastName" VARCHAR(255),
      "Phone" VARCHAR(20),
      "ProfilePicture" TEXT,
      "IsActive" BOOLEAN DEFAULT TRUE,
      "Flag" BOOLEAN DEFAULT TRUE,
      "IsDelete" BOOLEAN DEFAULT FALSE,
      "CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      "UpdatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log("Users table ready");
};

module.exports = { createUsersTable };
