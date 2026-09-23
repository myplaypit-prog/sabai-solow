import { Link } from 'react-router-dom';
import type { Course } from '../data/types';
import { Badge, Photo, seasonKind } from './ui';
import { cheapestStay } from '../data/stays';
import { Icon } from './Icon';
import { cityById } from '../data/cities';
import { regionSeason } from '../data/seasons';
import { todayISO, monthOf } from '../lib/dates';
import { planTrip, DEFAULT_INPUTS } from '../lib/planner';
import { estimateCost, COST_LABELS, type CostBreakdown } from '../lib/cost';

export const stayCount = (c: Course) => c.stops.filter((s) => s.nights > 0 && s.city !== 'bangkok').reduce((a, s) => (a.includes(s.city) ? a : [...a, s.city]), [] as string[]).length;
/** 이번 달 기준 코스 배지: 코스 도시 중 가장 주의가 필요한 계절 */
export function courseSeason(c: Course, m = monthOf(todayISO())) {
  const list = c.stops.filter((s) => s.nights > 0).map((s) => regionSeason(cityById(s.city).region, m));
  const worst = list.find((x) => x.badge === 'warn') ?? list.find((x) => x.badge === 'save') ?? list[0];
  return { kind: seasonKind(worst.badge), text: `${m}월 ${worst.text.split(' · ')[0]} · ${worst.note.split(',')[0]}` };
}


/** 코스 요약 수치(임시 숙소 데이터 기준) */
export function courseStats(c: Course) {
  const stays = c.stops.filter((s) => s.nights > 0);
  const nights = stays.reduce((a, s) => a + s.nights, 0);
  const lodging = stays.reduce((a, s) => a + s.nights * (cheapestStay(s.city, 6)?.price ?? cheapestStay(s.city, 10)?.price ?? 0), 0);
  const solo = stays.reduce((a, s) => a + cityById(s.city).solo, 0) / Math.max(1, stays.length);
  return { nights, avg: nights ? Math.round(lodging / nights / 1000) / 10 : 0, total: Math.round(lodging / 10000), solo: solo.toFixed(1) };
}

/** 코스 카드용 예상 총경비: 코스 기본 일수·1박 6만원 이하·이번 달 기준으로 한 번 계산해 둬요 */
const costCache = new Map<string, CostBreakdown>();
export function courseCost(c: Course): CostBreakdown {
  let v = costCache.get(c.id);
  if (!v) {
    const t = planTrip({ ...DEFAULT_INPUTS, whenMode: 'month', month: monthOf(todayISO()), start: undefined, end: undefined, days: c.days, budget: 6, courseId: c.id }, 'card');
    v = estimateCost(t, c.start); costCache.set(c.id, v);
  }
  return v;
}
function Price({ c, big }: { c: Course; big?: boolean }) {
  const v = courseCost(c);
  return (
    <span className="flex flex-col items-end shrink-0 text-right">
      <span className="text-[13px] font-semibold text-slate">예상 총경비 · 1인</span>
      <b className={`${big ? 'text-[22px] lg:text-[26px]' : 'text-[22px]'} font-extrabold text-primary leading-tight whitespace-nowrap`}>약 {v.total}만원</b>
    </span>
  );
}
/** 항목별 경비(만원) 한 줄 */
export function CostLine({ v, className = '' }: { v: CostBreakdown; className?: string }) {
  return (
    <p className={`m-0 text-[13px] text-slate flex flex-wrap gap-x-2.5 gap-y-0.5 ${className}`}>
      {COST_LABELS.map(([k, l]) => <span key={k} className="whitespace-nowrap">{l} <b className="font-bold text-marine">{v[k]}</b></span>)}
      <span className="whitespace-nowrap">(만원 · 임시 어림)</span>
    </p>
  );
}

