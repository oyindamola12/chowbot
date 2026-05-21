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
  res.type("text/xml").send(twiml.toString());
}

// =========================
// WEBHOOK
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

    // START
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

    // LOCATION
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

    // CHOOSE RESTAURANT
    else if (user.step === "choose") {
      const index = Number(message) - 1;
      const selected = user.available[index];

      if (!selected) return twiml.message("❌ Invalid choice");

      user.restaurant = selected.id;
      user.cart = [];

      await sendMenuText(selected.id, twiml, res);
      return;
    }

    // ADD ITEMS
    else if (/^[\d,\s]+$/.test(message)) {
      if (!user.restaurant) {
        return twiml.message("⚠️ Type hi first");
      }

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

      twiml.message(
        `✅ Added:\n• ${added.join("\n• ")}\n\n` +
        formatCartUI(user.cart)
      );
    }

    // REMOVE
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
      }
    }

    // CHECKOUT (FIXED ORDER DELIVERY)
//     else if (message === "checkout") {
//       if (!user.cart.length) {
//         return twiml.message("🛒 Cart empty");
//       }

//       let cartTotal = 0;

//       user.cart.forEach((i) => {
//         cartTotal += i.price * i.qty;
//       });

//       const pricing = calculatePricing(cartTotal);

//       const link = await createPaymentLink(
//         "user@email.com",
//         pricing.customerPays,
//         {
//           phone: from,
//           restaurant: user.restaurant,
//           cart: JSON.stringify(user.cart),
//           cartTotal,
//         }
//       );

//       // ✅ FIX: ALWAYS SEND ORDER TO RESTAURANT HERE (NO FLOW CHANGE)
//       const restaurant = await getRestaurant(user.restaurant);

//       if (restaurant?.phone) {
//         let orderMsg = `📦 NEW ORDER\n\n`;

//         user.cart.forEach((i) => {
//           orderMsg += `${i.name} x${i.qty} – ₦${i.price * i.qty}\n`;
//         });

//         orderMsg += `
// ━━━━━━━━━━━━━━
// 💰 Total: ₦${cartTotal}
// 🚚 Fee: ₦${pricing.serviceFee}
// 🧾 Commission: ₦${pricing.commission}
// `;

//         await notifyRestaurant(restaurant.phone, orderMsg);
//       }

//       twiml.message(
//         `🧾 ORDER\n\n${formatCartUI(user.cart)}\n\n💳 Pay:\n${link}`
//       );
//     }

else if (message === "checkout") {
  if (!user.cart.length) {
    return twiml.message("🛒 Cart empty");
  }

  let cartTotal = 0;

  user.cart.forEach((i) => {
    cartTotal += i.price * i.qty;
  });

  const pricing = calculatePricing(cartTotal);

  // create pending order ID
  const orderId = uuidv4();

  // store pending order in Firebase (IMPORTANT FIX)
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

  twiml.message(
    `🧾 ORDER SUMMARY\n\n` +
      `${formatCartUI(user.cart)}\n\n` +
      `🚚 Fee: ₦${pricing.serviceFee}\n` +
      `💰 Total: ₦${pricing.customerPays}\n\n` +
      `💳 Pay here:\n${link}`
  );
}
    // RESET
    else if (message === "reset") {
      sessions[from] = {};
      twiml.message("🔄 Reset done. Send hi");
    }

    // DEFAULT
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
// // 📍 DISTANCE
// // =========================
// function getDistanceKm(lat1, lon1, lat2, lon2) {
//   const R = 6371;
//   const dLat = (lat2 - lat1) * Math.PI / 180;
//   const dLon = (lon2 - lon1) * Math.PI / 180;

//   const a =
//     Math.sin(dLat / 2) ** 2 +
//     Math.cos(lat1 * Math.PI / 180) *
//     Math.cos(lat2 * Math.PI / 180) *
//     Math.sin(dLon / 2) ** 2;

//   return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
// }

// // =========================
// // 🚚 DELIVERY
// // =========================
// function calculateDeliveryFee(distanceKm) {
//   const base = 500;
//   const perKm = 150;

//   if (distanceKm <= 2) return base;
//   return base + (distanceKm - 2) * perKm;
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

//   return snapshot.docs.map(doc => ({
//     id: doc.id,
//     ...doc.data()
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

//   return snapshot.docs.map(doc => ({
//     id: doc.id,
//     ...doc.data()
//   }));
// }

// async function notifyRestaurant(phone, message) {
//   await client.messages.create({
//     from: "whatsapp:+14155238886",
//     to: `whatsapp:${phone}`,
//     body: message,
//   });
// }

// async function createPaymentLink(email, amount, metadata) {
//   const res = await axios.post(
//     "https://api.paystack.co/transaction/initialize",
//     {
//       email,
//       amount: amount * 100,
//       metadata,
//     },
//     {
//       headers: {
//         Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
//       },
//     }
//   );

//   return res.data.data.authorization_url;
// }

