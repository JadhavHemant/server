const { appPool } = require("../../config/db")

const  Industries= async () => {
    const query = `CREATE TABLE IF NOT EXISTS "Industries" (
    "Id" SERIAL PRIMARY KEY,
    "Name" VARCHAR(255) UNIQUE NOT NULL
);`
    await appPool.query(query);
    console.log("✅ Industries table ready")
}

module.exports = { Industries };