import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

// Parse JSON bodies
app.use(express.json());

// 🔹 Health check (optional but useful)
app.get('/', (req, res) => {
  res.send('Chowbot server is running 🚀');
});

// 🔹 Webhook verification endpoint (Meta / WhatsApp)
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log('Webhook verification request:', {
    mode,
    token,
    envToken: process.env.VERIFY_TOKEN,
  });

  if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
    console.log('✅ Webhook verified successfully');
    return res.status(200).send(challenge);
  }

  console.log('❌ Webhook verification failed');
  return res.sendStatus(403);
});

// 🔹 Webhook POST endpoint (messages will come here later)
app.post('/webhook', (req, res) => {
  console.log('Incoming webhook event:', JSON.stringify(req.body, null, 2));
  res.sendStatus(200);
});

// 🔹 Start server
app.listen(PORT, () => {
  console.log(`✅ Chowbot server running on port ${PORT}`);
});
