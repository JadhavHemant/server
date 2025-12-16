const { appPool } = require("../../config/db");
 
// Create PurchaseOrder

const createPurchaseOrder = async (req, res) => {

    const { SupplierId, OrderDate, ReceivedDate, Status, CompanyId, CreatedBy } = req.body;

    const query = `

        INSERT INTO "PurchaseOrders"

        ("SupplierId", "OrderDate", "ReceivedDate", "Status", "CompanyId", "CreatedBy")

        VALUES ($1, $2, $3, $4, $5, $6)

        RETURNING *;

    `;
 
    try {

        const { rows } = await appPool.query(query, [SupplierId, OrderDate, ReceivedDate, Status, CompanyId, CreatedBy]);

        res.status(201).json(rows[0]);

    } catch (error) {

        console.error("Error creating PurchaseOrder:", error);

        res.status(500).json({ message: "Internal server error" });

    }

};
 
// Update PurchaseOrder by Id

const updatePurchaseOrder = async (req, res) => {

    const { id } = req.params;

    const { SupplierId, OrderDate, ReceivedDate, Status, CompanyId, CreatedBy } = req.body;

    const query = `

        UPDATE "PurchaseOrders"

        SET "SupplierId" = $1,

            "OrderDate" = $2,

            "ReceivedDate" = $3,

            "Status" = $4,

            "CompanyId" = $5,

            "CreatedBy" = $6

        WHERE "Id" = $7

        RETURNING *;

    `;
 
    try {

        const { rows } = await appPool.query(query, [SupplierId, OrderDate, ReceivedDate, Status, CompanyId, CreatedBy, id]);

        if (!rows.length) return res.status(404).json({ message: "PurchaseOrder not found" });
 
        res.json(rows[0]);

    } catch (error) {

        console.error("Error updating PurchaseOrder:", error);

        res.status(500).json({ message: "Internal server error" });

    }

};
 
// Soft Delete PurchaseOrder by Id (set Status = 'Cancelled')

const softDeletePurchaseOrder = async (req, res) => {

    const { id } = req.params;

    const query = `

        UPDATE "PurchaseOrders"

        SET "Status" = 'Cancelled'

        WHERE "Id" = $1

        RETURNING *;

    `;
 
    try {

        const { rows } = await appPool.query(query, [id]);

        if (!rows.length) return res.status(404).json({ message: "PurchaseOrder not found" });
 
        res.json({ message: "Soft deleted successfully", record: rows[0] });

    } catch (error) {

        console.error("Error soft deleting PurchaseOrder:", error);

        res.status(500).json({ message: "Internal server error" });

    }

};
 
// Hard Delete PurchaseOrder by Id

const hardDeletePurchaseOrder = async (req, res) => {

    const { id } = req.params;

    const query = `DELETE FROM "PurchaseOrders" WHERE "Id" = $1 RETURNING *;`;
 
    try {

        const { rows } = await appPool.query(query, [id]);

        if (!rows.length) return res.status(404).json({ message: "PurchaseOrder not found" });
 
        res.json({ message: "Hard deleted successfully", record: rows[0] });

    } catch (error) {

        console.error("Error hard deleting PurchaseOrder:", error);

        res.status(500).json({ message: "Internal server error" });

    }

};
 
// Get PurchaseOrder by Id

const getPurchaseOrderById = async (req, res) => {

    const { id } = req.params;

    const query = `SELECT * FROM "PurchaseOrders" WHERE "Id" = $1 LIMIT 1;`;
 
    try {

        const { rows } = await appPool.query(query, [id]);

        if (!rows.length) return res.status(404).json({ message: "PurchaseOrder not found" });
 
        res.json(rows[0]);

    } catch (error) {

        console.error("Error fetching PurchaseOrder by Id:", error);

        res.status(500).json({ message: "Internal server error" });

    }

};
 
// Get All PurchaseOrders with Pagination

const getAllPurchaseOrders = async (req, res) => {

    const { limit = 10, offset = 0 } = req.query;

    const query = `

        SELECT * FROM "PurchaseOrders"

        ORDER BY "OrderDate" DESC

        LIMIT $1 OFFSET $2;

    `;
 
    try {

        const { rows } = await appPool.query(query, [limit, offset]);

        res.json(rows);

    } catch (error) {

        console.error("Error fetching all PurchaseOrders:", error);

        res.status(500).json({ message: "Internal server error" });

    }

};
 
module.exports = {

    createPurchaseOrder,

    updatePurchaseOrder,

    softDeletePurchaseOrder,

    hardDeletePurchaseOrder,

    getPurchaseOrderById,

    getAllPurchaseOrders

};

 