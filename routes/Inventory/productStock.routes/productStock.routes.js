const express = require("express");

const router = express.Router();

const {

    createProductStock,

    updateProductStock,

    softDeleteProductStock,

    hardDeleteProductStock,

    getProductStockById,

    getAllProductStocks

} = require("../../../controllers/InventoryApis/productStockcontroller");
 
// Create Product Stock Entry

router.post("/", createProductStock);
 
// Update Product Stock by Id

router.put("/:id", updateProductStock);
 
// Soft Delete Product Stock by Id

router.patch("/soft-delete/:id", softDeleteProductStock);
 
// Hard Delete Product Stock by Id

router.delete("/hard-delete/:id", hardDeleteProductStock);
 
// Get Product Stock by Id

router.get("/:id", getProductStockById);
 
// Get All Product Stocks (with pagination)

router.get("/", getAllProductStocks);
 
module.exports = router;

 