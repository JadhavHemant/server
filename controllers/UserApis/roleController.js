const { appPool } = require("../../config/db");

const getRoles = async (_req, res) => {
  try {
    const result = await appPool.query(`
      SELECT "Id", "RoleName", "IsActive"
      FROM "Roles"
      WHERE COALESCE("IsDeleted", FALSE) = FALSE
      ORDER BY "Id" ASC;
    `);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching roles:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getRoles };
