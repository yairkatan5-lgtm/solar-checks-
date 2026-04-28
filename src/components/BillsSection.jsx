import { useState } from 'react';
import { motion } from 'framer-motion';
import { Receipt, ChevronDown, Calendar, Zap, Banknote, Sun, ArrowDownToLine, ArrowUpFromLine, Trash2, Wallet } from 'lucide-react';
import { fmt } from '../utils/format.js';
import { useAccount } from '../account/AccountContext.jsx';

export default function BillsSection({ bills }) {
  const { removeBill } = useAccount();
  const [openId, setOpenId] = useState(null);

  if (!bills?.length) return null;

  const totals = bills.reduce(
    (acc, b) => ({
      kwh: acc.kwh + (b.consumption_kwh || 0),
      pay: acc.pay + (b.total_to_pay_nis || 0),
      credit: acc.credit + (b.credit_offset_nis || 0),
      production: acc.production + (b.net?.production_kwh || 0) + (b.pv?.production_kwh || 0),
      self: acc.self + (b.net?.self_consumption_kwh || 0) + (b.pv?.self_consumption_kwh || 0),
      exp: acc.exp + (b.net?.export_kwh || 0) + (b.pv?.export_kwh || 0),
    }),
    { kwh: 0, pay: 0, credit: 0, production: 0, self: 0, exp: 0 },
  );

  const sorted = [...bills].sort((a, b) => (a.periodStart || '').localeCompare(b.periodStart || ''));

  return (
    <section id="bills" className="max-w-7xl mx-auto px-6 lg:px-10 mt-14 md:mt-20">
      <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="eyebrow">חשבונות חשמל</div>
          <h2 className="section-title">המסלול החודשי שלך</h2>
          <p className="lede mt-1">חשבונות שעלו עד כה — סה"כ {bills.length} {bills.length === 1 ? 'חשבון' : 'חשבונות'}.</p>
        </div>
      </div>

      {/* Aggregate summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <SummaryStat icon={Zap} label="סה״כ צריכה" value={fmt.kwh(totals.kwh)} bg="bg-sky-100 text-sky-600" />
        <SummaryStat icon={Sun} label="סה״כ ייצור סולארי" value={fmt.kwh(totals.production)} bg="bg-brand-orange-100 text-brand-orange-600" />
        <SummaryStat icon={Banknote} label="סה״כ ששולם בפועל" value={fmt.money(totals.pay)} bg="bg-brand-green-100 text-brand-green-600" />
        <SummaryStat icon={Wallet} label="קיזוז קרדיט" value={fmt.money(Math.abs(totals.credit))} bg="bg-fuchsia-100 text-fuchsia-600" />
      </div>

      <ul className="space-y-3">
        {sorted.map((b, i) => (
          <motion.li
            key={b.id}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: Math.min(i * 0.04, 0.3) }}
            className="card overflow-hidden"
          >
            <button
              onClick={() => setOpenId((id) => (id === b.id ? null : b.id))}
              className="w-full flex items-center gap-4 p-4 md:p-5 text-right hover:bg-brand-ink-50 transition"
            >
              <div className="w-11 h-11 rounded-xl bg-brand-orange-100 text-brand-orange-600 grid place-items-center flex-shrink-0">
                <Receipt className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-extrabold text-brand-ink-900 truncate">
                  {b.periodLabel || 'חשבון חשמל'}
                  {b.days ? <span className="text-brand-ink-500 font-semibold"> · {b.days} ימים</span> : null}
                </div>
                <div className="text-xs text-brand-ink-500 mt-0.5 flex items-center gap-2 flex-wrap">
                  {b.invoiceNumber && <span>חשבונית {b.invoiceNumber}</span>}
                  {b.contractNumber && <span>· חוזה {b.contractNumber}</span>}
                </div>
              </div>
              <div className="hidden md:grid grid-cols-3 gap-6 text-right me-4">
                <MiniStat label="צריכה" value={fmt.kwh(b.consumption_kwh)} />
                <MiniStat label="לתשלום" value={fmt.money(b.total_to_pay_nis)} highlight />
                <MiniStat label="ייצור PV" value={fmt.kwh((b.net?.production_kwh || 0) + (b.pv?.production_kwh || 0))} />
              </div>
              <ChevronDown className={`w-5 h-5 text-brand-ink-300 transition ${openId === b.id ? 'rotate-180' : ''}`} />
            </button>

            {openId === b.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t border-brand-ink-100 p-5 md:p-6 bg-brand-ink-50"
              >
                <div className="grid md:grid-cols-2 gap-6">
                  <BillBreakdown b={b} />
                  <BillProduction b={b} />
                </div>

                <div className="mt-5 flex items-center justify-between flex-wrap gap-3">
                  <div className="text-xs text-brand-ink-500">
                    מקור: <span className="font-semibold">{b.sourceFile}</span>
                  </div>
                  <button
                    onClick={() => { if (window.confirm('להסיר את החשבון מהחשבון שלך?')) removeBill(b.id); }}
                    className="text-xs font-semibold text-brand-ink-500 hover:text-rose-600 transition inline-flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    הסר חשבון
                  </button>
                </div>
              </motion.div>
            )}
          </motion.li>
        ))}
      </ul>
    </section>
  );
}

function SummaryStat({ icon: Icon, label, value, bg }) {
  return (
    <div className="card p-4">
      <div className={`w-9 h-9 rounded-lg ${bg} grid place-items-center mb-2`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="text-xs text-brand-ink-500 font-semibold">{label}</div>
      <div className="text-lg md:text-xl font-extrabold text-brand-ink-900 mt-0.5 tabular-nums">{value}</div>
    </div>
  );
}

function MiniStat({ label, value, highlight }) {
  return (
    <div>
      <div className="text-[10px] text-brand-ink-500 font-bold tracking-wider uppercase">{label}</div>
      <div className={`text-sm font-extrabold tabular-nums ${highlight ? 'text-brand-green-600' : 'text-brand-ink-900'}`}>{value}</div>
    </div>
  );
}

function BillBreakdown({ b }) {
  const rows = [
    { label: 'חיוב צריכה', value: b.consumption_charge_nis, kwh: b.consumption_kwh },
    { label: 'תשלום בגין הספק (KVA)', value: b.power_fee_nis, kwh: b.power_kva ? `${b.power_kva} KVA` : null },
    { label: 'תשלום קבוע', value: b.fixed_payment_nis },
    { label: 'חיובים/זיכויים שונים', value: b.misc_charges_nis },
    { label: 'חיובים/זיכויים מאסדרה', value: b.regulation_charges_nis },
    { label: 'סה"כ ללא מע"מ', value: b.subtotal_no_vat_nis, divider: true, bold: true },
    { label: 'מע"מ 18%', value: b.vat_nis },
    { label: 'סה"כ כולל מע"מ', value: b.total_with_vat_nis, bold: true },
  ];
  if (b.credit_offset_nis) rows.push({ label: 'קיזוז קרדיט', value: b.credit_offset_nis });
  rows.push({ label: 'סה"כ לתשלום', value: b.total_to_pay_nis, divider: true, bold: true, big: true });

  return (
    <div className="card p-4 md:p-5">
      <div className="flex items-center gap-2 mb-3">
        <Banknote className="w-4 h-4 text-brand-green-600" />
        <h3 className="font-extrabold text-brand-ink-900">פירוט החשבון</h3>
      </div>
      <ul className="space-y-1.5">
        {rows.map((r, i) => (
          <li key={i} className={`flex items-center justify-between gap-3 ${r.divider ? 'pt-2 border-t border-brand-ink-100 mt-1' : ''}`}>
            <div className={`text-sm ${r.bold ? 'font-extrabold text-brand-ink-900' : 'text-brand-ink-700'}`}>
              {r.label}
              {r.kwh && <span className="ms-2 text-xs text-brand-ink-500 font-normal">({typeof r.kwh === 'string' ? r.kwh : fmt.kwh(r.kwh)})</span>}
            </div>
            <div className={`tabular-nums ${r.big ? 'text-xl' : 'text-sm'} ${r.bold ? 'font-extrabold' : 'font-semibold'} ${r.value < 0 ? 'text-rose-600' : (r.big ? 'text-brand-green-600' : 'text-brand-ink-900')}`}>
              {r.value != null ? fmt.money2(r.value) : '—'}
            </div>
          </li>
        ))}
      </ul>
      {b.avg_price_agorot ? (
        <div className="mt-3 pt-3 border-t border-brand-ink-100 text-xs text-brand-ink-500">
          מחיר ממוצע משוקלל: <span className="font-bold text-brand-ink-900">{b.avg_price_agorot} אגורות / קוט"ש</span>
        </div>
      ) : null}
    </div>
  );
}

function BillProduction({ b }) {
  const net = b.net || {};
  const pv = b.pv || {};
  if (!net.production_kwh && !pv.production_kwh) {
    return (
      <div className="card p-4 md:p-5 grid place-items-center text-sm text-brand-ink-500">
        אין נתוני ייצור סולארי בחשבון זה
      </div>
    );
  }
  const total = {
    production: (net.production_kwh || 0) + (pv.production_kwh || 0),
    self_consumption: (net.self_consumption_kwh || 0) + (pv.self_consumption_kwh || 0),
    export: (net.export_kwh || 0) + (pv.export_kwh || 0),
  };
  const selfPct = total.production > 0 ? (total.self_consumption / total.production) * 100 : 0;
  const exportPct = total.production > 0 ? (total.export / total.production) * 100 : 0;

  return (
    <div className="card p-4 md:p-5">
      <div className="flex items-center gap-2 mb-3">
        <Sun className="w-4 h-4 text-brand-orange-500" />
        <h3 className="font-extrabold text-brand-ink-900">ייצור סולארי בתקופה</h3>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <Stat icon={Sun} label="ייצור" value={fmt.kwh(total.production)} color="text-brand-orange-600" bg="bg-brand-orange-50" />
        <Stat icon={ArrowDownToLine} label="צריכה עצמית" value={fmt.kwh(total.self_consumption)} sub={`${selfPct.toFixed(0)}%`} color="text-brand-green-700" bg="bg-brand-green-50" />
        <Stat icon={ArrowUpFromLine} label="הזרמה לרשת" value={fmt.kwh(total.export)} sub={`${exportPct.toFixed(0)}%`} color="text-sky-700" bg="bg-sky-50" />
      </div>

      {/* Stacked bar self vs export */}
      {total.production > 0 && (
        <div className="mt-4">
          <div className="text-xs text-brand-ink-500 font-semibold mb-1">חלוקת הייצור</div>
          <div className="h-3 rounded-full bg-brand-ink-100 overflow-hidden flex">
            <div className="bg-gradient-to-r from-brand-green-400 to-brand-green-600" style={{ width: `${selfPct}%` }} />
            <div className="bg-gradient-to-r from-sky-400 to-sky-600" style={{ width: `${exportPct}%` }} />
          </div>
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-brand-ink-100 grid grid-cols-2 gap-2 text-xs">
        {net.production_kwh != null && (
          <div className="flex justify-between">
            <span className="text-brand-ink-500">נטו · ייצור</span>
            <span className="font-bold tabular-nums">{fmt.kwh(net.production_kwh)}</span>
          </div>
        )}
        {pv.production_kwh != null && (
          <div className="flex justify-between">
            <span className="text-brand-ink-500">פוטו · ייצור</span>
            <span className="font-bold tabular-nums">{fmt.kwh(pv.production_kwh)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, sub, color, bg }) {
  return (
    <div className={`p-3 rounded-xl ${bg}`}>
      <Icon className={`w-4 h-4 mx-auto ${color}`} />
      <div className="text-[10px] mt-1 text-brand-ink-500 font-bold tracking-wider uppercase">{label}</div>
      <div className={`text-base font-extrabold tabular-nums ${color}`}>{value}</div>
      {sub && <div className="text-[10px] text-brand-ink-500 mt-0.5">{sub}</div>}
    </div>
  );
}
