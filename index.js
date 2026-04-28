// // const express = require("express");
// // const twilio = require("twilio");
// // const menus = require("./menus");
// // const bodyParser = require("body-parser");
// // const admin = require("firebase-admin");
// // const axios = require("axios");
// // const app = express();
// // app.use(express.urlencoded({ extended: false }));
// // app.use(express.json());
// // app.use(bodyParser.json());
// // app.use(bodyParser.urlencoded({ extended: true }));
// // require("dotenv").config();

// // const sessions = {};
// // const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

// // admin.initializeApp({
// //   credential: admin.credential.cert(serviceAccount),
// // });

// // const db = admin.firestore();
// // const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

// // app.post("/send", async (req, res) => {
// //   try {
// //     const { to, message } = req.body;

// //     const response = await client.messages.create({
// //       from: "whatsapp:+14155238886", // Twilio Sandbox number
// //       to: `whatsapp:${to}`,
// //       body: message
// //     });

// //     res.json({ success: true, sid: response.sid });
// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).json({ error: err.message });
// //   }
// // });

// // app.get("/", (req, res) => {
// //   res.send("Twilio server running 🚀");
// // });

// // // app.post("/webhook", async (req, res) => {
// // //   const twiml = new twilio.twiml.MessagingResponse();
// // //   const message = req.body.Body?.trim().toLowerCase() || "";
// // //   console.log("Incoming:", message);

// // // if (message.startsWith("menu_")) {
// // //   const slug = message.replace("menu_", "");
// // //   sendMenu(slug, twiml, res);
// // //   return;
// // // }

// // //   if (message === "hi") {
// // //     twiml.message("Welcome 👋 Send 1 for Lekki, 2 for Yaba.");
// // //   } else {
// // //     twiml.message("Send 'hi' to start 🍽");
// // //   }

// // //   res.type("text/xml");
// // //   res.send(twiml.toString());
// // // });


// // // app.post("/webhook", async (req, res) => {
// // //   const twiml = new twilio.twiml.MessagingResponse();

// // //   const from = req.body.From;
// // //   const message = req.body.Body?.trim().toLowerCase() || "";

// // //   console.log("Incoming:", message);

// // //   // SESSION INIT
// // //   if (!sessions[from]) {
// // //     sessions[from] = {
// // //       cart: [],
// // //       step: "start",
// // //       restaurant: null,
// // //       total: 0
// // //     };
// // //   }

// // //   const user = sessions[from];

// // //   // 🟢 START
// // //   if (message === "hi") {
// // //     twiml.message("🍽 Welcome!\n\nType:\nmenu_mamaput");
// // //   }

// // //   // 🟢 OPEN MENU
// // //   else if (message.startsWith("menu_")) {
// // //     const slug = message.replace("menu_", "");

// // //     user.restaurant = slug;

// // //     await sendMenu(slug, twiml, res);
// // //     return;
// // //   }

// // //   // 🟢 ADD ITEM TO CART
// // //   else if (!isNaN(message) && user.restaurant) {
// // //     const menu = await getMenu(user.restaurant);

// // //     const item = menu.find(i => i.id == message);

// // //     if (item) {
// // //       user.cart.push(item);

// // //       twiml.message(
// // //         `✅ ${item.name} added\n\nType another number to add more or type 'checkout'`
// // //       );
// // //     } else {
// // //       twiml.message("Invalid item.");
// // //     }
// // //   }

// // //   // 🟢 CHECKOUT
// // //   else if (message === "checkout") {
// // //     if (user.cart.length === 0) {
// // //       twiml.message("Cart is empty.");
// // //     } else {
// // //       let text = "🧾 Your Order:\n\n";
// // //       let total = 0;

// // //       user.cart.forEach(item => {
// // //         text += `${item.name} – ₦${item.price}\n`;
// // //         total += item.price;
// // //       });

// // //       user.total = total;

