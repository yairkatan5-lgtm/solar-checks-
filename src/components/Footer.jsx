import Logo from './Logo.jsx';

export default function Footer({ period, generatedAt }) {
  return (
    <footer className="mt-20 bg-white border-t border-brand-ink-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10 grid md:grid-cols-3 gap-6 items-center">
        <Logo />
        <div className="text-center text-xs text-brand-ink-500">
          תקופה: <b className="text-brand-ink-900">{period}</b> · עודכן: {new Date(generatedAt).toLocaleString('he-IL')}
        </div>
        <div className="text-left text-xs text-brand-ink-500">
          המידע לצרכי הצגה בלבד. מקדם פליטה: רשות החשמל בישראל. שווי-ערך: EPA.
        </div>
      </div>
      <div className="bg-brand-ink-50 border-t border-brand-ink-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-3 text-center text-[11px] text-brand-ink-500">
          © {new Date().getFullYear()} דשבורד סולארי · בהשראת אנרגיה ירוקה
        </div>
      </div>
    </footer>
  );
}
