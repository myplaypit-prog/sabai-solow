import { useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { COURSES } from '../data/courses';
import { EVENTS } from '../data/events';
import { cityById } from '../data/cities';
import { TOURS } from '../data/tours';
import { Badge, Btn, Photo } from '../components/ui';
import { Icon } from '../components/Icon';
import { BigCourse, TextCourse, PickCitiesCard, ZONES } from '../components/CourseCards';
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
      <div className="field !h-[52px]"><select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="cursor-pointer">{children}</select><span className="pointer-events-none text-slate"><Icon name="chevd" size={18} /></span></div>
    </div>
  );
}

function QuickMatch() {
  const [days, setDays] = useState(8); const [pace, setPace] = useState<Intensity>('slow'); const [theme, setTheme] = useState(0);
  const pick = useMemo(() => rankCourses({ ...DEFAULT_INPUTS, whenMode: 'month', month: monthOf(todayISO()), start: undefined, end: undefined, days, intensity: pace, interests: THEMES[theme].i })[0].c, [days, pace, theme]);
  const qs = new URLSearchParams({ course: pick.id, days: String(days), pace, interests: THEMES[theme].i.join(',') }).toString();
  return (
    <section aria-labelledby="qm" className="card rounded-3xl p-5 lg:p-6 flex flex-col gap-4">
      <div className="flex justify-between items-center gap-3"><h2 id="qm" className="m-0 text-[18px] font-bold flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-saffron" aria-hidden="true" />1분 소도시 매칭</h2><span className="px-2.5 py-1 rounded-full bg-sage-t text-sage text-[13px] font-bold">이번 달 계절 반영</span></div>
      <div className="grid sm:grid-cols-3 lg:grid-cols-1 gap-3">
        <Select id="qm-days" label="여행 기간" value={days} onChange={(v) => setDays(+v)}>{DURATIONS.map((x) => <option key={x.d} value={x.d}>{x.l}</option>)}</Select>
        <Select id="qm-pace" label="이동 강도" value={pace} onChange={(v) => setPace(v as Intensity)}>{PACES.map((x) => <option key={x.v} value={x.v}>{x.l}</option>)}</Select>
        <Select id="qm-theme" label="선호 테마" value={theme} onChange={(v) => setTheme(+v)}>{THEMES.map((x, k) => <option key={x.l} value={k}>{x.l}</option>)}</Select>
      </div>
      <div aria-live="polite" className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 rounded-2xl bg-saffron-t text-[15px]">
        <span className="text-primary"><Icon name="star" size={18} /></span><b className="font-bold">추천: {pick.id} · {pick.name}</b><span className="text-slate">{pick.route}</span>
      </div>
      <Link to="/courses?view=cities" className="min-h-11 -my-1 self-center inline-flex items-center gap-1.5 text-[15px] font-bold text-primary"><Icon name="pin" size={16} />가고 싶은 도시가 있다면 직접 골라 보세요</Link>
      <Link to={`/plan?${qs}`} className="btn bg-night text-on-night hover:bg-night/90 w-full">이 조건으로 일정 만들기 <Icon name="arrow" size={18} sw={2.2} /></Link>
    </section>
  );
}

