import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT =process.env.PORT;

// Parse JSON bodies
app.use(express.json());

// 🔹 Health check (optional but useful)
app.get('/', (req, res) => {
  res.send('Chowbot server is running 🚀');
});
let lastWhatsappMessage = null;


// =====================
// POST – WhatsApp hook
// =====================
app.post('/webhook', (req, res) => {
  console.log('📩 Incoming WhatsApp message');
  console.log(JSON.stringify(req.body, null, 2));

  lastWhatsappMessage = req.body;

  res.sendStatus(200);
});

// =====================
// GET – View last msg
// =====================
app.get('/last-message', (req, res) => {
  if (!lastWhatsappMessage) {
    return res.send('<h3>No WhatsApp message received yet</h3>');
  }

  res.send(`
    <h2>📩 Last WhatsApp Message</h2>
    <pre>${JSON.stringify(lastWhatsappMessage, null, 2)}</pre>
  `);
});


// 🔹 Start server
app.listen(PORT, () => {
  console.log(`✅ Chowbot server running on port ${PORT}`);
});
