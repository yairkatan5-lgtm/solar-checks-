import { motion } from 'framer-motion';
import { Activity, AlertTriangle, ShieldCheck, Trophy, Wrench, Info } from 'lucide-react';
import { fmt } from '../utils/format.js';

// Comprehensive health report combining:
//   • Technical summary (aggregate production / fleet stats)
//   • Fleet health: faulty + underperforming systems w/ deviation %
//   • Top performers leaderboard
//   • Technical notes (calculation methodology)
export default function SystemHealthReport({ data }) {
  if (data.synthesized) return null;
  const benchmark = data.totals.group_benchmark_kwh_per_kwp ?? 0;
  const median = data.totals.median_specific_yield_kwh_per_kwp ?? 0;
  const std = data.totals.std_dev_yield_kwh_per_kwp ?? 0;
  const totalCount = data.totals.systems_count ?? 0;
  const faulty = data.health?.faulty || [];
  const underperformers = data.health?.underperformers || [];
  const top = (data.top5 || []).filter((s) => (s.deviation_pct ?? 0) > 0);
  const healthyCount = totalCount - faulty.length - underperformers.length;
  const healthyPct = totalCount ? Math.round((healthyCount / totalCount) * 100) : 0;
  const issuesPct = totalCount ? Math.round(((faulty.length + underperformers.length) / totalCount) * 100) : 0;

  return (
    <section id="health" className="max-w-7xl mx-auto px-6 lg:px-10 mt-20">
      <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
        <div>
          <div className="eyebrow">דוח תקינות וניתוח חריגות</div>
          <h2 className="section-title mt-1">בריאות התיק — מבט טכני</h2>
          <p className="text-brand-ink-500 mt-1">סיכום מצרפי, זיהוי תקלות, ביצועים נמוכים ומובילות.</p>
        </div>
      </div>

      {/* Technical summary - 4 KPI tiles */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiTile
          icon={Activity}
          label="הספק מותקן כולל"
          value={`${fmt.num1(data.totals.total_capacity_kwp)} kWp`}
          sublabel={`${totalCount} מערכות`}
          color="brand-green"
        />
        <KpiTile
          icon={Activity}
          label="ייצור התקופה"
          value={fmt.kwh(data.totals.total_production_kwh)}
          sublabel={fmt.money(data.totals.total_revenue_nis)}
          color="brand-orange"
        />
        <KpiTile
          icon={Activity}
          label="בנצ'מרק קבוצתי"
          value={`${fmt.num1(benchmark)} kWh/kWp`}
          sublabel={`חציון ${fmt.num1(median)} · σ ${fmt.num1(std)}`}
          color="brand-green"
        />
        <KpiTile
          icon={faulty.length + underperformers.length === 0 ? ShieldCheck : AlertTriangle}
          label="סטטוס תיק"
          value={`${healthyPct}% תקין`}
          sublabel={`${faulty.length} תקולות · ${underperformers.length} בתת-ביצוע`}
          color={faulty.length + underperformers.length === 0 ? 'brand-green' : 'red'}
        />
      </div>

      {/* Health bar */}
      <div className="mt-6 card p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="font-bold text-brand-ink-900">פילוח התיק לפי ביצועים</div>
          <div className="text-sm text-brand-ink-500">{totalCount} מערכות בסך הכול</div>
        </div>
        <div className="flex h-8 w-full rounded-full overflow-hidden border border-brand-ink-100">
          {faulty.length > 0 && (
            <div className="bg-red-500 grid place-items-center text-xs font-bold text-white"
              style={{ width: `${(faulty.length / totalCount) * 100}%` }}
              title={`${faulty.length} תקלות`}
            >
              {faulty.length > 0 && (faulty.length / totalCount) > 0.05 ? `${faulty.length} תקלות` : ''}
            </div>
          )}
          {underperformers.length > 0 && (
            <div className="bg-brand-orange-400 grid place-items-center text-xs font-bold text-white"
              style={{ width: `${(underperformers.length / totalCount) * 100}%` }}
              title={`${underperformers.length} בתת-ביצוע`}
            >
              {(underperformers.length / totalCount) > 0.05 ? `${underperformers.length} תת-ביצוע` : ''}
            </div>
          )}
          <div className="bg-brand-green-500 grid place-items-center text-xs font-bold text-white"
            style={{ width: `${(healthyCount / totalCount) * 100}%` }}
            title={`${healthyCount} תקינות`}
          >
            {(healthyCount / totalCount) > 0.05 ? `${healthyCount} תקין` : ''}
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-4 text-xs text-brand-ink-700">
          <Legend color="bg-red-500" label={`${faulty.length} תקולות (ייצור ≈ 0)`} />
          <Legend color="bg-brand-orange-400" label={`${underperformers.length} תת-ביצוע (<70% מהממוצע)`} />
          <Legend color="bg-brand-green-500" label={`${healthyCount} תקינות`} />
        </div>
      </div>

      {/* Faulty + underperformers tables */}
      <div className="grid lg:grid-cols-2 gap-4 mt-6">
        {/* Faulty */}
        <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className={`card p-5 ${faulty.length === 0 ? '' : 'border-red-200'}`}
        >
          <div className="flex items-center gap-2 font-bold mb-3">
            <Wrench className={`w-5 h-5 ${faulty.length === 0 ? 'text-brand-green-600' : 'text-red-600'}`} />
            <span>מערכות תקולות</span>
            <span className={`ml-auto inline-flex items-center justify-center min-w-7 h-6 px-2 text-xs font-bold rounded-full ${faulty.length === 0 ? 'bg-brand-green-50 text-brand-green-700' : 'bg-red-100 text-red-700'}`}>{faulty.length}</span>
          </div>
          <p className="text-xs text-brand-ink-500 mb-3">מערכות עם הספק מותקן אך ייצור 0 (חשד לתקלת ממיר/חיווט/ייצור מנותק).</p>
          {faulty.length === 0 ? (
            <div className="text-sm text-brand-ink-500 italic">אין מערכות תקולות בתיק.</div>
          ) : (
            <ul className="space-y-2">
              {faulty.map((s) => (
                <li key={s.id} className="rounded-xl bg-red-50 border border-red-200 p-3 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-brand-ink-900">{s.name}</div>
                    <div className="text-xs text-brand-ink-600">הספק מותקן: {fmt.num2(s.capacity_kwp)} kWp</div>
                  </div>
                  <div className="text-left">
                    <div className="text-red-700 font-bold">0 ייצור</div>
                    <div className="text-xs text-brand-ink-500">{fmt.num(s.expected_kwh)} kWh צפוי</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </motion.div>

        {/* Underperformers */}
        <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className={`card p-5 ${underperformers.length === 0 ? '' : 'border-brand-orange-200'}`}
        >
          <div className="flex items-center gap-2 font-bold mb-3">
            <AlertTriangle className={`w-5 h-5 ${underperformers.length === 0 ? 'text-brand-green-600' : 'text-brand-orange-600'}`} />
            <span>מערכות בתת-ביצוע</span>
            <span className={`ml-auto inline-flex items-center justify-center min-w-7 h-6 px-2 text-xs font-bold rounded-full ${underperformers.length === 0 ? 'bg-brand-green-50 text-brand-green-700' : 'bg-brand-orange-100 text-brand-orange-700'}`}>{underperformers.length}</span>
          </div>
          <p className="text-xs text-brand-ink-500 mb-3">סטייה משמעותית של מעל 30% מתחת לממוצע הקבוצתי. חשד לתקלה טכנית או צורך בתחזוקה (לכלוך, הצללה, ממיר).</p>
          {underperformers.length === 0 ? (
            <div className="text-sm text-brand-ink-500 italic">כל המערכות עומדות בסף הביצוע הקבוצתי.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-xs text-brand-ink-500">
                <tr>
                  <th className="text-right pb-2">מערכת</th>
                  <th className="text-left pb-2">תפוקה</th>
                  <th className="text-left pb-2">סטייה</th>
                  <th className="text-left pb-2">פער</th>
                </tr>
              </thead>
              <tbody>
                {underperformers.map((u) => (
                  <tr key={u.id} className="border-t border-brand-orange-100">
                    <td className="py-2 font-bold text-brand-ink-900">{u.name}</td>
                    <td className="py-2 text-left tabular-nums">{fmt.num1(u.specific_yield_kwh_per_kwp)} kWh/kWp</td>
                    <td className="py-2 text-left">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-brand-orange-100 text-brand-orange-700">
                        {u.deviation_pct}%
                      </span>
                    </td>
                    <td className="py-2 text-left text-red-600 font-semibold tabular-nums">-{fmt.num(u.gap_kwh)} kWh</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-brand-orange-200 text-xs">
                  <td className="pt-2 font-bold text-brand-ink-700">סה"כ פוטנציאל אבוד</td>
                  <td colSpan={2}></td>
                  <td className="pt-2 text-left text-red-600 font-bold">~{fmt.money(data.health?.lost_revenue_nis ?? 0)}</td>
                </tr>
              </tfoot>
            </table>
          )}
        </motion.div>
      </div>

      {/* Top Performers leaderboard - dedicated card with podium */}
      {top.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="card p-5 mt-4 relative overflow-hidden"
        >
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-yellow-100 blur-3xl opacity-60" />
          <div className="relative flex items-center gap-2 font-bold mb-4 text-brand-ink-900">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span>לוח מצטיינים — חמש המערכות היעילות ביותר</span>
          </div>
          <div className="relative grid grid-cols-1 md:grid-cols-5 gap-3">
            {top.slice(0, 5).map((s, i) => {
              const medals = ['🥇', '🥈', '🥉', '4', '5'];
              const cardCls = i === 0
                ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-300'
                : i === 1
                  ? 'bg-gradient-to-br from-slate-50 to-slate-100 border-slate-300'
                  : i === 2
                    ? 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-300'
                    : 'bg-white border-brand-ink-100';
              return (
                <div key={s.id} className={`rounded-xl p-3 border ${cardCls}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{medals[i]}</span>
                    <span className="font-bold text-brand-ink-900 text-sm flex-1 truncate">{s.name}</span>
                  </div>
                  <div className="text-xs text-brand-ink-500">תפוקה</div>
                  <div className="font-extrabold text-brand-ink-900">{fmt.num1(s.specific_yield_kwh_per_kwp)}</div>
                  <div className="text-[10px] text-brand-ink-500">kWh/kWp</div>
                  <div className="mt-2 text-xs text-brand-green-700 font-bold">+{s.deviation_pct}% מהממוצע</div>
                  <div className="mt-1 text-xs text-brand-ink-600">{fmt.num(s.production_kwh)} kWh · {fmt.money(s.revenue_nis)}</div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Technical notes */}
      <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        className="card p-5 mt-6 bg-brand-ink-50/40"
      >
        <div className="flex items-center gap-2 font-bold mb-2 text-brand-ink-700">
          <Info className="w-5 h-5" />
          <span>הערות טכניות — מתודולוגיית החישוב</span>
        </div>
        <ul className="space-y-1.5 text-sm text-brand-ink-700 list-disc list-inside">
          <li><b>מדד יעילות (Specific Yield)</b>: ייצור בפועל [kWh] חלקי הספק מותקן [kWp] לכל מערכת.</li>
          <li><b>בנצ'מרק קבוצתי</b>: ממוצע משוקלל לפי הספק של כלל הצי = <b>{fmt.num1(benchmark)} kWh/kWp</b>. משמש כאמת מידה להשוואה.</li>
          <li><b>סיווג מערכות</b>: תקולה אם ייצור = 0; תת-ביצוע אם תפוקה &lt; 70% מהבנצ'מרק; מצטיינת אם תפוקה &gt; 115% מהבנצ'מרק.</li>
          <li><b>פוטנציאל אבוד</b>: עבור כל מערכת בתת-ביצוע, חישוב {`(הספק × בנצ'מרק) - ייצור בפועל`}, מוכפל בתעריף המערכת.</li>
          <li><b>מקור הנתונים</b>: גליון Info של "ייצור מערכות סולאריות" (תקופת {data.period}) — {totalCount} שורות נקראו.</li>
        </ul>
      </motion.div>
    </section>
  );
}

function KpiTile({ icon: Icon, label, value, sublabel, color }) {
  const colorMap = {
    'brand-green': 'text-brand-green-700 bg-brand-green-50 border-brand-green-100',
    'brand-orange': 'text-brand-orange-700 bg-brand-orange-50 border-brand-orange-100',
    'red': 'text-red-700 bg-red-50 border-red-200',
  };
  return (
    <div className={`card p-4 border ${colorMap[color] || colorMap['brand-green']}`}>
      <div className="flex items-center gap-2 text-xs font-bold opacity-90">
        <Icon className="w-4 h-4" />
        <span>{label}</span>
      </div>
      <div className="text-2xl font-extrabold text-brand-ink-900 mt-2">{value}</div>
      {sublabel && <div className="text-xs text-brand-ink-500 mt-0.5">{sublabel}</div>}
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-3 h-3 rounded-sm ${color}`} />
      <span>{label}</span>
    </div>
  );
}