// 4대 안심 프로토콜: 문구는 서비스가 실제로 하는 일(규칙·데이터)만 적어요. 수치는 규칙에서 나오는 값만.
const PILLARS = [
  { n: '01', i: 'bed', tone: 'bg-saffron-t text-primary', kt: 'text-primary', t: '엄선 안심 숙소', d: '구글 평점 4.5+ 검증, 24시간 리셉션·1인 요금 숙소 우선, 1박 10만원 이하의 청결하고 조용한 소도시 로컬 스테이만 골라요.', sl: '숙소 평점 기준', sv: '4.5 이상', sc: 'text-sage' },
  { n: '02', i: 'bus', tone: 'bg-sky-t text-sky-d', kt: 'text-sky-d', t: '스마트 안전 교통', d: '야간 이동을 원하는 경우 외에는 21시 전 체크인 도착을 원칙으로 하고, 국철 여성 전용 침대칸과 정찰제 미니밴 노선을 먼저 배정해요.', sl: '야간 이동', sv: '원할 때만', sc: 'text-sky-d' },
  { n: '03', i: 'spark', tone: 'bg-sage-t text-sage', kt: 'text-sage', t: '윤리적 로컬 임팩트', d: '상업적 코끼리 탑승과 쇼는 전면 배제하고, 목욕·관찰 중심의 윤리적 보호소와 쿠킹클래스·트레킹 같은 소규모 로컬 체험을 연결해요.', sl: '탑승·쇼 투어', sv: '소개 안 함', sc: 'text-sage' },
  { n: '04', i: 'phone', tone: 'bg-saffron-t text-primary', kt: 'text-primary', t: '1초 태국어 카드', d: '기사님께 화면만 보여 주면 되는 큰 글씨 태국어 목적지 카드와 관광경찰 1155·대사관 비상 연락처를 바로 열 수 있어요.', sl: '오프라인 사용', sv: '데이터 없이 가능', sc: 'text-marine' },
];

const TABS = [{ l: '전체 보기', ids: 'ECABDFGH' }, ...ZONES.map((z) => ({ l: z.l, ids: z.ids as string }))];

function PickCitiesBar() {
  return (
    <div className="card rounded-3xl p-5 lg:px-7 bg-saffron-t flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
      <span className="w-11 h-11 rounded-2xl bg-card text-primary grid place-items-center shrink-0"><Icon name="pin" size={22} /></span>
      <span className="flex-1 flex flex-col gap-0.5"><b className="text-[17px]">가고 싶은 도시가 따로 있나요?</b><span className="text-[15px] text-slate">20개 소도시에서 마음 가는 곳을 담으면, 가까운 순서로 이어 나만의 루트를 짜 드려요.</span></span>
      <Link to="/courses?view=cities" className="btn btn-primary !min-h-12 self-start sm:self-auto"><Icon name="plus" size={18} sw={2.4} />도시 직접 고르기</Link>
    </div>
  );
}

