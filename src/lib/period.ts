import { EVENTS } from '../data/events';
import { PERIOD_REGIONS, regionSeason } from '../data/seasons';
import { monthOf, fmtMD } from './dates';
import type { CalendarEvent } from '../data/types';

export interface PeriodInfo { label: string; months: number[]; regions: { label: string; badge: string; text: string; note: string }[]; price: string; risks: string[]; events: CalendarEvent[]; rules: string[]; avoid: string[]; }

export function periodInfo(opts: { start?: string; end?: string; month?: number }): PeriodInfo {
  let months: number[] = []; let label = '';
  if (opts.start && opts.end) {
    const a = monthOf(opts.start), b = monthOf(opts.end);
    months = a <= b ? Array.from({ length: b - a + 1 }, (_, k) => a + k) : [...Array.from({ length: 13 - a }, (_, k) => a + k), ...Array.from({ length: b }, (_, k) => k + 1)];
    label = `${fmtMD(opts.start)} ~ ${fmtMD(opts.end)}`;
  } else if (opts.month) { months = [opts.month]; label = `${opts.month}월`; }
  const m = months[0];
  const regions = PERIOD_REGIONS.map((r) => ({ label: r.label, ...regionSeason(r.region, m) }));
  const rainy = months.some((x) => x >= 6 && x <= 10), peak = months.some((x) => x >= 11 || x <= 2), heat = months.some((x) => x >= 3 && x <= 5);
  const price = peak ? '숙소·교통 가격 상승, 축제 기간은 평소의 2~3배' : rainy ? '숙소 20~40% 저렴(어림)' : '보통 (송크란 주간만 상승)';
  const risks: string[] = [];
  if (rainy) risks.push('산사태·도로 침수: 치앙마이–빠이 762굽이, 난 산악도로', '하천 범람: 치앙라이·치앙마이', '트레킹·동굴 투어 취소 가능', '러이 푸끄라둥 국립공원 폐장');
  if (months.some((x) => x >= 5 && x <= 10)) risks.push('안다만: 꼬리뻬행 스피드보트 대폭 감편, 섬 숙소 다수 휴업');
  if (months.some((x) => x >= 10 && x <= 12)) risks.push('걸프: 코타오행 페리 결항·다이빙 시야 저하');
  if (months.some((x) => x === 3 || x === 4)) risks.push('북부 연무: 화전 연기로 PM2.5 심함');
  if (heat) risks.push('폭염: 낮 35~40°C, 열사병 주의');
  if (peak) risks.push('로이끄라통·연말 숙소·야간버스 조기 매진', '산간·러이 고원 새벽 한기');
  const events = EVENTS.filter((e) => {
    if (e.from && e.to && opts.start && opts.end) return !(e.to < opts.start || e.from > opts.end);
    if (e.from && !opts.start) return months.includes(monthOf(e.from));
    return (e.months ?? []).some((x) => months.includes(x));
  });
  const rules: string[] = [];
  if (rainy) rules.push('산간 도로가 있으면 예비일 1일');
  if (heat) rules.push('야외 일정을 오전·야간으로 재배치');
  if (months.some((x) => x >= 10 && x <= 12)) rules.push('남부는 안다만 쪽으로 전환 추천');
  const avoid: string[] = [];
  if (months.some((x) => x >= 5 && x <= 10)) avoid.push('꼬리뻬');
  if (rainy) avoid.push('러이 푸끄라둥');
  if (months.some((x) => x === 3 || x === 4)) avoid.push('치앙마이·치앙라이·매싸롱·매홍손·난(호흡기 질환자)');
  return { label, months, regions, price, risks: [...new Set(risks)], events, rules, avoid };
}
