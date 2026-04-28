const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const file = String.raw`c:\Users\יאיר\Downloads\ייצור מערכות סולאריות - מבחן בית.xlsx`;
const wb = XLSX.readFile(file, { cellDates: true });

const dump = {};
console.log('Sheets:', wb.SheetNames);

for (const sheetName of wb.SheetNames) {
  const ws = wb.Sheets[sheetName];
  const range = XLSX.utils.decode_range(ws['!ref']);
  console.log(`\n=== Sheet: ${sheetName} | range: ${ws['!ref']} ===`);
  const json = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, defval: null });
  dump[sheetName] = json;
  // print first 30 rows
  json.slice(0, 50).forEach((row, i) => {
    console.log(`R${i}:`, JSON.stringify(row));
  });
  if (json.length > 50) console.log(`... ${json.length - 50} more rows`);
}

fs.writeFileSync(path.join(__dirname, 'raw-dump.json'), JSON.stringify(dump, null, 2), 'utf8');
console.log('\nFull dump saved to scripts/raw-dump.json');
