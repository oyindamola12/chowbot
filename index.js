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

// const sessions = {};

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
  snapshot.forEach((doc) =>
    items.push({ id: doc.id, ...doc.data() })
  );
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
  snapshot.forEach((doc) =>
    list.push({ id: doc.id, ...doc.data() })
  );
  return list;
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
// 🧠 CART
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
  text += "🧾 Actions:\n";
  text += "• type: remove item name\n";
  text += "• type: 1, 2, 3 to add more\n";
  text += "• type: checkout\n";

  return text;
}

// =========================
// MULTI INPUT
// =========================
function parseMultipleItems(input) {
  return input
    .split(",")
    .map((n) => parseInt(n.trim()))
    .filter((n) => !isNaN(n));
}

// =========================
// 🍽 MENU
// =========================
// async function sendMenuText(restaurantId, twiml, res) {
//   const menu = await getMenu(restaurantId);
//   const restaurant = await getRestaurant(restaurantId);

//   if (!menu.length || !restaurant) {
//     twiml.message("❌ Menu not available");
//     return res.type("text/xml").send(twiml.toString());
//   }

//   let text =
//     `Welcome to 🍽 ${restaurant.name}. Please checkout our menu to place your order.\n\n`;

//   menu.forEach((item, i) => {
//     text += `${i + 1}. ${item.name} – ₦${item.price}\n`;
//   });

//   text += "\nReply with number(s) like 1,2,3";

//   twiml.message(text);
//   res.type("text/xml").send(twiml.toString());
// }
async function sendMenuText(restaurantId, twiml, res) {
  const menu = await getMenu(restaurantId);
  const restaurant = await getRestaurant(restaurantId);
  if (!menu.length || !restaurant) {
    twiml.message("❌ Menu not available");
    return res.type("text/xml").send(twiml.toString());
  }
  // ... build text
  twiml.message(text);
  res.type("text/xml").send(twiml.toString());
}
// ===============================
// 🔥 ID GENERATOR FUNCTION
// ===============================
function generateRestaurantId(name) {
  const cleanName = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const uniquePart =
    Date.now().toString(36) +
    Math.random().toString(36).substring(2, 6);

  return `${cleanName}-${uniquePart}`;
}

app.post("/register-restaurant", async (req, res) => {
  try {
    const {
      name,
      phone,
      state,
      localGovt,
      deliveryFee,
      location,
    } = req.body;

    // validation
    if (!name || !phone || !state || !localGovt || !deliveryFee||!location) {
      return res.json({
        success: false,
        message: "Missing required fields"
      });
    }

     // =========================
    // 2. CHECK DUPLICATE PHONE
    // =========================
    const existing = await db
      .collection("restaurants")
      .where("phone", "==", phone)
      .get();

    if (!existing.empty) {
      return res.json({
        success: false,
        message: "⚠️ This WhatsApp number is already registered. Please use a different number."
      });
    }

    // 🔥 generate custom ID
    
    const restaurantId = generateRestaurantId(name);

    // 💾 save to Firestore
    await db.collection("restaurants").doc(restaurantId).set({
      restaurantId,
      name,
      phone,
      state,
      localGovt,
      address:location,
      deliveryFee: Number(deliveryFee),

      createdAt: new Date()
    });

    // response
    res.json({
      success: true,
      restaurantId,
      whatsappLink: `https://wa.me/${phone}`
    });

  } catch (err) {
    console.error(err);
    res.json({
      success: false,
      message: "Server error"
    });
  }
});

// =========================
// WEBHOOK
// =========================
// app.post("/webhook", async (req, res) => {
//   const twiml = new twilio.twiml.MessagingResponse();

//   const from = req.body.From;
//   const message = (req.body.Body || "").trim().toLowerCase();

//   // if (!sessions[from]) {
//   //   sessions[from] = {
//   //     cart: [],
//   //     restaurant: null,
//   //     step: "start",
//   //   };
//   // }

