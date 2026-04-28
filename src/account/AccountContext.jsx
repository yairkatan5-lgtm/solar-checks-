import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const USERS_KEY = 'solarsense.accounts.users.v1';
const CURRENT_USER_KEY = 'solarsense.accounts.current.v1';
const USER_DATA_PREFIX = 'solarsense.accounts.data.v1::';

function safeParse(raw, fallback) {
  if (!raw) return fallback;
  try { return JSON.parse(raw); } catch { return fallback; }
}

function readUsers() {
  return safeParse(localStorage.getItem(USERS_KEY), []);
}
function writeUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}
function readCurrentId() {
  return localStorage.getItem(CURRENT_USER_KEY) || null;
}
function writeCurrentId(id) {
  if (id) localStorage.setItem(CURRENT_USER_KEY, id);
  else localStorage.removeItem(CURRENT_USER_KEY);
}
function readUserData(id) {
  return safeParse(localStorage.getItem(USER_DATA_PREFIX + id), {
    solarSystems: null, // { period, generated_at, totals, environmental, underperformers, top5, bottom5, systems, sourceFile }
    summary: null,      // { periods: [...], sourceFile }
    bills: [],          // [{ id, sourceFile, ...parsedFields }]
  });
}
function writeUserData(id, data) {
  localStorage.setItem(USER_DATA_PREFIX + id, JSON.stringify(data));
}
function deleteUserData(id) {
  localStorage.removeItem(USER_DATA_PREFIX + id);
}

/** Single read on first paint so logged-in users see data immediately (no empty flash / wrong screen). */
function readInitialAccountSlice() {
  const users = readUsers();
  const cid = readCurrentId();
  if (cid && users.find((u) => u.id === cid)) {
    return { users, currentId: cid, data: readUserData(cid) };
  }
  return { users, currentId: null, data: { solarSystems: null, summary: null, bills: [] } };
}

const AccountContext = createContext(null);

export function AccountProvider({ children }) {
  const initial = readInitialAccountSlice();
  const [users, setUsers] = useState(initial.users);
  const [currentId, setCurrentId] = useState(initial.currentId);
  const [data, setData] = useState(initial.data);

  const persistData = useCallback((next) => {
    setData(next);
    if (currentId) writeUserData(currentId, next);
  }, [currentId]);

  const register = useCallback((displayName) => {
    const trimmed = (displayName || '').trim();
    if (!trimmed) return null;
    const id = 'u_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
    const user = { id, name: trimmed, createdAt: new Date().toISOString() };
    const next = [...readUsers(), user];
    writeUsers(next);
    setUsers(next);
    writeCurrentId(id);
    setCurrentId(id);
    const empty = { solarSystems: null, summary: null, bills: [] };
    writeUserData(id, empty);
    setData(empty);
    return user;
  }, []);

  const login = useCallback((id) => {
    const u = readUsers().find((x) => x.id === id);
    if (!u) return false;
    writeCurrentId(id);
    setCurrentId(id);
    setData(readUserData(id));
    return true;
  }, []);

  const logout = useCallback(() => {
    writeCurrentId(null);
    setCurrentId(null);
    setData({ solarSystems: null, summary: null, bills: [] });
  }, []);

  const removeAccount = useCallback((id) => {
    const next = readUsers().filter((u) => u.id !== id);
    writeUsers(next);
    setUsers(next);
    deleteUserData(id);
    if (currentId === id) {
      writeCurrentId(null);
      setCurrentId(null);
      setData({ solarSystems: null, summary: null, bills: [] });
    }
  }, [currentId]);

  const setSolarSystems = useCallback((value) => {
    persistData({ ...data, solarSystems: value });
  }, [data, persistData]);

  const setSummary = useCallback((value) => {
    persistData({ ...data, summary: value });
  }, [data, persistData]);

  const addBill = useCallback((bill) => {
    const id = bill.id || 'b_' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
    const withoutDup = data.bills.filter(
      (b) => !(b.invoiceNumber && bill.invoiceNumber && b.invoiceNumber === bill.invoiceNumber),
    );
    const nextBills = [...withoutDup, { ...bill, id, uploadedAt: new Date().toISOString() }];
    nextBills.sort((a, b) => {
      const da = a.periodStart || a.uploadedAt || '';
      const db = b.periodStart || b.uploadedAt || '';
      return String(da).localeCompare(String(db));
    });
    persistData({ ...data, bills: nextBills });
  }, [data, persistData]);

  const removeBill = useCallback((id) => {
    persistData({ ...data, bills: data.bills.filter((b) => b.id !== id) });
  }, [data, persistData]);

  const clearAllData = useCallback(() => {
    persistData({ solarSystems: null, summary: null, bills: [] });
  }, [persistData]);

  // Bulk replace data — used by demo seeding to atomically install a full snapshot.
  const replaceAllData = useCallback((next) => {
    const sane = {
      solarSystems: next?.solarSystems ?? null,
      summary: next?.summary ?? null,
      bills: Array.isArray(next?.bills)
        ? next.bills.map((b) => ({ ...b, id: b.id || 'b_' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4), uploadedAt: b.uploadedAt || new Date().toISOString() }))
        : [],
    };
    sane.bills.sort((a, b) => String(a.periodStart || '').localeCompare(String(b.periodStart || '')));
    persistData(sane);
  }, [persistData]);

  const currentUser = useMemo(
    () => users.find((u) => u.id === currentId) || null,
    [users, currentId],
  );

  const value = useMemo(() => ({
    users,
    currentUser,
    data,
    register,
    login,
    logout,
    removeAccount,
    setSolarSystems,
    setSummary,
    addBill,
    removeBill,
    clearAllData,
    replaceAllData,
  }), [users, currentUser, data, register, login, logout, removeAccount, setSolarSystems, setSummary, addBill, removeBill, clearAllData, replaceAllData]);

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

export function useAccount() {
  const ctx = useContext(AccountContext);
  if (!ctx) throw new Error('useAccount must be used inside AccountProvider');
  return ctx;
}
