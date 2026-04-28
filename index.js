// require("dotenv").config();
// const express = require("express");
// const twilio = require("twilio");
// const bodyParser = require("body-parser");
// const admin = require("firebase-admin");
// const axios = require("axios");
// const QRCode = require("qrcode");
// const cors = require("cors");

// const { v4: uuidv4 } = require("uuid");
// const app = express();
// app.use(express.urlencoded({ extended: false }));
// app.use(express.json());
// app.use(bodyParser.json());
// app.use(express.static("public"));
// app.use(cors());

// const sessions = {};

// // 🔥 FIREBASE
// const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

// const db = admin.firestore();

// // 🔥 TWILIO
// const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

// // =========================
// // 🔧 HELPERS
// // =========================

// const uuidRegex = /^[0-9a-fA-F-]{36}$/;

// // 🔹 GET MENU
// async function getMenu(id) {
//   const doc = await db.collection("menus").doc(id).get();
//   if (!doc.exists) return null;
//   return doc.data().items;
// }

// // 🔹 GET RESTAURANT
// async function getRestaurant(id) {
//   const doc = await db.collection("restaurants").doc(id).get();
//   return doc.exists ? doc.data() : null;
// }

// // 🔹 GET BY LOCATION
// async function getRestaurantsByLocation(area) {
//   const snapshot = await db
//     .collection("restaurants")
//     .where("location", "==", area.toLowerCase())
//     .get();

//   const list = [];
//   snapshot.forEach(doc => {
//     list.push({ id: doc.id, ...doc.data() });
//   });

//   return list;
// }

// // 🔹 SAVE ORDER
// async function saveOrder(order) {
//   const doc = await db.collection("orders").add({
//     ...order,
//     status: "pending",
//     createdAt: new Date()
//   });

//   return doc.id;
// }

// // 🔹 NOTIFY RESTAURANT
// async function notifyRestaurant(phone, message) {
//   try {
//     await client.messages.create({
//       from: "whatsapp:+14155238886",
//       to: `whatsapp:${phone}`,
//       body: message
//     });
//   } catch (err) {
//     console.error("Notify error:", err.message);
//   }
// }

// // 🔹 PAYMENT LINK
// async function createPaymentLink(email, amount, metadata) {
//   try {
//     const res = await axios.post(
//       "https://api.paystack.co/transaction/initialize",
//       {
//         email,
//         amount: amount * 100,
//         metadata
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
//           "Content-Type": "application/json"
//         }
//       }
//     );

//     return res.data.data.authorization_url;

//   } catch (err) {
//     console.error("Paystack Error:", err.response?.data || err.message);
//     return null;
//   }
// }

// // =========================
// // 🔥 SEND MENU (BUTTONS)
// // =========================

// async function sendMenuButtons(id, from) {
//   const menu = await getMenu(id);
//   const restaurant = await getRestaurant(id);

//   if (!menu || !restaurant) return;

//   const sections = [
//     {
//       title: "Menu",
//       rows: menu.map(item => ({
//         id: `item_${item.id}`,
//         title: item.name,
//         description: `₦${item.price}`
//       }))
//     },
//     {
//       title: "Checkout",
//       rows: [
//         {
//           id: "checkout",
//           title: "🧾 Checkout",
//           description: "View your order"
//         }
//       ]
//     }
//   ];

//   await client.messages.create({
//     from: "whatsapp:+14155238886",
//     to: from,
//     body: `🍽 ${restaurant.name}`,
//     interactive: {
//       type: "list",
//       body: { text: "Select an item" },
//       action: {
//         button: "View Menu",
//         sections
//       }
//     }
//   });
// }

// // =========================
// // 🔥 WEBHOOK
// // =========================

// app.post("/webhook", async (req, res) => {
//   const twiml = new twilio.twiml.MessagingResponse();

//   const from = req.body.From;
//   const message = req.body.Body?.trim().toLowerCase() || "";