//   // const user = sessions[from];


// const { getSession, saveSession, deleteSession } = require("./sessionManager");

// let user = await getSession(from);

// // If no step (fresh user), ensure defaults
// if (!user.step) {
//   user = {
//     cart: [],
//     restaurant: null,
//     step: "start",
//     available: [],
//   };
// }

//   try {

//     // START
//     if (message.startsWith("hi")) {
//       const id = message.split(" ")[1];

//       if (id) {
//         user.restaurant = id;
//         user.cart = [];
//         await sendMenuText(id, twiml, res);
//         return;
//       }

//       user.step = "location";
//       twiml.message("📍 Enter your area (Lekki, Yaba)");
//     }

//     // LOCATION
//     else if (user.step === "location") {
//       const list = await getRestaurantsByLocation(message);

//       if (!list.length) {
//         twiml.message("❌ No restaurants found");
//       } else {
//         user.available = list;
//         user.step = "choose";

//         let text = "🍽 Restaurants:\n";
//         list.forEach((r, i) => {
//           text += `${i + 1}. ${r.name}\n`;
//         });

//         twiml.message(text + "\nReply with number");
//       }
//     }

//     // CHOOSE RESTAURANT
//     else if (user.step === "choose") {
//       const index = Number(message) - 1;
//       const selected = user.available[index];

//       if (!selected) return twiml.message("❌ Invalid choice");

//       user.restaurant = selected.id;
//       user.cart = [];

//       await sendMenuText(selected.id, twiml, res);
//       return;
//     }


//     // ADD ITEMS
//     else if (/^[\d,\s]+$/.test(message)) {
//       if (!user.restaurant) {
//         return twiml.message("⚠️ Type hi first");
//       }

//       const menu = await getMenu(user.restaurant);
//       const numbers = parseMultipleItems(message);

//       let added = [];

//       numbers.forEach((num) => {
//         const item = menu[num - 1];
//         if (!item) return;

//         const existing = user.cart.find((i) => i.id === item.id);

//         if (existing) existing.qty++;
//         else user.cart.push({ ...item, qty: 1 });
//         added.push(item.name);
//       });
//   await saveSession(from, user);
//       twiml.message(
//         `✅ Added:\n• ${added.join("\n• ")}\n\n` +
//         formatCartUI(user.cart)
//       );
//     }


//     //CART

//     else if (message === "cart") {
//   if (!user.cart.length) {
//     twiml.message("🛒 Cart is empty");
//   } else {
//     twiml.message(formatCartUI(user.cart));
//   }
// }
//     // REMOVE
//     else if (message.startsWith("remove ")) {
//       const name = message.replace("remove ", "").toLowerCase();

//       const index = user.cart.findIndex((i) =>
//         i.name.toLowerCase().includes(name)
//       );

//       if (index === -1) {
//         twiml.message("❌ Item not found");
//       } else {
//         const item = user.cart[index];

//         if (item.qty > 1) {
//           item.qty--;
//           twiml.message(`➖ Removed 1 ${item.name}\n\n` + formatCartUI(user.cart));
//         } else {
//           user.cart.splice(index, 1);
//           twiml.message(`🗑 Removed ${item.name}\n\n` + formatCartUI(user.cart));
//         }
//       }
//     }

//     // CHECKOUT (FIXED ORDER DELIVERY)
// //     else if (message === "checkout") {
// //       if (!user.cart.length) {
// //         return twiml.message("🛒 Cart empty");
// //       }

// //       let cartTotal = 0;

// //       user.cart.forEach((i) => {
// //         cartTotal += i.price * i.qty;
// //       });

// //       const pricing = calculatePricing(cartTotal);

// //       const link = await createPaymentLink(
// //         "user@email.com",
// //         pricing.customerPays,
// //         {
// //           phone: from,
// //           restaurant: user.restaurant,
// //           cart: JSON.stringify(user.cart),
// //           cartTotal,
// //         }
// //       );

