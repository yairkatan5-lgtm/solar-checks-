import { motion } from 'framer-motion';
import { Leaf } from 'lucide-react';
import { fmt } from '../utils/format.js';
import CountUp from './animated/CountUp.jsx';
import SmilingTree from './animated/SmilingTree.jsx';
import { Car, DrivingCarsLane } from './animated/DrivingCar.jsx';
import HappyHouse from './animated/HappyHouse.jsx';
import ChargingPhone from './animated/ChargingPhone.jsx';
import CleanFactory from './animated/CleanFactory.jsx';
import Earth from './animated/Earth.jsx';
import Confetti from './animated/Confetti.jsx';
import EditableText from '../utils/EditableText.jsx';

export default function EnvironmentalImpact({ data }) {
  const env = data?.environmental;
  if (!env) {
    return (
      <section className="max-w-7xl mx-auto px-6 lg:px-10 mt-20">
        <div className="card p-6 text-center text-sm text-brand-ink-600">
          אין נתוני השפעה סביבתית בקובץ הייצור. נסו להעלות מחדש את קובץ האקסל המלא.
        </div>
      </section>
    );
  }

  return (
    <section id="impact" className="relative mt-24 py-16 overflow-hidden">
      {/* Soft sky background */}
      <div className="absolute inset-0 -z-10 bg-green-soft" />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-brand-green-50 to-transparent -z-10" />
      <div className="absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full blob bg-brand-green-200" />
      <div className="absolute -bottom-24 -right-24 w-[420px] h-[420px] rounded-full blob bg-brand-orange-200" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="eyebrow">השפעה סביבתית</div>
          <h2 className="section-title mt-2 text-gradient-green">
            <EditableText id="impact.title" defaultVal="חסכת לכוכב יותר ממה שחשבת" />
          </h2>
          <p className="lede mt-3">
            <EditableText
              id="impact.subtitle"
              defaultVal="כל קילוואט שעה שיוצרת המערכת שלך מחליפה ייצור מתחנת כוח מזהמת. זו התרומה שלך לאוויר נקי יותר, במספרים שאפשר לראות."
            />
          </p>
        </motion.div>

        {/* Hero CO2 + Earth */}
        <div className="mt-10 grid lg:grid-cols-2 gap-6 items-center relative">
          <Confetti count={22} />

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            transition={{ duration: 0.7, type: 'spring' }}
            className="card p-8 relative overflow-hidden"
          >
            <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-brand-green-200 blur-3xl opacity-60" />
            <div className="relative flex items-center gap-2 text-brand-green-600 font-bold">
              <Leaf className="w-5 h-5" />
              סך פליטות שנמנעו
            </div>
            <div className="mt-4 flex items-baseline gap-3">
              <div className="text-7xl md:text-8xl font-extrabold leading-none text-gradient-green">
                <CountUp value={env.co2_tons_saved} decimals={1} />
              </div>
              <div className="text-2xl font-extrabold text-brand-ink-900">טון CO₂</div>
            </div>
            <div className="text-sm text-brand-ink-500 mt-2">
              <CountUp value={env.co2_kg_saved} decimals={0} /> ק&quot;ג שלא נפלטו לאוויר
            </div>
            <div className="mt-6 inline-flex items-center gap-2 text-xs bg-brand-green-50 text-brand-green-700 border border-brand-green-100 rounded-full px-3 py-1.5 font-semibold">
              מקדם פליטה רשת ישראל: {env.co2_kg_per_kwh} ק&quot;ג CO₂ ל-kWh
            </div>

            {/* CO2 cloud → leaves drift visual */}
            <div className="mt-6 relative h-20">
              {[0, 0.5, 1, 1.5, 2].map((d, i) => (
                <motion.div
                  key={i}
                  className="absolute top-2 right-2"
                  style={{ left: `${20 + i * 14}%` }}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: [0, 1, 0], y: [-5, -25, -45], x: [0, -8, -20] }}
                  viewport={{ once: false }}
                  transition={{ duration: 4.5, repeat: Infinity, delay: d, ease: 'easeOut' }}
                >
                  <svg width="50" height="30" viewBox="0 0 50 30">
                    <ellipse cx="20" cy="20" rx="14" ry="9" fill="#1f9c5a" opacity="0.7" />
                    <ellipse cx="32" cy="16" rx="11" ry="8" fill="#3fb371" opacity="0.7" />
                    <ellipse cx="40" cy="20" rx="8" ry="6" fill="#6fcb91" opacity="0.7" />
                  </svg>
                </motion.div>
              ))}
              <div className="absolute bottom-0 inset-x-0 text-center text-xs text-brand-ink-500">
                ↑ דמיון ויזואלי: ענני CO₂ מתפזרים כענני ירוק
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.85 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            transition={{ duration: 0.7, type: 'spring', bounce: 0.4 }}
            className="flex flex-col items-center justify-center relative"
          >
            <div className="absolute z-10 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full border border-brand-green-200 text-brand-green-800 font-extrabold text-sm md:text-base shadow-lg -translate-y-6 text-center shadow-green">
              <EditableText id="impact.earth_note" defaultVal="בזכותך העולם טיפה יותר נקי" /><br />
              <EditableText id="impact.earth_note_2" defaultVal="ותודה שאתה חלק מזה" />
            </div>
            <Earth size={260} />
          </motion.div>
        </div>

        {/* Trees showcase - they SMILE and bounce */}
        <ImpactBlock
          eyebrow={<>עצים בוגרים</>}
          title={<><CountUp value={env.trees_equivalent_year} /> עצים מחייכים אליך</>}
          description={<>זו כמות העצים שצריכים שנה שלמה כדי לקלוט את הפחמן שהמערכות שלך חסכו. אנחנו ציירנו לך 8 מהם — דמיין את היער המלא.</>}
          color="green"
        >
          <TreeForest />
        </ImpactBlock>

        {/* Cars driving */}
        <ImpactBlock
          eyebrow={<>מכוניות בכביש</>}
          title={<><CountUp value={env.cars_equivalent_year} decimals={1} /> מכוניות שלא זיהמו</>}
          description={<>שווה ערך לפליטת CO₂ השנתית של המכוניות האלה. הסתכל איך הן נוסעות בשקט – זה הצלחה!</>}
          color="orange"
        >
          <DrivingCarsLane count={5} height={110} />
          <div className="mt-2 text-center text-xs text-brand-ink-500">
            או: <b className="text-brand-ink-900">{fmt.num(env.km_equivalent)}</b> ק&quot;מ נסיעה — מספיק לחצות את ישראל לאורכה <b>{fmt.num1(env.km_equivalent / 480)}</b> פעמים.
          </div>
        </ImpactBlock>

        {/* Houses powered + phones charged + factory */}
        <div className="mt-10 grid md:grid-cols-3 gap-5">
          <ImpactCard color="green">
            <div className="flex justify-center"><HappyHouse size={130} /></div>
            <div className="mt-4 text-3xl font-extrabold text-brand-ink-900">
              <CountUp value={env.households_powered_month} decimals={1} />
            </div>
            <div className="text-sm font-semibold text-brand-green-700 mt-1">
              בתים מוארים בחודש
            </div>
            <div className="text-xs text-brand-ink-500 mt-2 leading-snug">
              צריכת חשמל ביתית ממוצעת: ~583 kWh/חודש. הבתים שלנו מאושרים ומוארים – בזכותך.
            </div>
          </ImpactCard>

          <ImpactCard color="orange">
            <div className="flex justify-center"><ChargingPhone size={90} /></div>
            <div className="mt-4 text-3xl font-extrabold text-brand-ink-900">
              <CountUp value={env.smartphone_charges} />
            </div>
            <div className="text-sm font-semibold text-brand-orange-600 mt-1">
              טעינות סמארטפון
            </div>
            <div className="text-xs text-brand-ink-500 mt-2 leading-snug">
              0.012 kWh לטעינה. אפשר לטעון את הסמארטפון של כל ישראל פעמיים – בערך.
            </div>
          </ImpactCard>

          <ImpactCard color="green">
            <div className="flex justify-center"><CleanFactory size={150} /></div>
            <div className="mt-4 text-3xl font-extrabold text-brand-ink-900">
              <CountUp value={env.coal_kg_saved} /> <span className="text-xl">ק&quot;ג</span>
            </div>
            <div className="text-sm font-semibold text-brand-green-700 mt-1">
              פחם שלא נשרף
            </div>
            <div className="text-xs text-brand-ink-500 mt-2 leading-snug">
              הכמות שהיתה נדרשת בתחנת כוח קונבנציונלית כדי לייצר את אותו חשמל. במקום זאת – אוויר נקי.
            </div>
          </ImpactCard>
        </div>

        {/* Footnote */}
        <p className="text-[11px] text-brand-ink-500 mt-10 text-center max-w-3xl mx-auto leading-relaxed">
          שווי-ערך מבוסס על נתוני EPA ורשות החשמל בישראל: עץ בוגר קולט כ-21 ק&quot;ג CO₂ לשנה, מכונית נוסעים ממוצעת פולטת ~4,600 ק&quot;ג CO₂ לשנה (~120 ג&apos;/ק&quot;מ), וצריכה ביתית ממוצעת ~583 kWh לחודש. מקדם פליטה רשת ישראל: 0.434 ק&quot;ג CO₂/kWh.
        </p>
      </div>
    </section>
  );
}

