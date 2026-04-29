import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, ChevronDown, Database, Trash2, Upload as UploadIcon, ShieldCheck } from 'lucide-react';
import { useAccount } from './AccountContext.jsx';
import { useAdmin } from '../admin/AdminContext.jsx';

export default function AccountMenu({ onUpload }) {
  const { currentUser, logout, clearAllData, data } = useAccount();
  const { isAdmin, loginAdmin, logoutAdmin } = useAdmin();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handler(e) {
      if (!ref.current?.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!currentUser) return null;

  const counts = [
    data.solarSystems ? `${data.solarSystems.totals?.systems_count || 0} מערכות` : null,
    data.bills?.length ? `${data.bills.length} חשבונות` : null,
    data.summary?.periods?.length ? `${data.summary.periods.length} תקופות סיכום` : null,
  ].filter(Boolean);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 ps-1.5 pe-3 py-1.5 rounded-full bg-brand-green-50 border border-brand-green-100 text-brand-green-700 hover:bg-brand-green-100 transition"
      >
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-green-400 to-brand-green-600 text-white grid place-items-center font-bold text-xs">
          {currentUser.name.slice(0, 1)}
        </div>
        <span className="text-sm font-bold max-w-[140px] truncate">{currentUser.name}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute end-0 mt-2 w-72 card p-3 z-50"
          >
            <div className="px-2 pb-2">
              <div className="text-xs text-brand-ink-500">מחובר כ-</div>
              <div className="font-extrabold text-brand-ink-900 truncate">{currentUser.name}</div>
              {counts.length > 0 && (
                <div className="mt-1 text-[11px] text-brand-ink-500 inline-flex items-center gap-1">
                  <Database className="w-3 h-3" />
                  {counts.join(' · ')}
                </div>
              )}
            </div>

            <div className="border-t border-brand-ink-100 my-1" />

            <button
              onClick={() => { setOpen(false); onUpload?.(); }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-brand-green-50 text-brand-ink-700 hover:text-brand-green-700 transition text-sm font-semibold"
            >
              <UploadIcon className="w-4 h-4" />
              העלאת קבצים
            </button>

            <button
              onClick={() => {
                if (isAdmin) {
                  logoutAdmin();
                  return;
                }
                const code = window.prompt('קוד כניסה למצב אדמין');
                if (code == null) return;
                if (!loginAdmin(code)) window.alert('קוד שגוי');
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition text-sm font-semibold ${
                isAdmin
                  ? 'bg-brand-green-50 text-brand-green-700 hover:bg-brand-green-100'
                  : 'hover:bg-brand-ink-100 text-brand-ink-700'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              {isAdmin ? 'יציאה ממצב אדמין' : 'מצב אדמין לעריכת טקסט'}
            </button>

            <button
              onClick={() => {
                if (window.confirm('למחוק את כל הנתונים מהחשבון? (החשבון עצמו יישאר)')) {
                  clearAllData();
                  setOpen(false);
                }
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-rose-50 text-brand-ink-700 hover:text-rose-700 transition text-sm font-semibold"
            >
              <Trash2 className="w-4 h-4" />
              נקה נתונים
            </button>

            <div className="border-t border-brand-ink-100 my-1" />

            <button
              onClick={() => { logout(); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-brand-ink-100 text-brand-ink-700 transition text-sm font-semibold"
            >
              <LogOut className="w-4 h-4" />
              התנתק
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
