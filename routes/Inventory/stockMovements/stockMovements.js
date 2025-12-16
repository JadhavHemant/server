const express = require("express");

const router = express.Router();

const {

    createStockMovement,

    updateStockMovement,

    softDeleteStockMovement,

    hardDeleteStockMovement,

    getStockMovementById,

    getAllStockMovements

} = require("../../../controllers/InventoryApis/stockMovements");
 
// Create StockMovement

router.post("/", createStockMovement);
 
// Update StockMovement by Id

router.put("/:id", updateStockMovement);
 
// Soft Delete StockMovement by Id

router.patch("/soft-delete/:id", softDeleteStockMovement);
 
// Hard Delete StockMovement by Id

router.delete("/hard-delete/:id", hardDeleteStockMovement);
 
// Get StockMovement by Id

router.get("/:id", getStockMovementById);
 
// Get All StockMovements (with pagination)

router.get("/", getAllStockMovements);
 
module.exports = router;

 