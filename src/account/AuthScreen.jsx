import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, UserPlus, ArrowLeft, Trash2, Eye } from 'lucide-react';
import Logo from '../components/Logo.jsx';
import { useAccount } from './AccountContext.jsx';

export default function AuthScreen({ onGuest, onHomeTask }) {
  const { users, register, login, removeAccount } = useAccount();
  const hasUsers = users.length > 0;
  const [mode, setMode] = useState(hasUsers ? 'login' : 'register');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setMode(hasUsers ? 'login' : 'register');
  }, [hasUsers]);

  function handleRegister(e) {
    e?.preventDefault?.();
    setError('');
    const trimmed = name.trim();
    if (!trimmed) { setError('הזן שם תצוגה'); return; }
    if (users.some((u) => u.name.toLowerCase() === trimmed.toLowerCase())) {
      setError('כבר קיים חשבון בשם הזה. נסה להתחבר במקום.');
      return;
    }
    register(trimmed);
  }

  function handleDelete(id, displayName) {
    if (window.confirm(`למחוק את החשבון "${displayName}" וכל הנתונים שלו?`)) {
      removeAccount(id);
    }
  }

  return (
    <div className="min-h-screen bg-hero-light relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-[520px] h-[520px] rounded-full blob bg-brand-orange-300" />
      <div className="absolute -bottom-40 -left-40 w-[520px] h-[520px] rounded-full blob bg-brand-green-300" />

      <div className="relative max-w-md mx-auto px-6 pt-16 md:pt-24 pb-12">
        <div className="flex justify-center mb-8">
          <Logo size={56} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card p-7 md:p-8"
        >
          <div className="text-center mb-6">
            <div className="eyebrow mb-1">דשבורד נכסים סולאריים</div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              <span className="text-gradient-green">ברוכים הבאים</span>
            </h1>
            <p className="lede mt-2 text-sm md:text-base">
              התחברו כדי להעלות את חשבונות החשמל וקבצי הייצור — הדשבורד יחושב את הנתונים שלכם אוטומטית.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {mode === 'register' && (
              <motion.form
                key="reg"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleRegister}
                className="space-y-4"
              >
                <label className="block">
                  <span className="text-sm font-bold text-brand-ink-700">שם תצוגה</span>
                  <input
                    autoFocus
                    type="text"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setError(''); }}
                    placeholder="לדוגמה: יאיר / מגנטון בע״מ"
                    className="mt-1 w-full px-4 py-3 rounded-xl border border-brand-ink-200 focus:outline-none focus:border-brand-green-500 focus:ring-2 focus:ring-brand-green-100 transition"
                  />
                </label>
                {error && <div className="text-sm text-rose-600 font-semibold">{error}</div>}
                <button type="submit" className="btn-pill btn-green w-full justify-center">
                  <UserPlus className="w-4 h-4" />
                  צור חשבון והתחל
                </button>
                {hasUsers && (
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setError(''); }}
                    className="w-full text-sm font-semibold text-brand-ink-500 hover:text-brand-green-600 transition flex items-center justify-center gap-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    יש לי חשבון, אני רוצה להתחבר
                  </button>
                )}
              </motion.form>
            )}

            {mode === 'login' && (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-3"
              >
                <div className="text-sm font-bold text-brand-ink-700 mb-2">בחר חשבון:</div>
                <ul className="space-y-2">
                  {users.map((u) => (
                    <li key={u.id} className="group flex items-center gap-2">
                      <button
                        onClick={() => login(u.id)}
                        className="flex-1 flex items-center gap-3 p-3 rounded-xl border border-brand-ink-200 hover:border-brand-green-500 hover:bg-brand-green-50 transition text-right"
                      >
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-green-400 to-brand-green-600 text-white grid place-items-center font-bold">
                          {u.name.slice(0, 1)}
                        </div>
                        <div>
                          <div className="font-bold text-brand-ink-900">{u.name}</div>
                          <div className="text-xs text-brand-ink-500">
                            נוצר: {new Date(u.createdAt).toLocaleDateString('he-IL')}
                          </div>
                        </div>
                        <LogIn className="ms-auto w-4 h-4 text-brand-ink-300 group-hover:text-brand-green-600 transition" />
                      </button>
                      <button
                        onClick={() => handleDelete(u.id, u.name)}
                        title="מחיקת חשבון"
                        className="p-2 rounded-lg text-brand-ink-300 hover:text-rose-600 hover:bg-rose-50 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => { setMode('register'); setName(''); setError(''); }}
                  className="btn-pill btn-ghost w-full justify-center mt-3"
                >
                  <UserPlus className="w-4 h-4" />
                  צור חשבון חדש
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-6 pt-5 border-t border-brand-ink-100 text-center flex flex-col gap-3">
            <button
              onClick={onHomeTask}
              className="btn-pill bg-brand-sky-500 hover:bg-brand-sky-600 text-white w-full justify-center transition"
            >
              משימת בית (טעינת נתונים מלאה)
            </button>
            <button
              onClick={onGuest}
              className="text-sm font-semibold text-brand-ink-500 hover:text-brand-orange-500 transition inline-flex items-center justify-center gap-1.5"
            >
              <Eye className="w-4 h-4" />
              צפיה במצב דמו (מהיר, ללא חשבון)
            </button>
          </div>
        </motion.div>

        <p className="mt-6 text-center text-xs text-brand-ink-500">
          🔒 הנתונים נשמרים מקומית בדפדפן בלבד. הקבצים לא נשלחים לשום שרת.
        </p>
      </div>
    </div>
  );
}
