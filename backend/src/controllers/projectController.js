const db = require('../config/db');

exports.createProject = async (req, res) => {
  const { name, description } = req.body;
  const { tenantId, userId } = req.user;

  try {
    // 1. Check Plan Limits
    const tenantCheck = await db.query(
      'SELECT max_projects, (SELECT COUNT(*) FROM projects WHERE tenant_id = $1) as current_count FROM tenants WHERE id = $1',
      [tenantId]
    );

    const { max_projects, current_count } = tenantCheck.rows[0];
    if (parseInt(current_count) >= max_projects) {
      return res.status(403).json({ success: false, message: 'Project limit reached for your plan' });
    }

    // 2. Create Project
    const newProject = await db.query(
      'INSERT INTO projects (name, description, tenant_id, created_by) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, description, tenantId, userId]
    );

    // 3. Audit Log
    await db.query(
      'INSERT INTO audit_logs (tenant_id, user_id, action, entity_type, entity_id) VALUES ($1, $2, $3, $4, $5)',
      [tenantId, userId, 'CREATE_PROJECT', 'project', newProject.rows[0].id]
    );

    res.status(201).json({ success: true, data: newProject.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getProjects = async (req, res) => {
  const { tenantId } = req.user;
  try {
    // Mandatory filter: Only projects belonging to the logged-in user's tenant
    const projects = await db.query(
      `SELECT p.*, u.full_name as creator_name, 
      (SELECT COUNT(*) FROM tasks WHERE project_id = p.id) as task_count
      FROM projects p 
      LEFT JOIN users u ON p.created_by = u.id 
      WHERE p.tenant_id = $1 ORDER BY p.created_at DESC`,
      [tenantId]
    );
    res.json({ success: true, data: { projects: projects.rows } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// Add these to your projectController.js
exports.updateProject = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  const { tenantId, userId } = req.user;

  try {
    const updatedProject = await db.query(
      'UPDATE projects SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 AND tenant_id = $4 RETURNING *',
      [name, description, id, tenantId]
    );

    if (updatedProject.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Audit Log
    await db.query(
      'INSERT INTO audit_logs (tenant_id, user_id, action, entity_type, entity_id) VALUES ($1, $2, $3, $4, $5)',
      [tenantId, userId, 'UPDATE_PROJECT', 'project', id]
    );

    res.json({ success: true, data: updatedProject.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteProject = async (req, res) => {
  const { id } = req.params;
  const { tenantId, userId } = req.user;

  try {
    const deletedProject = await db.query(
      'DELETE FROM projects WHERE id = $1 AND tenant_id = $2 RETURNING *',
      [id, tenantId]
    );

    if (deletedProject.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Audit Log
    await db.query(
      'INSERT INTO audit_logs (tenant_id, user_id, action, entity_type, entity_id) VALUES ($1, $2, $3, $4, $5)',
      [tenantId, userId, 'DELETE_PROJECT', 'project', id]
    );

    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};