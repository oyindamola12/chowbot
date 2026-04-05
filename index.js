const express = require("express");
const twilio = require("twilio");
const menus = require("./menus");
const db = require("./firestore");
const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
require("dotenv").config();



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

app.post("/webhook", async (req, res) => {
  const twiml = new twilio.twiml.MessagingResponse();
  const message = req.body.Body?.trim().toLowerCase() || "";
  console.log("Incoming:", message);

if (message.startsWith("menu_")) {
  const slug = message.replace("menu_", "");
  sendMenu(slug, twiml, res);
  return;
}

  if (message === "hi") {
    twiml.message("Welcome 👋 Send 1 for Lekki, 2 for Yaba.");
  } else {
    twiml.message("Send 'hi' to start 🍽");
  }

  res.type("text/xml");
  res.send(twiml.toString());
});

app.get("/test-db", async (req, res) => {
  try {
    await db.collection("test").add({
      name: "Chowbot",
      createdAt: new Date()
    });

    res.send("Firestore working ✅");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error");
  }
});
function sendMenu(slug, twiml, res) {

  const restaurant = menus[slug];

  if (!restaurant) {
    twiml.message("Restaurant not found.");
  } else {

    let text = `🍽 ${restaurant.name} Menu\n\n`;

    restaurant.menu.forEach((item) => {
      text += `${item.id}️⃣ ${item.name} – ₦${item.price}\n`;
    });

    text += "\nReply with item number.";

    twiml.message(text);
  }

  res.type("text/xml");
  res.send(twiml.toString());
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));