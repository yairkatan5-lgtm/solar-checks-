import ExcelJS from 'exceljs';

async function main() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile('./public/demo/summary.xlsx');
  const ws = wb.worksheets[0];
  
  const headers = [];
  const row = ws.getRow(1);
  row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
    headers.push(`Col ${colNumber}: ${cell.value}`);
  });
  
  console.log(headers.join('\n'));
}

main().catch(console.error);
