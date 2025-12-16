const { appPool } = require("../../config/db")

const PurchaseOrderItems = async () => {
    const query = `
CREATE TABLE IF NOT EXISTS "PurchaseOrderItems" (
  "Id" SERIAL PRIMARY KEY,
  "PurchaseOrderId" INT REFERENCES "PurchaseOrders"("Id") ON DELETE CASCADE,
  "ProductId" INT REFERENCES "Products"("Id"),
  "Quantity" INT NOT NULL,
  "UnitCost" NUMERIC(10, 2)
);`
    await appPool.query(query);
    console.log("✅ PurchaseOrderItems table ready")
}

module.exports = { PurchaseOrderItems };