function TreeForest() {
  // 8 trees, slight stagger
  return (
    <div className="relative">
      {/* Ground */}
      <div className="absolute inset-x-0 bottom-2 h-2 bg-gradient-to-l from-transparent via-brand-green-200 to-transparent rounded-full" />
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 items-end">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex justify-center">
            <SmilingTree size={90} delay={i * 0.12} />
          </div>
        ))}
      </div>
      {/* clouds in background */}
      <motion.svg className="absolute top-0 left-10 opacity-60" width="80" height="40" viewBox="0 0 80 40"
        animate={{ x: [0, 40, 0] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }}>
        <path d="M20 25 a10 10 0 0 1 15 -10 a15 15 0 0 1 25 5 a10 10 0 0 1 0 20 h-40 a10 10 0 0 1 0 -15" fill="#fff" />
      </motion.svg>
      <motion.svg className="absolute top-4 right-20 opacity-40" width="100" height="50" viewBox="0 0 80 40"
        animate={{ x: [0, -30, 0] }} transition={{ duration: 35, repeat: Infinity, ease: "linear" }}>
        <path d="M20 25 a10 10 0 0 1 15 -10 a15 15 0 0 1 25 5 a10 10 0 0 1 0 20 h-40 a10 10 0 0 1 0 -15" fill="#fff" />
      </motion.svg>

      {/* sun on top right */}
      <div className="absolute -top-2 -left-2 hidden md:block">
        <motion.svg width="60" height="60" viewBox="0 0 60 60"
          animate={{ rotate: 360 }} transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}>
          <circle cx="30" cy="30" r="14" fill="#fbbf24" />
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (i * 45 * Math.PI) / 180;
            return <line key={i} x1={30 + Math.cos(a) * 18} y1={30 + Math.sin(a) * 18}
              x2={30 + Math.cos(a) * 26} y2={30 + Math.sin(a) * 26}
              stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />;
          })}
        </motion.svg>
      </div>
    </div>
  );
}

function ImpactBlock({ eyebrow, title, description, color = 'green', children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6 }}
      className={`mt-12 card p-6 md:p-8 relative overflow-hidden`}
    >
      <div className={`absolute -top-12 ${color === 'green' ? '-right-12' : '-left-12'} w-48 h-48 rounded-full ${color === 'green' ? 'bg-brand-green-100' : 'bg-brand-orange-100'} blur-3xl`} />
      <div className="relative">
        <div className={`eyebrow ${color === 'green' ? '!text-brand-green-600' : '!text-brand-orange-500'}`}>{eyebrow}</div>
        <h3 className={`mt-1 text-2xl md:text-3xl font-extrabold ${color === 'green' ? 'text-gradient-green' : 'text-gradient-orange'}`}>{title}</h3>
        <p className="lede text-sm mt-2 max-w-3xl">{description}</p>
        <div className="mt-6">{children}</div>
      </div>
    </motion.div>
  );
}

function ImpactCard({ color = 'green', children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="card lift p-6 text-center relative overflow-hidden"
    >
      <div className={`absolute inset-x-0 top-0 h-1 ${color === 'green' ? 'bg-brand-green-500' : 'bg-brand-orange-500'}`} />
      {children}
    </motion.div>
  );
}
