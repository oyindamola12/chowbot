
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

// // =========================
// // 🔥 FIREBASE
// // =========================
// const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

// const db = admin.firestore();

// // =========================
// // 🔥 TWILIO
// // =========================
// const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

// // =========================
// // 🔧 HELPERS
// // =========================

// // ✅ GET MENU (SUBCOLLECTION)
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

// // ✅ GET RESTAURANT
// async function getRestaurant(id) {
//   const doc = await db.collection("restaurants").doc(id).get();
//   return doc.exists ? doc.data() : null;
// }

// // ✅ GET RESTAURANTS BY LOCATION
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

// // ✅ SAVE ORDER
// async function saveOrder(order) {
//   const doc = await db.collection("orders").add({
//     ...order,
//     status: "pending",
//     createdAt: new Date()
//   });

//   return doc.id;
// }

// // ✅ NOTIFY RESTAURANT
// async function notifyRestaurant(phone, message) {
//   await client.messages.create({
//     from: "whatsapp:+14155238886",
//     to: `whatsapp:${phone}`,
//     body: message
//   });
// }

// // ✅ PAYMENT LINK
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
//     console.error(err.response?.data || err.message);
//     return null;
//   }
// }

// // =========================
// // 🔥 SEND MENU (WHATSAPP)
// // =========================
// async function sendMenuText(restaurantId, twiml, res) {
//   const menu = await getMenu(restaurantId);
//   const restaurant = await getRestaurant(restaurantId);

//   if (!menu.length || !restaurant) {
//     twiml.message("❌ Menu not available");
//   } else {
//     let text = `Welcome to 🍽 ${restaurant.name}. Please checkout our menu to place your order.\n\n`;

//     menu.forEach((item, index) => {
//       text += `${index + 1}️⃣ ${item.name} – ₦${item.price}\n`;
//     });

//     text += "\nReply with number to order";

//     twiml.message(text);
//   }

//   res.type("text/xml");
//   res.send(twiml.toString());
// }

// function formatCartUI(cart) {
//   if (!cart.length) {
//     return "🛒 Your cart is empty\n\nSend a number to add items 🍽";
//   }

//   let text = "🛒 *YOUR CART*\n";
//   text += "━━━━━━━━━━━━━━\n\n";

//   let total = 0;

//   cart.forEach((item, index) => {
//     const subtotal = item.price * item.qty;
//     total += subtotal;

//     text +=
//       `${index + 1}. ${item.name}\n` +
//       `   Qty: ${item.qty}\n` +
//       `   Subtotal: ₦${subtotal}\n\n`;
//   });

//   text += "━━━━━━━━━━━━━━\n";
//   text += `💰 *TOTAL: ₦${total}*\n\n`;

//   text += "🧾 Actions:\n";
//   text += "• type: remove burger\n";
//   text += "• type: checkout\n";
//   text += "• type: 1, 2, 3 to add more\n";

//   return text;
// }

// // =========================
// // 🔥 WEBHOOK (CHATBOT)
// // =========================
// app.post("/webhook", async (req, res) => {
//   const twiml = new twilio.twiml.MessagingResponse();

//   const from = req.body.From;
//   const message = req.body.Body?.trim().toLowerCase() || "";

//   if (!sessions[from]) {
//     sessions[from] = {
//       cart: [],
//       restaurant: null,
//       step: "start",
//       total: 0
//     };
//   }

//   const user = sessions[from];

//   try {

//     // =========================
//     // 🟢 START / QR FLOW
//     // =========================
//     if (message.startsWith("hi")) {
//       const id = message.split(" ")[1];

//       // QR flow
//       if (id) {
//         user.restaurant = id;
//         user.cart = [];

//         await sendMenuText(id, twiml, res);
//         return;
//       }

//       // normal flow
//       user.step = "location";
//       twiml.message("📍 Enter your area (Lekki, Yaba)");
//     }

//     // =========================
//     // 📍 LOCATION
//     // =========================
//     else if (user.step === "location") {
//       const list = await getRestaurantsByLocation(message);

