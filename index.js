const express = require("express");
const twilio = require("twilio");
const menus = require("./menus");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
// const db = require("./firestore");
const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
require("dotenv").config();

const sessions = {};
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
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


// app.post("/webhook", async (req, res) => {
//   const twiml = new twilio.twiml.MessagingResponse();

//   const from = req.body.From;
//   const message = req.body.Body?.trim().toLowerCase() || "";

//   console.log("Incoming:", message);

//   // SESSION INIT
//   if (!sessions[from]) {
//     sessions[from] = {
//       cart: [],
//       step: "start",
//       restaurant: null,
//       total: 0
//     };
//   }

//   const user = sessions[from];

//   // 🟢 START
//   if (message === "hi") {
//     twiml.message("🍽 Welcome!\n\nType:\nmenu_mamaput");
//   }

//   // 🟢 OPEN MENU
//   else if (message.startsWith("menu_")) {
//     const slug = message.replace("menu_", "");

//     user.restaurant = slug;

//     await sendMenu(slug, twiml, res);
//     return;
//   }

//   // 🟢 ADD ITEM TO CART
//   else if (!isNaN(message) && user.restaurant) {
//     const menu = await getMenu(user.restaurant);

//     const item = menu.find(i => i.id == message);

//     if (item) {
//       user.cart.push(item);

//       twiml.message(
//         `✅ ${item.name} added\n\nType another number to add more or type 'checkout'`
//       );
//     } else {
//       twiml.message("Invalid item.");
//     }
//   }

//   // 🟢 CHECKOUT
//   else if (message === "checkout") {
//     if (user.cart.length === 0) {
//       twiml.message("Cart is empty.");
//     } else {
//       let text = "🧾 Your Order:\n\n";
//       let total = 0;

//       user.cart.forEach(item => {
//         text += `${item.name} – ₦${item.price}\n`;
//         total += item.price;
//       });

//       user.total = total;

//       text += `\nTotal: ₦${total}`;
//       text += `\n\nType PAY to confirm`;

//       twiml.message(text);
//     }
//   }

//   // 🟢 PAYMENT (TEMP)
//   else if (message === "pay") {
//     twiml.message("✅ Order received! (Next: payment)");

//     user.cart = [];
//     user.step = "start";
//     user.restaurant = null;
//   }

//   // 🟢 DEFAULT
//   else {
//     twiml.message("Send 'hi' to start 🍽");
//   }

//   res.type("text/xml");
//   res.send(twiml.toString());
// });

