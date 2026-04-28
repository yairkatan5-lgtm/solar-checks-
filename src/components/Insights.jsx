import { AlertTriangle, Trophy, TrendingDown, TrendingUp, Sparkles, ShieldCheck, Banknote } from 'lucide-react';
import { motion } from 'framer-motion';
import { fmt } from '../utils/format.js';
import EditableText from '../utils/EditableText.jsx';

export default function Insights({ data }) {
  if (data.synthesized) {
    return (
      <section id="insights" className="max-w-7xl mx-auto px-6 lg:px-10 mt-12">
        <div className="grid lg:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="card p-5 relative overflow-hidden border-brand-green-100"
          >
            <div className="absolute -top-10 -left-10 w-32 h-32 rounded-full blur-2xl bg-brand-green-100 opacity-50" />
            <div className="relative flex items-center gap-2 font-bold text-brand-green-600">
              <ShieldCheck className="w-5 h-5" />
              ביצועי החשבון והסיכום הסולארי
            </div>
            <p className="text-xs text-brand-ink-500 mt-1">ניתוח אוטומטי מבוסס חשבונות חשמל</p>
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-brand-ink-700 relative z-10">
              <Insight icon={TrendingUp} color="text-brand-green-600" text={
                <>סה"כ ייצור מכל התקופות: <b>{fmt.num(data.totals.total_production_kwh)} kWh</b>.</>
              } />
              <Insight icon={Sparkles} color="text-brand-orange-500" text={
                <>תעריף ממוצע מחולץ: <b>₪{fmt.num2(data.totals.weighted_avg_tariff_nis_per_kwh)}</b> לקוט"ש.</>
              } />
              <Insight icon={Banknote} color="text-brand-green-600" text={
                <>רווח סולארי נקי מצטבר: <b>₪{fmt.num(data.totals.total_revenue_nis)}</b> (לאחר ניכוי דמי הולכה ואיזון).</>
              } />
              <Insight icon={Trophy} color="text-brand-green-600" text={
                <>כל נתוני "סיכום סולארי" חושבו בהצלחה מתוך קובץ ה-PDF בלבד!</>
              } />
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  const benchmark = data.totals.group_benchmark_kwh_per_kwp ?? data.totals.expected_yield_benchmark ?? 0;
  const median = data.totals.median_specific_yield_kwh_per_kwp ?? 0;
  const stdDev = data.totals.std_dev_yield_kwh_per_kwp ?? 0;
  const lostKwh = data.health?.lost_kwh ?? 0;
  const lostRevenue = data.health?.lost_revenue_nis ?? 0;
  const faulty = data.health?.faulty || [];
  const underperformers = data.health?.underperformers || data.underperformers || [];
  const issuesCount = faulty.length + underperformers.length;

  return (
    <section id="insights" className="max-w-7xl mx-auto px-6 lg:px-10 mt-12">
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Issues - faulty + underperformers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className={`card p-5 relative overflow-hidden ${issuesCount > 0 ? 'alert-pulse border-red-200' : 'border-brand-green-100'}`}
        >
          <div className={`absolute -top-10 -left-10 w-32 h-32 rounded-full blur-2xl ${issuesCount > 0 ? 'bg-red-100' : 'bg-brand-green-100'}`} />
          <div className={`relative flex items-center gap-2 font-bold ${issuesCount > 0 ? 'text-red-600' : 'text-brand-green-600'}`}>
            {issuesCount > 0 ? <AlertTriangle className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            דוח תקינות התיק
          </div>
          <p className="text-xs text-brand-ink-500 mt-1">
            {issuesCount > 0
              ? `${faulty.length} תקלות + ${underperformers.length} מערכות בתת-ביצוע (מתחת ל-70% מממוצע ${fmt.num1(benchmark)} kWh/kWp)`
              : 'כל המערכות בתחום הסטייה הסביר מהבנצ\'מרק הקבוצתי.'
            }
          </p>

          {faulty.length > 0 && (
            <div className="mt-3">
              <div className="text-xs font-extrabold text-red-700 mb-1">⛔ מערכות תקולות</div>
              <ul className="space-y-2">
                {faulty.slice(0, 5).map((u) => (
                  <li key={u.id} className="rounded-xl bg-red-50 border border-red-200 p-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-brand-ink-900">{u.name}</span>
                      <span className="text-red-700 font-semibold">{fmt.num2(u.capacity_kwp)} kWp · 0 ייצור</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {underperformers.length > 0 && (
            <div className="mt-3">
              <div className="text-xs font-extrabold text-brand-orange-700 mb-1">⚠ תת-ביצוע (חשד לתקלה / לכלוך / הצללה)</div>
              <ul className="space-y-2">
                {underperformers.slice(0, 5).map((u, i) => (
                  <motion.li key={u.id}
                    initial={{ opacity: 0, x: 10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                    transition={{ delay: 0.05 * i }}
                    className="rounded-xl bg-brand-orange-50 border border-brand-orange-200 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-brand-ink-900">{u.name}</span>
                      <span className="text-xs text-brand-orange-700 font-semibold">{u.deviation_pct}% מהממוצע</span>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-brand-ink-700">
                      <div><div className="text-brand-ink-500">בפועל</div><div className="font-bold">{fmt.num(u.production_kwh)}</div></div>
                      <div><div className="text-brand-ink-500">צפוי</div><div className="font-bold">{fmt.num(u.expected_kwh)}</div></div>
                      <div><div className="text-brand-ink-500">פער</div><div className="font-bold text-red-600">-{fmt.num(u.gap_kwh)}</div></div>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </div>
          )}

          {issuesCount > 0 && (
            <div className="mt-4 pt-4 border-t border-brand-ink-100 text-sm">
              <div className="flex justify-between"><span className="text-brand-ink-500">פוטנציאל אבוד:</span><span className="font-bold text-brand-ink-900">{fmt.num(lostKwh)} kWh</span></div>
              <div className="flex justify-between"><span className="text-brand-ink-500">הכנסה חסרה:</span><span className="font-bold text-red-600">~{fmt.money(lostRevenue)}</span></div>
            </div>
          )}
        </motion.div>

        {/* Top performers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="card p-5"
        >
          <div className="flex items-center gap-2 text-brand-green-600 font-bold">
            <Trophy className="w-5 h-5" />
            <EditableText id="insights.top.title">לוח מצטיינים</EditableText>
          </div>
          <p className="text-xs text-brand-ink-500 mt-1">5 המערכות עם תפוקה גבוהה ביותר ל-kWp מותקן</p>
          <ul className="mt-4 space-y-2">
            {(data.top5 || []).map((s, i) => (
              <motion.li
                key={s.id}
                initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                transition={{ delay: 0.1 * i }}
                className="flex items-center justify-between rounded-lg p-2 hover:bg-brand-green-50 transition"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-lg grid place-items-center text-xs font-extrabold ${
                    i === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-pill'
                    : i === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-500 text-white shadow-pill'
                    : i === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-700 text-white shadow-pill'
                    : 'bg-brand-green-50 text-brand-green-700'
                  }`}>
                    {i === 0 ? '🏆' : i === 1 ? '🥈' : i === 2 ? '🥉' : (i + 1)}
                  </span>
                  <div>
                    <div className="font-semibold text-brand-ink-900">{s.name}</div>
                    {s.deviation_pct != null && s.deviation_pct > 0 && (
                      <div className="text-[10px] text-brand-green-700 font-bold">+{s.deviation_pct}% מהממוצע</div>
                    )}
                  </div>
                </div>
                <div className="text-left">
                  <div className="font-bold text-brand-ink-900">{fmt.num1(s.specific_yield_kwh_per_kwp)} <span className="text-xs text-brand-ink-500">kWh/kWp</span></div>
                  <div className="text-xs text-brand-ink-500">{fmt.num(s.production_kwh)} kWh · {fmt.money(s.revenue_nis)}</div>
                </div>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Smart insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="card p-5 relative overflow-hidden"
        >
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-brand-orange-100 blur-2xl" />
          <div className="relative flex items-center gap-2 text-brand-orange-600 font-bold">
            <Sparkles className="w-5 h-5" />
            תובנות חכמות
          </div>
          <p className="text-xs text-brand-ink-500 mt-1">מה הנתונים מספרים</p>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-brand-ink-700">
            <Insight icon={Sparkles} color="text-brand-orange-500" text={
              <>תעריף חברת חשמל נגזר: <b>{fmt.num2(data.totals.weighted_avg_tariff_nis_per_kwh * 100)} אג'</b> לקוט"ש בממוצע (לפי חשבונות שהועלו).</>
            } />
            <Insight icon={Trophy} color="text-brand-green-600" text={
              data.top5?.length > 0
                ? <>המערכת המובילה החודש היא <b>{data.top5[0].name}</b>, שהפיקה <b>{fmt.num(data.top5[0].production_kwh)} kWh</b>.</>
                : <>בנצ'מרק קבוצתי: <b>{fmt.num1(benchmark)} kWh/kWp</b> · חציון: <b>{fmt.num1(median)}</b>.</>
            } />
            {(faulty.length > 0 || underperformers.length > 0) ? (
              <Insight icon={TrendingDown} color="text-red-500" text={
                <>
                  שימו לב למערכת <b>{(faulty[0] || underperformers[0]).name}</b>! 
                  {faulty.length > 0 ? ' היא הפיקה 0 קוט"ש וחשודה כתקולה.' : ` היא נמצאת ${Math.abs((underperformers[0]||{}).deviation_pct||0)}% מתחת לממוצע הארצי.`}
                </>
              } />
            ) : (
              <Insight icon={ShieldCheck} color="text-brand-green-600" text={<>אין מערכות בתת-ביצוע משמעותי. כל הצי בתוך גבולות הסטייה הסבירה.</>} />
            )}
            <Insight icon={TrendingUp} color="text-brand-green-600" text={
              <><b>עונתיות (שיא ושפל):</b> חודשי הקיץ (יוני-ספטמבר) צפויים להציג שיא בייצור בשל שעות שמש ארוכות, בעוד שחודשי החורף מעידים על שפל בייצור בשל עננות וזווית שמש נמוכה. ההכנסות מהזיכוי מקזזות את התשלום לחברת החשמל בהתאם לעונה.</>
            } />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Insight({ icon: Icon, color, text }) {
  return (
    <div className="flex gap-3 items-start">
      <Icon className={`w-4 h-4 mt-0.5 ${color}`} />
      <div>{text}</div>
    </div>
  );
}
