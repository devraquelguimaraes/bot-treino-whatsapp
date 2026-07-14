require("dotenv").config();
const express = require("express");
const { sendText } = require("./whatsapp");
const { handleMessage } = require("./session");

const app = express();
app.use(express.json());

const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;

app.get("/", (req, res) => {
  res.send("Bot de treino no ar ✅");
});

// Verificação do webhook exigida pela Meta ao configurar o app
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

// Recebimento de mensagens do WhatsApp
app.post("/webhook", async (req, res) => {
  res.sendStatus(200); // responde rápido para a Meta não reenviar o evento

  try {
    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const message = value?.messages?.[0];

    if (!message || message.type !== "text") return;

    const from = message.from;
    const text = message.text.body;

    const reply = await handleMessage(from, text);
    if (reply) await sendText(from, reply);
  } catch (err) {
    console.error("Erro ao processar webhook:", err);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
