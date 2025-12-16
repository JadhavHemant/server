const { appPool } = require("../../config/db");
 
// Create SalesOrderItem

const createSalesOrderItem = async (req, res) => {

    const { SalesOrderId, ProductId, Quantity, UnitPrice } = req.body;

    const query = `

        INSERT INTO "SalesOrderItems"

        ("SalesOrderId", "ProductId", "Quantity", "UnitPrice")

        VALUES ($1, $2, $3, $4)

        RETURNING *;

    `;
 
    try {

        const { rows } = await appPool.query(query, [SalesOrderId, ProductId, Quantity, UnitPrice]);

        res.status(201).json(rows[0]);

    } catch (error) {

        console.error("Error creating SalesOrderItem:", error);

        res.status(500).json({ message: "Internal server error" });

    }

};
 
// Update SalesOrderItem by Id

const updateSalesOrderItem = async (req, res) => {

    const { id } = req.params;

    const { SalesOrderId, ProductId, Quantity, UnitPrice } = req.body;

    const query = `

        UPDATE "SalesOrderItems"

        SET "SalesOrderId" = $1,

            "ProductId" = $2,

            "Quantity" = $3,

            "UnitPrice" = $4

        WHERE "Id" = $5

        RETURNING *;

    `;
 
    try {

        const { rows } = await appPool.query(query, [SalesOrderId, ProductId, Quantity, UnitPrice, id]);

        if (!rows.length) return res.status(404).json({ message: "SalesOrderItem not found" });
 
        res.json(rows[0]);

    } catch (error) {

        console.error("Error updating SalesOrderItem:", error);

        res.status(500).json({ message: "Internal server error" });

    }

};
 
// Soft Delete SalesOrderItem by Id (set Quantity and UnitPrice to NULL)

const softDeleteSalesOrderItem = async (req, res) => {

    const { id } = req.params;

    const query = `

        UPDATE "SalesOrderItems"

        SET "Quantity" = NULL,

            "UnitPrice" = NULL

        WHERE "Id" = $1

        RETURNING *;

    `;
 
    try {

        const { rows } = await appPool.query(query, [id]);

        if (!rows.length) return res.status(404).json({ message: "SalesOrderItem not found" });
 
        res.json({ message: "Soft deleted successfully", record: rows[0] });

    } catch (error) {

        console.error("Error soft deleting SalesOrderItem:", error);

        res.status(500).json({ message: "Internal server error" });

    }

};
 
// Hard Delete SalesOrderItem by Id

const hardDeleteSalesOrderItem = async (req, res) => {

    const { id } = req.params;

    const query = `DELETE FROM "SalesOrderItems" WHERE "Id" = $1 RETURNING *;`;
 
    try {

        const { rows } = await appPool.query(query, [id]);

        if (!rows.length) return res.status(404).json({ message: "SalesOrderItem not found" });
 
        res.json({ message: "Hard deleted successfully", record: rows[0] });

    } catch (error) {

        console.error("Error hard deleting SalesOrderItem:", error);

        res.status(500).json({ message: "Internal server error" });

    }

};
 
// Get SalesOrderItem by Id

const getSalesOrderItemById = async (req, res) => {

    const { id } = req.params;

    const query = `SELECT * FROM "SalesOrderItems" WHERE "Id" = $1 LIMIT 1;`;
 
    try {

        const { rows } = await appPool.query(query, [id]);

        if (!rows.length) return res.status(404).json({ message: "SalesOrderItem not found" });
 
        res.json(rows[0]);

    } catch (error) {

        console.error("Error fetching SalesOrderItem by Id:", error);

        res.status(500).json({ message: "Internal server error" });

    }

};
 
// Get All SalesOrderItems with Pagination

const getAllSalesOrderItems = async (req, res) => {

    const { limit = 10, offset = 0 } = req.query;

    const query = `

        SELECT * FROM "SalesOrderItems"

        ORDER BY "Id" DESC

        LIMIT $1 OFFSET $2;

    `;
 
    try {

        const { rows } = await appPool.query(query, [limit, offset]);

        res.json(rows);

    } catch (error) {

        console.error("Error fetching all SalesOrderItems:", error);

        res.status(500).json({ message: "Internal server error" });

    }

};
 
module.exports = {

    createSalesOrderItem,

    updateSalesOrderItem,

    softDeleteSalesOrderItem,

    hardDeleteSalesOrderItem,

    getSalesOrderItemById,

    getAllSalesOrderItems

};

 