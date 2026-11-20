import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

// Remembers table number + customer phone + "opened from QR" across pages and refreshes.
const KEY = 'bb_session';
const SessionContext = createContext(null);

const load = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
};

export function SessionProvider({ children }) {
  const [session, setSession] = useState(load);
  const [params] = useSearchParams();

  // Whenever the URL has ?table=T05 or ?source=qr, save it. (Runs on every page.)
  const urlTable = params.get('table');
  const urlSource = params.get('source');
  useEffect(() => {
    setSession((prev) => {
      const next = { ...prev };
      if (urlTable) next.table = urlTable.trim().toUpperCase().slice(0, 10);
      if (urlSource === 'qr') next.source = 'qr';
      return JSON.stringify(next) === JSON.stringify(prev) ? prev : next;
    });
  }, [urlTable, urlSource]);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(session));
  }, [session]);

  const setTable = useCallback((table) => setSession((p) => ({ ...p, table: table ? table.trim().toUpperCase() : '' })), []);
  const setPhone = useCallback((phone) => setSession((p) => ({ ...p, phone })), []);
  const setName = useCallback((name) => setSession((p) => ({ ...p, name })), []);
  const setLastOrder = useCallback((order) => setSession((p) => ({ ...p, lastOrder: order })), []);

  const value = useMemo(
    () => ({ ...session, isQr: session.source === 'qr', setTable, setPhone, setName, setLastOrder }),
    [session, setTable, setPhone, setName, setLastOrder]
  );
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export const useSession = () => useContext(SessionContext);