//   // 🔥 BUTTON HANDLER
//   const buttonId =
//     req.body.ListResponse?.id ||
//     req.body.ButtonPayload ||
//     message;

//   if (!sessions[from]) {
//     sessions[from] = {
//       cart: [],
//       step: "start",
//       restaurant: null,
//       total: 0
//     };
//   }

//   const user = sessions[from];

//   try {

//     // =========================
//     // 🔗 QR FLOW
//     // =========================
//     if (message.startsWith("hi")) {
//       const parts = message.split(" ");
//       const id = parts[1];

//       if (id && uuidRegex.test(id)) {
//         user.restaurant = id;
//         user.cart = [];

//         await sendMenuButtons(id, from);
//         return res.sendStatus(200);
//       }

//       user.step = "ask_location";
//       twiml.message("📍 Enter your area (Lekki, Yaba)");
//     }

//     // =========================
//     // LOCATION
//     // =========================
//     else if (user.step === "ask_location") {
//       const restaurants = await getRestaurantsByLocation(message);

//       if (!restaurants.length) {
//         twiml.message("❌ No restaurants found.");
//       } else {
//         user.availableRestaurants = restaurants;
//         user.step = "choose_restaurant";

//         let text = "🍽 Restaurants:\n\n";
//         restaurants.forEach((r, i) => {
//           text += `${i + 1}️⃣ ${r.name}\n`;
//         });

//         twiml.message(text + "\nReply with number");
//       }
//     }

//     // =========================
//     // SELECT RESTAURANT
//     // =========================
//     else if (user.step === "choose_restaurant") {
//       const index = Number(message) - 1;
//       const selected = user.availableRestaurants[index];

//       if (!selected) {
//         twiml.message("❌ Invalid choice.");
//       } else {
//         user.restaurant = selected.id;
//         user.cart = [];

//         await sendMenuButtons(selected.id, from);
//         return res.sendStatus(200);
//       }
//     }

//     // =========================
//     // ITEM CLICK (BUTTON)
//     // =========================
//     else if (buttonId.startsWith("item_")) {
//       const itemId = buttonId.replace("item_", "");

//       const menu = await getMenu(user.restaurant);
//       const item = menu.find(i => String(i.id) === itemId);

//       if (!item) {
//         twiml.message("❌ Item not found");
//       } else {
//         user.cart.push(item);

//         // 🔥 SEND IMAGE
//         if (item.image) {
//           await client.messages.create({
//             from: "whatsapp:+14155238886",
//             to: from,
//             body: `${item.name} – ₦${item.price}`,
//             mediaUrl: [item.image]
//           });
//         }

//         // 🔁 SEND MENU AGAIN
//         await sendMenuButtons(user.restaurant, from);
//         return res.sendStatus(200);
//       }
//     }

//     // =========================
//     // CHECKOUT
//     // =========================
//     else if (buttonId === "checkout") {
//       if (!user.cart.length) {
//         twiml.message("🛒 Cart empty.");
//       } else {

//         let total = 0;
//         let summary = "🧾 Order:\n\n";

//         user.cart.forEach(item => {
//           summary += `${item.name} – ₦${item.price}\n`;
//           total += Number(item.price);
//         });

//         user.total = total;

//         const link = await createPaymentLink(
//           "user@email.com",
//           total,
//           {
//             phone: from,
//             restaurant: user.restaurant,
//             cart: JSON.stringify(user.cart)
//           }
//         );

//         twiml.message(
//           `${summary}\nTotal: ₦${total}\n\n💳 Pay:\n${link}`
//         );
//       }
//     }

//     else {
//       twiml.message("Send 'hi' to start");
//     }

//     res.type("text/xml").send(twiml.toString());

//   } catch (err) {
//     console.error(err);
//     twiml.message("⚠️ Error occurred.");
//     res.type("text/xml").send(twiml.toString());
//   }
// });

// // =========================
// // 💰 PAYSTACK WEBHOOK
// // =========================

// // 🔥 REGISTER RESTAURANT
// app.post("/register-restaurant", async (req, res) => {
//   try {
//     const { name, phone, location, deliveryFee } = req.body;

