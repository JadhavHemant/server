const express = require("express");
const { verifyAccessToken } = require("../../middlewares/authMiddleware");
const { getRoles } = require("../../controllers/UserApis/roleController");

const router = express.Router();

router.get("/", verifyAccessToken, getRoles);

module.exports = router;
