const path = require('path');
const fs = require('fs');

async function main() {
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const folder = String.raw`c:\Users\יאיר\Downloads\יאיר אישי\מבחני בית`;
  const files = ['חשבון חשמל 19.09-23.10.pdf', 'חשבון חשמל 24.10-19.11.pdf'];
  const out = [];

  for (const f of files) {
    out.push('\n############ FILE: ' + f + ' ############');
    const buf = fs.readFileSync(path.join(folder, f));
    const data = new Uint8Array(buf);
    const doc = await pdfjsLib.getDocument({ data, disableFontFace: true, isEvalSupported: false }).promise;
    out.push('Pages: ' + doc.numPages);
    for (let p = 1; p <= doc.numPages; p++) {
      const page = await doc.getPage(p);
      const content = await page.getTextContent();
      const text = content.items.map(i => i.str).join(' ');
      out.push('\n--- Page ' + p + ' ---');
      out.push(text);
    }
  }

  fs.writeFileSync(path.join(__dirname, 'pdf-dump.txt'), out.join('\n'), 'utf8');
  console.log('Wrote pdf-dump.txt');
}
main().catch(e => { console.error(e); process.exit(1); });
