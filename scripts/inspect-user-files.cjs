const XLSX = require('xlsx');
const path = require('path');

const folder = String.raw`c:\Users\יאיר\Downloads\יאיר אישי\מבחני בית`;
const files = [
  'ייצור מערכות סולאריות - מבחן בית.xlsx',
  'סיכום סולארי - מבחן בית.xlsx',
];

for (const fname of files) {
  const file = path.join(folder, fname);
  console.log('\n############ FILE:', fname, '############');
  const wb = XLSX.readFile(file, { cellDates: true });
  console.log('Sheets:', wb.SheetNames);
  for (const n of wb.SheetNames) {
    const ws = wb.Sheets[n];
    const range = ws['!ref'];
    const j = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, defval: null });
    console.log(`\n=== Sheet: ${n} | range: ${range} | rows: ${j.length} ===`);
    j.slice(0, 30).forEach((r, i) => console.log('R' + i + ':', JSON.stringify(r)));
    if (j.length > 30) console.log(`... ${j.length - 30} more rows`);
  }
}