//       if (!list.length) {
//         twiml.message("❌ No restaurants found");
//       } else {
//         user.available = list;
//         user.step = "choose";

//         let text = "🍽 Restaurants:\n\n";
//         list.forEach((r, i) => {
//           text += `${i + 1}. ${r.name}\n`;
//         });

//         text += "\nReply with number";

//         twiml.message(text);
//       }
//     }

//     // =========================
//     // 🍽 SELECT RESTAURANT
//     // =========================
//     else if (user.step === "choose") {
//       const index = Number(message) - 1;
//       const selected = user.available[index];

//       if (!selected) {
//         twiml.message("❌ Invalid choice");
//       } else {
//         user.restaurant = selected.id;
//         user.cart = [];

//         await sendMenuText(selected.id, twiml, res);
//         return;
//       }
//     }

//     // =========================
//     // ➕ ADD ITEM (NUMBER INPUT)
//     // =========================
//     else if (!isNaN(message)) {
//       if (!user.restaurant) {
//         twiml.message("⚠️ Start with 'hi'");
//       } else {
//         const menu = await getMenu(user.restaurant);
//         const index = Number(message) - 1;
//         const item = menu[index];

//         if (!item) {
//           twiml.message("❌ Invalid item");
//         } else {
//         const existing = user.cart.find(i => i.id === item.id);

// if (existing) {
//   existing.qty += 1;
// } else {
//   user.cart.push({
//     id: item.id,
//     name: item.name,
//     price: item.price,
//     qty: 1
//   });
// }

//           // ✅ Send image if available
//           if (item.image) {
//             await client.messages.create({
//               from: "whatsapp:+14155238886",
//               to: from,
//               body: `${item.name} – ₦${item.price}`,
//               mediaUrl: [item.image]
//             });
//           }

//         twiml.message(
//   `✅ Added *${item.name}*\n\n` +
//   formatCartUI(user.cart)
// );
//         }
//       }
//     }

//     // =========================
// // 🗑️ REMOVE ITEM
// // =========================
// else if (message.startsWith("remove ")) {
//   const itemName = message.replace("remove ", "").trim();

//   const result = removeFromCart(user.cart, itemName);
//   user.cart = result.cart;

//   let text = result.message + "\n\n🛒 Cart:\n";

//   if (!user.cart.length) {
//     text += "Cart is empty";
//   } else {
//     user.cart.forEach(i => {
//       text += `${i.name} x${i.qty} – ₦${i.price * i.qty}\n`;
//     });
//   }

//   twiml.message(text);
// }
//     // =========================
//     // 💳 CHECKOUT
//     // =========================
//     else if (message === "checkout") {
//       if (!user.cart.length) {
//         twiml.message("🛒 Cart is empty");
//       } else {
//         let total = 0;
//         let text = "🧾 Order:\n\n";

//        user.cart.forEach(i => {
//   const subtotal = i.price * i.qty;
//   text += `${i.name} x${i.qty} – ₦${subtotal}\n`;
//   total += subtotal;
// });

//         user.total = total;

//         const link = await createPaymentLink("user@email.com", total, {
//           phone: from,
//           restaurant: user.restaurant,
//           cart: JSON.stringify(user.cart)
//         });

//         twiml.message(
//           `${text}\nTotal: ₦${total}\n\n💳 Pay:\n${link}`
//         );
//       }
//     }

//     // =========================
//     // 🔄 RESET
//     // =========================
//     else if (message === "reset") {
//       sessions[from] = {
//         cart: [],
//         restaurant: null,
//         step: "start",
//         total: 0
//       };

//       twiml.message("🔄 Reset. Send 'hi'");
//     }

//     // =========================
//     // ❌ DEFAULT
//     // =========================
//     else {
//       twiml.message("Send 'hi' to start");
//     }

//     res.type("text/xml").send(twiml.toString());

//   } catch (err) {
//     console.error(err);
//     twiml.message("⚠️ Error occurred");
//     res.type("text/xml").send(twiml.toString());
//   }
// });