function Courses() {
  const [tab, setTab] = useState(0);
  const ids = TABS[tab].ids;
  const list = [...COURSES].filter((c) => ids.includes(c.id)).sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
  const big = list.slice(0, 2), mid = list.slice(2, 4), rest = list.slice(4);
  return (
    <section id="courses" aria-labelledby="courses-h" className="wrap gutter pt-14 lg:pt-20 scroll-mt-24">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-4 mb-6 lg:mb-8">
        <div className="flex flex-col gap-2"><span className="kicker flex items-center gap-1.5"><Icon name="route" size={16} />엄선한 소도시 힐링 여정</span><h2 id="courses-h" className="m-0 text-[28px] lg:text-[36px] font-bold tracking-[-0.02em]">Sabai Solow 추천 코스 8선</h2><p className="m-0 text-[16px] text-slate">혼자라서 더 깊어지는 소도시의 온도. 무리 없는 이동으로 이은 느린 여정이에요.</p></div>
        <div role="tablist" aria-label="지역" className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">{TABS.map((t, k) => <button key={t.l} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className="chip whitespace-nowrap">{t.l}{k > 0 && ` (${t.ids.length})`}</button>)}</div>
      </div>
      <div className="grid lg:grid-cols-12 gap-4 lg:gap-5">
        {big.map((c, k) => <BigCourse key={c.id} c={c} wide={k === 0} />)}
        {mid.map((c) => <TextCourse key={c.id} c={c} />)}
        {mid.length < 2 && <PickCitiesCard className="lg:col-span-6" />}
      </div>
      {mid.length >= 2 && <div className="mt-4 lg:mt-5"><PickCitiesBar /></div>}
      {rest.length > 0 && (
        <div className="mt-4 lg:mt-5 card rounded-3xl p-5 lg:px-7 flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-6">
          <span className="flex items-center gap-2 font-bold"><span className="text-primary"><Icon name="compass" size={20} /></span>다른 코스도 살펴보세요</span>
          <ul className="m-0 p-0 list-none flex flex-wrap gap-2 flex-1">{rest.map((c) => <li key={c.id}><Link to={`/plan?course=${c.id}`} className="inline-flex items-center gap-1.5 min-h-11 px-3.5 rounded-full bg-oat hover:bg-hair text-[14px] font-semibold"><b className="text-primary">{c.id}</b>{c.name} ({c.days}일)</Link></li>)}</ul>
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
          <Link to="/season" className="inline-flex items-center gap-1.5 px-3 min-h-11 rounded-full bg-sage-t text-sage font-semibold"><Icon name="sun" size={16} />{m}월 · {tip.badgeText}<span className="hidden lg:inline"> — {tip.quote}</span></Link>
          {nd && <span className="inline-flex items-center gap-1.5 px-3 min-h-9 rounded-full bg-alert-t text-alert-d font-semibold"><Icon name="nodrink" size={16} />다음 금주일: {fmtMD(nd.from!)} ({nd.title})</span>}
          <span className="inline-flex items-center gap-1.5 px-3 min-h-9 rounded-full bg-sky-t text-sky-d font-semibold"><Icon name="moon" size={16} />안심 일정: 21시 전 숙소 도착</span>
        </div>
      </section>

      {/* 히어로 */}
      <section className="wrap gutter pt-8 lg:pt-12 grid lg:grid-cols-12 gap-6 lg:gap-8 lg:items-center">
        <div className="lg:col-span-7 flex flex-col gap-5 lg:gap-6">
          <span className="self-start inline-flex items-center gap-2 px-3.5 min-h-9 rounded-full bg-saffron-t text-alert-d text-[13px] font-bold"><Icon name="spark" size={16} />혼자 누리는 태국 소도시의 쉼표 여행</span>
          <h1 className="m-0 text-[36px] leading-[1.22] lg:text-[56px] lg:leading-[1.15] font-extrabold tracking-[-0.03em]">북적이는 방콕은 잠시 안녕,<br /><span className="text-primary">오롯이 나에게 집중하는</span><br />태국 소도시 힐링</h1>
          <p className="m-0 max-w-[600px] text-[17px] lg:text-[18px] leading-[1.65] text-slate">여행 시기와 취향만 알려 주세요. 방콕·푸켓 다음, 조용한 소도시로 가는 동선과 교통, 검증된 숙소, 현지 투어를 한 번에 짜 드려요.</p>
          <div className="flex flex-col sm:flex-row gap-3"><Btn to="/plan" kind="lagoon" className="!min-h-14 text-[16px]">나만의 맞춤 일정 만들기 (5단계)</Btn><a href="#courses" onClick={(e) => { e.preventDefault(); document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' }); }} className="btn btn-line !min-h-14 text-[16px]"><Icon name="compass" size={18} />추천 코스 8선 둘러보기</a></div>
        </div>
        <div className="lg:col-span-5"><QuickMatch /></div>
      </section>
      {/* 히어로 사진: 원본 비율(1376×768) 그대로 — 잘리지 않게 */}
      <section aria-label="오늘의 추천 장면" className="wrap gutter pt-6 lg:pt-8">
        <figure className="m-0 relative flex flex-col gap-3">
          <div className="zoom relative aspect-[43/24] rounded-3xl overflow-hidden shadow-lift">
            <Photo k="cafe" eager sizes="(min-width: 1280px) 1184px, 100vw" />
          </div>
          <figcaption className="card lg:glass lg:absolute lg:left-6 lg:bottom-6 lg:max-w-[400px] rounded-2xl p-4 flex flex-col gap-2">
            <span className="flex flex-wrap gap-2"><span className="px-3 py-1.5 rounded-full bg-oat text-[13px] font-bold">이번 달 추천: {top.id} · {top.name}</span><span className="px-3 py-1.5 rounded-full bg-mango text-fixedink text-[13px] font-bold inline-flex items-center gap-1"><Icon name="star" size={14} />혼행 적합 {heroCity.solo}.0</span></span>
            <span className="flex items-center gap-2 text-[16px] font-bold"><span className="text-primary"><Icon name="pin" size={18} /></span>“나만의 속도로 머무는 숲속 정원”</span>
            <span className="text-[14px] text-slate">{heroCity.name} · {heroCity.summary}. {heroCity.point}.</span>
            <span className="flex flex-wrap gap-2 pt-1"><Badge kind="safe" size="sm">안심 일정 기본 켜짐</Badge><span className="px-2.5 py-1 rounded-full bg-sky-t text-sky-d text-[13px] font-bold">1박 10만원 이하</span></span>
          </figcaption>
        </figure>
      </section>

      {/* 4대 안심 프로토콜 */}
      <section aria-labelledby="pillars" className="wrap gutter pt-14 lg:pt-20">
        <div className="grid lg:grid-cols-12 gap-4 lg:gap-8 lg:items-end mb-6 lg:mb-8">
          <div className="lg:col-span-7 flex flex-col gap-3">
            <span className="kicker flex items-center gap-2"><Icon name="shield" size={16} />Sabai Solow 4-fold safety charter</span>
            <h2 id="pillars" className="m-0 text-[28px] lg:text-[40px] leading-[1.25] font-extrabold tracking-[-0.02em]">혼자 여행하는 이들을 지키는 4대 안심 프로토콜</h2>
          </div>
          <p className="lg:col-span-5 m-0 text-[16px] leading-relaxed text-slate">혼자 걷는 자유는 지키고 불안은 덜어내요. 외교부 여행경보 지역은 빼고, 숙소·교통·투어마다 혼행 기준을 걸어 둔 깐깐한 원칙이에요.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PILLARS.map((p) => (
            <article key={p.n} className="lift card rounded-3xl p-5 lg:p-6 flex flex-col gap-3">
              <span className={`w-12 h-12 rounded-2xl grid place-items-center ${p.tone}`}><Icon name={p.i} size={24} /></span>
              <span className={`mt-3 text-[13px] font-bold tracking-[.06em] ${p.kt}`}>PROTOCOL {p.n}</span>
              <h3 className="m-0 text-[21px] font-extrabold leading-snug tracking-[-0.01em]">{p.t}</h3>
              <p className="m-0 text-[16px] leading-relaxed text-slate flex-1">{p.d}</p>
              <p className="m-0 mt-2 rounded-2xl bg-oat px-4 py-3 flex items-center justify-between gap-3 text-[14px]"><span className="font-semibold">{p.sl}</span><b className={`font-extrabold ${p.sc}`}>{p.sv}</b></p>
            </article>
          ))}
        </div>
      </section>

      <Courses />

      {/* 윤리적 로컬 투어 */}
      <section aria-labelledby="ethical" className="wrap gutter pt-14 lg:pt-20 grid lg:grid-cols-12 gap-6 lg:gap-8 items-center">
        <figure className="m-0 lg:col-span-6 relative flex flex-col gap-3">
          <div className="zoom relative aspect-[3/2] lg:aspect-[4/3] rounded-3xl overflow-hidden"><Photo k="elephant" /><span className="absolute left-4 top-4"><Badge kind="noride" /></span></div>
          <figcaption className="card lg:glass lg:absolute lg:left-4 lg:right-4 lg:bottom-4 rounded-2xl p-4 flex flex-col gap-1"><span className="text-[13px] font-bold text-sage">치앙마이 · 카오속 보호소</span><span className="text-[18px] font-bold">“코끼리와 나누는 조용한 교감”</span><span className="text-[14px] text-slate">혼자여도 어색하지 않은 소규모 반나절·하루 프로그램</span></figcaption>
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
            <span className="self-start inline-flex items-center gap-2 px-3 min-h-8 rounded-full bg-sage text-on-primary text-[13px] font-bold"><Icon name="download" size={16} />오프라인 저장 · 인쇄용 일정표</span>
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
