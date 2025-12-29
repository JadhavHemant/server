// routes/InventoryApis/purchaseOrders/index.js
const express = require("express");
const router = express.Router();
const {
    createPurchaseOrder,
    updatePurchaseOrder,
    updatePurchaseOrderStatus,
    softDeletePurchaseOrder,
    hardDeletePurchaseOrder,
    getPurchaseOrderById,
    getAllPurchaseOrders,
    getPurchaseOrdersBySupplier,
    getPurchaseOrderStats
} = require("../../../controllers/InventoryApis/purchaseOrders");

// Get Purchase Order Statistics
router.get("/stats", getPurchaseOrderStats);

// Get Purchase Orders by Supplier
router.get("/supplier/:supplierId", getPurchaseOrdersBySupplier);

// Get All Purchase Orders (with pagination & filters)
router.get("/", getAllPurchaseOrders);

// Get Purchase Order by Id
router.get("/:id", getPurchaseOrderById);

// Create Purchase Order
router.post("/", createPurchaseOrder);

// Update Purchase Order by Id
router.put("/:id", updatePurchaseOrder);

// Update Purchase Order Status
router.patch("/:id/status", updatePurchaseOrderStatus);

// Soft Delete Purchase Order by Id (Cancel)
router.patch("/soft-delete/:id", softDeletePurchaseOrder);

// Hard Delete Purchase Order by Id
router.delete("/hard-delete/:id", hardDeletePurchaseOrder);

module.exports = router;
