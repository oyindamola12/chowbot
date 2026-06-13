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

// // // const sessions = {};

// // // =========================
// // // 🔥 FIREBASE
// // // =========================
// // const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

// // admin.initializeApp({
// //   credential: admin.credential.cert(serviceAccount),
// // });

// // const db = admin.firestore();

// // // =========================
// // // 💰 PRICING CONFIG
// // // =========================
// // const SERVICE_FEE = 250;
// // const LOW_ORDER_THRESHOLD = 4000;
// // const LOW_ORDER_FEE = 150;
// // const HIGH_ORDER_PERCENT = 0.1;

// // // =========================
// // // 💰 PRICING FUNCTION
// // // =========================
// // function calculatePricing(cartTotal) {
// //   let commission =
// //     cartTotal >= LOW_ORDER_THRESHOLD
// //       ? cartTotal * HIGH_ORDER_PERCENT
// //       : LOW_ORDER_FEE;

// //   return {
// //     commission,
// //     restaurantEarnings: cartTotal - commission,
// //     serviceFee: SERVICE_FEE,
// //     customerPays: cartTotal + SERVICE_FEE,
// //   };
// // }





// // // =========================
// // // 🔥 TWILIO
// // // =========================
// // const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

// // // =========================
// // // 🔧 HELPERS
// // // =========================
// // async function getMenu(restaurantId) {
// //   const snapshot = await db
// //     .collection("menus")
// //     .doc(restaurantId)
// //     .collection("items")
// //     .get();

// //   const items = [];
// //   snapshot.forEach((doc) =>
// //     items.push({ id: doc.id, ...doc.data() })
// //   );
// //   return items;
// // }

// // async function getRestaurant(id) {
// //   const doc = await db.collection("restaurants").doc(id).get();
// //   return doc.exists ? doc.data() : null;
// // }

// // async function getRestaurantsByLocation(area) {
// //   const snapshot = await db
// //     .collection("restaurants")
// //     .where("location", "==", area.toLowerCase())
// //     .get();

// //   const list = [];
// //   snapshot.forEach((doc) =>
// //     list.push({ id: doc.id, ...doc.data() })
// //   );
// //   return list;
// // }

// // async function notifyRestaurant(phone, message) {
// //   await client.messages.create({
// //     from: "whatsapp:+14155238886",
// //     to: `whatsapp:${phone}`,
// //     body: message,
// //   });
// // }

// // async function createPaymentLink(email, amount, metadata) {
// //   try {
// //     const res = await axios.post(
// //       "https://api.paystack.co/transaction/initialize",
// //       {
// //         email,
// //         amount: amount * 100,
// //         metadata,
// //       },
// //       {
// //         headers: {
// //           Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
// //         },
// //       }
// //     );

// //     return res.data.data.authorization_url;
// //   } catch (err) {
// //     console.log(err.response?.data || err.message);
// //     return null;
// //   }
// // }

// // // =========================
// // // 🧠 CART
// // // =========================
// // function formatCartUI(cart) {
// //   if (!cart.length) return "🛒 Cart is empty";

// //   let text = "🛒 *YOUR CART*\n━━━━━━━━━━━━━━\n\n";
// //   let total = 0;

// //   cart.forEach((i, index) => {
// //     const subtotal = i.price * i.qty;
// //     total += subtotal;

// //     text += `${index + 1}. ${i.name}\nQty: ${i.qty}\n₦${subtotal}\n\n`;
// //   });

// //   text += `━━━━━━━━━━━━━━\n💰 Total: ₦${total}\n`;
// //   text += "🧾 Actions:\n";
// //   text += "• type: remove item name\n";
// //   text += "• type: 1, 2, 3 to add more\n";
// //   text += "• type: checkout\n";

// //   return text;
// // }

// // // =========================
// // // MULTI INPUT
// // // =========================
// // function parseMultipleItems(input) {
// //   return input
// //     .split(",")
// //     .map((n) => parseInt(n.trim()))
// //     .filter((n) => !isNaN(n));
// // }

// // // =========================
// // // 🍽 MENU
// // // =========================
// // // async function sendMenuText(restaurantId, twiml, res) {
// // //   const menu = await getMenu(restaurantId);
// // //   const restaurant = await getRestaurant(restaurantId);

// // //   if (!menu.length || !restaurant) {
// // //     twiml.message("❌ Menu not available");
// // //     return res.type("text/xml").send(twiml.toString());
// // //   }

// // //   let text =
// // //     `Welcome to 🍽 ${restaurant.name}. Please checkout our menu to place your order.\n\n`;

// // //   menu.forEach((item, i) => {
// // //     text += `${i + 1}. ${item.name} – ₦${item.price}\n`;
// // //   });

// // //   text += "\nReply with number(s) like 1,2,3";

// // //   twiml.message(text);
// // //   res.type("text/xml").send(twiml.toString());
// // // }
// // async function sendMenuText(restaurantId, twiml, res) {
// //   const menu = await getMenu(restaurantId);
// //   const restaurant = await getRestaurant(restaurantId);
// //   if (!menu.length || !restaurant) {
// //     twiml.message("❌ Menu not available");
// //     return res.type("text/xml").send(twiml.toString());
// //   }
// //   // ... build text
// //   twiml.message(text);
// //   res.type("text/xml").send(twiml.toString());
// // }
// // // ===============================
// // // 🔥 ID GENERATOR FUNCTION
// // // ===============================
// // function generateRestaurantId(name) {
// //   const cleanName = name
// //     .toLowerCase()
// //     .trim()
// //     .replace(/[^a-z0-9]+/g, "-")
// //     .replace(/^-+|-+$/g, "");

// //   const uniquePart =
// //     Date.now().toString(36) +
// //     Math.random().toString(36).substring(2, 6);

// //   return `${cleanName}-${uniquePart}`;
// // }

// // app.post("/register-restaurant", async (req, res) => {
// //   try {
// //     const {
// //       name,
// //       phone,
// //       state,
// //       localGovt,
// //       deliveryFee,
// //       location,
// //     } = req.body;

// //     // validation
// //     if (!name || !phone || !state || !localGovt || !deliveryFee||!location) {
// //       return res.json({
// //         success: false,
// //         message: "Missing required fields"
// //       });
// //     }

// //      // =========================
// //     // 2. CHECK DUPLICATE PHONE
// //     // =========================
// //     const existing = await db
// //       .collection("restaurants")
// //       .where("phone", "==", phone)
// //       .get();

// //     if (!existing.empty) {
// //       return res.json({
// //         success: false,
// //         message: "⚠️ This WhatsApp number is already registered. Please use a different number."
// //       });
// //     }

// //     // 🔥 generate custom ID
    
// //     const restaurantId = generateRestaurantId(name);

// //     // 💾 save to Firestore
// //     await db.collection("restaurants").doc(restaurantId).set({
// //       restaurantId,
// //       name,
// //       phone,
// //       state,
// //       localGovt,
// //       address:location,
// //       deliveryFee: Number(deliveryFee),

// //       createdAt: new Date()
// //     });

// //     // response
// //     res.json({
// //       success: true,
// //       restaurantId,
// //       whatsappLink: `https://wa.me/${phone}`
// //     });

// //   } catch (err) {
// //     console.error(err);
// //     res.json({
// //       success: false,
// //       message: "Server error"
// //     });
// //   }
// // });

// // // =========================
// // // WEBHOOK
// // // =========================
// // // app.post("/webhook", async (req, res) => {
// // //   const twiml = new twilio.twiml.MessagingResponse();

// // //   const from = req.body.From;
// // //   const message = (req.body.Body || "").trim().toLowerCase();

// // //   // if (!sessions[from]) {
// // //   //   sessions[from] = {
// // //   //     cart: [],
// // //   //     restaurant: null,
// // //   //     step: "start",
// // //   //   };
// // //   // }

// // //   // const user = sessions[from];


// // // const { getSession, saveSession, deleteSession } = require("./sessionManager");

// // // let user = await getSession(from);

// // // // If no step (fresh user), ensure defaults
// // // if (!user.step) {
// // //   user = {
// // //     cart: [],
// // //     restaurant: null,
// // //     step: "start",
// // //     available: [],
// // //   };
// // // }

// // //   try {

// // //     // START
// // //     if (message.startsWith("hi")) {
// // //       const id = message.split(" ")[1];

// // //       if (id) {
// // //         user.restaurant = id;
// // //         user.cart = [];
// // //         await sendMenuText(id, twiml, res);
// // //         return;
// // //       }

// // //       user.step = "location";
// // //       twiml.message("📍 Enter your area (Lekki, Yaba)");
// // //     }

// // //     // LOCATION
// // //     else if (user.step === "location") {
// // //       const list = await getRestaurantsByLocation(message);

// // //       if (!list.length) {
// // //         twiml.message("❌ No restaurants found");
// // //       } else {
// // //         user.available = list;
// // //         user.step = "choose";

// // //         let text = "🍽 Restaurants:\n";
// // //         list.forEach((r, i) => {
// // //           text += `${i + 1}. ${r.name}\n`;
// // //         });

// // //         twiml.message(text + "\nReply with number");
// // //       }
// // //     }

// // //     // CHOOSE RESTAURANT
// // //     else if (user.step === "choose") {
// // //       const index = Number(message) - 1;
// // //       const selected = user.available[index];

// // //       if (!selected) return twiml.message("❌ Invalid choice");

// // //       user.restaurant = selected.id;
// // //       user.cart = [];

// // //       await sendMenuText(selected.id, twiml, res);
// // //       return;
// // //     }


// // //     // ADD ITEMS
// // //     else if (/^[\d,\s]+$/.test(message)) {
// // //       if (!user.restaurant) {
// // //         return twiml.message("⚠️ Type hi first");
// // //       }

// // //       const menu = await getMenu(user.restaurant);
// // //       const numbers = parseMultipleItems(message);

// // //       let added = [];

// // //       numbers.forEach((num) => {
// // //         const item = menu[num - 1];
// // //         if (!item) return;

// // //         const existing = user.cart.find((i) => i.id === item.id);

// // //         if (existing) existing.qty++;
// // //         else user.cart.push({ ...item, qty: 1 });
// // //         added.push(item.name);
// // //       });
// // //   await saveSession(from, user);
// // //       twiml.message(
// // //         `✅ Added:\n• ${added.join("\n• ")}\n\n` +
// // //         formatCartUI(user.cart)
// // //       );
// // //     }


// // //     //CART

// // //     else if (message === "cart") {
// // //   if (!user.cart.length) {
// // //     twiml.message("🛒 Cart is empty");
// // //   } else {
// // //     twiml.message(formatCartUI(user.cart));
// // //   }
// // // }
// // //     // REMOVE
// // //     else if (message.startsWith("remove ")) {
// // //       const name = message.replace("remove ", "").toLowerCase();

// // //       const index = user.cart.findIndex((i) =>
// // //         i.name.toLowerCase().includes(name)
// // //       );

// // //       if (index === -1) {
// // //         twiml.message("❌ Item not found");
// // //       } else {
// // //         const item = user.cart[index];

// // //         if (item.qty > 1) {
// // //           item.qty--;
// // //           twiml.message(`➖ Removed 1 ${item.name}\n\n` + formatCartUI(user.cart));
// // //         } else {
// // //           user.cart.splice(index, 1);
// // //           twiml.message(`🗑 Removed ${item.name}\n\n` + formatCartUI(user.cart));
// // //         }
// // //       }
// // //     }

// // //     // CHECKOUT (FIXED ORDER DELIVERY)
// // // //     else if (message === "checkout") {
// // // //       if (!user.cart.length) {
// // // //         return twiml.message("🛒 Cart empty");
// // // //       }

// // // //       let cartTotal = 0;

// // // //       user.cart.forEach((i) => {
// // // //         cartTotal += i.price * i.qty;
// // // //       });

// // // //       const pricing = calculatePricing(cartTotal);

// // // //       const link = await createPaymentLink(
// // // //         "user@email.com",
// // // //         pricing.customerPays,
// // // //         {
// // // //           phone: from,
// // // //           restaurant: user.restaurant,
// // // //           cart: JSON.stringify(user.cart),
// // // //           cartTotal,
// // // //         }
// // // //       );

// // // //       // ✅ FIX: ALWAYS SEND ORDER TO RESTAURANT HERE (NO FLOW CHANGE)
// // // //       const restaurant = await getRestaurant(user.restaurant);

// // // //       if (restaurant?.phone) {
// // // //         let orderMsg = `📦 NEW ORDER\n\n`;

// // // //         user.cart.forEach((i) => {
// // // //           orderMsg += `${i.name} x${i.qty} – ₦${i.price * i.qty}\n`;
// // // //         });

// // // //         orderMsg += `
// // // // ━━━━━━━━━━━━━━
// // // // 💰 Total: ₦${cartTotal}
// // // // 🚚 Fee: ₦${pricing.serviceFee}
// // // // 🧾 Commission: ₦${pricing.commission}
// // // // `;

// // // //         await notifyRestaurant(restaurant.phone, orderMsg);
// // // //       }

// // // //       twiml.message(
// // // //         `🧾 ORDER\n\n${formatCartUI(user.cart)}\n\n💳 Pay:\n${link}`
// // // //       );
// // // //     }

// // // else if (message === "checkout") {
// // //   if (!user.cart.length) {
// // //     return twiml.message("🛒 Cart empty");
// // //   }

// // //   let cartTotal = 0;

// // //   user.cart.forEach((i) => {
// // //     cartTotal += i.price * i.qty;
// // //   });

// // //   const pricing = calculatePricing(cartTotal);

// // //   // create pending order ID
// // //   const orderId = uuidv4();

// // //   // store pending order in Firebase (IMPORTANT FIX)
// // //   await db.collection("pendingOrders").doc(orderId).set({
// // //     phone: from,
// // //     restaurant: user.restaurant,
// // //     cart: user.cart,
// // //     cartTotal,
// // //     status: "pending_payment",
// // //     createdAt: new Date()
// // //   });
// // // const link = await createPaymentLink(
// // //   "user@email.com",
// // //   pricing.customerPays,
// // //   {
// // //     orderId: orderId.toString(),
// // //     phone: from,
// // //     restaurant: user.restaurant,
// // //     cart: JSON.stringify(user.cart)
// // //   }
// // // );

// // //   twiml.message(
// // //     `🧾 ORDER SUMMARY\n\n` +
// // //       `${formatCartUI(user.cart)}\n\n` +
// // //       `🚚 Fee: ₦${pricing.serviceFee}\n` +
// // //       `💰 Total: ₦${pricing.customerPays}\n\n` +
// // //       `💳 Pay here:\n${link}`
// // //   );
// // // }
// // //     // RESET
// // //    else if (message === "reset") {
// // //   await deleteSession(from);
// // //   twiml.message("🔄 Reset done. Send hi");
// // // }

// // //     // DEFAULT
// // //     else {
// // //       twiml.message("Send 'hi' to start");
// // //     }

// // //     res.type("text/xml").send(twiml.toString());
// // //   } catch (err) {
// // //     console.log(err);
// // //     twiml.message("⚠️ Error occurred");
// // //     res.type("text/xml").send(twiml.toString());
// // //   }
// // // });

// // // =========================
// // // WEBHOOK (FULLY PERSISTED)
// // // =========================
// // app.post("/webhook", async (req, res) => {
// //   const twiml = new twilio.twiml.MessagingResponse();

// //   const from = req.body.From;
// //   const message = (req.body.Body || "").trim().toLowerCase();

// //   // ✅ Load session from Firestore
// //   const { getSession, saveSession, deleteSession } = require("./sessionManager");
// //   let user = await getSession(from);

// //   // Ensure defaults if this is a completely new user
// //   if (!user.step) {
// //     user = {
// //       cart: [],
// //       restaurant: null,
// //       step: "start",
// //       available: [],
// //     };
// //     await saveSession(from, user); // ✅ SESSION SAVED (initial)
// //   }

// //   try {
// //     // ========== START ==========
// //     if (message.startsWith("hi")) {
// //       const id = message.split(" ")[1];
// //       if (id) {
// //         user.restaurant = id;
// //         user.cart = [];
// //         await saveSession(from, user); // ✅ SESSION SAVED
// //         await sendMenuText(id, twiml, res);
// //         return;
// //       }
// //       user.step = "location";
// //       await saveSession(from, user); // ✅ SESSION SAVED
// //       twiml.message("📍 Enter your area (Lekki, Yaba)");
// //     }

