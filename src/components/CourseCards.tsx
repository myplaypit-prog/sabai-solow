import { Link } from 'react-router-dom';
import type { Course } from '../data/types';
import { Badge, Photo, seasonKind } from './ui';
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

export function FeatureCourse({ c, accent }: { c: Course; accent: string }) {
  const s = courseSeason(c);
  return (
    <article className="lift flex flex-col gap-5">
      <Link to={`/plan?course=${c.id}`} className="zoom grain relative block h-[240px] lg:h-[440px] rounded-[22px] lg:rounded-[28px] overflow-hidden" aria-label={`${c.name} 코스로 계획 시작`}>
        <Photo k={c.photo} /><span className="absolute left-3 bottom-3 lg:left-auto lg:bottom-auto lg:top-5 lg:right-5 z-[4]"><Badge kind={s.kind} size="sm">{s.text}</Badge></span>
      </Link>
      <div className="grid grid-cols-[64px_minmax(0,1fr)] lg:grid-cols-[120px_minmax(0,1fr)] gap-x-4 lg:gap-x-5 items-start">
        <span className="serif-i text-[72px] lg:text-[132px] leading-[.78]" style={{ color: accent }}>{c.id}</span>
        <div className="flex flex-col gap-2.5">
          <div className="flex flex-wrap items-baseline gap-x-3.5 gap-y-1"><h3 className="m-0 text-2xl lg:text-4xl font-extrabold tracking-[-0.035em]">{c.name}</h3><span className="text-base lg:text-lg font-bold">{c.days}일 · 도시 {stayCount(c)}곳</span></div>
          <p className="m-0 text-base lg:text-lg leading-relaxed">{c.route}</p>
          <p className="m-0 text-[15px] text-muted flex items-center gap-1.5"><Icon name="route" size={16} />{c.transport}</p>
        </div>
      </div>
    </article>
  );
}

export function SmallCourse({ c }: { c: Course }) {
  const s = courseSeason(c);
  return (
    <article className="lift flex flex-col gap-4">
      <Link to={`/plan?course=${c.id}`} className="zoom grain block h-[200px] lg:h-[260px] rounded-3xl overflow-hidden" aria-label={`${c.name} 코스로 계획 시작`}><Photo k={c.photo} /></Link>
      <div className="flex items-baseline gap-3.5 border-b-[1.5px] rule pb-3">
        <span className="serif-i text-[56px] leading-[.8] text-lagoon">{c.id}</span><h3 className="m-0 text-[22px] lg:text-[26px] font-extrabold tracking-[-0.03em] flex-1">{c.name}</h3><span className="text-base font-bold whitespace-nowrap">{c.days}일 · {stayCount(c)}곳</span>
      </div>
      <p className="m-0 text-base leading-relaxed">{c.route}</p>
      <span className="text-[15px] text-muted">{c.transport}</span>
      <div><Badge kind={s.kind}>{s.text}</Badge></div>
    </article>
  );
}

export function CourseRow({ c }: { c: Course }) {
  return (
    <Link to={`/plan?course=${c.id}`} className="grid grid-cols-[88px_minmax(0,1fr)_20px] gap-3.5 items-center py-3 border-t-[1.5px] rule">
      <span className="h-[72px] rounded-[14px] overflow-hidden block"><Photo k={c.photo} /></span>
      <span className="flex flex-col gap-1"><span className="text-lg font-extrabold"><span className="serif-i text-2xl text-lagoon mr-1.5">{c.id}</span>{c.name}</span><span className="text-[15px] text-muted">{c.days}일 · 도시 {stayCount(c)}곳</span></span>
      <Icon name="chev" />
    </Link>
  );
}
