const { appPool } = require("../../config/db")

const  LeadSources= async () => {
    const query = 
    `CREATE TABLE IF NOT EXISTS "LeadSources" (
    "Id" SERIAL PRIMARY KEY,
    "Name" VARCHAR(255) UNIQUE NOT NULL
);
`
  await appPool.query(query);
    console.log("✅ LeadSources table ready")
}

module.exports = { LeadSources };