// //     // ========== LOCATION ==========
// //     else if (user.step === "location") {
// //       const list = await getRestaurantsByLocation(message);
// //       if (!list.length) {
// //         twiml.message("❌ No restaurants found");
// //       } else {
// //         user.available = list;
// //         user.step = "choose";
// //         await saveSession(from, user); // ✅ SESSION SAVED
// //         let text = "🍽 Restaurants:\n";
// //         list.forEach((r, i) => {
// //           text += `${i + 1}. ${r.name}\n`;
// //         });
// //         twiml.message(text + "\nReply with number");
// //       }
// //     }

// //     // ========== CHOOSE RESTAURANT ==========
// //     else if (user.step === "choose") {
// //       const index = Number(message) - 1;
// //       const selected = user.available[index];
// //       if (!selected) {
// //         twiml.message("❌ Invalid choice");
// //       } else {
// //         user.restaurant = selected.id;
// //         user.cart = [];
// //         user.step = null; // clear step
// //         await saveSession(from, user); // ✅ SESSION SAVED
// //         await sendMenuText(selected.id, twiml, res);
// //         return;
// //       }
// //     }

// //     // ========== ADD ITEMS (numbers or comma‑separated) ==========
// //     else if (/^[\d,\s]+$/.test(message)) {
// //       if (!user.restaurant) {
// //         twiml.message("⚠️ Type hi first");
// //       } else {
// //         const menu = await getMenu(user.restaurant);
// //         const numbers = parseMultipleItems(message);
// //         let added = [];
// //         numbers.forEach((num) => {
// //           const item = menu[num - 1];
// //           if (!item) return;
// //           const existing = user.cart.find((i) => i.id === item.id);
// //           if (existing) existing.qty++;
// //           else user.cart.push({ ...item, qty: 1 });
// //           added.push(item.name);
// //         });
// //         if (added.length) {
// //           await saveSession(from, user); // ✅ SESSION SAVED
// //           twiml.message(
// //             `✅ Added:\n• ${added.join("\n• ")}\n\n` +
// //             formatCartUI(user.cart)
// //           );
// //         } else {
// //           twiml.message("❌ No valid item numbers");
// //         }
// //       }
// //     }

// //     // ========== REMOVE ITEM ==========
// //     else if (message.startsWith("remove ")) {
// //       const name = message.replace("remove ", "").toLowerCase();
// //       const index = user.cart.findIndex((i) =>
// //         i.name.toLowerCase().includes(name)
// //       );
// //       if (index === -1) {
// //         twiml.message("❌ Item not found");
// //       } else {
// //         const item = user.cart[index];
// //         if (item.qty > 1) {
// //           item.qty--;
// //           twiml.message(`➖ Removed 1 ${item.name}\n\n` + formatCartUI(user.cart));
// //         } else {
// //           user.cart.splice(index, 1);
// //           twiml.message(`🗑 Removed ${item.name}\n\n` + formatCartUI(user.cart));
// //         }
// //         await saveSession(from, user); // ✅ SESSION SAVED
// //       }
// //     }

// //     // ========== CHECKOUT ==========
// //     else if (message === "checkout") {
// //       if (!user.cart.length) {
// //         twiml.message("🛒 Cart empty");
// //       } else {
// //         let cartTotal = 0;
// //         user.cart.forEach((i) => {
// //           cartTotal += i.price * i.qty;
// //         });
// //         const pricing = calculatePricing(cartTotal);

// //         const orderId = uuidv4();
// //         await db.collection("pendingOrders").doc(orderId).set({
// //           phone: from,
// //           restaurant: user.restaurant,
// //           cart: user.cart,
// //           cartTotal,
// //           status: "pending_payment",
// //           createdAt: new Date()
// //         });

// //         const link = await createPaymentLink(
// //           "user@email.com",
// //           pricing.customerPays,
// //           {
// //             orderId: orderId.toString(),
// //             phone: from,
// //             restaurant: user.restaurant,
// //             cart: JSON.stringify(user.cart)
// //           }
// //         );

// //         // After checkout, we don't clear the cart yet – wait for payment.
// //         // But we do NOT change session step, so the user can still see cart.
// //         twiml.message(
// //           `🧾 ORDER SUMMARY\n\n` +
// //           `${formatCartUI(user.cart)}\n\n` +
// //           `🚚 Fee: ₦${pricing.serviceFee}\n` +
// //           `💰 Total: ₦${pricing.customerPays}\n\n` +
// //           `💳 Pay here:\n${link}`
// //         );
// //       }
// //     }

// //     // ========== RESET ==========
// //     else if (message === "reset") {
// //       await deleteSession(from);
// //       twiml.message("🔄 Reset done. Send hi");
// //     }

// //     // ========== CART (optional extra command) ==========
// //     else if (message === "cart") {
// //       if (!user.cart.length) {
// //         twiml.message("🛒 Cart is empty");
// //       } else {
// //         twiml.message(formatCartUI(user.cart));
// //       }
// //     }

// //     // ========== DEFAULT ==========
// //     else {
// //       twiml.message("Send 'hi' to start");
// //     }

// //     // Send response
// //     res.type("text/xml").send(twiml.toString());

// //   } catch (err) {
// //     console.error("Webhook error:", err);
// //     twiml.message("⚠️ Error occurred. Please try again.");
// //     res.type("text/xml").send(twiml.toString());
// //   }
// // });
// // app.post("/paystack/webhook", async (req, res) => {
// //       console.log("🔥 PAYSTACK HIT");
// //   try {
// //     const event = req.body;

// //     console.log("EVENT TYPE:", event.event);

// //     // ✅ ONLY process successful payments
// //     if (event.event !== "charge.success") {
// //       return res.sendStatus(200);
// //     }

// //     const data = event.data;
// //     const metadata = data.metadata;

// //     if (!metadata || !metadata.orderId) {
// //       console.log("❌ Missing metadata");
// //       return res.sendStatus(200);
// //     }

// //     const orderId = metadata.orderId;

// //     console.log("ORDER ID:", orderId);

// //     // =========================
// //     // GET PENDING ORDER
// //     // =========================
// //     const orderRef = db.collection("pendingOrders").doc(orderId);
// //     const orderSnap = await orderRef.get();

// //     if (!orderSnap.exists) {
// //       console.log("❌ Order not found in DB");
// //       return res.sendStatus(200);
// //     }

// //     const order = orderSnap.data();

// //     console.log("✅ ORDER FOUND:", order);

// //     const restaurant = await getRestaurant(order.restaurant);

// //     if (!restaurant) {
// //       console.log("❌ Restaurant not found");
// //       return res.sendStatus(200);
// //     }

// //     console.log("📞 Restaurant phone:", restaurant.phone);

// //     // =========================
// //     // CALCULATE TOTAL
// //     // =========================
// //     const cartTotal = order.cart.reduce(
// //       (sum, i) => sum + i.price * i.qty,
// //       0
// //     );

// //     const pricing = calculatePricing(cartTotal);

// //     // =========================
// //     // SAVE FINAL ORDER
// //     // =========================
// //     await db.collection("orders").add({
// //       ...order,
// //       paymentStatus: "paid",
// //       createdAt: new Date()
// //     });

// //     // =========================
// //     // FORMAT MESSAGE
// //     // =========================
// //     let msg = `📦 NEW PAID ORDER\n\n`;

// //     order.cart.forEach(i => {
// //       msg += `${i.name} x${i.qty} – ₦${i.price * i.qty}\n`;
// //     });

// //     msg += `
// // ━━━━━━━━━━━━━━
// // 💰 Total: ₦${cartTotal}
// // 💸 Earnings: ₦${pricing.restaurantEarnings}
// // 🧾 Commission: ₦${pricing.commission}
// // Customer: ${order.phone}
// // `;

// //     // =========================
// //     // SEND TO RESTAURANT
// //     // =========================
// //     try {
// //       await client.messages.create({
// //         from: "whatsapp:+14155238886",
// //         to: `whatsapp:${restaurant.phone}`, // ⚠️ MUST be +234...
// //         body: msg,
// //       });

// //       console.log("✅ MESSAGE SENT TO RESTAURANT");

// //     } catch (err) {
// //       console.log("❌ TWILIO ERROR:", err.message);
// //     }

// //     // =========================
// //     // UPDATE STATUS
// //     // =========================
// //     await orderRef.update({ status: "paid" });

// //     res.sendStatus(200);

// //   } catch (err) {
// //     console.log("🔥 WEBHOOK ERROR:", err);
// //     res.sendStatus(500);
// //   }
// // });
// // // =========================
// // app.listen(3000, () => console.log("🚀 Server running"));





// // require("dotenv").config();
// // const express = require("express");
// // const twilio = require("twilio");
// // const bodyParser = require("body-parser");
// // const admin = require("firebase-admin");
// // const axios = require("axios");
// // const cors = require("cors");
// // const { v4: uuidv4 } = require("uuid");

// // const app = express();

// // app.use(express.urlencoded({ extended: false }));
// // app.use(express.json());
// // app.use(bodyParser.json());
// // app.use(cors());

// // const sessions = {};

// // // =========================
// // // 💰 PRICING CONFIG
// // // =========================
// // const SERVICE_FEE = 250;
// // const LOW_ORDER_THRESHOLD = 4000;
// // const LOW_ORDER_FEE = 150;
// // const HIGH_ORDER_PERCENT = 0.1;

// // // =========================
// // // 🚚 AREA DISTANCE MATRIX
// // // =========================
// // const areaDistanceMatrix = {
// //   lekki: { lekki: 1, ajah: 2, yaba: 4 },
// //   ajah: { lekki: 2, ajah: 1, yaba: 5 },
// //   yaba: { lekki: 4, ajah: 5, yaba: 1 }
// // };

// // // =========================
// // // 💰 PRICING
// // // =========================
// // function calculatePricing(cartTotal) {
// //   let commission =
// //     cartTotal >= LOW_ORDER_THRESHOLD
// //       ? cartTotal * HIGH_ORDER_PERCENT
// //       : LOW_ORDER_FEE;

// //   return {
// //     commission,
// //     restaurantEarnings: cartTotal - commission,
// //     serviceFee: SERVICE_FEE,
// //     customerPays: cartTotal + SERVICE_FEE,
// //   };
// // }

// // // =========================
// // // 🚚 DELIVERY CALCULATION
// // // =========================
// // function calculateDeliveryFee(restaurantArea, userArea) {
// //   const distance =
// //     areaDistanceMatrix[restaurantArea]?.[userArea] || 3;

// //   const baseFee = 300;

// //   return baseFee + distance * 200;
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
// // async function getMenu(restaurantId) {
// //   const snapshot = await db
// //     .collection("menus")
// //     .doc(restaurantId)
// //     .collection("items")
// //     .get();

// //   const items = [];
// //   snapshot.forEach((doc) =>
// //     items.push({ id: doc.id, ...doc.data() })
// //   );
// //   return items;
// // }

// // async function getRestaurant(id) {
// //   const doc = await db.collection("restaurants").doc(id).get();
// //   return doc.exists ? doc.data() : null;
// // }

// // async function getRestaurantsByLocation(area) {
// //   const snapshot = await db
// //     .collection("restaurants")
// //     .where("address.area", "==", area.toLowerCase())
// //     .get();

// //   const list = [];
// //   snapshot.forEach((doc) =>
// //     list.push({ id: doc.id, ...doc.data() })
// //   );
// //   return list;
// // }

// // async function notifyRestaurant(phone, message) {
// //   await client.messages.create({
// //     from: "whatsapp:+14155238886",
// //     to: `whatsapp:${phone}`,
// //     body: message,
// //   });
// // }

// // async function createPaymentLink(email, amount, metadata) {
// //   try {
// //     const res = await axios.post(
// //       "https://api.paystack.co/transaction/initialize",
// //       {
// //         email,
// //         amount: amount * 100,
// //         metadata,
// //       },
// //       {
// //         headers: {
// //           Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
// //         },
// //       }
// //     );

// //     return res.data.data.authorization_url;
// //   } catch (err) {
// //     console.log(err.response?.data || err.message);
// //     return null;
// //   }
// // }

// // // =========================
// // // 🧠 CART UI
// // // =========================
// // function formatCartUI(cart) {
// //   if (!cart.length) return "🛒 Cart empty";

// //   let text = "🛒 YOUR CART\n\n";
// //   let total = 0;

// //   cart.forEach((i) => {
// //     const sub = i.price * i.qty;
// //     total += sub;
// //     text += `${i.name} x${i.qty} – ₦${sub}\n`;
// //   });

// //   text += `\n💰 Total: ₦${total}`;
// //   return text;
// // }

// // // =========================
// // // MULTI INPUT
// // // =========================
// // function parseMultipleItems(input) {
// //   return input
// //     .split(",")
// //     .map((n) => parseInt(n.trim()))
// //     .filter((n) => !isNaN(n));
// // }

// // // =========================
// // // 🍽 MENU
// // // =========================
// // async function sendMenuText(restaurantId, twiml, res) {
// //   const menu = await getMenu(restaurantId);
// //   const restaurant = await getRestaurant(restaurantId);

// //   if (!menu.length || !restaurant) {
// //     twiml.message("❌ Menu not available");
// //     return res.type("text/xml").send(twiml.toString());
// //   }

// //   let text = `🍽 ${restaurant.name}\n\n`;

// //   menu.forEach((item, i) => {
// //     text += `${i + 1}. ${item.name} – ₦${item.price}\n`;
// //   });

// //   text += "\nReply: 1,2,3";

// //   twiml.message(text);
// //   res.type("text/xml").send(twiml.toString());
// // }

// // // =========================
// // // 📲 WHATSAPP WEBHOOK
// // // =========================
// // app.post("/webhook", async (req, res) => {
// //   const twiml = new twilio.twiml.MessagingResponse();

// //   const from = req.body.From;
// //   const message = (req.body.Body || "").trim().toLowerCase();

// //   if (!sessions[from]) {
// //     sessions[from] = {
// //       cart: [],
// //       restaurant: null,
// //       step: "start",
// //     };
// //   }

// //   const user = sessions[from];

// //   try {
// //     // START
// //     if (message.startsWith("hi")) {
// //       user.step = "location";
// //       return twiml.message("📍 Enter your area (Lekki, Ajah)");
// //     }

// //     // LOCATION
// //     else if (user.step === "location") {
// //       const list = await getRestaurantsByLocation(message);

// //       if (!list.length) {
// //         return twiml.message("❌ No restaurants found");
// //       }

// //       user.available = list;
// //       user.step = "choose";

// //       let text = "🍽 Restaurants:\n";
// //       list.forEach((r, i) => {
// //         text += `${i + 1}. ${r.name}\n`;
// //       });

// //       return twiml.message(text);
// //     }

// //     // CHOOSE RESTAURANT
// //     else if (user.step === "choose") {
// //       const selected = user.available[Number(message) - 1];

// //       if (!selected) return twiml.message("❌ Invalid");

// //       user.restaurant = selected.id;
// //       user.cart = [];

// //       return await sendMenuText(selected.id, twiml, res);
// //     }

// //     // ADD ITEMS
// //     else if (/^[\d,\s]+$/.test(message)) {
// //       const menu = await getMenu(user.restaurant);
// //       const numbers = parseMultipleItems(message);

// //       numbers.forEach((num) => {
// //         const item = menu[num - 1];
// //         if (!item) return;

// //         const existing = user.cart.find(i => i.id === item.id);
// //         if (existing) existing.qty++;
// //         else user.cart.push({ ...item, qty: 1 });
// //       });

// //       return twiml.message(formatCartUI(user.cart));
// //     }

// //     // CHECKOUT → ASK LOCATION
// //     else if (message === "checkout") {
// //       user.step = "delivery_area";
// //       return twiml.message("📍 Enter delivery area (Lekki, Ajah)");
// //     }

// //     // DELIVERY AREA
// //     else if (user.step === "delivery_area") {
// //       user.deliveryArea = message;
// //       user.step = "delivery_address";

// //       return twiml.message("🏠 Enter full address");
// //     }

