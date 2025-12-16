const { appPool } = require("../../config/db")

const  ProductStockPerWarehouse= async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS "ProductStockPerWarehouse" (
  "Id" SERIAL PRIMARY KEY,
  "ProductId" INT REFERENCES "Products"("Id") ON DELETE CASCADE,
  "WarehouseId" INT REFERENCES "Warehouses"("Id") ON DELETE CASCADE,
  "Quantity" INT DEFAULT 0,
  UNIQUE ("ProductId", "WarehouseId")
);`
    await appPool.query(query);
    console.log("✅ ProductStockPerWarehouse table ready")
}

module.exports = {ProductStockPerWarehouse  };
