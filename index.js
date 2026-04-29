// // // require("dotenv").config();
// // // const express = require("express");
// // // const twilio = require("twilio");
// // // const bodyParser = require("body-parser");
// // // const admin = require("firebase-admin");
// // // const axios = require("axios");
// // // const QRCode = require("qrcode");
// // // const cors = require("cors");

// // // const { v4: uuidv4 } = require("uuid");
// // // const app = express();
// // // app.use(express.urlencoded({ extended: false }));
// // // app.use(express.json());
// // // app.use(bodyParser.json());
// // // app.use(express.static("public"));
// // // app.use(cors());

// // // const sessions = {};

// // // // 🔥 FIREBASE
// // // const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

// // // admin.initializeApp({
// // //   credential: admin.credential.cert(serviceAccount),
// // // });

// // // const db = admin.firestore();

// // // // 🔥 TWILIO
// // // const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

// // // // =========================
// // // // 🔧 HELPERS
// // // // =========================

// // // const uuidRegex = /^[0-9a-fA-F-]{36}$/;

// // // // 🔹 GET MENU
// // // async function getMenu(id) {
// // //   const doc = await db.collection("menus").doc(id).get();
// // //   if (!doc.exists) return null;
// // //   return doc.data().items;
// // // }

// // // // 🔹 GET RESTAURANT
// // // async function getRestaurant(id) {
// // //   const doc = await db.collection("restaurants").doc(id).get();
// // //   return doc.exists ? doc.data() : null;
// // // }

// // // // 🔹 GET BY LOCATION
// // // async function getRestaurantsByLocation(area) {
// // //   const snapshot = await db
// // //     .collection("restaurants")
// // //     .where("location", "==", area.toLowerCase())
// // //     .get();

// // //   const list = [];
// // //   snapshot.forEach(doc => {
// // //     list.push({ id: doc.id, ...doc.data() });
// // //   });

// // //   return list;
// // // }

// // // // 🔹 SAVE ORDER
// // // async function saveOrder(order) {
// // //   const doc = await db.collection("orders").add({
// // //     ...order,
// // //     status: "pending",
// // //     createdAt: new Date()
// // //   });

// // //   return doc.id;
// // // }

// // // // 🔹 NOTIFY RESTAURANT
// // // async function notifyRestaurant(phone, message) {
// // //   try {
// // //     await client.messages.create({
// // //       from: "whatsapp:+14155238886",
// // //       to: `whatsapp:${phone}`,
// // //       body: message
// // //     });
// // //   } catch (err) {
// // //     console.error("Notify error:", err.message);
// // //   }
// // // }

// // // // 🔹 PAYMENT LINK
// // // async function createPaymentLink(email, amount, metadata) {
// // //   try {
// // //     const res = await axios.post(
// // //       "https://api.paystack.co/transaction/initialize",
// // //       {
// // //         email,
// // //         amount: amount * 100,
// // //         metadata
// // //       },
// // //       {
// // //         headers: {
// // //           Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
// // //           "Content-Type": "application/json"
// // //         }
// // //       }
// // //     );

// // //     return res.data.data.authorization_url;

// // //   } catch (err) {
// // //     console.error("Paystack Error:", err.response?.data || err.message);
// // //     return null;
// // //   }
// // // }

// // // // =========================
// // // // 🔥 SEND MENU (BUTTONS)
// // // // =========================

// // // async function sendMenuButtons(id, from) {
// // //   const menu = await getMenu(id);
// // //   const restaurant = await getRestaurant(id);

// // //   if (!menu || !restaurant) return;

// // //   const sections = [
// // //     {
// // //       title: "Menu",
// // //       rows: menu.map(item => ({
// // //         id: `item_${item.id}`,
// // //         title: item.name,
// // //         description: `₦${item.price}`
// // //       }))
// // //     },
// // //     {
// // //       title: "Checkout",
// // //       rows: [
// // //         {
// // //           id: "checkout",
// // //           title: "🧾 Checkout",
// // //           description: "View your order"
// // //         }
// // //       ]
// // //     }
// // //   ];

// // //   await client.messages.create({
// // //     from: "whatsapp:+14155238886",
// // //     to: from,
// // //     body: `🍽 ${restaurant.name}`,
// // //     interactive: {
// // //       type: "list",
// // //       body: { text: "Select an item" },
// // //       action: {
// // //         button: "View Menu",
// // //         sections
// // //       }
// // //     }
// // //   });
// // // }

// // // // =========================
// // // // 🔥 WEBHOOK
// // // // =========================

// // // app.post("/webhook", async (req, res) => {
// // //   const twiml = new twilio.twiml.MessagingResponse();

// // //   const from = req.body.From;
// // //   const message = req.body.Body?.trim().toLowerCase() || "";

// // //   // 🔥 BUTTON HANDLER
// // //   const buttonId =
// // //     req.body.ListResponse?.id ||
// // //     req.body.ButtonPayload ||
// // //     message;

// // //   if (!sessions[from]) {
// // //     sessions[from] = {
// // //       cart: [],
// // //       step: "start",
// // //       restaurant: null,
// // //       total: 0
// // //     };
// // //   }

// // //   const user = sessions[from];

// // //   try {

// // //     // =========================
// // //     // 🔗 QR FLOW
// // //     // =========================
// // //     if (message.startsWith("hi")) {
// // //       const parts = message.split(" ");
// // //       const id = parts[1];

// // //       if (id && uuidRegex.test(id)) {
// // //         user.restaurant = id;
// // //         user.cart = [];

// // //         await sendMenuButtons(id, from);
// // //         return res.sendStatus(200);
// // //       }

// // //       user.step = "ask_location";
// // //       twiml.message("📍 Enter your area (Lekki, Yaba)");
// // //     }

// // //     // =========================
// // //     // LOCATION
// // //     // =========================
// // //     else if (user.step === "ask_location") {
// // //       const restaurants = await getRestaurantsByLocation(message);

// // //       if (!restaurants.length) {
// // //         twiml.message("❌ No restaurants found.");
// // //       } else {
// // //         user.availableRestaurants = restaurants;
// // //         user.step = "choose_restaurant";

// // //         let text = "🍽 Restaurants:\n\n";
// // //         restaurants.forEach((r, i) => {
// // //           text += `${i + 1}️⃣ ${r.name}\n`;
// // //         });

// // //         twiml.message(text + "\nReply with number");
// // //       }
// // //     }