//     if (!name || !phone || !location) {
//       return res.status(400).json({ error: "Missing fields" });
//     }

//     const id = uuidv4();

//     // ✅ SAVE RESTAURANT
//     await db.collection("restaurants").doc(id).set({
//       name,
//       phone,
//       location: location.toLowerCase(),
//       deliveryFee: Number(deliveryFee || 0),
//       createdAt: new Date(),
//       active: true
//     });

//     // ✅ CREATE EMPTY MENU
//     await db.collection("menus").doc(id).set({
//       restaurantId: id,
//       items: []
//     });

//     // 🔗 WHATSAPP LINK
//     const whatsappLink = `https://wa.me/14155238886?text=hi%20${id}`;

//     res.json({
//       success: true,
//       restaurantId: id,
//       whatsappLink
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // app.post("/register-restaurant", async (req, res) => {
// //   try {
// //     const { name, phone, location, deliveryFee } = req.body;

// //     const doc = await db.collection("restaurants").add({
// //       name,
// //       phone,
// //       location: location.toLowerCase(),
// //       deliveryFee: Number(deliveryFee),
// //       createdAt: new Date()
// //     });

// //    const link = `https://wa.me/14155238886?text=hi${doc.id}`;

// //     res.json({
// //       success: true,
// //       restaurantId,
// //       whatsappLink:link
// //     });

// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).json({ error: "Failed to register" });
// //   }
// // });

// app.post("/paystack/webhook", express.json(), async (req, res) => {
//   const event = req.body;

//   if (event.event === "charge.success") {
//     const data = event.data;
//     const meta = data.metadata;

//     let cart = [];
//     try {
//       cart = JSON.parse(meta.cart);
//     } catch {}

//     const orderId = await saveOrder({
//       userPhone: meta.phone,
//       restaurantId: meta.restaurant,
//       items: cart,
//       total: data.amount / 100
//     });

//     const restaurant = await getRestaurant(meta.restaurant);

//     let msg = `📦 Paid Order!\n\n`;

//     cart.forEach(i => {
//       msg += `${i.name} – ₦${i.price}\n`;
//     });

//     msg += `\nTotal: ₦${data.amount / 100}`;
//     msg += `\nCustomer: ${meta.phone}`;
//     msg += `\nOrder ID: ${orderId}`;

//     if (restaurant?.phone) {
//       await notifyRestaurant(restaurant.phone, msg);
//     }
//   }

//   res.sendStatus(200);
// });

// app.get("/restaurant-qr/:id", async (req, res) => {
//   const id = req.params.id;

//   const link = `https://wa.me/14155238886?text=hi%20${id}`;

//   const qr = await QRCode.toDataURL(link);

//   res.send(`
//     <h2>Scan to Order</h2>
//     <img src="${qr}" />
//     <p>${link}</p>
//   `);
// });
// // =========================

// // =========================
// // 🍽 SAVE MENU
// // =========================
// app.post("/save-menu", async (req, res) => {
//   try {
//     const { restaurantId, items } = req.body;

//     if (!restaurantId || !items) {
//       return res.status(400).json({ error: "Missing data" });
//     }

//     await db.collection("menus").doc(restaurantId).set({
//       restaurantId,
//       items,
//       updatedAt: new Date()
//     });

//     res.json({ success: true });

//   } catch (err) {
//     console.error("Save menu error:", err);
//     res.status(500).json({ error: "Failed to save menu" });
//   }
// });


// // =========================
// // 📥 GET MENU (FOR BOT)
// // =========================
// app.get("/menu/:id", async (req, res) => {
//   try {
//     const id = req.params.id;

//     const doc = await db.collection("menus").doc(id).get();

//     if (!doc.exists) {
//       return res.status(404).json({ error: "Menu not found" });
//     }

//     res.json(doc.data());

//   } catch (err) {
//     console.error("Get menu error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });


