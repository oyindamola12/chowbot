// const express = require("express");
// const twilio = require("twilio");
// const menus = require("./menus");
// const db = require("./firestore");
// const app = express();
// app.use(express.urlencoded({ extended: false }));
// app.use(express.json());
// require("dotenv").config();
// const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

// app.post("/send", async (req, res) => {
//   try {
//     const { to, message } = req.body;

//     const response = await client.messages.create({
//       from: "whatsapp:+14155238886", // Twilio Sandbox number
//       to: `whatsapp:${to}`,
//       body: message
//     });

//     res.json({ success: true, sid: response.sid });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// });

// app.get("/", (req, res) => {
//   res.send("Twilio server running 🚀");
// });

// app.post("/webhook", async (req, res) => {
//   const twiml = new twilio.twiml.MessagingResponse();
//   const message = req.body.Body?.trim().toLowerCase() || "";
//   console.log("Incoming:", message);

// if (message.startsWith("menu_")) {
//   const slug = message.replace("menu_", "");
//   sendMenu(slug, twiml, res);
//   return;
// }

//   if (message === "hi") {
//     twiml.message("Welcome 👋 Send 1 for Lekki, 2 for Yaba.");
//   } else {
//     twiml.message("Send 'hi' to start 🍽");
//   }

//   res.type("text/xml");
//   res.send(twiml.toString());
// });

// app.get("/test-db", async (req, res) => {
//   try {
//     await db.collection("test").add({
//       name: "Chowbot",
//       createdAt: new Date()
//     });

//     res.send("Firestore working ✅");
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Error");
//   }
// });
// function sendMenu(slug, twiml, res) {

//   const restaurant = menus[slug];

//   if (!restaurant) {
//     twiml.message("Restaurant not found.");
//   } else {

//     let text = `🍽 ${restaurant.name} Menu\n\n`;

//     restaurant.menu.forEach((item) => {
//       text += `${item.id}️⃣ ${item.name} – ₦${item.price}\n`;
//     });

//     text += "\nReply with item number.";

//     twiml.message(text);
//   }

//   res.type("text/xml");
//   res.send(twiml.toString());
// }

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => console.log(`Server running on ${PORT}`));



const express = require("express");
const twilio = require("twilio");
const db = require("./firestore");
require("dotenv").config();

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

// =======================
// 🧠 SIMPLE SESSION STORE
// =======================
const sessions = {};

function getSession(user) {
  if (!sessions[user]) {
    sessions[user] = {
      step: "start",
      restaurant: null,
      cart: []
    };
  }
  return sessions[user];
}

// =======================
// 🔥 FIRESTORE FUNCTIONS
// =======================

// Get restaurant by ID
async function getRestaurantById(id) {
  const doc = await db.collection("restaurants").doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

// Get menu by restaurant ID
async function getMenu(id) {
  const doc = await db.collection("menus").doc(id).get();
  if (!doc.exists) return null;
  return doc.data().items;
}

// =======================
// 📤 SEND TEST MESSAGE
// =======================
app.post("/send", async (req, res) => {
  try {
    const { to, message } = req.body;

    const response = await client.messages.create({
      from: "whatsapp:+14155238886",
      to: `whatsapp:${to}`,
      body: message
    });

    res.json({ success: true, sid: response.sid });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// =======================
// 🤖 WEBHOOK (MAIN BOT)
// =======================
app.post("/webhook", async (req, res) => {
  const twiml = new twilio.twiml.MessagingResponse();

  const from = req.body.From;
  const message = req.body.Body?.trim().toLowerCase() || "";

  console.log("Incoming:", message);

  const user = getSession(from);

  // =======================
  // 🔗 QR FLOW (menu_slug)
  // =======================
  if (message.startsWith("menu_")) {
    const slug = message.replace("menu_", "");

    const restaurant = await getRestaurantById(slug);
    const menu = await getMenu(slug);

    if (!restaurant || !menu) {
      twiml.message("Restaurant not found.");
    } else {
      user.restaurant = slug;
      user.step = "menu";

      let text = `🍽 ${restaurant.name} Menu\n\n`;

      menu.forEach(item => {
        text += `${item.id}️⃣ ${item.name} – ₦${item.price}\n`;
      });

      text += "\nReply with item number or type checkout.";

      twiml.message(text);
    }

    return res.type("text/xml").send(twiml.toString());
  }

  // =======================
  // 👋 START
  // =======================
  if (message === "hi") {
    user.step = "choose_area";

    twiml.message(
      "Welcome 👋\nSelect location:\n1️⃣ Yaba\n2️⃣ Lekki"
    );
  }

  // =======================
  // 📍 SELECT AREA
  // =======================
  else if (user.step === "choose_area") {
    let area = "";

    if (message === "1") area = "yaba";
    if (message === "2") area = "lekki";

    if (!area) {
      twiml.message("Invalid option.");
    } else {
      user.step = "choose_restaurant";

      const snapshot = await db
        .collection("restaurants")
        .where("area", "==", area)
        .get();

      const list = [];

      snapshot.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() });
      });

      if (list.length === 0) {
        twiml.message("No restaurants found.");
      } else {
        user.availableRestaurants = list;

        let text = "🍽 Restaurants:\n\n";

        list.forEach((r, i) => {
          text += `${i + 1}️⃣ ${r.name}\n`;
        });

        text += "\nReply with number";

        twiml.message(text);
      }
    }
  }

  // =======================
  // 🍽 SELECT RESTAURANT
  // =======================
  else if (user.step === "choose_restaurant") {
    const index = parseInt(message) - 1;
    const selected = user.availableRestaurants?.[index];

    if (!selected) {
      twiml.message("Invalid option.");
    } else {
      user.restaurant = selected.id;
      user.step = "menu";

      const menu = await getMenu(selected.id);

      let text = `🍽 ${selected.name} Menu\n\n`;

      menu.forEach(item => {
        text += `${item.id}️⃣ ${item.name} – ₦${item.price}\n`;
      });

      text += "\nReply with item number or checkout";

      twiml.message(text);
    }
  }

  // =======================
  // 🛒 MENU + CART
  // =======================
  else if (user.step === "menu") {
    const menu = await getMenu(user.restaurant);

    const item = menu.find(i => i.id == message);

    if (item) {
      user.cart.push(item);

      twiml.message(
        `Added ${item.name} ✅\nType more or 'checkout'`
      );
    }

    else if (message === "checkout") {
      let total = user.cart.reduce((sum, i) => sum + i.price, 0);
      total += 200;

      user.total = total;
      user.step = "checkout";

      let summary = "🧾 Order\n\n";

      user.cart.forEach(i => {
        summary += `${i.name} – ₦${i.price}\n`;
      });

      summary += `\nFee: ₦200\nTotal: ₦${total}`;
      summary += `\n\nType PAY to continue`;

      twiml.message(summary);
    }

    else {
      twiml.message("Invalid option.");
    }
  }

  // =======================
  // 💳 PAYMENT STEP
  // =======================
  else if (user.step === "checkout") {
    if (message === "pay") {
      twiml.message("Payment link coming next… 💳");
    } else {
      twiml.message("Type PAY to proceed.");
    }
  }

  // =======================
  // ❌ DEFAULT
  // =======================
  else {
    twiml.message("Send 'hi' to start 🍽");
  }

  res.type("text/xml");
  res.send(twiml.toString());
});

// =======================
// 🔥 TEST DB
// =======================
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

// =======================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));