// // //     // =========================
// // //     // SELECT RESTAURANT
// // //     // =========================
// // //     else if (user.step === "choose_restaurant") {
// // //       const index = Number(message) - 1;
// // //       const selected = user.availableRestaurants[index];

// // //       if (!selected) {
// // //         twiml.message("❌ Invalid choice.");
// // //       } else {
// // //         user.restaurant = selected.id;
// // //         user.cart = [];

// // //         await sendMenuButtons(selected.id, from);
// // //         return res.sendStatus(200);
// // //       }
// // //     }

// // //     // =========================
// // //     // ITEM CLICK (BUTTON)
// // //     // =========================
// // //     else if (buttonId.startsWith("item_")) {
// // //       const itemId = buttonId.replace("item_", "");

// // //       const menu = await getMenu(user.restaurant);
// // //       const item = menu.find(i => String(i.id) === itemId);

// // //       if (!item) {
// // //         twiml.message("❌ Item not found");
// // //       } else {
// // //         user.cart.push(item);

// // //         // 🔥 SEND IMAGE
// // //         if (item.image) {
// // //           await client.messages.create({
// // //             from: "whatsapp:+14155238886",
// // //             to: from,
// // //             body: `${item.name} – ₦${item.price}`,
// // //             mediaUrl: [item.image]
// // //           });
// // //         }

// // //         // 🔁 SEND MENU AGAIN
// // //         await sendMenuButtons(user.restaurant, from);
// // //         return res.sendStatus(200);
// // //       }
// // //     }

// // //     // =========================
// // //     // CHECKOUT
// // //     // =========================
// // //     else if (buttonId === "checkout") {
// // //       if (!user.cart.length) {
// // //         twiml.message("🛒 Cart empty.");
// // //       } else {

// // //         let total = 0;
// // //         let summary = "🧾 Order:\n\n";

// // //         user.cart.forEach(item => {
// // //           summary += `${item.name} – ₦${item.price}\n`;
// // //           total += Number(item.price);
// // //         });

// // //         user.total = total;

// // //         const link = await createPaymentLink(
// // //           "user@email.com",
// // //           total,
// // //           {
// // //             phone: from,
// // //             restaurant: user.restaurant,
// // //             cart: JSON.stringify(user.cart)
// // //           }
// // //         );

// // //         twiml.message(
// // //           `${summary}\nTotal: ₦${total}\n\n💳 Pay:\n${link}`
// // //         );
// // //       }
// // //     }

// // //     else {
// // //       twiml.message("Send 'hi' to start");
// // //     }

// // //     res.type("text/xml").send(twiml.toString());

// // //   } catch (err) {
// // //     console.error(err);
// // //     twiml.message("⚠️ Error occurred.");
// // //     res.type("text/xml").send(twiml.toString());
// // //   }
// // // });

// // // // =========================
// // // // 💰 PAYSTACK WEBHOOK
// // // // =========================

// // // // 🔥 REGISTER RESTAURANT
// // // app.post("/register-restaurant", async (req, res) => {
// // //   try {
// // //     const { name, phone, location, deliveryFee } = req.body;

// // //     if (!name || !phone || !location) {
// // //       return res.status(400).json({ error: "Missing fields" });
// // //     }

// // //     const id = uuidv4();

// // //     // ✅ SAVE RESTAURANT
// // //     await db.collection("restaurants").doc(id).set({
// // //       name,
// // //       phone,
// // //       location: location.toLowerCase(),
// // //       deliveryFee: Number(deliveryFee || 0),
// // //       createdAt: new Date(),
// // //       active: true
// // //     });

// // //     // ✅ CREATE EMPTY MENU
// // //     await db.collection("menus").doc(id).set({
// // //       restaurantId: id,
// // //       items: []
// // //     });

// // //     // 🔗 WHATSAPP LINK
// // //     const whatsappLink = `https://wa.me/14155238886?text=hi%20${id}`;

// // //     res.json({
// // //       success: true,
// // //       restaurantId: id,
// // //       whatsappLink
// // //     });

// // //   } catch (err) {
// // //     console.error(err);
// // //     res.status(500).json({ error: "Server error" });
// // //   }
// // // });

// // // // app.post("/register-restaurant", async (req, res) => {
// // // //   try {
// // // //     const { name, phone, location, deliveryFee } = req.body;

// // // //     const doc = await db.collection("restaurants").add({
// // // //       name,
// // // //       phone,
// // // //       location: location.toLowerCase(),
// // // //       deliveryFee: Number(deliveryFee),
// // // //       createdAt: new Date()
// // // //     });

// // // //    const link = `https://wa.me/14155238886?text=hi${doc.id}`;

// // // //     res.json({
// // // //       success: true,
// // // //       restaurantId,
// // // //       whatsappLink:link
// // // //     });

// // // //   } catch (err) {
// // // //     console.error(err);
// // // //     res.status(500).json({ error: "Failed to register" });
// // // //   }
// // // // });

// // // app.post("/paystack/webhook", express.json(), async (req, res) => {
// // //   const event = req.body;

// // //   if (event.event === "charge.success") {
// // //     const data = event.data;
// // //     const meta = data.metadata;

// // //     let cart = [];
// // //     try {
// // //       cart = JSON.parse(meta.cart);
// // //     } catch {}

// // //     const orderId = await saveOrder({
// // //       userPhone: meta.phone,
// // //       restaurantId: meta.restaurant,
// // //       items: cart,
// // //       total: data.amount / 100
// // //     });

// // //     const restaurant = await getRestaurant(meta.restaurant);

// // //     let msg = `📦 Paid Order!\n\n`;

// // //     cart.forEach(i => {
// // //       msg += `${i.name} – ₦${i.price}\n`;
// // //     });

// // //     msg += `\nTotal: ₦${data.amount / 100}`;
// // //     msg += `\nCustomer: ${meta.phone}`;
// // //     msg += `\nOrder ID: ${orderId}`;

// // //     if (restaurant?.phone) {
// // //       await notifyRestaurant(restaurant.phone, msg);
// // //     }
// // //   }

// // //   res.sendStatus(200);
// // // });

// // // app.get("/restaurant-qr/:id", async (req, res) => {
// // //   const id = req.params.id;

// // //   const link = `https://wa.me/14155238886?text=hi%20${id}`;

// // //   const qr = await QRCode.toDataURL(link);

