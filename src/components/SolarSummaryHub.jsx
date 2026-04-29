import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileSpreadsheet, Info, Loader2 } from 'lucide-react';
import { fmt } from '../utils/format.js';
import PeriodFilterBar from './PeriodFilterBar.jsx';
import { sourceLabelForItem } from '../export/summarySchema.js';
import { exportSummaryXlsxSimple } from '../export/exportSummaryFallback.js';

export default function SolarSummaryHub({
  unifiedFull,
  unifiedFiltered,
  selection,
  onSelectionChange,
  summary,
  bills,
}) {
  const [exportMsg, setExportMsg] = useState(null);
  const [exporting, setExporting] = useState(false);

  if (!unifiedFull?.periods?.length) return null;

  const rows = unifiedFiltered.periods;

  const onExport = async () => {
    if (!rows.length) {
      setExportMsg('אין תקופות מסוננות לייצוא');
      setTimeout(() => setExportMsg(null), 3000);
      return;
    }
    setExporting(true);
    setExportMsg(null);
    const stamp = new Date().toISOString().slice(0, 10);
    const filename = `solar-summary-${stamp}.xlsx`;
    try {
      await exportSummaryXlsxSimple(rows, filename);
      setExportMsg('הקובץ יוצא בהצלחה');
    } catch (e) {
      console.error('Export failed', e);
      setExportMsg('שגיאה בייצוא הקובץ');
    } finally {
      setExporting(false);
      setTimeout(() => setExportMsg(null), 5000);
    }
  };

  const billNames = [...new Set((bills || []).map((b) => b.sourceFile).filter(Boolean))];

  return (
    <section id="solar-summary" className="max-w-7xl mx-auto px-6 lg:px-10 mt-10 md:mt-14">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="eyebrow">סיכום סולארי</div>
            <h2 className="section-title mt-1">ניתוח לפי קובץ הסיכום והתאמה לחשבונות</h2>
            <p className="lede mt-1 text-sm max-w-3xl">
              הטבלה משקפת את אותן עמודות כמו בפרסור קובץ ה-Excel (טווח תאריכים בעמודה A, ערכים כספיים וקוט״ש בהמשך).
              סימון מקור מציין אם השורה הגיעה מקובץ הסיכום או שוחזרה מחשבון חשמל.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onExport}
              disabled={exporting}
              className="btn-pill btn-orange text-sm inline-flex items-center gap-2 disabled:opacity-60"
            >
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              ייצוא סיכום (Excel)
            </button>
          </div>
        </div>

        {exportMsg && (
          <div className="text-xs font-semibold text-brand-ink-700 bg-brand-orange-50 border border-brand-orange-100 rounded-lg px-3 py-2">
            {exportMsg}
          </div>
        )}

        <div className="card p-5 md:p-6 space-y-5">
          <PeriodFilterBar unified={unifiedFull} selection={selection} onChange={onSelectionChange} />
          <div className="overflow-x-auto rounded-xl border border-brand-ink-100">
            <table className="w-full text-sm tabular-nums min-w-[1280px]">
              <thead>
                <tr className="bg-brand-ink-50 text-xs text-brand-ink-600 border-b border-brand-ink-100">
                  <th className="text-right py-3.5 px-4 font-bold whitespace-nowrap">תקופה</th>
                  <th className="text-right py-3.5 px-4 font-bold whitespace-nowrap">מקור</th>
                  <th className="text-right py-3.5 px-4 font-bold whitespace-nowrap">הערה</th>
                  <th className="text-right py-3.5 px-4 font-bold whitespace-nowrap">ייצור</th>
                  <th className="text-right py-3.5 px-4 font-bold whitespace-nowrap">ערך ייצור</th>
                  <th className="text-right py-3.5 px-4 font-bold whitespace-nowrap">הזרמה</th>
                  <th className="text-right py-3.5 px-4 font-bold whitespace-nowrap">ערך הזרמה</th>
                  <th className="text-right py-3.5 px-4 font-bold whitespace-nowrap">צ. עצמית</th>
                  <th className="text-right py-3.5 px-4 font-bold whitespace-nowrap">ערך צ.ע.</th>
                  <th className="text-right py-3.5 px-4 font-bold whitespace-nowrap">דמי הגנה</th>
                  <th className="text-right py-3.5 px-4 font-bold whitespace-nowrap">דמי הולכה</th>
                  <th className="text-right py-3.5 px-4 font-bold whitespace-nowrap">דמי איזון</th>
                  <th className="text-right py-3.5 px-4 font-bold whitespace-nowrap">רווח נטו</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="py-8 text-center text-brand-ink-500">
                      אין תקופות להצגה לפי הסינון
                    </td>
                  </tr>
                ) : (
                  rows.map((it, i) => {
                    const p = it.period;
                    return (
                      <tr key={`${p.range}-${i}`} className="border-b border-brand-ink-100/70 hover:bg-brand-ink-50/40">
                        <td className="py-3.5 px-4 font-bold text-brand-ink-900 whitespace-nowrap">{p.range}</td>
                        <td className="py-3.5 px-4 text-xs font-semibold text-brand-green-700 whitespace-nowrap">
                          {sourceLabelForItem(it)}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-brand-ink-600 max-w-[180px] truncate" title={p.label || ''}>
                          {p.label || '—'}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">{fmt.num(p.production_kwh)}</td>
                        <td className="py-3.5 px-4 whitespace-nowrap">{fmt.money2(p.production_value_nis)}</td>
                        <td className="py-3.5 px-4 whitespace-nowrap">{fmt.num(p.export_kwh)}</td>
                        <td className="py-3.5 px-4 whitespace-nowrap">{fmt.money2(p.export_value_nis)}</td>
                        <td className="py-3.5 px-4 whitespace-nowrap">{fmt.num(p.self_consumption_kwh)}</td>
                        <td className="py-3.5 px-4 whitespace-nowrap">{fmt.money2(p.self_consumption_value_nis)}</td>
                        <td className="py-3.5 px-4 whitespace-nowrap">{fmt.money2(p.protection_fee_nis)}</td>
                        <td className="py-3.5 px-4 whitespace-nowrap">{fmt.money2(p.transport_fee_nis)}</td>
                        <td className="py-3.5 px-4 whitespace-nowrap">{fmt.money2(p.balance_fee_nis)}</td>
                        <td className="py-3.5 px-4 font-extrabold text-brand-green-600 whitespace-nowrap">{fmt.money2(p.net_solar_profit_nis)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card p-4 md:p-5 bg-brand-ink-50/40 border-brand-ink-100">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-white border border-brand-ink-100 grid place-items-center shrink-0">
              <Info className="w-4 h-4 text-brand-green-600" />
            </div>
            <div className="text-sm text-brand-ink-700 leading-relaxed space-y-2">
              <div className="font-extrabold text-brand-ink-900 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4" />
                מקור נתונים וחישובים
              </div>
              <ul className="list-disc list-inside space-y-1 text-xs md:text-sm">
                {summary?.sourceFile && (
                  <li>
                    <span className="font-bold">קובץ סיכום:</span> {summary.sourceFile}
                    {summary.parsedAt && (
                      <span className="text-brand-ink-500"> · נפרס ב-{new Date(summary.parsedAt).toLocaleString('he-IL')}</span>
                    )}
                  </li>
                )}
                {!summary?.sourceFile && (
                  <li>לא הועלה קובץ «סיכום סולארי» — חלק מהשורות עשויות להיות משוחזרות מחשבונות בלבד.</li>
                )}
                {billNames.length > 0 && (
                  <li>
                    <span className="font-bold">חשבונות חשמל (PDF):</span> {billNames.join(', ')}
                  </li>
                )}
                <li>
                  <span className="font-bold">מיפוי עמודות (כמו בקובץ המקורי):</span> A טווח תאריכים, B הערה, C–L ייצור,
                  ערך ייצור, הזרמה, ערך הזרמה, צריכה עצמית, ערך צריכה עצמית, דמי הגנה, הולכה, איזון, רווח סולארי נטו.
                </li>
                <li>
                  <span className="font-bold">תזרים מול חשבון:</span> לכל תקופה,{' '}
                  <code className="bg-white px-1 rounded text-[11px]">period_net_nis ≈ net_solar_profit_nis − total_to_pay_nis</code>{' '}
                  (מתוך איחוד החשבון לשורת הסיכום; ראו קוד ב־periodUnifier.js).
                </li>
                <li>
                  <span className="font-bold">ייצוא Excel:</span> ניסיון למלא את{' '}
                  <code className="bg-white px-1 rounded text-[11px]">public/templates/solar-summary-template.xlsx</code> — ניתן להחליף
                  בקובץ המקורי מהמשימה (פרטים ב־public/templates/README.txt).
                </li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
