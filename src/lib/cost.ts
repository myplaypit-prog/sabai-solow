import type { Trip } from './planner';
import type { TransportMode, TransportOption } from '../data/types';
import { THB_KRW, stayById, cheapestStay } from '../data/stays';
import { tourById } from '../data/tours';

/**
 * 예상 총경비(1인, 모두 임시값). 운임·항공권은 시기마다 크게 달라서 화면에는 "어림"으로만 보여요.
 * 확인된 값으로 바꿀 때는 이 표만 고치면 코스 카드·일정 화면이 함께 바뀌어요.
 */
export const COST_RULES = {
  /** 인천 왕복 항공(만원, 임시): 도착 도시별 */
  flight: { bangkok: 45, chiangmai: 50 } as Record<string, number>,
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

export interface CostBreakdown { flight: number; lodging: number; transport: number; food: number; tours: number; total: number; }

/** 만원 단위(반올림) */
export function estimateCost(t: Trip, start = 'bangkok'): CostBreakdown {
  const won = (thb: number) => thb * THB_KRW;
  const lodging = t.days.filter((d) => d.stay).reduce((a, d) => a + (stayById(t.notes?.[`stay:${d.city}`])?.price ?? cheapestStay(d.city, t.inputs.budget)?.price ?? 0), 0);
  const legs = t.days.flatMap((d) => [...d.legs, ...(d.departLegs ?? [])]);
  const transport = won(legs.reduce((a, l) => a + legThb(l.option), 0));
  const food = won(COST_RULES.dailyThb * t.days.length);
  const tourIds = new Set([...t.days.flatMap((d) => (d.tour ? [d.tour] : [])), ...Object.keys(t.notes ?? {}).filter((k) => k.startsWith('tour:')).map((k) => k.slice(5))]);
  const tours = won([...tourIds].reduce((a, id) => a + tourThb(tourById(id)?.priceBand ?? ''), 0));
  const m = (krw: number) => Math.round(krw / 10000);
  const out = { flight: COST_RULES.flight[start] ?? COST_RULES.flight.bangkok, lodging: m(lodging), transport: m(transport), food: m(food), tours: m(tours) };
  return { ...out, total: out.flight + out.lodging + out.transport + out.food + out.tours };
}

export const COST_LABELS: [keyof Omit<CostBreakdown, 'total'>, string][] = [['flight', '항공'], ['lodging', '숙박'], ['transport', '교통'], ['food', '식비·현지'], ['tours', '투어']];