// //     // FINAL STEP → CREATE ORDER
// //     else if (user.step === "delivery_address") {
// //       user.deliveryAddress = message;

// //       let cartTotal = 0;
// //       user.cart.forEach(i => cartTotal += i.price * i.qty);

// //       const pricing = calculatePricing(cartTotal);
// //       const restaurant = await getRestaurant(user.restaurant);

// //       const deliveryFee = calculateDeliveryFee(
// //         restaurant.address.area,
// //         user.deliveryArea
// //       );

// //       const finalTotal = pricing.customerPays + deliveryFee;

// //       const orderId = uuidv4();

// //       await db.collection("pendingOrders").doc(orderId).set({
// //         ...user,
// //         cartTotal,
// //         deliveryFee,
// //         finalTotal,
// //         status: "pending_payment",
// //         createdAt: new Date()
// //       });

// //       const link = await createPaymentLink(
// //         "user@email.com",
// //         finalTotal,
// //         { orderId }
// //       );

// //       return twiml.message(
// //         `${formatCartUI(user.cart)}\n\n🚚 Delivery: ₦${deliveryFee}\n💰 Total: ₦${finalTotal}\n\nPay:\n${link}`
// //       );
// //     }

// //     else {
// //       twiml.message("Send hi");
// //     }

// //     res.type("text/xml").send(twiml.toString());

// //   } catch (err) {
// //     console.log(err);
// //     twiml.message("⚠️ Error");
// //     res.type("text/xml").send(twiml.toString());
// //   }
// // });

// // // =========================
// // // 💳 PAYSTACK WEBHOOK
// // // =========================
// // app.post("/paystack/webhook", async (req, res) => {
// //   try {
// //     const event = req.body;

// //     if (event.event !== "charge.success") {
// //       return res.sendStatus(200);
// //     }

// //     const metadata = event.data.metadata;
// //     const orderId = metadata.orderId;

// //     const orderRef = db.collection("pendingOrders").doc(orderId);
// //     const snap = await orderRef.get();

// //     if (!snap.exists) return res.sendStatus(200);

// //     const order = snap.data();
// //     const restaurant = await getRestaurant(order.restaurant);

// //     // SEND TO RESTAURANT
// //     let msg = `📦 NEW ORDER\n\n`;

// //     order.cart.forEach(i => {
// //       msg += `${i.name} x${i.qty}\n`;
// //     });

// //     msg += `
// // 📍 ${order.deliveryArea}
// // 🏠 ${order.deliveryAddress}
// // 💰 ₦${order.finalTotal}
// // `;

// //     await notifyRestaurant(restaurant.phone, msg);

// //     await orderRef.update({ status: "paid" });

// //     res.sendStatus(200);

// //   } catch (err) {
// //     console.log(err);
// //     res.sendStatus(500);
// //   }
// // });

// // // =========================
// // app.listen(3000, () => console.log("🚀 Running"));




// // require("dotenv").config();
// // const express = require("express");
// // const twilio = require("twilio");
// // const bodyParser = require("body-parser");
// // const admin = require("firebase-admin");
// // const axios = require("axios");
// // const cors = require("cors");
// // const { v4: uuidv4 } = require("uuid");

// // const app = express();

// // app.use(express.urlencoded({ extended: false }));
// // app.use(express.json());
// // app.use(bodyParser.json());
// // app.use(express.static("public"));
// // app.use(cors());

// // // =========================
// // // 🔥 FIREBASE
// // // =========================
// // const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
// // admin.initializeApp({
// //   credential: admin.credential.cert(serviceAccount),
// // });
// // const db = admin.firestore();

// // // =========================
// // // 💰 PRICING CONFIG
// // // =========================
// // const SERVICE_FEE = 250;
// // const LOW_ORDER_THRESHOLD = 4000;
// // const LOW_ORDER_FEE = 150;
// // const HIGH_ORDER_PERCENT = 0.1;

// // function calculatePricing(cartTotal) {
// //   let commission = cartTotal >= LOW_ORDER_THRESHOLD
// //     ? cartTotal * HIGH_ORDER_PERCENT
// //     : LOW_ORDER_FEE;
// //   return {
// //     commission,
// //     restaurantEarnings: cartTotal - commission,
// //     serviceFee: SERVICE_FEE,
// //     customerPays: cartTotal + SERVICE_FEE,
// //   };
// // }

// // // =========================
// // // 🔥 TWILIO
// // // =========================
// // const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

// // // =========================
// // // 🔧 SESSION MANAGER (Firestore)
// // // =========================
// // const SESSION_TTL_SECONDS = 86400; // 24 hours

// // async function getSession(phone) {
// //   const docRef = db.collection("sessions").doc(phone);
// //   const doc = await docRef.get();
// //   if (!doc.exists) {
// //     return { cart: [], restaurant: null, step: "start", available: [] };
// //   }
// //   const data = doc.data();
// //   // remove internal fields
// //   delete data.expireAt;
// //   delete data.updatedAt;
// //   delete data.phone;
// //   return data;
// // }

// // // async function saveSession(phone, session) {
// // //   const docRef = db.collection("sessions").doc(phone);
// // //   const toSave = {
// // //     ...session,
// // //     phone,
// // //     updatedAt: admin.firestore.FieldValue.serverTimestamp(),
// // //     expireAt: new Date(Date.now() + SESSION_TTL_SECONDS * 1000),
// // //   };
// // //   await docRef.set(toSave, { merge: true });
// // // }
// // async function saveSession(phone, session) {
// //   const docRef = db.collection("sessions").doc(phone);
// //   const toSave = {
// //     cart: session.cart || [],
// //     restaurant: session.restaurant || null,
// //     step: session.step || "start",
// //     available: session.available || [],
// //     phone: phone,
// //     updatedAt: admin.firestore.FieldValue.serverTimestamp(),
// //     expireAt: new Date(Date.now() + 86400 * 1000),
// //   };
// //   await docRef.set(toSave, { merge: true });
// //   // Optional: read back to confirm
// //   const saved = await docRef.get();
// //   console.log("✅ Verified saved session:", saved.data());
// // }

// // async function deleteSession(phone) {
// //   await db.collection("sessions").doc(phone).delete();
// // }

// // // =========================
// // // 🔧 HELPERS
// // // =========================
// // async function getMenu(restaurantId) {
// //   const snapshot = await db
// //     .collection("menus")
// //     .doc(restaurantId)
// //     .collection("items")
// //     .get();
// //   const items = [];
// //   snapshot.forEach((doc) => items.push({ id: doc.id, ...doc.data() }));
// //   return items;
// // }

// // async function getRestaurant(id) {
// //   const doc = await db.collection("restaurants").doc(id).get();
// //   return doc.exists ? doc.data() : null;
// // }

// // async function getRestaurantsByLocation(area) {
// //   const snapshot = await db
// //     .collection("restaurants")
// //     .where("location", "==", area.toLowerCase())
// //     .get();
// //   const list = [];
// //   snapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
// //   return list;
// // }

// // async function notifyRestaurant(phone, message) {
// //   await client.messages.create({
// //     from: "whatsapp:+14155238886",
// //     to: `whatsapp:${phone}`,
// //     body: message,
// //   });
// // }

// // async function createPaymentLink(email, amount, metadata) {
// //   try {
// //     const res = await axios.post(
// //       "https://api.paystack.co/transaction/initialize",
// //       { email, amount: amount * 100, metadata },
// //       { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET}` } }
// //     );
// //     return res.data.data.authorization_url;
// //   } catch (err) {
// //     console.log(err.response?.data || err.message);
// //     return null;
// //   }
// // }

// // // =========================
// // // 🧠 CART & MENU UI
// // // =========================
// // function formatCartUI(cart) {
// //   if (!cart.length) return "🛒 Cart is empty";
// //   let text = "🛒 *YOUR CART*\n━━━━━━━━━━━━━━\n\n";
// //   let total = 0;
// //   cart.forEach((i, index) => {
// //     const subtotal = i.price * i.qty;
// //     total += subtotal;
// //     text += `${index + 1}. ${i.name}\nQty: ${i.qty}\n₦${subtotal}\n\n`;
// //   });
// //   text += `━━━━━━━━━━━━━━\n💰 Total: ₦${total}\n`;
// //   text += "🧾 Actions:\n• type: remove item name\n• type: 1,2,3 to add more\n• type: checkout\n";
// //   return text;
// // }

// // function parseMultipleItems(input) {
// //   return input
// //     .split(",")
// //     .map((n) => parseInt(n.trim()))
// //     .filter((n) => !isNaN(n));
// // }

// // // ✅ NEW: only builds the TwiML message, does NOT call res.send()
// // async function buildMenuTwiML(restaurantId, twiml) {
// //   const menu = await getMenu(restaurantId);
// //   const restaurant = await getRestaurant(restaurantId);
// //   if (!menu.length || !restaurant) {
// //     twiml.message("❌ Menu not available");
// //     return twiml;
// //   }
// //   let text = `Welcome to 🍽 ${restaurant.name}. Please checkout our menu.\n\n`;
// //   menu.forEach((item, i) => {
// //     text += `${i + 1}. ${item.name} – ₦${item.price}\n`;
// //   });
// //   text += "\nReply with number(s) like 1,2,3";
// //   twiml.message(text);
// //   return twiml;
// // }

// // // =========================
// // // 🔥 ID GENERATOR (for restaurants)
// // // =========================
// // function generateRestaurantId(name) {
// //   const cleanName = name
// //     .toLowerCase()
// //     .trim()
// //     .replace(/[^a-z0-9]+/g, "-")
// //     .replace(/^-+|-+$/g, "");
// //   const uniquePart = Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
// //   return `${cleanName}-${uniquePart}`;
// // }

// // // =========================
// // // 📍 REGISTER RESTAURANT (API)
// // // =========================
// // app.post("/register-restaurant", async (req, res) => {
// //   try {
// //     const { name, phone, state, localGovt, deliveryFee, location } = req.body;
// //     if (!name || !phone || !state || !localGovt || !deliveryFee || !location) {
// //       return res.json({ success: false, message: "Missing required fields" });
// //     }
// //     const existing = await db.collection("restaurants").where("phone", "==", phone).get();
// //     if (!existing.empty) {
// //       return res.json({ success: false, message: "⚠️ This WhatsApp number is already registered." });
// //     }
// //     const restaurantId = generateRestaurantId(name);
// //     await db.collection("restaurants").doc(restaurantId).set({
// //       restaurantId, name, phone, state, localGovt,
// //       address: location, deliveryFee: Number(deliveryFee), createdAt: new Date()
// //     });
// //     res.json({ success: true, restaurantId, whatsappLink: `https://wa.me/${phone}` });
// //   } catch (err) {
// //     console.error(err);
// //     res.json({ success: false, message: "Server error" });
// //   }
// // });

// // // =========================
// // // 📞 WHATSAPP WEBHOOK (FULLY PERSISTED & FIXED)
// // // =========================
// // // app.post("/webhook", async (req, res) => {
// // //   const twiml = new twilio.twiml.MessagingResponse();
// // //   const from = req.body.From;
// // //   const message = (req.body.Body || "").trim().toLowerCase();

// // //   let user = await getSession(from);
// // //   if (!user.step) {
// // //     user = { cart: [], restaurant: null, step: "start", available: [] };
// // //     await saveSession(from, user);
// // //   }

// // //   try {
// // //     // ---------- START ----------
// // //     if (message.startsWith("hi")) {
// // //       const id = message.split(" ")[1];
// // //       if (id) {
// // //         user.restaurant = id;
// // //         user.cart = [];
// // //         await saveSession(from, user);
// // //         await buildMenuTwiML(id, twiml);
// // //         return res.type("text/xml").send(twiml.toString()); // send once
// // //       }
// // //       user.step = "location";
// // //       await saveSession(from, user);
// // //       twiml.message("📍 Enter your area (Lekki, Yaba)");
// // //     }
// // //     // ---------- LOCATION ----------
// // //     else if (user.step === "location") {
// // //       const list = await getRestaurantsByLocation(message);
// // //       if (!list.length) {
// // //         twiml.message("❌ No restaurants found");
// // //       } else {
// // //         user.available = list;
// // //         user.step = "choose";
// // //         await saveSession(from, user);
// // //         let text = "🍽 Restaurants:\n";
// // //         list.forEach((r, i) => { text += `${i+1}. ${r.name}\n`; });
// // //         twiml.message(text + "\nReply with number");
// // //       }
// // //     }
// // //     // ---------- CHOOSE RESTAURANT ----------
// // //     else if (user.step === "choose") {
// // //       const index = Number(message) - 1;
// // //       const selected = user.available[index];
// // //       if (!selected) {
// // //         twiml.message("❌ Invalid choice");
// // //       } else {
// // //         user.restaurant = selected.id;
// // //         user.cart = [];
// // //         user.step = null;
// // //         await saveSession(from, user);
// // //         await buildMenuTwiML(selected.id, twiml);
// // //         return res.type("text/xml").send(twiml.toString()); // send menu
// // //       }
// // //     }
// // //     // ---------- ADD ITEMS (numbers, e.g. "1,2,3") ----------
// // //     else if (/^[\d,\s]+$/.test(message)) {
// // //       if (!user.restaurant) {
// // //         twiml.message("⚠️ Type hi first");
// // //       } else {
// // //         const menu = await getMenu(user.restaurant);
// // //         const numbers = parseMultipleItems(message);
// // //         let added = [];
// // //         numbers.forEach((num) => {
// // //           const item = menu[num-1];
// // //           if (!item) return;
// // //           const existing = user.cart.find(i => i.id === item.id);
// // //           if (existing) existing.qty++;
// // //           else user.cart.push({ ...item, qty: 1 });
// // //           added.push(item.name);
// // //         });
// // //         if (added.length) {
// // //           await saveSession(from, user);
// // //           twiml.message(`✅ Added:\n• ${added.join("\n• ")}\n\n${formatCartUI(user.cart)}`);
// // //         } else {
// // //           twiml.message("❌ No valid item numbers");
// // //         }
// // //       }
// // //     }
// // //     // ---------- REMOVE ITEM ----------
// // //     else if (message.startsWith("remove ")) {
// // //       const name = message.replace("remove ", "").toLowerCase();
// // //       const index = user.cart.findIndex(i => i.name.toLowerCase().includes(name));
// // //       if (index === -1) {
// // //         twiml.message("❌ Item not found");
// // //       } else {
// // //         const item = user.cart[index];
// // //         if (item.qty > 1) {
// // //           item.qty--;
// // //           twiml.message(`➖ Removed 1 ${item.name}\n\n${formatCartUI(user.cart)}`);
// // //         } else {
// // //           user.cart.splice(index, 1);
// // //           twiml.message(`🗑 Removed ${item.name}\n\n${formatCartUI(user.cart)}`);
// // //         }
// // //         await saveSession(from, user);
// // //       }
// // //     }
// // //     // ---------- CHECKOUT ----------
// // //     else if (message === "checkout") {
// // //       if (!user.cart.length) {
// // //         twiml.message("🛒 Cart empty");
// // //       } else {
// // //         let cartTotal = 0;
// // //         user.cart.forEach(i => cartTotal += i.price * i.qty);
// // //         const pricing = calculatePricing(cartTotal);
// // //         const orderId = uuidv4();
// // //         await db.collection("pendingOrders").doc(orderId).set({
// // //           phone: from, restaurant: user.restaurant, cart: user.cart,
// // //           cartTotal, status: "pending_payment", createdAt: new Date()
// // //         });
// // //         const link = await createPaymentLink(
// // //           "user@email.com", pricing.customerPays,
// // //           { orderId: orderId.toString(), phone: from, restaurant: user.restaurant, cart: JSON.stringify(user.cart) }
// // //         );
// // //         twiml.message(
// // //           `🧾 ORDER SUMMARY\n\n${formatCartUI(user.cart)}\n\n🚚 Fee: ₦${pricing.serviceFee}\n💰 Total: ₦${pricing.customerPays}\n\n💳 Pay here:\n${link}`
// // //         );
// // //       }
// // //     }
// // //     // ---------- RESET ----------
// // //     else if (message === "reset") {
// // //       await deleteSession(from);
// // //       twiml.message("🔄 Reset done. Send hi");
// // //     }
// // //     // ---------- CART ----------
// // //     else if (message === "cart") {
// // //       twiml.message(formatCartUI(user.cart));
// // //     }
// // //     // ---------- DEFAULT ----------
// // //     else {
// // //       twiml.message("Send 'hi' to start");
// // //     }

