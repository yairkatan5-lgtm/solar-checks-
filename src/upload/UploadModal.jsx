import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileSpreadsheet, FileText, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { processFile, kindLabel, KIND } from './parsers/detect.js';
import { useAccount } from '../account/AccountContext.jsx';

export default function UploadModal({ open, onClose, onUploadComplete }) {
  const { setSolarSystems, setSummary, addBill } = useAccount();
  const [dragOver, setDragOver] = useState(false);
  const [items, setItems] = useState([]); // [{name, kind, status, message}]

  const handleFiles = useCallback(async (files) => {
    const list = Array.from(files);
    if (!list.length) return;
    const baseEntries = list.map((f) => ({
      name: f.name,
      kind: 'detecting',
      status: 'pending',
      message: 'מזהה קובץ...',
    }));
    setItems((prev) => [...prev, ...baseEntries]);
    const startIdx = items.length;
    let anyOk = false;

    for (let i = 0; i < list.length; i++) {
      const f = list[i];
      const idx = startIdx + i;
      try {
        setItems((prev) => prev.map((it, ii) => (ii === idx ? { ...it, status: 'processing', message: 'מעבד...' } : it)));
        const { kind, data } = await processFile(f);
        if (!data) {
          setItems((prev) => prev.map((it, ii) => (ii === idx ? { ...it, kind, status: 'error', message: 'הקובץ לא זוהה' } : it)));
          continue;
        }
        if (kind === KIND.PRODUCTION) {
          setSolarSystems(data);
          anyOk = true;
          setItems((prev) => prev.map((it, ii) => (ii === idx ? { ...it, kind, status: 'ok', message: `${data.totals.systems_count} מערכות נטענו` } : it)));
        } else if (kind === KIND.SUMMARY) {
          setSummary(data);
          anyOk = true;
          setItems((prev) => prev.map((it, ii) => (ii === idx ? { ...it, kind, status: 'ok', message: `${data.periods.length} תקופות נטענו` } : it)));
        } else if (kind === KIND.BILL) {
          addBill(data);
          anyOk = true;
          const period = data.periodLabel || data.periodStart || '';
          setItems((prev) => prev.map((it, ii) => (ii === idx ? { ...it, kind, status: 'ok', message: period ? `חשבון לתקופה ${period}` : 'חשבון נטען' } : it)));
        } else {
          setItems((prev) => prev.map((it, ii) => (ii === idx ? { ...it, kind, status: 'error', message: 'סוג קובץ לא נתמך' } : it)));
        }
      } catch (err) {
        console.error('Upload error', f.name, err);
        setItems((prev) => prev.map((it, ii) => (ii === idx ? { ...it, status: 'error', message: err?.message || 'שגיאה בעיבוד' } : it)));
      }
    }
    if (anyOk) onUploadComplete?.();
  }, [items.length, setSolarSystems, setSummary, addBill, onUploadComplete]);

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer?.files?.length) handleFiles(e.dataTransfer.files);
  };
  const onChange = (e) => {
    if (e.target.files?.length) handleFiles(e.target.files);
    e.target.value = '';
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/30 backdrop-blur-sm grid place-items-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="card w-full max-w-2xl p-6 md:p-7"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-extrabold text-brand-ink-900">העלאת קבצים</h2>
              <p className="text-sm text-brand-ink-500 mt-1">קבצי Excel ייצור / סיכום סולארי / חשבונות חשמל PDF</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-brand-ink-100 transition" aria-label="סגור">
              <X className="w-5 h-5" />
            </button>
          </div>

          <label
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            className={`block cursor-pointer rounded-2xl border-2 border-dashed transition p-8 text-center ${
              dragOver
                ? 'border-brand-orange-500 bg-brand-orange-50'
                : 'border-brand-ink-200 bg-brand-ink-50 hover:bg-white hover:border-brand-green-400'
            }`}
          >
            <input
              type="file"
              multiple
              accept=".xlsx,.xls,.pdf"
              onChange={onChange}
              className="hidden"
            />
            <motion.div animate={{ y: dragOver ? -6 : 0 }} className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-green-400 to-brand-green-600 grid place-items-center text-white shadow-green">
              <UploadCloud className="w-8 h-8" />
            </motion.div>
            <div className="mt-4 font-bold text-brand-ink-900">גרור קבצים לכאן או לחץ לבחירה</div>
            <div className="mt-1 text-sm text-brand-ink-500">XLSX · PDF · אפשר מספר קבצים יחד</div>
            <div className="mt-3 inline-flex items-center gap-3 text-xs text-brand-ink-500">
              <span className="inline-flex items-center gap-1"><FileSpreadsheet className="w-3.5 h-3.5" /> ייצור / סיכום</span>
              <span>·</span>
              <span className="inline-flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> חשבון חשמל</span>
            </div>
          </label>

          {items.length > 0 && (
            <ul className="mt-5 space-y-2 max-h-[40vh] overflow-y-auto pr-1">
              {items.map((it, i) => (
                <li key={i} className="flex items-center gap-3 p-3 rounded-xl bg-brand-ink-50 border border-brand-ink-100">
                  <StatusIcon status={it.status} />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-brand-ink-900 truncate" title={it.name}>{it.name}</div>
                    <div className="text-xs text-brand-ink-500">
                      {it.kind && it.kind !== 'detecting' && (
                        <span className="me-2 px-1.5 py-0.5 rounded bg-white border border-brand-ink-200 text-[10px] font-bold text-brand-ink-700">
                          {kindLabel(it.kind)}
                        </span>
                      )}
                      <span>{it.message}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-5 flex justify-end gap-2">
            <button onClick={onClose} className="btn-pill btn-ghost">סגור</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function StatusIcon({ status }) {
  if (status === 'ok')   return <CheckCircle2 className="w-5 h-5 text-brand-green-600 flex-shrink-0" />;
  if (status === 'error') return <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />;
  if (status === 'processing') return <Loader2 className="w-5 h-5 text-brand-orange-500 animate-spin flex-shrink-0" />;
  return <Loader2 className="w-5 h-5 text-brand-ink-300 flex-shrink-0" />;
}
