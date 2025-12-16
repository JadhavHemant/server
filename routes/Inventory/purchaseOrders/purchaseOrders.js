const express = require("express");

const router = express.Router();

const {

    createPurchaseOrder,

    updatePurchaseOrder,

    softDeletePurchaseOrder,

    hardDeletePurchaseOrder,

    getPurchaseOrderById,

    getAllPurchaseOrders

} = require("../../../controllers/InventoryApis/purchaseOrders");
 
// Create PurchaseOrder

router.post("/", createPurchaseOrder);
 
// Update PurchaseOrder by Id

router.put("/:id", updatePurchaseOrder);
 
// Soft Delete PurchaseOrder by Id

router.patch("/soft-delete/:id", softDeletePurchaseOrder);
 
// Hard Delete PurchaseOrder by Id

router.delete("/hard-delete/:id", hardDeletePurchaseOrder);
 
// Get PurchaseOrder by Id

router.get("/:id", getPurchaseOrderById);
 
// Get All PurchaseOrders (with pagination)

router.get("/", getAllPurchaseOrders);
 
module.exports = router;

 