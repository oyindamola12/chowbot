require("dotenv").config();
const express = require("express");
const twilio = require("twilio");
const { getSession, resetSession } = require("./sessions");
const { getMenu } = require("./menus");
const { createPaymentLink } = require("./paystack");

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

app.post("/webhook", async (req, res) => {
  const twiml = new twilio.twiml.MessagingResponse();

  const from = req.body.From;
  const message = req.body.Body?.trim().toLowerCase() || "";

  const user = getSession(from);

  console.log("Incoming:", message);

  // ===== ENTRY (QR LINK) =====
  if (message.startsWith("menu_")) {
    const code = message.split("_")[1];
    const menu = getMenu(code);

    if (!menu) {
      twiml.message("Restaurant not found");
    } else {
      user.restaurant = code;
      user.step = "menu";

      let text = "🍽 Menu\n\n";
      menu.forEach(item => {
        text += `${item.id}️⃣ ${item.name} – ₦${item.price}\n`;
      });
      text += "\nReply with item number";

      twiml.message(text);
    }
  }

  // ===== MENU SELECTION =====
  else if (user.step === "menu") {
    const menu = getMenu(user.restaurant);
    const item = menu.find(i => i.id == message);

    if (item) {
      user.cart.push(item);
      twiml.message(`Added ${item.name} ✅\nType more or 'checkout'`);
    } else if (message === "checkout") {
      let total = user.cart.reduce((sum, i) => sum + i.price, 0);
      total += 200; // your fee

      user.total = total;

      let summary = "🧾 Order\n\n";
      user.cart.forEach(i => {
        summary += `${i.name} – ₦${i.price}\n`;
      });

      summary += `\nFee: ₦200\nTotal: ₦${total}`;
      summary += `\n\nReply PAY to continue`;

      twiml.message(summary);
      user.step = "checkout";
    } else {
      twiml.message("Invalid option");
    }
  }

  // ===== PAYMENT =====
  else if (user.step === "checkout") {
    if (message === "pay") {
      const link = await createPaymentLink(user.total, from);

      twiml.message(`💳 Pay here:\n${link}`);
      user.step = "paid";
    } else {
      twiml.message("Type PAY to proceed");
    }
  }

  // ===== AFTER PAYMENT (SIMPLIFIED) =====
  else if (user.step === "paid") {
    twiml.message("✅ Order received! Restaurant will prepare your food.");

    // 🔥 SEND TO RESTAURANT (hardcoded for now)
    await client.messages.create({
      from: process.env.TWILIO_WHATSAPP,
      to: "whatsapp:+2349078757814",
      body: `NEW ORDER\n\n${JSON.stringify(user.cart)}`
    });

    resetSession(from);
  }

  else {
    twiml.message("Send QR or type menu_mamaput to start");
  }

  res.type("text/xml");
  res.send(twiml.toString());
});

app.get("/", (req, res) => {
  res.send("Bot running 🚀");
});

app.listen(process.env.PORT, () =>
  console.log(`Server running on ${process.env.PORT}`)
);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));