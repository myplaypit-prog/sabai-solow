import { Link } from 'react-router-dom';
import type { Course } from '../data/types';
import { Badge, Photo, seasonKind } from './ui';
import { cheapestStay } from '../data/stays';
import { Icon } from './Icon';
import { cityById } from '../data/cities';
import { regionSeason } from '../data/seasons';
import { todayISO, monthOf } from '../lib/dates';

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
  return { nights, avg: nights ? Math.round(lodging / nights / 1000) / 10 : 0, solo: solo.toFixed(1) };
}

export function BigCourse({ c, wide }: { c: Course; wide?: boolean }) {
  const s = courseSeason(c); const st = courseStats(c);
  return (
    <article className={`lift card rounded-3xl overflow-hidden flex flex-col ${wide ? 'lg:col-span-7' : 'lg:col-span-5'}`}>
      <Link to={`/plan?course=${c.id}`} className="zoom relative block h-[240px] lg:h-[380px] overflow-hidden" aria-label={`${c.name} 코스로 일정 시작`}>
        <Photo k={c.photo} />
        <span className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[rgba(15,22,40,.78)] to-transparent" aria-hidden="true" />
        <span className="absolute left-4 top-4 flex gap-2 flex-wrap"><span className="px-3 py-1 rounded-full bg-card/95 text-[13px] font-bold text-primary">추천 코스 {c.id}</span><Badge kind={s.kind} size="sm">{s.text}</Badge></span>
        <span className="absolute left-5 right-5 bottom-4 text-white flex flex-col gap-1"><span className="text-[13px] font-bold tracking-[.08em] uppercase opacity-90">{c.regions.join(' · ')}</span><span className="text-[22px] lg:text-[26px] font-extrabold tracking-[-0.02em] leading-tight">{c.name} ({c.days}일)</span><span className="text-[14px] opacity-90">{c.route}</span></span>
      </Link>
      <div className="p-5 lg:p-6 flex flex-col gap-4 flex-1">
        <dl className="m-0 grid grid-cols-3 gap-3">
          {[['추천 일정', `${st.nights}박 ${st.nights + 1}일`], ['1박 평균 숙소비', st.avg ? `약 ${st.avg}만원` : '—'], ['혼행 적합도', `${st.solo} / 5`]].map(([a, b]) => <div key={a} className="flex flex-col gap-0.5"><dt className="text-[13px] font-semibold text-slate">{a}</dt><dd className="m-0 text-[18px] font-bold">{b}</dd></div>)}
        </dl>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3 border-t rule">
          <span className="text-[14px] text-slate flex items-center gap-1.5"><Icon name="route" size={16} />{c.transport}</span>
          <Link to={`/plan?course=${c.id}`} className="btn btn-primary !min-h-11 !px-5 text-[14px]">이 코스로 일정 시작 <Icon name="chev" size={16} sw={2.4} /></Link>
        </div>
      </div>
    </article>
  );
}

export function TextCourse({ c }: { c: Course }) {
  const s = courseSeason(c); const st = courseStats(c);
  const hl = [...new Set(c.stops.filter((x) => x.nights > 0).map((x) => x.city))].slice(0, 3).map((id) => `${cityById(id).name} ${cityById(id).highlights[0] ?? ''}`.trim()); // 같은 도시를 두 번 들르는 코스는 한 번만
  return (
    <article className="lift card rounded-3xl p-5 lg:p-6 flex flex-col gap-3 lg:col-span-6">
      <div className="flex flex-wrap items-center gap-2"><span className="px-3 py-1 rounded-full bg-saffron-t text-alert-d text-[13px] font-bold">추천 코스 {c.id}</span><Badge kind={s.kind} size="sm">{s.text}</Badge></div>
      <h3 className="m-0 text-[20px] lg:text-[22px] font-bold tracking-[-0.015em]">{c.name} ({c.days}일)</h3>
      <p className="m-0 text-[15px] leading-relaxed text-slate">{c.route} · {c.transport}</p>
      <ul className="m-0 p-0 list-none flex flex-wrap gap-2">{hl.map((h) => <li key={h} className="px-3 py-1.5 rounded-full bg-linen line text-[13px] font-semibold">{h}</li>)}</ul>
      <div className="mt-auto pt-3 flex flex-wrap items-center justify-between gap-3 border-t rule text-[14px]">
        <span className="text-slate">1박 평균 {st.avg ? `약 ${st.avg}만원` : '—'} · 도시 {stayCount(c)}곳</span>
        <Link to={`/plan?course=${c.id}`} className="btn bg-night text-on-night !min-h-11 !px-5 text-[14px]">이 코스로 시작</Link>
      </div>
    </article>
  );
}