// function removeFromCart(cart, itemName) {
//   const index = cart.findIndex(
//     i => i.name.toLowerCase() === itemName.toLowerCase()
//   );

//   if (index === -1) {
//     return { cart, message: "❌ Item not found in cart" };
//   }

//   const item = cart[index];

//   if (item.qty > 1) {
//     item.qty -= 1;
//   } else {
//     cart.splice(index, 1);
//   }

//   return {
//     cart,
//     message: `🗑️ Removed 1 ${item.name}`
//   };
// }
// // =========================
// // 🏪 REGISTER RESTAURANT
// // =========================
// app.post("/register-restaurant", async (req, res) => {
//   try {
//     const { name, phone, location, deliveryFee } = req.body;

//     if (!name || !phone || !location) {
//       return res.status(400).json({ error: "Missing fields" });
//     }

//     // CHECK DUPLICATE
//     const existing = await db
//       .collection("restaurants")
//       .where("phone", "==", phone)
//       .get();

//     if (!existing.empty) {
//       const id = existing.docs[0].id;

//       return res.json({
//         success: true,
//         restaurantId: id,
//         whatsappLink: `https://wa.me/14155238886?text=hi%20${id}`
//       });
//     }

//     const id = uuidv4();

//     await db.collection("restaurants").doc(id).set({
//       name,
//       phone,
//       location: location.toLowerCase(),
//       deliveryFee: Number(deliveryFee || 0),
//       createdAt: new Date()
//     });

//     await db.collection("menus").doc(id).set({ createdAt: new Date() });

//     res.json({
//       success: true,
//       restaurantId: id,
//       whatsappLink: `https://wa.me/14155238886?text=hi%20${id}`
//     });

//   } catch (err) {
//     res.status(500).json({ error: "Error" });
//   }
// });

// // =========================
// // 🍽 MENU CRUD
// // =========================

// // ADD
// app.post("/add-item", async (req, res) => {
//   const { restaurantId, name, price, image } = req.body;

//   const doc = await db
//     .collection("menus")
//     .doc(restaurantId)
//     .collection("items")
//     .add({
//       name,
//       price: Number(price),
//       image
//     });

//   res.json({ id: doc.id });
// });

// // GET
// app.get("/get-menu/:id", async (req, res) => {
//   const menu = await getMenu(req.params.id);
//   res.json(menu);
// });

// // UPDATE
// app.post("/update-item", async (req, res) => {
//   const { restaurantId, itemId, name, price, image } = req.body;

//   await db
//     .collection("menus")
//     .doc(restaurantId)
//     .collection("items")
//     .doc(itemId)
//     .update({ name, price, image });

//   res.json({ success: true });
// });

// // DELETE
// app.post("/delete-item", async (req, res) => {
//   const { restaurantId, itemId } = req.body;

//   await db
//     .collection("menus")
//     .doc(restaurantId)
//     .collection("items")
//     .doc(itemId)
//     .delete();

//   res.json({ success: true });
// });

// // =========================
// // 💰 PAYSTACK WEBHOOK
// // =========================
// app.post("/paystack/webhook", async (req, res) => {
//   const data = req.body.data;
//   const meta = data.metadata;

//   const cart = JSON.parse(meta.cart);

//   const orderId = await saveOrder({
//     userPhone: meta.phone,
//     restaurantId: meta.restaurant,
//     items: cart,
//     total: data.amount / 100
//   });

//   const restaurant = await getRestaurant(meta.restaurant);

//   let msg = `📦 Paid Order\n\n`;

//   cart.forEach(i => {
//     msg += `${i.name} – ₦${i.price}\n`;
//   });

//   msg += `\nTotal: ₦${data.amount / 100}`;

//   if (restaurant?.phone) {
//     await notifyRestaurant(restaurant.phone, msg);
//   }

//   res.sendStatus(200);
// });

// // =========================
// // 🔳 QR CODE
// // =========================
// app.get("/restaurant-qr/:id", async (req, res) => {
//   const id = req.params.id;

