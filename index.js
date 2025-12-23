// import express from 'express';
// import dotenv from 'dotenv';

// dotenv.config();

// const app = express();
// const PORT =process.env.PORT;

// // Parse JSON bodies
// app.use(express.json());

// // 🔹 Health check (optional but useful)
// app.get('/', (req, res) => {
//   res.send('Chowbot server is running 🚀');
// });
// let lastWhatsappMessage = null;


// // =====================
// // POST – WhatsApp hook
// // =====================
// app.post('/webhook', (req, res) => {
//   console.log('📩 Incoming WhatsApp message');
//   console.log(JSON.stringify(req.body, null, 2));

//   lastWhatsappMessage = req.body;

//   res.sendStatus(200);
// });

// // =====================
// // GET – View last msg
// // =====================
// app.get('/webhook', (req, res) => {
//   if (!lastWhatsappMessage) {
//     return res.send('<h3>No WhatsApp message received yet</h3>');
//   }

//   res.send(`
//     <h2>📩 Last WhatsApp Message</h2>
//     <pre>${JSON.stringify(lastWhatsappMessage, null, 2)}</pre>
//   `);
// });


// // 🔹 Start server
// app.listen(PORT, () => {
//   console.log(`✅ Chowbot server running on port ${PORT}`);
// });



import express from 'express';

const app = express();
app.use(express.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
let lastWhatsappMessage = null;
// ======================
// ROOT (optional check)
// ======================
app.get('/', (req, res) => {
  res.send('Chowbot is running 🚀');
});

// ======================
// GET – Webhook verify
// ======================
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log('VERIFY DEBUG →', { mode, token, challenge });

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }

  return res.status(403).send('Forbidden');
});

// ======================
// POST – WhatsApp msgs
// ======================
let allMessages = [];

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

app.get('/last-message', (req, res) => {
  res.send(`
    <h2>📩 WhatsApp Messages Received</h2>
    <pre>${JSON.stringify(allMessages, null, 2)}</pre>
  `);
});


// ======================
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
