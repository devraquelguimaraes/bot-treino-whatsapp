const axios = require("axios");

const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

function apiUrl() {
  return `https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`;
}

async function sendText(to, body) {
  try {
    await axios.post(
      apiUrl(),
      {
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body },
      },
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    console.error("Erro ao enviar mensagem:", err.response ? err.response.data : err.message);
  }
}

module.exports = { sendText };
