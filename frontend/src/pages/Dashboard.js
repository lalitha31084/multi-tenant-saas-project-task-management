import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [projectForm, setProjectForm] = useState({ name: '', description: '' });
  const [taskForm, setTaskForm] = useState({ projectId: '', title: '', description: '', priority: 'medium' });
  const [selectedProject, setSelectedProject] = useState('');
  const [editingTaskId, setEditingTaskId] = useState('');
  
  const { user, logout } = useContext(AuthContext);
  const isAdmin = user?.role === 'tenant_admin' || user?.role === 'super_admin';

  useEffect(() => { fetchProjects(); }, []);
  useEffect(() => { if (selectedProject) fetchTasks(selectedProject); }, [selectedProject]);

  const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('saas_token')}` });

  const theme = {
    bg: '#0b1021',
    bg2: '#0f1629',
    card: '#151c32',
    cardSoft: '#1c2440',
    accent: '#7dd3fc',
    accent2: '#a78bfa',
    text: '#f8fbff',
    muted: '#c7d2e6',
    border: 'rgba(255, 255, 255, 0.08)',
    danger: '#ef4444',
    success: '#2dd4bf'
  };

  const s = {
    page: { backgroundColor: theme.bg, color: theme.text, minHeight: '100vh', fontFamily: 'Inter, sans-serif' },
    // --- NEW HEADER STYLES ---
    nav: { 
      height: '70px', background: theme.card, borderBottom: `1px solid ${theme.border}`, 
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px',
      position: 'sticky', top: 0, zIndex: 100
    },
    logo: { fontSize: '20px', fontWeight: '800', letterSpacing: '1px', background: `linear-gradient(to right, ${theme.accent}, ${theme.accent2})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
    userSection: { display: 'flex', alignItems: 'center', gap: '20px' },
    // --- LAYOUT STYLES ---
    container: { padding: '40px', display: 'grid', gridTemplateColumns: '320px 1fr', gap: '30px' },
    card: { background: theme.card, padding: '24px', borderRadius: '16px', border: `1px solid ${theme.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.3)' },
    input: { background: theme.bg2, border: `1px solid ${theme.border}`, color: theme.text, padding: '12px', borderRadius: '8px', width: '100%', marginBottom: '12px', boxSizing: 'border-box', outline: 'none' },
    btnPrimary: { background: `linear-gradient(135deg, ${theme.accent} 0%, #38bdf8 100%)`, color: theme.bg, fontWeight: '700', border: 'none', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', boxShadow: `0 4px 12px rgba(125, 211, 252, 0.2)` },
    btnDanger: { background: 'transparent', color: theme.danger, border: `1px solid ${theme.danger}44`, padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' },
    btnGhost: { background: 'transparent', border: `1px solid ${theme.border}`, color: theme.muted, padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
    projectItem: (isActive) => ({
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', borderRadius: '10px', cursor: 'pointer', marginBottom: '8px',
      background: isActive ? theme.cardSoft : 'transparent', border: `1px solid ${isActive ? theme.accent : 'transparent'}`, transition: '0.2s'
    })
  };

  // --- API LOGIC ---
  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/projects`, { headers: authHeader() });
      setProjects(res.data.data.projects);
      if (!selectedProject && res.data.data.projects.length > 0) setSelectedProject(res.data.data.projects[0].id);
    } catch (e) { console.error(e); }
  };

  const fetchTasks = async (id) => {
    setTasksLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/tasks/${id}/tasks`, { headers: authHeader() });
      setTasks(res.data.data.tasks);
    } catch (e) { console.error(e); } finally { setTasksLoading(false); }
  };

  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/api/projects`, projectForm, { headers: authHeader() });
      setProjectForm({ name: '', description: '' });
      fetchProjects();
    } catch (err) { alert('Creation failed'); }
  };

  const deleteProject = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete project?")) return;
    try {
      await axios.delete(`${API_BASE}/api/projects/${id}`, { headers: authHeader() });
      fetchProjects();
      if (selectedProject === id) setSelectedProject('');
    } catch (e) { alert("Delete failed"); }
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTaskId) await axios.patch(`${API_BASE}/api/tasks/${selectedProject}/tasks/${editingTaskId}`, taskForm, { headers: authHeader() });
      else await axios.post(`${API_BASE}/api/tasks/${selectedProject}/tasks`, taskForm, { headers: authHeader() });
      setTaskForm({ projectId: selectedProject, title: '', description: '', priority: 'medium' });
      setEditingTaskId(''); fetchTasks(selectedProject);
    } catch (err) { alert('Task error'); }
  };

  return (
    <div style={s.page}>
      {/* --- GLOBAL HEADER --- */}
      <nav style={s.nav}>
        <div style={s.logo}>WELCOME</div>
        <div style={s.userSection}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{user?.fullName || 'User'}</div>
            {/* <div style={{ fontSize: '11px', color: theme.success, fontWeight: 'bold' }}>● SYSTEM ONLINE</div> */}
          </div>
          <button style={s.btnGhost} onClick={logout}>Sign Out</button>
        </div>
      </nav>

      {/* --- MAIN CONTENT --- */}
      <div style={s.container}>
        
        {/* LEFT BAR */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {isAdmin && (
            <section style={s.card}>
              <h4 style={{ margin: '0 0 15px 0', color: theme.accent, fontSize: '14px' }}>CREATE PROJECT</h4>
              <form onSubmit={handleProjectSubmit}>
                <input style={s.input} placeholder="Project Name" value={projectForm.name} onChange={e => setProjectForm({...projectForm, name: e.target.value})} required />
                <button style={{ ...s.btnPrimary, width: '100%' }}>Launch</button>
              </form>
            </section>
          )}

          <section style={s.card}>
            <h4 style={{ margin: '0 0 15px 0', fontSize: '14px', color: theme.muted }}>MY PROJECTS</h4>
            {projects.map(p => (
              <div key={p.id} style={s.projectItem(selectedProject === p.id)} onClick={() => setSelectedProject(p.id)}>
                <span style={{ fontWeight: '500' }}>{p.name}</span>
                {isAdmin && <span style={{ color: theme.danger, cursor: 'pointer', fontSize: '18px' }} onClick={(e) => deleteProject(p.id, e)}>×</span>}
              </div>
            ))}
          </section>
        </div>

        {/* RIGHT CONTENT */}
        <section style={s.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <h2 style={{ margin: 0 }}>{projects.find(p => p.id === selectedProject)?.name || 'Select a Project'}</h2>
            <div style={{ fontSize: '13px', color: theme.muted }}>{tasks.length} Active Tasks</div>
          </div>

          {/* TASK CREATION BOX */}
          <div style={{ background: theme.bg2, padding: '20px', borderRadius: '12px', marginBottom: '30px', border: `1px dashed ${theme.border}` }}>
            <form onSubmit={handleTaskSubmit} style={{ display: 'flex', gap: '15px' }}>
              <input style={{ ...s.input, marginBottom: 0, flex: 2 }} placeholder="What needs to be done?" value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} required />
              <select style={{ ...s.input, marginBottom: 0, flex: 1 }} value={taskForm.priority} onChange={e => setTaskForm({...taskForm, priority: e.target.value})}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <button style={s.btnPrimary}>{editingTaskId ? 'Update' : 'Add Task'}</button>
            </form>
          </div>

          {/* TASK LIST */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {tasksLoading ? <p>Loading data streams...</p> : tasks.map(t => (
              <div key={t.id} style={{ ...s.card, background: theme.bg2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: theme.accent, fontWeight: '800', marginBottom: '4px' }}>{t.priority.toUpperCase()}</div>
                  <div style={{ fontWeight: '600', fontSize: '16px' }}>{t.title}</div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button style={{ background: 'transparent', border: 'none', color: theme.accent, cursor: 'pointer', fontWeight: 'bold' }} onClick={() => { setEditingTaskId(t.id); setTaskForm(t); }}>EDIT</button>
                  <button style={s.btnDanger} onClick={() => alert('Delete Logic here')}>DELETE</button>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};

export default Dashboard;