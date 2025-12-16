const { appPool } = require("../../config/db");
 
// Create a new Customer

const createCustomer = async (req, res) => {

    const { Name, Email, Phone, Address, City, State, Country, PostalCode } = req.body;

    const query = `

        INSERT INTO "Customers" 

        ("Name", "Email", "Phone", "Address", "City", "State", "Country", "PostalCode") 

        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)

        RETURNING *;

    `;
 
    try {

        const { rows } = await appPool.query(query, [Name, Email, Phone, Address, City, State, Country, PostalCode]);

        res.status(201).json(rows[0]);

    } catch (error) {

        console.error("Error creating Customer:", error);

        res.status(500).json({ message: "Internal server error" });

    }

};
 
// Update Customer by Id

const updateCustomer = async (req, res) => {

    const { id } = req.params;

    const { Name, Email, Phone, Address, City, State, Country, PostalCode } = req.body;

    const query = `

        UPDATE "Customers"

        SET "Name" = $1, "Email" = $2, "Phone" = $3, "Address" = $4,

            "City" = $5, "State" = $6, "Country" = $7, "PostalCode" = $8

        WHERE "Id" = $9

        RETURNING *;

    `;
 
    try {

        const { rows } = await appPool.query(query, [Name, Email, Phone, Address, City, State, Country, PostalCode, id]);

        if (!rows.length) return res.status(404).json({ message: "Customer not found" });
 
        res.json(rows[0]);

    } catch (error) {

        console.error("Error updating Customer:", error);

        res.status(500).json({ message: "Internal server error" });

    }

};
 
// Soft Delete Customer by Id (mark as deleted by setting Name to 'DELETED')

const softDeleteCustomer = async (req, res) => {

    const { id } = req.params;

    const query = `

        UPDATE "Customers"

        SET "Name" = 'DELETED'

        WHERE "Id" = $1

        RETURNING *;

    `;
 
    try {

        const { rows } = await appPool.query(query, [id]);

        if (!rows.length) return res.status(404).json({ message: "Customer not found" });
 
        res.json({ message: "Soft deleted successfully", record: rows[0] });

    } catch (error) {

        console.error("Error soft deleting Customer:", error);

        res.status(500).json({ message: "Internal server error" });

    }

};
 
// Hard Delete Customer by Id (remove from DB)

const hardDeleteCustomer = async (req, res) => {

    const { id } = req.params;

    const query = `DELETE FROM "Customers" WHERE "Id" = $1 RETURNING *;`;
 
    try {

        const { rows } = await appPool.query(query, [id]);

        if (!rows.length) return res.status(404).json({ message: "Customer not found" });
 
        res.json({ message: "Hard deleted successfully", record: rows[0] });

    } catch (error) {

        console.error("Error hard deleting Customer:", error);

        res.status(500).json({ message: "Internal server error" });

    }

};
 
// Get Customer by Id with pagination (limit = 1 since it's one record)

const getCustomerById = async (req, res) => {

    const { id } = req.params;

    const query = `SELECT * FROM "Customers" WHERE "Id" = $1 LIMIT 1;`;
 
    try {

        const { rows } = await appPool.query(query, [id]);

        if (!rows.length) return res.status(404).json({ message: "Customer not found" });
 
        res.json(rows[0]);

    } catch (error) {

        console.error("Error fetching Customer by Id:", error);

        res.status(500).json({ message: "Internal server error" });

    }

};
 
// Get all Customers with pagination

const getAllCustomers = async (req, res) => {

    const { limit = 10, offset = 0 } = req.query;

    const query = `

        SELECT * FROM "Customers"

        ORDER BY "CreatedAt" DESC

        LIMIT $1 OFFSET $2;

    `;
 
    try {

        const { rows } = await appPool.query(query, [limit, offset]);

        res.json(rows);

    } catch (error) {

        console.error("Error fetching all Customers:", error);

        res.status(500).json({ message: "Internal server error" });

    }

};
 
module.exports = {

    createCustomer,

    updateCustomer,

    softDeleteCustomer,

    hardDeleteCustomer,

    getCustomerById,

    getAllCustomers

};

 