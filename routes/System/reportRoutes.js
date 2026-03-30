const express = require("express");
const { verifyAccessToken } = require("../../middlewares/authMiddleware");
const {
  getSuperAdminDashboard,
  getEmployeeActivity,
  getRecentNotifications,
} = require("../../controllers/System/reportController");

const router = express.Router();

router.get("/dashboard", verifyAccessToken, getSuperAdminDashboard);
router.get("/employee-activity", verifyAccessToken, getEmployeeActivity);
router.get("/notifications", verifyAccessToken, getRecentNotifications);

module.exports = router;
