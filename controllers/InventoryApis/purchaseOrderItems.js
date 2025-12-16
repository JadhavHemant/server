const { appPool } = require("../../config/db");
 
// Create PurchaseOrderItem

const createPurchaseOrderItem = async (req, res) => {

    const { PurchaseOrderId, ProductId, Quantity, UnitCost } = req.body;

    const query = `

        INSERT INTO "PurchaseOrderItems"

        ("PurchaseOrderId", "ProductId", "Quantity", "UnitCost")

        VALUES ($1, $2, $3, $4)

        RETURNING *;

    `;
 
    try {

        const { rows } = await appPool.query(query, [PurchaseOrderId, ProductId, Quantity, UnitCost]);

        res.status(201).json(rows[0]);

    } catch (error) {

        console.error("Error creating PurchaseOrderItem:", error);

        res.status(500).json({ message: "Internal server error" });

    }

};
 
// Update PurchaseOrderItem by Id

const updatePurchaseOrderItem = async (req, res) => {

    const { id } = req.params;

    const { PurchaseOrderId, ProductId, Quantity, UnitCost } = req.body;

    const query = `

        UPDATE "PurchaseOrderItems"

        SET "PurchaseOrderId" = $1,

            "ProductId" = $2,

            "Quantity" = $3,

            "UnitCost" = $4

        WHERE "Id" = $5

        RETURNING *;

    `;
 
    try {

        const { rows } = await appPool.query(query, [PurchaseOrderId, ProductId, Quantity, UnitCost, id]);

        if (!rows.length) return res.status(404).json({ message: "PurchaseOrderItem not found" });
 
        res.json(rows[0]);

    } catch (error) {

        console.error("Error updating PurchaseOrderItem:", error);

        res.status(500).json({ message: "Internal server error" });

    }

};
 
// Soft Delete PurchaseOrderItem by Id (set Quantity and UnitCost to NULL)

const softDeletePurchaseOrderItem = async (req, res) => {

    const { id } = req.params;

    const query = `

        UPDATE "PurchaseOrderItems"

        SET "Quantity" = NULL,

            "UnitCost" = NULL

        WHERE "Id" = $1

        RETURNING *;

    `;
 
    try {

        const { rows } = await appPool.query(query, [id]);

        if (!rows.length) return res.status(404).json({ message: "PurchaseOrderItem not found" });
 
        res.json({ message: "Soft deleted successfully", record: rows[0] });

    } catch (error) {

        console.error("Error soft deleting PurchaseOrderItem:", error);

        res.status(500).json({ message: "Internal server error" });

    }

};
 
// Hard Delete PurchaseOrderItem by Id

const hardDeletePurchaseOrderItem = async (req, res) => {

    const { id } = req.params;

    const query = `DELETE FROM "PurchaseOrderItems" WHERE "Id" = $1 RETURNING *;`;
 
    try {

        const { rows } = await appPool.query(query, [id]);

        if (!rows.length) return res.status(404).json({ message: "PurchaseOrderItem not found" });
 
        res.json({ message: "Hard deleted successfully", record: rows[0] });

    } catch (error) {

        console.error("Error hard deleting PurchaseOrderItem:", error);

        res.status(500).json({ message: "Internal server error" });

    }

};
 
// Get PurchaseOrderItem by Id

const getPurchaseOrderItemById = async (req, res) => {

    const { id } = req.params;

    const query = `SELECT * FROM "PurchaseOrderItems" WHERE "Id" = $1 LIMIT 1;`;
 
    try {

        const { rows } = await appPool.query(query, [id]);

        if (!rows.length) return res.status(404).json({ message: "PurchaseOrderItem not found" });
 
        res.json(rows[0]);

    } catch (error) {

        console.error("Error fetching PurchaseOrderItem by Id:", error);

        res.status(500).json({ message: "Internal server error" });

    }

};
 
// Get All PurchaseOrderItems with Pagination

const getAllPurchaseOrderItems = async (req, res) => {

    const { limit = 10, offset = 0 } = req.query;

    const query = `

        SELECT * FROM "PurchaseOrderItems"

        ORDER BY "Id" DESC

        LIMIT $1 OFFSET $2;

    `;
 
    try {

        const { rows } = await appPool.query(query, [limit, offset]);

        res.json(rows);

    } catch (error) {

        console.error("Error fetching all PurchaseOrderItems:", error);

        res.status(500).json({ message: "Internal server error" });

    }

};
 
module.exports = {

    createPurchaseOrderItem,

    updatePurchaseOrderItem,

    softDeletePurchaseOrderItem,

    hardDeletePurchaseOrderItem,

    getPurchaseOrderItemById,

    getAllPurchaseOrderItems

};

 