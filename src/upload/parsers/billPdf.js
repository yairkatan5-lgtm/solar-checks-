import * as pdfjsLib from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

async function extractAllText(file) {
  const buf = await file.arrayBuffer();
  const doc = await pdfjsLib.getDocument({ data: new Uint8Array(buf), disableFontFace: true, isEvalSupported: false }).promise;
  const pages = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    pages.push(content.items.map((it) => it.str).join(' '));
  }
  await doc.destroy?.();
  return { pages, full: pages.join('\n') };
}

function parseNumber(s) {
  if (s == null) return null;
  const cleaned = String(s).replace(/[,\u202B\u202A\u202C₪\s]/g, '').replace(/\(/g, '').replace(/\)/g, '');
  if (!cleaned || cleaned === '-') return null;
  const n = parseFloat(cleaned);
  return isFinite(n) ? n : null;
}

function findAmount(text, label) {
  // Numbers come BEFORE labels in this RTL output: "78,262.24   סה"כ לתשלום"
  const safe = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp('(-?[\\d,]+\\.?\\d*)\\s+' + safe);
  const m = text.match(re);
  return m ? parseNumber(m[1]) : null;
}

function findAllAmounts(text, labelRegexSrc) {
  const re = new RegExp('(-?[\\d,]+\\.?\\d*)\\s+(?:[^\\n]*?)' + labelRegexSrc, 'g');
  const out = [];
  let m;
  while ((m = re.exec(text))) out.push(parseNumber(m[1]));
  return out;
}

// Detail tables in IEC bills (pages 3-4) appear as:
//   ש"ח   <amount>   <description-with-keyword>   ש"ח   <amount>   ...
// Sums all items whose description matches the keyword. Returns { sum, count, items: [...] }.
function sumLineItemsByKeyword(text, keywordRe) {
  const re = /ש"ח\s+(-?[\d,]+\.?\d*)\s+([^]{1,260}?)(?=\s+ש"ח\s+-?[\d,]|\s+סה"כ|\s+הודעות|\s+חיובים וזיכויים|\s+מקדם|\s+תשלום|\s+שיא ביקוש|\s+הפניית|\s+פירוט|$)/g;
  let sum = 0;
  let count = 0;
  const items = [];
  let m;
  while ((m = re.exec(text))) {
    const amount = parseNumber(m[1]);
    const desc = (m[2] || '').replace(/\s+/g, ' ').trim();
    if (amount == null) continue;
    if (keywordRe.test(desc)) {
      sum += amount;
      count += 1;
      items.push({ amount, description: desc.slice(0, 120) });
    }
  }
  return { sum: +sum.toFixed(2), count, items };
}

