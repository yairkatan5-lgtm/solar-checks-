const nfNumber = new Intl.NumberFormat('he-IL', { maximumFractionDigits: 0 });
const nfNumber1 = new Intl.NumberFormat('he-IL', { maximumFractionDigits: 1 });
const nfNumber2 = new Intl.NumberFormat('he-IL', { maximumFractionDigits: 2 });
const nfMoney = new Intl.NumberFormat('he-IL', {
  style: 'currency',
  currency: 'ILS',
  maximumFractionDigits: 0,
});
const nfMoney2 = new Intl.NumberFormat('he-IL', {
  style: 'currency',
  currency: 'ILS',
  maximumFractionDigits: 2,
});

export const fmt = {
  num: (v) => nfNumber.format(v ?? 0),
  num1: (v) => nfNumber1.format(v ?? 0),
  num2: (v) => nfNumber2.format(v ?? 0),
  money: (v) => nfMoney.format(v ?? 0),
  money2: (v) => nfMoney2.format(v ?? 0),
  kwh: (v) => `${nfNumber.format(v ?? 0)} kWh`,
  kwp: (v) => `${nfNumber2.format(v ?? 0)} kWp`,
  yield: (v) => `${nfNumber1.format(v ?? 0)} kWh/kWp`,
  pct: (v) => `${nfNumber1.format((v ?? 0) * 100)}%`,
};

export const periodHebrew = (period) => {
  if (!period) return '';
  const months = {
    January: 'ינואר', February: 'פברואר', March: 'מרץ', April: 'אפריל',
    May: 'מאי', June: 'יוני', July: 'יולי', August: 'אוגוסט',
    September: 'ספטמבר', October: 'אוקטובר', November: 'נובמבר', December: 'דצמבר',
  };
  const parts = String(period).split('/');
  if (parts.length === 1) return parts[0];
  const [m, y] = parts;
  return `${months[m] || m} ${y}`;
};
