const { appPool } = require("../../config/db");
 
// Create StockMovement

const createStockMovement = async (req, res) => {

    const { ProductId, WarehouseId, ChangeType, Quantity, Reason, CreatedBy } = req.body;

    const query = `

        INSERT INTO "StockMovements"

        ("ProductId", "WarehouseId", "ChangeType", "Quantity", "Reason", "CreatedBy")

        VALUES ($1, $2, $3, $4, $5, $6)

        RETURNING *;

    `;
 
    try {

        const { rows } = await appPool.query(query, [ProductId, WarehouseId, ChangeType, Quantity, Reason, CreatedBy]);

        res.status(201).json(rows[0]);

    } catch (error) {

        console.error("Error creating StockMovement:", error);

        res.status(500).json({ message: "Internal server error" });

    }

};
 
// Update StockMovement by Id

const updateStockMovement = async (req, res) => {

    const { id } = req.params;

    const { ProductId, WarehouseId, ChangeType, Quantity, Reason, CreatedBy } = req.body;

    const query = `

        UPDATE "StockMovements"

        SET "ProductId" = $1,

            "WarehouseId" = $2,

            "ChangeType" = $3,

            "Quantity" = $4,

            "Reason" = $5,

            "CreatedBy" = $6

        WHERE "Id" = $7

        RETURNING *;

    `;
 
    try {

        const { rows } = await appPool.query(query, [ProductId, WarehouseId, ChangeType, Quantity, Reason, CreatedBy, id]);

        if (!rows.length) return res.status(404).json({ message: "StockMovement not found" });
 
        res.json(rows[0]);

    } catch (error) {

        console.error("Error updating StockMovement:", error);

        res.status(500).json({ message: "Internal server error" });

    }

};
 
// Soft Delete StockMovement by Id (set Quantity to 0 and Reason to 'Soft deleted')

const softDeleteStockMovement = async (req, res) => {

    const { id } = req.params;

    const query = `

        UPDATE "StockMovements"

        SET "Quantity" = 0,

            "Reason" = 'Soft deleted'

        WHERE "Id" = $1

        RETURNING *;

    `;
 
    try {

        const { rows } = await appPool.query(query, [id]);

        if (!rows.length) return res.status(404).json({ message: "StockMovement not found" });
 
        res.json({ message: "Soft deleted successfully", record: rows[0] });

    } catch (error) {

        console.error("Error soft deleting StockMovement:", error);

        res.status(500).json({ message: "Internal server error" });

    }

};
 
// Hard Delete StockMovement by Id

const hardDeleteStockMovement = async (req, res) => {

    const { id } = req.params;

    const query = `DELETE FROM "StockMovements" WHERE "Id" = $1 RETURNING *;`;
 
    try {

        const { rows } = await appPool.query(query, [id]);

        if (!rows.length) return res.status(404).json({ message: "StockMovement not found" });
 
        res.json({ message: "Hard deleted successfully", record: rows[0] });

    } catch (error) {

        console.error("Error hard deleting StockMovement:", error);

        res.status(500).json({ message: "Internal server error" });

    }

};
 
// Get StockMovement by Id

const getStockMovementById = async (req, res) => {

    const { id } = req.params;

    const query = `SELECT * FROM "StockMovements" WHERE "Id" = $1 LIMIT 1;`;
 
    try {

        const { rows } = await appPool.query(query, [id]);

        if (!rows.length) return res.status(404).json({ message: "StockMovement not found" });
 
        res.json(rows[0]);

    } catch (error) {

        console.error("Error fetching StockMovement by Id:", error);

        res.status(500).json({ message: "Internal server error" });

    }

};
 
// Get All StockMovements with Pagination

const getAllStockMovements = async (req, res) => {

    const { limit = 10, offset = 0 } = req.query;

    const query = `

        SELECT * FROM "StockMovements"

        ORDER BY "CreatedAt" DESC

        LIMIT $1 OFFSET $2;

    `;
 
    try {

        const { rows } = await appPool.query(query, [limit, offset]);

        res.json(rows);

    } catch (error) {

        console.error("Error fetching all StockMovements:", error);

        res.status(500).json({ message: "Internal server error" });

    }

};
 
module.exports = {

    createStockMovement,

    updateStockMovement,

    softDeleteStockMovement,

    hardDeleteStockMovement,

    getStockMovementById,

    getAllStockMovements

};

 

// 
// 
// 
// 
// 
// 
