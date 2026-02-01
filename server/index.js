const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = require('./database');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// === COMPANIES ===
app.get('/api/companies', (req, res) => {
  const companies = db.prepare('SELECT * FROM companies ORDER BY name').all();
  res.json(companies);
});

app.post('/api/companies', (req, res) => {
  const { name, description, color } = req.body;
  const result = db.prepare('INSERT INTO companies (name, description, color) VALUES (?, ?, ?)').run(name, description, color || '#3B82F6');
  res.json({ id: result.lastInsertRowid, name, description, color });
});

app.put('/api/companies/:id', (req, res) => {
  const { name, description, color } = req.body;
  db.prepare('UPDATE companies SET name = ?, description = ?, color = ? WHERE id = ?').run(name, description, color, req.params.id);
  res.json({ success: true });
});

app.delete('/api/companies/:id', (req, res) => {
  db.prepare('DELETE FROM companies WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// === PROJECTS ===
app.get('/api/projects', (req, res) => {
  const projects = db.prepare(`
    SELECT p.*, c.name as company_name, c.color as company_color 
    FROM projects p 
    LEFT JOIN companies c ON p.company_id = c.id 
    ORDER BY p.created_at DESC
  `).all();
  res.json(projects);
});

app.post('/api/projects', (req, res) => {
  const { name, company_id, description, status } = req.body;
  const result = db.prepare('INSERT INTO projects (name, company_id, description, status) VALUES (?, ?, ?, ?)').run(name, company_id, description, status || 'active');
  res.json({ id: result.lastInsertRowid, ...req.body });
});

app.put('/api/projects/:id', (req, res) => {
  const { name, company_id, description, status } = req.body;
  db.prepare('UPDATE projects SET name = ?, company_id = ?, description = ?, status = ? WHERE id = ?').run(name, company_id, description, status, req.params.id);
  res.json({ success: true });
});

app.delete('/api/projects/:id', (req, res) => {
  db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// === ACTIVITIES ===
app.get('/api/activities', (req, res) => {
  const { date, company_id, project_id, limit } = req.query;
  let query = `
    SELECT a.*, c.name as company_name, c.color as company_color, p.name as project_name 
    FROM activities a 
    LEFT JOIN companies c ON a.company_id = c.id 
    LEFT JOIN projects p ON a.project_id = p.id 
    WHERE 1=1
  `;
  const params = [];
  
  if (date) {
    query += ' AND a.date = ?';
    params.push(date);
  }
  if (company_id) {
    query += ' AND a.company_id = ?';
    params.push(company_id);
  }
  if (project_id) {
    query += ' AND a.project_id = ?';
    params.push(project_id);
  }
  
  query += ' ORDER BY a.date DESC, a.created_at DESC';
  
  if (limit) {
    query += ' LIMIT ?';
    params.push(parseInt(limit));
  }
  
  const activities = db.prepare(query).all(...params);
  res.json(activities);
});

app.post('/api/activities', (req, res) => {
  const { title, description, company_id, project_id, category, duration_minutes, date, start_time, end_time, status } = req.body;
  const result = db.prepare(`
    INSERT INTO activities (title, description, company_id, project_id, category, duration_minutes, date, start_time, end_time, status) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(title, description, company_id || null, project_id || null, category || 'general', duration_minutes || 0, date || new Date().toISOString().split('T')[0], start_time, end_time, status || 'completed');
  res.json({ id: result.lastInsertRowid, ...req.body });
});

app.put('/api/activities/:id', (req, res) => {
  const { title, description, company_id, project_id, category, duration_minutes, date, start_time, end_time, status } = req.body;
  db.prepare(`
    UPDATE activities SET title = ?, description = ?, company_id = ?, project_id = ?, category = ?, duration_minutes = ?, date = ?, start_time = ?, end_time = ?, status = ? 
    WHERE id = ?
  `).run(title, description, company_id, project_id, category, duration_minutes, date, start_time, end_time, status, req.params.id);
  res.json({ success: true });
});

app.delete('/api/activities/:id', (req, res) => {
  db.prepare('DELETE FROM activities WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// === EMPLOYEES ===
app.get('/api/employees', (req, res) => {
  const employees = db.prepare(`
    SELECT e.*, c.name as company_name 
    FROM employees e 
    LEFT JOIN companies c ON e.company_id = c.id 
    ORDER BY e.name
  `).all();
  res.json(employees);
});

app.post('/api/employees', (req, res) => {
  const { name, email, role, company_id } = req.body;
  const result = db.prepare('INSERT INTO employees (name, email, role, company_id) VALUES (?, ?, ?, ?)').run(name, email, role, company_id);
  res.json({ id: result.lastInsertRowid, ...req.body });
});

app.delete('/api/employees/:id', (req, res) => {
  db.prepare('DELETE FROM employees WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// === STATS ===
app.get('/api/stats', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const stats = {
    today: db.prepare('SELECT COUNT(*) as count, SUM(duration_minutes) as minutes FROM activities WHERE date = ?').get(today),
    week: db.prepare('SELECT COUNT(*) as count, SUM(duration_minutes) as minutes FROM activities WHERE date >= ?').get(weekAgo),
    month: db.prepare('SELECT COUNT(*) as count, SUM(duration_minutes) as minutes FROM activities WHERE date >= ?').get(monthAgo),
    byCompany: db.prepare(`
      SELECT c.name, c.color, COUNT(a.id) as count, SUM(a.duration_minutes) as minutes 
      FROM companies c 
      LEFT JOIN activities a ON c.id = a.company_id AND a.date >= ?
      GROUP BY c.id
    `).all(monthAgo),
    byCategory: db.prepare(`
      SELECT category, COUNT(*) as count, SUM(duration_minutes) as minutes 
      FROM activities WHERE date >= ?
      GROUP BY category
    `).all(monthAgo),
    recentActivities: db.prepare(`
      SELECT a.*, c.name as company_name, c.color as company_color 
      FROM activities a 
      LEFT JOIN companies c ON a.company_id = c.id 
      ORDER BY a.date DESC, a.created_at DESC 
      LIMIT 10
    `).all(),
    totalCompanies: db.prepare('SELECT COUNT(*) as count FROM companies').get().count,
    totalProjects: db.prepare('SELECT COUNT(*) as count FROM projects WHERE status = "active"').get().count,
    totalEmployees: db.prepare('SELECT COUNT(*) as count FROM employees').get().count
  };
  
  res.json(stats);
});

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 John Link running on http://localhost:${PORT}`);
});