// //       // ✅ FIX: ALWAYS SEND ORDER TO RESTAURANT HERE (NO FLOW CHANGE)
// //       const restaurant = await getRestaurant(user.restaurant);

// //       if (restaurant?.phone) {
// //         let orderMsg = `📦 NEW ORDER\n\n`;

// //         user.cart.forEach((i) => {
// //           orderMsg += `${i.name} x${i.qty} – ₦${i.price * i.qty}\n`;
// //         });

// //         orderMsg += `
// // ━━━━━━━━━━━━━━
// // 💰 Total: ₦${cartTotal}
// // 🚚 Fee: ₦${pricing.serviceFee}
// // 🧾 Commission: ₦${pricing.commission}
// // `;

// //         await notifyRestaurant(restaurant.phone, orderMsg);
// //       }

// //       twiml.message(
// //         `🧾 ORDER\n\n${formatCartUI(user.cart)}\n\n💳 Pay:\n${link}`
// //       );
// //     }

// else if (message === "checkout") {
//   if (!user.cart.length) {
//     return twiml.message("🛒 Cart empty");
//   }

//   let cartTotal = 0;

//   user.cart.forEach((i) => {
//     cartTotal += i.price * i.qty;
//   });

//   const pricing = calculatePricing(cartTotal);

//   // create pending order ID
//   const orderId = uuidv4();

//   // store pending order in Firebase (IMPORTANT FIX)
//   await db.collection("pendingOrders").doc(orderId).set({
//     phone: from,
//     restaurant: user.restaurant,
//     cart: user.cart,
//     cartTotal,
//     status: "pending_payment",
//     createdAt: new Date()
//   });
// const link = await createPaymentLink(
//   "user@email.com",
//   pricing.customerPays,
//   {
//     orderId: orderId.toString(),
//     phone: from,
//     restaurant: user.restaurant,
//     cart: JSON.stringify(user.cart)
//   }
// );

//   twiml.message(
//     `🧾 ORDER SUMMARY\n\n` +
//       `${formatCartUI(user.cart)}\n\n` +
//       `🚚 Fee: ₦${pricing.serviceFee}\n` +
//       `💰 Total: ₦${pricing.customerPays}\n\n` +
//       `💳 Pay here:\n${link}`
//   );
// }
//     // RESET
//    else if (message === "reset") {
//   await deleteSession(from);
//   twiml.message("🔄 Reset done. Send hi");
// }

//     // DEFAULT
//     else {
//       twiml.message("Send 'hi' to start");
//     }

//     res.type("text/xml").send(twiml.toString());
//   } catch (err) {
//     console.log(err);
//     twiml.message("⚠️ Error occurred");
//     res.type("text/xml").send(twiml.toString());
//   }
// });

