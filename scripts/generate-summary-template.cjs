/* eslint-disable no-console */
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

(async () => {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('סיכום סולארי');

  ws.getCell('A1').value =
    'תבנית סיכום סולארי — ניתן להחליף בקובץ המקורי מהמשימה (שמור על גיליון בשם הכולל "סיכום" ושורות נתונים בעמודה A בפורמט dd/mm/yyyy-dd/mm/yyyy)';
  ws.mergeCells(1, 1, 1, 12);

  const headers = [
    'תקופה',
    'הערה',
    'ייצור (kWh)',
    'ערך ייצור (₪)',
    'הזרמה (kWh)',
    'ערך הזרמה (₪)',
    'צריכה עצמית (kWh)',
    'ערך צריכה עצמית (₪)',
    'דמי הגנה (₪)',
    'דמי הולכה (₪)',
    'דמי איזון (₪)',
    'רווח סולארי נטו (₪)',
  ];
  headers.forEach((h, i) => {
    ws.getCell(2, i + 1).value = h;
  });

  // Placeholder row so export can locate first data row (same regex as parser)
  ws.getCell('A3').value = '01/01/2025-31/01/2025';
  ws.getCell('B3').value = '';
  for (let c = 3; c <= 12; c++) {
    ws.getCell(3, c).value = 0;
  }

  const dir = path.join(__dirname, '..', 'public', 'templates');
  fs.mkdirSync(dir, { recursive: true });
  const out = path.join(dir, 'solar-summary-template.xlsx');
  await wb.xlsx.writeFile(out);
  console.log('Wrote', out);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