app.post("/webhook", async (req, res) => {
  const twiml = new twilio.twiml.MessagingResponse();

  const from = req.body.From;
  const message = req.body.Body?.trim().toLowerCase() || "";

  console.log("Incoming:", message);

  // ✅ INIT SESSION
  if (!sessions[from]) {
    sessions[from] = {
      cart: [],
      step: "start",
      restaurant: null,
      total: 0
    };
  }

  const user = sessions[from];

  try {
    // 🟢 START
    if (message === "hi") {
      user.cart = [];
      user.restaurant = null;

      twiml.message("🍽 Welcome!\n\nType:\nmenu_mamaput");
    }

    // 🟢 OPEN MENU
    else if (message.startsWith("menu_")) {
      const slug = message.replace("menu_", "").trim();

      const menu = await getMenu(slug);

      if (!menu) {
        twiml.message("❌ Restaurant not found.");
      } else {
        user.restaurant = slug;
        await sendMenu(slug, twiml, res);
        return; // IMPORTANT
      }
    }

    // 🟢 ADD ITEM TO CART
    else if (!isNaN(message)) {
      if (!user.restaurant) {
        twiml.message("⚠️ Please select a restaurant first.\nType menu_mamaput");
      } else {
        const menu = await getMenu(user.restaurant);

        if (!menu) {
          twiml.message("❌ Menu not available.");
        } else {
          const item = menu.find(i => Number(i.id) === Number(message));

          if (item) {
            user.cart.push(item);

            twiml.message(
              `✅ ${item.name} added\n\n` +
              `Type another number to add more\n` +
              `or type 'checkout'`
            );
          } else {
            twiml.message("❌ Invalid item number.");
          }
        }
      }
    }

    // 🟢 CHECKOUT
    else if (message === "checkout") {
      if (user.cart.length === 0) {
        twiml.message("🛒 Cart is empty.");
      } else {
        let text = "🧾 Your Order:\n\n";
        let total = 0;

        user.cart.forEach(item => {
          text += `${item.name} – ₦${item.price}\n`;
          total += Number(item.price);
        });

        user.total = total;

        text += `\nTotal: ₦${total}`;
        text += `\n\nType PAY to confirm`;

        twiml.message(text);
      }
    }

    // 🟢 PAYMENT (TEMP)
    else if (message === "pay") {
      if (user.cart.length === 0) {
        twiml.message("⚠️ Your cart is empty.");
      } else {
        twiml.message("✅ Order received! (Next: payment integration)");

        // RESET
        user.cart = [];
        user.restaurant = null;
        user.total = 0;
        user.step = "start";
      }
    }

    // 🟢 RESET COMMAND (VERY USEFUL)
    else if (message === "reset") {
      sessions[from] = {
        cart: [],
        step: "start",
        restaurant: null,
        total: 0
      };

      twiml.message("🔄 Session reset. Type 'hi' to start again.");
    }

    // 🟢 DEFAULT
    else {
      twiml.message("Send 'hi' to start 🍽");
    }

    res.type("text/xml");
    res.send(twiml.toString());

  } catch (error) {
    console.error("Webhook error:", error);

    twiml.message("⚠️ Something went wrong. Please try again.");

    res.type("text/xml");
    res.send(twiml.toString());
  }
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

// async function getMenu(restaurantId) {
//   const doc = await db.collection("Menus").doc('mamaput').get();

//   if (!doc.exists) return null;

//   return doc.data().items;
// }

async function getMenu(restaurantId) {
  const doc = await db.collection("Menus").doc(restaurantId).get();

  if (!doc.exists) return null;

  return doc.data().items;
}
//  async function sendMenu(slug, twiml, res) {

//   // const restaurant = menus[slug];
//       const restaurant = await getMenu(slug);

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

// async function sendMenu(slug, twiml, res) {
//   try {
//     const menu = await getMenu(slug);
//     const restaurant = await getRestaurant(slug);

//     if (!menu || !restaurant) {
//       twiml.message("Restaurant not found.");
//     } else {
//       let text = `🍽 ${restaurant.name} Menu\n\n`;

//       menu.forEach((item) => {
//         text += `${item.id}️⃣ ${item.name} – ₦${item.price}\n`;
//       });

//       text += "\nReply with item number.";

//       twiml.message(text);
//     }

//     res.type("text/xml");
//     res.send(twiml.toString());

//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Error");
//   }
// }

// async function sendMenu(slug, twiml, res) {
//   try {
//     const menu = await getMenu(slug);

//     if (!menu) {
//       twiml.message("Restaurant not found.");
//     } else {
//       let text = `🍽 Menu\n\n`;

//       menu.forEach((item) => {
//         text += `${item.id}️⃣ ${item.name} – ₦${item.price}\n`;
//       });

//       text += "\nReply with item number.";

//       twiml.message(text);
//     }

//     res.type("text/xml");
//     res.send(twiml.toString());

//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Error");
//   }
// }


async function sendMenu(slug, twiml, res) {
  try {
    const menu = await getMenu(slug);

    if (!menu) {
      twiml.message("Restaurant not found.");
    } else {
      let text = `🍽 Menu\n\n`;

      menu.forEach((item) => {
        text += `${item.id}️⃣ ${item.name} – ₦${item.price}\n`;
      });

      text += "\nReply with item number.";

      twiml.message(text);
    }

    res.type("text/xml");
    res.send(twiml.toString());

  } catch (err) {
    console.error(err);
    res.status(500).send("Error");
  }
}
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));