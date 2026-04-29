import { useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  ScatterChart, Scatter, ZAxis, ReferenceLine, Cell,
} from 'recharts';
import { fmt } from '../utils/format.js';
import EditableText from '../utils/EditableText.jsx';

export default function PerformanceCharts({ data }) {
  if (data.synthesized) return null;
  const benchmark = data.totals.group_benchmark_kwh_per_kwp ?? data.totals.expected_yield_benchmark ?? 0;
  const [sortBy, setSortBy] = useState('production');

  const sortedSystems = useMemo(() => {
    const arr = [...data.systems];
    if (sortBy === 'production') arr.sort((a, b) => b.production_kwh - a.production_kwh);
    if (sortBy === 'revenue') arr.sort((a, b) => b.revenue_nis - a.revenue_nis);
    if (sortBy === 'yield') arr.sort((a, b) => b.specific_yield_kwh_per_kwp - a.specific_yield_kwh_per_kwp);
    return arr.map((s) => ({
      name: s.name.replace('מערכת ', '#'),
      production: s.production_kwh,
      revenue: s.revenue_nis,
      yield: s.specific_yield_kwh_per_kwp,
      capacity: s.capacity_kwp,
    }));
  }, [data.systems, sortBy]);

  const scatterData = useMemo(
    () => data.systems.map((s) => ({
      name: s.name,
      x: s.capacity_kwp,
      y: s.production_kwh,
      yield: s.specific_yield_kwh_per_kwp,
      revenue: s.revenue_nis,
    })),
    [data.systems]
  );

  return (
    <section id="performance" className="max-w-7xl mx-auto px-6 lg:px-10 mt-20">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="eyebrow">ביצועי תיק הנכסים</div>
          <h2 className="section-title mt-1">ייצור, הכנסות ותפוקה לפי מערכת</h2>
          <p className="lede mt-2 max-w-2xl text-sm">
            דרגו לפי המדד הרלוונטי. הקו האדום במפת הפיזור הוא הבנצ׳מרק הקבוצתי ({fmt.num1(benchmark)} kWh/kWp).
          </p>
        </div>
        <div className="inline-flex bg-white border border-brand-ink-100 rounded-full p-1.5 shadow-soft gap-1">
          {[
            { k: 'production', label: 'ייצור' },
            { k: 'revenue', label: 'הכנסות' },
            { k: 'yield', label: 'תפוקה' },
          ].map((t) => (
            <button
              key={t.k}
              onClick={() => setSortBy(t.k)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold transition whitespace-nowrap ${
                sortBy === t.k ? 'bg-brand-green-500 text-white shadow-green' : 'text-brand-ink-700 hover:bg-brand-ink-50'
              }`}
            ><EditableText id={`perf.tab.${t.k}`}>{t.label}</EditableText></button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid xl:grid-cols-5 gap-6">
        <div className="xl:col-span-3 card p-6 overflow-visible">
          <h3 className="font-bold text-brand-ink-900">דירוג מערכות</h3>
          <p className="text-xs text-brand-ink-500 mb-4">{sortBy === 'production' ? 'kWh' : sortBy === 'revenue' ? '₪' : 'kWh/kWp'}</p>
          <div style={{ width: '100%', height: 430 }}>
            <ResponsiveContainer>
              <BarChart data={sortedSystems} margin={{ top: 18, right: 18, left: 18, bottom: 58 }}>
                <defs>
                  <linearGradient id="prodGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fb8732" />
                    <stop offset="100%" stopColor="#ec6f1c" />
                  </linearGradient>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3fb371" />
                    <stop offset="100%" stopColor="#1f9c5a" />
                  </linearGradient>
                  <linearGradient id="yieldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a78bfa" />
                    <stop offset="100%" stopColor="#7c3aed" />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#eef0f3" strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fill: '#5b6a7a', fontSize: 10 }} interval={0} angle={-45} textAnchor="end" height={74} stroke="#dde2e8" />
                <YAxis width={84} tick={{ fill: '#5b6a7a', fontSize: 11 }} tickFormatter={(v) => fmt.num(v)} stroke="#dde2e8" />
                <Tooltip
                  formatter={(value, name) => {
                    if (name === 'production') return [`${fmt.num(value)} kWh`, 'ייצור'];
                    if (name === 'revenue') return [fmt.money(value), 'הכנסה'];
                    if (name === 'yield') return [`${fmt.num1(value)} kWh/kWp`, 'תפוקה ספציפית'];
                    return value;
                  }}
                  labelFormatter={(l) => `מערכת ${l.replace('#', '')}`}
                />
                {sortBy === 'yield' && <ReferenceLine y={benchmark} stroke="#ef4444" strokeDasharray="6 4" label={{ value: `בנצ'מרק ${benchmark}`, fill: '#ef4444', fontSize: 11 }} />}
                <Bar dataKey={sortBy} radius={[8, 8, 0, 0]}>
                  {sortedSystems.map((entry, idx) => {
                    if (idx === 0) return <Cell key={idx} fill="#eab308" />;
                    if (sortBy === 'yield') {
                      return <Cell key={idx} fill={entry.yield < benchmark * 0.5 ? '#ef4444' : entry.yield < benchmark * 0.9 ? '#fb8732' : 'url(#yieldGrad)'} />;
                    }
                    return <Cell key={idx} fill={sortBy === 'production' ? 'url(#prodGrad)' : 'url(#revGrad)'} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="xl:col-span-2 card p-6 overflow-visible">
          <h3 className="font-bold text-brand-ink-900"><EditableText id="perf.chart.scatter.title">קשר הספק ↔ ייצור</EditableText></h3>
          <p className="text-xs text-brand-ink-500 mb-4">
            כל נקודה היא מערכת. הקו האדום הוא הבנצ׳מרק הקבוצתי ({fmt.num1(benchmark)} kWh/kWp).
          </p>
          <div style={{ width: '100%', height: 430 }}>
            <ResponsiveContainer>
              <ScatterChart margin={{ top: 18, right: 28, left: 24, bottom: 30 }}>
                <CartesianGrid stroke="#eef0f3" strokeDasharray="3 3" />
                <XAxis type="number" dataKey="x" name="הספק" unit=" kWp" tick={{ fill: '#5b6a7a', fontSize: 11 }} stroke="#dde2e8" height={44} />
                <YAxis type="number" dataKey="y" name="ייצור" unit=" kWh" width={82} tick={{ fill: '#5b6a7a', fontSize: 11 }} tickFormatter={(v) => fmt.num(v)} stroke="#dde2e8" />
                <ZAxis range={[60, 60]} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="recharts-default-tooltip rounded-xl px-3 py-2 text-sm">
                        <div className="font-bold text-brand-green-600">{d.name}</div>
                        <div>הספק: {fmt.num2(d.x)} kWp</div>
                        <div>ייצור: {fmt.num(d.y)} kWh</div>
                        <div>תפוקה: {fmt.num1(d.yield)} kWh/kWp</div>
                        <div>הכנסה: {fmt.money(d.revenue)}</div>
                      </div>
                    );
                  }}
                />
                <ReferenceLine
                  segment={[{ x: 0, y: 0 }, { x: 280, y: 280 * benchmark }]}
                  stroke="#ef4444"
                  strokeDasharray="6 4"
                />
                <Scatter data={scatterData}>
                  {scatterData.map((d, idx) => (
                    <Cell key={idx} fill={d.yield < benchmark * 0.5 ? '#ef4444' : d.yield < benchmark * 0.9 ? '#fb8732' : '#1f9c5a'} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-brand-ink-500">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-brand-green-500" /> תקין</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-brand-orange-500" /> מתחת לבנצ&apos;מרק</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> דורש טיפול דחוף</span>
          </div>
        </div>
      </div>
    </section>
  );
}
