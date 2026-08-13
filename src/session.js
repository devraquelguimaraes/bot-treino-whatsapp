const { workouts, agenda, diasSemana, diasSemanaDisplay, periodizacaoText } = require("./workouts");
const { appendSet, getLastRows } = require("./sheets");
const { computeWeekLabel } = require("./utils");

const NOME_USUARIA = "Raquel";

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
  "- *fim*: encerrar o registro do treino (vou perguntar sobre o cardio antes)\n" +
  "- *ajuda*: ver esta mensagem\n\n" +
  "Para registrar uma série, envie:\n" +
  "`<tipo> <reps> <carga> <falhou?>`\n" +
  "tipo = warmup / feeder / topset / muscleround\n" +
  "Exemplo: `topset 8 40kg nao`";

function diaDeHoje() {
  const idx = new Date().getDay();
  return diasSemana[idx];
}

function greetingText() {
  const diaKey = diaDeHoje();
  const diaDisplay = diasSemanaDisplay[diaKey];
  const trainingKey = agenda[diaKey];

  let intro = `Olá, ${NOME_USUARIA}! Eu sou o Friday, seu assistente de treino. Hoje é ${diaDisplay}.`;
  if (trainingKey) {
    intro += ` Você fará o ${workouts[trainingKey].nome}? Ou prefere outro treino?`;
  } else {
    intro += " Hoje é dia de descanso na sua programação. Quer registrar algum treino mesmo assim?";
  }

  let text = intro + "\n\n";
  for (const key of Object.keys(workouts)) {
    text += `*${key}* - ${workouts[key].nome}\n`;
  }
  text += "\nResponda com a letra do treino (ex: A). Digite *ajuda* a qualquer momento para ver os comandos.";
  return text;
}

function exerciseListText(trainingKey) {
  const t = workouts[trainingKey];
  let text = `📋 *${t.nome}* — _${t.tipo}_\n${periodizacaoText(trainingKey)}\n\n`;
  t.exercicios.forEach((ex, i) => {
    const obs = ex.obs ? ` _(${ex.obs})_` : "";
    text += `${i + 1}. ${ex.nome} — ${ex.reps} reps${obs}\n`;
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
    muscleround: "Muscle Round",
    "muscle-round": "Muscle Round",
    mr: "Muscle Round",
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

function parseCardioMessage(text) {
  // formato esperado: <modalidade> <tempo>min  (ex: "esteira 40min", "bike 30 min")
  const match = text.trim().match(/^(.*?)(\d+)\s*min(uto)?s?$/i);
  if (!match) return null;
  const modalidade = match[1].trim();
  if (!modalidade) return null;
  const minutos = match[2];
  return {
    modalidade: modalidade.charAt(0).toUpperCase() + modalidade.slice(1),
    tempo: `${minutos} min`,
  };
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
    return greetingText();
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
    return greetingText();
  }
  if (lower === "fim") {
    // Se estava no meio de um treino (e ainda não perguntamos sobre cardio), pergunta antes de encerrar
    if (session.training && session.state !== "CARDIO_ASK" && session.state !== "CARDIO_DETAILS") {
      session.state = "CARDIO_ASK";
      return "Antes de encerrar: você fez cardio hoje? (sim/nao)";
    }
    resetSession(phone);
    return "✅ Treino encerrado. Envie *menu* quando quiser começar outro treino.";
  }

  switch (session.state) {
    case "IDLE": {
      const key = text.toUpperCase();
      if (workouts[key]) {
        session.state = "EXERCISE_LIST";
        session.training = key;
        return exerciseListText(key);
      }
      // Qualquer mensagem não reconhecida no início da conversa vira uma saudação,
      // em vez de um "não entendi" seco.
      return greetingText();
    }

    case "EXERCISE_LIST": {
      const num = parseInt(text, 10);
      const t = workouts[session.training];
      if (!isNaN(num) && num >= 1 && num <= t.exercicios.length) {
        session.state = "LOGGING_SET";
        session.exerciseIndex = num - 1;
        const ex = t.exercicios[num - 1];
        return (
          `✏️ Registrando: *${ex.nome}* (${ex.reps} reps)\n\n` +
          "Envie os dados da série no formato:\n" +
          "`<tipo> <reps> <carga> <falhou?>`\n" +
          "tipo = warmup / feeder / topset / muscleround\n" +
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

    case "CARDIO_ASK": {
      if (["sim", "s"].includes(lower)) {
        session.state = "CARDIO_DETAILS";
        return "Legal! Me conta a modalidade e o tempo, no formato:\n`<modalidade> <tempo>min`\nExemplo: `esteira 40min` ou `bike 30min`";
      }
      if (["nao", "não", "n"].includes(lower)) {
        resetSession(phone);
        return "✅ Treino encerrado. Envie *menu* quando quiser começar outro treino.";
      }
      return "Não entendi 🤔. Você fez cardio hoje? Responda *sim* ou *nao*.";
    }

    case "CARDIO_DETAILS": {
      const parsedCardio = parseCardioMessage(text);
      if (!parsedCardio) {
        return "Não entendi o formato 😕. Envie assim: `esteira 40min` (modalidade + tempo em minutos).";
      }

      const t = workouts[session.training];
      const now = new Date();
      const dataStr = now.toLocaleDateString("pt-BR");
      const horaStr = now.toLocaleTimeString("pt-BR");

      await appendSet(weekLabel, [
        dataStr,
        horaStr,
        t.nome,
        "Cardio",
        parsedCardio.modalidade,
        "-",
        parsedCardio.tempo,
        "-",
      ]);

      resetSession(phone);
      return (
        `✅ Cardio registrado: ${parsedCardio.modalidade} — ${parsedCardio.tempo}\n\n` +
        "Treino encerrado. Envie *menu* quando quiser começar outro treino."
      );
    }

    default:
      resetSession(phone);
      return greetingText();
  }
}

module.exports = { handleMessage };
