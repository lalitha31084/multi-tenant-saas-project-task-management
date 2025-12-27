const express = require('express');
const router = express.Router();
const { createProject, getProjects } = require('../controllers/projectController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate); // All project routes require login

router.post('/', authorize(['tenant_admin', 'super_admin']), createProject);
router.get('/', getProjects);

module.exports = router;
