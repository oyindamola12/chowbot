
const express = require("express");
const twilio = require("twilio");

// Twilio credentials (store in Firebase environment variables)


const client = twilio(process.env.sid, process.env.token);


const app = express();
app.use(express.json()); // parse JSON body

// POST route to send WhatsApp message
app.post("/send-whatsapp", async (req, res) => {
  try {
    const { to, contentVariables } = req.body;

    if (!to || !contentVariables) {
      return res.status(400).send({ error: "Missing 'to' or 'contentVariables'" });
    }

    const message = await client.messages.create({
      from: "whatsapp:+14155238886", // Twilio sandbox number
      contentSid: "HXb5b62575e6e4ff6129ad7c8efe1f983e",
      contentVariables: JSON.stringify(contentVariables),
      to: `whatsapp:${to}`
    });

    return res.status(200).send({ success: true, sid: message.sid });
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    return res.status(500).send({ success: false, error: error.message });
  }
});

app.post("/inbound-whatsapp", (req, res) => {
  const incomingMsg = req.body.Body; // the text the user sent
  const from = req.body.From;

  console.log(`Message from ${from}: ${incomingMsg}`);

  res.send("<Response><Message>Thanks! We got your message.</Message></Response>");
});