// // //       text += `\nTotal: ₦${total}`;
// // //       text += `\n\nType PAY to confirm`;

// // //       twiml.message(text);
// // //     }
// // //   }

// // //   // 🟢 PAYMENT (TEMP)
// // //   else if (message === "pay") {
// // //     twiml.message("✅ Order received! (Next: payment)");

// // //     user.cart = [];
// // //     user.step = "start";
// // //     user.restaurant = null;
// // //   }

// // //   // 🟢 DEFAULT
// // //   else {
// // //     twiml.message("Send 'hi' to start 🍽");
// // //   }

// // //   res.type("text/xml");
// // //   res.send(twiml.toString());
// // // });
// // async function saveOrder(order) {
// //   const doc = await db.collection("orders").add({
// //     ...order,
// //     status: "pending",
// //     createdAt: new Date()
// //   });

// //   return doc.id;
// // }

// // async function getRestaurantPhone(id) {
// //   const doc = await db.collection("Menus").doc(id).get();

// //   if (!doc.exists) return null;

// //   return doc.data().phone;
// // }

// // async function notifyRestaurant(phone, message) {
// //   await client.messages.create({
// //     from: "whatsapp:+14155238886",
// //     to: `whatsapp:${phone}`,
// //     body: message
// //   });
// // }


// // async function createPaymentLink(email, amount, metadata) {
// //   try {
// //     const response = await axios.post(
// //       "https://api.paystack.co/transaction/initialize",
// //       {
// //         email,
// //         amount: amount * 100, // Paystack uses kobo
// //         metadata
// //       },
// //       {
// //         headers: {
// //           Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
// //           "Content-Type": "application/json"
// //         }
// //       }
// //     );

// //     return response.data.data.authorization_url;

// //   } catch (error) {
// //     console.error("Paystack Error:", error.response?.data || error.message);
// //     return null;
// //   }
// // }

// // app.post("/webhook", async (req, res) => {
// //   const twiml = new twilio.twiml.MessagingResponse();

// //   const from = req.body.From;
// //   const message = req.body.Body?.trim().toLowerCase() || "";

// //   console.log("Incoming:", message);

// //   // ✅ INIT SESSION
// //   if (!sessions[from]) {
// //     sessions[from] = {
// //       cart: [],
// //       step: "start",
// //       restaurant: null,
// //       total: 0
// //     };
// //   }

// //   const user = sessions[from];

// //   try {
// //     // 🟢 START
// //     if (message === "hi") {
// //       user.cart = [];
// //       user.restaurant = null;

// //       twiml.message("🍽 Welcome!\n\nType:\nmenu_mamaput");
// //     }

// //     // 🟢 OPEN MENU
// //     else if (message.startsWith("menu_")) {
// //       const slug = message.replace("menu_", "").trim();

// //       const menu = await getMenu(slug);

// //       if (!menu) {
// //         twiml.message("❌ Restaurant not found.");
// //       } else {
// //         user.restaurant = slug;
// //         await sendMenu(slug, twiml, res);
// //         return; // IMPORTANT
// //       }
// //     }

// //     // 🟢 ADD ITEM TO CART
// //     else if (!isNaN(message)) {
// //       if (!user.restaurant) {
// //         twiml.message("⚠️ Please select a restaurant first.\nType menu_mamaput");
// //       } else {
// //         const menu = await getMenu(user.restaurant);

// //         if (!menu) {
// //           twiml.message("❌ Menu not available.");
// //         } else {
// //           const item = menu.find(i => Number(i.id) === Number(message));

// //           if (item) {
// //             user.cart.push(item);

// //             twiml.message(
// //               `✅ ${item.name} added\n\n` +
// //               `Type another number to add more\n` +
// //               `or type 'checkout'`
// //             );
// //           } else {
// //             twiml.message("❌ Invalid item number.");
// //           }
// //         }
// //       }
// //     }

