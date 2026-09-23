import { describe, it, expect } from 'vitest';
import { planTrip, DEFAULT_INPUTS, rankCourses, RULES } from './planner';
import { COURSES } from '../data/courses';
import { periodInfo } from './period';

describe('규칙 엔진', () => {
  it('A코스 10일: 도시 순서·날짜 배지·안심 경고', () => {
    const t = planTrip(DEFAULT_INPUTS, 'u', 'A');
    expect(t.days.length).toBe(10);
    expect(t.days.map((d) => d.city)).toEqual(['lampang', 'phrae', 'nan', 'nan', 'chiangrai', 'chiangrai', 'chiangmai', 'chiangmai', 'chiangmai', 'chiangmai']);
    expect(t.days[0].legs[0].option.mode).toBe('night_train');
    const d7 = t.days.find((d) => d.date === '2026-10-26')!;
    expect(d7.badges.some((b) => b.kind === 'nodrink')).toBe(true);
    expect(t.days[2].badges.some((b) => b.kind === 'fest')).toBe(true);
    expect(t.days[4].badges.some((b) => b.kind === 'alert')).toBe(true); // 난→치앙라이 6h > 안심 5h
    expect(t.days[9].departLegs?.[0].option.mode).toBe('flight');
  });
  it('추천 코스 8개 × 12개월 × 일수 3·7·14·21: 규칙에 맞게 생성', () => {
    for (const c of COURSES) for (let m = 1; m <= 12; m++) for (const days of [3, 7, 14, 21]) {
      const t = planTrip({ ...DEFAULT_INPUTS, whenMode: 'month', month: m, days, start: undefined, end: undefined }, 'u', c.id);
      expect(t.days.length).toBeGreaterThanOrEqual(2);
      expect(t.days.length).toBeLessThanOrEqual(days + 1);
      for (const d of t.days) for (const l of [...d.legs, ...(d.departLegs ?? [])]) {
        expect(l.option.mode === 'night_bus').toBe(false); // 안심 일정: 야간버스 제외
        if (l.overLimit) expect(d.badges.some((b) => b.kind === 'alert') || d.departLegs?.includes(l)).toBe(true);
      }
    }
  });
  it('관심사 바다 + 3월이면 해안 코스가 위', () => {
    const r = rankCourses({ ...DEFAULT_INPUTS, whenMode: 'month', month: 3, interests: ['sea'], days: 4 });
    expect(['H', 'F', 'G']).toContain(r[0].c.id);
  });
  it('기간 정보: 10월 20~29일', () => {
    const p = periodInfo({ start: '2026-10-20', end: '2026-10-29' });
    expect(p.events.map((e) => e.id)).toContain('okpansa');
    expect(p.events.map((e) => e.id)).toContain('nanboat');
    expect(p.rules).toContain('산간 도로가 있으면 예비일 1일');
    expect(RULES.safeMaxHours).toBe(5);
  });
});
