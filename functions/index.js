import { onRequest } from "firebase-functions/v2/https";

/**
 * ENV VARIABLES
 * Set these using:
 * firebase functions:config:set
 * OR Google Secret Manager
 */
const ACCESS_TOKEN = process.env.META_WA_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.META_WA_PHONE_NUMBER_ID;
const VERIFY_TOKEN = process.env.META_WA_VERIFY_TOKEN;

export const webhook = onRequest(async (req, res) => {
  try {
    // =========================
    // WEBHOOK VERIFICATION
    // =========================
    if (req.method === "GET") {
      const mode = req.query["hub.mode"];
      const token = req.query["hub.verify_token"];
      const challenge = req.query["hub.challenge"];

      if (mode === "subscribe" && token === VERIFY_TOKEN) {
        console.log("✅ Webhook verified");
        return res.status(200).send(challenge);
      }

      return res.sendStatus(403);
    }

    // =========================
    // INCOMING MESSAGES
    // =========================
    if (req.method === "POST") {
      console.log("📩 FULL PAYLOAD:", JSON.stringify(req.body, null, 2));

      const entry = req.body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const message = value?.messages?.[0];

      if (!message) {
        console.log("ℹ️ No message found");
        return res.sendStatus(200);
      }

      const from = message.from;
      const text = message.text?.body;

      console.log("👤 From:", from);
      console.log("💬 Message:", text);

      if (text) {
        await sendMessage(from, `You said: ${text}`);
      }

      return res.sendStatus(200);
    }

    res.sendStatus(405);
  } catch (error) {
    console.error("❌ ERROR:", error);
    res.sendStatus(500);
  }
});

// =========================
// SEND MESSAGE FUNCTION
// =========================
async function sendMessage(to, text) {
  const url = `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: text },
    }),
  });

  const data = await response.json();
  console.log("📤 Send response:", data);
}