// // //     // Final send (if we haven't already returned)
// // //     if (!res.headersSent) {
// // //       res.type("text/xml").send(twiml.toString());
// // //     }
// // //   } catch (err) {
// // //     console.error("Webhook error:", err);
// // //     if (!res.headersSent) {
// // //       twiml.message("⚠️ Error occurred. Please try again.");
// // //       res.type("text/xml").send(twiml.toString());
// // //     }
// // //   }
// // // });

// // app.post("/webhook", async (req, res) => {
// //   const twiml = new twilio.twiml.MessagingResponse();
// //   const from = req.body.From;
// //   const message = (req.body.Body || "").trim().toLowerCase();

// //   // Load session
// //   let user = await getSession(from);
// //   console.log("Loaded user:", user);

// //   // Only normalize missing fields – do NOT save here yet
// //   if (user.step === undefined) user.step = "start";
// //   if (!user.cart) user.cart = [];
// //   if (user.restaurant === undefined) user.restaurant = null;
// //   if (!user.available) user.available = [];

// //   // ❌ REMOVE the extra reset block – it was wiping sessions after restaurant choice
// //   // if (user.step === "start" && !user.restaurant && user.cart.length === 0) { ... }

// //   try {
// //     // ---------- START ----------
// //     if (message.startsWith("hi")) {
// //       const id = message.split(" ")[1];
// //       if (id) {
// //         user.restaurant = id;
// //         user.cart = [];
// //         user.step = null;
// //         await saveSession(from, user);
// //         await buildMenuTwiML(id, twiml);
// //         return res.type("text/xml").send(twiml.toString());
// //       }
// //       user.step = "location";
// //       user.restaurant = null;
// //       await saveSession(from, user);
// //       twiml.message("📍 Enter your area (Lekki, Yaba)");
// //     }
// //     // ---------- LOCATION ----------
// //     else if (user.step === "location") {
// //       const list = await getRestaurantsByLocation(message);
// //       if (!list.length) {
// //         twiml.message("❌ No restaurants found");
// //       } else {
// //         user.available = list;
// //         user.step = "choose";
// //         await saveSession(from, user);
// //         let text = "🍽 Restaurants:\n";
// //         list.forEach((r, i) => { text += `${i+1}. ${r.name}\n`; });
// //         twiml.message(text + "\nReply with number");
// //       }
// //     }
// //     // ---------- CHOOSE RESTAURANT ----------
// //     else if (user.step === "choose") {
// //       const index = Number(message) - 1;
// //       const selected = user.available[index];
// //       if (!selected) {
// //         twiml.message("❌ Invalid choice");
// //       } else {
// //         user.restaurant = selected.id;
// //         user.cart = [];
// //         user.step = null;
// //         await saveSession(from, user);
// //         console.log(`Chosen restaurant saved: ${user.restaurant}`);
// //         await buildMenuTwiML(selected.id, twiml);
// //         return res.type("text/xml").send(twiml.toString());
// //       }
// //     }
// //     // ---------- ADD ITEMS (numbers, e.g. "1,2,3") ----------
// //     else if (/^[\d,\s]+$/.test(message)) {
// //       console.log(`Add items - restaurant in session: ${user.restaurant}`);
// //       if (!user.restaurant) {
// //         // If missing, try to recover by reloading session once
// //         const fresh = await getSession(from);
// //         if (fresh.restaurant) {
// //           user.restaurant = fresh.restaurant;
// //           await saveSession(from, user);
// //           console.log(`Recovered restaurant: ${user.restaurant}`);
// //         } else {
// //           twiml.message("⚠️ No restaurant selected. Please send 'hi' again or use 'reset'.");
// //           return res.type("text/xml").send(twiml.toString());
// //         }
// //       }
// //       const menu = await getMenu(user.restaurant);
// //       const numbers = parseMultipleItems(message);
// //       let added = [];
// //       numbers.forEach((num) => {
// //         const item = menu[num-1];
// //         if (!item) return;
// //         const existing = user.cart.find(i => i.id === item.id);
// //         if (existing) existing.qty++;
// //         else user.cart.push({ ...item, qty: 1 });
// //         added.push(item.name);
// //       });
// //       if (added.length) {
// //         await saveSession(from, user);
// //         twiml.message(`✅ Added:\n• ${added.join("\n• ")}\n\n${formatCartUI(user.cart)}`);
// //       } else {
// //         twiml.message("❌ No valid item numbers");
// //       }
// //     }
// //     // ---------- REMOVE ITEM ----------
// //     else if (message.startsWith("remove ")) {
// //       if (!user.restaurant) {
// //         twiml.message("⚠️ No active restaurant. Send 'hi' first.");
// //       } else {
// //         const name = message.replace("remove ", "").toLowerCase();
// //         const index = user.cart.findIndex(i => i.name.toLowerCase().includes(name));
// //         if (index === -1) {
// //           twiml.message("❌ Item not found");
// //         } else {
// //           const item = user.cart[index];
// //           if (item.qty > 1) {
// //             item.qty--;
// //             twiml.message(`➖ Removed 1 ${item.name}\n\n${formatCartUI(user.cart)}`);
// //           } else {
// //             user.cart.splice(index, 1);
// //             twiml.message(`🗑 Removed ${item.name}\n\n${formatCartUI(user.cart)}`);
// //           }
// //           await saveSession(from, user);
// //         }
// //       }
// //     }
// //     // ---------- CHECKOUT ----------
// //     else if (message === "checkout") {
// //       if (!user.cart.length) {
// //         twiml.message("🛒 Cart empty");
// //       } else if (!user.restaurant) {
// //         twiml.message("⚠️ No restaurant selected. Start over.");
// //       } else {
// //         let cartTotal = 0;
// //         user.cart.forEach(i => cartTotal += i.price * i.qty);
// //         const pricing = calculatePricing(cartTotal);
// //         const orderId = uuidv4();
// //         await db.collection("pendingOrders").doc(orderId).set({
// //           phone: from, restaurant: user.restaurant, cart: user.cart,
// //           cartTotal, status: "pending_payment", createdAt: new Date()
// //         });
// //         const link = await createPaymentLink(
// //           "user@email.com", pricing.customerPays,
// //           { orderId, phone: from, restaurant: user.restaurant, cart: JSON.stringify(user.cart) }
// //         );
// //         twiml.message(
// //           `🧾 ORDER SUMMARY\n\n${formatCartUI(user.cart)}\n\n🚚 Fee: ₦${pricing.serviceFee}\n💰 Total: ₦${pricing.customerPays}\n\n💳 Pay here:\n${link}`
// //         );
// //       }
// //     }
// //     // ---------- RESET ----------
// //     else if (message === "reset") {
// //       await deleteSession(from);
// //       twiml.message("🔄 Reset done. Send hi");
// //     }
// //     // ---------- CART ----------
// //     else if (message === "cart") {
// //       twiml.message(formatCartUI(user.cart));
// //     }
// //     // ---------- DEFAULT ----------
// //     else {
// //       twiml.message("Send 'hi' to start");
// //     }

// //     if (!res.headersSent) {
// //       res.type("text/xml").send(twiml.toString());
// //     }
// //   } catch (err) {
// //     console.error("Webhook error:", err);
// //     if (!res.headersSent) {
// //       twiml.message("⚠️ Error occurred. Please try again.");
// //       res.type("text/xml").send(twiml.toString());
// //     }
// //   }
// // });

// // // =========================
// // // 💳 PAYSTACK WEBHOOK
// // // =========================
// // app.post("/paystack/webhook", async (req, res) => {
// //   console.log("🔥 PAYSTACK HIT");
// //   try {
// //     const event = req.body;
// //     if (event.event !== "charge.success") return res.sendStatus(200);
// //     const metadata = event.data.metadata;
// //     if (!metadata || !metadata.orderId) {
// //       console.log("❌ Missing metadata");
// //       return res.sendStatus(200);
// //     }
// //     const orderId = metadata.orderId;
// //     const orderRef = db.collection("pendingOrders").doc(orderId);
// //     const orderSnap = await orderRef.get();
// //     if (!orderSnap.exists) return res.sendStatus(200);
// //     const order = orderSnap.data();
// //     const restaurant = await getRestaurant(order.restaurant);
// //     if (!restaurant) return res.sendStatus(200);
// //     const cartTotal = order.cart.reduce((sum, i) => sum + i.price * i.qty, 0);
// //     const pricing = calculatePricing(cartTotal);
// //     await db.collection("orders").add({ ...order, paymentStatus: "paid", createdAt: new Date() });
// //     let msg = `📦 NEW PAID ORDER\n\n`;
// //     order.cart.forEach(i => { msg += `${i.name} x${i.qty} – ₦${i.price * i.qty}\n`; });
// //     msg += `\n━━━━━━━━━━━━━━\n💰 Total: ₦${cartTotal}\n💸 Earnings: ₦${pricing.restaurantEarnings}\n🧾 Commission: ₦${pricing.commission}\nCustomer: ${order.phone}`;
// //     try {
// //       await client.messages.create({
// //         from: "whatsapp:+14155238886",
// //         to: `whatsapp:${restaurant.phone}`,
// //         body: msg,
// //       });
// //       console.log("✅ MESSAGE SENT TO RESTAURANT");
// //     } catch (err) { console.log("❌ TWILIO ERROR:", err.message); }
// //     await orderRef.update({ status: "paid" });
// //     res.sendStatus(200);
// //   } catch (err) {
// //     console.log("🔥 WEBHOOK ERROR:", err);
// //     res.sendStatus(500);
// //   }
// // });

// // // =========================
// // // 🚀 START SERVER
// // // =========================
// // app.listen(3000, () => console.log("🚀 Server running on port 3000"));


// require("dotenv").config();
// const express = require("express");
// const twilio = require("twilio");
// const bodyParser = require("body-parser");
// const admin = require("firebase-admin");
// const axios = require("axios");
// const cors = require("cors");
// const { v4: uuidv4 } = require("uuid");
// const crypto = require("crypto");

// const app = express();

// app.use(express.urlencoded({ extended: false }));
// app.use(express.json());
// app.use(bodyParser.json());
// app.use(express.static("public"));
// app.use(cors());

// // =========================
// // 🔥 FIREBASE
// // =========================
// const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });
// const db = admin.firestore();

// // =========================
// // 💰 PRICING CONFIG
// // =========================
// const SERVICE_FEE = 250;
// const LOW_ORDER_THRESHOLD = 4000;
// const LOW_ORDER_FEE = 150;
// const HIGH_ORDER_PERCENT = 0.1;

// function calculatePricing(cartTotal) {
//   let commission = cartTotal >= LOW_ORDER_THRESHOLD
//     ? cartTotal * HIGH_ORDER_PERCENT
//     : LOW_ORDER_FEE;
//   return {
//     commission,
//     restaurantEarnings: cartTotal - commission,
//     serviceFee: SERVICE_FEE,
//     customerPays: cartTotal + SERVICE_FEE,
//   };
// }

// // =========================
// // 🔥 TWILIO
// // =========================
// const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

// // =========================
// // 🔧 SESSION MANAGER
// // =========================
// const SESSION_TTL_SECONDS = 86400;

// async function getSession(phone) {
//   const docRef = db.collection("sessions").doc(phone);
//   const doc = await docRef.get();
//   if (!doc.exists) {
//     return { cart: [], restaurant: null, step: "start", available: [], address: null };
//   }
//   const data = doc.data();
//   delete data.expireAt;
//   delete data.updatedAt;
//   delete data.phone;
//   return {
//     cart: data.cart || [],
//     restaurant: data.restaurant || null,
//     step: data.step || "start",
//     available: data.available || [],
//     address: data.address || null,
//   };
// }

// async function saveSession(phone, session) {
//   const docRef = db.collection("sessions").doc(phone);
//   const toSave = {
//     cart: session.cart || [],
//     restaurant: session.restaurant || null,
//     step: session.step || "start",
//     available: session.available || [],
//     address: session.address || null,
//     phone: phone,
//     updatedAt: admin.firestore.FieldValue.serverTimestamp(),
//     expireAt: new Date(Date.now() + 86400 * 1000),
//   };
//   await docRef.set(toSave, { merge: true });
// }

// async function deleteSession(phone) {
//   await db.collection("sessions").doc(phone).delete();
// }

// // =========================
// // 🔧 HELPERS
// // =========================
// async function getMenu(restaurantId) {
//   const snapshot = await db
//     .collection("menus")
//     .doc(restaurantId)
//     .collection("items")
//     .get();
//   const items = [];
//   snapshot.forEach((doc) => items.push({ id: doc.id, ...doc.data() }));
//   return items;
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
//   const list = [];
//   snapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
//   return list;
// }

// async function notifyRestaurant(phone, message) {
//   await client.messages.create({
//     from: "whatsapp:+14155238886",
//     to: `whatsapp:${phone}`,
//     body: message,
//   });
// }

// async function notifyCustomer(phone, message) {
//   await client.messages.create({
//     from: "whatsapp:+14155238886",
//     to: phone, // phone already includes 'whatsapp:'
//     body: message,
//   });
// }

// async function createPaymentLink(email, amount, metadata) {
//   try {
//     const res = await axios.post(
//       "https://api.paystack.co/transaction/initialize",
//       { email, amount: amount * 100, metadata },
//       { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET}` } }
//     );
//     return res.data.data.authorization_url;
//   } catch (err) {
//     console.log(err.response?.data || err.message);
//     return null;
//   }
// }

// // =========================
// // 🧠 CART & MENU UI
// // =========================
// function formatCartUI(cart) {
//   if (!cart.length) return "🛒 Cart is empty";
//   let text = "🛒 *YOUR CART*\n━━━━━━━━━━━━━━\n\n";
//   let total = 0;
//   cart.forEach((i, index) => {
//     const subtotal = i.price * i.qty;
//     total += subtotal;
//     text += `${index + 1}. ${i.name}\nQty: ${i.qty}\n₦${subtotal}\n\n`;
//   });
//   text += `━━━━━━━━━━━━━━\n💰 Total: ₦${total}\n`;
//   text += "🧾 Actions:\n• type: remove item name\n• type: 1,2,3 to add more\n• type: checkout\n";
//   return text;
// }

// function parseMultipleItems(input) {
//   return input
//     .split(",")
//     .map((n) => parseInt(n.trim()))
//     .filter((n) => !isNaN(n));
// }

// async function buildMenuTwiML(restaurantId, twiml) {
//   const menu = await getMenu(restaurantId);
//   const restaurant = await getRestaurant(restaurantId);
//   if (!menu.length || !restaurant) {
//     twiml.message("❌ Menu not available");
//     return twiml;
//   }
//   let text = `Welcome to 🍽 ${restaurant.name}. Please checkout our menu.\n\n`;
//   menu.forEach((item, i) => {
//     text += `${i + 1}. ${item.name} – ₦${item.price}\n`;
//   });
//   text += "\nReply with number(s) like 1,2,3";
//   twiml.message(text);
//   return twiml;
// }

// // =========================
// // 🔥 ID & API KEY GENERATOR
// // =========================
// function generateRestaurantId(name) {
//   const cleanName = name
//     .toLowerCase()
//     .trim()
//     .replace(/[^a-z0-9]+/g, "-")
//     .replace(/^-+|-+$/g, "");
//   const uniquePart = Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
//   return `${cleanName}-${uniquePart}`;
// }

// function generateApiKey() {
//   return crypto.randomBytes(32).toString("hex");
// }

// // =========================
// // 📍 REGISTER RESTAURANT (API)
// // =========================
// app.post("/register-restaurant", async (req, res) => {
//   try {
//     const { name, phone, state, localGovt, deliveryFee, location } = req.body;
//     if (!name || !phone || !state || !localGovt || !deliveryFee || !location) {
//       return res.json({ success: false, message: "Missing required fields" });
//     }
//     const existing = await db.collection("restaurants").where("phone", "==", phone).get();
//     if (!existing.empty) {
//       return res.json({ success: false, message: "⚠️ This WhatsApp number is already registered." });
//     }
//     const restaurantId = generateRestaurantId(name);
//     const apiKey = generateApiKey();
//     await db.collection("restaurants").doc(restaurantId).set({
//       restaurantId, name, phone, state, localGovt,
//       address: location, deliveryFee: Number(deliveryFee),
//       apiKey, // unique per restaurant
//       createdAt: new Date()
//     });
//     res.json({ success: true, restaurantId, apiKey, whatsappLink: `https://wa.me/${phone}` });
//   } catch (err) {
//     console.error(err);
//     res.json({ success: false, message: "Server error" });
//   }
// });

