import { Calendar, Menu, Linkedin, UploadCloud, LogIn, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import Logo from './Logo.jsx';
import { periodHebrew } from '../utils/format.js';
import AccountMenu from '../account/AccountMenu.jsx';
import { useAccount } from '../account/AccountContext.jsx';
import { TAB_IDS } from './DashboardTabs.jsx';
import EditableText from '../utils/EditableText.jsx';
import { useAdmin } from '../admin/AdminContext.jsx';

export default function Header({
  period,
  isGuest,
  hasPeriodData,
  hasSolarData,
  activeTab,
  onTabChange,
  onUpload,
  onExitGuest,
}) {
  const { currentUser } = useAccount();
  const { isAdmin, loginAdmin, logoutAdmin } = useAdmin();
  const showHero = !!period;

  const goTab = (id) => {
    onTabChange?.(id);
    requestAnimationFrame(() => {
      document.getElementById('dashboard-panels')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  return (
    <>
      <div className="bg-white/95 backdrop-blur sticky top-0 z-30 border-b border-brand-ink-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between gap-3">
          <Logo />
          <nav className="hidden md:flex items-center gap-2 text-sm font-semibold text-brand-ink-700">
            {hasSolarData && (
              <button
                type="button"
                onClick={() => goTab(TAB_IDS.performance)}
                className={`px-3 py-1.5 rounded-full transition ${activeTab === TAB_IDS.performance ? 'bg-brand-green-100 text-brand-green-800' : 'hover:text-brand-green-600'}`}
              >
                ביצועים
              </button>
            )}
            {hasPeriodData && (
              <button
                type="button"
                onClick={() => goTab(TAB_IDS.summary)}
                className={`px-3 py-1.5 rounded-full transition ${activeTab === TAB_IDS.summary ? 'bg-brand-green-100 text-brand-green-800' : 'hover:text-brand-green-600'}`}
              >
                סיכום סולארי
              </button>
            )}
            {hasSolarData && (
              <button
                type="button"
                onClick={() => goTab(TAB_IDS.health)}
                className={`px-3 py-1.5 rounded-full transition ${activeTab === TAB_IDS.health ? 'bg-brand-green-100 text-brand-green-800' : 'hover:text-brand-green-600'}`}
              >
                בריאות תיק
              </button>
            )}
            {hasSolarData && (
              <button
                type="button"
                onClick={() => goTab(TAB_IDS.environment)}
                className={`px-3 py-1.5 rounded-full transition ${activeTab === TAB_IDS.environment ? 'bg-brand-green-100 text-brand-green-800' : 'hover:text-brand-green-600'}`}
              >
                השפעה סביבתית
              </button>
            )}
            {hasSolarData && (
              <button
                type="button"
                onClick={() => goTab(TAB_IDS.systems)}
                className={`px-3 py-1.5 rounded-full transition ${activeTab === TAB_IDS.systems ? 'bg-brand-green-100 text-brand-green-800' : 'hover:text-brand-green-600'}`}
              >
                מערכות
              </button>
            )}
          </nav>

          <div className="flex items-center gap-2">
            {period && (
              <span className="hidden md:inline-flex items-center gap-2 text-xs bg-brand-green-50 text-brand-green-700 border border-brand-green-100 rounded-full px-3 py-1.5 font-semibold">
                <Calendar className="w-3.5 h-3.5" />
                {periodHebrew(period)}
              </span>
            )}

            {!isGuest && (
              <button
                type="button"
                onClick={onUpload}
                title="העלאת קבצים"
                className="hidden md:inline-flex items-center gap-1.5 text-xs font-bold text-white bg-gradient-to-b from-brand-orange-400 to-brand-orange-500 hover:from-brand-orange-500 hover:to-brand-orange-600 transition rounded-full px-3 py-1.5"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                העלאה
              </button>
            )}

            {isGuest ? (
              <button
                type="button"
                onClick={onExitGuest}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-ink-700 hover:text-brand-green-700 bg-brand-ink-100 hover:bg-brand-green-50 rounded-full px-3 py-1.5 transition"
              >
                <LogIn className="w-3.5 h-3.5" />
                התחברות / הרשמה
              </button>
            ) : (
              <AccountMenu onUpload={onUpload} />
            )}

            <a href="#" className="hidden md:inline-grid place-items-center w-9 h-9 rounded-full bg-brand-ink-100 text-brand-ink-700 hover:bg-brand-ink-200 transition" aria-label="Linkedin">
              <Linkedin className="w-4 h-4" />
            </a>
            <button
              type="button"
              onClick={() => {
                if (isAdmin) {
                  logoutAdmin();
                  return;
                }
                const code = window.prompt('קוד כניסה למצב אדמין');
                if (code == null) return;
                if (!loginAdmin(code)) window.alert('קוד שגוי');
              }}
              className={`hidden md:inline-grid place-items-center w-9 h-9 rounded-full transition ${
                isAdmin
                  ? 'bg-brand-green-500 text-white shadow-green'
                  : 'bg-brand-ink-100 text-brand-ink-700 hover:bg-brand-ink-200'
              }`}
              aria-label={isAdmin ? 'יציאה ממצב אדמין' : 'כניסה למצב אדמין'}
              title={isAdmin ? 'יציאה ממצב אדמין' : 'מצב אדמין'}
            >
              <ShieldCheck className="w-4 h-4" />
            </button>
            <button type="button" className="md:hidden p-2 rounded-lg bg-brand-green-50 text-brand-green-700"><Menu className="w-5 h-5" /></button>
          </div>
        </div>

        {isGuest && (
          <div className="bg-brand-orange-50 border-t border-brand-orange-100 text-center text-xs py-1.5 text-brand-orange-700 font-semibold">
            מצב דמו — מציג נתוני דוגמה. לחיצה על &quot;התחברות&quot; תפתח חשבון אישי לטעינת הקבצים שלך.
          </div>
        )}
      </div>

      {showHero && (
        <section className="relative overflow-hidden bg-hero-light">
          <div className="absolute -top-32 -left-32 w-[460px] h-[460px] rounded-full blob bg-brand-orange-300" />
          <div className="absolute -bottom-32 -right-32 w-[460px] h-[460px] rounded-full blob bg-brand-green-300" />

          <div className="relative max-w-7xl mx-auto px-6 lg:px-10 py-8 md:py-12 grid md:grid-cols-12 gap-6 md:gap-8 items-center">
            <div className="md:col-span-7">
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
                <div className="eyebrow mb-2">דשבורד נכסים סולאריים · סיכום ותקופות</div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.05 }}
                className="text-3xl md:text-5xl font-extrabold leading-[1.15] tracking-tight"
              >
                {currentUser && !isGuest ? (
                  <>
                    <span className="text-gradient-green block">שלום {currentUser.name}</span>
                    <span className="text-brand-ink-900 block mt-1">
                      <EditableText id="hero_subtitle" defaultVal="הנתונים שלך, מאורגנים" />
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-gradient-green block">מובילים את הפרויקטים שלך</span>
                    <span className="text-brand-ink-900 block">משלב התכנון ולאורך כל חיי המערכת</span>
                  </>
                )}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.1 }}
                className="lede mt-3 max-w-2xl text-sm md:text-base"
              >
                סיכום סולארי, חשבונות חשמל וייצור מערכות — במקום אחד, מעובד מקומית בדפדפן.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.15 }}
                className="mt-5 flex flex-wrap gap-2"
              >
                {hasPeriodData && (
                  <button type="button" onClick={() => goTab(TAB_IDS.summary)} className="btn-pill btn-orange text-sm">
                    לסיכום הסולארי
                  </button>
                )}
                {hasSolarData && (
                  <button type="button" onClick={() => goTab(TAB_IDS.performance)} className="btn-pill btn-ghost text-sm">
                    ביצועי ייצור
                  </button>
                )}
                {!isGuest && (
                  <button type="button" onClick={onUpload} className="btn-pill btn-green text-sm">
                    <UploadCloud className="w-4 h-4" />
                    העלאה
                  </button>
                )}
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.1, type: 'spring' }}
              className="md:col-span-5 hidden md:flex justify-center"
            >
              <SunArt />
            </motion.div>
          </div>
        </section>
      )}
    </>
  );
}