// //     // 🟢 CHECKOUT
// //     else if (message === "checkout") {
// //       if (user.cart.length === 0) {
// //         twiml.message("🛒 Cart is empty.");
// //       } else {
// //         let text = "🧾 Your Order:\n\n";
// //         let total = 0;

// //         user.cart.forEach(item => {
// //           text += `${item.name} – ₦${item.price}\n`;
// //           total += Number(item.price);
// //         });

// //         user.total = total;

// //         text += `\nTotal: ₦${total}`;
// //         text += `\n\nType PAY to confirm`;

// //         twiml.message(text);
// //       }
// //     }

// //     // 🟢 PAYMENT (TEMP)


// // // else if (message === "pay") {
// // //   if (user.cart.length === 0) {
// // //     twiml.message("⚠️ Your cart is empty.");
// // //   } else {

// // //     // ✅ Prepare order
// // //     const orderData = {
// // //       userPhone: from,
// // //       restaurantId: user.restaurant,
// // //       items: user.cart,
// // //       total: user.total
// // //     };

// // //     // ✅ Save order
// // //     const orderId = await saveOrder(orderData);

// // //     // ✅ Get restaurant phone
// // //     const phone = await getRestaurantPhone(user.restaurant);

// // //     // ✅ Build message
// // //     let restaurantMsg = `📦 New Order!\n\n`;

// // //     user.cart.forEach(item => {
// // //       restaurantMsg += `${item.name} – ₦${item.price}\n`;
// // //     });

// // //     restaurantMsg += `\nTotal: ₦${user.total}`;
// // //     restaurantMsg += `\nCustomer: ${from}`;
// // //     restaurantMsg += `\nOrder ID: ${orderId}`;

// // //     // ✅ Send to restaurant
// // //     if (phone) {
// // //       await notifyRestaurant(phone, restaurantMsg);
// // //     }

// // //     // ✅ Reply to user
// // //     twiml.message(
// // //       `✅ Order placed successfully!\n\nOrder ID: ${orderId}\n\nRestaurant has been notified 🍽`
// // //     );

// // //     // 🔄 Reset
// // //     user.cart = [];
// // //     user.restaurant = null;
// // //     user.total = 0;
// // //     user.step = "start";
// // //   }
// // // }

// // else if (message === "pay") {
// //   if (user.cart.length === 0) {
// //     twiml.message("⚠️ Your cart is empty.");
// //   } else {

// //     const email = "mshittu234@gmail.com";

// //     const paymentLink = await createPaymentLink(
// //       email,
// //       user.total,
// //       {
// //         phone: from,
// //         restaurant: user.restaurant,
// //         cart: JSON.stringify(user.cart) // 🔥 IMPORTANT
// //       }
// //     );

// //     if (!paymentLink) {
// //       twiml.message("❌ Payment failed.");
// //     } else {
// //       twiml.message(
// //         `💳 Pay here:\n${paymentLink}\n\nYour order will be confirmed after payment.`
// //       );
// //     }
// //   }
// // }
// //     // 🟢 RESET COMMAND (VERY USEFUL)
// //     else if (message === "reset") {
// //       sessions[from] = {
// //         cart: [],
// //         step: "start",
// //         restaurant: null,
// //         total: 0
// //       };

// //       twiml.message("🔄 Session reset. Type 'hi' to start again.");
// //     }

// //     // 🟢 DEFAULT
// //     else {
// //       twiml.message("Send 'hi' to start 🍽");
// //     }

// //     res.type("text/xml");
// //     res.send(twiml.toString());

// //   } catch (error) {
// //     console.error("Webhook error:", error);

// //     twiml.message("⚠️ Something went wrong. Please try again.");

// //     res.type("text/xml");
// //     res.send(twiml.toString());
// //   }
// // });

// // app.get("/test-db", async (req, res) => {
// //   try {
// //     await db.collection("test").add({
// //       name: "Chowbot",
// //       createdAt: new Date()
// //     });

