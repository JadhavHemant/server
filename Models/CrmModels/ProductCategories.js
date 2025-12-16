const { appPool } = require("../../config/db")

const  ProductCategories= async () => {
    const query = `CREATE TABLE IF NOT EXISTS "ProductCategories" (
    "Id" SERIAL PRIMARY KEY,
    "Name" VARCHAR(255) UNIQUE NOT NULL
);`
    await appPool.query(query);
    console.log("✅ ProductCategories table ready")
}

module.exports = { ProductCategories };