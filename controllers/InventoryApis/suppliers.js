const { appPool } = require("../../config/db");
 
// Create Supplier

const createSupplier = async (req, res) => {

    const { Name, ContactPerson, Email, Phone, Address, City, State, Country, PostalCode } = req.body;

    const query = `

        INSERT INTO "Suppliers"

        ("Name", "ContactPerson", "Email", "Phone", "Address", "City", "State", "Country", "PostalCode")

        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)

        RETURNING *;

    `;
 
    try {

        const { rows } = await appPool.query(query, [Name, ContactPerson, Email, Phone, Address, City, State, Country, PostalCode]);

        res.status(201).json(rows[0]);

    } catch (error) {

        console.error("Error creating Supplier:", error);

        res.status(500).json({ message: "Internal server error" });

    }

};
 
// Update Supplier by Id

const updateSupplier = async (req, res) => {

    const { id } = req.params;

    const { Name, ContactPerson, Email, Phone, Address, City, State, Country, PostalCode, IsActive } = req.body;

    const query = `

        UPDATE "Suppliers"

        SET "Name" = $1,

            "ContactPerson" = $2,

            "Email" = $3,

            "Phone" = $4,

            "Address" = $5,

            "City" = $6,

            "State" = $7,

            "Country" = $8,

            "PostalCode" = $9,

            "IsActive" = $10

        WHERE "Id" = $11

        RETURNING *;

    `;
 
    try {

        const { rows } = await appPool.query(query, [Name, ContactPerson, Email, Phone, Address, City, State, Country, PostalCode, IsActive, id]);

        if (!rows.length) return res.status(404).json({ message: "Supplier not found" });
 
        res.json(rows[0]);

    } catch (error) {

        console.error("Error updating Supplier:", error);

        res.status(500).json({ message: "Internal server error" });

    }

};
 
// Soft Delete Supplier by Id (set IsActive = false)

const softDeleteSupplier = async (req, res) => {

    const { id } = req.params;

    const query = `

        UPDATE "Suppliers"

        SET "IsActive" = false

        WHERE "Id" = $1

        RETURNING *;

    `;
 
    try {

        const { rows } = await appPool.query(query, [id]);

        if (!rows.length) return res.status(404).json({ message: "Supplier not found" });
 
        res.json({ message: "Soft deleted successfully", record: rows[0] });

    } catch (error) {

        console.error("Error soft deleting Supplier:", error);

        res.status(500).json({ message: "Internal server error" });

    }

};
 
// Hard Delete Supplier by Id

const hardDeleteSupplier = async (req, res) => {

    const { id } = req.params;

    const query = `DELETE FROM "Suppliers" WHERE "Id" = $1 RETURNING *;`;
 
    try {

        const { rows } = await appPool.query(query, [id]);

        if (!rows.length) return res.status(404).json({ message: "Supplier not found" });
 
        res.json({ message: "Hard deleted successfully", record: rows[0] });

    } catch (error) {

        console.error("Error hard deleting Supplier:", error);

        res.status(500).json({ message: "Internal server error" });

    }

};
 
// Get Supplier by Id

const getSupplierById = async (req, res) => {

    const { id } = req.params;

    const query = `SELECT * FROM "Suppliers" WHERE "Id" = $1 LIMIT 1;`;
 
    try {

        const { rows } = await appPool.query(query, [id]);

        if (!rows.length) return res.status(404).json({ message: "Supplier not found" });
 
        res.json(rows[0]);

    } catch (error) {

        console.error("Error fetching Supplier by Id:", error);

        res.status(500).json({ message: "Internal server error" });

    }

};
 
// Get All Suppliers with Pagination

const getAllSuppliers = async (req, res) => {

    const { limit = 10, offset = 0 } = req.query;

    const query = `

        SELECT * FROM "Suppliers"

        ORDER BY "CreatedAt" DESC

        LIMIT $1 OFFSET $2;

    `;
 
    try {

        const { rows } = await appPool.query(query, [limit, offset]);

        res.json(rows);

    } catch (error) {

        console.error("Error fetching all Suppliers:", error);

        res.status(500).json({ message: "Internal server error" });

    }

};
 
module.exports = {

    createSupplier,

    updateSupplier,

    softDeleteSupplier,

    hardDeleteSupplier,

    getSupplierById,

    getAllSuppliers

};

 