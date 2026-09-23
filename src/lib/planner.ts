import type { Course, CourseStop, Interest, TourType, TransportOption } from '../data/types';
import { COURSES, courseById } from '../data/courses';
import { cityById } from '../data/cities';
import { findLeg, hasLeg, HUBS, viaCities } from '../data/legs';
import { EVENTS } from '../data/events';
import { tourById } from '../data/tours';
import { regionSeason } from '../data/seasons';
import { addDays, monthOf, inRange, todayISO } from './dates';

// ---- 입력(진단 5단계) ----
export type Intensity = 'slow' | 'normal' | 'busy';
export interface PlanInputs {
  whenMode: 'dates' | 'month' | 'undecided';
  start?: string; end?: string; month?: number;
  days: number; budget: number; // 1박 숙소 상한(만원)
  intensity: Intensity; nightMove: boolean;
  interests: Interest[]; safe: boolean; courseId?: string;
  /** 직접 고른 도시(순서는 규칙이 가까운 순으로 정리). 있으면 추천 코스 대신 이 도시들로 짜요 */
  cities?: string[];
}
export const DEFAULT_INPUTS: PlanInputs = { whenMode: 'dates', start: '2026-10-20', end: '2026-10-29', days: 10, budget: 10, intensity: 'normal', nightMove: true, interests: ['temple', 'cafe'], safe: true };

// ---- 결과 ----
export type BadgeKind = 'nodrink' | 'fest' | 'holiday' | 'warn' | 'alert' | 'save' | 'rec';
export interface DayBadge { kind: BadgeKind; text: string; message?: string; }
export interface PlannedLeg { from: string; to: string; option: TransportOption; alternatives: TransportOption[]; overLimit: boolean; limit: number; }
export interface Slot { label: string; text: string; }
export interface TripDay { n: number; date?: string; city: string; legs: PlannedLeg[]; slots: Slot[]; badges: DayBadge[]; tour?: TourType; tourCaution?: string; stay: boolean; departLegs?: PlannedLeg[]; }
export interface Trip { id: string; userId: string; createdAt: string; name: string; courseId: string; inputs: PlanInputs; days: TripDay[]; month: number; totalHours: number; nights: number; cityIds: string[]; warnings: string[]; offline?: boolean; notes?: Record<string, string>; stops: CourseStop[]; }

export const RULES = { maxHours: 6, safeMaxHours: 5, minNights: 1, rainyMonths: [6, 7, 8, 9, 10], heatMonths: [3, 4, 5] };

export function tripMonth(i: PlanInputs): number {
  if (i.whenMode === 'dates' && i.start) return monthOf(i.start);
  if (i.whenMode === 'month' && i.month) return i.month;
  return monthOf(todayISO());
}

/** 규칙 2(계절 적합도) + 관심사 + 일수로 코스 점수 */
export function scoreCourse(c: Course, i: PlanInputs): number {
  const m = tripMonth(i);
  let s = c.interests.filter((x) => i.interests.includes(x)).length * 2;
  for (const st of c.stops) { if (st.nights === 0) continue; const b = regionSeason(cityById(st.city).region, m).badge; s += b === 'rec' ? 1 : b === 'warn' ? -1.5 : 0; }
  s -= Math.abs(c.days - i.days) * 0.35;
  if (i.intensity === 'slow') s -= Math.max(0, c.stops.filter((x) => x.nights > 0).length - 3) * 0.5;
  return s;
}
export function rankCourses(i: PlanInputs) { return COURSES.map((c) => ({ c, s: scoreCourse(c, i) })).sort((a, b) => b.s - a.s); }

/** 규칙 3~5: 하루 최대 이동·야간 이동·안심 일정 → 수단 선택 */
export function chooseOption(from: string, to: string, i: PlanInputs, dayOnly = false): PlannedLeg {
  const leg = findLeg(from, to);
  const limit = i.safe ? RULES.safeMaxHours : RULES.maxHours;
  const allowed = leg.options.filter((o) => {
    if (o.overnight && (!i.nightMove || dayOnly)) return false; // 귀국일엔 낮 이동만
    if (i.safe && o.mode === 'night_bus') return false; // 안심: 야간버스 제외, 침대칸만
    return true;
  });
  const pool = allowed.length ? allowed : leg.options;
  const fits = (o: TransportOption) => o.overnight || o.hours <= limit;
  const ground = pool.filter((o) => o.mode !== 'flight' && fits(o)).sort((a, b) => Number(!!b.ladies && i.safe) - Number(!!a.ladies && i.safe) || a.hours - b.hours);
  const flight = pool.filter((o) => o.mode === 'flight');
  const option = ground[0] ?? flight[0] ?? [...pool].sort((a, b) => a.hours - b.hours)[0];
  return { from, to, option, alternatives: leg.options.filter((o) => o !== option), overLimit: !option.overnight && option.hours > limit, limit };
}

