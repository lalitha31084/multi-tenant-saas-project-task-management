import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';
const STATUS_OPTIONS = [
  { value: 'todo', label: 'To do' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'done', label: 'Done' },
];

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [projectForm, setProjectForm] = useState({ name: '', description: '' });
  const [taskForm, setTaskForm] = useState({ projectId: '', title: '', description: '', priority: 'medium', dueDate: '' });
  const [selectedProject, setSelectedProject] = useState('');
  const [editingTaskId, setEditingTaskId] = useState('');
  const { user, logout } = useContext(AuthContext);

  const isAdmin = user?.role === 'tenant_admin' || user?.role === 'super_admin';
  const canEditTasks = isAdmin || user?.role === 'user';

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchTasks(selectedProject);
    }
  }, [selectedProject]);

  const authHeader = () => {
    const token = localStorage.getItem('saas_token');
    return { Authorization: `Bearer ${token}` };
  };

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/projects`, { headers: authHeader() });
      setProjects(res.data.data.projects);
      if (!selectedProject && res.data.data.projects.length > 0) {
        setSelectedProject(res.data.data.projects[0].id);
        setTaskForm((prev) => ({ ...prev, projectId: res.data.data.projects[0].id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async (projectId) => {
    setTasksLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/tasks/${projectId}/tasks`, { headers: authHeader() });
      setTasks(res.data.data.tasks);
    } catch (err) {
      console.error(err);
    } finally {
      setTasksLoading(false);
    }
  };

  const handleProjectCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/api/projects`, projectForm, { headers: authHeader() });
      setProjectForm({ name: '', description: '' });
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not create project');
    }
  };

  const handleTaskCreate = async (e) => {
    e.preventDefault();
    const targetProject = taskForm.projectId || selectedProject;
    if (!targetProject) return alert('Select a project first');
    try {
      if (editingTaskId) {
        await axios.patch(
          `${API_BASE}/api/tasks/${targetProject}/tasks/${editingTaskId}`,
          taskForm,
          { headers: authHeader() }
        );
      } else {
        await axios.post(`${API_BASE}/api/tasks/${targetProject}/tasks`, taskForm, { headers: authHeader() });
      }
      setTaskForm({ projectId: targetProject, title: '', description: '', priority: 'medium', dueDate: '' });
      setEditingTaskId('');
      fetchTasks(targetProject);
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not create task');
    }
  };

  const handleTaskStatusUpdate = async (taskId, newStatus) => {
    const targetProject = selectedProject;
    if (!targetProject) return;
    try {
      await axios.patch(
        `${API_BASE}/api/tasks/${targetProject}/tasks/${taskId}`,
        { status: newStatus },
        { headers: authHeader() }
      );
      fetchTasks(targetProject);
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not update task');
    }
  };

  const handleTaskEdit = (task) => {
    setSelectedProject(task.project_id || selectedProject);
    setTaskForm({
      projectId: task.project_id || selectedProject,
      title: task.title || '',
      description: task.description || '',
      priority: task.priority || 'medium',
      dueDate: task.due_date ? task.due_date.split('T')[0] : '',
    });
    setEditingTaskId(task.id);
  };

  const handleTaskDelete = async (taskId) => {
    const targetProject = selectedProject;
    if (!targetProject) return;
    const confirmDelete = window.confirm('Delete this task?');
    if (!confirmDelete) return;
    try {
      await axios.delete(`${API_BASE}/api/tasks/${targetProject}/tasks/${taskId}`, { headers: authHeader() });
      if (editingTaskId === taskId) {
        setEditingTaskId('');
        setTaskForm({ projectId: targetProject, title: '', description: '', priority: 'medium', dueDate: '' });
      }
      fetchTasks(targetProject);
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not delete task');
    }
  };

  const stats = [
    { label: 'Projects', value: projects.length || 0 },
    { label: 'Tasks (all)', value: projects.reduce((sum, p) => sum + Number(p.task_count || 0), 0) },
  ];

  return (
    <div className="page-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Tenant Workspace</p>
          <h1>Welcome, {user?.fullName || user?.email}</h1>
          <p className="subhead">All data is scoped to your tenant. JWT protects cross-tenant access.</p>
        </div>
        <button className="btn ghost" onClick={logout}>Logout</button>
      </header>

      <section className="stat-grid">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <p className="eyebrow">{s.label}</p>
            <h2>{s.value}</h2>
            <p className="muted">Real-time counts powered by tenant-filtered APIs.</p>
          </div>
        ))}
      </section>

      <section className="panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Projects</p>
            <h3>Your organization projects</h3>
            <p className="muted">Only projects belonging to your tenant are returned.</p>
          </div>
          {isAdmin ? (
            <form className="inline-form" onSubmit={handleProjectCreate}>
              <input
                type="text"
                placeholder="Project name"
                value={projectForm.name}
                onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Description"
                value={projectForm.description}
                onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
              />
              <button type="submit" className="btn small">Add project</button>
            </form>
          ) : (
            <p className="muted">Project creation is restricted to admins.</p>
          )}
        </div>

        {loading ? (
          <div className="empty">Loading projects…</div>
        ) : projects.length === 0 ? (
          <div className="empty">
            <p className="muted">No projects yet. Create one to get started.</p>
          </div>
        ) : (
          <div className="project-grid">
            {projects.map((p) => (
              <div key={p.id} className="project-card">
                <div className="project-meta">
                  <p className="eyebrow">Tasks: {p.task_count}</p>
                  <span className="pill">Active</span>
                </div>
                <h4>{p.name}</h4>
                <p className="muted">{p.description || 'No description provided.'}</p>
                <div className="project-footer">
                  <span className="muted">Created by: {p.creator_name || 'Unknown'}</span>
                  <span className="muted">Updated: {new Date(p.updated_at || p.created_at || Date.now()).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Tasks</p>
            <h3>Create and track tasks</h3>
            <p className="muted">Tasks are always scoped to a project inside your tenant.</p>
          </div>
        </div>

        <div className="task-layout">
          <div className="task-form">
            {canEditTasks ? (
              <form onSubmit={handleTaskCreate} className="form-grid">
                <label className="field">
                  <span>Project</span>
                  <select
                    value={taskForm.projectId || selectedProject}
                    onChange={(e) => {
                      setSelectedProject(e.target.value);
                      setTaskForm({ ...taskForm, projectId: e.target.value });
                    }}
                    required
                  >
                    <option value="" disabled>Select a project</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>Title</span>
                  <input
                    type="text"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    required
                  />
                </label>
                <label className="field">
                  <span>Description</span>
                  <textarea
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                    rows={2}
                  />
                </label>
                <label className="field">
                  <span>Priority</span>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </label>
                <label className="field">
                  <span>Due date</span>
                  <input
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                  />
                </label>
                <button type="submit" className="btn primary">{editingTaskId ? 'Update task' : 'Add task'}</button>
              </form>
            ) : (
              <div className="empty">You need additional permissions to create tasks.</div>
            )}
          </div>

          <div className="task-list">
            {tasksLoading ? (
              <div className="empty">Loading tasks…</div>
            ) : !selectedProject ? (
              <div className="empty">Select a project to view its tasks.</div>
            ) : tasks.length === 0 ? (
              <div className="empty">No tasks yet for this project.</div>
            ) : (
              tasks.map((t) => (
                <div key={t.id} className="task-card">
                  <div className="task-meta">
                    <span className="pill">{t.priority || 'medium'}</span>
                    <span className="muted">{new Date(t.created_at || Date.now()).toLocaleDateString()}</span>
                  </div>
                  <h4>{t.title}</h4>
                  <p className="muted">{t.description || 'No description.'}</p>
                  <p className="muted">Status: {t.status || 'todo'}</p>
                  <p className="muted">Assigned to: {t.assignee_name || 'Unassigned'}</p>
                  {canEditTasks && (
                    <div className="inline-form">
                      <select
                        value={t.status || 'todo'}
                        onChange={(e) => handleTaskStatusUpdate(t.id, e.target.value)}
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      <button className="btn small" type="button" onClick={() => handleTaskEdit(t)}>Edit</button>
                      <button className="btn small danger" type="button" onClick={() => handleTaskDelete(t.id)}>Delete</button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;