// =========================
// WEBHOOK (FULLY PERSISTED)
// =========================
app.post("/webhook", async (req, res) => {
  const twiml = new twilio.twiml.MessagingResponse();

  const from = req.body.From;
  const message = (req.body.Body || "").trim().toLowerCase();

  // ✅ Load session from Firestore
  const { getSession, saveSession, deleteSession } = require("./sessionManager");
  let user = await getSession(from);

  // Ensure defaults if this is a completely new user
  if (!user.step) {
    user = {
      cart: [],
      restaurant: null,
      step: "start",
      available: [],
    };
    await saveSession(from, user); // ✅ SESSION SAVED (initial)
  }

  try {
    // ========== START ==========
    if (message.startsWith("hi")) {
      const id = message.split(" ")[1];
      if (id) {
        user.restaurant = id;
        user.cart = [];
        await saveSession(from, user); // ✅ SESSION SAVED
        await sendMenuText(id, twiml, res);
        return;
      }
      user.step = "location";
      await saveSession(from, user); // ✅ SESSION SAVED
      twiml.message("📍 Enter your area (Lekki, Yaba)");
    }

    // ========== LOCATION ==========
    else if (user.step === "location") {
      const list = await getRestaurantsByLocation(message);
      if (!list.length) {
        twiml.message("❌ No restaurants found");
      } else {
        user.available = list;
        user.step = "choose";
        await saveSession(from, user); // ✅ SESSION SAVED
        let text = "🍽 Restaurants:\n";
        list.forEach((r, i) => {
          text += `${i + 1}. ${r.name}\n`;
        });
        twiml.message(text + "\nReply with number");
      }
    }

    // ========== CHOOSE RESTAURANT ==========
    else if (user.step === "choose") {
      const index = Number(message) - 1;
      const selected = user.available[index];
      if (!selected) {
        twiml.message("❌ Invalid choice");
      } else {
        user.restaurant = selected.id;
        user.cart = [];
        user.step = null; // clear step
        await saveSession(from, user); // ✅ SESSION SAVED
        await sendMenuText(selected.id, twiml, res);
        return;
      }
    }

    // ========== ADD ITEMS (numbers or comma‑separated) ==========
    else if (/^[\d,\s]+$/.test(message)) {
      if (!user.restaurant) {
        twiml.message("⚠️ Type hi first");
      } else {
        const menu = await getMenu(user.restaurant);
        const numbers = parseMultipleItems(message);
        let added = [];
        numbers.forEach((num) => {
          const item = menu[num - 1];
          if (!item) return;
          const existing = user.cart.find((i) => i.id === item.id);
          if (existing) existing.qty++;
          else user.cart.push({ ...item, qty: 1 });
          added.push(item.name);
        });
        if (added.length) {
          await saveSession(from, user); // ✅ SESSION SAVED
          twiml.message(
            `✅ Added:\n• ${added.join("\n• ")}\n\n` +
            formatCartUI(user.cart)
          );
        } else {
          twiml.message("❌ No valid item numbers");
        }
      }
    }

    // ========== REMOVE ITEM ==========
    else if (message.startsWith("remove ")) {
      const name = message.replace("remove ", "").toLowerCase();
      const index = user.cart.findIndex((i) =>
        i.name.toLowerCase().includes(name)
      );
      if (index === -1) {
        twiml.message("❌ Item not found");
      } else {
        const item = user.cart[index];
        if (item.qty > 1) {
          item.qty--;
          twiml.message(`➖ Removed 1 ${item.name}\n\n` + formatCartUI(user.cart));
        } else {
          user.cart.splice(index, 1);
          twiml.message(`🗑 Removed ${item.name}\n\n` + formatCartUI(user.cart));
        }
        await saveSession(from, user); // ✅ SESSION SAVED
      }
    }

    // ========== CHECKOUT ==========
    else if (message === "checkout") {
      if (!user.cart.length) {
        twiml.message("🛒 Cart empty");
      } else {
        let cartTotal = 0;
        user.cart.forEach((i) => {
          cartTotal += i.price * i.qty;
        });
        const pricing = calculatePricing(cartTotal);

        const orderId = uuidv4();
        await db.collection("pendingOrders").doc(orderId).set({
          phone: from,
          restaurant: user.restaurant,
          cart: user.cart,
          cartTotal,
          status: "pending_payment",
          createdAt: new Date()
        });

        const link = await createPaymentLink(
          "user@email.com",
          pricing.customerPays,
          {
            orderId: orderId.toString(),
            phone: from,
            restaurant: user.restaurant,
            cart: JSON.stringify(user.cart)
          }
        );

        // After checkout, we don't clear the cart yet – wait for payment.
        // But we do NOT change session step, so the user can still see cart.
        twiml.message(
          `🧾 ORDER SUMMARY\n\n` +
          `${formatCartUI(user.cart)}\n\n` +
          `🚚 Fee: ₦${pricing.serviceFee}\n` +
          `💰 Total: ₦${pricing.customerPays}\n\n` +
          `💳 Pay here:\n${link}`
        );
      }
    }

    // ========== RESET ==========
    else if (message === "reset") {
      await deleteSession(from);
      twiml.message("🔄 Reset done. Send hi");
    }

    // ========== CART (optional extra command) ==========
    else if (message === "cart") {
      if (!user.cart.length) {
        twiml.message("🛒 Cart is empty");
      } else {
        twiml.message(formatCartUI(user.cart));
      }
    }

    // ========== DEFAULT ==========
    else {
      twiml.message("Send 'hi' to start");
    }

    // Send response
    res.type("text/xml").send(twiml.toString());

  } catch (err) {
    console.error("Webhook error:", err);
    twiml.message("⚠️ Error occurred. Please try again.");
    res.type("text/xml").send(twiml.toString());
  }
});
app.post("/paystack/webhook", async (req, res) => {
      console.log("🔥 PAYSTACK HIT");
  try {
    const event = req.body;

    console.log("EVENT TYPE:", event.event);

    // ✅ ONLY process successful payments
    if (event.event !== "charge.success") {
      return res.sendStatus(200);
    }

    const data = event.data;
    const metadata = data.metadata;

    if (!metadata || !metadata.orderId) {
      console.log("❌ Missing metadata");
      return res.sendStatus(200);
    }

    const orderId = metadata.orderId;

    console.log("ORDER ID:", orderId);

    // =========================
    // GET PENDING ORDER
    // =========================
    const orderRef = db.collection("pendingOrders").doc(orderId);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
      console.log("❌ Order not found in DB");
      return res.sendStatus(200);
    }

    const order = orderSnap.data();

    console.log("✅ ORDER FOUND:", order);

    const restaurant = await getRestaurant(order.restaurant);

    if (!restaurant) {
      console.log("❌ Restaurant not found");
      return res.sendStatus(200);
    }

    console.log("📞 Restaurant phone:", restaurant.phone);

    // =========================
    // CALCULATE TOTAL
    // =========================
    const cartTotal = order.cart.reduce(
      (sum, i) => sum + i.price * i.qty,
      0
    );

    const pricing = calculatePricing(cartTotal);

    // =========================
    // SAVE FINAL ORDER
    // =========================
    await db.collection("orders").add({
      ...order,
      paymentStatus: "paid",
      createdAt: new Date()
    });

    // =========================
    // FORMAT MESSAGE
    // =========================
    let msg = `📦 NEW PAID ORDER\n\n`;

    order.cart.forEach(i => {
      msg += `${i.name} x${i.qty} – ₦${i.price * i.qty}\n`;
    });

    msg += `
━━━━━━━━━━━━━━
💰 Total: ₦${cartTotal}
💸 Earnings: ₦${pricing.restaurantEarnings}
🧾 Commission: ₦${pricing.commission}
Customer: ${order.phone}
`;

    // =========================
    // SEND TO RESTAURANT
    // =========================
    try {
      await client.messages.create({
        from: "whatsapp:+14155238886",
        to: `whatsapp:${restaurant.phone}`, // ⚠️ MUST be +234...
        body: msg,
      });

      console.log("✅ MESSAGE SENT TO RESTAURANT");

    } catch (err) {
      console.log("❌ TWILIO ERROR:", err.message);
    }

    // =========================
    // UPDATE STATUS
    // =========================
    await orderRef.update({ status: "paid" });

    res.sendStatus(200);

  } catch (err) {
    console.log("🔥 WEBHOOK ERROR:", err);
    res.sendStatus(500);
  }
});
// =========================
app.listen(3000, () => console.log("🚀 Server running"));





