import { describe, it, expect } from 'vitest';
import { planTrip, DEFAULT_INPUTS } from './planner';
import { encodeShare, decodeShare } from './share';

describe('공유 링크', () => {
  it('링크로 옮긴 일정이 같은 동선·날짜로 다시 만들어진다', () => {
    const t = planTrip({ ...DEFAULT_INPUTS, whenMode: 'dates', start: '2026-11-10', end: '2026-11-18', interests: ['temple', 'cafe'], safe: true }, 'u1');
    const withNotes = { ...t, notes: { 'stay:chiangmai': 'x', 'ack:a-b': '1' } };
    const back = decodeShare(encodeShare(withNotes))!;
    expect(back).not.toBeNull();
    expect(back.courseId).toBe(t.courseId);
    expect(back.days.map((d) => [d.city, d.date])).toEqual(t.days.map((d) => [d.city, d.date]));
    expect(back.notes).toEqual({ 'stay:chiangmai': 'x' }); // 개인 메모는 넘기지 않음
    expect(encodeShare(t).length).toBeLessThan(1500);
  });
  it('깨진 링크는 null', () => {
    expect(decodeShare('abc')).toBeNull();
    expect(decodeShare(null)).toBeNull();
  });
});
