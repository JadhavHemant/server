const { appPool } = require("../../config/db")

const  SalesStages= async () => {
    const query = `CREATE TABLE IF NOT EXISTS "SalesStages" (
    "Id" SERIAL PRIMARY KEY,
    "Name" VARCHAR(255) UNIQUE NOT NULL
);`
    await appPool.query(query);
    console.log("✅ SalesStages table ready")
}

module.exports = { SalesStages };