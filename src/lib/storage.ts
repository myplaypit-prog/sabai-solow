import { get, set, del } from 'idb-keyval';
// IndexedDB(idb-keyval) 우선, 막혀 있으면(사생활 모드·미리보기) 메모리로 대체해 화면은 항상 동작합니다.
const mem = new Map<string, unknown>();
let idbOk = true;
export async function load<T>(key: string, fallback: T): Promise<T> {
  if (idbOk) {
    try { const v = await get<T>(key); return v === undefined ? fallback : v; } catch { idbOk = false; }
  }
  return (mem.has(key) ? (mem.get(key) as T) : fallback);
}
export async function save<T>(key: string, value: T): Promise<void> {
  mem.set(key, value);
  if (!idbOk) return;
  try { await set(key, value); } catch { idbOk = false; }
}
export async function remove(key: string) { mem.delete(key); if (idbOk) { try { await del(key); } catch { idbOk = false; } } }
export const storageMode = () => (idbOk ? '이 기기(IndexedDB)' : '이번 방문 동안만(메모리)');
