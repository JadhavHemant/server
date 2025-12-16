const express = require("express");

const router = express.Router();

const {

    createCustomer,

    updateCustomer,

    softDeleteCustomer,

    hardDeleteCustomer,

    getCustomerById,

    getAllCustomers

} = require("../../../controllers/InventoryApis/customers");
 
// Create Customer

router.post("/", createCustomer);
 
// Update Customer by Id

router.put("/:id", updateCustomer);
 
// Soft Delete Customer by Id

router.patch("/soft-delete/:id", softDeleteCustomer);
 
// Hard Delete Customer by Id

router.delete("/hard-delete/:id", hardDeleteCustomer);
 
// Get Customer by Id

router.get("/:id", getCustomerById);
 
// Get All Customers (with pagination)

router.get("/", getAllCustomers);
 
module.exports = router;

 