// // //   res.send(`
// // //     <h2>Scan to Order</h2>
// // //     <img src="${qr}" />
// // //     <p>${link}</p>
// // //   `);
// // // });
// // // // =========================

// // // // =========================
// // // // 🍽 SAVE MENU
// // // // =========================
// // // app.post("/save-menu", async (req, res) => {
// // //   try {
// // //     const { restaurantId, items } = req.body;

// // //     if (!restaurantId || !items) {
// // //       return res.status(400).json({ error: "Missing data" });
// // //     }

// // //     await db.collection("menus").doc(restaurantId).set({
// // //       restaurantId,
// // //       items,
// // //       updatedAt: new Date()
// // //     });

// // //     res.json({ success: true });

// // //   } catch (err) {
// // //     console.error("Save menu error:", err);
// // //     res.status(500).json({ error: "Failed to save menu" });
// // //   }
// // // });


// // // // =========================
// // // // 📥 GET MENU (FOR BOT)
// // // // =========================
// // // app.get("/menu/:id", async (req, res) => {
// // //   try {
// // //     const id = req.params.id;

// // //     const doc = await db.collection("menus").doc(id).get();

// // //     if (!doc.exists) {
// // //       return res.status(404).json({ error: "Menu not found" });
// // //     }

// // //     res.json(doc.data());

// // //   } catch (err) {
// // //     console.error("Get menu error:", err);
// // //     res.status(500).json({ error: "Server error" });
// // //   }
// // // });


// // // // =========================
// // // // 🏪 GET RESTAURANT
// // // // =========================
// // // app.get("/restaurant/:id", async (req, res) => {
// // //   try {
// // //     const id = req.params.id;

// // //     const doc = await db.collection("restaurants").doc(id).get();

// // //     if (!doc.exists) {
// // //       return res.status(404).json({ error: "Restaurant not found" });
// // //     }

// // //     res.json(doc.data());

// // //   } catch (err) {
// // //     console.error(err);
// // //     res.status(500).json({ error: "Server error" });
// // //   }
// // // });


// // // app.post("/add-item", async (req, res) => {
// // //   const { restaurantId, name, price, image } = req.body;

// // //   try {
// // //     const doc = await db
// // //       .collection("menus")
// // //       .doc(restaurantId)
// // //       .collection("items")
// // //       .add({
// // //         name,
// // //         price: Number(price),
// // //         image,
// // //         createdAt: new Date()
// // //       });

// // //     res.json({ success: true, id: doc.id });

// // //   } catch (err) {
// // //     console.error(err);
// // //     res.status(500).json({ error: "Failed to add item" });
// // //   }
// // // });

// // // async function getMenu(restaurantId) {
// // //   const snapshot = await db
// // //     .collection("menus")
// // //     .doc(restaurantId)
// // //     .collection("items")
// // //     .get();

// // //   const items = [];

// // //   snapshot.forEach(doc => {
// // //     items.push({
// // //       id: doc.id,
// // //       ...doc.data()
// // //     });
// // //   });

// // //   return items;
// // // }
// // // app.get("/get-menu/:restaurantId", async (req, res) => {
// // //   const { restaurantId } = req.params;

// // //   try {
// // //     const snapshot = await db
// // //       .collection("menus")
// // //       .doc(restaurantId)
// // //       .collection("items")
// // //       .get();

// // //     const items = [];

// // //     snapshot.forEach(doc => {
// // //       items.push({ id: doc.id, ...doc.data() });
// // //     });

// // //     res.json(items);

// // //   } catch (err) {
// // //     res.status(500).json({ error: "Failed to fetch menu" });
// // //   }
// // // });



// // // app.post("/update-item", async (req, res) => {
// // //   const { restaurantId, itemId, name, price, image } = req.body;

// // //   try {
// // //     await db
// // //       .collection("menus")
// // //       .doc(restaurantId)
// // //       .collection("items")
// // //       .doc(itemId)
// // //       .update({
// // //         name,
// // //         price: Number(price),
// // //         image
// // //       });

// // //     res.json({ success: true });

// // //   } catch (err) {
// // //     console.error(err);
// // //     res.status(500).json({ error: "Update failed" });
// // //   }
// // // });


// // // app.post("/delete-item", async (req, res) => {
// // //   const { restaurantId, itemId } = req.body;

// // //   try {
// // //     await db
// // //       .collection("menus")
// // //       .doc(restaurantId)
// // //       .collection("items")
// // //       .doc(itemId)
// // //       .delete();

// // //     res.json({ success: true });

// // //   } catch (err) {
// // //     res.status(500).json({ error: "Delete failed" });
// // //   }
// // // });
// // // const PORT = process.env.PORT || 3000;
// // // app.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));



// // require("dotenv").config();
// // const express = require("express");
// // const twilio = require("twilio");
// // const bodyParser = require("body-parser");
// // const admin = require("firebase-admin");
// // const axios = require("axios");
// // const QRCode = require("qrcode");
// // const cors = require("cors");
// // const { v4: uuidv4 } = require("uuid");

// // const app = express();
// // app.use(express.urlencoded({ extended: false }));
// // app.use(express.json());
// // app.use(bodyParser.json());
// // app.use(express.static("public"));
// // app.use(cors());
// // const sessions = {};

// // // =========================
// // // 💰 PRICING CONFIG (NEW)
// // // =========================
// // const SERVICE_FEE = 250;
// // const LOW_ORDER_THRESHOLD = 4000;
// // const LOW_ORDER_FEE = 150;
// // const HIGH_ORDER_PERCENT = 0.1;

// // // =========================
// // // 💰 PRICING FUNCTION (NEW)
// // // =========================
// // function calculatePricing(cartTotal) {
// //   let commission = 0;

// //   if (cartTotal >= LOW_ORDER_THRESHOLD) {
// //     commission = cartTotal * HIGH_ORDER_PERCENT;
// //   } else {
// //     commission = LOW_ORDER_FEE;
// //   }

// //   return {
// //     commission,
// //     restaurantEarnings: cartTotal - commission,
// //     serviceFee: SERVICE_FEE,
// //     customerPays: cartTotal + SERVICE_FEE
// //   };
// // }


// // // =========================
// // // 🔥 FIREBASE
// // // =========================
// // const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

// // admin.initializeApp({
// //   credential: admin.credential.cert(serviceAccount),
// // });

// // const db = admin.firestore();

// // // =========================
// // // 🔥 TWILIO
// // // =========================
// // const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

