import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { currentUser, logout as doLogout, type User } from './lib/auth';

interface Ctx { user: User | null; ready: boolean; refresh: () => Promise<void>; logout: () => Promise<void>; toast: (m: string, action?: ToastAction) => void; theme: Theme; setTheme: (t: Theme) => void; online: boolean; }
type Theme = 'system' | 'light' | 'dark';
/** 토스트 안의 버튼(예: 되돌리기). 버튼이 있으면 6초 동안 보여줘요 */
export interface ToastAction { label: string; run: () => void }
const AppCtx = createContext<Ctx>(null as unknown as Ctx);
export const useApp = () => useContext(AppCtx);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [msg, setMsg] = useState<{ m: string; action?: ToastAction } | null>(null);
  const timer = useRef<number>();
  const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine);
  const [theme, setThemeState] = useState<Theme>(() => { try { return (localStorage.getItem('ss.theme') as Theme) || 'system'; } catch { return 'system'; } });
  const refresh = useCallback(async () => { setUser(await currentUser()); setReady(true); }, []);
  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => { const on = () => setOnline(true), off = () => setOnline(false); addEventListener('online', on); addEventListener('offline', off); return () => { removeEventListener('online', on); removeEventListener('offline', off); }; }, []);
  useEffect(() => { const r = document.documentElement; if (theme === 'system') r.removeAttribute('data-theme'); else r.setAttribute('data-theme', theme); try { localStorage.setItem('ss.theme', theme); } catch { /* 저장 불가 환경 */ } }, [theme]);
  const toast = useCallback((m: string, action?: ToastAction) => { window.clearTimeout(timer.current); setMsg({ m, action }); timer.current = window.setTimeout(() => setMsg(null), action ? 6000 : 2800); }, []);
  const logout = useCallback(async () => { await doLogout(); setUser(null); }, []);
  return (
    <AppCtx.Provider value={{ user, ready, refresh, logout, toast, theme, setTheme: setThemeState, online }}>
      {children}
      <div aria-live="polite" className="fixed left-1/2 -translate-x-1/2 z-[80] pointer-events-none" style={{ bottom: 'calc(96px + env(safe-area-inset-bottom, 0px))' }}>
        {msg && (
          <div className="rise rounded-full bg-night text-on-night pl-5 pr-2 py-1.5 min-h-12 flex items-center gap-3 text-[15px] font-bold shadow-lg whitespace-nowrap" style={msg.action ? undefined : { paddingRight: 20 }}>
            {msg.m}
            {msg.action && <button type="button" onClick={() => { msg.action!.run(); window.clearTimeout(timer.current); setMsg(null); }} className="pointer-events-auto min-h-11 px-4 rounded-full bg-on-night/15 hover:bg-on-night/25 font-bold underline-offset-4">{msg.action.label}</button>}
          </div>
        )}
      </div>
    </AppCtx.Provider>
  );
}
