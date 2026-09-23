import { describe, it, expect } from 'vitest';
import { planTrip, DEFAULT_INPUTS, customStops, maxCities } from './planner';
import { CITIES } from '../data/cities';

const base = { ...DEFAULT_INPUTS, whenMode: 'month' as const, month: 12, start: undefined, end: undefined };

describe('직접 고른 도시로 일정', () => {
  it('고른 도시가 모두 들어가고 박수 합이 맞는다', () => {
    const t = planTrip({ ...base, days: 9, cities: ['pai', 'chiangmai', 'chiangrai'] }, 'u');
    const stay = t.stops.filter((s) => s.nights > 0);
    expect(stay.map((s) => s.city).sort()).toEqual(['chiangmai', 'chiangrai', 'pai']);
    expect(stay.reduce((a, s) => a + s.nights, 0)).toBe(8);
    expect(t.name).toContain('나만의 루트');
  });
  it('일수보다 많이 고르면 담을 수 있는 만큼만', () => {
    expect(customStops(CITIES.map((c) => c.id), { ...base, days: 4 })).toHaveLength(maxCities(4));
  });
  it('어느 두 도시를 골라도 교통편 빈칸이 생기지 않는다', () => {
    const ids = CITIES.map((c) => c.id).filter((c) => c !== 'bangkok');
    const gaps: string[] = [];
    for (const a of ids) for (const b of ids) {
      if (a === b) continue;
      const t = planTrip({ ...base, days: 6, cities: [a, b] }, 'u');
      const legs = t.days.flatMap((d) => [...d.legs, ...(d.departLegs ?? [])]);
      if (legs.some((l) => l.option.label.includes('확인 필요'))) gaps.push(`${a}+${b}`);
    }
    expect(gaps).toEqual([]);
  });
});

describe('도시 순서', () => {
  it('북부 도시를 섞어 골라도 한 방향으로 도는 순서가 된다', () => {
    const o = customStops(['pai', 'nan', 'chiangrai', 'lampang', 'chiangmai'], { ...base, days: 11 }).map((s) => s.city);
    // 람빵(방콕에서 가장 가까운 북부)으로 들어가거나 나오고, 치앙마이·빠이는 붙어 있어야 해요
    expect([o[0], o[o.length - 1]]).toContain('lampang');
    expect(Math.abs(o.indexOf('chiangmai') - o.indexOf('pai'))).toBe(1);
  });
});
