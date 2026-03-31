require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const { ensureDatabaseExists, appPool } = require('./config/db');
const { initModels } = require('./Models/initModels');
const companiesRoutes = require('./routes/Company/companiesRoutes');
const userTypeRoutes = require('./routes/User/userTypeRoutes');
const roleRoutes = require('./routes/User/roleRoutes');
const userRoutes = require('./routes/User/userRoutes');
const productCategoryRoutes =require('./routes/Inventory/productCategory/productCategory')
const UnitRoutes = require('./routes/Inventory/units/units');
const ProductsRoutes = require('./routes/Inventory/products/Product');
const warehousesRoutes = require('./routes/Inventory/warehouses/warehouses');
const productStock = require('./routes/Inventory/productStock.routes/productStock.routes');
const StockMovements = require('./routes/Inventory/stockMovements/stockMovements');
const Suppliers = require('./routes/Inventory/suppliers/suppliers');
const PurchaseOrders = require('./routes/Inventory/purchaseOrders/purchaseOrders');
const PurchaseOrderItems = require('./routes/Inventory/purchaseOrderItems/purchaseOrderItems.routes');
const Customers = require('./routes/Inventory/customersroutes/customersroutes');
const SalesOrders = require('./routes/Inventory/salesOrders/salesOrders');
// const SalesOrderItems = require('./routes/Inventory/salesOrderItems/salesOrderItems');
const Taxes = require('./routes/Inventory/taxes/taxes');
const ProductTaxMap = require('./routes/Inventory/productTaxMap/productTaxMap');
const AuditLogs = require('./routes/Inventory/Auditlog/Auditlog');
const ProfitLossReports = require('./routes/Inventory/profitLossReports/profitLossReports.routes');
const refreshToken = require('./routes/Token/tokenRoutes');
const {
  taskTypeRoutes,
  salesStageRoutes,
  industryRoutes,
  followupTypeRoutes,
  leadSourceRoutes,
} = require('./routes/Crm/masterDataRoutes');
const {
  accountRoutes,
  contactRoutes,
  leadRoutes,
  opportunityRoutes,
  presalesRoutes,
  caseRoutes,
} = require('./routes/Crm/entityRoutes');
const reportRoutes = require("./routes/System/reportRoutes");
const apiMonitoringRoutes = require("./routes/System/apiMonitoringRoutes");


const PORT = process.env.PORT || 5351;
const path = require('path');
// Configure CORS explicitly so browser requests with custom headers (e.g. Authorization) work reliably.
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/company', companiesRoutes);
app.use('/api/usertypes', userTypeRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/token', refreshToken);
app.use('/api/productcategory',productCategoryRoutes)
app.use('/api/units', UnitRoutes);
app.use('/api/products', ProductsRoutes);
app.use('/api/warehouses', warehousesRoutes);
app.use('/api/product-stock', productStock);
app.use('/api/stock-movements', StockMovements);
app.use('/api/Suppliers', Suppliers);
app.use('/api/purchase-orders', PurchaseOrders);
app.use('/api/purchase-order-items', PurchaseOrderItems);
app.use('/api/Customers', Customers);
app.use('/api/sales-orders', SalesOrders);
// app.use('/api/SalesOrderItems', SalesOrderItems);
app.use('/api/Taxes', Taxes);
app.use('/api/ProductTaxMap', ProductTaxMap);
app.use('/api/AuditLogs', AuditLogs);
app.use('/api/ProfitLossReports', ProfitLossReports);
app.use('/api/crm/task-types', taskTypeRoutes);
app.use('/api/crm/sales-stages', salesStageRoutes);
app.use('/api/crm/industries', industryRoutes);
app.use('/api/crm/followup-types', followupTypeRoutes);
app.use('/api/crm/lead-sources', leadSourceRoutes);
app.use('/api/crm/accounts', accountRoutes);
app.use('/api/crm/contacts', contactRoutes);
app.use('/api/crm/leads', leadRoutes);
app.use('/api/crm/opportunities', opportunityRoutes);
app.use('/api/crm/presales', presalesRoutes);
app.use('/api/crm/cases', caseRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/monitoring", apiMonitoringRoutes);

ensureDatabaseExists().then(async () => {
  await initModels();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error(' Error during startup:', err);
});
 
