import { motion } from 'framer-motion';
import { useState } from 'react';
import { UploadCloud, FileSpreadsheet, FileText, Sparkles, GraduationCap, Loader2 } from 'lucide-react';
import { useAccount } from '../account/AccountContext.jsx';
import { loadHomeworkData } from './demoSeed.js';

export default function EmptyState({ onUpload }) {
  const { currentUser, replaceAllData } = useAccount();
  const [seeding, setSeeding] = useState(false);
  const [progress, setProgress] = useState([]);

  const seedDemo = async () => {
    setSeeding(true);
    setProgress([]);
    try {
      const data = await loadHomeworkData((p) => setProgress((arr) => [...arr, p]));
      replaceAllData(data);
    } catch (err) {
      console.error(err);
      alert('שגיאה בטעינת נתוני המבחן: ' + err.message);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <section className="max-w-5xl mx-auto px-6 lg:px-10 pt-10 md:pt-16 pb-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="card-soft p-8 md:p-12 text-center relative overflow-hidden"
      >
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full blob bg-brand-orange-300" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full blob bg-brand-green-300" />

        <div className="relative">
          <div className="eyebrow mb-2">בואו נתחיל</div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            שלום {currentUser?.name || ''} 👋
          </h2>
          <p className="lede mt-3 max-w-xl mx-auto">
            כדי שהדשבורד יציג את הנתונים שלך, העלה את הקבצים שלך —
            הכל מעובד מקומית בדפדפן ולא נשלח לשום שרת.
          </p>

          <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
            <button
              onClick={onUpload}
              disabled={seeding}
              className="btn-pill btn-orange inline-flex"
            >
              <UploadCloud className="w-5 h-5" />
              העלה קבצים
            </button>

            <button
              onClick={seedDemo}
              disabled={seeding}
              className="btn-pill btn-green inline-flex disabled:opacity-50"
            >
              {seeding ? <Loader2 className="w-5 h-5 animate-spin" /> : <GraduationCap className="w-5 h-5" />}
              {seeding ? 'טוען...' : 'טעינת נתוני מבחן הבית'}
            </button>
          </div>

          {seeding && progress.length > 0 && (
            <div className="mt-4 max-w-md mx-auto text-right text-xs space-y-1">
              {progress.map((p, i) => (
                <div key={i} className="flex items-center justify-between bg-white/80 backdrop-blur rounded-lg px-3 py-1.5 border border-brand-ink-100">
                  <span className="truncate">{p.name}</span>
                  <span className={
                    p.status === 'parsed' ? 'text-brand-green-600 font-bold' :
                    p.status === 'error' ? 'text-red-600 font-bold' :
                    'text-brand-ink-500'
                  }>
                    {p.status === 'parsed' ? '✓ ' + (p.kind === 'production' ? 'ייצור' : p.kind === 'summary' ? 'סיכום' : p.kind === 'bill' ? 'חשבון' : '') :
                     p.status === 'loading' ? '...' :
                     p.status === 'error' ? '⛔ ' + (p.error || '') : p.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-10 grid md:grid-cols-3 gap-4 text-right">
            <FeatureCard
              icon={FileSpreadsheet}
              title="קובץ ייצור מערכות"
              desc="טבלת הספק / ייצור / תעריף לכל מערכת. מציג בנצ'מרק קבוצתי, זיהוי תקלות ומצטיינים."
              bg="bg-sky-100 text-sky-600"
            />
            <FeatureCard
              icon={Sparkles}
              title="סיכום סולארי"
              desc="פירוט תקופתי של ייצור, הזרמה לרשת, צריכה עצמית, ורווח נטו לאורך זמן."
              bg="bg-brand-green-100 text-brand-green-600"
            />
            <FeatureCard
              icon={FileText}
              title="חשבונות חשמל (PDF, אופציונלי)"
              desc="אפשר להעלות PDF של חברת החשמל לצד קובץ הסיכום — המערכת מחלצת נתוני נטו־מדידה, המלצות וחיובים. במצב דמו נטענים רק קבצי האקסל מהתיקייה הציבורית."
              bg="bg-brand-orange-100 text-brand-orange-600"
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function FeatureCard({ icon: Icon, title, desc, bg }) {
  return (
    <div className="card p-5 lift">
      <div className={`w-10 h-10 rounded-xl ${bg} grid place-items-center`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="mt-3 font-extrabold text-brand-ink-900">{title}</div>
      <div className="mt-1 text-sm text-brand-ink-500 leading-relaxed">{desc}</div>
    </div>
  );
}
