import { parseProductionExcel, looksLikeProduction } from './productionExcel.js';
import { parseSummaryExcel, looksLikeSummary } from './summaryExcel.js';
import { parseElectricityBillPdf, looksLikeBillPdf } from './billPdf.js';

export const KIND = {
  PRODUCTION: 'production',
  SUMMARY: 'summary',
  BILL: 'bill',
  UNKNOWN: 'unknown',
};

const KIND_LABEL = {
  [KIND.PRODUCTION]: 'קובץ ייצור מערכות',
  [KIND.SUMMARY]: 'סיכום סולארי',
  [KIND.BILL]: 'חשבון חשמל',
  [KIND.UNKNOWN]: 'לא מזוהה',
};

export function kindLabel(kind) {
  return KIND_LABEL[kind] || KIND_LABEL[KIND.UNKNOWN];
}

// Detect kind by filename first (cheap), then by content
export async function detectKind(file) {
  const name = file.name.toLowerCase();
  if (name.endsWith('.pdf')) return KIND.BILL;
  if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
    if (await looksLikeSummary(file)) return KIND.SUMMARY;
    if (await looksLikeProduction(file)) return KIND.PRODUCTION;
    if (/סיכום/.test(file.name)) return KIND.SUMMARY;
    if (/ייצור/.test(file.name)) return KIND.PRODUCTION;
    return KIND.PRODUCTION;
  }
  return KIND.UNKNOWN;
}

export async function processFile(file) {
  const kind = await detectKind(file);
  if (kind === KIND.PRODUCTION) {
    const data = await parseProductionExcel(file);
    return { kind, data };
  }
  if (kind === KIND.SUMMARY) {
    const data = await parseSummaryExcel(file);
    return { kind, data };
  }
  if (kind === KIND.BILL) {
    const data = await parseElectricityBillPdf(file);
    return { kind, data };
  }
  return { kind: KIND.UNKNOWN, data: null };
}
