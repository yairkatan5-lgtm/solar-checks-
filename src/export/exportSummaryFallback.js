import ExcelJS from 'exceljs';
import { periodToRowValues } from './summarySchema.js';

const HEADER = [
  'תקופה',
  'הערה',
  'סכום של קוט"ש מיוצר לפ חוזה',
  'סכום של ערך ייצור (₪)',
  'סכום של קוט"ש הזרמה',
  'סכום של ערך הזרמה (₪)',
  'סכום של קוט"ש צריכה עצמית',
  'סכום של ערך צריכה עצמית (₪)',
  'דמי הגנה (₪)',
  'דמי הולכה (₪)',
  'דמי איזון (₪)',
  'רווח סולארי נקי (₪)',
  'ניכויים שונים',
  'תעריפים'
];

export async function exportSummaryXlsxSimple(unifiedItems, filename) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('סיכום סולארי', { views: [{ rightToLeft: true }] });

  // Add Headers
  const headerRow = ws.addRow(HEADER);
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6E6FA' } // Light purple/gray like in typical pivot tables
    };
    cell.font = { bold: true };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = {
      top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
    };
  });
  ws.getRow(1).height = 40;

  // Set column widths
  ws.columns = [
    { width: 22 }, // A - Period
    { width: 15 }, // B - Note
    { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 },
    { width: 12 }, { width: 12 }, { width: 12 }, { width: 15 }, { width: 12 }, { width: 12 }
  ];

  // Accumulate totals
  const totals = new Array(HEADER.length).fill(0);

  // Add Data
  unifiedItems.forEach((it) => {
    const raw = periodToRowValues(it.period);
    // periodToRowValues returns 12 items. We have 14 columns (added 2 at the end: ניכויים שונים, תעריפים).
    const rowData = [...raw, '', ''];
    const row = ws.addRow(rowData);
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFDDDDDD' } },
        bottom: { style: 'thin', color: { argb: 'FFDDDDDD' } },
        left: { style: 'thin', color: { argb: 'FFDDDDDD' } },
        right: { style: 'thin', color: { argb: 'FFDDDDDD' } }
      };
      
      // Sum up numeric columns (C to L)
      if (colNumber >= 3 && colNumber <= 12 && typeof cell.value === 'number') {
        totals[colNumber - 1] += cell.value;
        cell.numFmt = '#,##0.00';
      }
    });
  });

  // Add Total Row
  const totalRowData = ['סה"כ', '', ...totals.slice(2, 12), '', ''];
  const totalRow = ws.addRow(totalRowData);
  totalRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFFF00' } // Bright Yellow
    };
    cell.font = { bold: true };
    cell.border = {
      top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
    };
    if (colNumber >= 3 && colNumber <= 12 && typeof cell.value === 'number') {
      cell.numFmt = '#,##0.00';
    }
  });

  // Trigger download
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