// require("dotenv").config();
// const express = require("express");
// const twilio = require("twilio");
// const bodyParser = require("body-parser");
// const admin = require("firebase-admin");
// const axios = require("axios");
// const cors = require("cors");
// const { v4: uuidv4 } = require("uuid");

// const app = express();

// app.use(express.urlencoded({ extended: false }));
// app.use(express.json());
// app.use(bodyParser.json());
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
// // 🚚 AREA DISTANCE MATRIX
// // =========================
// const areaDistanceMatrix = {
//   lekki: { lekki: 1, ajah: 2, yaba: 4 },
//   ajah: { lekki: 2, ajah: 1, yaba: 5 },
//   yaba: { lekki: 4, ajah: 5, yaba: 1 }
// };

// // =========================
// // 💰 PRICING
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
// // 🚚 DELIVERY CALCULATION
// // =========================
// function calculateDeliveryFee(restaurantArea, userArea) {
//   const distance =
//     areaDistanceMatrix[restaurantArea]?.[userArea] || 3;

//   const baseFee = 300;

//   return baseFee + distance * 200;
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
// async function getMenu(restaurantId) {
//   const snapshot = await db
//     .collection("menus")
//     .doc(restaurantId)
//     .collection("items")
//     .get();

//   const items = [];
//   snapshot.forEach((doc) =>
//     items.push({ id: doc.id, ...doc.data() })
//   );
//   return items;
// }