function SunArt() {
  return (
    <div className="relative">
      <div className="absolute inset-0 -z-10 rounded-full blob bg-brand-orange-300 scale-110" />
      <svg width="220" height="220" viewBox="0 0 280 280">
        <defs>
          <radialGradient id="sun" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fde68a" />
            <stop offset="55%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#ec6f1c" />
          </radialGradient>
        </defs>
        <circle cx="140" cy="140" r="62" fill="url(#sun)" />
        <g className="origin-center" style={{ transformOrigin: '140px 140px' }}>
          <g>
            {Array.from({ length: 12 }).map((_, i) => {
              const a = (i * 30 * Math.PI) / 180;
              const x1 = 140 + Math.cos(a) * 84;
              const y1 = 140 + Math.sin(a) * 84;
              const x2 = 140 + Math.cos(a) * 110;
              const y2 = 140 + Math.sin(a) * 110;
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fbbf24" strokeWidth="6" strokeLinecap="round" />;
            })}
          </g>
        </g>
        <g transform="translate(70 192) skewX(-18)">
          <rect width="140" height="56" rx="3" fill="#1e3a8a" />
          <g stroke="rgba(255,255,255,0.25)" strokeWidth="1">
            <line x1="0" y1="14" x2="140" y2="14" />
            <line x1="0" y1="28" x2="140" y2="28" />
            <line x1="0" y1="42" x2="140" y2="42" />
            <line x1="35" y1="0" x2="35" y2="56" />
            <line x1="70" y1="0" x2="70" y2="56" />
            <line x1="105" y1="0" x2="105" y2="56" />
          </g>
        </g>
        <g>
          <path d="M50 60 q12 -22 32 -10 q-6 22 -32 10 z" fill="#1f9c5a">
            <animateTransform attributeName="transform" type="translate" values="0,0;6,-6;0,0" dur="4s" repeatCount="indefinite" />
          </path>
        </g>
      </svg>
    </div>
  );
}
