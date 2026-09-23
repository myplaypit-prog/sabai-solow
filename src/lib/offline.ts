import type { Trip } from './planner';
import { cityById } from '../data/cities';
import { tourById } from '../data/tours';
import { STAYS } from '../data/stays';
import { photoWebp } from '../data/photos';

export type OfflineResult = { kind: 'ready'; total: number; failed: number } | { kind: 'unsupported' } | { kind: 'error' };

/** 일정 화면에 필요한 사진 키(도시·투어·숙소) */
export function tripPhotoKeys(t: Trip): string[] {
  const keys = new Set<string>();
  for (const c of t.cityIds) keys.add(cityById(c).photo);
  for (const d of t.days) if (d.tour) { const tr = tourById(d.tour); keys.add(tr.photo); keys.add(tr.photo2); }
  for (const k of Object.keys(t.notes ?? {})) if (k.startsWith('tour:')) { const tr = tourById(k.slice(5) as never); if (tr) { keys.add(tr.photo); keys.add(tr.photo2); } }
  for (const s of STAYS) if (t.cityIds.includes(s.city)) keys.add(s.photo);
  return [...keys];
}

/** 서비스 워커를 등록하고, 앱 파일(JS·CSS·폰트)과 이 일정의 사진을 미리 캐시해요. */
export async function prepareOffline(t: Trip, timeoutMs = 15000): Promise<OfflineResult> {
  const supported = 'serviceWorker' in navigator && location.protocol.startsWith('http') && window.top === window.self;
  if (!supported) return { kind: 'unsupported' };
  try {
    await navigator.serviceWorker.register('./sw.js');
    const reg = await navigator.serviceWorker.ready;
    const sw = reg.active;
    if (!sw) return { kind: 'error' };
    // 화면을 나눠 받으므로, 오프라인에서 열 화면(일정·인쇄·내 일정·안심 팩) 파일을 먼저 받아 둬요
    await Promise.all([import('../pages/Trip'), import('../pages/Misc')]).catch(() => undefined);
    const assets = performance.getEntriesByType('resource')
      .map((e) => e.name)
      .filter((u) => { try { return new URL(u).origin === location.origin; } catch { return false; } });
    const urls = [...new Set([new URL('./', location.href).href, ...assets, ...tripPhotoKeys(t).flatMap((k) => photoWebp(k).map((u) => new URL(u, location.href).href))])];
    return await new Promise<OfflineResult>((resolve) => {
      const timer = window.setTimeout(() => { navigator.serviceWorker.removeEventListener('message', onMsg); resolve({ kind: 'ready', total: urls.length, failed: -1 }); }, timeoutMs);
      function onMsg(ev: MessageEvent) {
        if (ev.data?.type !== 'cache-done') return;
        window.clearTimeout(timer); navigator.serviceWorker.removeEventListener('message', onMsg);
        resolve({ kind: 'ready', total: ev.data.total, failed: ev.data.failed });
      }
      navigator.serviceWorker.addEventListener('message', onMsg);
      sw.postMessage({ type: 'cache-urls', urls });
    });
  } catch {
    return { kind: 'error' };
  }
}
