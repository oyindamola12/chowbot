const admin = require("firebase-admin");

const db = admin.firestore();
const SESSION_COLLECTION = "sessions";
const SESSION_TTL_SECONDS = 86400; // 24 hours

async function getSession(phone) {
  const docRef = db.collection("sessions").doc(phone);
  const doc = await docRef.get();
  if (!doc.exists) {
    return { cart: [], restaurant: null, step: "start", available: [] };
  }
  const data = doc.data();
  // Return a clean object with only the fields we need
  return {
    cart: data.cart || [],
    restaurant: data.restaurant || null,
    step: data.step || "start",
    available: data.available || [],
  };
}

async function saveSession(phone, session) {
  const docRef = db.collection(SESSION_COLLECTION).doc(phone);
  
  // Add metadata
  const toSave = {
    ...session,
    phone,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    expireAt: new Date(Date.now() + SESSION_TTL_SECONDS * 1000),
  };
  
  await docRef.set(toSave, { merge: true });
}

async function deleteSession(phone) {
  await db.collection(SESSION_COLLECTION).doc(phone).delete();
}

module.exports = { getSession, saveSession, deleteSession };