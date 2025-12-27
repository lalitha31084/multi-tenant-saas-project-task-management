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
