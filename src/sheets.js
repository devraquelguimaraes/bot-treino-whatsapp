const { google } = require("googleapis");

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

module.exports = { appendSet, getLastRows };
