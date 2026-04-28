export default function Logo({ size = 44, withText = true, className = '' }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <SwooshMark size={size} />
      {withText && (
        <div className="leading-tight">
          <div className="font-extrabold text-[#00A651] text-lg tracking-tight">אנרגיה ירוקה</div>
          <div className="text-[10px] tracking-[0.25em] uppercase text-brand-ink-400">דשבורד סולארי</div>
        </div>
      )}
    </div>
  );
}

export function SwooshMark({ size = 44 }) {
  const w = size;
  const h = size * 0.95;
  return (
    <svg width={w} height={h} viewBox="0 0 64 60" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* שלוש קשתות נפרדות — צהוב, כתום, ירוק (ללא נקודת שמש במרכז) */}
      <path
        d="M6 38 A26 26 0 0 1 58 38"
        fill="none"
        stroke="#FDB913"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M14 40 A18 18 0 0 1 50 40"
        fill="none"
        stroke="#F15A24"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M22 42 A10 10 0 0 1 42 42"
        fill="none"
        stroke="#00A651"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}
