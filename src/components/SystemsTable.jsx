import { useMemo, useState } from 'react';
import { ArrowDownAZ, ArrowDownUp, Search, Download } from 'lucide-react';
import { fmt } from '../utils/format.js';
import EditableText from '../utils/EditableText.jsx';

const COLS = [
  { key: 'name', label: 'מערכת', align: 'right' },
  { key: 'capacity_kwp', label: 'הספק (kWp)', align: 'left', format: (v) => fmt.num2(v) },
  { key: 'production_kwh', label: 'ייצור (kWh)', align: 'left', format: (v) => fmt.num(v) },
  { key: 'tariff_nis_per_kwh', label: 'תעריף (₪/kWh)', align: 'left', format: (v) => `₪${v}` },
  { key: 'revenue_nis', label: 'הכנסה (₪)', align: 'left', format: (v) => fmt.money(v) },
  { key: 'specific_yield_kwh_per_kwp', label: 'תפוקה (kWh/kWp)', align: 'left', format: (v) => fmt.num1(v) },
];

export default function SystemsTable({ data }) {
  if (data.synthesized) return null;
  const [q, setQ] = useState('');
  const [sortKey, setSortKey] = useState('production_kwh');
  const [dir, setDir] = useState('desc');

  const filtered = useMemo(() => {
    const filtered = data.systems.filter((s) =>
      !q || s.name.includes(q) || String(s.id) === q.replace(/[^0-9]/g, '')
    );
    const sorted = [...filtered].sort((a, b) => {
      const va = a[sortKey];
      const vb = b[sortKey];
      const cmp = typeof va === 'number' ? va - vb : String(va).localeCompare(String(vb), 'he');
      return dir === 'asc' ? cmp : -cmp;
    });
    return sorted;
  }, [data.systems, q, sortKey, dir]);

  const benchmark = data.totals.group_benchmark_kwh_per_kwp ?? data.totals.expected_yield_benchmark ?? 0;

  const exportCsv = () => {
    const headers = ['system', 'capacity_kwp', 'production_kwh', 'tariff_nis_per_kwh', 'revenue_nis', 'specific_yield_kwh_per_kwp'];
    const rows = data.systems.map((s) => [s.name, s.capacity_kwp, s.production_kwh, s.tariff_nis_per_kwh, s.revenue_nis, s.specific_yield_kwh_per_kwp]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `solar-report-${data.period.replace('/', '-')}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <section id="systems" className="max-w-7xl mx-auto px-6 lg:px-10 mt-20">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="eyebrow">פירוט מערכות</div>
          <h2 className="section-title mt-1">דוח מלא לכל הנכסים</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-white border border-brand-ink-100 rounded-full px-3 py-2 flex items-center gap-2 shadow-soft">
            <Search className="w-4 h-4 text-brand-ink-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="חפש מערכת..."
              className="bg-transparent outline-none text-sm w-40 placeholder:text-brand-ink-300"
            />
          </div>
          <button onClick={exportCsv} className="btn-pill btn-ghost text-sm">
            <Download className="w-4 h-4" />
            ייצוא CSV
          </button>
        </div>
      </div>

      <div className="mt-6 card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] text-sm tabular-nums">
            <thead className="bg-brand-ink-50 text-brand-ink-700">
              <tr>
                {COLS.map((c) => (
                  <th
                    key={c.key}
                    className={`px-5 py-4 font-bold cursor-pointer select-none whitespace-nowrap ${c.align === 'left' ? 'text-left' : 'text-right'}`}
                    onClick={() => {
                      if (sortKey === c.key) setDir(dir === 'asc' ? 'desc' : 'asc');
                      else { setSortKey(c.key); setDir('desc'); }
                    }}
                  >
                    <span className="inline-flex items-center gap-1">
                      {c.label}
                      {sortKey === c.key ? <ArrowDownAZ className="w-3.5 h-3.5" /> : <ArrowDownUp className="w-3.5 h-3.5 opacity-40" />}
                    </span>
                  </th>
                ))}
                <th className="px-4 py-3 text-left font-bold">סטטוס</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => {
                const status = s.status === 'faulty' || s.specific_yield_kwh_per_kwp <= 0
                  ? { l: 'תקלה - אפס ייצור', c: 'text-red-700 bg-red-50 ring-1 ring-red-200' }
                  : s.status === 'underperforming' || s.specific_yield_kwh_per_kwp < benchmark * 0.7
                    ? { l: `תת-ביצוע (${s.deviation_pct ?? '?'}%)`, c: 'text-brand-orange-700 bg-brand-orange-50 ring-1 ring-brand-orange-200' }
                    : s.status === 'top'
                      ? { l: `מצטיינת (+${s.deviation_pct ?? '?'}%)`, c: 'text-brand-green-700 bg-brand-green-50 ring-1 ring-brand-green-200' }
                      : { l: 'תקין', c: 'text-brand-ink-700 bg-brand-ink-50 ring-1 ring-brand-ink-100' };
                return (
                  <tr key={s.id} className={`border-t border-brand-ink-100 hover:bg-brand-ink-50/60 ${i % 2 === 0 ? 'bg-white' : 'bg-brand-ink-50/30'}`}>
                    {COLS.map((c) => (
                      <td key={c.key} className={`px-5 py-4 whitespace-nowrap ${c.align === 'left' ? 'text-left tabular-nums text-brand-ink-900' : 'text-right font-semibold text-brand-ink-900'}`}>
                        {c.key === 'name' ? (
                          <EditableText id={`sys.${s.id}.name`}>{s.name}</EditableText>
                        ) : (
                          c.format ? c.format(s[c.key]) : s[c.key]
                        )}
                      </td>
                    ))}
                    <td className="px-5 py-4 text-left whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold ${status.c}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {status.l}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={COLS.length + 1} className="text-center py-8 text-brand-ink-500">לא נמצאו מערכות</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
