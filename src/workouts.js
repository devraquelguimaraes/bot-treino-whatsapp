// Estrutura extraída do novo protocolo de treino
// Divisão: UPPER 2x / LOWER 3x

// Qual treino cai em cada dia da semana (chave = valor do JS Date().getDay())
// 0=domingo, 1=segunda, 2=terça, 3=quarta, 4=quinta, 5=sexta, 6=sábado
const diasSemana = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"];
const diasSemanaDisplay = {
  domingo: "domingo",
  segunda: "segunda-feira",
  terca: "terça-feira",
  quarta: "quarta-feira",
  quinta: "quinta-feira",
  sexta: "sexta-feira",
  sabado: "sábado",
};

// null = dia de descanso, sem treino programado
const agenda = {
  domingo: null,
  segunda: "A",
  terca: "B",
  quarta: "C",
  quinta: null,
  sexta: "D",
  sabado: "E",
};

const workouts = {
  A: {
    nome: "Treino A - LOWER 1",
    tipo: "Loading Sets",
    exercicios: [
      { nome: "Cadeira Adutora", reps: "5 a 9", obs: "" },
      { nome: "Abdução cabo por trás", reps: "10 a 15", obs: "" },
      { nome: "RDL", reps: "5 a 9", obs: "" },
      { nome: "Cadeira Flexora", reps: "5 a 9", obs: "" },
      { nome: "Front Squat", reps: "5 a 9", obs: "" },
      { nome: "Elevação Pélvica Máquina", reps: "5 a 9", obs: "" },
      { nome: "DC Strech Sissy Quads", reps: "2x 1 min", obs: "Alongamento" },
    ],
  },
  B: {
    nome: "Treino B - UPPER 1",
    tipo: "Loading Sets",
    exercicios: [
      { nome: "Remada Baixa Triângulo", reps: "5 a 9", obs: "" },
      { nome: "Puxada Alta Supinada", reps: "5 a 9", obs: "" },
      { nome: "Remada Diagonal Polia", reps: "5 a 9", obs: "" },
      { nome: "Desenvolvimento H Neutro 70°", reps: "5 a 9", obs: "" },
      { nome: "Elevação Frontal H Bilateral", reps: "5 a 9", obs: "" },
      { nome: "Triceps Pulley", reps: "5 a 9", obs: "" },
      { nome: "Crunch Polia de Joelhos", reps: "10 a 15", obs: "" },
    ],
  },
  C: {
    nome: "Treino C - LOWER 2",
    tipo: "Muscle Round",
    exercicios: [
      { nome: "Cadeira Abdutora", reps: "8 a 12", obs: "" },
      { nome: "Mesa Flexora", reps: "8 a 12", obs: "" },
      { nome: "Deadlift Sumo", reps: "8 a 12", obs: "" },
      { nome: "Leg Press 45°", reps: "8 a 12", obs: "" },
      { nome: "Cadeira Extensora", reps: "8 a 12", obs: "" },
      { nome: "Sóleo Banco", reps: "8 a 12", obs: "" },
      { nome: "DC Strech Sissy Quads", reps: "2x 1 min", obs: "Alongamento" },
    ],
  },
  D: {
    nome: "Treino D - UPPER 2",
    tipo: "Muscle Round",
    exercicios: [
      { nome: "Remada Curvada Guiada", reps: "8 a 12", obs: "" },
      { nome: "Puxada Alta Pronada", reps: "8 a 12", obs: "" },
      { nome: "Pull Down Corda", reps: "8 a 12", obs: "" },
      { nome: "Desenvolvimento Smith 70°", reps: "8 a 12", obs: "" },
      { nome: "Elevação Lateral H", reps: "8 a 12", obs: "" },
      { nome: "Elevação Frontal Corda", reps: "8 a 12", obs: "" },
      { nome: "Crunch Banco Declinado H", reps: "8 a 12", obs: "" },
    ],
  },
  E: {
    nome: "Treino E - LOWER 3",
    tipo: "Loading Sets",
    exercicios: [
      { nome: "Cadeira Abdutora c/ Flexão de Quadril", reps: "5 a 9", obs: "" },
      { nome: "Flexora Vertical", reps: "5 a 9", obs: "" },
      { nome: "Abdução Cabo Frente", reps: "5 a 9", obs: "" },
      { nome: "Bulgaro H", reps: "5 a 9", obs: "" },
      { nome: "Gêmeos Hack Linear", reps: "5 a 9", obs: "" },
      { nome: "DC Strech DB RDL", reps: "2x 1 min", obs: "Alongamento" },
      { nome: "DC Strech Sissy Quads", reps: "2x 1 min", obs: "Alongamento" },
    ],
  },
};

// Como executar cada tipo de periodização (varia entre semana 1-4 e 5-8)
function periodizacaoText(trainingKey) {
  const t = workouts[trainingKey];
  if (t.tipo === "Loading Sets") {
    return "1 Warm Up + 1 a 2 Feeder Set + 1 Top Set (semanas 1-4) ou 2 Top Set (semanas 5-8)";
  }
  return "1 Warm Up + 1 a 2 Feeder Set + 1 Muscle Round, até o bloco de falha (6 blocos de 4 reps, 10s de descanso)";
}

module.exports = { workouts, agenda, diasSemana, diasSemanaDisplay, periodizacaoText };