// // // =========================
// // // 🔧 HELPERS
// // // =========================

// // // ✅ GET MENU (SUBCOLLECTION)
// // async function getMenu(restaurantId) {
// //   const snapshot = await db
// //     .collection("menus")
// //     .doc(restaurantId)
// //     .collection("items")
// //     .get();

// //   const items = [];

// //   snapshot.forEach(doc => {
// //     items.push({
// //       id: doc.id,
// //       ...doc.data()
// //     });
// //   });

// //   return items;
// // }

// // // ✅ GET RESTAURANT
// // async function getRestaurant(id) {
// //   const doc = await db.collection("restaurants").doc(id).get();
// //   return doc.exists ? doc.data() : null;
// // }

// // // ✅ GET RESTAURANTS BY LOCATION
// // async function getRestaurantsByLocation(area) {
// //   const snapshot = await db
// //     .collection("restaurants")
// //     .where("location", "==", area.toLowerCase())
// //     .get();

// //   const list = [];
// //   snapshot.forEach(doc => {
// //     list.push({ id: doc.id, ...doc.data() });
// //   });

// //   return list;
// // }

// // // ✅ SAVE ORDER
// // async function saveOrder(order) {
// //   const doc = await db.collection("orders").add({
// //     ...order,
// //     status: "pending",
// //     createdAt: new Date()
// //   });

// //   return doc.id;
// // }

// // // ✅ NOTIFY RESTAURANT
// // async function notifyRestaurant(phone, message) {
// //   await client.messages.create({
// //     from: "whatsapp:+14155238886",
// //     to: `whatsapp:${phone}`,
// //     body: message
// //   });
// // }

// // // ✅ PAYMENT LINK
// // async function createPaymentLink(email, amount, metadata) {
// //   try {
// //     const res = await axios.post(
// //       "https://api.paystack.co/transaction/initialize",
// //       {
// //         email,
// //         amount: amount * 100,
// //         metadata
// //       },
// //       {
// //         headers: {
// //           Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
// //           "Content-Type": "application/json"
// //         }
// //       }
// //     );

// //     return res.data.data.authorization_url;
// //   } catch (err) {
// //     console.error(err.response?.data || err.message);
// //     return null;
// //   }
// // }

// // // =========================
// // // 🔥 SEND MENU (WHATSAPP)
// // // =========================
// // async function sendMenuText(restaurantId, twiml, res) {
// //   const menu = await getMenu(restaurantId);
// //   const restaurant = await getRestaurant(restaurantId);

// //   if (!menu.length || !restaurant) {
// //     twiml.message("❌ Menu not available");
// //   } else {
// //     let text = `Welcome to 🍽 ${restaurant.name}. Please checkout our menu to place your order.\n\n`;

// //     menu.forEach((item, index) => {
// //       text += `${index + 1}️⃣ ${item.name} – ₦${item.price}\n`;
// //     });

// //     text += "\nReply with number to order";

// //     twiml.message(text);
// //   }

// //   res.type("text/xml");
// //   res.send(twiml.toString());
// // }

// // function formatCartUI(cart) {
// //   if (!cart.length) {
// //     return "🛒 Your cart is empty\n\nSend a number to add items 🍽";
// //   }

// //   let text = "🛒 *YOUR CART*\n";
// //   text += "━━━━━━━━━━━━━━\n\n";

// //   let total = 0;

// //   cart.forEach((item, index) => {
// //     const subtotal = item.price * item.qty;
// //     total += subtotal;

// //     text +=
// //       `${index + 1}. ${item.name}\n` +
// //       `   Qty: ${item.qty}\n` +
// //       `   Subtotal: ₦${subtotal}\n\n`;
// //   });

// //   text += "━━━━━━━━━━━━━━\n";
// //   text += `💰 *TOTAL: ₦${total}*\n\n`;

// //   text += "🧾 Actions:\n";
// //   text += "• type: remove burger\n";
// //   text += "• type: checkout\n";
// //   text += "• type: 1, 2, 3 to add more\n";

// //   return text;
// // }

// // // =========================
// // // 🔥 WEBHOOK (CHATBOT)
// // // =========================
// // app.post("/webhook", async (req, res) => {
// //   const twiml = new twilio.twiml.MessagingResponse();

// //   const from = req.body.From;
// //   const message = req.body.Body?.trim().toLowerCase() || "";

// //   if (!sessions[from]) {
// //     sessions[from] = {
// //       cart: [],
// //       restaurant: null,
// //       step: "start",
// //       total: 0
// //     };
// //   }

// //   const user = sessions[from];

// //   try {

// //     // =========================
// //     // 🟢 START / QR FLOW
// //     // =========================
// //     if (message.startsWith("hi")) {
// //       const id = message.split(" ")[1];

// //       // QR flow
// //       if (id) {
// //         user.restaurant = id;
// //         user.cart = [];

// //         await sendMenuText(id, twiml, res);
// //         return;
// //       }

// //       // normal flow
// //       user.step = "location";
// //       twiml.message("📍 Enter your area (Lekki, Yaba)");
// //     }

// //     // =========================
// //     // 📍 LOCATION
// //     // =========================
// //     else if (user.step === "location") {
// //       const list = await getRestaurantsByLocation(message);

// //       if (!list.length) {
// //         twiml.message("❌ No restaurants found");
// //       } else {
// //         user.available = list;
// //         user.step = "choose";

// //         let text = "🍽 Restaurants:\n\n";
// //         list.forEach((r, i) => {
// //           text += `${i + 1}. ${r.name}\n`;
// //         });

// //         text += "\nReply with number";

// //         twiml.message(text);
// //       }
// //     }

// //     // =========================
// //     // 🍽 SELECT RESTAURANT
// //     // =========================
// //     else if (user.step === "choose") {
// //       const index = Number(message) - 1;
// //       const selected = user.available[index];

// //       if (!selected) {
// //         twiml.message("❌ Invalid choice");
// //       } else {
// //         user.restaurant = selected.id;
// //         user.cart = [];

// //         await sendMenuText(selected.id, twiml, res);
// //         return;
// //       }
// //     }

// //     // =========================
// //     // ➕ ADD ITEM (NUMBER INPUT)
// //     // =========================
// //     else if (!isNaN(message)) {
// //       if (!user.restaurant) {
// //         twiml.message("⚠️ Start with 'hi'");
// //       } else {
// //         const menu = await getMenu(user.restaurant);
// //         const index = Number(message) - 1;
// //         const item = menu[index];