// //     res.send("Firestore working ✅");
// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).send("Error");
// //   }
// // });

// // // async function getMenu(restaurantId) {
// // //   const doc = await db.collection("Menus").doc('mamaput').get();

// // //   if (!doc.exists) return null;

// // //   return doc.data().items;
// // // }

// // async function getMenu(restaurantId) {
// //   const doc = await db.collection("Menus").doc(restaurantId).get();

// //   if (!doc.exists) return null;

// //   return doc.data().items;
// // }
// // //  async function sendMenu(slug, twiml, res) {

// // //   // const restaurant = menus[slug];
// // //       const restaurant = await getMenu(slug);

// // //   if (!restaurant) {
// // //     twiml.message("Restaurant not found.");
// // //   } else {

// // //     let text = `🍽 ${restaurant.name} Menu\n\n`;

// // //     restaurant.menu.forEach((item) => {
// // //       text += `${item.id}️⃣ ${item.name} – ₦${item.price}\n`;
// // //     });

// // //     text += "\nReply with item number.";

// // //     twiml.message(text);
// // //   }

// // //   res.type("text/xml");
// // //   res.send(twiml.toString());
// // // }

// // // async function sendMenu(slug, twiml, res) {
// // //   try {
// // //     const menu = await getMenu(slug);
// // //     const restaurant = await getRestaurant(slug);

// // //     if (!menu || !restaurant) {
// // //       twiml.message("Restaurant not found.");
// // //     } else {
// // //       let text = `🍽 ${restaurant.name} Menu\n\n`;

// // //       menu.forEach((item) => {
// // //         text += `${item.id}️⃣ ${item.name} – ₦${item.price}\n`;
// // //       });

// // //       text += "\nReply with item number.";

// // //       twiml.message(text);
// // //     }

// // //     res.type("text/xml");
// // //     res.send(twiml.toString());

// // //   } catch (err) {
// // //     console.error(err);
// // //     res.status(500).send("Error");
// // //   }
// // // }

// // // async function sendMenu(slug, twiml, res) {
// // //   try {
// // //     const menu = await getMenu(slug);

// // //     if (!menu) {
// // //       twiml.message("Restaurant not found.");
// // //     } else {
// // //       let text = `🍽 Menu\n\n`;

// // //       menu.forEach((item) => {
// // //         text += `${item.id}️⃣ ${item.name} – ₦${item.price}\n`;
// // //       });

// // //       text += "\nReply with item number.";

// // //       twiml.message(text);
// // //     }

// // //     res.type("text/xml");
// // //     res.send(twiml.toString());

// // //   } catch (err) {
// // //     console.error(err);
// // //     res.status(500).send("Error");
// // //   }
// // // }

// // app.post("/paystack/webhook", express.json(), async (req, res) => {
// //   const event = req.body;

// //   if (event.event === "charge.success") {
// //     const data = event.data;
// //     const metadata = data.metadata;

// //     // 🔥 GET CART BACK
// //     let cart = [];

// //     try {
// //       cart = JSON.parse(metadata.cart);
// //     } catch (err) {
// //       console.error("Cart parse error:", err);
// //     }

// //     const orderData = {
// //       userPhone: metadata.phone,
// //       restaurantId: metadata.restaurant,
// //       items: cart, // ✅ FULL ITEMS NOW
// //       total: data.amount / 100
// //     };

// //     const orderId = await saveOrder(orderData);

// //     const phone = await getRestaurantPhone(metadata.restaurant);

// //     // 🔥 FULL ORDER MESSAGE
// //     let msg = `📦 Paid Order!\n\n`;

// //     cart.forEach(item => {
// //       msg += `${item.name} – ₦${item.price}\n`;
// //     });

// //     msg += `\nTotal: ₦${orderData.total}`;
// //     msg += `\nCustomer: ${metadata.phone}`;
// //     msg += `\nOrder ID: ${orderId}`;

