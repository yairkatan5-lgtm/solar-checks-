import ExcelJS from 'exceljs';
import { DATE_RANGE_RE, periodToRowValues } from './summarySchema.js';

export const TEMPLATE_PATH = '/templates/solar-summary-template.xlsx';

export async function fetchTemplateArrayBuffer() {
  const res = await fetch(TEMPLATE_PATH);
  if (!res.ok) return null;
  return res.arrayBuffer();
}

function cellToString(cell) {
  const raw = cell.value;
  if (raw == null) return '';
  if (typeof raw === 'object' && raw !== null && 'text' in raw) return String(raw.text);
  if (typeof raw === 'object' && raw !== null && 'result' in raw) return String(raw.result);
  if (typeof raw === 'object' && raw !== null && 'richText' in raw) {
    return raw.richText.map((t) => t.text).join('');
  }
  return String(raw);
}

/**
 * Template may have spacer rows between data rows; only rows with date-range in column A are filled.
 */
export async function fillSummaryTemplate(templateBuffer, unifiedItems) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(templateBuffer);
  const sheet = wb.worksheets.find((ws) => ws.name.includes('סיכום')) || wb.worksheets[0];
  if (!sheet) throw new Error('לא נמצא גיליון');

  const scanMax = Math.max(sheet.rowCount || 0, 200);
  const dataRowIndices = [];
  for (let r = 1; r <= scanMax; r++) {
    const t = cellToString(sheet.getCell(r, 1));
    if (DATE_RANGE_RE.test(t.trim())) dataRowIndices.push(r);
  }

  if (!dataRowIndices.length) {
    throw new Error('בתבנית לא נמצאה שורת נתונים תקינה בעמודה A (פורמט dd/mm/yyyy-dd/mm/yyyy)');
  }

  const nNew = unifiedItems.length;
  const nSlots = dataRowIndices.length;

  if (nNew === 0) {
    for (let i = 0; i < nSlots; i++) {
      const row = sheet.getRow(dataRowIndices[i]);
      for (let c = 1; c <= 12; c++) row.getCell(c).value = null;
    }
  } else {
    const common = Math.min(nNew, nSlots);
    for (let i = 0; i < common; i++) {
      const vals = periodToRowValues(unifiedItems[i].period);
      const row = sheet.getRow(dataRowIndices[i]);
      vals.forEach((v, ci) => {
        row.getCell(ci + 1).value = v;
      });
    }

    let anchor = dataRowIndices[common - 1];
    for (let i = common; i < nNew; i++) {
      anchor += 1;
      sheet.insertRow(anchor, []);
      const vals = periodToRowValues(unifiedItems[i].period);
      const row = sheet.getRow(anchor);
      vals.forEach((v, ci) => {
        row.getCell(ci + 1).value = v;
      });
    }

    for (let i = nNew; i < nSlots; i++) {
      const row = sheet.getRow(dataRowIndices[i]);
      for (let c = 1; c <= 12; c++) row.getCell(c).value = null;
    }
  }

  const buf = await wb.xlsx.writeBuffer();
  return buf;
}

export function downloadBuffer(buffer, filename) {
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
