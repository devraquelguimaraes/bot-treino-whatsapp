// Calcula em qual das 8 semanas do programa a data atual está,
// com base na data de início definida em PROGRAM_START_DATE (.env)
function computeWeekLabel(startDateStr) {
  const start = new Date(`${startDateStr}T00:00:00`);
  const now = new Date();
  const diffDays = Math.floor((now - start) / (1000 * 60 * 60 * 24));

  let week = Math.floor(diffDays / 7) + 1;
  if (week < 1) week = 1;
  if (week > 8) week = 8;

  return `Semana ${week}`;
}

module.exports = { computeWeekLabel };