// //     if (phone) {
// //       await notifyRestaurant(phone, msg);
// //     }

// //     console.log("✅ FULL order saved:", orderId);
// //   }

// //   res.sendStatus(200);
// // });
// // async function sendMenu(slug, twiml, res) {
// //   try {
// //     const menu = await getMenu(slug);

// //     if (!menu) {
// //       twiml.message("Restaurant not found.");
// //     } else {
// //       let text = `🍽 Menu\n\n`;

// //       menu.forEach((item) => {
// //         text += `${item.id}️⃣ ${item.name} – ₦${item.price}\n`;
// //       });

// //       text += "\nReply with item number.";

// //       twiml.message(text);
// //     }

// //     res.type("text/xml");
// //     res.send(twiml.toString());

// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).send("Error");
// //   }
// // }
// // const PORT = process.env.PORT || 3000;
// // app.listen(PORT, () => console.log(`Server running on ${PORT}`));



// require("dotenv").config();
// const express = require("express");
// const twilio = require("twilio");
// const bodyParser = require("body-parser");
// const admin = require("firebase-admin");
// const axios = require("axios");

// const app = express();
// app.use(express.urlencoded({ extended: false }));
// app.use(express.json());
// app.use(bodyParser.json());

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

// async function getMenu(id) {
//   const doc = await db.collection("menus").doc(id).get();
//   if (!doc.exists) return null;
//   return doc.data().items;
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
//   snapshot.forEach(doc => {
//     list.push({ id: doc.id, ...doc.data() });
//   });

//   return list;
// }

// async function saveOrder(order) {
//   const doc = await db.collection("orders").add({
//     ...order,
//     status: "pending",
//     createdAt: new Date()
//   });

//   return doc.id;
// }

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

// async function sendMenu(id, twiml, res) {
//   const menu = await getMenu(id);
//   const restaurant = await getRestaurant(id);

//   if (!menu || !restaurant) {
//     twiml.message("❌ Restaurant not found.");
//   } else {
//     let text = `🍽 ${restaurant.name} Menu\n\n`;

//     menu.forEach(item => {
//       text += `${item.id}️⃣ ${item.name} – ₦${item.price}\n`;
//     });

//     text += "\nSend number or CHECKOUT";

//     twiml.message(text);
//   }

//   res.type("text/xml");
//   res.send(twiml.toString());
// }

// // =========================
// // 🔥 WEBHOOK (MAIN LOGIC)
// // =========================

// app.post("/webhook", async (req, res) => {
//   const twiml = new twilio.twiml.MessagingResponse();

//   const from = req.body.From;
//   const message = req.body.Body?.trim().toLowerCase() || "";

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
//     // 🔗 QR / LINK FLOW
//     // =========================
//     if (message.startsWith("hi")) {
//       const parts = message.split(" ");
//       const id = parts[1];

//       // QR link: hi <uuid>
//       if (id && uuidRegex.test(id)) {
//         user.restaurant = id;
//         user.step = "menu";
//         user.cart = [];

//         await sendMenu(id, twiml, res);
//         return;
//       }

//       // normal user
//       user.step = "ask_location";
//       twiml.message("📍 Enter your area (Lekki, Yaba)");
//     }

//     // =========================
//     // 📍 LOCATION INPUT
//     // =========================
//     else if (user.step === "ask_location") {
//       const restaurants = await getRestaurantsByLocation(message);

//       if (!restaurants.length) {
//         twiml.message("❌ No restaurants found.");
//       } else {
//         user.availableRestaurants = restaurants;
//         user.step = "choose_restaurant";

//         let text = "🍽 Nearby Restaurants:\n\n";

//         restaurants.forEach((r, i) => {
//           text += `${i + 1}️⃣ ${r.name}\n`;
//         });

//         text += "\nReply with number";