// // =========================
// // 🏪 GET RESTAURANT
// // =========================
// app.get("/restaurant/:id", async (req, res) => {
//   try {
//     const id = req.params.id;

//     const doc = await db.collection("restaurants").doc(id).get();

//     if (!doc.exists) {
//       return res.status(404).json({ error: "Restaurant not found" });
//     }

//     res.json(doc.data());

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// });


// app.post("/add-item", async (req, res) => {
//   const { restaurantId, name, price, image } = req.body;

//   try {
//     const doc = await db
//       .collection("menus")
//       .doc(restaurantId)
//       .collection("items")
//       .add({
//         name,
//         price: Number(price),
//         image,
//         createdAt: new Date()
//       });

//     res.json({ success: true, id: doc.id });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to add item" });
//   }
// });

// async function getMenu(restaurantId) {
//   const snapshot = await db
//     .collection("menus")
//     .doc(restaurantId)
//     .collection("items")
//     .get();

//   const items = [];

//   snapshot.forEach(doc => {
//     items.push({
//       id: doc.id,
//       ...doc.data()
//     });
//   });

//   return items;
// }
// app.get("/get-menu/:restaurantId", async (req, res) => {
//   const { restaurantId } = req.params;

//   try {
//     const snapshot = await db
//       .collection("menus")
//       .doc(restaurantId)
//       .collection("items")
//       .get();

//     const items = [];

//     snapshot.forEach(doc => {
//       items.push({ id: doc.id, ...doc.data() });
//     });

//     res.json(items);

//   } catch (err) {
//     res.status(500).json({ error: "Failed to fetch menu" });
//   }
// });



// app.post("/update-item", async (req, res) => {
//   const { restaurantId, itemId, name, price, image } = req.body;

//   try {
//     await db
//       .collection("menus")
//       .doc(restaurantId)
//       .collection("items")
//       .doc(itemId)
//       .update({
//         name,
//         price: Number(price),
//         image
//       });

//     res.json({ success: true });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Update failed" });
//   }
// });


// app.post("/delete-item", async (req, res) => {
//   const { restaurantId, itemId } = req.body;

//   try {
//     await db
//       .collection("menus")
//       .doc(restaurantId)
//       .collection("items")
//       .doc(itemId)
//       .delete();

//     res.json({ success: true });

//   } catch (err) {
//     res.status(500).json({ error: "Delete failed" });
//   }
// });
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));



require("dotenv").config();

const express = require("express");
const twilio = require("twilio");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const axios = require("axios");
const QRCode = require("qrcode");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(bodyParser.json());
app.use(express.static("public"));
app.use(cors());

const sessions = {};

// =========================
// 🔥 FIREBASE
// =========================
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// =========================
// 🔥 TWILIO
// =========================
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

// =========================
// 🔧 HELPERS
// =========================

// ✅ GET MENU (SUBCOLLECTION)
async function getMenu(restaurantId) {
  const snapshot = await db
    .collection("menus")
    .doc(restaurantId)
    .collection("items")
    .get();

  const items = [];

  snapshot.forEach(doc => {
    items.push({
      id: doc.id,
      ...doc.data()
    });
  });

  return items;
}

// ✅ GET RESTAURANT
async function getRestaurant(id) {
  const doc = await db.collection("restaurants").doc(id).get();
  return doc.exists ? doc.data() : null;
}

// ✅ GET RESTAURANTS BY LOCATION
async function getRestaurantsByLocation(area) {
  const snapshot = await db
    .collection("restaurants")
    .where("location", "==", area.toLowerCase())
    .get();

  const list = [];
  snapshot.forEach(doc => {
    list.push({ id: doc.id, ...doc.data() });
  });

  return list;
}

// ✅ SAVE ORDER
async function saveOrder(order) {
  const doc = await db.collection("orders").add({
    ...order,
    status: "pending",
    createdAt: new Date()
  });

  return doc.id;
}

// ✅ NOTIFY RESTAURANT
async function notifyRestaurant(phone, message) {
  await client.messages.create({
    from: "whatsapp:+14155238886",
    to: `whatsapp:${phone}`,
    body: message
  });
}

