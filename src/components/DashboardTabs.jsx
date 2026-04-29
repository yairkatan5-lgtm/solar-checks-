export const TAB_IDS = {
  summary: 'summary',
  performance: 'performance',
  health: 'health',
  environment: 'environment',
  systems: 'systems',
};

export default function DashboardTabs({ activeTab, onTabChange, hasPeriodView, hasSolar, isSynthesized }) {
  const items = [
    { id: TAB_IDS.performance, label: 'ביצועים', show: hasSolar },
    { id: TAB_IDS.summary, label: 'סיכום ותקופות', show: hasPeriodView },
    { id: TAB_IDS.health, label: 'בריאות תיק', show: hasSolar && !isSynthesized },
    { id: TAB_IDS.environment, label: 'השפעה סביבתית', show: hasSolar },
    { id: TAB_IDS.systems, label: 'מערכות', show: hasSolar && !isSynthesized },
  ].filter((x) => x.show);

  if (items.length <= 1) return null;

  return (
    <div className="sticky top-16 z-20 bg-white/95 backdrop-blur border-b border-brand-ink-100 shadow-sm mb-8">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-4">
        <div className="flex flex-wrap gap-3 justify-start" role="tablist" aria-label="אזורי דשבורד">
          {items.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={activeTab === t.id}
              onClick={() => onTabChange(t.id)}
              className={`text-sm font-extrabold rounded-full px-5 py-2.5 transition border whitespace-nowrap ${
                activeTab === t.id
                  ? 'bg-brand-green-500 text-white border-brand-green-500 shadow-green'
                  : 'bg-white text-brand-ink-700 border-brand-ink-200 hover:border-brand-green-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
