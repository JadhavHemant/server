const { appPool } = require("../../config/db");
 
// Create SalesOrder

const createSalesOrder = async (req, res) => {

    const { CustomerId, OrderDate, Status, CompanyId, CreatedBy } = req.body;

    const query = `

        INSERT INTO "SalesOrders"

        ("CustomerId", "OrderDate", "Status", "CompanyId", "CreatedBy")

        VALUES ($1, $2, $3, $4, $5)

        RETURNING *;

    `;
 
    try {

        const { rows } = await appPool.query(query, [CustomerId, OrderDate, Status, CompanyId, CreatedBy]);

        res.status(201).json(rows[0]);

    } catch (error) {

        console.error("Error creating SalesOrder:", error);

        res.status(500).json({ message: "Internal server error" });

    }

};
 
// Update SalesOrder by Id

const updateSalesOrder = async (req, res) => {

    const { id } = req.params;

    const { CustomerId, OrderDate, Status, CompanyId, CreatedBy } = req.body;

    const query = `

        UPDATE "SalesOrders"

        SET "CustomerId" = $1,

            "OrderDate" = $2,

            "Status" = $3,

            "CompanyId" = $4,

            "CreatedBy" = $5

        WHERE "Id" = $6

        RETURNING *;

    `;
 
    try {

        const { rows } = await appPool.query(query, [CustomerId, OrderDate, Status, CompanyId, CreatedBy, id]);

        if (!rows.length) return res.status(404).json({ message: "SalesOrder not found" });
 
        res.json(rows[0]);

    } catch (error) {

        console.error("Error updating SalesOrder:", error);

        res.status(500).json({ message: "Internal server error" });

    }

};
 
// Soft Delete SalesOrder by Id (set Status = 'Cancelled')

const softDeleteSalesOrder = async (req, res) => {

    const { id } = req.params;

    const query = `

        UPDATE "SalesOrders"

        SET "Status" = 'Cancelled'

        WHERE "Id" = $1

        RETURNING *;

    `;
 
    try {

        const { rows } = await appPool.query(query, [id]);

        if (!rows.length) return res.status(404).json({ message: "SalesOrder not found" });
 
        res.json({ message: "Soft deleted successfully", record: rows[0] });

    } catch (error) {

        console.error("Error soft deleting SalesOrder:", error);

        res.status(500).json({ message: "Internal server error" });

    }

};
 
// Hard Delete SalesOrder by Id

const hardDeleteSalesOrder = async (req, res) => {

    const { id } = req.params;

    const query = `DELETE FROM "SalesOrders" WHERE "Id" = $1 RETURNING *;`;
 
    try {

        const { rows } = await appPool.query(query, [id]);

        if (!rows.length) return res.status(404).json({ message: "SalesOrder not found" });
 
        res.json({ message: "Hard deleted successfully", record: rows[0] });

    } catch (error) {

        console.error("Error hard deleting SalesOrder:", error);

        res.status(500).json({ message: "Internal server error" });

    }

};
 
// Get SalesOrder by Id

const getSalesOrderById = async (req, res) => {

    const { id } = req.params;

    const query = `SELECT * FROM "SalesOrders" WHERE "Id" = $1 LIMIT 1;`;
 
    try {

        const { rows } = await appPool.query(query, [id]);

        if (!rows.length) return res.status(404).json({ message: "SalesOrder not found" });
 
        res.json(rows[0]);

    } catch (error) {

        console.error("Error fetching SalesOrder by Id:", error);

        res.status(500).json({ message: "Internal server error" });

    }

};
 
// Get All SalesOrders with Pagination

const getAllSalesOrders = async (req, res) => {

    const { limit = 10, offset = 0 } = req.query;

    const query = `

        SELECT * FROM "SalesOrders"

        ORDER BY "OrderDate" DESC

        LIMIT $1 OFFSET $2;

    `;
 
    try {

        const { rows } = await appPool.query(query, [limit, offset]);

        res.json(rows);

    } catch (error) {

        console.error("Error fetching all SalesOrders:", error);

        res.status(500).json({ message: "Internal server error" });

    }

};
 
module.exports = {

    createSalesOrder,

    updateSalesOrder,

    softDeleteSalesOrder,

    hardDeleteSalesOrder,

    getSalesOrderById,

    getAllSalesOrders

};

 