// //         if (!item) {
// //           twiml.message("❌ Invalid item");
// //         } else {
// //         const existing = user.cart.find(i => i.id === item.id);

// // if (existing) {
// //   existing.qty += 1;
// // } else {
// //   user.cart.push({
// //     id: item.id,
// //     name: item.name,
// //     price: item.price,
// //     qty: 1
// //   });
// // }

// //           // ✅ Send image if available
// //           if (item.image) {
// //             await client.messages.create({
// //               from: "whatsapp:+14155238886",
// //               to: from,
// //               body: `${item.name} – ₦${item.price}`,
// //               mediaUrl: [item.image]
// //             });
// //           }

// //         twiml.message(
// //   `✅ Added *${item.name}*\n\n` +
// //   formatCartUI(user.cart)
// // );
// //         }
// //       }
// //     }

// //     // =========================
// // // 🗑️ REMOVE ITEM
// // // =========================
// // else if (message.startsWith("remove ")) {
// //   const itemName = message.replace("remove ", "").trim();

// //   const result = removeFromCart(user.cart, itemName);
// //   user.cart = result.cart;

// //   let text = result.message + "\n\n🛒 Cart:\n";

// //   if (!user.cart.length) {
// //     text += "Cart is empty";
// //   } else {
// //     user.cart.forEach(i => {
// //       text += `${i.name} x${i.qty} – ₦${i.price * i.qty}\n`;
// //     });
// //   }

// //   twiml.message(text);
// // }
// //     // =========================
// //     // 💳 CHECKOUT
// //     // =========================
// //     else if (message === "checkout") {
// //       if (!user.cart.length) {
// //         twiml.message("🛒 Cart is empty");
// //       } else {
// //          let cartTotal = 0;
// //         let text = "🧾 Order:\n\n";

// //        user.cart.forEach(i => {
// //   const subtotal = i.price * i.qty;
// //   text += `${i.name} x${i.qty} – ₦${subtotal}\n`;
// //   total += subtotal;
// // });
// // const pricing = calculatePricing(cartTotal);
// //         // user.total = total;

// //         const link = await createPaymentLink("user@email.com", total, {
// //           phone: from,
// //           restaurant: user.restaurant,
// //           cart: JSON.stringify(user.cart)
// //         });

// //         twiml.message(
// // `${text}
// // 🍽 Food: ₦${cartTotal}
// // 🚚 Service Fee: ₦${pricing.serviceFee}
// // 💰 Total: ₦${pricing.customerPays}
// // 💳 Pay:
// // ${link}`
// //         );
// //       }
// //     }

// //     // =========================
// //     // 🔄 RESET
// //     // =========================
// //     else if (message === "reset") {
// //       sessions[from] = {
// //         cart: [],
// //         restaurant: null,
// //         step: "start",
// //         total: 0
// //       };

// //       twiml.message("🔄 Reset. Send 'hi'");
// //     }

// //     // =========================
// //     // ❌ DEFAULT
// //     // =========================
// //     else {
// //       twiml.message("Send 'hi' to start");
// //     }

// //     res.type("text/xml").send(twiml.toString());

// //   } catch (err) {
// //     console.error(err);
// //     twiml.message("⚠️ Error occurred");
// //     res.type("text/xml").send(twiml.toString());
// //   }
// // });


// // function removeFromCart(cart, itemName) {
// //   const index = cart.findIndex(
// //     i => i.name.toLowerCase() === itemName.toLowerCase()
// //   );

// //   if (index === -1) {
// //     return { cart, message: "❌ Item not found in cart" };
// //   }

// //   const item = cart[index];

// //   if (item.qty > 1) {
// //     item.qty -= 1;
// //   } else {
// //     cart.splice(index, 1);
// //   }

// //   return {
// //     cart,
// //     message: `🗑️ Removed 1 ${item.name}`
// //   };
// // }
// // // =========================
// // // 🏪 REGISTER RESTAURANT
// // // =========================
// // app.post("/register-restaurant", async (req, res) => {
// //   try {
// //     const { name, phone, location, deliveryFee } = req.body;

// //     if (!name || !phone || !location) {
// //       return res.status(400).json({ error: "Missing fields" });
// //     }

// //     // CHECK DUPLICATE
// //     const existing = await db
// //       .collection("restaurants")
// //       .where("phone", "==", phone)
// //       .get();

// //     if (!existing.empty) {
// //       const id = existing.docs[0].id;

// //       return res.json({
// //         success: true,
// //         restaurantId: id,
// //         whatsappLink: `https://wa.me/14155238886?text=hi%20${id}`
// //       });
// //     }

// //     const id = uuidv4();

// //     await db.collection("restaurants").doc(id).set({
// //       name,
// //       phone,
// //       location: location.toLowerCase(),
// //       deliveryFee: Number(deliveryFee || 0),
// //       createdAt: new Date()
// //     });

// //     await db.collection("menus").doc(id).set({ createdAt: new Date() });

// //     res.json({
// //       success: true,
// //       restaurantId: id,
// //       whatsappLink: `https://wa.me/14155238886?text=hi%20${id}`
// //     });

// //   } catch (err) {
// //     res.status(500).json({ error: "Error" });
// //   }
// // });

// // // =========================
// // // 🍽 MENU CRUD
// // // =========================

// // // ADD
// // app.post("/add-item", async (req, res) => {
// //   const { restaurantId, name, price, image } = req.body;

// //   const doc = await db
// //     .collection("menus")
// //     .doc(restaurantId)
// //     .collection("items")
// //     .add({
// //       name,
// //       price: Number(price),
// //       image
// //     });

// //   res.json({ id: doc.id });
// // });

// // // GET
// // app.get("/get-menu/:id", async (req, res) => {
// //   const menu = await getMenu(req.params.id);
// //   res.json(menu);
// // });

// // // UPDATE
// // app.post("/update-item", async (req, res) => {
// //   const { restaurantId, itemId, name, price, image } = req.body;

// //   await db
// //     .collection("menus")
// //     .doc(restaurantId)
// //     .collection("items")
// //     .doc(itemId)
// //     .update({ name, price, image });

// //   res.json({ success: true });
// // });

// // // DELETE
// // app.post("/delete-item", async (req, res) => {
// //   const { restaurantId, itemId } = req.body;

