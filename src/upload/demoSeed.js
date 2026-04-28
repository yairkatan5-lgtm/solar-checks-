import { processFile, KIND } from './parsers/detect.js';

const DEMO_FILES = [
  { url: '/demo/production.xlsx', name: 'ייצור מערכות סולאריות - מבחן בית.xlsx' },
  { url: '/demo/summary.xlsx', name: 'סיכום סולארי - מבחן בית.xlsx' },
  { url: '/demo/bill-2025-09-19_2025-10-23.pdf', name: 'חשבון 19.09-23.10.pdf' },
  { url: '/demo/bill-2025-10-24_2025-11-19.pdf', name: 'חשבון 24.10-19.11.pdf' }
];

// Loads the actual homework files from /public/demo/, runs them through the real
// parser pipeline, and returns the resulting account data shape.
//
// Each item callback fires with progress info {name, status, kind} so callers can
// drive a progress UI.
export async function loadHomeworkData(onProgress) {
  const result = { solarSystems: null, summary: null, bills: [] };
  for (const f of DEMO_FILES) {
    onProgress?.({ name: f.name, status: 'loading' });
    try {
      const res = await fetch(f.url);
      if (!res.ok) throw new Error(`Failed to fetch ${f.url}: ${res.status}`);
      const blob = await res.blob();
      const file = new File([blob], f.name, { type: blob.type });
      const { kind, data } = await processFile(file);
      onProgress?.({ name: f.name, status: 'parsed', kind });
      if (!data) {
        onProgress?.({ name: f.name, status: 'empty', kind });
        continue;
      }
      if (kind === KIND.PRODUCTION) result.solarSystems = data;
      else if (kind === KIND.SUMMARY) result.summary = data;
      else if (kind === KIND.BILL) result.bills.push(data);
    } catch (err) {
      console.error('demo file failed:', f.name, err);
      onProgress?.({ name: f.name, status: 'error', error: err.message });
    }
  }
  return result;
}