// // =========================
// // 📞 WHATSAPP WEBHOOK (with address & status)
// // =========================
// app.post("/webhook", async (req, res) => {
//   const twiml = new twilio.twiml.MessagingResponse();
//   const from = req.body.From;
//   const message = (req.body.Body || "").trim().toLowerCase();

//   let user = await getSession(from);
//   console.log("Loaded user:", user);

//   if (user.step === undefined) user.step = "start";
//   if (!user.cart) user.cart = [];
//   if (user.restaurant === undefined) user.restaurant = null;
//   if (!user.available) user.available = [];
//   if (user.address === undefined) user.address = null;

//   try {
//     // ---------- START ----------
//     if (message.startsWith("hi")) {
//       const id = message.split(" ")[1];
//       if (id) {
//         user.restaurant = id;
//         user.cart = [];
//         user.step = null;
//         user.address = null;
//         await saveSession(from, user);
//         await buildMenuTwiML(id, twiml);
//         return res.type("text/xml").send(twiml.toString());
//       }
//       user.step = "location";
//       user.restaurant = null;
//       user.address = null;
//       await saveSession(from, user);
//       twiml.message("📍 Enter your area (Lekki, Yaba)");
//     }
//     // ---------- LOCATION ----------
//     else if (user.step === "location") {
//       const list = await getRestaurantsByLocation(message);
//       if (!list.length) {
//         twiml.message("❌ No restaurants found");
//       } else {
//         user.available = list;
//         user.step = "choose";
//         await saveSession(from, user);
//         let text = "🍽 Restaurants:\n";
//         list.forEach((r, i) => { text += `${i+1}. ${r.name}\n`; });
//         twiml.message(text + "\nReply with number");
//       }
//     }
//     // ---------- CHOOSE RESTAURANT ----------
//     else if (user.step === "choose") {
//       const index = Number(message) - 1;
//       const selected = user.available[index];
//       if (!selected) {
//         twiml.message("❌ Invalid choice");
//       } else {
//         user.restaurant = selected.id;
//         user.cart = [];
//         user.step = null;
//         user.address = null;
//         await saveSession(from, user);
//         await buildMenuTwiML(selected.id, twiml);
//         return res.type("text/xml").send(twiml.toString());
//       }
//     }
//     // ---------- ADD ITEMS ----------
//     // else if (/^[\d,\s]+$/.test(message)) {
//     //   if (!user.restaurant) {
//     //     const fresh = await getSession(from);
//     //     if (fresh.restaurant) {
//     //       user.restaurant = fresh.restaurant;
//     //       await saveSession(from, user);
//     //     } else {
//     //       twiml.message("⚠️ No restaurant selected. Send 'hi' again.");
//     //       return res.type("text/xml").send(twiml.toString());
//     //     }
//     //   }
//     //   const menu = await getMenu(user.restaurant);
//     //   const numbers = parseMultipleItems(message);
//     //   let added = [];
//     //   numbers.forEach((num) => {
//     //     const item = menu[num-1];
//     //     if (!item) return;
//     //     const existing = user.cart.find(i => i.id === item.id);
//     //     if (existing) existing.qty++;
//     //     else user.cart.push({ ...item, qty: 1 });
//     //     added.push(item.name);
//     //   });
//     //   if (added.length) {
//     //     await saveSession(from, user);
//     //     twiml.message(`✅ Added:\n• ${added.join("\n• ")}\n\n${formatCartUI(user.cart)}`);
//     //   } else {
//     //     twiml.message("❌ No valid item numbers");
//     //   }
//     // }

//     // ---------- ADD ITEMS (supports "1,2,3" or "1 x2" or "4 x4") ----------
// else if (/^[\d,\s]+$/.test(message) || /^\d+\s*x\s*\d+$/i.test(message)) {
//   if (!user.restaurant) {
//     const fresh = await getSession(from);
//     if (fresh.restaurant) {
//       user.restaurant = fresh.restaurant;
//       await saveSession(from, user);
//     } else {
//       twiml.message("⚠️ No restaurant selected. Send 'hi' again.");
//       return res.type("text/xml"). send(twiml.toString());
//     }
//   }

//   const menu = await getMenu(user.restaurant);
//   let additions = []; // array of {index, qty}

//   // Check for quantity format: "number x quantity"
//   const quantityMatch = message.match(/^(\d+)\s*x\s*(\d+)$/i);
//   if (quantityMatch) {
//     const idx = parseInt(quantityMatch[1]) - 1;
//     const qty = parseInt(quantityMatch[2]);
//     if (idx >= 0 && idx < menu.length && qty > 0) {
//       additions.push({ index: idx, qty });
//     } else {
//       twiml.message("❌ Invalid item number or quantity.");
//       return res.type("text/xml").send(twiml.toString());
//     }
//   } else {
//     // Old format: comma-separated numbers (each with qty=1)
//     const numbers = parseMultipleItems(message);
//     numbers.forEach(num => {
//       const idx = num - 1;
//       if (idx >= 0 && idx < menu.length) {
//         additions.push({ index: idx, qty: 1 });
//       }
//     });
//   }

//   if (additions.length === 0) {
//     twiml.message("❌ No valid item numbers");
//   } else {
//     let added = [];
//     additions.forEach(({ index, qty }) => {
//       const item = menu[index];
//       if (!item) return;
//       const existing = user.cart.find(i => i.id === item.id);
//       if (existing) existing.qty += qty;
//       else user.cart.push({ ...item, qty });
//       added.push(`${item.name} x${qty}`);
//     });
//     await saveSession(from, user);
//     twiml.message(`✅ Added:\n• ${added.join("\n• ")}\n\n${formatCartUI(user.cart)}`);
//   }
// }
//     // ---------- REMOVE ITEM ----------
//     else if (message.startsWith("remove ")) {
//       if (!user.restaurant) {
//         twiml.message("⚠️ No active restaurant.");
//       } else {
//         const name = message.replace("remove ", "").toLowerCase();
//         const index = user.cart.findIndex(i => i.name.toLowerCase().includes(name));
//         if (index === -1) {
//           twiml.message("❌ Item not found");
//         } else {
//           const item = user.cart[index];
//           if (item.qty > 1) {
//             item.qty--;
//             twiml.message(`➖ Removed 1 ${item.name}\n\n${formatCartUI(user.cart)}`);
//           } else {
//             user.cart.splice(index, 1);
//             twiml.message(`🗑 Removed ${item.name}\n\n${formatCartUI(user.cart)}`);
//           }
//           await saveSession(from, user);
//         }
//       }
//     }
//     // ---------- CHECKOUT (ask address) ----------
//     else if (message === "checkout") {
//       if (!user.cart.length) {
//         twiml.message("🛒 Cart empty");
//       } else if (!user.restaurant) {
//         twiml.message("⚠️ No restaurant selected. Start over.");
//       } else {
//         user.step = "awaiting_address";
//         await saveSession(from, user);
//         twiml.message("🏠 Please enter your full delivery address (street, building, landmark):");
//       }
//     }
//     // ---------- AWAITING ADDRESS ----------
//     else if (user.step === "awaiting_address") {
//       user.address = message;
//       user.step = null;
//       await saveSession(from, user);

//       let cartTotal = 0;
//       user.cart.forEach(i => cartTotal += i.price * i.qty);
//       const pricing = calculatePricing(cartTotal);
//       const orderId = uuidv4();

//       await db.collection("pendingOrders").doc(orderId).set({
//         phone: from,
//         restaurant: user.restaurant,
//         cart: user.cart,
//         cartTotal,
//         address: user.address,
//         status: "pending_payment",
//         createdAt: new Date()
//       });

//       const link = await createPaymentLink(
//         "user@email.com", pricing.customerPays,
//         { orderId, phone: from, restaurant: user.restaurant, cart: JSON.stringify(user.cart), address: user.address }
//       );

//       twiml.message(
//         `🧾 ORDER SUMMARY\n\n${formatCartUI(user.cart)}\n\n` +
//         `🏠 Delivery: ${user.address}\n🚚 Fee: ₦${pricing.serviceFee}\n💰 Total: ₦${pricing.customerPays}\n\n` +
//         `💳 Pay here:\n${link}\n\n🔑 Your order ID: #${orderId.slice(-6)}`
//       );
//     }
//     // ---------- ORDER STATUS ----------
//     else if (message === "status") {
//       const ordersSnap = await db.collection("orders")
//         .where("phone", "==", from)
//         .orderBy("createdAt", "desc")
//         .limit(5)
//         .get();
//       if (ordersSnap.empty) {
//         twiml.message("📭 You have no past orders.");
//       } else {
//         let reply = "📦 *Your recent orders*\n\n";
//         ordersSnap.forEach(doc => {
//           const o = doc.data();
//           reply += `Order #${doc.id.slice(-6)}: ${o.status || "unknown"} (₦${o.cartTotal})\n`;
//         });
//         twiml.message(reply);
//       }
//     }
//     // ---------- RESET ----------
//     else if (message === "reset") {
//       await deleteSession(from);
//       twiml.message("🔄 Reset done. Send hi");
//     }
//     // ---------- CART ----------
//     else if (message === "cart") {
//       twiml.message(formatCartUI(user.cart));
//     }
//     // ---------- DEFAULT ----------
//     else {
//       twiml.message("Send 'hi' to start, 'cart' to see items, 'checkout' to order, 'status' to track orders.");
//     }

//     if (!res.headersSent) {
//       res.type("text/xml").send(twiml.toString());
//     }
//   } catch (err) {
//     console.error("Webhook error:", err);
//     if (!res.headersSent) {
//       twiml.message("⚠️ Error occurred. Please try again.");
//       res.type("text/xml").send(twiml.toString());
//     }
//   }
// });

// // =========================
// // 📦 RESTAURANT ORDER STATUS UPDATE (with per‑restaurant API key)
// // =========================
// app.post("/update-order-status", async (req, res) => {
//   try {
//     const { orderId, newStatus, apiKey } = req.body;
//     if (!orderId || !newStatus || !apiKey) {
//       return res.status(400).json({ success: false, message: "Missing required fields" });
//     }
//     const validStatuses = ["preparing", "out_for_delivery", "delivered"];
//     if (!validStatuses.includes(newStatus)) {
//       return res.status(400).json({ success: false, message: "Invalid status" });
//     }
//     // Find restaurant by apiKey
//     const restaurantQuery = await db.collection("restaurants").where("apiKey", "==", apiKey).limit(1).get();
//     if (restaurantQuery.empty) {
//       return res.status(401).json({ success: false, message: "Invalid API key" });
//     }
//     const restaurant = restaurantQuery.docs[0].data();
//     // Get order
//     const orderRef = db.collection("orders").doc(orderId);
//     const orderSnap = await orderRef.get();
//     if (!orderSnap.exists) {
//       return res.status(404).json({ success: false, message: "Order not found" });
//     }
//     const order = orderSnap.data();
//     // Ensure order belongs to this restaurant
//     if (order.restaurant !== restaurant.restaurantId) {
//       return res.status(403).json({ success: false, message: "Order does not belong to your restaurant" });
//     }
//     // Update status
//     await orderRef.update({ status: newStatus, updatedAt: new Date() });
//     // Notify customer
//     const customerPhone = order.phone;
//     let statusMsg = "";
//     if (newStatus === "preparing") statusMsg = "👨‍🍳 Your order is being prepared.";
//     else if (newStatus === "out_for_delivery") statusMsg = "🛵 Your order is out for delivery!";
//     else if (newStatus === "delivered") statusMsg = "✅ Your order has been delivered. Enjoy your meal!";
//     await notifyCustomer(customerPhone, `Order #${orderId.slice(-6)}: ${statusMsg}`);
//     res.json({ success: true });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// // =========================
// // 💳 PAYSTACK WEBHOOK (updated with order ID and address)
// // =========================
// app.post("/paystack/webhook", async (req, res) => {
//   console.log("🔥 PAYSTACK HIT");
//   try {
//     const event = req.body;
//     if (event.event !== "charge.success") return res.sendStatus(200);
//     const metadata = event.data.metadata;
//     if (!metadata || !metadata.orderId) {
//       console.log("❌ Missing metadata");
//       return res.sendStatus(200);
//     }
//     const orderId = metadata.orderId;
//     const orderRef = db.collection("pendingOrders").doc(orderId);
//     const orderSnap = await orderRef.get();
//     if (!orderSnap.exists) return res.sendStatus(200);
//     const order = orderSnap.data();
//     const restaurant = await getRestaurant(order.restaurant);
//     if (!restaurant) return res.sendStatus(200);
//     const cartTotal = order.cart.reduce((sum, i) => sum + i.price * i.qty, 0);
//     const pricing = calculatePricing(cartTotal);

//     // Move to permanent orders collection with initial status "paid"
//     await db.collection("orders").doc(orderId).set({
//       ...order,
//       paymentStatus: "paid",
//       status: "paid",
//       createdAt: new Date(),
//       address: order.address || "Not provided"
//     });
//     // Delete from pending
//     await orderRef.delete();

//     // Notify restaurant with order ID and address
//     let msg = `📦 NEW PAID ORDER #${orderId.slice(-6)}\n\n`;
//     order.cart.forEach(i => { msg += `${i.name} x${i.qty} – ₦${i.price * i.qty}\n`; });
//     msg += `\n━━━━━━━━━━━━━━\n💰 Total: ₦${cartTotal}\n💸 Earnings: ₦${pricing.restaurantEarnings}\n🧾 Commission: ₦${pricing.commission}\nCustomer: ${order.phone}\nAddress: ${order.address}`;
//     await notifyRestaurant(restaurant.phone, msg);
//     // Notify customer
//     await notifyCustomer(order.phone, `✅ Payment received! Your order #${orderId.slice(-6)} has been confirmed. We'll notify you when it's being prepared.`);

//     res.sendStatus(200);
//   } catch (err) {
//     console.log("🔥 WEBHOOK ERROR:", err);
//     res.sendStatus(500);
//   }
// });

// // =========================
// // 🚀 START SERVER
// // =========================
// app.listen(3000, () => console.log("🚀 Server running on port 3000"));


// require("dotenv").config();
// const express = require("express");
// const twilio = require("twilio");
// const bodyParser = require("body-parser");
// const admin = require("firebase-admin");
// const axios = require("axios");
// const cors = require("cors");
// const { v4: uuidv4 } = require("uuid");
// const crypto = require("crypto");

// const app = express();

// app.use(express.urlencoded({ extended: false }));
// app.use(express.json());
// app.use(bodyParser.json());
// app.use(express.static("public"));
// app.use(cors());

// // =========================
// // 🔥 FIREBASE
// // =========================
// const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });
// const db = admin.firestore();

// // =========================
// // 💰 PRICING CONFIG
// // =========================
// const SERVICE_FEE = 250;
// const LOW_ORDER_THRESHOLD = 4000;
// const LOW_ORDER_FEE = 150;
// const HIGH_ORDER_PERCENT = 0.1;

// function calculatePricing(cartTotal) {
//   let commission = cartTotal >= LOW_ORDER_THRESHOLD
//     ? cartTotal * HIGH_ORDER_PERCENT
//     : LOW_ORDER_FEE;
//   return {
//     commission,
//     restaurantEarnings: cartTotal - commission,
//     serviceFee: SERVICE_FEE,
//     customerPays: cartTotal + SERVICE_FEE,
//   };
// }

// // =========================
// // 🔥 TWILIO
// // =========================
// const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

// // =========================
// // 🔧 SESSION MANAGER
// // =========================
// const SESSION_TTL_SECONDS = 86400;