// //   await db
// //     .collection("menus")
// //     .doc(restaurantId)
// //     .collection("items")
// //     .doc(itemId)
// //     .delete();

// //   res.json({ success: true });
// // });

// // // =========================
// // // 💰 PAYSTACK WEBHOOK
// // // =========================
// // // app.post("/paystack/webhook", async (req, res) => {
// // //   const data = req.body.data;
// // //   const meta = data.metadata;

// // //   const cart = JSON.parse(meta.cart);

// // //   const orderId = await saveOrder({
// // //     userPhone: meta.phone,
// // //     restaurantId: meta.restaurant,
// // //     items: cart,
// // //     total: data.amount / 100
// // //   });

// // //   const restaurant = await getRestaurant(meta.restaurant);

// // //   let msg = `📦 Paid Order\n\n`;

// // //   cart.forEach(i => {
// // //     msg += `${i.name} – ₦${i.price}\n`;
// // //   });

// // //   msg += `\nTotal: ₦${data.amount / 100}`;

// // //   if (restaurant?.phone) {
// // //     await notifyRestaurant(restaurant.phone, msg);
// // //   }

// // //   res.sendStatus(200);
// // // });

// // app.post("/paystack/webhook", async (req, res) => {
// //   const data = req.body.data;
// //   const meta = data.metadata;

// //   const cart = JSON.parse(meta.cart);

// //   const cartTotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

// //   const orderId = await saveOrder({
// //     userPhone: meta.phone,
// //     restaurantId: meta.restaurant,
// //     items: cart,
// //     total: cartTotal
// //   });

// //   const pricing = calculatePricing(cartTotal);

// //   const restaurant = await getRestaurant(meta.restaurant);

// //   let msg = `📦 Paid Order\n\n`;

// //   cart.forEach(i => {
// //     msg += `${i.name} x${i.qty} – ₦${i.price * i.qty}\n`;
// //   });

// //   msg += `
// // ━━━━━━━━━━━━━━
// // 💰 Order Total: ₦${cartTotal}
// // 💸 Your Earnings: ₦${pricing.restaurantEarnings}
// // 🧾 Platform Fee: ₦${pricing.commission}
// // `;

// //   if (restaurant?.phone) {
// //     await client.messages.create({
// //       from: "whatsapp:+14155238886",
// //       to: `whatsapp:${restaurant.phone}`,
// //       body: msg
// //     });
// //   }

// //   res.sendStatus(200);
// // });

// // // =========================
// // // 🔳 QR CODE
// // // =========================
// // app.get("/restaurant-qr/:id", async (req, res) => {
// //   const id = req.params.id;

// //   const link = `https://wa.me/14155238886?text=hi%20${id}`;
// //   const qr = await QRCode.toDataURL(link);

// //   res.send(`<img src="${qr}" /><p>${link}</p>`);
// // });

// // // =========================
// // const PORT = process.env.PORT || 3000;
// // app.listen(PORT, () => console.log("🚀 Server running"));



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
// app.use(cors());

// const sessions = {};

// // =========================
// // 💰 PRICING CONFIG
// // =========================
// const SERVICE_FEE = 250;
// const LOW_ORDER_THRESHOLD = 4000;
// const LOW_ORDER_FEE = 150;
// const HIGH_ORDER_PERCENT = 0.1;

// // =========================
// // 💰 PRICING FUNCTION
// // =========================
// function calculatePricing(cartTotal) {
//   let commission =
//     cartTotal >= LOW_ORDER_THRESHOLD
//       ? cartTotal * HIGH_ORDER_PERCENT
//       : LOW_ORDER_FEE;

//   return {
//     commission,
//     restaurantEarnings: cartTotal - commission,
//     serviceFee: SERVICE_FEE,
//     customerPays: cartTotal + SERVICE_FEE,
//   };
// }

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

// function parseMultipleItems(message) {
//   return message
//     .split(/[, ]+/)
//     .map((n) => Number(n.trim()))
//     .filter((n) => !isNaN(n) && n > 0);
// }

// async function getMenu(restaurantId) {
//   const snapshot = await db
//     .collection("menus")
//     .doc(restaurantId)
//     .collection("items")
//     .get();

//   return snapshot.docs.map((doc) => ({
//     id: doc.id,
//     ...doc.data(),
//   }));
// }

// async function getRestaurant(id) {
//   const doc = await db.collection("restaurants").doc(id).get();
//   return doc.exists ? doc.data() : null;
// }

// async function getRestaurantsByLocation(area) {
//   const snapshot = await db
//     .collection("restaurants")
//     .where("location", "==", area.toLowerCase())
//     .get();

//   return snapshot.docs.map((doc) => ({
//     id: doc.id,
//     ...doc.data(),
//   }));
// }

// async function saveOrder(order) {
//   const doc = await db.collection("orders").add({
//     ...order,
//     status: "pending",
//     createdAt: new Date(),
//   });

//   return doc.id;
// }

// async function notifyRestaurant(phone, message) {
//   await client.messages.create({
//     from: "whatsapp:+14155238886",
//     to: `whatsapp:${phone}`,
//     body: message,
//   });
// }

// async function createPaymentLink(email, amount, metadata) {
//   try {
//     const res = await axios.post(
//       "https://api.paystack.co/transaction/initialize",
//       {
//         email,
//         amount: amount * 100,
//         metadata,
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
//         },
//       }
//     );

//     return res.data.data.authorization_url;
//   } catch (err) {
//     console.error("PAYSTACK ERROR:", err?.response?.data || err.message);
//     return null;
//   }
// }

// // =========================
// // 🛒 CART UI
// // =========================
// function formatCartUI(cart) {
//   if (!cart?.length) return "🛒 *Cart is empty*";

//   let text = "🛒 *YOUR CART*\n━━━━━━━━━━━━\n\n";
//   let total = 0;

//   cart.forEach((i, index) => {
//     const subtotal = i.price * i.qty;
//     total += subtotal;

//     text += `${index + 1}. ${i.name}\nQty: ${i.qty}\n₦${subtotal}\n\n`;
//   });

//   text += `━━━━━━━━━━━━\n💰 *TOTAL: ₦${total}*\n\n`;

//   text += "🧾 Actions:\n";
//   text += "• type: remove item name\n";
//   text += "• type: 1, 2, 3 to add more\n";
//   text += "• type: checkout\n";

//   return text;
// }

