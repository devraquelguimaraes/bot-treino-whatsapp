const { google } = require("googleapis");
const { parseDataHora } = require("./utils");

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;

const HEADER = ["Data", "Hora", "Treino", "Exercício", "Tipo de Série", "Repetições", "Carga", "Falhou?"];

function getAuth() {
  const credsJson = Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_B64, "base64").toString("utf8");
  const creds = JSON.parse(credsJson);
  return new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

async function getSheetsClient() {
  const auth = getAuth();
  const client = await auth.getClient();
  return google.sheets({ version: "v4", auth: client });
}

async function ensureWeekTab(sheets, weekLabel) {
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  const exists = meta.data.sheets.some((s) => s.properties.title === weekLabel);

  if (!exists) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [{ addSheet: { properties: { title: weekLabel } } }],
      },
    });
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${weekLabel}!A1:H1`,
      valueInputOption: "RAW",
      requestBody: { values: [HEADER] },
    });
  }
}

async function appendSet(weekLabel, row) {
  const sheets = await getSheetsClient();
  await ensureWeekTab(sheets, weekLabel);
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${weekLabel}!A:H`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [row] },
  });
}

async function getLastRows(weekLabel, n = 5) {
  const sheets = await getSheetsClient();
  await ensureWeekTab(sheets, weekLabel);
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${weekLabel}!A2:H`,
  });
  const rows = res.data.values || [];
  return rows.slice(-n);
}

// Varre todas as abas "Semana N" já existentes procurando a última vez que
// esse exercício foi registrado, para lembrar a carga usada.
async function getLastLoadForExercise(exerciseName) {
  const sheets = await getSheetsClient();
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  const weekSheetTitles = meta.data.sheets
    .map((s) => s.properties.title)
    .filter((title) => /^Semana \d+$/.test(title));

  const candidatos = [];

  for (const title of weekSheetTitles) {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${title}!A2:H`,
    });
    const rows = res.data.values || [];
    rows.forEach((r) => {
      if (r[3] === exerciseName) {
        candidatos.push({ data: r[0], hora: r[1], tipo: r[4], reps: r[5], carga: r[6] });
      }
    });
  }

  if (candidatos.length === 0) return null;

  candidatos.sort((a, b) => parseDataHora(b.data, b.hora) - parseDataHora(a.data, a.hora));

  // Prioriza a última Top-set/Muscle Round (a carga "de verdade"), senão pega o mais recente
  const melhor = candidatos.find((c) => c.tipo === "Top-set" || c.tipo === "Muscle Round");
  return melhor || candidatos[0];
}

module.exports = { appendSet, getLastRows, getLastLoadForExercise };