// async function getSession(phone) {
//   const docRef = db.collection("sessions").doc(phone);
//   const doc = await docRef.get();
//   if (!doc.exists) {
//     return { cart: [], restaurant: null, step: "start", available: [], address: null };
//   }
//   const data = doc.data();
//   delete data.expireAt;
//   delete data.updatedAt;
//   delete data.phone;
//   return {
//     cart: data.cart || [],
//     restaurant: data.restaurant || null,
//     step: data.step || "start",
//     available: data.available || [],
//     address: data.address || null,
//   };
// }

// async function saveSession(phone, session) {
//   const docRef = db.collection("sessions").doc(phone);
//   const toSave = {
//     cart: session.cart || [],
//     restaurant: session.restaurant || null,
//     step: session.step || "start",
//     available: session.available || [],
//     address: session.address || null,
//     phone: phone,
//     updatedAt: admin.firestore.FieldValue.serverTimestamp(),
//     expireAt: new Date(Date.now() + 86400 * 1000),
//   };
//   await docRef.set(toSave, { merge: true });
// }

// async function deleteSession(phone) {
//   await db.collection("sessions").doc(phone).delete();
// }

// // =========================
// // 🔧 HELPERS
// // =========================
// async function getMenu(restaurantId) {
//   const snapshot = await db
//     .collection("menus")
//     .doc(restaurantId)
//     .collection("items")
//     .get();
//   const items = [];
//   snapshot.forEach((doc) => items.push({ id: doc.id, ...doc.data() }));
//   return items;
// }
// // =========================
// // 🔥 ID & API KEY GENERATOR
// // =========================
// function generateRestaurantId(name) {
//   const cleanName = name
//     .toLowerCase()
//     .trim()
//     .replace(/[^a-z0-9]+/g, "-")
//     .replace(/^-+|-+$/g, "");
//   const uniquePart = Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
//   return `${cleanName}-${uniquePart}`;
// }

// function generateApiKey() {
//   return crypto.randomBytes(32).toString("hex");
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
//   const list = [];
//   snapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
//   return list;
// }

// async function notifyRestaurant(phone, message) {
//   await client.messages.create({
//     from: "whatsapp:+14155238886",
//     to: `whatsapp:${phone}`,
//     body: message,
//   });
// }

// async function notifyCustomer(phone, message) {
//   await client.messages.create({
//     from: "whatsapp:+14155238886",
//     to: phone,
//     body: message,
//   });
// }

// async function createPaymentLink(email, amount, metadata) {
//   try {
//     const res = await axios.post(
//       "https://api.paystack.co/transaction/initialize",
//       { email, amount: amount * 100, metadata },
//       { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET}` } }
//     );
//     return res.data.data.authorization_url;
//   } catch (err) {
//     console.log(err.response?.data || err.message);
//     return null;
//   }
// }

// // =========================
// // 🧠 CART & MENU UI
// // =========================
// function formatCartUI(cart) {
//   if (!cart.length) return "🛒 Cart is empty";
//   let text = "🛒 *YOUR CART*\n━━━━━━━━━━━━━━\n\n";
//   let total = 0;
//   cart.forEach((i, index) => {
//     const subtotal = i.price * i.qty;
//     total += subtotal;
//     text += `${index + 1}. ${i.name}\nQty: ${i.qty}\n₦${subtotal}\n\n`;
//   });
//   text += `━━━━━━━━━━━━━━\n💰 Total: ₦${total}\n`;
//   text += "🧾 Actions:\n• type: remove item name\n• type: 1,2,3 to add more\n• type: checkout\n";
//   return text;
// }

// function parseMultipleItems(input) {
//   return input
//     .split(",")
//     .map((n) => parseInt(n.trim()))
//     .filter((n) => !isNaN(n));
// }

// async function buildMenuTwiML(restaurantId, twiml) {
//   const menu = await getMenu(restaurantId);
//   const restaurant = await getRestaurant(restaurantId);
//   if (!menu.length || !restaurant) {
//     twiml.message("❌ Menu not available");
//     return twiml;
//   }
//   let text = `Welcome to 🍽 ${restaurant.name}. Please checkout our menu.\n\n`;
//   menu.forEach((item, i) => {
//     text += `${i + 1}. ${item.name} – ₦${item.price}\n`;
//   });
//   text += "\nReply with number(s) like 1,2,3";
//   twiml.message(text);
//   return twiml;
// }

// // =========================
// // 🔥 ID & API KEY GENERATOR
// // =========================
// function generateRestaurantId(name) {
//   const cleanName = name
//     .toLowerCase()
//     .trim()
//     .replace(/[^a-z0-9]+/g, "-")
//     .replace(/^-+|-+$/g, "");
//   const uniquePart = Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
//   return `${cleanName}-${uniquePart}`;
// }

// function generateApiKey() {
//   return crypto.randomBytes(32).toString("hex");
// }

// // =========================
// // 📍 REGISTER RESTAURANT (API)
// // =========================
// app.post("/register-restaurant", async (req, res) => {
//   try {
//     const { name, phone, state, localGovt, deliveryFee, location } = req.body;
//     if (!name || !phone || !state || !localGovt || !deliveryFee || !location) {
//       return res.json({ success: false, message: "Missing required fields" });
//     }
//     const existing = await db.collection("restaurants").where("phone", "==", phone).get();
//     if (!existing.empty) {
//       return res.json({ success: false, message: "⚠️ This WhatsApp number is already registered." });
//     }
//     const restaurantId = generateRestaurantId(name);
//     const apiKey = generateApiKey();
//     await db.collection("restaurants").doc(restaurantId).set({
//       restaurantId, name, phone, state, localGovt,
//       address: location, deliveryFee: Number(deliveryFee),
//       apiKey,
//       createdAt: new Date()
//     });
//     res.json({ success: true, restaurantId, apiKey, whatsappLink: `https://wa.me/${phone}` });
//   } catch (err) {
//     console.error(err);
//     res.json({ success: false, message: "Server error" });
//   }
// });

// // =========================
// // 📞 WHATSAPP WEBHOOK (with address, status, and tracking)
// // =========================
// app.post("/webhook", async (req, res) => {
//   const twiml = new twilio.twiml.MessagingResponse();
//   const from = req.body.From;
//   const message = (req.body.Body || "").trim().toLowerCase();

//   let user = await getSession(from);
//   console.log("Loaded user:", user);

//   if (user.step === undefined) user.step = "start";
//   if (!user.cart) user.cart = [];
//   if (user.restaurant === undefined) user.restaurant = null;
//   if (!user.available) user.available = [];
//   if (user.address === undefined) user.address = null;

//   try {
//     // ---------- START ----------
//     if (message.startsWith("hi")) {
//       const id = message.split(" ")[1];
//       if (id) {
//         user.restaurant = id;
//         user.cart = [];
//         user.step = null;
//         user.address = null;
//         await saveSession(from, user);
//         await buildMenuTwiML(id, twiml);
//         return res.type("text/xml").send(twiml.toString());
//       }
//       user.step = "location";
//       user.restaurant = null;
//       user.address = null;
//       await saveSession(from, user);
//       twiml.message("📍 Enter your area (Lekki, Yaba)");
//     }
//     // ---------- LOCATION ----------
//     else if (user.step === "location") {
//       const list = await getRestaurantsByLocation(message);
//       if (!list.length) {
//         twiml.message("❌ No restaurants found");
//       } else {
//         user.available = list;
//         user.step = "choose";
//         await saveSession(from, user);
//         let text = "🍽 Restaurants:\n";
//         list.forEach((r, i) => { text += `${i+1}. ${r.name}\n`; });
//         twiml.message(text + "\nReply with number");
//       }
//     }
//     // ---------- CHOOSE RESTAURANT ----------
//     else if (user.step === "choose") {
//       const index = Number(message) - 1;
//       const selected = user.available[index];
//       if (!selected) {
//         twiml.message("❌ Invalid choice");
//       } else {
//         user.restaurant = selected.id;
//         user.cart = [];
//         user.step = null;
//         user.address = null;
//         await saveSession(from, user);
//         await buildMenuTwiML(selected.id, twiml);
//         return res.type("text/xml").send(twiml.toString());
//       }
//     }
//     // ---------- ADD ITEMS (supports "1,2,3" or "1 x2" or "4 x4") ----------
//     else if (/^[\d,\s]+$/.test(message) || /^\d+\s*x\s*\d+$/i.test(message)) {
//       if (!user.restaurant) {
//         const fresh = await getSession(from);
//         if (fresh.restaurant) {
//           user.restaurant = fresh.restaurant;
//           await saveSession(from, user);
//         } else {
//           twiml.message("⚠️ No restaurant selected. Send 'hi' again.");
//           return res.type("text/xml").send(twiml.toString());
//         }
//       }
//       const menu = await getMenu(user.restaurant);
//       let additions = [];
//       const quantityMatch = message.match(/^(\d+)\s*x\s*(\d+)$/i);
//       if (quantityMatch) {
//         const idx = parseInt(quantityMatch[1]) - 1;
//         const qty = parseInt(quantityMatch[2]);
//         if (idx >= 0 && idx < menu.length && qty > 0) {
//           additions.push({ index: idx, qty });
//         } else {
//           twiml.message("❌ Invalid item number or quantity.");
//           return res.type("text/xml").send(twiml.toString());
//         }
//       } else {
//         const numbers = parseMultipleItems(message);
//         numbers.forEach(num => {
//           const idx = num - 1;
//           if (idx >= 0 && idx < menu.length) {
//             additions.push({ index: idx, qty: 1 });
//           }
//         });
//       }
//       if (additions.length === 0) {
//         twiml.message("❌ No valid item numbers");
//       } else {
//         let added = [];
//         additions.forEach(({ index, qty }) => {
//           const item = menu[index];
//           if (!item) return;
//           const existing = user.cart.find(i => i.id === item.id);
//           if (existing) existing.qty += qty;
//           else user.cart.push({ ...item, qty });
//           added.push(`${item.name} x${qty}`);
//         });
//         await saveSession(from, user);
//         twiml.message(`✅ Added:\n• ${added.join("\n• ")}\n\n${formatCartUI(user.cart)}`);
//       }
//     }
//     // ---------- REMOVE ITEM ----------
//     else if (message.startsWith("remove ")) {
//       if (!user.restaurant) {
//         twiml.message("⚠️ No active restaurant.");
//       } else {
//         const name = message.replace("remove ", "").toLowerCase();
//         const index = user.cart.findIndex(i => i.name.toLowerCase().includes(name));
//         if (index === -1) {
//           twiml.message("❌ Item not found");
//         } else {
//           const item = user.cart[index];
//           if (item.qty > 1) {
//             item.qty--;
//             twiml.message(`➖ Removed 1 ${item.name}\n\n${formatCartUI(user.cart)}`);
//           } else {
//             user.cart.splice(index, 1);
//             twiml.message(`🗑 Removed ${item.name}\n\n${formatCartUI(user.cart)}`);
//           }
//           await saveSession(from, user);
//         }
//       }
//     }
//     // ---------- CHECKOUT (ask address) ----------
//     else if (message === "checkout") {
//       if (!user.cart.length) {
//         twiml.message("🛒 Cart empty");
//       } else if (!user.restaurant) {
//         twiml.message("⚠️ No restaurant selected. Start over.");
//       } else {
//         user.step = "awaiting_address";
//         await saveSession(from, user);
//         twiml.message("🏠 Please enter your full delivery address (street, building, landmark):");
//       }
//     }
//     // ---------- AWAITING ADDRESS ----------
//     else if (user.step === "awaiting_address") {
//       user.address = message;
//       user.step = null;
//       await saveSession(from, user);
//       let cartTotal = 0;
//       user.cart.forEach(i => cartTotal += i.price * i.qty);
//       const pricing = calculatePricing(cartTotal);
//       const orderId = uuidv4();
//       await db.collection("pendingOrders").doc(orderId).set({
//         phone: from,
//         restaurant: user.restaurant,
//         cart: user.cart,
//         cartTotal,
//         address: user.address,
//         status: "pending_payment",
//         createdAt: new Date()
//       });
//       const link = await createPaymentLink(
//         "user@email.com", pricing.customerPays,
//         { orderId, phone: from, restaurant: user.restaurant, cart: JSON.stringify(user.cart), address: user.address }
//       );
//       twiml.message(
//         `🧾 ORDER SUMMARY\n\n${formatCartUI(user.cart)}\n\n` +
//         `🏠 Delivery: ${user.address}\n🚚 Fee: ₦${pricing.serviceFee}\n💰 Total: ₦${pricing.customerPays}\n\n` +
//         `💳 Pay here:\n${link}\n\n🔑 Your order ID: #${orderId.slice(-6)}`
//       );
//     }
//     // ---------- ORDER STATUS ----------
//     else if (message === "status") {
//       const ordersSnap = await db.collection("orders")
//         .where("phone", "==", from)
//         .orderBy("createdAt", "desc")
//         .limit(5)
//         .get();
//       if (ordersSnap.empty) {
//         twiml.message("📭 You have no past orders.");
//       } else {
//         let reply = "📦 *Your recent orders*\n\n";
//         ordersSnap.forEach(doc => {
//           const o = doc.data();
//           reply += `Order #${doc.id.slice(-6)}: ${o.status || "unknown"} (₦${o.cartTotal})\n`;
//         });
//         twiml.message(reply);
//       }
//     }
//     // ---------- TRACK ORDER (rider location) ----------
//     else if (message === "track") {
//       const ordersSnap = await db.collection("orders")
//         .where("phone", "==", from)
//         .where("status", "in", ["out_for_delivery", "preparing"])
//         .orderBy("createdAt", "desc")
//         .limit(1)
//         .get();
//       if (ordersSnap.empty) {
//         twiml.message("📭 No active order to track. Use 'status' to see your orders.");
//       } else {
//         const order = ordersSnap.docs[0].data();
//         const orderId = ordersSnap.docs[0].id;
//         if (order.status === "preparing") {
//           twiml.message(`🕒 Order #${orderId.slice(-6)} is being prepared. You'll be notified when it's out for delivery.`);
//         } else if (order.status === "out_for_delivery" && order.riderLocation) {
//           const mapsLink = `https://www.google.com/maps?q=${order.riderLocation.lat},${order.riderLocation.lng}`;
//           twiml.message(`🛵 Your order #${orderId.slice(-6)} is out for delivery!\nRider's last known location: ${mapsLink}\nLast updated: ${new Date(order.riderLocation.updatedAt).toLocaleTimeString()}`);
//         } else if (order.status === "out_for_delivery" && !order.riderLocation) {
//           twiml.message(`🛵 Order #${orderId.slice(-6)} is out for delivery, but rider location not yet shared. Check again soon.`);
//         } else {
//           twiml.message(`Order #${orderId.slice(-6)} status: ${order.status}`);
//         }
//       }
//     }
//     // ---------- RESET ----------
//     else if (message === "reset") {
//       await deleteSession(from);
//       twiml.message("🔄 Reset done. Send hi");
//     }
//     // ---------- CART ----------
//     else if (message === "cart") {
//       twiml.message(formatCartUI(user.cart));
//     }
//     // ---------- DEFAULT ----------
//     else {
//       twiml.message("Send 'hi' to start, 'cart' to see items, 'checkout' to order, 'status' to track orders, 'track' to follow rider.");
//     }
//     if (!res.headersSent) {
//       res.type("text/xml").send(twiml.toString());
//     }
//   } catch (err) {
//     console.error("Webhook error:", err);
//     if (!res.headersSent) {
//       twiml.message("⚠️ Error occurred. Please try again.");
//       res.type("text/xml").send(twiml.toString());
//     }
//   }
// });

