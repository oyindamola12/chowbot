import express from 'express';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import bodyParser from 'body-parser';

dotenv.config();

const PORT = process.env.PORT;
const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

app.get('/', (req, res) => {
  res.send('Chownow webhook server is running!');
});

app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook verified');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

app.post('/webhook', (req, res) => {
  console.log(JSON.stringify(req.body, null, 2));
  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
