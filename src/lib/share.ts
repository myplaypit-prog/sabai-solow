import { planTrip, type Trip, type PlanInputs } from './planner';
import type { CourseStop } from '../data/types';
import { courseById } from '../data/courses';

/**
 * 공유 링크: 일정 전체 대신 "다시 만들 수 있는 재료"(입력값·코스·도시 순서·고른 숙소/투어)만 담아요.
 * 받는 쪽에서 planTrip으로 같은 일정을 다시 계산하므로 서버 없이도 다른 기기에서 열려요.
 */
interface Payload { v: 1; i: PlanInputs; c: string; s: CourseStop[]; n?: Record<string, string>; }

const toB64Url = (s: string) => btoa(String.fromCharCode(...new TextEncoder().encode(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const fromB64Url = (s: string) => new TextDecoder().decode(Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (ch) => ch.charCodeAt(0)));

export function encodeShare(t: Trip): string {
  // 개인 메모(경고 확인 등)는 빼고, 숙소·투어 선택만 넘겨요
  const n = Object.fromEntries(Object.entries(t.notes ?? {}).filter(([k]) => k.startsWith('stay:') || k.startsWith('tour:')));
  const p: Payload = { v: 1, i: t.inputs, c: t.courseId, s: t.stops, ...(Object.keys(n).length ? { n } : {}) };
  return toB64Url(JSON.stringify(p));
}

export function decodeShare(d: string | null): Trip | null {
  if (!d) return null;
  try {
    const p = JSON.parse(fromB64Url(d)) as Payload;
    if (p.v !== 1 || !p.i || !courseById(p.c) || !Array.isArray(p.s) || !p.s.length) return null;
    const t = planTrip(p.i, 'shared', p.c, p.s);
    return { ...t, id: 'shared', notes: p.n };
  } catch { return null; }
}

export const shareUrl = (t: Trip) => `${location.origin}${location.pathname}#/shared?d=${encodeShare(t)}`;