//         twiml.message(text);
//       }
//     }

//     // =========================
//     // 🍽 SELECT RESTAURANT
//     // =========================
//     else if (user.step === "choose_restaurant") {
//       const index = Number(message) - 1;
//       const selected = user.availableRestaurants[index];

//       if (!selected) {
//         twiml.message("❌ Invalid choice.");
//       } else {
//         user.restaurant = selected.id;
//         user.step = "menu";
//         user.cart = [];

//         await sendMenu(selected.id, twiml, res);
//         return;
//       }
//     }

//     // =========================
//     // ➕ ADD TO CART
//     // =========================
//     else if (!isNaN(message)) {
//       if (!user.restaurant) {
//         twiml.message("⚠️ Start with 'hi'");
//       } else {
//         const menu = await getMenu(user.restaurant);
//         const item = menu?.find(i => Number(i.id) === Number(message));

//         if (!item) {
//           twiml.message("❌ Invalid item.");
//         } else {
//           user.cart.push(item);

//           twiml.message(
//             `✅ ${item.name} added\n\nSend number or CHECKOUT`
//           );
//         }
//       }
//     }

//     // =========================
//     // 💳 CHECKOUT (AUTO PAYMENT)
//     // =========================
//     else if (message === "checkout") {
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

//     // =========================
//     // 🔄 RESET
//     // =========================
//     else if (message === "reset") {
//       sessions[from] = {
//         cart: [],
//         step: "start",
//         restaurant: null,
//         total: 0
//       };

//       twiml.message("🔄 Reset. Send 'hi'");
//     }

//     else {
//       twiml.message("Send 'hi' to start");
//     }

//     res.type("text/xml");
//     res.send(twiml.toString());

//   } catch (err) {
//     console.error(err);
//     twiml.message("⚠️ Error occurred.");
//     res.type("text/xml").send(twiml.toString());
//   }
// });

// // =========================
// // 💰 PAYSTACK WEBHOOK
// // =========================

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

//     console.log("✅ Order saved:", orderId);
//   }

//   res.sendStatus(200);
// });

// // =========================

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

// 🔥 FIREBASE
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// 🔥 TWILIO
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

// =========================
// 🔧 HELPERS
// =========================

const uuidRegex = /^[0-9a-fA-F-]{36}$/;

// 🔹 GET MENU
async function getMenu(id) {
  const doc = await db.collection("menus").doc(id).get();
  if (!doc.exists) return null;
  return doc.data().items;
}

// 🔹 GET RESTAURANT
async function getRestaurant(id) {
  const doc = await db.collection("restaurants").doc(id).get();
  return doc.exists ? doc.data() : null;
}

// 🔹 GET BY LOCATION
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

// 🔹 SAVE ORDER
async function saveOrder(order) {
  const doc = await db.collection("orders").add({
    ...order,
    status: "pending",
    createdAt: new Date()
  });

  return doc.id;
}

// 🔹 NOTIFY RESTAURANT
async function notifyRestaurant(phone, message) {
  try {
    await client.messages.create({
      from: "whatsapp:+14155238886",
      to: `whatsapp:${phone}`,
      body: message
    });
  } catch (err) {
    console.error("Notify error:", err.message);
  }
}

// 🔹 PAYMENT LINK
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
    console.error("Paystack Error:", err.response?.data || err.message);
    return null;
  }
}

// =========================
// 🔥 SEND MENU (BUTTONS)
// =========================

async function sendMenuButtons(id, from) {
  const menu = await getMenu(id);
  const restaurant = await getRestaurant(id);

  if (!menu || !restaurant) return;

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
          description: "View your order"
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
      body: { text: "Select an item" },
      action: {
        button: "View Menu",
        sections
      }
    }
  });
}

// =========================
// 🔥 WEBHOOK
// =========================

