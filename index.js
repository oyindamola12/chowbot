require("dotenv").config();
const express = require("express");
const twilio = require("twilio");

const app = express();
app.use(express.urlencoded({ extended: false }));
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

// app.post("/webhook", (req, res) => {
//   // const twilio = require("twilio");
//   const twiml = new twilio.twiml.MessagingResponse();

//   const from = req.body.From;
//   const message = req.body.Body.trim();

//   if (!sessions[from]) {
//     sessions[from] = { step: "start", cart: [] };
//   }

//   const user = sessions[from];

//   if (user.step === "start") {
//     twiml.message(
//       "Welcome 👋 Choose restaurant:\n1️⃣ Mama Put\n2️⃣ Pizza Hub"
//     );
//     user.step = "choose_restaurant";
//   }

//   else if (user.step === "choose_restaurant") {
//     if (message === "1") {
//       user.restaurant = "Mama Put";
//       user.step = "menu";
//       twiml.message(
//         "Menu:\n1️⃣ Jollof Rice – ₦2000\n2️⃣ Fried Rice – ₦2500"
//       );
//     }
//   }

//   else if (user.step === "menu") {
//     if (message === "1") {
//       user.cart.push("Jollof Rice");
//       twiml.message("Added to cart ✅\nType checkout to pay.");
//     }
//   }

//   res.type("text/xml");
//   res.send(twiml.toString());
// });

app.post("/webhook", (req, res) => {
  const twiml = new twilio.twiml.MessagingResponse();

  const from = req.body.From;
  const message = req.body.Body?.trim().toLowerCase() || "";

  console.log("Incoming:", message);

  // 🔥 Simple test response
  if (message === "hi") {
    twiml.message("Welcome 👋 Send 1 for Lekki, 2 for Yaba.");
  } 
  else {
    twiml.message("Send 'hi' to start 🍽");
  }

  res.type("text/xml");
  res.send(twiml.toString());
});


function sendMenu(code, twiml, res) {
  const menus = {
    mamaput: [
      { name: "Jollof Rice", price: 2000 },
      { name: "Fried Rice", price: 2500 }
    ],
    pizzahub: [
      { name: "Pepperoni Pizza", price: 5000 },
      { name: "BBQ Pizza", price: 5500 }
    ]
  };

  const menu = menus[code];

  if (!menu) {
    twiml.message("Restaurant not found.");
  } else {
    let text = "🍽 Menu:\n\n";
    menu.forEach((item, i) => {
      text += `${i + 1}️⃣ ${item.name} – ₦${item.price}\n`;
    });
    text += "\nReply with item number.";

    twiml.message(text);
  }

  res.type("text/xml");
  res.send(twiml.toString());
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));