// ✅ PAYMENT LINK
async function createPaymentLink(email, amount, metadata) {
  try {
    const res = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: amount * 100,
        metadata
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
          "Content-Type": "application/json"
        }
      }
    );

    return res.data.data.authorization_url;
  } catch (err) {
    console.error(err.response?.data || err.message);
    return null;
  }
}

// =========================
// 🔥 SEND MENU (WHATSAPP)
// =========================
async function sendMenuButtons(restaurantId, from) {
  const menu = await getMenu(restaurantId);
  const restaurant = await getRestaurant(restaurantId);

  if (!menu.length || !restaurant) return;

  const sections = [
    {
      title: "Menu",
      rows: menu.map(item => ({
        id: `item_${item.id}`,
        title: item.name,
        description: `₦${item.price}`
      }))
    },
    {
      title: "Checkout",
      rows: [
        {
          id: "checkout",
          title: "🧾 Checkout",
          description: "View order"
        }
      ]
    }
  ];

  await client.messages.create({
    from: "whatsapp:+14155238886",
    to: from,
    body: `🍽 ${restaurant.name}`,
    interactive: {
      type: "list",
      body: { text: "Select item" },
      action: {
        button: "View Menu",
        sections
      }
    }
  });
}

// =========================
// 🔥 WEBHOOK (CHATBOT)
// =========================
app.post("/webhook", async (req, res) => {
  const twiml = new twilio.twiml.MessagingResponse();

  const from = req.body.From;
  const message = req.body.Body?.trim().toLowerCase() || "";
  const buttonId =
    req.body.ListResponse?.id ||
    req.body.ButtonPayload ||
    message;

  if (!sessions[from]) {
    sessions[from] = {
      cart: [],
      restaurant: null,
      step: "start",
      total: 0
    };
  }

  const user = sessions[from];

  try {
    // START
    if (message.startsWith("hi")) {
      const id = message.split(" ")[1];

      if (id) {
        user.restaurant = id;
        user.cart = [];

        await sendMenuButtons(id, from);
        return res.sendStatus(200);
      }

      user.step = "location";
      twiml.message("📍 Enter your area (Lekki, Yaba)");
    }

    // LOCATION
    else if (user.step === "location") {
      const list = await getRestaurantsByLocation(message);

      if (!list.length) {
        twiml.message("❌ No restaurants found");
      } else {
        user.available = list;
        user.step = "choose";

        let text = "🍽 Restaurants:\n\n";
        list.forEach((r, i) => {
          text += `${i + 1}. ${r.name}\n`;
        });

        twiml.message(text + "\nReply with number");
      }
    }

    // SELECT RESTAURANT
    else if (user.step === "choose") {
      const index = Number(message) - 1;
      const selected = user.available[index];

      if (!selected) {
        twiml.message("❌ Invalid choice");
      } else {
        user.restaurant = selected.id;
        user.cart = [];

        await sendMenuButtons(selected.id, from);
        return res.sendStatus(200);
      }
    }

    // ADD ITEM
    else if (buttonId.startsWith("item_")) {
      const itemId = buttonId.replace("item_", "");

      const menu = await getMenu(user.restaurant);
      const item = menu.find(i => i.id === itemId);

      if (!item) {
        twiml.message("❌ Item not found");
      } else {
        user.cart.push(item);

        if (item.image) {
          await client.messages.create({
            from: "whatsapp:+14155238886",
            to: from,
            body: `${item.name} – ₦${item.price}`,
            mediaUrl: [item.image]
          });
        }

        await sendMenuButtons(user.restaurant, from);
        return res.sendStatus(200);
      }
    }

    // CHECKOUT
    else if (buttonId === "checkout") {
      let total = 0;
      let text = "🧾 Order:\n\n";

      user.cart.forEach(i => {
        text += `${i.name} – ₦${i.price}\n`;
        total += Number(i.price);
      });

      const link = await createPaymentLink("user@email.com", total, {
        phone: from,
        restaurant: user.restaurant,
        cart: JSON.stringify(user.cart)
      });

      twiml.message(`${text}\nTotal: ₦${total}\n\n💳 Pay:\n${link}`);
    }

    else {
      twiml.message("Send 'hi' to start");
    }

    res.type("text/xml").send(twiml.toString());

  } catch (err) {
    console.error(err);
    twiml.message("⚠️ Error");
    res.type("text/xml").send(twiml.toString());
  }
});