//   const link = `https://wa.me/14155238886?text=hi%20${id}`;
//   const qr = await QRCode.toDataURL(link);

//   res.send(`<img src="${qr}" /><p>${link}</p>`);
// });

// // =========================
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => console.log("🚀 Server running"));





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
// 🔧 SESSION RESET
// =========================
function resetSession(user) {
  user.step = "idle";
  user.location = null;
  user.restaurant = null;
  user.cart = [];
  user.total = 0;
  user.available = [];
  user.lastMenu = [];
  user.orderId = null;
}

// =========================
// 🔧 HELPERS
// =========================
async function getMenu(id) {
  const snap = await db.collection("menus").doc(id).collection("items").get();
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function getRestaurant(id) {
  const doc = await db.collection("restaurants").doc(id).get();
  return doc.exists ? doc.data() : null;
}

async function getRestaurantsByLocation(area) {
  const snap = await db
    .collection("restaurants")
    .where("location", "==", area.toLowerCase())
    .get();

  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// =========================
// 🛒 CART UI
// =========================
function formatCartUI(cart) {
  if (!cart.length) return "🛒 Cart is empty";

  let total = 0;
  let text = "🛒 *YOUR ORDER*\n\n";

  cart.forEach((i, idx) => {
    const subtotal = i.price * i.qty;
    total += subtotal;

    text += `${idx + 1}. ${i.name}\nQty: ${i.qty}\n₦${subtotal}\n\n`;
  });

  text += `━━━━━━━━━━━━━━\n💰 Total: ₦${total}\n\n`;
  text += "• remove burger\n• checkout\n• add more items";

  return text;
}

// =========================
// 🗑 REMOVE
// =========================
function removeFromCart(cart, name) {
  const i = cart.findIndex(
    x => x.name.toLowerCase() === name.toLowerCase()
  );

  if (i === -1) return { cart, message: "❌ Item not found" };

  if (cart[i].qty > 1) cart[i].qty--;
  else cart.splice(i, 1);

  return { cart, message: `🗑 Removed ${name}` };
}

// =========================
// 💳 PAYMENT
// =========================
async function createPaymentLink(email, amount, metadata) {
  const res = await axios.post(
    "https://api.paystack.co/transaction/initialize",
    { email, amount: amount * 100, metadata },
    { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET}` } }
  );

  return res.data.data.authorization_url;
}

// =========================
// 📦 ORDER SYSTEM
// =========================
async function saveOrder(order) {
  const doc = await db.collection("orders").add({
    ...order,
    status: "pending",
    timeline: [
      {
        status: "pending",
        message: "Order received 🍽",
        time: new Date()
      }
    ],
    createdAt: new Date()
  });

  return doc.id;
}

async function notifyUser(phone, message) {
  await client.messages.create({
    from: "whatsapp:+14155238886",
    to: `whatsapp:${phone}`,
    body: `📦 ${message}`
  });
}

async function updateOrderStatus(orderId, status, message) {
  const ref = db.collection("orders").doc(orderId);
  const doc = await ref.get();
  const order = doc.data();

  await ref.update({
    status,
    timeline: admin.firestore.FieldValue.arrayUnion({
      status,
      message,
      time: new Date()
    })
  });

  await notifyUser(order.userPhone, message);
}

// =========================
// 🔥 WEBHOOK
// =========================
app.post("/webhook", async (req, res) => {
  const twiml = new twilio.twiml.MessagingResponse();

  const from = req.body.From;
  const message = req.body.Body?.trim().toLowerCase() || "";

  if (!sessions[from]) {
    sessions[from] = {};
    resetSession(sessions[from]);
  }

  const user = sessions[from];

  try {

    // =========================
    // 🟢 ENTRY
    // =========================
    if (message.startsWith("hi")) {
      resetSession(user);

      const id = message.split(" ")[1];

      if (id) {
        const restaurant = await getRestaurant(id);
        if (!restaurant) {
          twiml.message("❌ Invalid restaurant");
          return res.end();
        }

        user.restaurant = id;
        user.step = "menu";
        user.lastMenu = await getMenu(id);

        let text = `🍽 ${restaurant.name}\n\n`;
        user.lastMenu.forEach((i, idx) => {
          text += `${idx + 1}. ${i.name} - ₦${i.price}\n`;
        });

        text += "\nType number to order";

        twiml.message(text);
        return res.end();
      }

      user.step = "location";
      twiml.message("📍 Enter your location (Lekki, Yaba)");
    }

    // =========================
    // 📍 LOCATION
    // =========================
    else if (user.step === "location") {
      const list = await getRestaurantsByLocation(message);

      if (!list.length) {
        twiml.message("❌ No restaurants found");
        return;
      }

      user.available = list;
      user.step = "restaurant";

      let text = "🍽 Restaurants:\n\n";
      list.forEach((r, i) => {
        text += `${i + 1}. ${r.name}\n`;
      });

      twiml.message(text);
    }

    // =========================
    // 🍽 SELECT RESTAURANT
    // =========================
    else if (user.step === "restaurant") {
      const r = user.available[Number(message) - 1];
      if (!r) return twiml.message("❌ Invalid choice");

      user.restaurant = r.id;
      user.step = "menu";
      user.lastMenu = await getMenu(r.id);

      let text = `🍽 ${r.name}\n\n`;
      user.lastMenu.forEach((i, idx) => {
        text += `${idx + 1}. ${i.name} - ₦${i.price}\n`;
      });

      twiml.message(text);
    }

    // =========================
    // ➕ ADD ITEM
    // =========================
    else if (user.step === "menu" && !isNaN(message)) {
      const item = user.lastMenu[Number(message) - 1];
      if (!item) return twiml.message("❌ Invalid item");

      const existing = user.cart.find(i => i.id === item.id);

      if (existing) existing.qty++;
      else user.cart.push({ ...item, qty: 1 });

      twiml.message(`✅ Added ${item.name}\n\n${formatCartUI(user.cart)}`);
    }

    // =========================
    // 🛒 CART
    // =========================
    else if (message === "cart") {
      twiml.message(formatCartUI(user.cart));
    }

    // =========================
    // 🗑 REMOVE
    // =========================
    else if (message.startsWith("remove ")) {
      const name = message.replace("remove ", "");
      const result = removeFromCart(user.cart, name);
      twiml.message(result.message + "\n\n" + formatCartUI(user.cart));
    }

    // =========================
    // 💳 CHECKOUT
    // =========================
    else if (message === "checkout") {
      if (!user.cart.length) return twiml.message("🛒 Cart empty");

      let total = 0;
      user.cart.forEach(i => total += i.price * i.qty);

      const link = await createPaymentLink("user@email.com", total, {
        phone: from,
        restaurant: user.restaurant,
        cart: JSON.stringify(user.cart)
      });

      twiml.message(`💰 Total: ₦${total}\n\n💳 Pay:\n${link}`);
    }

    // =========================
    // 📦 TRACK
    // =========================
    else if (message === "track") {
      if (!user.orderId) return twiml.message("❌ No order");

      const doc = await db.collection("orders").doc(user.orderId).get();
      const order = doc.data();

      const last = order.timeline.at(-1);

      twiml.message(`📦 ${last.message}`);
    }

    // =========================
    // 🔄 RESET
    // =========================
    else if (message === "reset") {
      resetSession(user);
      twiml.message("🔄 Reset. Send 'hi'");
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

  sessions[meta.phone] = sessions[meta.phone] || {};
  sessions[meta.phone].orderId = orderId;

  await notifyUser(meta.phone, "Payment successful 🎉");

  res.sendStatus(200);
});

// =========================
// 🔳 QR
// =========================
app.get("/restaurant-qr/:id", async (req, res) => {
  const link = `https://wa.me/14155238886?text=hi%20${req.params.id}`;
  const qr = await QRCode.toDataURL(link);
  res.send(`<img src="${qr}" />`);
});

app.listen(3000, () => console.log("🚀 Running"));