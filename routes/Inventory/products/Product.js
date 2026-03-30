// routes/productRoutes.js

const express = require('express');
const router = express.Router();
const {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    softDeleteProduct,
    toggleActiveStatus,
    getLowStockProducts,
    getProductStats,
    bulkDeleteProducts
} = require('../../../controllers/InventoryApis/products');
const { uploadProductImage } = require('../utils/fileUpload');

// ✅ IMPORTANT: Specific routes MUST come BEFORE dynamic routes like /:id
// Otherwise /:id will match everything and cause 404 errors

// Create product with image upload
router.post('/create', uploadProductImage.single('productImage'), createProduct);

// Get all products with filters and pagination
router.get('/list', getAllProducts);

// Get active products (matches client expectation: GET /products/active)
// Reuses `getAllProducts` with `isActive=true`.
router.get('/active', (req, res, next) => {
    req.query.isActive = 'true';
    return getAllProducts(req, res, next);
});

// Get low stock products (BEFORE /:id)
router.get('/alerts/low-stock', getLowStockProducts);

// Get product statistics (BEFORE /:id)
router.get('/reports/stats', getProductStats);

// Bulk delete products (BEFORE /delete/:id)
router.delete('/bulk-delete', bulkDeleteProducts);

// Get product by ID (comes AFTER specific routes)
router.get('/:id', getProductById);

// Update product with image upload
router.put('/:id', uploadProductImage.single('productImage'), updateProduct);

// Toggle active status
router.patch('/:id/toggle-active', toggleActiveStatus);

// Soft delete product
router.delete('/delete/:id', softDeleteProduct);

module.exports = router;
