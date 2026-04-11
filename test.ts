import { getGoogleSheetsClient } from './lib/google';
import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

getGoogleSheetsClient().then(async (sheets) => {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: 'Sheet1!A2:Q'
  });
  console.log(JSON.stringify(res.data.values, null, 2));
}).catch(console.error);
