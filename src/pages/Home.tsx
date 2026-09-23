import { useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { COURSES } from '../data/courses';
import { EVENTS } from '../data/events';
import { cityById } from '../data/cities';
import { TOURS } from '../data/tours';
import { cheapestStay } from '../data/stays';
import { Badge, Btn, Photo } from '../components/ui';
import { Icon } from '../components/Icon';
import { courseSeason, stayCount } from '../components/CourseCards';
import { monthTip } from '../components/Layout';
import { todayISO, monthOf, diffDays, fmtMD } from '../lib/dates';
import { DEFAULT_INPUTS, rankCourses, type Intensity } from '../lib/planner';
import type { Course, Interest, Region } from '../data/types';

export { monthTip };

/** 다가오는 금주일·축제(오늘 이후) */
export function upcomingEvents(n = 4) {
  const today = todayISO(); const m = monthOf(today);
  const withKey = EVENTS.map((e) => {
    if (e.from) return { e, dday: diffDays(today, e.from), active: e.to ? e.to >= today && e.from <= today : false };
    const ms = e.months ?? []; const next = ms.map((x) => (x - m + 12) % 12).sort((a, b) => a - b)[0] ?? 99;
    return { e, dday: next === 0 ? 0 : NaN, active: ms.includes(m) };
  });
  return withKey.filter((x) => (x.e.from ? (x.e.to ?? x.e.from) >= today : true))
    .sort((a, b) => (a.active === b.active ? 0 : a.active ? -1 : 1) || ((isNaN(a.dday) ? 400 : a.dday) - (isNaN(b.dday) ? 400 : b.dday)))
    .filter((x) => x.e.photo).slice(0, n);
}
const nextNoDrink = () => { const t = todayISO(); return EVENTS.filter((e) => e.type === 'no_alcohol' && e.from && e.from >= t).sort((a, b) => a.from!.localeCompare(b.from!))[0]; };

/** 코스 요약 수치(임시 숙소 데이터 기준) */
function courseStats(c: Course) {
  const stays = c.stops.filter((s) => s.nights > 0);
  const nights = stays.reduce((a, s) => a + s.nights, 0);
  const lodging = stays.reduce((a, s) => a + s.nights * (cheapestStay(s.city, 6)?.price ?? cheapestStay(s.city, 10)?.price ?? 0), 0);
  const solo = stays.reduce((a, s) => a + cityById(s.city).solo, 0) / Math.max(1, stays.length);
  return { nights, avg: nights ? Math.round(lodging / nights / 1000) / 10 : 0, solo: solo.toFixed(1) };
}

const DURATIONS = [{ d: 5, l: '4박 5일 (짧게)' }, { d: 8, l: '7박 8일 (추천)' }, { d: 11, l: '10박 11일 (일주)' }, { d: 14, l: '13박 14일 (길게)' }];
const PACES: { v: Intensity; l: string }[] = [{ v: 'slow', l: '느긋하게 (3박+)' }, { v: 'normal', l: '적당히 (도시당 2박)' }, { v: 'busy', l: '부지런히 (1~1.5박)' }];
const THEMES: { l: string; i: Interest[] }[] = [
  { l: '숲속 정원·로컬 카페', i: ['cafe', 'nature'] }, { l: '강변 목조가옥·노을', i: ['cafe', 'yoga'] },
  { l: '호수·바다·정글', i: ['sea', 'nature'] }, { l: '사원·역사 도시', i: ['temple'] },
];

function Select({ id, label, value, onChange, children }: { id: string; label: string; value: string | number; onChange: (v: string) => void; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 min-w-0">
      <label htmlFor={id} className="text-[13px] font-semibold text-slate">{label}</label>
      <div className="field !h-[52px]"><select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="cursor-pointer">{children}</select><Icon name="chevd" size={18} /></div>
    </div>
  );
}

function QuickMatch() {
  const [days, setDays] = useState(8); const [pace, setPace] = useState<Intensity>('slow'); const [theme, setTheme] = useState(0);
  const pick = useMemo(() => rankCourses({ ...DEFAULT_INPUTS, whenMode: 'month', month: monthOf(todayISO()), start: undefined, end: undefined, days, intensity: pace, interests: THEMES[theme].i })[0].c, [days, pace, theme]);
  const qs = new URLSearchParams({ course: pick.id, days: String(days), pace, interests: THEMES[theme].i.join(',') }).toString();
  return (
    <section aria-labelledby="qm" className="card rounded-3xl p-5 lg:p-6 flex flex-col gap-4">
      <div className="flex justify-between items-center gap-3"><h2 id="qm" className="m-0 text-[18px] font-bold flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-saffron" aria-hidden="true" />1분 소도시 매칭</h2><span className="px-2.5 py-1 rounded-full bg-sage-t text-sage text-[12px] font-bold">이번 달 계절 반영</span></div>
      <div className="grid sm:grid-cols-3 gap-3">
        <Select id="qm-days" label="여행 기간" value={days} onChange={(v) => setDays(+v)}>{DURATIONS.map((x) => <option key={x.d} value={x.d}>{x.l}</option>)}</Select>
        <Select id="qm-pace" label="이동 강도" value={pace} onChange={(v) => setPace(v as Intensity)}>{PACES.map((x) => <option key={x.v} value={x.v}>{x.l}</option>)}</Select>
        <Select id="qm-theme" label="선호 테마" value={theme} onChange={(v) => setTheme(+v)}>{THEMES.map((x, k) => <option key={x.l} value={k}>{x.l}</option>)}</Select>
      </div>
      <div aria-live="polite" className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 rounded-2xl bg-saffron-t text-[15px]">
        <span className="text-primary"><Icon name="star" size={18} /></span><b className="font-bold">추천: {pick.id} · {pick.name}</b><span className="text-slate">{pick.route}</span>
      </div>
      <Link to={`/plan?${qs}`} className="btn bg-night text-on-night hover:bg-night/90 w-full">이 조건으로 일정 만들기 <Icon name="arrow" size={18} sw={2.2} /></Link>
    </section>
  );
}

const PILLARS = [
  { k: 'STAY 01', i: 'star', t: '평점 4.5+ & 1박 10만원 이하 숙소', d: '구글맵 평점 4.5 이상, 1인 1실 기준 1박 10만원 이하만 보여 드려요. 1인 요금·24시간 리셉션·늦은 체크인 같은 혼행 태그를 함께 붙여요.', c: ['구글 평점 4.5 이상', '구글맵 최저가로 연결'] },
  { k: 'MOBILITY 02', i: 'train', t: '21시 전 도착 & 여성 전용칸 우선', d: '안심 일정을 켜면 늦은 도착편·야간버스를 빼고, 방콕–치앙마이 9/10호처럼 여성·유아 전용 침대칸이 있는 열차를 먼저 골라요.', c: ['하루 이동 5시간 이하', '야간버스 제외'] },
  { k: 'LOCAL 03', i: 'spark', t: '코끼리 탑승 없는 투어만', d: '코끼리 목욕·먹이 주기는 탑승·쇼가 없는 보호소만 소개해요. 쿠킹클래스·트레킹은 소규모·숙소 픽업 포함을 먼저 보여 드려요.', c: ['탑승·쇼 제외', '소규모 투어 우선'] },
  { k: 'ASSIST 04', i: 'phone', t: '태국어 목적지 카드 & 1155', d: '숙소·터미널 주소를 태국어 카드로 크게 보여 주고, 관광경찰 1155와 대사관 번호를 모아 뒀어요. 일정은 오프라인으로도 저장돼요.', c: ['오프라인 저장', '비상 연락처'] },
];

const REGION_TABS: { l: string; r: Region[] | null }[] = [{ l: '전체 보기', r: null }, { l: '북부 산간', r: ['북부'] }, { l: '이산 메콩강', r: ['동북부'] }, { l: '남부 정글·섬', r: ['안다만', '걸프', '동부'] }];

function BigCourse({ c, wide }: { c: Course; wide?: boolean }) {
  const s = courseSeason(c); const st = courseStats(c);
  return (
    <article className={`lift card rounded-3xl overflow-hidden flex flex-col ${wide ? 'lg:col-span-7' : 'lg:col-span-5'}`}>
      <Link to={`/plan?course=${c.id}`} className="zoom relative block h-[240px] lg:h-[300px] overflow-hidden" aria-label={`${c.name} 코스로 일정 시작`}>
        <Photo k={c.photo} />
        <span className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[rgba(15,22,40,.78)] to-transparent" aria-hidden="true" />
        <span className="absolute left-4 top-4 flex gap-2 flex-wrap"><span className="px-3 py-1 rounded-full bg-card/95 text-[12px] font-bold text-primary">추천 코스 {c.id}</span><Badge kind={s.kind} size="sm">{s.text}</Badge></span>
        <span className="absolute left-5 right-5 bottom-4 text-white flex flex-col gap-1"><span className="text-[12px] font-bold tracking-[.08em] uppercase opacity-90">{c.regions.join(' · ')}</span><span className="text-[22px] lg:text-[26px] font-extrabold tracking-[-0.02em] leading-tight">{c.name} ({c.days}일)</span><span className="text-[14px] opacity-90">{c.route}</span></span>
      </Link>
      <div className="p-5 lg:p-6 flex flex-col gap-4 flex-1">
        <dl className="m-0 grid grid-cols-3 gap-3">
          {[['추천 일정', `${st.nights}박 ${st.nights + 1}일`], ['1박 평균 숙소비', st.avg ? `약 ${st.avg}만원` : '—'], ['혼행 적합도', `${st.solo} / 5`]].map(([a, b]) => <div key={a} className="flex flex-col gap-0.5"><dt className="text-[12px] font-semibold text-slate">{a}</dt><dd className="m-0 text-[18px] font-bold">{b}</dd></div>)}
        </dl>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3 border-t rule">
          <span className="text-[14px] text-slate flex items-center gap-1.5"><Icon name="route" size={16} />{c.transport}</span>
          <Link to={`/plan?course=${c.id}`} className="btn btn-primary !min-h-11 !px-5 text-[14px]">이 코스로 일정 시작 <Icon name="chev" size={16} sw={2.4} /></Link>
        </div>
      </div>
    </article>
  );
}

function TextCourse({ c }: { c: Course }) {
  const s = courseSeason(c); const st = courseStats(c);
  const hl = c.stops.filter((x) => x.nights > 0).slice(0, 3).map((x) => `${cityById(x.city).name} ${cityById(x.city).highlights[0] ?? ''}`.trim());
  return (
    <article className="lift card rounded-3xl p-5 lg:p-6 flex flex-col gap-3 lg:col-span-6">
      <div className="flex flex-wrap items-center gap-2"><span className="px-3 py-1 rounded-full bg-saffron-t text-alert-d text-[12px] font-bold">추천 코스 {c.id}</span><Badge kind={s.kind} size="sm">{s.text}</Badge></div>
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

function Courses() {
  const [tab, setTab] = useState(0);
  const r = REGION_TABS[tab].r;
  const list = r ? COURSES.filter((c) => c.regions.some((x) => r.includes(x))) : [...COURSES].sort((a, b) => 'ECABDFGH'.indexOf(a.id) - 'ECABDFGH'.indexOf(b.id));
  const big = list.slice(0, 2), mid = list.slice(2, 4), rest = list.slice(4);
  return (
    <section id="courses" aria-labelledby="courses-h" className="wrap gutter pt-14 lg:pt-20 scroll-mt-24">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-4 mb-6 lg:mb-8">
        <div className="flex flex-col gap-2"><span className="kicker flex items-center gap-1.5"><Icon name="route" size={16} />엄선한 소도시 힐링 여정</span><h2 id="courses-h" className="m-0 text-[28px] lg:text-[36px] font-bold tracking-[-0.02em]">Sabai Solow 추천 코스 8선</h2><p className="m-0 text-[16px] text-slate">혼자서도 환승이 쉽고, 여행경보 지역을 뺀 동선이에요.</p></div>
        <div role="tablist" aria-label="지역" className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">{REGION_TABS.map((t, k) => <button key={t.l} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className="chip whitespace-nowrap">{t.l}{t.r && ` (${COURSES.filter((c) => c.regions.some((x) => t.r!.includes(x))).length})`}</button>)}</div>
      </div>
      <div className="grid lg:grid-cols-12 gap-4 lg:gap-5">
        {big.map((c, k) => <BigCourse key={c.id} c={c} wide={k === 0} />)}
        {mid.map((c) => <TextCourse key={c.id} c={c} />)}
      </div>
      {rest.length > 0 && (
        <div className="mt-4 lg:mt-5 card rounded-3xl p-5 lg:px-7 flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-6">
          <span className="flex items-center gap-2 font-bold"><span className="text-primary"><Icon name="compass" size={20} /></span>남은 코스도 준비돼 있어요</span>
          <ul className="m-0 p-0 list-none flex flex-wrap gap-2 flex-1">{rest.map((c) => <li key={c.id}><Link to={`/plan?course=${c.id}`} className="inline-flex items-center gap-1.5 min-h-10 px-3.5 rounded-full bg-oat hover:bg-hair text-[14px] font-semibold"><b className="text-primary">{c.id}</b>{c.name} ({c.days}일)</Link></li>)}</ul>
          <Link to="/courses" className="text-[15px] font-bold text-primary inline-flex items-center gap-1 min-h-11">코스 8선 전체 보기<Icon name="ext" size={16} /></Link>
        </div>
      )}
    </section>
  );
}

const STORIES = [
  { tag: '치앙칸 6일', badge: '혼행 만족', q: '메콩강변을 자전거로 달리기만 해도 마음이 풀렸어요.', b: '복잡하지 않은 작은 마을이라 걷기와 자전거로 충분했어요. 강변 목조 게스트하우스에서 아침마다 강을 보며 커피를 마셨어요.', cost: '약 50만원 (항공권 제외 5박)', who: '30대 · 디자인 직군', i: 'A' },
  { tag: '난 문화 투어 5일', badge: '초행 추천', q: '처음 혼자 떠난 해외여행이었는데 생각보다 편했어요.', b: '태국어 목적지 카드를 기사님께 보여 드리니 헷갈릴 일이 없었어요. 왓푼민 벽화 앞에서 조용히 보낸 시간이 가장 좋았어요.', cost: '약 40만원 (4박 5일)', who: '40대 · 사무직', i: 'B' },
  { tag: '카오속 & 트랑 7일', badge: '디지털 디톡스', q: '신호가 약한 수상방갈로에서 오랜만에 푹 잤어요.', b: '호수에서 카약을 타고, 트랑에서는 아침 딤섬을 먹었어요. 단체 투어에 합류하니 혼자여도 어색하지 않았어요.', cost: '약 65만원 (투어 포함 6박)', who: '30대 · 프리랜서', i: 'C' },
];

export default function Home() {
  const { m, tip } = monthTip();
  const nd = nextNoDrink();
  const top = rankCourses({ ...DEFAULT_INPUTS, whenMode: 'month', month: m, start: undefined, end: undefined })[0].c;
  const heroCity = cityById('chiangmai');
  const tours = TOURS.filter((t) => t.id !== 'zipline');
  return (
    <main>
      {/* 이달의 여행 브리핑 */}
      <section aria-label="이달의 여행 브리핑" className="bg-oat/60 border-b rule">
        <div className="wrap gutter py-3 flex flex-nowrap lg:flex-wrap items-center gap-2 lg:gap-3 text-[14px] overflow-x-auto no-scrollbar whitespace-nowrap">
          <span className="inline-flex items-center gap-2 px-3 min-h-9 rounded-full bg-card line font-bold"><span className="w-2 h-2 rounded-full bg-sage pulse-dot" aria-hidden="true" />이달의 여행 브리핑</span>
          <Link to="/season" className="inline-flex items-center gap-1.5 px-3 min-h-9 rounded-full bg-sage-t text-sage font-semibold"><Icon name="sun" size={16} />{m}월 · {tip.badgeText}<span className="hidden lg:inline"> — {tip.quote}</span></Link>
          {nd && <span className="inline-flex items-center gap-1.5 px-3 min-h-9 rounded-full bg-alert-t text-alert-d font-semibold"><Icon name="nodrink" size={16} />다음 금주일: {fmtMD(nd.from!)} ({nd.title})</span>}
          <span className="inline-flex items-center gap-1.5 px-3 min-h-9 rounded-full bg-sky-t text-sky-d font-semibold"><Icon name="moon" size={16} />안심 일정: 21시 전 숙소 도착</span>
        </div>
      </section>

      {/* 히어로 */}
      <section className="wrap gutter pt-8 lg:pt-12 grid lg:grid-cols-12 gap-6 lg:gap-8">
        <div className="lg:col-span-7 flex flex-col gap-5 lg:gap-6">
          <span className="self-start inline-flex items-center gap-2 px-3.5 min-h-9 rounded-full bg-saffron-t text-alert-d text-[13px] font-bold"><Icon name="spark" size={16} />30~50대를 위한 쉼표의 기술 · Sabai Solow</span>
          <h1 className="m-0 text-[36px] leading-[1.22] lg:text-[56px] lg:leading-[1.15] font-extrabold tracking-[-0.03em]">북적이는 방콕은 잠시 안녕,<br /><span className="text-primary">오롯이 나에게 집중하는</span><br />태국 소도시 힐링</h1>
          <p className="m-0 max-w-[600px] text-[17px] lg:text-[18px] leading-[1.65] text-slate">끝없는 블로그 검색에 지친 당신을 위해. 5단계 진단으로 평점 4.5+ 가성비 숙소, 혼자서도 안심되는 교통, 코끼리 탑승 없는 로컬 투어까지 한 번에 짜 드려요.</p>
          <div className="flex flex-col sm:flex-row gap-3"><Btn to="/plan" kind="lagoon" className="!min-h-14 text-[16px]">나만의 맞춤 일정 만들기 (5단계)</Btn><a href="#courses" onClick={(e) => { e.preventDefault(); document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' }); }} className="btn btn-line !min-h-14 text-[16px]"><Icon name="compass" size={18} />추천 코스 8선 둘러보기</a></div>
          <QuickMatch />
        </div>
        <div className="lg:col-span-5">
          <figure className="zoom m-0 relative h-[460px] lg:h-full lg:min-h-[640px] rounded-3xl overflow-hidden shadow-lift">
            <Photo k="cafe" eager />
            <span className="absolute left-4 top-4 right-4 flex flex-wrap justify-between gap-2">
              <span className="px-3 py-1.5 rounded-full bg-card/95 text-[13px] font-bold">이번 달 추천: {top.id} · {top.name}</span>
              <span className="px-3 py-1.5 rounded-full bg-mango text-fixedink text-[13px] font-bold inline-flex items-center gap-1"><Icon name="star" size={14} />혼행 적합 {heroCity.solo}.0</span>
            </span>
            <figcaption className="absolute left-4 right-4 bottom-4 glass rounded-2xl p-4 flex flex-col gap-2">
              <span className="flex items-center gap-2 text-[16px] font-bold"><span className="text-primary"><Icon name="pin" size={18} /></span>“나만의 속도로 머무는 숲속 정원”</span>
              <span className="text-[14px] text-slate">{heroCity.name} · {heroCity.summary}. {heroCity.point}.</span>
              <span className="flex flex-wrap gap-2 pt-1"><Badge kind="safe" size="sm">안심 일정 기본 켜짐</Badge><span className="px-2.5 py-1 rounded-full bg-sky-t text-sky-d text-[13px] font-bold">1박 10만원 이하</span></span>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* 4대 안심 원칙 */}
      <section aria-labelledby="pillars" className="wrap gutter pt-14 lg:pt-20">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-3 mb-6 lg:mb-8">
          <div className="flex flex-col gap-2"><span className="kicker">Sabai Solow safety &amp; comfort</span><h2 id="pillars" className="m-0 text-[28px] lg:text-[36px] font-bold tracking-[-0.02em]">30~50대 혼행자를 위한 4대 안심 원칙</h2><p className="m-0 text-[16px] text-slate">외로움은 줄이고, 안전은 챙기고, 나만의 호젓함은 지키는 방식이에요.</p></div>
          <span className="inline-flex items-center gap-2 px-3.5 min-h-10 rounded-full bg-sage-t text-sage text-[14px] font-bold self-start lg:self-auto"><Icon name="shield" size={16} />외교부 여행경보 2단계 이상 지역은 추천에서 제외</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PILLARS.map((p) => (
            <article key={p.k} className="lift card rounded-3xl p-5 lg:p-6 flex flex-col gap-3">
              <span className="w-11 h-11 rounded-xl bg-saffron-t text-primary grid place-items-center"><Icon name={p.i} size={22} /></span>
              <span className="text-[12px] font-bold tracking-[.08em] text-primary">{p.k}</span>
              <h3 className="m-0 text-[18px] font-bold leading-snug">{p.t}</h3>
              <p className="m-0 text-[15px] leading-relaxed text-slate flex-1">{p.d}</p>
              <ul className="m-0 p-0 list-none flex flex-wrap gap-1.5 pt-2 border-t rule">{p.c.map((x) => <li key={x} className="text-[13px] font-semibold px-2.5 py-1 rounded-full bg-oat">{x}</li>)}</ul>
            </article>
          ))}
        </div>
      </section>

      <Courses />

      {/* 윤리적 로컬 투어 */}
      <section aria-labelledby="ethical" className="wrap gutter pt-14 lg:pt-20 grid lg:grid-cols-12 gap-6 lg:gap-8 items-center">
        <figure className="zoom m-0 lg:col-span-6 relative h-[380px] lg:h-[520px] rounded-3xl overflow-hidden">
          <Photo k="elephant" />
          <span className="absolute left-4 top-4"><Badge kind="noride" /></span>
          <figcaption className="absolute left-4 right-4 bottom-4 glass rounded-2xl p-4 flex flex-col gap-1"><span className="text-[13px] font-bold text-sage">치앙마이 · 카오속 보호소</span><span className="text-[18px] font-bold">“코끼리와 나누는 조용한 교감”</span><span className="text-[14px] text-slate">혼자여도 어색하지 않은 소규모 반나절·하루 프로그램</span></figcaption>
        </figure>
        <div className="lg:col-span-6 flex flex-col gap-5">
          <span className="kicker !text-sage">Ethical &amp; restorative travel</span>
          <h2 id="ethical" className="m-0 text-[28px] lg:text-[36px] leading-[1.25] font-bold tracking-[-0.02em]">소비하는 관광이 아닌,<br /><span className="text-sage">마음이 차오르는 치유의 순간들</span></h2>
          <p className="m-0 text-[16px] leading-relaxed text-slate">깃발 단체 패키지나 상업적인 쇼 대신, 태국 소도시의 자연과 사람이 함께 사는 방식을 조용히 곁에서 바라봐요.</p>
          <ul className="m-0 p-0 list-none flex flex-col gap-3">
            {tours.map((t) => (
              <li key={t.id}><Link to={`/tours/${t.id}`} className="lift card rounded-2xl p-4 flex gap-4 items-start">
                <span className="w-11 h-11 rounded-xl bg-sage-t text-sage grid place-items-center shrink-0"><Icon name={t.id === 'elephant' ? 'spark' : t.id === 'cooking' ? 'bag' : 'route'} size={22} /></span>
                <span className="flex flex-col gap-1"><span className="text-[17px] font-bold">{t.name} <span className="text-[14px] font-medium text-slate">· {t.duration}</span></span><span className="text-[15px] leading-relaxed text-slate">{t.what}</span></span>
              </Link></li>
            ))}
          </ul>
        </div>
      </section>

      {/* 예시 후기 */}
      <section aria-labelledby="stories" className="wrap gutter pt-14 lg:pt-20">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-3 mb-6 lg:mb-8">
          <div className="flex flex-col gap-2"><span className="kicker">Solow journal</span><h2 id="stories" className="m-0 text-[28px] lg:text-[36px] font-bold tracking-[-0.02em]">먼저 다녀온 혼행자의 노트</h2><p className="m-0 text-[16px] text-slate">경비부터 혼자 밥 먹기 편한 곳까지, 이런 형식으로 후기를 모을 거예요.</p></div>
          <span role="note" className="inline-flex items-center gap-2 px-3.5 min-h-10 rounded-full bg-mango-t text-mango-d text-[14px] font-bold self-start lg:self-auto"><Icon name="info" size={16} />프로토타입 예시 후기예요 · 실제 후기가 아니에요</span>
        </div>
        <div className="grid lg:grid-cols-3 gap-4">
          {STORIES.map((s) => (
            <article key={s.i} className="card rounded-3xl p-5 lg:p-6 flex flex-col gap-3">
              <div className="flex justify-between gap-2"><span className="px-2.5 py-1 rounded-full bg-oat text-[13px] font-bold">{s.tag}</span><span className="px-2.5 py-1 rounded-full bg-mango-t text-mango-d text-[13px] font-bold">{s.badge}</span></div>
              <h3 className="m-0 text-[18px] font-bold leading-snug">“{s.q}”</h3>
              <p className="m-0 text-[15px] leading-relaxed text-slate flex-1">{s.b}</p>
              <div className="px-4 py-3 rounded-2xl bg-linen line flex justify-between gap-2 text-[14px]"><span className="text-slate">총 경비(예시)</span><b>{s.cost}</b></div>
              <div className="flex items-center gap-3 pt-1"><span className="w-10 h-10 rounded-full bg-night text-on-night grid place-items-center font-bold" aria-hidden="true">{s.i}</span><span className="text-[14px]"><b>예시 여행자 {s.i}</b><span className="block text-slate">{s.who}</span></span></div>
            </article>
          ))}
        </div>
      </section>

      {/* 안심 포켓 가이드 */}
      <section aria-labelledby="kit" className="wrap gutter pt-14 lg:pt-20">
        <div className="rounded-3xl bg-night text-on-night p-6 lg:p-10 grid lg:grid-cols-12 gap-6 items-center overflow-hidden relative">
          <div className="lg:col-span-8 flex flex-col gap-4 relative">
            <span className="self-start inline-flex items-center gap-2 px-3 min-h-8 rounded-full bg-sage text-white text-[13px] font-bold"><Icon name="download" size={16} />오프라인 저장 · 인쇄용 일정표</span>
            <h2 id="kit" className="m-0 text-[26px] lg:text-[34px] leading-[1.3] font-bold tracking-[-0.02em]">출발 전 꼭 챙기세요,<br className="lg:hidden" /> 태국 소도시 혼행 안심 포켓 가이드</h2>
            <p className="m-0 text-[16px] leading-relaxed text-white/85">숙소·터미널 태국어 목적지 카드, 비상 연락처, 금주일·축제 캘린더를 한곳에 모았어요. 일정은 오프라인으로 저장하거나 인쇄(PDF)해서 챙길 수 있어요.</p>
            <ul className="m-0 p-0 list-none flex flex-wrap gap-x-5 gap-y-2 text-[15px]">{['태국어 목적지 카드', '관광경찰 1155 · 대사관 번호', '1박 10만원 이하 숙소 기준'].map((x) => <li key={x} className="flex items-center gap-2"><span className="text-mango"><Icon name="check" size={18} sw={2.4} /></span>{x}</li>)}</ul>
          </div>
          <div className="lg:col-span-4 flex flex-col gap-3 relative">
            <Btn to="/safety" kind="lagoon" icon="shield" className="w-full">혼행 안심 팩 열기</Btn>
            <Link to="/season" className="btn w-full bg-white/10 text-white hover:bg-white/15"><Icon name="calendar" size={18} />금주일·축제 시기 가이드</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
