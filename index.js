require("dotenv").config();
const express = require("express");
const twilio = require("twilio");

const app = express();
app.use(express.json());

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

app.post("/send", async (req, res) => {
  try {
    const { to, message } = req.body;

    const response = await client.messages.create({
      from: "whatsapp:+14155238886", // Twilio Sandbox number
      to: `whatsapp:${to}`,
      body: message
    });

    res.json({ success: true, sid: response.sid });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/", (req, res) => {
  res.send("Twilio server running 🚀");
});


app.post("/webhook", (req, res) => {
  // const twilio = require("twilio");
  const twiml = new twilio.twiml.MessagingResponse();

  const message = req.body.Body?.toLowerCase();

  if (message === "hi") {
    twiml.message("Hello 👋 Welcome!");
  } else if (message === "menu") {
    twiml.message("1️⃣ Rice\n2️⃣ Pizza\n3️⃣ Burger");
  } else {
    twiml.message("Send 'menu' to see options.");
  }

  res.type("text/xml");
  res.send(twiml.toString());
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));