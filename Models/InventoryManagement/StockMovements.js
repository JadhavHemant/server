const { appPool } = require("../../config/db")

const  StockMovements= async () => {
    const query = `CREATE TABLE IF NOT EXISTS "StockMovements" (
  "Id" SERIAL PRIMARY KEY,
  "ProductId" INT REFERENCES "Products"("Id"),
  "WarehouseId" INT REFERENCES "Warehouses"("Id"),
  "ChangeType" VARCHAR(50), -- IN, OUT, ADJUSTMENT
  "Quantity" INT NOT NULL,
  "Reason" TEXT,
  "CreatedBy" INT REFERENCES "Users"("UserId"),
  "CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`
    await appPool.query(query);
    console.log("✅ StockMovements table ready")
}

module.exports = { StockMovements };