/** 규칙 6·7: 체류일 늘리기/줄이기 */
export function fitStops(course: Course, i: PlanInputs) {
  let stops = course.stops.map((s) => ({ ...s }));
  const stays = () => stops.filter((s) => s.nights > 0);
  if (i.intensity === 'slow') {
    while (stays().length > 3 && stays().reduce((a, s) => a + s.nights, 0) / stays().length < 2.5) {
      const mids = stays().slice(1, -1).sort((a, b) => a.nights - b.nights); if (!mids.length) break;
      const drop = mids[0]; const last = stays()[stays().length - 1]; last.nights += drop.nights; stops = stops.filter((s) => s !== drop);
    }
  }
  const target = Math.max(1, i.days - 1);
  let diff = target - stays().reduce((a, s) => a + s.nights, 0);
  let guard = 0;
  while (diff > 0 && guard++ < 50) { const s = [...stays()].sort((a, b) => b.nights - a.nights)[guard % Math.max(1, Math.min(2, stays().length))]; s.nights++; diff--; }
  while (diff < 0 && guard++ < 100) {
    const big = [...stays()].sort((a, b) => b.nights - a.nights)[0];
    if (big.nights > RULES.minNights) { big.nights--; diff++; continue; }
    const mids = stays().slice(1, -1); if (!mids.length) break;
    const drop = mids[mids.length - 1]; stops = stops.filter((s) => s !== drop); diff += drop.nights;
  }
  return stops;
}

/** 직통 구간이 없으면 교통 거점(0박 환승)을 사이에 넣어요. 편집으로 도시 순서가 바뀌어도 교통편이 끊기지 않게 합니다. */
export function hubBetween(a: string, b: string): string | undefined {
  if (a === b || hasLeg(a, b)) return undefined;
  return HUBS.find((h) => h !== a && h !== b && hasLeg(a, h) && hasLeg(h, b));
}
export function bridgeStops(start: string, stops: CourseStop[]): CourseStop[] {
  const out: CourseStop[] = [];
  let prev = start;
  for (const s of stops) {
    if (s.nights === 0 && s.city === prev) continue;
    for (const via of viaCities(prev, s.city)) if (!(out.length && out[out.length - 1].city === via)) out.push({ city: via, nights: 0 });
    out.push({ ...s });
    prev = s.city;
  }
  return out;
}

/** 도시 사이 거리(대략, 위경도 1° ≈ 111km) */
const km = (a: string, b: string) => { const x = cityById(a), y = cityById(b); return Math.hypot(x.lat - y.lat, (x.lng - y.lng) * Math.cos((x.lat * Math.PI) / 180)) * 111; };
/** 직접 가거나 허브 1곳을 거쳐 갈 수 있는지 */
const reachable = (a: string, b: string) => a === b || hasLeg(a, b) || viaCities(a, b).length > 0;
/** 한 번에 담을 수 있는 도시 수: 도시마다 최소 1박 */
export const maxCities = (days: number) => Math.max(1, days - 1);

/**
 * 직접 고른 도시로 체류 순서·박수를 정해요.
 * 순서: 가까운 도시부터 잇고(길이 이어지는 곳 우선), 2-opt로 출발지까지 돌아오는 전체 거리를 줄여요.
 * 박수: 전체 박수를 고르게 나누고, 남는 박은 앞쪽(보통 큰 도시)에 더해요.
 */
