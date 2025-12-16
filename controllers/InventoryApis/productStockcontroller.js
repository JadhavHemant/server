const { appPool } = require("../../config/db");
 
// Create Product Stock Entry

const createProductStock = async (req, res) => {

    const { ProductId, WarehouseId, Quantity } = req.body;

    const query = `

        INSERT INTO "ProductStockPerWarehouse" 

        ("ProductId", "WarehouseId", "Quantity") 

        VALUES ($1, $2, $3)

        RETURNING *;

    `;
 
    try {

        const { rows } = await appPool.query(query, [ProductId, WarehouseId, Quantity]);

        res.status(201).json(rows[0]);

    } catch (error) {

        console.error("Error creating ProductStock:", error);

        res.status(500).json({ message: "Internal server error" });

    }

};
 
// Update Product Stock by Id

const updateProductStock = async (req, res) => {

    const { id } = req.params;

    const { ProductId, WarehouseId, Quantity } = req.body;

    const query = `

        UPDATE "ProductStockPerWarehouse"

        SET "ProductId" = $1,

            "WarehouseId" = $2,

            "Quantity" = $3

        WHERE "Id" = $4

        RETURNING *;

    `;
 
    try {

        const { rows } = await appPool.query(query, [ProductId, WarehouseId, Quantity, id]);

        if (!rows.length) return res.status(404).json({ message: "ProductStock not found" });
 
        res.json(rows[0]);

    } catch (error) {

        console.error("Error updating ProductStock:", error);

        res.status(500).json({ message: "Internal server error" });

    }

};
 
// Soft Delete Product Stock by Id (set Quantity = -1 as indicator)

const softDeleteProductStock = async (req, res) => {

    const { id } = req.params;

    const query = `

        UPDATE "ProductStockPerWarehouse"

        SET "Quantity" = -1

        WHERE "Id" = $1

        RETURNING *;

    `;
 
    try {

        const { rows } = await appPool.query(query, [id]);

        if (!rows.length) return res.status(404).json({ message: "ProductStock not found" });
 
        res.json({ message: "Soft deleted successfully", record: rows[0] });

    } catch (error) {

        console.error("Error soft deleting ProductStock:", error);

        res.status(500).json({ message: "Internal server error" });

    }

};
 
// Hard Delete Product Stock by Id

const hardDeleteProductStock = async (req, res) => {

    const { id } = req.params;

    const query = `DELETE FROM "ProductStockPerWarehouse" WHERE "Id" = $1 RETURNING *;`;
 
    try {

        const { rows } = await appPool.query(query, [id]);

        if (!rows.length) return res.status(404).json({ message: "ProductStock not found" });
 
        res.json({ message: "Hard deleted successfully", record: rows[0] });

    } catch (error) {

        console.error("Error hard deleting ProductStock:", error);

        res.status(500).json({ message: "Internal server error" });

    }

};
 
// Get Product Stock by Id

const getProductStockById = async (req, res) => {

    const { id } = req.params;

    const query = `SELECT * FROM "ProductStockPerWarehouse" WHERE "Id" = $1 LIMIT 1;`;
 
    try {

        const { rows } = await appPool.query(query, [id]);

        if (!rows.length) return res.status(404).json({ message: "ProductStock not found" });
 
        res.json(rows[0]);

    } catch (error) {

        console.error("Error fetching ProductStock by Id:", error);

        res.status(500).json({ message: "Internal server error" });

    }

};
 
// Get All Product Stocks with Pagination

const getAllProductStocks = async (req, res) => {

    const { limit = 10, offset = 0 } = req.query;

    const query = `

        SELECT * FROM "ProductStockPerWarehouse"

        ORDER BY "Id" DESC

        LIMIT $1 OFFSET $2;

    `;
 
    try {

        const { rows } = await appPool.query(query, [limit, offset]);

        res.json(rows);

    } catch (error) {

        console.error("Error fetching all ProductStocks:", error);

        res.status(500).json({ message: "Internal server error" });

    }

};
 
module.exports = {

    createProductStock,

    updateProductStock,

    softDeleteProductStock,

    hardDeleteProductStock,

    getProductStockById,

    getAllProductStocks

};

 