const axios = require("axios");

async function createPaymentLink(amount, phone) {
  const response = await axios.post(
    "https://api.paystack.co/transaction/initialize",
    {
      email: `${phone}@mail.com`,
      amount: amount * 100,
      callback_url: "https://yourapp.onrender.com/payment-success"
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
        "Content-Type": "application/json"
      }
    }
  );

  return response.data.data.authorization_url;
}

module.exports = { createPaymentLink };