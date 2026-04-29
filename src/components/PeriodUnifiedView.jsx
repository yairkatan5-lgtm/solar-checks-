import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';
import { Calendar, Coins, ArrowUpFromLine, ArrowDownToLine, Sun, Receipt, ChevronDown, ChevronUp, AlertTriangle, Zap, Wand2, Trash2 } from 'lucide-react';
import { fmt } from '../utils/format.js';

// Unified per-period view: solar production + electricity bill + net profit row.
// Receives `unified` from periodUnifier.unifyPeriods({ summary, bills, solar }).
export default function PeriodUnifiedView({ unified, onDeletePeriod }) {
  const [openIdx, setOpenIdx] = useState(null);
  if (!unified?.periods?.length) {
    return (
      <section id="periods" className="max-w-7xl mx-auto px-6 lg:px-10 mt-10">
        <div className="card p-6 text-center text-brand-ink-600 text-sm">
          אין תקופות להצגה לפי הסינון. בחרו «כל התקופות» מעל או הוסיפו חשבון / קובץ סיכום.
        </div>
      </section>
    );
  }

  const t = unified.totals;
  const chartData = unified.periods.map((it) => ({
    label: shortLabel(it.period),
    production: it.kpis.production_kwh,
    consumption: it.kpis.consumption_kwh,
    profit: it.kpis.net_solar_profit_nis,
    bill: it.kpis.bill_to_pay_nis || 0,
    period_net: it.kpis.period_net_nis,
  }));

  const synthesizedCount = unified.counts.synthesized;

  return (
    <section id="periods" className="max-w-7xl mx-auto px-6 lg:px-10 mt-14 md:mt-20">
      <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="eyebrow">תצוגה מאוחדת לפי תקופה</div>
          <h2 className="section-title">סולארי + חשמל = רווח נטו</h2>
          <p className="lede mt-1">
            {unified.periods.length} תקופות {synthesizedCount > 0 && (
              <span className="text-xs text-brand-orange-700 font-semibold">({synthesizedCount} משוחזרת מחשבון חשמל)</span>
            )}
          </p>
        </div>
      </div>

      {/* Aggregate KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <Stat icon={Sun} label="ייצור מצטבר" value={fmt.kwh(t.production_kwh)} bg="bg-brand-orange-100 text-brand-orange-600" />
        <Stat icon={ArrowDownToLine} label="צריכה" value={fmt.kwh(t.consumption_kwh)} bg="bg-red-100 text-red-600" />
        <Stat icon={ArrowUpFromLine} label="הזרמה" value={fmt.kwh(t.export_kwh)} bg="bg-sky-100 text-sky-600" />
        <Stat icon={Coins} label="רווח סולארי" value={fmt.money(t.net_solar_profit_nis)} bg="bg-brand-green-100 text-brand-green-600" positive />
        <Stat icon={Receipt} label={t.period_net_nis >= 0 ? 'רווח כולל נטו' : 'תזרים נטו'} value={fmt.money(t.period_net_nis)} bg={t.period_net_nis >= 0 ? 'bg-fuchsia-100 text-fuchsia-600' : 'bg-amber-100 text-amber-700'} positive={t.period_net_nis >= 0} />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="card p-6 overflow-visible">
          <h3 className="font-extrabold text-brand-ink-900 mb-3">ייצור מול צריכה (kWh)</h3>
          <div className="h-80">
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 14, right: 24, left: 28, bottom: 34 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef0f3" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={66} />
                <YAxis width={82} tick={{ fontSize: 11 }} tickFormatter={(v) => fmt.num(v)} />
                <Tooltip formatter={(v) => fmt.num(v)} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="production" name="ייצור" fill="#ec6f1c" radius={[4, 4, 0, 0]} />
                <Bar dataKey="consumption" name="צריכה (חשבון)" fill="#dc2626" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="card p-6 overflow-visible">
          <h3 className="font-extrabold text-brand-ink-900 mb-3">רווח סולארי לעומת חשבון חשמל (₪)</h3>
          <div className="h-80">
            <ResponsiveContainer>
              <LineChart data={chartData} margin={{ top: 14, right: 24, left: 28, bottom: 34 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef0f3" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={66} />
                <YAxis width={88} tick={{ fontSize: 11 }} tickFormatter={(v) => '₪' + fmt.num(v)} />
                <Tooltip formatter={(v) => fmt.money2(v)} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="profit" name="רווח סולארי" stroke="#1f9c5a" strokeWidth={3} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="bill" name="חשבון חשמל" stroke="#dc2626" strokeWidth={3} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Period cards (expandable) */}
      <div className="mt-6 space-y-3">
        {unified.periods.map((it, idx) => (
          <PeriodCard
            key={`${it.period.range}-${idx}`}
            item={it}
            isOpen={openIdx === idx}
            onToggle={() => setOpenIdx(openIdx === idx ? null : idx)}
            onDelete={() => onDeletePeriod?.(it.period.label)}
          />
        ))}
      </div>
    </section>
  );
}

