const { appPool } = require("../../config/db")

const  TaskTypes= async () => {
    const query = `CREATE TABLE IF NOT EXISTS "TaskTypes" (
    "Id" SERIAL PRIMARY KEY,
    "Name" VARCHAR(100) UNIQUE NOT NULL,
    "DefaultDurationMinutes" INT,
    "CreatedAt" TIMESTAMP DEFAULT NOW()
);`
    await appPool.query(query);
    console.log("✅ TaskTypes table ready")
}

module.exports = { TaskTypes };