// // =========================
// // 📦 RESTAURANT ORDER STATUS UPDATE (with per‑restaurant API key)
// // =========================
// app.post("/update-order-status", async (req, res) => {
//   try {
//     const { orderId, newStatus, apiKey } = req.body;
//     if (!orderId || !newStatus || !apiKey) {
//       return res.status(400).json({ success: false, message: "Missing required fields" });
//     }
//     const validStatuses = ["preparing", "out_for_delivery", "delivered"];
//     if (!validStatuses.includes(newStatus)) {
//       return res.status(400).json({ success: false, message: "Invalid status" });
//     }
//     const restaurantQuery = await db.collection("restaurants").where("apiKey", "==", apiKey).limit(1).get();
//     if (restaurantQuery.empty) {
//       return res.status(401).json({ success: false, message: "Invalid API key" });
//     }
//     const restaurant = restaurantQuery.docs[0].data();
//     const orderRef = db.collection("orders").doc(orderId);
//     const orderSnap = await orderRef.get();
//     if (!orderSnap.exists) {
//       return res.status(404).json({ success: false, message: "Order not found" });
//     }
//     const order = orderSnap.data();
//     if (order.restaurant !== restaurant.restaurantId) {
//       return res.status(403).json({ success: false, message: "Order does not belong to your restaurant" });
//     }
//     await orderRef.update({ status: newStatus, updatedAt: new Date() });
//     const customerPhone = order.phone;
//     let statusMsg = "";
//     if (newStatus === "preparing") statusMsg = "👨‍🍳 Your order is being prepared.";
//     else if (newStatus === "out_for_delivery") statusMsg = "🛵 Your order is out for delivery!";
//     else if (newStatus === "delivered") statusMsg = "✅ Your order has been delivered. Enjoy your meal!";
//     await notifyCustomer(customerPhone, `Order #${orderId.slice(-6)}: ${statusMsg}`);
//     res.json({ success: true });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// // =========================
// // 🛵 RIDER LOCATION UPDATE (for restaurants using their own riders)
// // =========================
// app.post("/update-rider-location", async (req, res) => {
//   try {
//     const { orderId, lat, lng, apiKey } = req.body;
//     if (!orderId || !lat || !lng || !apiKey) {
//       return res.status(400).json({ success: false, message: "Missing required fields" });
//     }
//     const restaurantQuery = await db.collection("restaurants").where("apiKey", "==", apiKey).limit(1).get();
//     if (restaurantQuery.empty) {
//       return res.status(401).json({ success: false, message: "Invalid API key" });
//     }
//     const restaurant = restaurantQuery.docs[0].data();
//     const orderRef = db.collection("orders").doc(orderId);
//     const orderSnap = await orderRef.get();
//     if (!orderSnap.exists) {
//       return res.status(404).json({ success: false, message: "Order not found" });
//     }
//     const order = orderSnap.data();
//     if (order.restaurant !== restaurant.restaurantId) {
//       return res.status(403).json({ success: false, message: "Order does not belong to your restaurant" });
//     }
//     await orderRef.update({
//       riderLocation: {
//         lat: parseFloat(lat),
//         lng: parseFloat(lng),
//         updatedAt: new Date().toISOString()
//       },
//       status: "out_for_delivery" // ensure status is set correctly
//     });
//     res.json({ success: true });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// // =========================
// // 💳 PAYSTACK WEBHOOK (with order ID and address)
// // =========================
// app.post("/paystack/webhook", async (req, res) => {
//   console.log("🔥 PAYSTACK HIT");
//   try {
//     const event = req.body;
//     if (event.event !== "charge.success") return res.sendStatus(200);
//     const metadata = event.data.metadata;
//     if (!metadata || !metadata.orderId) {
//       console.log("❌ Missing metadata");
//       return res.sendStatus(200);
//     }
//     const orderId = metadata.orderId;
//     const orderRef = db.collection("pendingOrders").doc(orderId);
//     const orderSnap = await orderRef.get();
//     if (!orderSnap.exists) return res.sendStatus(200);
//     const order = orderSnap.data();
//     const restaurant = await getRestaurant(order.restaurant);
//     if (!restaurant) return res.sendStatus(200);
//     const cartTotal = order.cart.reduce((sum, i) => sum + i.price * i.qty, 0);
//     const pricing = calculatePricing(cartTotal);
//     await db.collection("orders").doc(orderId).set({
//       ...order,
//       paymentStatus: "paid",
//       status: "paid",
//       restaurantEarnings: pricing.restaurantEarnings,   // <-- add this line
//       createdAt: new Date(),
//       address: order.address || "Not provided"
//     });

//     await orderRef.delete();
//     let msg = `📦 NEW PAID ORDER #${orderId.slice(-6)}\n\n`;
//     order.cart.forEach(i => { msg += `${i.name} x${i.qty} – ₦${i.price * i.qty}\n`; });
//     msg += `\n━━━━━━━━━━━━━━\n💰 Total: ₦${cartTotal}\n💸 Earnings: ₦${pricing.restaurantEarnings}\n🧾 Commission: ₦${pricing.commission}\nCustomer: ${order.phone}\nAddress: ${order.address}`;
//     await notifyRestaurant(restaurant.phone, msg);
//     await notifyCustomer(order.phone, `✅ Payment received! Your order #${orderId.slice(-6)} has been confirmed. We'll notify you when it's being prepared.`);
//     res.sendStatus(200);
//   } catch (err) {
//     console.log("🔥 WEBHOOK ERROR:", err);
//     res.sendStatus(500);
//   }
// });


// // =========================
// // 📦 RESTAURANT DASHBOARD: UPDATE ORDER STATUS
// // =========================
// // =========================
// // 📊 RESTAURANT DASHBOARD: GET ORDERS
// // =========================
// app.post("/api/restaurant/orders", async (req, res) => {
//   try {
//     const { apiKey } = req.body;
//     if (!apiKey) return res.status(400).json({ error: "Missing apiKey" });

//     // Find restaurant by apiKey
//     const restaurantQuery = await db.collection("restaurants").where("apiKey", "==", apiKey).limit(1).get();
//     if (restaurantQuery.empty) {
//       return res.status(401).json({ error: "Invalid API key" });
//     }
//     const restaurant = restaurantQuery.docs[0].data();

//     // Get all orders for this restaurant
//     const ordersSnapshot = await db.collection("orders")
//       .where("restaurant", "==", restaurant.restaurantId)
//       .orderBy("createdAt", "desc")
//       .get();

//     const orders = ordersSnapshot.docs.map(doc => ({
//       id: doc.id,
//       ...doc.data()
//     }));

//     res.json({
//       restaurant: {
//         name: restaurant.name,
//         phone: restaurant.phone,
//         apiKey: restaurant.apiKey,
//         restaurantId: restaurant.restaurantId
//       },
//       orders
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // =========================
// // 📦 RESTAURANT DASHBOARD: UPDATE ORDER STATUS
// // =========================
// app.post("/api/restaurant/update-status", async (req, res) => {
//   try {
//     const { apiKey, orderId, newStatus } = req.body;
//     if (!apiKey || !orderId || !newStatus) {
//       return res.status(400).json({ error: "Missing required fields" });
//     }
//     const validStatuses = ["preparing", "out_for_delivery", "delivered"];
//     if (!validStatuses.includes(newStatus)) {
//       return res.status(400).json({ error: "Invalid status" });
//     }
//     // Verify restaurant
//     const restaurantQuery = await db.collection("restaurants").where("apiKey", "==", apiKey).limit(1).get();
//     if (restaurantQuery.empty) {
//       return res.status(401).json({ error: "Invalid API key" });
//     }
//     const restaurant = restaurantQuery.docs[0].data();
//     // Get order
//     const orderRef = db.collection("orders").doc(orderId);
//     const orderSnap = await orderRef.get();
//     if (!orderSnap.exists) {
//       return res.status(404).json({ error: "Order not found" });
//     }
//     const order = orderSnap.data();
//     if (order.restaurant !== restaurant.restaurantId) {
//       return res.status(403).json({ error: "Order does not belong to you" });
//     }
//     // Update status
//     await orderRef.update({ status: newStatus, updatedAt: new Date() });
    
//     // Notify customer via WhatsApp
//     const customerPhone = order.phone;
//     let customerMsg = "";
//     if (newStatus === "preparing") customerMsg = "👨‍🍳 Your order is being prepared.";
//     else if (newStatus === "out_for_delivery") customerMsg = "🛵 Your order is out for delivery!";
//     else if (newStatus === "delivered") customerMsg = "✅ Your order has been delivered. Enjoy your meal!";
    
//     // Use notifyCustomer if defined (from previous code)
//     if (typeof notifyCustomer === 'function') {
//       await notifyCustomer(customerPhone, `Order #${orderId.slice(-6)}: ${customerMsg}`);
//     } else {
//       // Fallback: send via Twilio directly
//       await client.messages.create({
//         from: "whatsapp:+14155238886",
//         to: customerPhone,
//         body: `Order #${orderId.slice(-6)}: ${customerMsg}`,
//       });
//     }
    
//     // If delivered, also notify restaurant with final confirmation
//     if (newStatus === "delivered") {
//       const restaurantMsg = `✅ Order #${orderId.slice(-6)} has been successfully delivered to the customer. Thank you for using our platform!`;
//       if (typeof notifyRestaurant === 'function') {
//         await notifyRestaurant(restaurant.phone, restaurantMsg);
//       } else {
//         await client.messages.create({
//           from: "whatsapp:+14155238886",
//           to: `whatsapp:${restaurant.phone}`,
//           body: restaurantMsg,
//         });
//       }
//     }
    
//     res.json({ success: true });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// });
// // =========================
// // 🚀 START SERVER
// // =========================
// app.listen(3000, () => console.log("🚀 Server running on port 3000"));




require("dotenv").config();
const express = require("express");
const twilio = require("twilio");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const axios = require("axios");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(bodyParser.json());
app.use(express.static("public"));
app.use(cors());

// =========================
// 🔥 FIREBASE
// =========================
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

// =========================
// 💰 PRICING CONFIG
// =========================
const SERVICE_FEE = 250;
const LOW_ORDER_THRESHOLD = 4000;
const LOW_ORDER_FEE = 150;
const HIGH_ORDER_PERCENT = 0.1;

function calculatePricing(cartTotal) {
  let commission = cartTotal >= LOW_ORDER_THRESHOLD
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
// 🔥 TWILIO
// =========================
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

// =========================
// 🔧 SESSION MANAGER (for customers)
// =========================
const SESSION_TTL_SECONDS = 86400;

async function getSession(phone) {
  const docRef = db.collection("sessions").doc(phone);
  const doc = await docRef.get();
  if (!doc.exists) {
    return { cart: [], restaurant: null, step: "start", available: [], address: null };
  }
  const data = doc.data();
  delete data.expireAt;
  delete data.updatedAt;
  delete data.phone;
  return {
    cart: data.cart || [],
    restaurant: data.restaurant || null,
    step: data.step || "start",
    available: data.available || [],
    address: data.address || null,
  };
}

async function saveSession(phone, session) {
  const docRef = db.collection("sessions").doc(phone);
  const toSave = {
    cart: session.cart || [],
    restaurant: session.restaurant || null,
    step: session.step || "start",
    available: session.available || [],
    address: session.address || null,
    phone: phone,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    expireAt: new Date(Date.now() + 86400 * 1000),
  };
  await docRef.set(toSave, { merge: true });
}

async function deleteSession(phone) {
  await db.collection("sessions").doc(phone).delete();
}

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

async function notifyRestaurant(phone, message) {
  await client.messages.create({
    from: "whatsapp:+14155238886",
    to: `whatsapp:${phone}`,
    body: message,
  });
}

async function notifyCustomer(phone, message) {
  await client.messages.create({
    from: "whatsapp:+14155238886",
    to: phone,
    body: message,
  });
}

async function createPaymentLink(email, amount, metadata) {
  try {
    const res = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      { email, amount: amount * 100, metadata },
      { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET}` } }
    );
    return res.data.data.authorization_url;
  } catch (err) {
    console.log(err.response?.data || err.message);
    return null;
  }
}

// =========================
// 🧠 CART & MENU UI
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
  text += `━━━━━━━━━━━━━━\n💰 Total: ₦${total}\n`;
  text += "🧾 Actions:\n• type: remove item name\n• type: 1,2,3 to add more\n• type: checkout\n";
  return text;
}

function parseMultipleItems(input) {
  return input
    .split(",")
    .map((n) => parseInt(n.trim()))
    .filter((n) => !isNaN(n));
}

async function buildMenuTwiML(restaurantId, twiml) {
  const menu = await getMenu(restaurantId);
  const restaurant = await getRestaurant(restaurantId);
  if (!menu.length || !restaurant) {
    twiml.message("❌ Menu not available");
    return twiml;
  }
  let text = `Welcome to 🍽 ${restaurant.name}. Please checkout our menu.\n\n`;
  menu.forEach((item, i) => {
    text += `${i + 1}. ${item.name} – ₦${item.price}\n`;
  });
  text += "\nReply with number(s) like 1,2,3";
  twiml.message(text);
  return twiml;
}

// =========================
// 🔥 ID & API KEY GENERATOR
// =========================
function generateRestaurantId(name) {
  const cleanName = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const uniquePart = Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
  return `${cleanName}-${uniquePart}`;
}

function generateApiKey() {
  return crypto.randomBytes(32).toString("hex");
}

// =========================
// 👥 REFERRER MANAGEMENT (for employees)
// =========================
async function getUser(phone) {
  const doc = await db.collection("users").doc(phone).get();
  return doc.exists ? doc.data() : null;
}

async function creditWallet(phone, amount, description, orderId) {
  const userRef = db.collection("users").doc(phone);
  await db.runTransaction(async (t) => {
    const doc = await t.get(userRef);
    if (!doc.exists) return;
    const newBalance = (doc.data().walletBalance || 0) + amount;
    t.update(userRef, { walletBalance: newBalance, totalEarned: admin.firestore.FieldValue.increment(amount) });
    const txRef = db.collection("walletTransactions").doc();
    t.set(txRef, {
      phone,
      amount,
      type: "credit",
      description,
      orderId,
      createdAt: new Date(),
    });
  });
}

// =========================
// 📍 REGISTER RESTAURANT (API)
// =========================
app.post("/register-restaurant", async (req, res) => {
  try {
    const { name, phone, state, localGovt, deliveryFee, location, referralCode } = req.body;
    if (!name || !phone || !state || !localGovt || !deliveryFee || !location) {
      return res.json({ success: false, message: "Missing required fields" });
    }
    const existing = await db.collection("restaurants").where("phone", "==", phone).get();
    if (!existing.empty) {
      return res.json({ success: false, message: "⚠️ This WhatsApp number is already registered." });
    }
    const restaurantId = generateRestaurantId(name);
    const apiKey = generateApiKey();

    // Process referral (optional)
    let referredBy = null;
    let referrerLevel = null;
    let referralPath = null;
    if (referralCode) {
      const referrerSnapshot = await db.collection("users").where("referralCode", "==", referralCode).limit(1).get();
      if (!referrerSnapshot.empty) {
        const referrer = referrerSnapshot.docs[0].data();
        referredBy = referrer.phone;
        referrerLevel = referrer.level;
        referralPath = referrer.referralPath ? [...referrer.referralPath] : [];
        referralPath.push(referredBy);
      }
    }

    await db.collection("restaurants").doc(restaurantId).set({
      restaurantId, name, phone, state, localGovt,
      address: location, deliveryFee: Number(deliveryFee),
      apiKey,
      referredBy,
      referrerLevel,
      referralPath,
      createdAt: new Date()
    });

    // Send API key to restaurant via WhatsApp
    await client.messages.create({
      from: "whatsapp:+14155238886",
      to: `whatsapp:${phone}`,
      body: `✅ Welcome ${name}!\n\nRestaurant ID: ${restaurantId}\nAPI Key: ${apiKey}\n\nUse this API key to log into your dashboard: https://yourdomain.com/restaurant-dashboard.html\nKeep it secret!`
    });

    res.json({ success: true, restaurantId, apiKey, whatsappLink: `https://wa.me/${phone}` });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Server error" });
  }
});

