const express = require('express');
const router = express.Router();
const { login, registerTenant } = require('../controllers/authController');

// Public login route
router.post('/login', login);
router.post('/register-tenant', registerTenant);

module.exports = router;