// // =========================
// // 🚀 WEBHOOK
// // =========================
// app.post("/webhook", async (req, res) => {
//   const twiml = new twilio.twiml.MessagingResponse();
//   const from = req.body.From;
//   const message = (req.body.Body || "").trim().toLowerCase();

//   if (!sessions[from]) {
//     sessions[from] = {
//       cart: [],
//       restaurant: null,
//       step: "start",
//     };
//   }

//   const user = sessions[from];

//   try {
//     // =========================
//     // START
//     // =========================
//     if (message.startsWith("hi")) {
//       const id = message.split(" ")[1];

//       if (id) {
//         user.restaurant = id;
//         user.cart = [];

//         const menu = await getMenu(id);
//         let text = "🍽 MENU\n\n";

//         menu.forEach((i, idx) => {
//           text += `${idx + 1}. ${i.name} - ₦${i.price}\n`;
//         });

//         twiml.message(text);
//         return res.send(twiml.toString());
//       }

//       user.step = "location";
//       return twiml.message("📍 Enter your location (Lekki, Yaba)");
//     }

//     // =========================
//     // LOCATION
//     // =========================
//     else if (user.step === "location") {
//       const list = await getRestaurantsByLocation(message);

//       if (!list.length) {
//         twiml.message("❌ No restaurants found");
//       } else {
//         user.available = list;
//         user.step = "choose";

//         let text = "🍽 Restaurants:\n\n";
//         list.forEach((r, i) => (text += `${i + 1}. ${r.name}\n`));

//         twiml.message(text);
//       }
//     }

//     // =========================
//     // SELECT RESTAURANT
//     // =========================
//     else if (user.step === "choose") {
//       const index = Number(message) - 1;
//       const selected = user.available?.[index];

//       if (!selected) return twiml.message("❌ Invalid choice");

//       user.restaurant = selected.id;
//       user.cart = [];

//       const menu = await getMenu(selected.id);
//       let text = "🍽 MENU\n\n";

//       menu.forEach((i, idx) => {
//         text += `${idx + 1}. ${i.name} - ₦${i.price}\n`;
//       });

//       twiml.message(text);
//     }

//     // =========================
//     // MULTI ADD ITEMS
//     // =========================
//     else if (/^[\d,\s]+$/.test(message)) {
//       if (!user.restaurant) return twiml.message("Send hi first");

//       const menu = await getMenu(user.restaurant);
//       const numbers = parseMultipleItems(message);

//       numbers.forEach((num) => {
//         const item = menu[num - 1];
//         if (!item) return;

//         const existing = user.cart.find((i) => i.id === item.id);

//         if (existing) existing.qty++;
//         else user.cart.push({ ...item, qty: 1 });
//       });

//       twiml.message(`✅ Added *${item.name}*\n\n`  + formatCartUI(user.cart));
//     }

//     // =========================
//     // CHECKOUT
//     // =========================
//     else if (message === "checkout") {
//       if (!user.cart.length) return twiml.message("Cart empty");

//       let cartTotal = 0;
//       let text = "🧾 ORDER\n\n";

//       user.cart.forEach((i) => {
//         const subtotal = i.price * i.qty;
//         cartTotal += subtotal;
//         text += `${i.name} x${i.qty} - ₦${subtotal}\n`;
//       });

//       const pricing = calculatePricing(cartTotal);

//       const link = await createPaymentLink("user@email.com", pricing.customerPays, {
//         phone: from,
//         restaurant: user.restaurant,
//         cart: JSON.stringify(user.cart),
//       });

//       twiml.message(
//         `${text}

// Food: ₦${cartTotal}
// Service Fee: ₦${pricing.serviceFee}
// Total: ₦${pricing.customerPays}

// Pay: ${link}`
//       );
//     }

//     // =========================
//     // RESET
//     // =========================
//     else if (message === "reset") {
//       sessions[from] = { cart: [], restaurant: null, step: "start" };
//       twiml.message("Reset done. Send hi");
//     }

//     // =========================
//     // DEFAULT
//     // =========================
//     else {
//       twiml.message("Send hi to start");
//     }

//     return res.send(twiml.toString());
//   } catch (err) {
//     console.error("🔥 ERROR:", err);
//     twiml.message("System error. Try again.");
//     return res.send(twiml.toString());
//   }
// });

// // =========================
// // SERVER
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
// 💰 PRICING CONFIG
// =========================
const SERVICE_FEE = 250;
const LOW_ORDER_THRESHOLD = 4000;
const LOW_ORDER_FEE = 150;
const HIGH_ORDER_PERCENT = 0.1;

// =========================
// 💰 PRICING FUNCTION
// =========================
function calculatePricing(cartTotal) {
  let commission =
    cartTotal >= LOW_ORDER_THRESHOLD
      ? cartTotal * HIGH_ORDER_PERCENT
      : LOW_ORDER_FEE;

  return {
    commission,
    restaurantEarnings: cartTotal - commission,
    serviceFee: SERVICE_FEE,
    customerPays: cartTotal + SERVICE_FEE,
  };
}

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
async function getMenu(restaurantId) {
  const snapshot = await db
    .collection("menus")
    .doc(restaurantId)
    .collection("items")
    .get();

  const items = [];
  snapshot.forEach((doc) => items.push({ id: doc.id, ...doc.data() }));
  return items;
}

async function getRestaurant(id) {
  const doc = await db.collection("restaurants").doc(id).get();
  return doc.exists ? doc.data() : null;
}

async function getRestaurantsByLocation(area) {
  const snapshot = await db
    .collection("restaurants")
    .where("location", "==", area.toLowerCase())
    .get();

  const list = [];
  snapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
  return list;
}

async function saveOrder(order) {
  const doc = await db.collection("orders").add({
    ...order,
    status: "pending",
    createdAt: new Date(),
  });

  return doc.id;
}

async function notifyRestaurant(phone, message) {
  await client.messages.create({
    from: "whatsapp:+14155238886",
    to: `whatsapp:${phone}`,
    body: message,
  });
}

async function createPaymentLink(email, amount, metadata) {
  try {
    const res = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: amount * 100,
        metadata,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
        },
      }
    );

    return res.data.data.authorization_url;
  } catch (err) {
    console.log(err.response?.data || err.message);
    return null;
  }
}