function PeriodCard({ item, isOpen, onToggle, onDelete }) {
  const p = item.period;
  const k = item.kpis;
  const b = item.bill;
  const isSynth = item.synthesizedFromBill || item.source === 'bill';
  const hasBill = !!b;
  const periodNetPositive = k.period_net_nis >= 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 5 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      className={`card overflow-hidden ${periodNetPositive ? '' : 'border-amber-200'}`}
    >
      <button onClick={onToggle} className="w-full p-4 flex items-center justify-between hover:bg-brand-ink-50/40 transition text-right">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-green-50 grid place-items-center">
            <Calendar className="w-5 h-5 text-brand-green-600" />
          </div>
          <div>
            <div className="font-bold text-brand-ink-900">{p.range}</div>
            <div className="text-xs text-brand-ink-500 flex items-center gap-2 flex-wrap">
              <span>{fmt.num(k.production_kwh)} ייצור · {fmt.num(k.export_kwh)} הזרמה · {fmt.num(k.self_consumption_kwh)} עצמית</span>
              {isSynth && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-brand-orange-50 text-brand-orange-700 font-semibold">
                  <Wand2 className="w-3 h-3" />
                  נתוני סולארי שוחזרו מחשבון
                </span>
              )}
              {hasBill && b.consumptionAlert && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-50 text-red-700 font-semibold">
                  <AlertTriangle className="w-3 h-3" />
                  קפיצת צריכה {'>'}30%
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-left">
            <div className="text-xs text-brand-ink-500">רווח סולארי</div>
            <div className="font-extrabold text-brand-green-600 tabular-nums">{fmt.money2(k.net_solar_profit_nis)}</div>
          </div>
          {hasBill && (
            <div className="text-left">
              <div className="text-xs text-brand-ink-500">חשבון חשמל</div>
              <div className="font-extrabold text-red-600 tabular-nums">-{fmt.money2(k.bill_to_pay_nis || 0)}</div>
            </div>
          )}
          <div className="text-left">
            <div className="text-xs text-brand-ink-500">תזרים נטו</div>
            <div className={`font-extrabold tabular-nums ${periodNetPositive ? 'text-brand-green-600' : 'text-amber-700'}`}>
              {periodNetPositive ? '+' : ''}{fmt.money2(k.period_net_nis)}
            </div>
          </div>
          <button 
            type="button" 
            onClick={(e) => { e.stopPropagation(); onDelete(); }} 
            className="p-1.5 rounded-lg text-brand-ink-300 hover:text-red-500 hover:bg-red-50 transition"
            title="מחק תקופה מהסיכום"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          {isOpen ? <ChevronUp className="w-5 h-5 text-brand-ink-400" /> : <ChevronDown className="w-5 h-5 text-brand-ink-400" />}
        </div>
      </button>

      {isOpen && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="border-t border-brand-ink-100">
          <div className="p-5 grid lg:grid-cols-2 gap-5">
            {/* Solar side */}
            <div>
              <div className="flex items-center gap-2 font-bold text-brand-ink-900 mb-3">
                <Sun className="w-5 h-5 text-brand-orange-500" />
                ייצור סולארי
              </div>
              <dl className="space-y-1.5 text-sm tabular-nums">
                <Row label="ייצור (kWh)" value={fmt.num(p.production_kwh)} />
                <Row label="הזרמה לרשת (kWh)" value={fmt.num(p.export_kwh)} />
                <Row label="צריכה עצמית (kWh)" value={fmt.num(p.self_consumption_kwh)} />
                <Row label="ערך ייצור (₪)" value={fmt.money2(p.production_value_nis)} muted />
                <Row label="ערך הזרמה (₪)" value={fmt.money2(p.export_value_nis)} muted />
                <Row label="ערך צריכה עצמית (₪)" value={fmt.money2(p.self_consumption_value_nis)} muted />
                <Row label="דמי הגנה (₪)" value={fmt.money2(p.protection_fee_nis)} muted />
                <Row label="דמי הולכה (₪)" value={fmt.money2(p.transport_fee_nis)} muted />
                <Row label="דמי איזון (₪)" value={fmt.money2(p.balance_fee_nis)} muted />
                <Row label="רווח סולארי נטו" value={fmt.money2(p.net_solar_profit_nis)} bold accent="green" />
              </dl>
            </div>

            {/* Bill side */}
            <div>
              <div className="flex items-center gap-2 font-bold text-brand-ink-900 mb-3">
                <Receipt className="w-5 h-5 text-red-600" />
                חשבון חשמל
                {hasBill && (
                  <span className="text-xs text-brand-ink-500 font-normal">— חשבונית {b.invoiceNumber}</span>
                )}
              </div>
              {!hasBill ? (
                <div className="text-sm text-brand-ink-500 italic p-4 bg-brand-ink-50/50 rounded-lg">
                  אין חשבון חשמל מקושר לתקופה זו. ניתן להעלות את החשבון מהתפריט או מכפתור "העלאה" בכותרת.
                </div>
              ) : (
                <>
                  <dl className="space-y-1.5 text-sm tabular-nums">
                    <Row label="צריכה (kWh)" value={fmt.num(b.consumption_kwh)} />
                    <Row label="חיוב צריכה (₪)" value={fmt.money2(b.consumption_charge_nis)} muted />
                    <Row label="תשלום קבוע" value={fmt.money2(b.fixed_payment_nis)} muted />
                    <Row label={`תשלום הספק (${fmt.num(b.power_kva || 0)} KVA)`} value={fmt.money2(b.power_fee_nis)} muted />
                    <Row label="חיובי איזון" value={fmt.money2(b.regulatoryBreakdown?.balance_nis ?? 0)} muted />
                    <Row label="הולכה" value={fmt.money2(b.regulatoryBreakdown?.transmission_nis ?? 0)} muted />
                    <Row label="זיכויי הגנה" value={fmt.money2(b.regulatoryBreakdown?.protection_nis ?? 0)} muted accent={(b.regulatoryBreakdown?.protection_nis ?? 0) < 0 ? 'green' : 'default'} />
                    <Row label="תעו״ז" value={fmt.money2(b.regulatoryBreakdown?.tou_nis ?? 0)} muted />
                    <Row label="מע״מ" value={fmt.money2(b.vat_nis)} muted />
                    {b.credit_offset_nis != null && b.credit_offset_nis !== 0 && (
                      <Row label="קיזוז קרדיט מהמלצת חודש קודם" value={fmt.money2(b.credit_offset_nis)} muted accent="green" />
                    )}
                    <Row label="סה״כ לתשלום" value={fmt.money2(b.total_to_pay_nis)} bold accent="red" />
                    {b.recommendation && (
                      <Row label="המלצת זיכוי לחודש הבא" value={fmt.money2(b.recommendation.total_nis)} bold accent="green" />
                    )}
                  </dl>

                  {/* Multiplication factor transparency */}
                  {b.meters?.length > 0 && (
                    <div className="mt-4 p-3 bg-brand-ink-50/60 rounded-lg">
                      <div className="flex items-center gap-2 text-xs font-bold text-brand-ink-700 mb-2">
                        <Zap className="w-3.5 h-3.5" />
                        גורם הכפלה לפי מונה (חישוב הקוט"ש בפועל)
                      </div>
                      <div className="space-y-1 text-xs">
                        {b.meters.map((m, i) => (
                          <div key={`${m.meterNumber}-${i}`} className="flex items-center justify-between">
                            <span>
                              מונה <code className="font-mono bg-white px-1 rounded">{m.meterNumber}</code> ({roleLabel(m.role)})
                            </span>
                            <span className="font-bold">×{m.multiplicationFactor}</span>
                          </div>
                        ))}
                      </div>
                      <div className="text-[10px] text-brand-ink-500 mt-2">
                        הקריאות במונה כפולות בגורם הכפלה כדי לקבל את הקוט"ש בפועל.
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Bottom: clear net profit row */}
          <div className="px-5 pb-5">
            <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-l from-brand-green-50 via-white to-brand-orange-50 border border-brand-ink-100">
              <div>
                <div className="text-xs text-brand-ink-500 font-semibold">תזרים סופי לתקופה</div>
                <div className="text-xs text-brand-ink-500">רווח סולארי {fmt.money2(k.net_solar_profit_nis)} {hasBill && `- חשבון ${fmt.money2(k.bill_to_pay_nis || 0)}`}</div>
              </div>
              <div className={`text-2xl font-extrabold tabular-nums ${periodNetPositive ? 'text-brand-green-600' : 'text-amber-700'}`}>
                {periodNetPositive ? '+' : ''}{fmt.money2(k.period_net_nis)}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

function Row({ label, value, muted, bold, accent }) {
  const accentCls =
    accent === 'green' ? 'text-brand-green-600' :
    accent === 'red' ? 'text-red-600' :
    accent === 'orange' ? 'text-brand-orange-600' :
    'text-brand-ink-900';
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className={`${muted ? 'text-brand-ink-500' : 'text-brand-ink-700'}`}>{label}</dt>
      <dd className={`${bold ? 'font-extrabold' : 'font-semibold'} ${accentCls}`}>{value}</dd>
    </div>
  );
}

function Stat({ icon: Icon, label, value, bg, positive }) {
  return (
    <div className="card p-4">
      <div className={`w-9 h-9 rounded-lg ${bg} grid place-items-center mb-2`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="text-xs text-brand-ink-500 font-semibold">{label}</div>
      <div className={`text-lg md:text-xl font-extrabold mt-0.5 tabular-nums ${positive ? 'text-brand-green-700' : 'text-brand-ink-900'}`}>{value}</div>
    </div>
  );
}

function shortLabel(p) {
  if (p?.start) {
    const [y, m] = p.start.split('-');
    const months = ['', 'ינו', 'פבר', 'מרץ', 'אפר', 'מאי', 'יונ', 'יול', 'אוג', 'ספט', 'אוק', 'נוב', 'דצמ'];
    return `${months[parseInt(m, 10)]} ${y.slice(-2)}`;
  }
  return p?.range || '';
}

function roleLabel(role) {
  switch (role) {
    case 'consumption': return 'צריכה';
    case 'export': return 'הזרמה לרשת';
    case 'pv_total': return 'פוטווולטאי - סה"כ ייצור';
    case 'pv_net': return 'פוטווולטאי - נטו';
    default: return role;
  }
}
