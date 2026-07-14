// Estrutura extraída do protocolo "Raquel Todescatto (8 semanas)"
// Cada exercício segue: 1 série de 15 (aquecimento) + 2 séries (feeder + top-set)

const workouts = {
  A: {
    nome: "Treino A - LOWER 1",
    exercicios: [
      { nome: "Cadeira Abdutora", alvo: "1x15 + 2x5-9", obs: "Back Off Set" },
      { nome: "Front Squat", alvo: "1x15 + 2x5-9", obs: "" },
      { nome: "Bulgaro H", alvo: "1x15 + 2x5-9", obs: "" },
      { nome: "Leg Press 45°", alvo: "1x15 + 2x5-9", obs: "Back Off Set" },
      { nome: "Flexora Vertical", alvo: "1x15 + 2x5-9", obs: "" },
      { nome: "Elevação Pélvica uni H", alvo: "1x15 + 2x10-15", obs: "" },
      { nome: "Abdução cabo por trás", alvo: "1x15 + 2x10-15", obs: "Back Off Set" },
    ],
  },
  B: {
    nome: "Treino B - UPPER 1",
    exercicios: [
      { nome: "Remada Baixa triângulo", alvo: "1x15 + 2x5-9", obs: "" },
      { nome: "Remada Articulada neutra bilateral", alvo: "1x15 + 2x5-9", obs: "Back Off Set" },
      { nome: "Puxada Alta supinada", alvo: "1x15 + 2x5-9", obs: "Back Off Set" },
      { nome: "Desenvolvimento H", alvo: "1x15 + 2x5-9", obs: "" },
      { nome: "Elevação Lateral H", alvo: "1x15 + 2x10-15", obs: "Back Off Set" },
      { nome: "Elevação Frontal H c/ rotação bilateral", alvo: "1x15 + 2x10-15", obs: "Back Off Set" },
      { nome: "Triceps Francês Máquina", alvo: "1x15 + 2x5-9", obs: "" },
    ],
  },
  C: {
    nome: "Treino C - LOWER 2",
    exercicios: [
      { nome: "Cadeira Abdutora c/ flex. de quadril", alvo: "1x15 + 2x5-9", obs: "Back Off Set" },
      { nome: "Deadlift Sumo", alvo: "1x15 + 2x5-9", obs: "" },
      { nome: "Cadeira Flexora", alvo: "1x15 + 2x5-9", obs: "Back Off Set" },
      { nome: "Hack Linear", alvo: "1x15 + 2x5-9", obs: "" },
      { nome: "Elevação Pélvica Máquina", alvo: "1x15 + 2x5-9", obs: "Back Off Set" },
      { nome: "Abdução cabo frente", alvo: "1x15 + 2x10-15", obs: "" },
      { nome: "Sóleo banco", alvo: "1x15 + 2x5-9", obs: "" },
    ],
  },
  D: {
    nome: "Treino D - UPPER 2",
    exercicios: [
      { nome: "Remada Baixa aberta", alvo: "1x15 + 2x5-9", obs: "" },
      { nome: "Puxada Alta triângulo", alvo: "1x15 + 2x5-9", obs: "Back Off Set" },
      { nome: "Pulldown Corda", alvo: "1x15 + 2x10-15", obs: "Back Off Set" },
      { nome: "Shoulder Press", alvo: "1x15 + 2x5-9", obs: "" },
      { nome: "Elevação Lateral polia média", alvo: "1x15 + 2x10-15", obs: "" },
      { nome: "Elevação Frontal corda", alvo: "1x15 + 2x10-15", obs: "Back Off Set" },
      { nome: "Triceps Testa Máquina", alvo: "1x15 + 2x5-9", obs: "" },
    ],
  },
  E: {
    nome: "Treino E - LOWER 3",
    exercicios: [
      { nome: "Cadeira Abdutora 45°", alvo: "1x15 + 2x5-9", obs: "Back Off Set" },
      { nome: "Cadeira Adutora", alvo: "1x15 + 2x5-9", obs: "Back Off Set" },
      { nome: "Deep Squat Smith", alvo: "1x15 + 2x5-9", obs: "" },
      { nome: "Leg Press horizontal uni", alvo: "1x15 + 2x5-9", obs: "" },
      { nome: "Pendulum Squat", alvo: "1x15 + 2x10-15", obs: "" },
      { nome: "Mesa Flexora", alvo: "1x15 + 2x5-9", obs: "Back Off Set" },
      { nome: "Cadeira Extensora", alvo: "1x15 + 2x5-9", obs: "Back Off Set" },
    ],
  },
};

module.exports = workouts;
