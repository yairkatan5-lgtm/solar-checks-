export default function PeriodFilterBar({ unified, selection, onChange }) {
  if (!unified?.periods?.length) return null;
  const ranges = unified.periods.map((it) => it.period.range);
  const allMode = selection === 'all';

  return (
    <div className="flex flex-wrap gap-3 items-start md:items-center">
      <span className="text-sm font-extrabold text-brand-ink-700 shrink-0">תקופות:</span>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChange('all')}
          className={`text-xs font-bold rounded-full px-3 py-1.5 border transition ${
            allMode
              ? 'bg-brand-green-500 text-white border-brand-green-500'
              : 'bg-white text-brand-ink-700 border-brand-ink-200 hover:border-brand-green-300'
          }`}
        >
          כל התקופות
        </button>
        {ranges.map((r) => {
          const inSet = selection instanceof Set && selection.has(r);
          const checked = allMode || inSet;
          return (
            <label
              key={r}
              className={`inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1.5 border cursor-pointer select-none ${
                checked ? 'bg-brand-ink-50 border-brand-ink-200' : 'bg-white border-brand-ink-100 opacity-70'
              }`}
            >
              <input
                type="checkbox"
                className="rounded border-brand-ink-300 text-brand-green-600 focus:ring-brand-green-500"
                checked={checked}
                onChange={() => {
                  if (allMode) {
                    if (ranges.length <= 1) return;
                    onChange(new Set(ranges.filter((x) => x !== r)));
                    return;
                  }
                  const s = new Set(selection);
                  if (s.has(r)) s.delete(r);
                  else s.add(r);
                  if (s.size === 0 || s.size === ranges.length) onChange('all');
                  else onChange(s);
                }}
              />
              <span className="max-w-[200px] truncate" title={r}>{r}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
