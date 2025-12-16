const express = require('express');
const { refreshAccessToken } = require('../../controllers/tokenController');

const router = express.Router();

router.post('/refresh-token', refreshAccessToken);

module.exports = router;
