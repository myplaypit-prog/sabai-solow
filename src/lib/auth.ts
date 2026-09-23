import { load, save, remove } from './storage';
// 프로토타입 전용 목업 계정: 비밀번호는 Web Crypto SHA-256(솔트+비밀번호) 해시로만 저장합니다.
export interface User { id: string; email: string; hash: string; salt: string; verified: boolean; createdAt: string; }
const USERS = 'ss.users', SESSION = 'ss.session';
const hex = (buf: ArrayBuffer) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
async function hashPw(pw: string, salt: string) {
  try { return hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(salt + ':' + pw))); }
  catch { let h = 0; for (const ch of salt + pw) h = (h * 31 + ch.charCodeAt(0)) | 0; return 'fallback-' + h; }
}
const rid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
export const pwRule = (pw: string) => pw.length >= 8 && /[A-Za-z]/.test(pw) && /\d/.test(pw);
export const emailRule = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

export async function signup(email: string, pw: string): Promise<User> {
  const users = await load<User[]>(USERS, []);
  if (users.some((u) => u.email === email.toLowerCase())) throw new Error('이미 가입된 이메일이에요. 로그인해 주세요.');
  const salt = rid();
  const u: User = { id: rid(), email: email.toLowerCase(), salt, hash: await hashPw(pw, salt), verified: false, createdAt: new Date().toISOString() };
  await save(USERS, [...users, u]); await save(SESSION, u.id); return u;
}
export async function login(email: string, pw: string): Promise<User> {
  const users = await load<User[]>(USERS, []);
  const u = users.find((x) => x.email === email.toLowerCase());
  if (!u || u.hash !== (await hashPw(pw, u.salt))) throw new Error('이메일 또는 비밀번호가 맞지 않아요. 다시 확인해 주세요.');
  await save(SESSION, u.id); return u;
}
export async function currentUser(): Promise<User | null> {
  const id = await load<string | null>(SESSION, null); if (!id) return null;
  const users = await load<User[]>(USERS, []); return users.find((u) => u.id === id) ?? null;
}
export async function markVerified(id: string) { const users = await load<User[]>(USERS, []); await save(USERS, users.map((u) => (u.id === id ? { ...u, verified: true } : u))); }
export async function resetPassword(email: string, pw: string) {
  const users = await load<User[]>(USERS, []); const u = users.find((x) => x.email === email.toLowerCase());
  if (!u) throw new Error('가입된 이메일이 아니에요.');
  const salt = rid(); const hash = await hashPw(pw, salt);
  await save(USERS, users.map((x) => (x.id === u.id ? { ...x, salt, hash } : x)));
}
export async function logout() { await remove(SESSION); }
export async function deleteAll() { await remove(USERS); await remove(SESSION); await remove('ss.trips'); }