// =========================
// 📞 WHATSAPP WEBHOOK (full customer flow)
// =========================
app.post("/webhook", async (req, res) => {
  const twiml = new twilio.twiml.MessagingResponse();
  const from = req.body.From;
  const message = (req.body.Body || "").trim().toLowerCase();

  let user = await getSession(from);
  console.log("Loaded user:", user);

  if (user.step === undefined) user.step = "start";
  if (!user.cart) user.cart = [];
  if (user.restaurant === undefined) user.restaurant = null;
  if (!user.available) user.available = [];
  if (user.address === undefined) user.address = null;

  try {
    // ---------- START ----------
    if (message.startsWith("hi")) {
      const id = message.split(" ")[1];
      if (id) {
        user.restaurant = id;
        user.cart = [];
        user.step = null;
        user.address = null;
        await saveSession(from, user);
        await buildMenuTwiML(id, twiml);
        return res.type("text/xml").send(twiml.toString());
      }
      user.step = "location";
      user.restaurant = null;
      user.address = null;
      await saveSession(from, user);
      twiml.message("📍 Enter your area (Lekki, Yaba)");
    }
    // ---------- LOCATION ----------
    else if (user.step === "location") {
      const list = await getRestaurantsByLocation(message);
      if (!list.length) {
        twiml.message("❌ No restaurants found");
      } else {
        user.available = list;
        user.step = "choose";
        await saveSession(from, user);
        let text = "🍽 Restaurants:\n";
        list.forEach((r, i) => { text += `${i+1}. ${r.name}\n`; });
        twiml.message(text + "\nReply with number");
      }
    }
    // ---------- CHOOSE RESTAURANT ----------
    else if (user.step === "choose") {
      const index = Number(message) - 1;
      const selected = user.available[index];
      if (!selected) {
        twiml.message("❌ Invalid choice");
      } else {
        user.restaurant = selected.id;
        user.cart = [];
        user.step = null;
        user.address = null;
        await saveSession(from, user);
        await buildMenuTwiML(selected.id, twiml);
        return res.type("text/xml").send(twiml.toString());
      }
    }
    // ---------- ADD ITEMS (supports "1,2,3" or "1 x2" or "4 x4") ----------
    else if (/^[\d,\s]+$/.test(message) || /^\d+\s*x\s*\d+$/i.test(message)) {
      if (!user.restaurant) {
        const fresh = await getSession(from);
        if (fresh.restaurant) {
          user.restaurant = fresh.restaurant;
          await saveSession(from, user);
        } else {
          twiml.message("⚠️ No restaurant selected. Send 'hi' again.");
          return res.type("text/xml").send(twiml.toString());
        }
      }
      const menu = await getMenu(user.restaurant);
      let additions = [];
      const quantityMatch = message.match(/^(\d+)\s*x\s*(\d+)$/i);
      if (quantityMatch) {
        const idx = parseInt(quantityMatch[1]) - 1;
        const qty = parseInt(quantityMatch[2]);
        if (idx >= 0 && idx < menu.length && qty > 0) {
          additions.push({ index: idx, qty });
        } else {
          twiml.message("❌ Invalid item number or quantity.");
          return res.type("text/xml").send(twiml.toString());
        }
      } else {
        const numbers = parseMultipleItems(message);
        numbers.forEach(num => {
          const idx = num - 1;
          if (idx >= 0 && idx < menu.length) {
            additions.push({ index: idx, qty: 1 });
          }
        });
      }
      if (additions.length === 0) {
        twiml.message("❌ No valid item numbers");
      } else {
        let added = [];
        additions.forEach(({ index, qty }) => {
          const item = menu[index];
          if (!item) return;
          const existing = user.cart.find(i => i.id === item.id);
          if (existing) existing.qty += qty;
          else user.cart.push({ ...item, qty });
          added.push(`${item.name} x${qty}`);
        });
        await saveSession(from, user);
        twiml.message(`✅ Added:\n• ${added.join("\n• ")}\n\n${formatCartUI(user.cart)}`);
      }
    }
    // ---------- REMOVE ITEM ----------
    else if (message.startsWith("remove ")) {
      if (!user.restaurant) {
        twiml.message("⚠️ No active restaurant.");
      } else {
        const name = message.replace("remove ", "").toLowerCase();
        const index = user.cart.findIndex(i => i.name.toLowerCase().includes(name));
        if (index === -1) {
          twiml.message("❌ Item not found");
        } else {
          const item = user.cart[index];
          if (item.qty > 1) {
            item.qty--;
            twiml.message(`➖ Removed 1 ${item.name}\n\n${formatCartUI(user.cart)}`);
          } else {
            user.cart.splice(index, 1);
            twiml.message(`🗑 Removed ${item.name}\n\n${formatCartUI(user.cart)}`);
          }
          await saveSession(from, user);
        }
      }
    }
    // ---------- CHECKOUT (ask address) ----------
    else if (message === "checkout") {
      if (!user.cart.length) {
        twiml.message("🛒 Cart empty");
      } else if (!user.restaurant) {
        twiml.message("⚠️ No restaurant selected. Start over.");
      } else {
        user.step = "awaiting_address";
        await saveSession(from, user);
        twiml.message("🏠 Please enter your full delivery address (street, building, landmark):");
      }
    }
    // ---------- AWAITING ADDRESS ----------
    else if (user.step === "awaiting_address") {
      user.address = message;
      user.step = null;
      await saveSession(from, user);
      let cartTotal = 0;
      user.cart.forEach(i => cartTotal += i.price * i.qty);
      const pricing = calculatePricing(cartTotal);
      const orderId = uuidv4();
      await db.collection("pendingOrders").doc(orderId).set({
        phone: from,
        restaurant: user.restaurant,
        cart: user.cart,
        cartTotal,
        address: user.address,
        status: "pending_payment",
        createdAt: new Date()
      });
      const link = await createPaymentLink(
        "user@email.com", pricing.customerPays,
        { orderId, phone: from, restaurant: user.restaurant, cart: JSON.stringify(user.cart), address: user.address }
      );
      twiml.message(
        `🧾 ORDER SUMMARY\n\n${formatCartUI(user.cart)}\n\n` +
        `🏠 Delivery: ${user.address}\n🚚 Fee: ₦${pricing.serviceFee}\n💰 Total: ₦${pricing.customerPays}\n\n` +
        `💳 Pay here:\n${link}\n\n🔑 Your order ID: #${orderId.slice(-6)}`
      );
    }
    // ---------- ORDER STATUS ----------
    else if (message === "status") {
      const ordersSnap = await db.collection("orders")
        .where("phone", "==", from)
        .orderBy("createdAt", "desc")
        .limit(5)
        .get();
      if (ordersSnap.empty) {
        twiml.message("📭 You have no past orders.");
      } else {
        let reply = "📦 *Your recent orders*\n\n";
        ordersSnap.forEach(doc => {
          const o = doc.data();
          reply += `Order #${doc.id.slice(-6)}: ${o.status || "unknown"} (₦${o.cartTotal})\n`;
        });
        twiml.message(reply);
      }
    }
    // ---------- TRACK ORDER (rider location) ----------
    else if (message === "track") {
      const ordersSnap = await db.collection("orders")
        .where("phone", "==", from)
        .where("status", "in", ["out_for_delivery", "preparing"])
        .orderBy("createdAt", "desc")
        .limit(1)
        .get();
      if (ordersSnap.empty) {
        twiml.message("📭 No active order to track. Use 'status' to see your orders.");
      } else {
        const order = ordersSnap.docs[0].data();
        const orderId = ordersSnap.docs[0].id;
        if (order.status === "preparing") {
          twiml.message(`🕒 Order #${orderId.slice(-6)} is being prepared. You'll be notified when it's out for delivery.`);
        } else if (order.status === "out_for_delivery" && order.riderLocation) {
          const mapsLink = `https://www.google.com/maps?q=${order.riderLocation.lat},${order.riderLocation.lng}`;
          twiml.message(`🛵 Your order #${orderId.slice(-6)} is out for delivery!\nRider's last known location: ${mapsLink}\nLast updated: ${new Date(order.riderLocation.updatedAt).toLocaleTimeString()}`);
        } else if (order.status === "out_for_delivery" && !order.riderLocation) {
          twiml.message(`🛵 Order #${orderId.slice(-6)} is out for delivery, but rider location not yet shared. Check again soon.`);
        } else {
          twiml.message(`Order #${orderId.slice(-6)} status: ${order.status}`);
        }
      }
    }
    // ---------- GET API KEY (for restaurant owners) ----------
    else if (message === "mykey") {
      const restaurantQuery = await db.collection("restaurants").where("phone", "==", from).limit(1).get();
      if (restaurantQuery.empty) {
        twiml.message("❌ No restaurant found with this WhatsApp number.");
      } else {
        const restaurant = restaurantQuery.docs[0].data();
        twiml.message(`🔑 Your API key: ${restaurant.apiKey}\nKeep it secure. Use it to log into your dashboard.`);
      }
    }
    // ---------- RESET ----------
    else if (message === "reset") {
      await deleteSession(from);
      twiml.message("🔄 Reset done. Send hi");
    }
    // ---------- CART ----------
    else if (message === "cart") {
      twiml.message(formatCartUI(user.cart));
    }
    // ---------- DEFAULT ----------
    else {
      twiml.message("Send 'hi' to start, 'cart', 'checkout', 'status', 'track', or 'mykey' (if you own a restaurant).");
    }
    if (!res.headersSent) {
      res.type("text/xml").send(twiml.toString());
    }
  } catch (err) {
    console.error("Webhook error:", err);
    if (!res.headersSent) {
      twiml.message("⚠️ Error occurred. Please try again.");
      res.type("text/xml").send(twiml.toString());
    }
  }
});

// =========================
// 📊 RESTAURANT DASHBOARD API ENDPOINTS
// =========================

app.post("/api/restaurant/orders", async (req, res) => {
  try {
    const { apiKey } = req.body;
    if (!apiKey) return res.status(400).json({ error: "Missing apiKey" });
    const restaurantQuery = await db.collection("restaurants").where("apiKey", "==", apiKey).limit(1).get();
    if (restaurantQuery.empty) return res.status(401).json({ error: "Invalid API key" });
    const restaurant = restaurantQuery.docs[0].data();
    const ordersSnapshot = await db.collection("orders")
      .where("restaurant", "==", restaurant.restaurantId)
      .orderBy("createdAt", "desc")
      .get();
    const orders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ restaurant: { name: restaurant.name, phone: restaurant.phone, apiKey: restaurant.apiKey }, orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/restaurant/update-status", async (req, res) => {
  try {
    const { apiKey, orderId, newStatus } = req.body;
    if (!apiKey || !orderId || !newStatus) return res.status(400).json({ error: "Missing fields" });
    const valid = ["preparing", "out_for_delivery", "delivered"];
    if (!valid.includes(newStatus)) return res.status(400).json({ error: "Invalid status" });
    const restaurantQuery = await db.collection("restaurants").where("apiKey", "==", apiKey).limit(1).get();
    if (restaurantQuery.empty) return res.status(401).json({ error: "Invalid API key" });
    const restaurant = restaurantQuery.docs[0].data();
    const orderRef = db.collection("orders").doc(orderId);
    const orderSnap = await orderRef.get();
    if (!orderSnap.exists) return res.status(404).json({ error: "Order not found" });
    const order = orderSnap.data();
    if (order.restaurant !== restaurant.restaurantId) return res.status(403).json({ error: "Not your order" });
    await orderRef.update({ status: newStatus, updatedAt: new Date() });
    let customerMsg = "";
    if (newStatus === "preparing") customerMsg = "👨‍🍳 Your order is being prepared.";
    else if (newStatus === "out_for_delivery") customerMsg = "🛵 Your order is out for delivery!";
    else if (newStatus === "delivered") customerMsg = "✅ Your order has been delivered. Enjoy your meal!";
    await notifyCustomer(order.phone, `Order #${orderId.slice(-6)}: ${customerMsg}`);
    if (newStatus === "delivered") {
      await notifyRestaurant(restaurant.phone, `✅ Order #${orderId.slice(-6)} has been successfully delivered. Thank you!`);
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// =========================
// 💳 PAYSTACK WEBHOOK (with earnings stored)
// =========================
app.post("/paystack/webhook", async (req, res) => {
  console.log("🔥 PAYSTACK HIT");
  try {
    const event = req.body;
    if (event.event !== "charge.success") return res.sendStatus(200);
    const metadata = event.data.metadata;
    if (!metadata || !metadata.orderId) {
      console.log("❌ Missing metadata");
      return res.sendStatus(200);
    }
    const orderId = metadata.orderId;
    const orderRef = db.collection("pendingOrders").doc(orderId);
    const orderSnap = await orderRef.get();
    if (!orderSnap.exists) return res.sendStatus(200);
    const order = orderSnap.data();
    const restaurant = await getRestaurant(order.restaurant);
    if (!restaurant) return res.sendStatus(200);
    const cartTotal = order.cart.reduce((sum, i) => sum + i.price * i.qty, 0);
    const pricing = calculatePricing(cartTotal);

    // Save to permanent orders collection with restaurantEarnings
    await db.collection("orders").doc(orderId).set({
      ...order,
      paymentStatus: "paid",
      status: "paid",
      restaurantEarnings: pricing.restaurantEarnings,
      createdAt: new Date(),
      address: order.address || "Not provided"
    });
    await orderRef.delete();

    // Handle referral commissions (if any)
    if (restaurant.referredBy && restaurant.referrerLevel) {
      const level = restaurant.referrerLevel;
      if (level === 1) {
        await creditWallet(restaurant.referredBy, 50, `Commission from order ${orderId.slice(-6)} (Level 1 direct referral)`, orderId);
      } else if (level === 2) {
        // Level 2 direct referral: gets 40, upline (level1) gets 10
        await creditWallet(restaurant.referredBy, 40, `Commission from order ${orderId.slice(-6)} (Level 2 referral)`, orderId);
        if (restaurant.referralPath && restaurant.referralPath[0]) {
          await creditWallet(restaurant.referralPath[0], 10, `Commission from order ${orderId.slice(-6)} (Level 1 upline)`, orderId);
        }
      } else if (level === 3) {
        // Level 3 direct: gets 30, upline level2 gets 20, level1 gets 10
        await creditWallet(restaurant.referredBy, 30, `Commission from order ${orderId.slice(-6)} (Level 3 referral)`, orderId);
        const level2Phone = restaurant.referralPath && restaurant.referralPath[restaurant.referralPath.length-1];
        if (level2Phone) await creditWallet(level2Phone, 20, `Commission from order ${orderId.slice(-6)} (Level 2 upline)`, orderId);
        if (restaurant.referralPath && restaurant.referralPath[0]) {
          await creditWallet(restaurant.referralPath[0], 10, `Commission from order ${orderId.slice(-6)} (Level 1 upline)`, orderId);
        }
      }
    }

    // Notify restaurant
    let msg = `📦 NEW PAID ORDER #${orderId.slice(-6)}\n\n`;
    order.cart.forEach(i => { msg += `${i.name} x${i.qty} – ₦${i.price * i.qty}\n`; });
    msg += `\n━━━━━━━━━━━━━━\n💰 Total: ₦${cartTotal}\n💸 Your Earnings: ₦${pricing.restaurantEarnings}\n🧾 Commission: ₦${pricing.commission}\nCustomer: ${order.phone}\nAddress: ${order.address}`;
    await notifyRestaurant(restaurant.phone, msg);
    await notifyCustomer(order.phone, `✅ Payment received! Your order #${orderId.slice(-6)} has been confirmed. We'll notify you when it's being prepared.`);

    // Reset customer session after payment
    await deleteSession(order.phone);

    res.sendStatus(200);
  } catch (err) {
    console.log("🔥 WEBHOOK ERROR:", err);
    res.sendStatus(500);
  }
});

// =========================
// 🛵 RIDER LOCATION UPDATE (optional)
// =========================
app.post("/update-rider-location", async (req, res) => {
  try {
    const { orderId, lat, lng, apiKey } = req.body;
    if (!orderId || !lat || !lng || !apiKey) return res.status(400).json({ error: "Missing fields" });
    const restaurantQuery = await db.collection("restaurants").where("apiKey", "==", apiKey).limit(1).get();
    if (restaurantQuery.empty) return res.status(401).json({ error: "Invalid API key" });
    const restaurant = restaurantQuery.docs[0].data();
    const orderRef = db.collection("orders").doc(orderId);
    const orderSnap = await orderRef.get();
    if (!orderSnap.exists) return res.status(404).json({ error: "Order not found" });
    const order = orderSnap.data();
    if (order.restaurant !== restaurant.restaurantId) return res.status(403).json({ error: "Not your order" });
    await orderRef.update({
      riderLocation: { lat: parseFloat(lat), lng: parseFloat(lng), updatedAt: new Date().toISOString() },
      status: "out_for_delivery"
    });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// =========================
// 🚀 START SERVER
// =========================
app.listen(3000, () => console.log("🚀 Server running on port 3000"));