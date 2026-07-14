const workouts = require("./workouts");
const { appendSet, getLastRows } = require("./sheets");
const { computeWeekLabel } = require("./utils");

// Estado de conversa por número de telefone (em memória)
const sessions = new Map();

function getSession(phone) {
  if (!sessions.has(phone)) {
    sessions.set(phone, { state: "IDLE", training: null, exerciseIndex: null });
  }
  return sessions.get(phone);
}

function resetSession(phone) {
  sessions.set(phone, { state: "IDLE", training: null, exerciseIndex: null });
}

const HELP_TEXT =
  "🤖 *Comandos disponíveis*\n" +
  "- *menu* ou *treino*: escolher o treino do dia\n" +
  "- *resumo*: ver últimas séries registradas nesta semana\n" +
  "- *proximo*: ir para o próximo exercício\n" +
  "- *voltar*: voltar para a lista de exercícios\n" +
  "- *fim*: encerrar o registro do treino\n" +
  "- *ajuda*: ver esta mensagem\n\n" +
  "Para registrar uma série, envie:\n" +
  "`<tipo> <reps> <carga> <falhou?>`\n" +
  "tipo = warmup / feeder / topset\n" +
  "Exemplo: `topset 8 40kg nao`";

function trainingMenuText() {
  let text = "💪 Escolha o treino de hoje:\n\n";
  for (const key of Object.keys(workouts)) {
    text += `*${key}* - ${workouts[key].nome}\n`;
  }
  text += "\nResponda com a letra do treino (ex: A). Digite *ajuda* a qualquer momento para ver os comandos.";
  return text;
}

function exerciseListText(trainingKey) {
  const t = workouts[trainingKey];
  let text = `📋 *${t.nome}*\n\n`;
  t.exercicios.forEach((ex, i) => {
    const obs = ex.obs ? ` _(${ex.obs})_` : "";
    text += `${i + 1}. ${ex.nome} — ${ex.alvo}${obs}\n`;
  });
  text += "\nEnvie o número do exercício para começar a registrar as séries.";
  return text;
}

function parseSetMessage(text) {
  // formato esperado: <tipo> <reps> <carga> <falhou?>
  const parts = text.trim().toLowerCase().split(/\s+/);
  if (parts.length < 3) return null;

  const tipoMap = {
    warmup: "Warm-up",
    aquecimento: "Warm-up",
    wu: "Warm-up",
    feeder: "Feeder",
    fd: "Feeder",
    topset: "Top-set",
    "top-set": "Top-set",
    top: "Top-set",
    ts: "Top-set",
  };
  const tipo = tipoMap[parts[0]];
  if (!tipo) return null;

  const reps = parseInt(parts[1], 10);
  if (isNaN(reps)) return null;

  const carga = parts[2];

  let falhou = "Não informado";
  if (parts[3]) {
    if (["sim", "s", "yes", "falhei"].includes(parts[3])) falhou = "Sim";
    else if (["nao", "não", "n", "no"].includes(parts[3])) falhou = "Não";
  }

  return { tipo, reps, carga, falhou };
}

async function handleMessage(phone, rawText) {
  const text = (rawText || "").trim();
  const lower = text.toLowerCase();
  const session = getSession(phone);
  const startDate = process.env.PROGRAM_START_DATE;
  const weekLabel = computeWeekLabel(startDate);

  // Comandos globais, funcionam em qualquer estado
  if (["ajuda", "help"].includes(lower)) {
    return HELP_TEXT;
  }
  if (["menu", "treino", "oi", "ola", "olá", "start"].includes(lower)) {
    resetSession(phone);
    return trainingMenuText();
  }
  if (lower === "resumo") {
    const rows = await getLastRows(weekLabel, 5);
    if (rows.length === 0) return `Nenhuma série registrada ainda na ${weekLabel}.`;
    let out = `📊 Últimas séries — ${weekLabel}:\n\n`;
    rows.forEach((r) => {
      out += `${r[3]} | ${r[4]} | ${r[5]} reps | ${r[6]} | Falhou: ${r[7]}\n`;
    });
    return out;
  }
  if (lower === "voltar") {
    if (session.training) {
      session.state = "EXERCISE_LIST";
      session.exerciseIndex = null;
      return exerciseListText(session.training);
    }
    resetSession(phone);
    return trainingMenuText();
  }
  if (lower === "fim") {
    resetSession(phone);
    return "✅ Treino encerrado. Envie *menu* quando quiser registrar outro treino.";
  }

  switch (session.state) {
    case "IDLE": {
      const key = text.toUpperCase();
      if (workouts[key]) {
        session.state = "EXERCISE_LIST";
        session.training = key;
        return exerciseListText(key);
      }
      return "Não entendi 🤔. Envie *menu* para ver as opções de treino ou *ajuda* para ver os comandos.";
    }

    case "EXERCISE_LIST": {
      const num = parseInt(text, 10);
      const t = workouts[session.training];
      if (!isNaN(num) && num >= 1 && num <= t.exercicios.length) {
        session.state = "LOGGING_SET";
        session.exerciseIndex = num - 1;
        const ex = t.exercicios[num - 1];
        return (
          `✏️ Registrando: *${ex.nome}* (${ex.alvo})\n\n` +
          "Envie os dados da série no formato:\n" +
          "`<tipo> <reps> <carga> <falhou?>`\n" +
          "tipo = warmup / feeder / topset\n" +
          "Exemplo: `topset 8 40kg nao`"
        );
      }
      return "Envie o número de um exercício válido, ou *voltar* / *menu*.";
    }

    case "LOGGING_SET": {
      if (lower === "proximo" || lower === "próximo") {
        session.state = "EXERCISE_LIST";
        session.exerciseIndex = null;
        return exerciseListText(session.training);
      }

      const parsed = parseSetMessage(text);
      if (!parsed) {
        return (
          "Não entendi o formato 😕. Envie assim:\n" +
          "`<tipo> <reps> <carga> <falhou?>`\n" +
          "Exemplo: `topset 8 40kg nao`\n\n" +
          "Ou envie *proximo*, *voltar* ou *fim*."
        );
      }

      const t = workouts[session.training];
      const ex = t.exercicios[session.exerciseIndex];
      const now = new Date();
      const dataStr = now.toLocaleDateString("pt-BR");
      const horaStr = now.toLocaleTimeString("pt-BR");

      await appendSet(weekLabel, [
        dataStr,
        horaStr,
        t.nome,
        ex.nome,
        parsed.tipo,
        parsed.reps,
        parsed.carga,
        parsed.falhou,
      ]);

      return (
        `✅ Registrado: *${ex.nome}*\n` +
        `${parsed.tipo} | ${parsed.reps} reps | ${parsed.carga} | Falhou: ${parsed.falhou}\n\n` +
        "Pode enviar a próxima série, ou *proximo* para o próximo exercício, ou *fim* para encerrar."
      );
    }

    default:
      resetSession(phone);
      return trainingMenuText();
  }
}

module.exports = { handleMessage };
