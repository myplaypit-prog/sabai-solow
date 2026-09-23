import type { Trip } from './planner';
import type { TransportMode, TransportOption } from '../data/types';
import { THB_KRW, stayById, cheapestStay } from '../data/stays';
import { tourById } from '../data/tours';
import { cityById } from '../data/cities';

/**
 * 예상 총경비(1인, 모두 임시값). 운임·항공권은 시기마다 크게 달라서 화면에는 "어림"으로만 보여요.
 * 확인된 값으로 바꿀 때는 이 표만 고치면 코스 카드·일정 화면이 함께 바뀌어요.
 */
export const COST_RULES = {
  /** 인천 왕복 항공 기본값(만원, 임시): 도착 도시별 */
  flight: { bangkok: 45, chiangmai: 50 } as Record<string, number>,
  /** 출발 월별 항공 계수(임시): 겨울 성수기·여름휴가는 높고, 우기는 낮게 */
  flightMonth: [1.25, 1.15, 1.0, 1.0, 0.9, 0.9, 1.2, 1.2, 0.85, 0.9, 1.05, 1.3],
  /** 구간 요금(바트, 임시): 기본 + 시간당 */
  fare: {
    bus: [80, 60], minivan: [100, 70], train: [50, 50], songthaew: [40, 40],
    night_train: [1200, 0], night_bus: [700, 0], flight: [1500, 0], ferry: [700, 0],
  } as Record<TransportMode, [number, number]>,
  /** 식비·시내 이동(바트/일, 임시) */
  dailyThb: 1000,
};

const legThb = (o: TransportOption) => { const [b, h] = COST_RULES.fare[o.mode] ?? [300, 0]; return b + h * (o.hours || 0); };
const tourThb = (priceBand: string) => Number(priceBand.replace(/,/g, '').match(/\d+/)?.[0] ?? 0); // 요금대의 낮은 값

/** 항공 계수 설명 */
export const flightSeason = (m: number) => { const f = COST_RULES.flightMonth[(m - 1 + 12) % 12]; return f >= 1.15 ? '성수기' : f <= 0.9 ? '비수기' : '보통'; };

export interface CostItem { label: string; sub?: string; krw: number; }
export interface CostBreakdown {
  flight: number; lodging: number; transport: number; food: number; tours: number; total: number;
  /** 항목별 자세히(원 단위) */
  detail: Record<'flight' | 'lodging' | 'transport' | 'food' | 'tours', CostItem[]>;
}

/** 합계는 만원 단위(반올림) */
export function estimateCost(t: Trip, start = 'bangkok'): CostBreakdown {
  const won = (thb: number) => Math.round(thb * THB_KRW);
  const name = (c: string) => cityById(c).name;

  const fBase = COST_RULES.flight[start] ?? COST_RULES.flight.bangkok;
  const fMul = COST_RULES.flightMonth[(t.month - 1 + 12) % 12];
  const flight: CostItem[] = [{ label: `인천 ↔ ${name(start)} 왕복`, sub: `${t.month}월 ${flightSeason(t.month)} 기준 · 기본 ${fBase}만원 × ${fMul}`, krw: Math.round(fBase * fMul) * 10000 }];

  // 도시별로 묶은 숙박(같은 도시 연박은 한 줄)
  const lodging: CostItem[] = [];
  for (const d of t.days.filter((x) => x.stay)) {
    const picked = stayById(t.notes?.[`stay:${d.city}`]); const s = picked ?? cheapestStay(d.city, t.inputs.budget);
    const last = lodging[lodging.length - 1];
    if (last && last.label.startsWith(name(d.city) + ' ')) { const n = Number(last.label.match(/(\d+)박/)![1]) + 1; last.label = `${name(d.city)} ${n}박`; last.krw += s?.price ?? 0; }
    else lodging.push({ label: `${name(d.city)} 1박`, sub: s ? `${picked ? '고른 숙소' : '예산 안 최저가'} · ${s.name}` : '숙소 정보 없음', krw: s?.price ?? 0 });
  }

  const transport: CostItem[] = t.days.flatMap((d) => [...d.legs, ...(d.departLegs ?? [])]).map((l) => ({ label: `${name(l.from)} → ${name(l.to)}`, sub: `${l.option.label} · ${l.option.hoursText}`, krw: won(legThb(l.option)) }));
  const food: CostItem[] = [{ label: `${t.days.length}일 × ${COST_RULES.dailyThb.toLocaleString()}바트`, sub: '식비·시내 이동·입장료 어림', krw: won(COST_RULES.dailyThb * t.days.length) }];
  const tourIds = [...new Set([...t.days.flatMap((d) => (d.tour ? [d.tour] : [])), ...Object.keys(t.notes ?? {}).filter((k) => k.startsWith('tour:')).map((k) => k.slice(5))])];
  const tours: CostItem[] = tourIds.map((id) => tourById(id)).filter(Boolean).map((tr) => ({ label: tr.name, sub: `${tr.priceBand}의 낮은 값`, krw: won(tourThb(tr.priceBand)) }));

  const detail = { flight, lodging, transport, food, tours };
  const m = (xs: CostItem[]) => Math.round(xs.reduce((a, x) => a + x.krw, 0) / 10000);
  const out = { flight: m(flight), lodging: m(lodging), transport: m(transport), food: m(food), tours: m(tours) };
  return { ...out, total: out.flight + out.lodging + out.transport + out.food + out.tours, detail };
}

export const COST_LABELS: [keyof Omit<CostBreakdown, 'total' | 'detail'>, string][] = [['flight', '항공'], ['lodging', '숙박'], ['transport', '교통'], ['food', '식비·현지'], ['tours', '투어']];