app.post("/webhook", async (req, res) => {
  const twiml = new twilio.twiml.MessagingResponse();

  const from = req.body.From;
  const message = req.body.Body?.trim().toLowerCase() || "";

  // 🔥 BUTTON HANDLER
  const buttonId =
    req.body.ListResponse?.id ||
    req.body.ButtonPayload ||
    message;

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

    // =========================
    // 🔗 QR FLOW
    // =========================
    if (message.startsWith("hi")) {
      const parts = message.split(" ");
      const id = parts[1];

      if (id && uuidRegex.test(id)) {
        user.restaurant = id;
        user.cart = [];

        await sendMenuButtons(id, from);
        return res.sendStatus(200);
      }

      user.step = "ask_location";
      twiml.message("📍 Enter your area (Lekki, Yaba)");
    }

    // =========================
    // LOCATION
    // =========================
    else if (user.step === "ask_location") {
      const restaurants = await getRestaurantsByLocation(message);

      if (!restaurants.length) {
        twiml.message("❌ No restaurants found.");
      } else {
        user.availableRestaurants = restaurants;
        user.step = "choose_restaurant";

        let text = "🍽 Restaurants:\n\n";
        restaurants.forEach((r, i) => {
          text += `${i + 1}️⃣ ${r.name}\n`;
        });

        twiml.message(text + "\nReply with number");
      }
    }

    // =========================
    // SELECT RESTAURANT
    // =========================
    else if (user.step === "choose_restaurant") {
      const index = Number(message) - 1;
      const selected = user.availableRestaurants[index];

      if (!selected) {
        twiml.message("❌ Invalid choice.");
      } else {
        user.restaurant = selected.id;
        user.cart = [];

        await sendMenuButtons(selected.id, from);
        return res.sendStatus(200);
      }
    }

    // =========================
    // ITEM CLICK (BUTTON)
    // =========================
    else if (buttonId.startsWith("item_")) {
      const itemId = buttonId.replace("item_", "");

      const menu = await getMenu(user.restaurant);
      const item = menu.find(i => String(i.id) === itemId);

      if (!item) {
        twiml.message("❌ Item not found");
      } else {
        user.cart.push(item);

        // 🔥 SEND IMAGE
        if (item.image) {
          await client.messages.create({
            from: "whatsapp:+14155238886",
            to: from,
            body: `${item.name} – ₦${item.price}`,
            mediaUrl: [item.image]
          });
        }

        // 🔁 SEND MENU AGAIN
        await sendMenuButtons(user.restaurant, from);
        return res.sendStatus(200);
      }
    }

    // =========================
    // CHECKOUT
    // =========================
    else if (buttonId === "checkout") {
      if (!user.cart.length) {
        twiml.message("🛒 Cart empty.");
      } else {

        let total = 0;
        let summary = "🧾 Order:\n\n";

        user.cart.forEach(item => {
          summary += `${item.name} – ₦${item.price}\n`;
          total += Number(item.price);
        });

        user.total = total;

        const link = await createPaymentLink(
          "user@email.com",
          total,
          {
            phone: from,
            restaurant: user.restaurant,
            cart: JSON.stringify(user.cart)
          }
        );

        twiml.message(
          `${summary}\nTotal: ₦${total}\n\n💳 Pay:\n${link}`
        );
      }
    }

    else {
      twiml.message("Send 'hi' to start");
    }

    res.type("text/xml").send(twiml.toString());

  } catch (err) {
    console.error(err);
    twiml.message("⚠️ Error occurred.");
    res.type("text/xml").send(twiml.toString());
  }
});

// =========================
// 💰 PAYSTACK WEBHOOK
// =========================



// 🔥 REGISTER RESTAURANT
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

