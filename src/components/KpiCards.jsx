import { Zap, Banknote, Gauge, LayoutGrid } from 'lucide-react';
import { motion } from 'framer-motion';
import CountUp from './animated/CountUp.jsx';

const cards = [
  {
    key: 'systems',
    title: 'מערכות פעילות',
    sub: 'מספר נכסים מנוטרים',
    icon: LayoutGrid,
    accent: 'from-sky-400 to-cyan-500',
    iconBg: 'bg-sky-100 text-sky-600',
  },
  {
    key: 'production',
    title: 'ייצור חודשי',
    sub: 'סך אנרגיה שנוצרה',
    icon: Zap,
    accent: 'from-brand-orange-400 to-brand-orange-600',
    iconBg: 'bg-brand-orange-100 text-brand-orange-600',
  },
  {
    key: 'revenue',
    title: 'הכנסות חודשיות',
    sub: 'בש"ח, לפני מע"מ',
    icon: Banknote,
    accent: 'from-brand-green-400 to-brand-green-600',
    iconBg: 'bg-brand-green-100 text-brand-green-600',
  },
  {
    key: 'yield',
    title: 'תפוקה ספציפית',
    sub: 'kWh / kWp ממוצע',
    icon: Gauge,
    accent: 'from-violet-400 to-fuchsia-500',
    iconBg: 'bg-fuchsia-100 text-fuchsia-600',
  },
];

export default function KpiCards({ data }) {
  const t = data.totals;
  const sysCount = t.systems_count > 0 ? t.systems_count : 1;

  const values = {
    systems: { value: t.systems_count, decimals: 0, prefix: '', suffix: '', tag: <>הספק כולל: <CountUp value={t.total_capacity_kwp} decimals={2} /> kWp</> },
    production: { value: t.total_production_kwh, decimals: 0, prefix: '', suffix: ' kWh', tag: <>ממוצע למערכת: <CountUp value={t.total_production_kwh / sysCount} decimals={0} /> kWh</> },
    revenue: { value: t.total_revenue_nis, decimals: 0, prefix: '₪', suffix: '', tag: <>תעריף ממוצע: {t.weighted_avg_tariff_nis_per_kwh} ₪/kWh</> },
    yield: { value: t.avg_specific_yield_kwh_per_kwp, decimals: 1, prefix: '', suffix: ' kWh/kWp', tag: <>בנצ'מרק קבוצתי: {t.group_benchmark_kwh_per_kwp ?? t.expected_yield_benchmark ?? 0} kWh/kWp</> },
  };

  return (
    <section className="relative -mt-8 max-w-7xl mx-auto px-6 lg:px-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => {
          const Icon = c.icon;
          const v = values[c.key];
          return (
            <motion.div
              key={c.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="card lift p-5 relative overflow-hidden"
            >
              <div className={`absolute -top-8 -left-8 w-24 h-24 rounded-full bg-gradient-to-br ${c.accent} opacity-15`} />
              <div className="flex items-center justify-between relative">
                <div className={`w-11 h-11 rounded-xl ${c.iconBg} grid place-items-center`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold tracking-widest text-brand-ink-300 uppercase">KPI</span>
              </div>
              <div className="mt-4 text-sm text-brand-ink-500 font-semibold">
                {c.title}
              </div>
              <div className="mt-1 text-3xl md:text-4xl font-extrabold text-brand-ink-900 leading-tight">
                <CountUp value={v.value} decimals={v.decimals} prefix={v.prefix} suffix={v.suffix} />
              </div>
              <div className="mt-1 text-xs text-brand-ink-500">{v.tag}</div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
