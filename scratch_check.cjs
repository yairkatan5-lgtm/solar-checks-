const ExcelJS = require('exceljs');
const path = require('path');

async function check() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile('c:\\Users\\יאיר\\Downloads\\יאיר אישי\\מבחני בית\\סיכום סולארי - מבחן בית.xlsx');
  const ws = wb.worksheets[0];
  console.log("Headers:");
  const row2 = ws.getRow(2);
  const row3 = ws.getRow(3);
  for (let i = 1; i <= 12; i++) {
    console.log(i, row2.getCell(i).value, row3.getCell(i).value);
  }
}
check();