/** 사진 카드: 태그·위치가 사진 위에, 제목·카피·특징이 아래에 */
export function BigCourse({ c, wide }: { c: Course; wide?: boolean }) {
  const s = courseSeason(c); const st = courseStats(c);
  return (
    <article className={`lift card rounded-3xl overflow-hidden flex flex-col ${wide ? 'lg:col-span-7' : 'lg:col-span-5'}`}>
      <Link to={`/plan?course=${c.id}`} className="zoom relative block h-[240px] lg:h-[380px] overflow-hidden" aria-label={`${c.title} — 이 코스로 일정 시작`}>
        <Photo k={c.photo} />
        <span className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[rgba(15,22,40,.7)] to-transparent" aria-hidden="true" />
        <span className="absolute left-4 top-4 flex gap-2 flex-wrap">
          <span className="px-3 py-1.5 rounded-full bg-[rgba(15,22,40,.72)] text-white text-[13px] font-bold">{st.nights}박 {st.nights + 1}일</span>
          <span className="px-3 py-1.5 rounded-full bg-sage-t text-sage text-[13px] font-bold">{c.mood}</span>
        </span>
        <span className="absolute left-4 right-4 bottom-4 flex items-end justify-between gap-3 text-white">
          <span className="flex items-center gap-1.5 text-[14px] font-bold [text-shadow:0_1px_8px_rgba(0,0,0,.4)]"><Icon name="pin" size={16} />{c.area}</span>
          <span className="hidden sm:inline-flex"><Badge kind={s.kind} size="sm">{s.text}</Badge></span>
        </span>
      </Link>
      <div className="p-5 lg:p-7 flex flex-col gap-3 flex-1">
        <span className="text-[13px] font-bold tracking-[.06em] text-slate">{c.tagline}</span>
        <div className="flex items-start justify-between gap-4">
          <h3 className="m-0 text-[22px] lg:text-[26px] font-extrabold tracking-[-0.02em] leading-snug">{c.title}</h3>
          <Price c={c} big />
        </div>
        <p className="m-0 text-[16px] leading-relaxed text-slate">{c.copy}</p>
        <CostLine v={courseCost(c)} />
        <div className="mt-auto pt-2">
          <div className="rounded-2xl bg-oat p-3 pl-4 flex flex-wrap items-center justify-between gap-3">
            <ul className="m-0 p-0 list-none flex flex-wrap gap-x-4 gap-y-1.5 text-[14px] font-semibold">{c.feats.map(([ic, t]) => <li key={t} className="flex items-center gap-1.5"><span className="text-primary"><Icon name={ic} size={16} /></span>{t}</li>)}</ul>
            <Link to={`/plan?course=${c.id}`} className="btn btn-primary !min-h-11 !px-5 text-[14px]">이 코스로 일정 짜기</Link>
          </div>
        </div>
      </div>
    </article>
  );
}

/** 글 카드: 사진 없이 태그·제목·카피·예상 숙박비 */
export function TextCourse({ c }: { c: Course }) {
  const st = courseStats(c);
  return (
    <article className="lift card rounded-3xl p-5 lg:p-7 flex flex-col gap-3 lg:col-span-6">
      <div className="flex items-start justify-between gap-4">
        <span className="flex flex-col gap-2 min-w-0">
          <span className="flex flex-wrap items-center gap-2"><span className="px-3 py-1 rounded-full bg-sky-t text-sky-d text-[13px] font-bold">{st.nights}박 {st.nights + 1}일 루트</span><span className="text-[14px] font-semibold text-slate">{c.area}</span></span>
          <h3 className="m-0 text-[20px] lg:text-[22px] font-extrabold tracking-[-0.015em] leading-snug">{c.title}</h3>
        </span>
        <Price c={c} />
      </div>
      <p className="m-0 text-[16px] leading-relaxed text-slate">{c.copy}</p>
      <CostLine v={courseCost(c)} />
      <div className="mt-auto pt-3 flex flex-wrap items-center justify-between gap-3 border-t rule">
        <ul className="m-0 p-0 list-none flex flex-wrap gap-x-4 gap-y-1 text-[14px] font-semibold">{c.feats.map(([ic, t]) => <li key={t} className="flex items-center gap-1.5"><span className="text-sage"><Icon name={ic} size={16} /></span>{t}</li>)}</ul>
        <Link to={`/plan?course=${c.id}`} className="min-h-11 inline-flex items-center gap-1 text-[15px] font-bold text-primary">일정 짜기 <Icon name="arrow" size={16} sw={2.4} /></Link>
      </div>
    </article>
  );
}

/** 코스 지역 묶음(북부 · 중부·이산 · 남부) */
export const ZONES = [
  { key: 'north', l: '북부', ids: 'AB', d: '안개 낀 산골과 오래된 사원, 란나의 느린 골목' },
  { key: 'central', l: '중부·이산', ids: 'DEH', d: '강을 따라 흐르는 유적과 노을, 방콕 근교의 짧은 쉼표' },
  { key: 'south', l: '남부', ids: 'CFG', d: '호수 위 방갈로와 정글, 투명한 바다의 섬' },
] as const;

/** 도시 직접 고르기 입구 카드 */
export function PickCitiesCard({ className = '' }: { className?: string }) {
  return (
    <article className={`card rounded-3xl p-6 lg:p-8 flex flex-col justify-center gap-4 bg-saffron-t ${className}`}>
      <span className="w-12 h-12 rounded-2xl bg-card text-primary grid place-items-center"><Icon name="pin" size={24} /></span>
      <h3 className="m-0 text-[22px] lg:text-[26px] font-extrabold tracking-[-0.02em] leading-snug">가고 싶은 도시가 따로 있나요?</h3>
      <p className="m-0 text-[16px] leading-relaxed text-slate">20개 소도시 가운데 마음이 가는 곳을 담아 보세요. 이동 시간이 짧은 순서로 이어서, 나만의 느린 루트를 짜 드려요.</p>
      <Link to="/courses?view=cities" className="btn btn-primary self-start"><Icon name="plus" size={18} sw={2.4} />도시 직접 고르기</Link>
    </article>
  );
}
