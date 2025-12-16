const { appPool } = require("../../config/db")

const PurchaseOrders = async () => {
    const query = `CREATE TABLE IF NOT EXISTS "PurchaseOrders" (
  "Id" SERIAL PRIMARY KEY,
  "SupplierId" INT REFERENCES "Suppliers"("Id"),
  "OrderDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "ReceivedDate" TIMESTAMP,
  "Status" VARCHAR(50) DEFAULT 'Pending',
  "CompanyId" INT REFERENCES "Companies"("Id"),
  "CreatedBy" INT REFERENCES "Users"("UserId")
);`
    await appPool.query(query);
    console.log("✅ PurchaseOrders table ready")
}

module.exports = { PurchaseOrders };