// // =========================
// // 📍 GEOCODE
// // =========================
// async function geocodeAddress(address) {
//   try {
//     const res = await axios.get(
//       "https://maps.googleapis.com/maps/api/geocode/json",
//       {
//         params: {
//           address,
//           key: process.env.GOOGLE_MAPS_KEY,
//         },
//       }
//     );

//     const loc = res.data.results[0].geometry.location;
//     return { lat: loc.lat, lng: loc.lng };

//   } catch (err) {
//     console.log("Geocode error", err.message);
//     return null;
//   }
// }

// // =========================
// // 🧠 CART UI
// // =========================
// function formatCartUI(cart) {
//   if (!cart.length) return "🛒 Cart is empty";

//   let total = 0;
//   let text = "🛒 CART\n\n";

//   cart.forEach(i => {
//     total += i.price * i.qty;
//     text += `${i.name} x${i.qty} – ₦${i.price * i.qty}\n`;
//   });

//   text += `\n💰 Total: ₦${total}`;
//   return text;
// }

// // =========================
// // WEBHOOK
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
//       userLocation: null,
//       deliveryFee: 0
//     };
//   }

//   const user = sessions[from];

//   try {

//     // START
//     if (message === "hi") {
//       user.step = "location";
//       return twiml.message("📍 Enter your area (Lekki, Yaba)");
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

//     // CHOOSE
//     else if (user.step === "choose") {
//       const selected = user.available[Number(message) - 1];

//       if (!selected) return twiml.message("❌ Invalid");

//       user.restaurant = selected.id;
//       user.step = "menu";

//       const menu = await getMenu(selected.id);

//       let text = "📋 Menu:\n";
//       menu.forEach((i, index) => {
//         text += `${index + 1}. ${i.name} – ₦${i.price}\n`;
//       });

//       user.menu = menu;

//       return twiml.message(text);
//     }

//     // ADD ITEMS
//     else if (user.step === "menu") {
//       const item = user.menu[Number(message) - 1];

//       if (!item) return twiml.message("❌ Invalid");

//       const existing = user.cart.find(i => i.id === item.id);

//       if (existing) existing.qty++;
//       else user.cart.push({ ...item, qty: 1 });

//       return twiml.message(
//         `✅ Added ${item.name}\n\n${formatCartUI(user.cart)}\n\nType checkout`
//       );
//     }

//     // CHECKOUT → ASK LOCATION
//     else if (message === "checkout") {
//       user.step = "address";
//       return twiml.message("📍 Enter delivery address");
//     }

//     // ADDRESS → CALCULATE DELIVERY
//     else if (user.step === "address") {
//       const coords = await geocodeAddress(message);

//       if (!coords) return twiml.message("❌ Invalid address");

//       const restaurant = await getRestaurant(user.restaurant);

//       const distance = getDistanceKm(
//         coords.lat,
//         coords.lng,
//         restaurant.lat,
//         restaurant.lng
//       );

//       const fee = Math.round(calculateDeliveryFee(distance));

//       user.deliveryFee = fee;
//       user.step = "confirm";

//       return twiml.message(
//         `🚚 Delivery Fee: ₦${fee}\nType confirm`
//       );
//     }

//     // FINAL CHECKOUT
//     else if (message === "confirm") {
//       let total = 0;

//       user.cart.forEach(i => {
//         total += i.price * i.qty;
//       });

//       const pricing = calculatePricing(total);
//       const final = pricing.customerPays + user.deliveryFee;

//       const orderId = uuidv4();

//       await db.collection("pendingOrders").doc(orderId).set({
//         ...user,
//         total,
//         deliveryFee: user.deliveryFee,
//         final,
//         status: "pending"
//       });

//       const link = await createPaymentLink(
//         "user@email.com",
//         final,
//         { orderId }
//       );

//       return twiml.message(`💳 Pay: ${link}`);
//     }

//     else {
//       return twiml.message("Send hi");
//     }

//   } catch (err) {
//     console.log(err);
//     twiml.message("⚠️ Error");
//   }

//   res.type("text/xml").send(twiml.toString());
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

//     const orderId = event.data.metadata.orderId;

//     const ref = db.collection("pendingOrders").doc(orderId);
//     const snap = await ref.get();

//     if (!snap.exists) return res.sendStatus(200);

//     const order = snap.data();

//     const restaurant = await getRestaurant(order.restaurant);

//     let msg = `📦 NEW ORDER\n\n`;

//     order.cart.forEach(i => {
//       msg += `${i.name} x${i.qty}\n`;
//     });

//     msg += `\nTotal: ₦${order.final}`;

//     await notifyRestaurant(restaurant.phone, msg);

//     await ref.update({ status: "paid" });

//     res.sendStatus(200);

//   } catch (err) {
//     console.log(err);
//     res.sendStatus(500);
//   }
// });

// // =========================
// app.listen(3000, () => console.log("🚀 Running"));