const express = require('express');
const router = express.Router();

const { 
  createProject, 
  getProjects, 
  updateProject, 
  deleteProject 
} = require('../controllers/projectController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate)

router.post('/', authorize(['tenant_admin', 'super_admin']), createProject);
router.delete('/:id', authorize(['tenant_admin', 'super_admin']), deleteProject);

router.get('/', getProjects);
router.patch('/:id', updateProject);

module.exports = router;