// async function getRestaurant(id) {
//   const doc = await db.collection("restaurants").doc(id).get();
//   return doc.exists ? doc.data() : null;
// }

// async function getRestaurantsByLocation(area) {
//   const snapshot = await db
//     .collection("restaurants")
//     .where("address.area", "==", area.toLowerCase())
//     .get();

//   const list = [];
//   snapshot.forEach((doc) =>
//     list.push({ id: doc.id, ...doc.data() })
//   );
//   return list;
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
//     console.log(err.response?.data || err.message);
//     return null;
//   }
// }

// // =========================
// // 🧠 CART UI
// // =========================
// function formatCartUI(cart) {
//   if (!cart.length) return "🛒 Cart empty";

//   let text = "🛒 YOUR CART\n\n";
//   let total = 0;

//   cart.forEach((i) => {
//     const sub = i.price * i.qty;
//     total += sub;
//     text += `${i.name} x${i.qty} – ₦${sub}\n`;
//   });

//   text += `\n💰 Total: ₦${total}`;
//   return text;
// }

// // =========================
// // MULTI INPUT
// // =========================
// function parseMultipleItems(input) {
//   return input
//     .split(",")
//     .map((n) => parseInt(n.trim()))
//     .filter((n) => !isNaN(n));
// }

// // =========================
// // 🍽 MENU
// // =========================
// async function sendMenuText(restaurantId, twiml, res) {
//   const menu = await getMenu(restaurantId);
//   const restaurant = await getRestaurant(restaurantId);

//   if (!menu.length || !restaurant) {
//     twiml.message("❌ Menu not available");
//     return res.type("text/xml").send(twiml.toString());
//   }

//   let text = `🍽 ${restaurant.name}\n\n`;

//   menu.forEach((item, i) => {
//     text += `${i + 1}. ${item.name} – ₦${item.price}\n`;
//   });

//   text += "\nReply: 1,2,3";

//   twiml.message(text);
//   res.type("text/xml").send(twiml.toString());
// }

// // =========================
// // 📲 WHATSAPP WEBHOOK
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
//     // START
//     if (message.startsWith("hi")) {
//       user.step = "location";
//       return twiml.message("📍 Enter your area (Lekki, Ajah)");
//     }

//     // LOCATION
//     else if (user.step === "location") {
//       const list = await getRestaurantsByLocation(message);

//       if (!list.length) {
//         return twiml.message("❌ No restaurants found");
//       }

//       user.available = list;
//       user.step = "choose";

//       let text = "🍽 Restaurants:\n";
//       list.forEach((r, i) => {
//         text += `${i + 1}. ${r.name}\n`;
//       });

//       return twiml.message(text);
//     }

//     // CHOOSE RESTAURANT
//     else if (user.step === "choose") {
//       const selected = user.available[Number(message) - 1];

