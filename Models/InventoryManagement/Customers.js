const { appPool } = require("../../config/db")

const Customers = async () => {
    const query = `CREATE TABLE IF NOT EXISTS "Customers" (
  "Id" SERIAL PRIMARY KEY,
  "Name" VARCHAR(255) NOT NULL,
  "Email" VARCHAR(255),
  "Phone" VARCHAR(20),
  "Address" TEXT,
  "City" VARCHAR(100),
  "State" VARCHAR(100),
  "Country" VARCHAR(100),
  "PostalCode" VARCHAR(20),
  "CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`
    await appPool.query(query);
    console.log("✅ Customers table ready")
}

module.exports = {Customers  };