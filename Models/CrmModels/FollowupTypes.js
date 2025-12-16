const { appPool } = require("../../config/db")

const  FollowupTypes= async () => {
    const query = `CREATE TABLE IF NOT EXISTS "FollowupTypes" (
    "Id" SERIAL PRIMARY KEY,
    "Name" VARCHAR(255) UNIQUE NOT NULL
);`
    await appPool.query(query);
    console.log("✅ FollowupTypes table ready")
}

module.exports = { FollowupTypes };