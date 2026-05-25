import express from 'express';
import cors from 'cors';
import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const client = createClient({
  url: process.env.TEAM_DB_URL || '',
  authToken: process.env.TEAM_DB_AUTH_TOKEN || '',
});

const runQuery = async (sql, params = []) => {
  try {
    const result = await client.execute({ sql, args: params });
    return result.rows;
  } catch (error) {
    console.error('Error running query:', error);
    throw error;
  }
};

// Auth middleware (simple for CEO)
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader === 'Bearer ceo-access-token') {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

app.get('/api/clients', authMiddleware, async (req, res) => {
  try {
    const clients = await runQuery("SELECT * FROM clients ORDER BY created_at DESC");
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/clients/:id', authMiddleware, async (req, res) => {
  try {
    const clients = await runQuery("SELECT * FROM clients WHERE id = ?", [req.params.id]);
    res.json(clients[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/stats', authMiddleware, async (req, res) => {
  try {
    const totalClients = await runQuery("SELECT COUNT(*) as count FROM clients");
    const activeClients = await runQuery("SELECT COUNT(*) as count FROM clients WHERE status = 'active'");
    const pendingInquiries = await runQuery("SELECT COUNT(*) as count FROM concierge_inquiries WHERE status = 'new'");
    
    res.json({
      totalClients: totalClients[0].count,
      activeClients: activeClients[0].count,
      pendingInquiries: pendingInquiries[0].count,
      monthlyRevenue: 0 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/inquiries', authMiddleware, async (req, res) => {
  try {
    const inquiries = await runQuery("SELECT * FROM concierge_inquiries ORDER BY created_at DESC LIMIT 10");
    res.json(inquiries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Client Portal endpoints
app.get('/api/client/profile', async (req, res) => {
  const clientId = req.headers['client-id'];
  if (!clientId) return res.status(400).json({ error: 'Missing client-id header' });
  try {
    const clients = await runQuery("SELECT * FROM clients WHERE id = ?", [clientId]);
    res.json(clients[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/client/milestones', async (req, res) => {
  const clientId = req.headers['client-id'];
  try {
    const milestones = await runQuery("SELECT * FROM project_milestones WHERE client_id = ? ORDER BY id ASC", [clientId]);
    res.json(milestones);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/client/milestones/:id/approve', async (req, res) => {
  const clientId = req.headers['client-id'];
  try {
    await runQuery("UPDATE project_milestones SET status = 'approved', approved_at = CURRENT_TIMESTAMP WHERE id = ? AND client_id = ?", [req.params.id, clientId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/client/invoices', async (req, res) => {
  const clientId = req.headers['client-id'];
  try {
    const invoices = await runQuery("SELECT * FROM invoices WHERE client_id = ? ORDER BY due_date DESC", [clientId]);
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/client/change-requests', async (req, res) => {
  const clientId = req.headers['client-id'];
  const { title, description } = req.body;
  try {
    await runQuery("INSERT INTO change_requests (client_id, title, description) VALUES (?, ?, ?)", [clientId, title, description]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/client/change-requests', async (req, res) => {
  const clientId = req.headers['client-id'];
  try {
    const requests = await runQuery("SELECT * FROM change_requests WHERE client_id = ? ORDER BY created_at DESC", [clientId]);
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
