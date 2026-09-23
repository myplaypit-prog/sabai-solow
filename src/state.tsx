import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { currentUser, logout as doLogout, type User } from './lib/auth';

interface Ctx { user: User | null; ready: boolean; refresh: () => Promise<void>; logout: () => Promise<void>; toast: (m: string) => void; theme: Theme; setTheme: (t: Theme) => void; online: boolean; }
type Theme = 'system' | 'light' | 'dark';
const AppCtx = createContext<Ctx>(null as unknown as Ctx);
export const useApp = () => useContext(AppCtx);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine);
  const [theme, setThemeState] = useState<Theme>(() => { try { return (localStorage.getItem('ss.theme') as Theme) || 'system'; } catch { return 'system'; } });
  const refresh = useCallback(async () => { setUser(await currentUser()); setReady(true); }, []);
  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => { const on = () => setOnline(true), off = () => setOnline(false); addEventListener('online', on); addEventListener('offline', off); return () => { removeEventListener('online', on); removeEventListener('offline', off); }; }, []);
  useEffect(() => { const r = document.documentElement; if (theme === 'system') r.removeAttribute('data-theme'); else r.setAttribute('data-theme', theme); try { localStorage.setItem('ss.theme', theme); } catch { /* 저장 불가 환경 */ } }, [theme]);
  const toast = useCallback((m: string) => { setMsg(m); window.setTimeout(() => setMsg(null), 2800); }, []);
  const logout = useCallback(async () => { await doLogout(); setUser(null); }, []);
  return (
    <AppCtx.Provider value={{ user, ready, refresh, logout, toast, theme, setTheme: setThemeState, online }}>
      {children}
      <div aria-live="polite" className="fixed left-1/2 -translate-x-1/2 z-[80] pointer-events-none" style={{ bottom: 'calc(96px + env(safe-area-inset-bottom, 0px))' }}>
        {msg && <div className="rise rounded-full bg-night text-on-night px-5 py-3 text-[15px] font-bold shadow-lg">{msg}</div>}
      </div>
    </AppCtx.Provider>
  );
}
