import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();
const app = express();
app.use(express.json());
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'public')));

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
let allMessages = [];

// ======================
// Pages
// ======================


async function sendWhatsAppMessage(to, message) {
  const url = `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`;

  const body = {
    messaging_product: "whatsapp",
    to: to.replace('+', ''), // remove +
    type: "text",
    text: {
      body: message
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const data = await response.json();
  console.log('SEND RESPONSE:', data);
  return data;
}


// Example usage
// sendWhatsAppMessage('+2349078757814', 'Hello from your app!')
//   .catch(console.error);
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.get('/privacy-policy', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/privacy.html'));
});

app.get('/data-deletion', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/deletion.html'));
});

// POST endpoint for actual deletion request
app.post('/data-deletion', (req, res) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return res.status(400).send('Phone number is required');
  }

  // TODO: Remove user data from your database
  // Example:
  // db.collection('users').doc(phoneNumber).delete();

  return res.status(200).send('Your data has been deleted.');
});

app.get('/terms', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/terms.html'));
});

// ======================
// Webhook Verify (GET)
// ======================
// app.post('/webhook', (req, res) => {
//   const entry = req.body.entry?.[0];
//   const change = entry?.changes?.[0];
//   const value = change?.value;
//   const message = value?.messages?.[0];

//   // Ignore non-user messages
//   if (!message || message.type !== 'text') {
//     return res.sendStatus(200);
//   }

//   const from = message.from;
//   const text = message.text.body;

//   console.log('📩 USER MESSAGE:', from, text);

//   // respond
//   sendMessage(from, `You said: ${text}`);

//   res.sendStatus(200);
// });
app.post('/webhook', async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;

    // Ignore statuses
    if (value?.statuses) {
      console.log('ℹ️ STATUS UPDATE:', value.statuses[0].status);
      return res.sendStatus(200);
    }

    const message = value?.messages?.[0];

    if (!message || message.type !== 'text') {
      return res.sendStatus(200);
    }

    const from = message.from;
    const text = message.text.body.toLowerCase();

    console.log('📩 USER MESSAGE:', from, text);

    // Simple replies
    if (text === 'hi' || text === 'hello') {
      await sendWhatsAppMessage(from, '👋 Welcome to Chowbot!\nType MENU to see options.');
    } 
    else if (text === 'menu') {
      await sendWhatsAppMessage(
        from,
        '🍔 MENU\n1️⃣ Burger\n2️⃣ Shawarma\nReply with number'
      );
    } 
    else {
      await sendWhatsAppMessage(from, `You said: ${text}`);
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('❌ WEBHOOK ERROR:', error);
    res.sendStatus(500);
  }
});

// ======================
// Webhook Messages (POST)
// ======================
// app.post('/webhook', (req, res) => {
//   const entry = req.body.entry?.[0];
//   const change = entry?.changes?.[0];
//   const value = change?.value;

//   // 1️⃣ Incoming user message
//   const message = value?.messages?.[0];

//   // 2️⃣ Message status update
//   const status = value?.statuses?.[0];

//   if (message) {
//     const from = message.from;
//     const type = message.type;

//     if (type === 'text') {
//       const text = message.text.body;
//       console.log('📩 USER MESSAGE:', from, text);

//       // reply
//       sendMessage(from, `You said: ${text}`);
//     }
//   }

//   if (status) {
//     console.log('ℹ️ MESSAGE STATUS:', status.status);
//   }

//   res.sendStatus(200);
// });


app.post('/webhook', async (req, res) => {
  const { entry } = req.body

  if (!entry || entry.length === 0) {
    return res.status(400).send('Invalid Request')
  }

  const changes = entry[0].changes

  if (!changes || changes.length === 0) {
    return res.status(400).send('Invalid Request')
  }

  const statuses = changes[0].value.statuses ? changes[0].value.statuses[0] : null
  const messages = changes[0].value.messages ? changes[0].value.messages[0] : null

  if (statuses) {
    // Handle message status
    console.log(`
      MESSAGE STATUS UPDATE:
      ID: ${statuses.id},
      STATUS: ${statuses.status}
    `)
  }

  if (messages) {
    // Handle received messages
    if (messages.type === 'text') {
      if (messages.text.body.toLowerCase() === 'hello') {
        replyMessage(messages.from, 'Hello. How are you?', messages.id)
      }

      if (messages.text.body.toLowerCase() === 'list') {
        sendList(messages.from)
      }

      if (messages.text.body.toLowerCase() === 'buttons') {
        sendReplyButtons(messages.from)
      }
    }

    if (messages.type === 'interactive') {
      if (messages.interactive.type === 'list_reply') {
        sendMessage(messages.from, `You selected the option with ID ${messages.interactive.list_reply.id} - Title ${messages.interactive.list_reply.title}`)
      }

      if (messages.interactive.type === 'button_reply') {
        sendMessage(messages.from, `You selected the button with ID ${messages.interactive.button_reply.id} - Title ${messages.interactive.button_reply.title}`)
      }
    }
    
    console.log(JSON.stringify(messages, null, 2))
  }
  
  res.status(200).send('Webhook processed')
})
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
 
