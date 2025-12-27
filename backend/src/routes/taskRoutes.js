const express = require('express');
const router = express.Router();
const { createTask, getTasksByProject, updateTask, deleteTask } = require('../controllers/taskController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.post('/:projectId/tasks', authorize(['tenant_admin', 'user', 'super_admin']), createTask);
router.get('/:projectId/tasks', getTasksByProject);
router.patch('/:projectId/tasks/:taskId', authorize(['tenant_admin', 'user', 'super_admin']), updateTask);
router.delete('/:projectId/tasks/:taskId', authorize(['tenant_admin', 'user', 'super_admin']), deleteTask);

module.exports = router;