export function customStops(cities: string[], i: PlanInputs, start = 'bangkok'): CourseStop[] {
  const left = [...new Set(cities)].filter((c) => c !== start).slice(0, maxCities(i.days));
  const order: string[] = [];
  let cur = start;
  while (left.length) {
    left.sort((a, b) => (reachable(cur, a) ? 0 : 5000) + km(cur, a) - ((reachable(cur, b) ? 0 : 5000) + km(cur, b)));
    cur = left.shift()!; order.push(cur);
  }
  // 2-opt: 구간을 뒤집어 출발지로 돌아오는 전체 거리가 줄면 바꿔요(돌아가는 순서 방지)
  const leg = (a: string, b: string) => km(a, b) + (reachable(a, b) ? 0 : 5000);
  const loop = (o: string[]) => [start, ...o, start].reduce((d, c, k, arr) => (k ? d + leg(arr[k - 1], c) : 0), 0);
  for (let improved = true, guard = 0; improved && guard < 50; guard++) {
    improved = false;
    for (let x = 0; x < order.length - 1; x++) for (let y = x + 1; y < order.length; y++) {
      const cand = [...order.slice(0, x), ...order.slice(x, y + 1).reverse(), ...order.slice(y + 1)];
      if (loop(cand) + 0.5 < loop(order)) { order.splice(0, order.length, ...cand); improved = true; }
    }
  }
  const total = Math.max(order.length, i.days - 1);
  const base = Math.floor(total / order.length); let extra = total - base * order.length;
  return order.map((city) => ({ city, nights: base + (extra-- > 0 ? 1 : 0) }));
}

/** 직접 고른 도시와 가장 많이 겹치는 추천 코스(이름·사진·출발지 기준으로 씀) */
export function baseCourseFor(cities: string[], i: PlanInputs): Course {
  const ranked = rankCourses(i).map((r) => r.c).filter((c) => c.start === 'bangkok');
  const overlap = (c: Course) => c.stops.filter((s) => s.nights > 0 && cities.includes(s.city)).length;
  return [...ranked].sort((a, b) => overlap(b) - overlap(a))[0];
}

const INTEREST_TOUR: Record<Interest, TourType[]> = { nature: ['trekking', 'elephant', 'zipline'], cafe: ['cooking'], temple: ['cooking'], sea: [], yoga: ['cooking'], work: [] };