app.post("/register-restaurant", async (req, res) => {
  try {
    const { name, phone, location, deliveryFee } = req.body;

    const doc = await db.collection("restaurants").add({
      name,
      phone,
      location: location.toLowerCase(),
      deliveryFee: Number(deliveryFee),
      createdAt: new Date()
    });

   const link = `https://wa.me/14155238886?text=hi ${doc.id}`;

    res.json({
      success: true,
      restaurantId,
      whatsappLink:link
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to register" });
  }
});

app.post("/paystack/webhook", express.json(), async (req, res) => {
  const event = req.body;

  if (event.event === "charge.success") {
    const data = event.data;
    const meta = data.metadata;

    let cart = [];
    try {
      cart = JSON.parse(meta.cart);
    } catch {}

    const orderId = await saveOrder({
      userPhone: meta.phone,
      restaurantId: meta.restaurant,
      items: cart,
      total: data.amount / 100
    });

    const restaurant = await getRestaurant(meta.restaurant);

    let msg = `📦 Paid Order!\n\n`;

    cart.forEach(i => {
      msg += `${i.name} – ₦${i.price}\n`;
    });

    msg += `\nTotal: ₦${data.amount / 100}`;
    msg += `\nCustomer: ${meta.phone}`;
    msg += `\nOrder ID: ${orderId}`;

    if (restaurant?.phone) {
      await notifyRestaurant(restaurant.phone, msg);
    }
  }

  res.sendStatus(200);
});



app.get("/restaurant-qr/:id", async (req, res) => {
  const id = req.params.id;

  const link = `https://wa.me/14155238886?text=hi%20${id}`;

  const qr = await QRCode.toDataURL(link);

  res.send(`
    <h2>Scan to Order</h2>
    <img src="${qr}" />
    <p>${link}</p>
  `);
});
// =========================




// =========================
// 🍽 SAVE MENU
// =========================
app.post("/save-menu", async (req, res) => {
  try {
    const { restaurantId, items } = req.body;

    if (!restaurantId || !items) {
      return res.status(400).json({ error: "Missing data" });
    }

    await db.collection("menus").doc(restaurantId).set({
      restaurantId,
      items,
      updatedAt: new Date()
    });

    res.json({ success: true });

  } catch (err) {
    console.error("Save menu error:", err);
    res.status(500).json({ error: "Failed to save menu" });
  }
});


// =========================
// 📥 GET MENU (FOR BOT)
// =========================
app.get("/menu/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const doc = await db.collection("menus").doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Menu not found" });
    }

    res.json(doc.data());

  } catch (err) {
    console.error("Get menu error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// =========================
// 🏪 GET RESTAURANT
// =========================
app.get("/restaurant/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const doc = await db.collection("restaurants").doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    res.json(doc.data());

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


app.post("/add-item", async (req, res) => {
  const { restaurantId, name, price, image } = req.body;

  try {
    const doc = await db
      .collection("menus")
      .doc(restaurantId)
      .collection("items")
      .add({
        name,
        price: Number(price),
        image,
        createdAt: new Date()
      });

    res.json({ success: true, id: doc.id });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add item" });
  }
});


app.get("/get-menu/:restaurantId", async (req, res) => {
  const { restaurantId } = req.params;

  try {
    const snapshot = await db
      .collection("menus")
      .doc(restaurantId)
      .collection("items")
      .get();

    const items = [];

    snapshot.forEach(doc => {
      items.push({ id: doc.id, ...doc.data() });
    });

    res.json(items);

  } catch (err) {
    res.status(500).json({ error: "Failed to fetch menu" });
  }
});


app.post("/update-item", async (req, res) => {
  const { restaurantId, itemId, name, price, image } = req.body;

  try {
    await db
      .collection("menus")
      .doc(restaurantId)
      .collection("items")
      .doc(itemId)
      .update({
        name,
        price: Number(price),
        image
      });

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Update failed" });
  }
});


app.post("/delete-item", async (req, res) => {
  const { restaurantId, itemId } = req.body;

  try {
    await db
      .collection("menus")
      .doc(restaurantId)
      .collection("items")
      .doc(itemId)
      .delete();

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));