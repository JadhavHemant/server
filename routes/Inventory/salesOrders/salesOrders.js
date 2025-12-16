const express = require("express");

const router = express.Router();

const {

    createSalesOrder,

    updateSalesOrder,

    softDeleteSalesOrder,

    hardDeleteSalesOrder,

    getSalesOrderById,

    getAllSalesOrders

} = require("../../../controllers/InventoryApis/salesOrders");
 
// Create SalesOrder

router.post("/", createSalesOrder);
 
// Update SalesOrder by Id

router.put("/:id", updateSalesOrder);
 
// Soft Delete SalesOrder by Id

router.patch("/soft-delete/:id", softDeleteSalesOrder);
 
// Hard Delete SalesOrder by Id

router.delete("/hard-delete/:id", hardDeleteSalesOrder);
 
// Get SalesOrder by Id

router.get("/:id", getSalesOrderById);
 
// Get All SalesOrders (with pagination)

router.get("/", getAllSalesOrders);
 
module.exports = router;

 