//       if (!selected) return twiml.message("❌ Invalid");

//       user.restaurant = selected.id;
//       user.cart = [];

//       return await sendMenuText(selected.id, twiml, res);
//     }

//     // ADD ITEMS
//     else if (/^[\d,\s]+$/.test(message)) {
//       const menu = await getMenu(user.restaurant);
//       const numbers = parseMultipleItems(message);

//       numbers.forEach((num) => {
//         const item = menu[num - 1];
//         if (!item) return;

//         const existing = user.cart.find(i => i.id === item.id);
//         if (existing) existing.qty++;
//         else user.cart.push({ ...item, qty: 1 });
//       });

//       return twiml.message(formatCartUI(user.cart));
//     }

//     // CHECKOUT → ASK LOCATION
//     else if (message === "checkout") {
//       user.step = "delivery_area";
//       return twiml.message("📍 Enter delivery area (Lekki, Ajah)");
//     }

//     // DELIVERY AREA
//     else if (user.step === "delivery_area") {
//       user.deliveryArea = message;
//       user.step = "delivery_address";

//       return twiml.message("🏠 Enter full address");
//     }

//     // FINAL STEP → CREATE ORDER
//     else if (user.step === "delivery_address") {
//       user.deliveryAddress = message;

//       let cartTotal = 0;
//       user.cart.forEach(i => cartTotal += i.price * i.qty);

//       const pricing = calculatePricing(cartTotal);
//       const restaurant = await getRestaurant(user.restaurant);

//       const deliveryFee = calculateDeliveryFee(
//         restaurant.address.area,
//         user.deliveryArea
//       );

//       const finalTotal = pricing.customerPays + deliveryFee;

//       const orderId = uuidv4();

//       await db.collection("pendingOrders").doc(orderId).set({
//         ...user,
//         cartTotal,
//         deliveryFee,
//         finalTotal,
//         status: "pending_payment",
//         createdAt: new Date()
//       });

//       const link = await createPaymentLink(
//         "user@email.com",
//         finalTotal,
//         { orderId }
//       );

//       return twiml.message(
//         `${formatCartUI(user.cart)}\n\n🚚 Delivery: ₦${deliveryFee}\n💰 Total: ₦${finalTotal}\n\nPay:\n${link}`
//       );
//     }

//     else {
//       twiml.message("Send hi");
//     }

//     res.type("text/xml").send(twiml.toString());

//   } catch (err) {
//     console.log(err);
//     twiml.message("⚠️ Error");
//     res.type("text/xml").send(twiml.toString());
//   }
// });

// // =========================
// // 💳 PAYSTACK WEBHOOK
// // =========================
// app.post("/paystack/webhook", async (req, res) => {
//   try {
//     const event = req.body;

//     if (event.event !== "charge.success") {
//       return res.sendStatus(200);
//     }

//     const metadata = event.data.metadata;
//     const orderId = metadata.orderId;

//     const orderRef = db.collection("pendingOrders").doc(orderId);
//     const snap = await orderRef.get();

//     if (!snap.exists) return res.sendStatus(200);

//     const order = snap.data();
//     const restaurant = await getRestaurant(order.restaurant);

//     // SEND TO RESTAURANT
//     let msg = `📦 NEW ORDER\n\n`;

//     order.cart.forEach(i => {
//       msg += `${i.name} x${i.qty}\n`;
//     });

//     msg += `
// 📍 ${order.deliveryArea}
// 🏠 ${order.deliveryAddress}
// 💰 ₦${order.finalTotal}
// `;

//     await notifyRestaurant(restaurant.phone, msg);

//     await orderRef.update({ status: "paid" });

//     res.sendStatus(200);

//   } catch (err) {
//     console.log(err);
//     res.sendStatus(500);
//   }
// });

// // =========================
// app.listen(3000, () => console.log("🚀 Running"));