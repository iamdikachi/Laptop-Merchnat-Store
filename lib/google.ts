import { google } from 'googleapis';
import { Product } from './store';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

// Helper to get an authenticated Google Sheets client
export async function getGoogleSheetsClient() {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: privateKey,
    },
    scopes: SCOPES,
  });

  return google.sheets({ version: 'v4', auth });
}

export async function getProductsFromSheet(): Promise<Product[]> {
  try {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!A2:Z',
    });

    const rows = response.data.values || [];

    return rows
      .map((rawRow: any[]): Product | null => {
        let startIndex = 0;
        while (startIndex < rawRow.length && !String(rawRow[startIndex]).trim()) {
          startIndex++;
        }
        const row = rawRow.slice(startIndex);
        if (!row[0]) return null;

        return {
          id: String(row[0]).trim(),
          name: row[1] || '',
          price: Number(row[2]) || 0,
          originalPrice: row[3] ? Number(row[3]) : undefined,
          category: (row[4] || 'All') as any,
          brand: row[5] || '',
          badge: row[6] ? (row[6] as any) : undefined,
          specs: {
            processor: row[7] || '',
            ram: row[8] || '',
            storage: row[9] || '',
            display: row[10] || '',
            battery: row[11] || undefined,
            graphics: row[15] || undefined,
            features: row[16] || undefined,
          },
          images: row[12] ? String(row[12]).split(',').map(s => s.trim()).filter(Boolean) : [],
          inStock: String(row[13]).trim().toLowerCase() === 'true',
          createdAt: row[14] || new Date().toISOString(),
        };
      })
      .filter((p): p is Product => p !== null)
      .reverse(); 
  } catch (error) {
    console.error('Error fetching from Google Sheets:', error);
    return [];
  }
}

export async function addProductToSheet(product: Product) {
  const sheets = await getGoogleSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;

  const row = [
    product.id,
    product.name,
    product.price.toString(),
    product.originalPrice ? product.originalPrice.toString() : '',
    product.category,
    product.brand,
    product.badge || '',
    product.specs.processor,
    product.specs.ram,
    product.specs.storage,
    product.specs.display,
    product.specs.battery || '',
    product.images.join(','),
    product.inStock ? 'true' : 'false',
    product.createdAt,
    product.specs.graphics || '',
    product.specs.features || '',
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'Sheet1!A:Q',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [row],
    },
  });
}

// Update involves finding the row and updating it.
export async function updateProductInSheet(product: Product) {
  const sheets = await getGoogleSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;

  // First we need to find the row index
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:Z', // Get all columns to find the ID gracefully
  });

  const rows = response.data.values || [];
  let sheetRowNumber = -1;
  let targetRowIndex = -1;
  let emptyOffset = 0;

  for (let i = 0; i < rows.length; i++) {
    const rawRow = rows[i];
    let startIndex = 0;
    while (startIndex < rawRow.length && !String(rawRow[startIndex]).trim()) {
      startIndex++;
    }
    const idVal = rawRow[startIndex];
    if (idVal && String(idVal).trim() === product.id.trim()) {
      targetRowIndex = i;
      sheetRowNumber = i + 1;
      emptyOffset = startIndex;
      break;
    }
  }

  if (targetRowIndex === -1) {
    throw new Error('Product not found in sheet');
  }

  const lead = Array(emptyOffset).fill('');
  const rowData = [
    ...lead,
    product.id,
    product.name,
    product.price.toString(),
    product.originalPrice ? product.originalPrice.toString() : '',
    product.category,
    product.brand,
    product.badge || '',
    product.specs.processor,
    product.specs.ram,
    product.specs.storage,
    product.specs.display,
    product.specs.battery || '',
    product.images.join(','),
    product.inStock ? 'true' : 'false',
    product.createdAt,
    product.specs.graphics || '',
    product.specs.features || '',
  ];

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `Sheet1!A${sheetRowNumber}:Z${sheetRowNumber}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [rowData],
    },
  });
}

export async function deleteProductFromSheet(id: string) {
  const sheets = await getGoogleSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A:Z',
  });

  const rows = response.data.values || [];
  let rowIndex = -1;

  for (let i = 0; i < rows.length; i++) {
    const rawRow = rows[i];
    let startIndex = 0;
    while (startIndex < rawRow.length && !String(rawRow[startIndex]).trim()) {
      startIndex++;
    }
    const idVal = rawRow[startIndex];
    if (idVal && String(idVal).trim() === id.trim()) {
      rowIndex = i;
      break;
    }
  }

  if (rowIndex === -1) {
    throw new Error('Product not found in sheet');
  }

  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
  const sheetId = spreadsheet.data.sheets?.find((s: any) => s.properties?.title === 'Sheet1')?.properties?.sheetId || 0;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: sheetId,
              dimension: 'ROWS',
              startIndex: rowIndex, // 0-based, inclusive
              endIndex: rowIndex + 1, // 0-based, exclusive
            }
          }
        }
      ]
    }
  });
}