// =========================
// 🧠 CART FORMAT
// =========================
function formatCartUI(cart) {
  if (!cart.length) return "🛒 Cart is empty";

  let text = "🛒 *YOUR CART*\n━━━━━━━━━━━━━━\n\n";
  let total = 0;

  cart.forEach((i, index) => {
    const subtotal = i.price * i.qty;
    total += subtotal;

    text += `${index + 1}. ${i.name}\nQty: ${i.qty}\n₦${subtotal}\n\n`;
  });

  text += `━━━━━━━━━━━━━━\n💰 Total: ₦${total}`;
  text += "🧾 Actions:\n";
  text += "• type: remove burger\n";
  text += "• type: checkout\n";
  text += "• type: 1, 2, 3 to add more\n";
  return text;
}

// =========================
// ➕ MULTI INPUT PARSER
// =========================
function parseMultipleItems(input) {
  return input
    .split(",")
    .map((n) => parseInt(n.trim()))
    .filter((n) => !isNaN(n));
}

// =========================
// 🍽 SEND MENU (FIXED TITLE)
// =========================
async function sendMenuText(restaurantId, twiml, res) {
  const menu = await getMenu(restaurantId);
  const restaurant = await getRestaurant(restaurantId);

  if (!menu.length || !restaurant) {
    twiml.message("❌ Menu not available");
    return res.type("text/xml").send(twiml.toString());
  }

  let text =
    `Welcome to 🍽 ${restaurant.name}. Please checkout our menu to place your order.\n\n`;

  menu.forEach((item, i) => {
    text += `${i + 1}. ${item.name} – ₦${item.price}\n`;
  });

  text += "\nReply with number(s) like 1,2,3";

  twiml.message(text);
  return res.type("text/xml").send(twiml.toString());
}

// =========================
// 🚀 WEBHOOK
// =========================
app.post("/webhook", async (req, res) => {
  const twiml = new twilio.twiml.MessagingResponse();

  const from = req.body.From;
  const message = (req.body.Body || "").trim().toLowerCase();

  if (!sessions[from]) {
    sessions[from] = {
      cart: [],
      restaurant: null,
      step: "start",
    };
  }

  const user = sessions[from];

  try {
    // =========================
    // START
    // =========================
    if (message.startsWith("hi")) {
      const id = message.split(" ")[1];

      if (id) {
        user.restaurant = id;
        user.cart = [];
        await sendMenuText(id, twiml, res);
        return;
      }

      user.step = "location";
      twiml.message("📍 Enter your area (Lekki, Yaba)");
    }

    // =========================
    // LOCATION
    // =========================
    else if (user.step === "location") {
      const list = await getRestaurantsByLocation(message);

      if (!list.length) {
        twiml.message("❌ No restaurants found");
      } else {
        user.available = list;
        user.step = "choose";

        let text = "🍽 Restaurants:\n";
        list.forEach((r, i) => {
          text += `${i + 1}. ${r.name}\n`;
        });

        twiml.message(text + "\nReply with number");
      }
    }

    // =========================
    // SELECT RESTAURANT
    // =========================
    else if (user.step === "choose") {
      const index = Number(message) - 1;
      const selected = user.available[index];

      if (!selected) return twiml.message("❌ Invalid choice");

      user.restaurant = selected.id;
      user.cart = [];

      await sendMenuText(selected.id, twiml, res);
      return;
    }

    // =========================
    // ADD MULTIPLE ITEMS
    // =========================
    else if (/^[\d,\s]+$/.test(message)) {
      if (!user.restaurant) {
        return twiml.message("⚠️ Type hi first");
      }

      const menu = await getMenu(user.restaurant);
      const numbers = parseMultipleItems(message);

      numbers.forEach((num) => {
        const item = menu[num - 1];
        if (!item) return;

        const existing = user.cart.find((i) => i.id === item.id);

        if (existing) existing.qty++;
        else user.cart.push({ ...item, qty: 1 });
      });
twiml.message(
  `✅ Added:\n• ${numbers
    .map((n) => menu[n - 1]?.name)
    .filter(Boolean)
    .join("\n• ")}\n\n` + formatCartUI(user.cart)
);
    }

    // =========================
    // REMOVE
    // =========================
    // else if (message.startsWith("remove ")) {
    //   const name = message.replace("remove ", "");

    //   user.cart = user.cart.filter((i) => i.name !== name);

    //   twiml.message("🗑 Removed\n\n" + formatCartUI(user.cart));
    // }


    else if (message.startsWith("remove ")) {
  const itemName = message.replace("remove ", "").trim().toLowerCase();

  const index = user.cart.findIndex((i) =>
    i.name.toLowerCase().includes(itemName)
  );

  if (index === -1) {
    twiml.message(`❌ Item not found: "${itemName}"`);
  } else {
    const removed = user.cart[index];

    if (removed.qty > 1) {
      removed.qty -= 1;
      twiml.message(
        `➖ Removed 1 ${removed.name}\n\n` +
        formatCartUI(user.cart)
      );
    } else {
      user.cart.splice(index, 1);
      twiml.message(
        `🗑️ Removed ${removed.name}\n\n` +
        formatCartUI(user.cart)
      );
    }
  }
}
    // =========================
    // CHECKOUT
    // =========================
    else if (message === "checkout") {
      if (!user.cart.length) {
        return twiml.message("🛒 Cart empty");
      }

      let cartTotal = 0;

      user.cart.forEach((i) => {
        cartTotal += i.price * i.qty;
      });

      const pricing = calculatePricing(cartTotal);

      const link = await createPaymentLink("user@email.com", pricing.customerPays, {
        phone: from,
        restaurant: user.restaurant,
        cart: JSON.stringify(user.cart),
      });

      twiml.message(
        `🧾 ORDER\n\n${formatCartUI(user.cart)}\n\n` +
          `🚚 Fee: ₦${pricing.serviceFee}\n` +
          `💰 Total: ₦${pricing.customerPays}\n\n💳 Pay:\n${link}`
      );
    }

    // =========================
    // RESET
    // =========================
    else if (message === "reset") {
      sessions[from] = {};
      twiml.message("🔄 Reset done. Send hi");
    }

    // =========================
    // DEFAULT
    // =========================
    else {
      twiml.message("Send 'hi' to start");
    }

    res.type("text/xml").send(twiml.toString());
  } catch (err) {
    console.log(err);
    twiml.message("⚠️ Error occurred");
    res.type("text/xml").send(twiml.toString());
  }
});

// =========================
app.listen(3000, () => console.log("🚀 Server running"));