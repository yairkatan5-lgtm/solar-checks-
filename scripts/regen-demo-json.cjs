// Regenerates src/data/solar-data.json from the actual homework production Excel
// using the new parser, so guest mode has the same shape as user-uploaded data.
const fs = require('fs');
const path = require('path');

class NodeFile {
  constructor(filepath) {
    this.filepath = filepath;
    this.name = path.basename(filepath);
  }
  async arrayBuffer() {
    const buf = fs.readFileSync(this.filepath);
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  }
}

async function main() {
  const { parseProductionExcel } = await import('../src/upload/parsers/productionExcel.js');
  const folder = String.raw`c:\Users\יאיר\Downloads\יאיר אישי\מבחני בית`;
  const file = new NodeFile(path.join(folder, 'ייצור מערכות סולאריות - מבחן בית.xlsx'));
  const data = await parseProductionExcel(file);
  // Set period to a friendlier label
  data.period = '03/2025';
  fs.writeFileSync(
    path.resolve(__dirname, '..', 'src/data/solar-data.json'),
    JSON.stringify(data, null, 2),
    'utf8',
  );
  console.log('✓ regenerated solar-data.json with', data.totals.systems_count, 'systems, benchmark', data.totals.group_benchmark_kwh_per_kwp);
}
main().catch(e => { console.error(e); process.exit(1); });
