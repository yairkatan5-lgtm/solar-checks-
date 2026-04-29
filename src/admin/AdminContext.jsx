import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ADMIN_KEY = 'solarsense.admin.enabled.v1';
const ADMIN_CODE = '1597';

const AdminContext = createContext(null);

function readInitialAdmin() {
  try {
    return localStorage.getItem(ADMIN_KEY) === 'true';
  } catch {
    return false;
  }
}

export function AdminProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(readInitialAdmin);

  const loginAdmin = useCallback((code) => {
    if (String(code || '').trim() !== ADMIN_CODE) return false;
    setIsAdmin(true);
    try {
      localStorage.setItem(ADMIN_KEY, 'true');
    } catch {}
    return true;
  }, []);

  const logoutAdmin = useCallback(() => {
    setIsAdmin(false);
    try {
      localStorage.removeItem(ADMIN_KEY);
    } catch {}
  }, []);

  const value = useMemo(() => ({ isAdmin, loginAdmin, logoutAdmin }), [isAdmin, loginAdmin, logoutAdmin]);

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used inside AdminProvider');
  return ctx;
}
