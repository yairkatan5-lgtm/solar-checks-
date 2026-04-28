import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { TrendingUp, Coins, Sun, ArrowUpFromLine, ArrowDownToLine } from 'lucide-react';
import { fmt } from '../utils/format.js';

export default function PeriodSummarySection({ summary }) {
  if (!summary?.periods?.length) return null;
  const t = summary.totals;

  const data = summary.periods.map((p) => ({
    label: shortLabel(p),
    production: p.production_kwh,
    export: p.export_kwh,
    self: p.self_consumption_kwh,
    profit: p.net_solar_profit_nis,
  }));

  return (
    <section id="periods" className="max-w-7xl mx-auto px-6 lg:px-10 mt-14 md:mt-20">
      <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="eyebrow">סיכום סולארי</div>
          <h2 className="section-title">לאורך זמן</h2>
          <p className="lede mt-1">
            {summary.periods.length} תקופות נטענו · רווח סולארי נטו מצטבר:&nbsp;
            <span className="font-extrabold text-brand-green-600">{fmt.money(t.net_solar_profit_nis)}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Stat icon={Sun} label="סה״כ ייצור" value={fmt.kwh(t.production_kwh)} bg="bg-brand-orange-100 text-brand-orange-600" />
        <Stat icon={ArrowDownToLine} label="צריכה עצמית" value={fmt.kwh(t.self_consumption_kwh)} bg="bg-brand-green-100 text-brand-green-600" />
        <Stat icon={ArrowUpFromLine} label="הזרמה לרשת" value={fmt.kwh(t.export_kwh)} bg="bg-sky-100 text-sky-600" />
        <Stat icon={Coins} label="רווח נטו מצטבר" value={fmt.money(t.net_solar_profit_nis)} bg="bg-fuchsia-100 text-fuchsia-600" />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="card p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-brand-green-600" />
            <h3 className="font-extrabold text-brand-ink-900">ייצור · צריכה עצמית · הזרמה (kWh)</h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef0f3" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => fmt.num(v)} />
                <Tooltip formatter={(v) => fmt.num(v)} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="self" name="צריכה עצמית" stackId="a" fill="#1f9c5a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="export" name="הזרמה לרשת" stackId="a" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="card p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <Coins className="w-4 h-4 text-brand-orange-500" />
            <h3 className="font-extrabold text-brand-ink-900">רווח סולארי נטו (₪) לאורך הזמן</h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef0f3" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => '₪' + fmt.num(v)} />
                <Tooltip formatter={(v) => fmt.money2(v)} />
                <Line type="monotone" dataKey="profit" name="רווח נטו" stroke="#ec6f1c" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Detailed table */}
      <div className="card mt-5 p-5 overflow-x-auto">
        <h3 className="font-extrabold text-brand-ink-900 mb-3">פירוט תקופות</h3>
        <table className="w-full text-sm tabular-nums">
          <thead>
            <tr className="text-xs text-brand-ink-500 border-b border-brand-ink-100">
              <th className="text-right py-2 pe-3 font-bold">תקופה</th>
              <th className="text-right py-2 px-3 font-bold">ייצור (kWh)</th>
              <th className="text-right py-2 px-3 font-bold">ערך ייצור</th>
              <th className="text-right py-2 px-3 font-bold">הזרמה (kWh)</th>
              <th className="text-right py-2 px-3 font-bold">צריכה עצמית (kWh)</th>
              <th className="text-right py-2 px-3 font-bold">דמי הגנה</th>
              <th className="text-right py-2 px-3 font-bold">רווח נטו</th>
            </tr>
          </thead>
          <tbody>
            {summary.periods.map((p, i) => (
              <tr key={i} className="border-b border-brand-ink-100/60">
                <td className="py-2.5 pe-3 font-bold text-brand-ink-900">{p.range}</td>
                <td className="py-2.5 px-3">{fmt.num(p.production_kwh)}</td>
                <td className="py-2.5 px-3">{fmt.money2(p.production_value_nis)}</td>
                <td className="py-2.5 px-3">{fmt.num(p.export_kwh)}</td>
                <td className="py-2.5 px-3">{fmt.num(p.self_consumption_kwh)}</td>
                <td className="py-2.5 px-3">{fmt.money2(p.protection_fee_nis)}</td>
                <td className="py-2.5 px-3 font-extrabold text-brand-green-600">{fmt.money2(p.net_solar_profit_nis)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function shortLabel(p) {
  if (p.start) {
    const [y, m] = p.start.split('-');
    const months = ['', 'ינו', 'פבר', 'מרץ', 'אפר', 'מאי', 'יונ', 'יול', 'אוג', 'ספט', 'אוק', 'נוב', 'דצמ'];
    return `${months[parseInt(m, 10)]} ${y.slice(-2)}`;
  }
  return p.range;
}

function Stat({ icon: Icon, label, value, bg }) {
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
