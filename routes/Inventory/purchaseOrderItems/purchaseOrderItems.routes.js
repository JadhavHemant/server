const express = require("express");

const router = express.Router();

const {

    createPurchaseOrderItem,

    updatePurchaseOrderItem,

    softDeletePurchaseOrderItem,

    hardDeletePurchaseOrderItem,

    getPurchaseOrderItemById,

    getAllPurchaseOrderItems

} = require("../../../controllers/InventoryApis/purchaseOrderItems");
 
// Create PurchaseOrderItem

router.post("/", createPurchaseOrderItem);
 
// Update PurchaseOrderItem by Id

router.put("/:id", updatePurchaseOrderItem);
 
// Soft Delete PurchaseOrderItem by Id

router.patch("/soft-delete/:id", softDeletePurchaseOrderItem);
 
// Hard Delete PurchaseOrderItem by Id

router.delete("/hard-delete/:id", hardDeletePurchaseOrderItem);
 
// Get PurchaseOrderItem by Id

router.get("/:id", getPurchaseOrderItemById);
 
// Get All PurchaseOrderItems (with pagination)

router.get("/", getAllPurchaseOrderItems);
 
module.exports = router;

 