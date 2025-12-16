const { appPool } = require("../../config/db")

const  SalesOrders= async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS "SalesOrders" (
  "Id" SERIAL PRIMARY KEY,
  "CustomerId" INT REFERENCES "Customers"("Id"),
  "OrderDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "Status" VARCHAR(50) DEFAULT 'Pending',
  "CompanyId" INT REFERENCES "Companies"("Id"),
  "CreatedBy" INT REFERENCES "Users"("UserId")
);`
    await appPool.query(query);
    console.log("✅ SalesOrders table ready")
}

module.exports = { SalesOrders };