// =========================
// 🏪 REGISTER RESTAURANT
// =========================
app.post("/register-restaurant", async (req, res) => {
  try {
    const { name, phone, location, deliveryFee } = req.body;

    if (!name || !phone || !location) {
      return res.status(400).json({ error: "Missing fields" });
    }

    // CHECK DUPLICATE
    const existing = await db
      .collection("restaurants")
      .where("phone", "==", phone)
      .get();

    if (!existing.empty) {
      const id = existing.docs[0].id;

      return res.json({
        success: true,
        restaurantId: id,
        whatsappLink: `https://wa.me/14155238886?text=hi%20${id}`
      });
    }

    const id = uuidv4();

    await db.collection("restaurants").doc(id).set({
      name,
      phone,
      location: location.toLowerCase(),
      deliveryFee: Number(deliveryFee || 0),
      createdAt: new Date()
    });

    await db.collection("menus").doc(id).set({ createdAt: new Date() });

    res.json({
      success: true,
      restaurantId: id,
      whatsappLink: `https://wa.me/14155238886?text=hi%20${id}`
    });

  } catch (err) {
    res.status(500).json({ error: "Error" });
  }
});

// =========================
// 🍽 MENU CRUD
// =========================

// ADD
app.post("/add-item", async (req, res) => {
  const { restaurantId, name, price, image } = req.body;

  const doc = await db
    .collection("menus")
    .doc(restaurantId)
    .collection("items")
    .add({
      name,
      price: Number(price),
      image
    });

  res.json({ id: doc.id });
});

// GET
app.get("/get-menu/:id", async (req, res) => {
  const menu = await getMenu(req.params.id);
  res.json(menu);
});

// UPDATE
app.post("/update-item", async (req, res) => {
  const { restaurantId, itemId, name, price, image } = req.body;

  await db
    .collection("menus")
    .doc(restaurantId)
    .collection("items")
    .doc(itemId)
    .update({ name, price, image });

  res.json({ success: true });
});

// DELETE
app.post("/delete-item", async (req, res) => {
  const { restaurantId, itemId } = req.body;

  await db
    .collection("menus")
    .doc(restaurantId)
    .collection("items")
    .doc(itemId)
    .delete();

  res.json({ success: true });
});

// =========================
// 💰 PAYSTACK WEBHOOK
// =========================
app.post("/paystack/webhook", async (req, res) => {
  const data = req.body.data;
  const meta = data.metadata;

  const cart = JSON.parse(meta.cart);

  const orderId = await saveOrder({
    userPhone: meta.phone,
    restaurantId: meta.restaurant,
    items: cart,
    total: data.amount / 100
  });

  const restaurant = await getRestaurant(meta.restaurant);

  let msg = `📦 Paid Order\n\n`;

  cart.forEach(i => {
    msg += `${i.name} – ₦${i.price}\n`;
  });

  msg += `\nTotal: ₦${data.amount / 100}`;

  if (restaurant?.phone) {
    await notifyRestaurant(restaurant.phone, msg);
  }

  res.sendStatus(200);
});

// =========================
// 🔳 QR CODE
// =========================
app.get("/restaurant-qr/:id", async (req, res) => {
  const id = req.params.id;

  const link = `https://wa.me/14155238886?text=hi%20${id}`;
  const qr = await QRCode.toDataURL(link);

  res.send(`<img src="${qr}" /><p>${link}</p>`);
});

// =========================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("🚀 Server running"));