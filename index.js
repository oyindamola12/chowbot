import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'public')));

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
let allMessages = [];

// ======================
// Pages
// ======================
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.get('/privacy-policy', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/privacy.html'));
});

app.get('/data-deletion', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/deletion.html'));
});

app.get('/terms', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/terms.html'));
});

// ======================
// Webhook Verify (GET)
// ======================
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log('VERIFY DEBUG →', { mode, token, challenge });

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

// ======================
// Webhook Messages (POST)
// ======================
app.post('/webhook', (req, res) => {
  const entry = req.body.entry?.[0];
  const changes = entry?.changes?.[0];
  const messages = changes?.value?.messages;

  if (messages) {
    messages.forEach(msg => {
      allMessages.push({
        from: msg.from,
        text: msg.text?.body,
        timestamp: msg.timestamp
      });
    });
  }

  res.sendStatus(200);
});

// ======================
// View messages
// ======================
app.get('/last-message', (req, res) => {
  res.send(`
    <h2>📩 WhatsApp Messages Received</h2>
    <pre>${JSON.stringify(allMessages, null, 2)}</pre>
  `);
});

// ======================
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
