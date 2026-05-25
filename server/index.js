import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const runTeamDb = async (sql) => {
  try {
    const { stdout, stderr } = await execPromise(`team-db "${sql.replace(/"/g, '\\"')}"`);
    if (stderr && !stdout) {
      throw new Error(stderr);
    }
    return JSON.parse(stdout);
  } catch (error) {
    console.error('Error running team-db:', error);
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
    const clients = await runTeamDb("SELECT * FROM clients ORDER BY created_at DESC");
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/clients/:id', authMiddleware, async (req, res) => {
  try {
    const client = await runTeamDb(`SELECT * FROM clients WHERE id = ${req.params.id}`);
    res.json(client[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/stats', authMiddleware, async (req, res) => {
  try {
    const totalClients = await runTeamDb("SELECT COUNT(*) as count FROM clients");
    const activeClients = await runTeamDb("SELECT COUNT(*) as count FROM clients WHERE status = 'active'");
    const pendingInquiries = await runTeamDb("SELECT COUNT(*) as count FROM concierge_inquiries WHERE status = 'new'");
    
    res.json({
      totalClients: totalClients[0].count,
      activeClients: activeClients[0].count,
      pendingInquiries: pendingInquiries[0].count,
      // Placeholder revenue since we don't have a payments table yet in the description
      monthlyRevenue: 0 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/inquiries', authMiddleware, async (req, res) => {
  try {
    const inquiries = await runTeamDb("SELECT * FROM concierge_inquiries ORDER BY created_at DESC LIMIT 10");
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
    const client = await runTeamDb(`SELECT * FROM clients WHERE id = ${clientId}`);
    res.json(client[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/client/milestones', async (req, res) => {
  const clientId = req.headers['client-id'];
  try {
    const milestones = await runTeamDb(`SELECT * FROM project_milestones WHERE client_id = ${clientId} ORDER BY id ASC`);
    res.json(milestones);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/client/milestones/:id/approve', async (req, res) => {
  const clientId = req.headers['client-id'];
  try {
    await runTeamDb(`UPDATE project_milestones SET status = 'approved', approved_at = CURRENT_TIMESTAMP WHERE id = ${req.params.id} AND client_id = ${clientId}`);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/client/invoices', async (req, res) => {
  const clientId = req.headers['client-id'];
  try {
    const invoices = await runTeamDb(`SELECT * FROM invoices WHERE client_id = ${clientId} ORDER BY due_date DESC`);
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/client/change-requests', async (req, res) => {
  const clientId = req.headers['client-id'];
  const { title, description } = req.body;
  try {
    await runTeamDb(`INSERT INTO change_requests (client_id, title, description) VALUES (${clientId}, '${title}', '${description}')`);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/client/change-requests', async (req, res) => {
  const clientId = req.headers['client-id'];
  try {
    const requests = await runTeamDb(`SELECT * FROM change_requests WHERE client_id = ${clientId} ORDER BY created_at DESC`);
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
