// Calcula em qual das 8 semanas do programa a data atual está (número puro),
// com base na data de início definida em PROGRAM_START_DATE (.env)
function computeWeekNumber(startDateStr) {
  const start = new Date(`${startDateStr}T00:00:00`);
  const now = new Date();
  const diffDays = Math.floor((now - start) / (1000 * 60 * 60 * 24));

  let week = Math.floor(diffDays / 7) + 1;
  if (week < 1) week = 1;
  if (week > 8) week = 8;

  return week;
}

function computeWeekLabel(startDateStr) {
  return `Semana ${computeWeekNumber(startDateStr)}`;
}

// Converte "dd/mm/aaaa" + "HH:MM:SS" (como salvamos na planilha) num timestamp comparável
function parseDataHora(dataStr, horaStr) {
  const [dia, mes, ano] = (dataStr || "01/01/2000").split("/").map(Number);
  const [h, m, s] = (horaStr || "00:00:00").split(":").map(Number);
  return new Date(ano, (mes || 1) - 1, dia || 1, h || 0, m || 0, s || 0).getTime();
}

module.exports = { computeWeekNumber, computeWeekLabel, parseDataHora };