export function planTrip(i: PlanInputs, userId: string, forcedCourseId?: string, stopsOverride?: CourseStop[]): Trip {
  const custom = !forcedCourseId && !stopsOverride && !!i.cities?.length;
  const course = forcedCourseId || (!custom && i.courseId) ? courseById((forcedCourseId || i.courseId)!) : custom ? baseCourseFor(i.cities!, i) : rankCourses(i)[0].c;
  const m = tripMonth(i);
  const rainy = RULES.rainyMonths.includes(m), heat = RULES.heatMonths.includes(m);
  const stops = bridgeStops(course.start, stopsOverride ? stopsOverride.map((x) => ({ ...x })) : custom ? customStops(i.cities!, i, course.start) : fitStops(course, i));
  const warnings: string[] = [];
  const days: TripDay[] = [];
  let prev = course.start, pending: PlannedLeg[] = [], n = 1;
  const usedTours = new Set<TourType>();
  const dateOf = (k: number) => (i.whenMode === 'dates' && i.start ? addDays(i.start, k - 1) : undefined);

  for (const st of stops) {
    if (st.city !== prev) pending.push(chooseOption(prev, st.city, i));
    prev = st.city;
    if (st.nights === 0) continue;
    const city = cityById(st.city);
    const hl = [...city.highlights];
    let tourPlaced = false;
    for (let k = 0; k < st.nights; k++) {
      const legs = k === 0 ? pending : [];
      if (k === 0) pending = [];
      const slots: Slot[] = [];
      const longMove = legs.reduce((a, l) => a + (l.option.overnight ? 0 : l.option.hours), 0);
      const overnightArrive = legs.some((l) => l.option.overnight);
      if (k === 0 && overnightArrive) slots.push({ label: '오전', text: `${legs[legs.length - 1].option.label}로 도착, 숙소에 짐 맡기기` });
      if (k === 0 && longMove >= 5) slots.push({ label: '오후', text: '긴 이동 후 휴식 — 오후는 비워 뒀어요' });
      else if (k === 0) { if (hl.length) slots.push({ label: '오후', text: hl.shift()! }); if (hl.length) slots.push({ label: '저녁', text: hl.shift()! }); }
      let tour: TourType | undefined; let tourCaution: string | undefined;
      if (k === 1 && st.nights >= 2 && !tourPlaced) {
        const pref = i.interests.flatMap((x) => INTEREST_TOUR[x]);
        tour = [...pref, ...city.tours].find((t) => city.tours.includes(t) && !usedTours.has(t));
        if (tour) { usedTours.add(tour); tourPlaced = true; const t = tourById(tour); if (rainy && t.rainyCaution) tourCaution = t.rainyCaution; slots.push({ label: '하루', text: `${t.name} 투어${tour === 'elephant' ? ' (숙소 픽업 · 탑승 없음)' : ''}` }); }
      }
      if (k > 0 && !tour) {
        if (hl.length) slots.push({ label: '오전', text: hl.shift()! });
        if (hl.length) slots.push({ label: '오후', text: hl.shift()! });
        if (!slots.length) slots.push({ label: '하루', text: k === st.nights - 1 && city.mountainRoad && rainy ? '예비 시간 · 비 오면 실내 일정' : '자유 일정' });
      }
      if (heat) slots.forEach((s) => { if (s.label === '오후' && !s.text.includes('휴식')) s.text += ' (폭염기: 오전·저녁으로 옮겨 드려요)'; });
      const badges: DayBadge[] = [];
      legs.forEach((l) => { if (l.overLimit) badges.push({ kind: 'alert', text: `${i.safe ? '안심 일정 ' : ''}${l.limit}시간 초과`, message: `${cityById(l.from).name} → ${cityById(l.to).name} ${l.option.hoursText}. 하루 이동 기준(${l.limit}시간)을 넘어요.` }); });
      if (k === 0 && city.mountainRoad && rainy) badges.push({ kind: 'warn', text: '산악도로 · 우기 주의', message: '산사태·도로 침수로 이동이 끊길 수 있어요.' });
      days.push({ n, date: dateOf(n), city: st.city, legs, slots, badges, tour, tourCaution, stay: true });
      n++;
    }
  }
  // 마지막 날: 출발 도시에서 귀국 구간
  const lastCity = prev;
  const departPath = course.end === lastCity ? [] : [lastCity, ...viaCities(lastCity, course.end), course.end];
  const depart: PlannedLeg[] = departPath.slice(1).map((c, k) => chooseOption(departPath[k], c, i, true));
  days.push({ n, date: dateOf(n), city: lastCity, legs: [], slots: [{ label: '오전', text: '체크아웃' }], badges: [], stay: false, departLegs: depart });

  // 규칙 10: 날짜 배지(금주일·축제·공휴일)
  const seenFest = new Set<string>();
  for (const d of days) {
    const dm = d.date ? monthOf(d.date) : m;
    for (const e of EVENTS) {
      const cityOk = e.cities === 'all' || e.cities.includes(d.city);
      if (!cityOk) continue;
      const dateHit = d.date && e.from && e.to ? inRange(d.date, e.from, e.to) : false;
      const monthHit = !e.from && e.months?.includes(dm);
      if (e.type === 'no_alcohol' && dateHit) d.badges.unshift({ kind: 'nodrink', text: `금주일 · ${e.title}`, message: e.message });
      if (e.type === 'festival' && (dateHit || monthHit) && !seenFest.has(e.id + d.city)) { seenFest.add(e.id + d.city); d.badges.push({ kind: 'fest', text: e.title, message: `${e.message} · ${e.impact ?? ''} 숙소 조기 예약을 권해요.` }); }
    }
  }
  const allLegs = days.flatMap((d) => [...d.legs, ...(d.departLegs ?? [])]);
  if (rainy && days.some((d) => cityById(d.city).mountainRoad)) warnings.push('6~10월 산간 도로가 포함돼 예비일 1일을 권해요. 비 오는 날엔 실내 일정으로 바꿔 드려요.');
  if (allLegs.some((l) => l.overLimit)) warnings.push(`하루 이동 ${i.safe ? RULES.safeMaxHours : RULES.maxHours}시간을 넘는 구간이 있어요. 중간 도시 1박을 더하거나 그대로 진행할 수 있어요.`);
  { let run = 0; for (const d of days) { run = d.legs.length || d.departLegs?.length ? run + 1 : 0; if (run > 2) { warnings.push('이동하는 날이 3일 넘게 이어져요. 한 도시에 1박을 더하면 덜 지쳐요.'); break; } } }
  if (i.safe) warnings.push('안심 일정: 도시 도착은 21시 전, 야간버스 대신 침대칸, 하루 이동 5시간 이하를 우선해요.');
  const cityIds = [...new Set(days.map((d) => d.city))];
  return {
    id: Math.random().toString(36).slice(2, 10), userId, createdAt: new Date().toISOString(), name: i.cities?.length ? `${stops.filter((x) => x.nights > 0).slice(0, 3).map((x) => cityById(x.city).name).join('·')} 나만의 루트` : `${course.title.replace(/\s*\d+일$/, '')} ${days.length}일`, courseId: course.id, inputs: i, days, month: m,
    totalHours: Math.round(allLegs.reduce((a, l) => a + l.option.hours, 0)), nights: days.length - 1, cityIds, warnings, notes: {}, stops,
  };
}