export async function parseElectricityBillPdf(file) {
  const { pages, full } = await extractAllText(file);
  const page1 = pages[0] || '';
  const page2 = pages[1] || '';
  const page3 = pages[2] || '';
  const page4 = pages[3] || '';
  const head = page1 + '\n' + page2 + '\n' + page3 + '\n' + page4;

  if (!/חברת החשמל לישראל/.test(full) && !/חשבון לתקופה/.test(full) && !/חברת החשמל/.test(full)) {
    return null;
  }

  // Customer name
  const custMatch = page1.match(/לכבוד:\s*([^\n]{2,80}?)\s+(?:ת\.?ד|ת\.ד\.|רחוב|להחזרה|מספר|נתיב)/);
  const customer = custMatch ? custMatch[1].trim().replace(/\s+/g, ' ') : null;

  const contractMatch = page1.match(/מספר חשבון חוזה[:\s]*([0-9]{6,})/);
  const contractNumber = contractMatch ? contractMatch[1] : null;

  const invoiceMatch = page1.match(/(\d{4}-\d{8,10})/);
  const invoiceNumber = invoiceMatch ? invoiceMatch[1] : null;

  // Period
  const periodAreaMatch = page1.match(/חשבון לתקופה[\s\S]{0,80}/);
  const periodArea = periodAreaMatch ? periodAreaMatch[0] : '';
  const dateRe = /(\d{1,2}\/\d{1,2}\/\d{4})/g;
  const dates = [];
  let dm;
  while ((dm = dateRe.exec(periodArea))) dates.push(dm[1]);
  let periodStart = null;
  let periodEnd = null;
  if (dates.length >= 2) {
    const [a, b] = [toIso(dates[0]), toIso(dates[1])];
    if (a && b) {
      periodStart = a < b ? a : b;
      periodEnd = a < b ? b : a;
    }
  }

  const daysMatch = page1.match(/ימים\s+(\d{1,3})\s+חשבון/);
  const days = daysMatch ? parseInt(daysMatch[1], 10) : null;

  // Headline numbers
  const total_to_pay = findAmount(page1, 'סה"כ לתשלום');
  const total_with_vat = findAmount(page1, 'סה"כ כולל מע"מ');
  const subtotal_no_vat = findAmount(page1, 'סה"כ ללא מע"מ');
  const vatMatch = page1.match(/(-?[\d,]+\.?\d*)\s+\d+(?:\.\d+)?\s*%\s*מע"מ/);
  const vat = vatMatch ? parseNumber(vatMatch[1]) : null;
  const consumption_total = findAmount(page1, 'חיוב בגין צריכה - סה"כ');
  const power_fee = findAmount(page1, 'תשלום בגין הספק');
  const fixed_payment = findAmount(page1, 'תשלום קבוע');
  const misc_charges = findAmount(page1, 'חיובים וזיכויים שונים');
  const regulation_charges = findAmount(page1, 'חיובים וזיכויים מאסדרה');
  const credit_offset = findAmount(page1, 'קיזוז קרדיט');

  // Total kWh consumed (headline)
  const totalKwhMatch = page1.match(/חיוב בגין צריכה - סה"כ\s+(\d[\d,]*)\s*קוט/);
  const consumption_kwh = totalKwhMatch ? parseNumber(totalKwhMatch[1]) : null;

  const kvaMatch = head.match(/KVA\s+([\d.,]+)\s+הספק/);
  const power_kva = kvaMatch ? parseNumber(kvaMatch[1]) : null;

  // Net metering production summary table
  const calcMatch = head.match(
    /חישובי ייצור[\s\S]{0,250}?(\d[\d,]*)\s+(\d[\d,]*)\s+(\d[\d,]*)\s+נטו[\s\S]{0,80}?(\d[\d,]*)\s+(\d[\d,]*)\s+(\d[\d,]*)\s+פוטווולטאי/,
  );
  let net = null, pv = null;
  if (calcMatch) {
    net = {
      export_kwh: parseNumber(calcMatch[1]),
      self_consumption_kwh: parseNumber(calcMatch[2]),
      production_kwh: parseNumber(calcMatch[3]),
    };
    pv = {
      export_kwh: parseNumber(calcMatch[4]),
      self_consumption_kwh: parseNumber(calcMatch[5]),
      production_kwh: parseNumber(calcMatch[6]),
    };
  }

  // Average tariff price (אגורות)
  const avgAgorotMatch = head.match(/מחיר ממוצע משוקלל לקוט"ש[^-]*-\s*([\d.]+)\s*אגורות/);
  const avg_price_agorot = avgAgorotMatch ? parseNumber(avgAgorotMatch[1]) : null;

  // ===== NEW: Multiplication factors per meter =====
  // "קריאות מונה מספר 6151607 קוד מונה: 853 גורם הכפלה: 80"
  // Followed by " - <role>" sometimes (e.g., "- הזרמה לרשת", "- נטו", "- פוטווולטאי")
  const meterRe = /קריאות מונה מספר\s+(\d{6,})\s+קוד מונה:\s*(\d+)\s+גורם הכפלה:\s*(\d+(?:\.\d+)?)\s*(?:-\s*([^\n]{0,40}?))?(?=\s+(?:צריכה בקוט"|תאריכי קריאה|----|חישובי ייצור))/g;
  const metersMap = new Map();
  let mm;
  while ((mm = meterRe.exec(full))) {
    const meterNumber = mm[1];
    const meterCode = mm[2];
    const factor = parseFloat(mm[3]);
    const roleRaw = (mm[4] || '').trim().replace(/\s+/g, ' ');
    let role = 'consumption';
    if (/הזרמה/.test(roleRaw)) role = 'export';
    else if (/פוטווולטאי/.test(roleRaw) || /התחשבנות/.test(roleRaw)) role = 'pv_total';
    else if (/^נטו$/.test(roleRaw) || /נטו/.test(roleRaw)) role = 'pv_net';
    const key = meterNumber + ':' + role;
    if (!metersMap.has(key)) {
      metersMap.set(key, { meterNumber, meterCode, multiplicationFactor: factor, role, roleLabel: roleRaw || null });
    }
  }
  const meters = Array.from(metersMap.values());

  // ===== NEW: Detailed regulatory breakdown =====
  // Items appear in detail tables on pages 3-7 with keywords:
  //   איזון - balance fees (positive charges)
  //   הולכ - transmission services
  //   תעריף הגנה - protection tariff (mostly credits in net-metering)
  //   תעו"ז - time-of-use
  // We sum across the entire document; absolute values used for headline "fees".
  const balance = sumLineItemsByKeyword(full, /איזון/);
  const transmission = sumLineItemsByKeyword(full, /הולכ/);
  const protection = sumLineItemsByKeyword(full, /הגנ/);
  const tou = sumLineItemsByKeyword(full, /תעו"ז|תעו'ז|תעוז/);

  // ===== NEW: Consumption alert (>30% jump warning) =====
  const consumptionAlert = /צריכתך בחודש[^\n]*גבוהה ב\s*30%/.test(full);

  // ===== NEW: Recommendation/Credit section (PV settlement) =====
  // Pages 5+ contain the המלצה (PV credit recommendation):
  //   -X,XXX.XX  סה"כ לתשלום (ש"ח)
  //   -Y,YYY.YY  חיובים וזיכויים שונים
  //   -Z,ZZZ.ZZ  חיובים וזיכויים מאסדרה
  //   -V,VVV.VV  מע"מ 18.00 % (סה"כ ללא מע"מ ...)
  // We want the totals from THE FIRST המלצה page block (e.g., page5).
  const recPage = pages.slice(4).find((p) => /רישוז המלצה|ריכוז המלצה/.test(p)) || pages[4] || '';
  let recommendation = null;
  if (recPage) {
    const recTotal = findAmount(recPage, 'סה"כ לתשלום');
    const recMisc = findAmount(recPage, 'חיובים וזיכויים שונים');
    const recAsdara = findAmount(recPage, 'חיובים וזיכויים מאסדרה');
    const recVatMatch = recPage.match(/(-?[\d,]+\.?\d*)\s+מע"מ/);
    const recVat = recVatMatch ? parseNumber(recVatMatch[1]) : null;
    if (recTotal != null) {
      recommendation = {
        total_nis: recTotal,
        misc_nis: recMisc,
        asdara_nis: recAsdara,
        vat_nis: recVat,
      };
    }
  }

  return {
    sourceFile: file.name,
    parsedAt: new Date().toISOString(),
    invoiceNumber,
    customer,
    contractNumber,
    periodStart,
    periodEnd,
    periodLabel: periodStart && periodEnd ? `${formatDate(periodStart)} - ${formatDate(periodEnd)}` : null,
    days,

    consumption_kwh,
    consumption_charge_nis: consumption_total,
    power_kva,
    power_fee_nis: power_fee,
    fixed_payment_nis: fixed_payment,
    misc_charges_nis: misc_charges,
    regulation_charges_nis: regulation_charges,
    subtotal_no_vat_nis: subtotal_no_vat,
    vat_nis: vat,
    total_with_vat_nis: total_with_vat,
    credit_offset_nis: credit_offset,
    total_to_pay_nis: total_to_pay,
    avg_price_agorot,
    net,
    pv,

    meters,
    regulatoryBreakdown: {
      balance_nis: balance.sum,
      transmission_nis: transmission.sum,
      protection_nis: protection.sum,
      tou_nis: tou.sum,
    },
    consumptionAlert,
    recommendation,
  };
}

function toIso(dmy) {
  const m = String(dmy || '').match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
}

function formatDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

export async function looksLikeBillPdf(file) {
  return /\.pdf$/i.test(file.name);
}
