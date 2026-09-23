import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useApp } from '../state';
import { DEFAULT_INPUTS, planTrip, rankCourses, type PlanInputs, type Intensity } from '../lib/planner';
import { putTrip } from '../lib/trips';
import { periodInfo } from '../lib/period';
import { diffDays, todayISO, addDays, weekday } from '../lib/dates';
import { PeriodPanel } from '../components/PeriodPanel';
import { Timeline, TipCards } from '../components/SeasonTips';
import { Icon } from '../components/Icon';
import { Badge, Photo, seasonKind } from '../components/ui';
import { courseById } from '../data/courses';
import { cityById } from '../data/cities';
import { regionSeason } from '../data/seasons';
import type { Interest } from '../data/types';

const INTERESTS: { id: Interest; label: string; icon: string }[] = [
  { id: 'cafe', label: '감성 로컬 카페·미식 탐방', icon: 'bag' }, { id: 'nature', label: '원시림 정원 & 청량 자연 산책', icon: 'route' },
  { id: 'temple', label: '고요한 사원 & 역사 명상', icon: 'star' }, { id: 'yoga', label: '요가 클래스 & 온천 휴식', icon: 'sun' },
  { id: 'work', label: '조용한 리모트 워케이션', icon: 'link' }, { id: 'sea', label: '바다·섬 & 스노클링', icon: 'boat' },
];
const PACES: { v: Intensity; t: string; d: string; icon: string }[] = [
  { v: 'slow', t: '극강의 여유', d: '한 도시에 3박 이상 머물러요', icon: 'bed' },
  { v: 'normal', t: '황금 밸런스 (추천)', d: '도시당 2박 · 2~3개 마을', icon: 'route' },
  { v: 'busy', t: '발자국 부지런히', d: '도시당 1~1.5박 탐험형', icon: 'compass' },
];
const BUDGETS = [
  { v: 3, t: '가성비 로컬 게하', p: '~3만원', d: '전용 욕실 1인실 · 커뮤니티 라운지 중심' },
  { v: 6, t: '부티크 & 우드 호텔', p: '3~6만원대', d: '조용한 발코니·정원, 독서하기 좋은 곳' },
  { v: 10, t: '리버뷰 힐링 리조트', p: '6~10만원대', d: '강변 테라스·수영장이 있는 곳' },
];
const GEN_STEPS = ['도시 고르는 중', '이동 경로 맞추는 중', '숙소·투어 붙이는 중'];

function StepCard({ n, title, id, children, aside }: { n: string; title: string; id: string; children: ReactNode; aside?: string }) {
  return (
    <section aria-labelledby={id} className="card rounded-3xl p-5 lg:p-8 flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <h2 id={id} className="m-0 flex items-center gap-3 text-[20px] lg:text-[24px] font-bold tracking-[-0.015em]"><span className="min-w-9 h-9 px-2 rounded-full bg-saffron-t text-primary grid place-items-center text-[14px] font-bold">{n}</span>{title}</h2>
        {aside && <span className="px-3 py-1 rounded-full bg-oat text-[12px] font-bold text-slate whitespace-nowrap">{aside}</span>}
      </div>
      {children}
    </section>
  );
}

function Toggle({ on, onChange, label, id }: { on: boolean; onChange: (v: boolean) => void; label: string; id: string }) {
  return <button id={id} type="button" role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)} className="w-16 h-11 grid place-items-center shrink-0"><span className={`w-14 h-8 rounded-full flex items-center px-1 transition-colors ${on ? 'bg-sage justify-end' : 'bg-hair-2 justify-start'}`}><span className="w-6 h-6 rounded-full bg-white shadow" /></span></button>;
}

export default function Plan() {
  const { user, ready, toast } = useApp();
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const rawPreset = sp.get('course') ?? undefined;
  const preset = rawPreset && courseById(rawPreset) ? rawPreset : undefined; // 잘못된 ?course= 값은 무시
  const qDays = Number(sp.get('days')); const qPace = sp.get('pace') as Intensity | null;
  const qInterests = (sp.get('interests') ?? '').split(',').filter((x): x is Interest => INTERESTS.some((i) => i.id === x));
  const isISO = (v: string | null): v is string => !!v && /^\d{4}-\d{2}-\d{2}$/.test(v);
  const qStart = sp.get('start'), qEnd = sp.get('end'); const qMonth = Number(sp.get('month'));
  const [gen, setGen] = useState(-1);
  const [showPeriod, setShowPeriod] = useState(false);
  const [inp, setInp] = useState<PlanInputs>(() => ({
    ...DEFAULT_INPUTS, courseId: preset, start: addDays(todayISO(), 27), end: addDays(todayISO(), 36),
    ...(qDays >= 3 && qDays <= 21 ? { whenMode: 'month' as const, month: (new Date().getMonth() + 1) % 12 + 1, days: qDays } : {}),
    ...(qMonth >= 1 && qMonth <= 12 ? { whenMode: 'month' as const, month: qMonth } : {}),
    ...(isISO(qStart) && isISO(qEnd) && qStart <= qEnd ? { whenMode: 'dates' as const, start: qStart, end: qEnd } : {}),
    ...(qPace && PACES.some((p) => p.v === qPace) ? { intensity: qPace } : {}),
    ...(qInterests.length ? { interests: qInterests } : {}),
  }));
  const set = (p: Partial<PlanInputs>) => setInp((x) => ({ ...x, ...p }));

  const next = `/plan${sp.toString() ? `?${sp.toString()}` : ''}`;
  useEffect(() => { if (ready && !user) nav('/login', { replace: true, state: { next } }); else if (ready && user && !user.verified) nav('/verify', { replace: true }); }, [ready, user, nav, next]);
  useEffect(() => { if (preset && !(qDays >= 3)) { const c = courseById(preset); if (c) set({ days: c.days, courseId: preset }); } }, [preset, qDays]);

  const dateDays = inp.whenMode === 'dates' && inp.start && inp.end ? diffDays(inp.start, inp.end) + 1 : null;
  const dateErr = dateDays === null ? null
    : dateDays < 1 ? '귀국일이 출발일보다 빨라요. 날짜를 다시 골라 주세요.'
    : dateDays < 3 || dateDays > 21 ? '여행 일수는 3~21일까지 짤 수 있어요. 날짜를 다시 골라 주세요.' : null;
  useEffect(() => { if (dateDays && dateDays >= 3 && dateDays <= 21) set({ days: dateDays }); }, [dateDays]);

  const whenOk = inp.whenMode === 'dates' ? !!(inp.start && inp.end) && !dateErr : inp.whenMode === 'month' ? !!inp.month : false;
  const canMake = whenOk && inp.interests.length > 0;
  const preview = useMemo(() => (inp.courseId ? courseById(inp.courseId) : rankCourses(inp)[0].c), [inp]);
  const draft = useMemo(() => (whenOk ? planTrip(inp, 'preview') : null), [inp, whenOk]);
  const period = useMemo(() => (inp.whenMode === 'dates' && inp.start && inp.end && !dateErr ? periodInfo({ start: inp.start, end: inp.end }) : inp.whenMode === 'month' && inp.month ? periodInfo({ month: inp.month }) : null), [inp.whenMode, inp.start, inp.end, inp.month, dateErr]);

  const make = async () => {
    if (!user || !canMake) return;
    setGen(0);
    const t0 = Date.now();
    const trip = planTrip(inp, user.id);
    for (let k = 1; k < 3; k++) { await new Promise((r) => setTimeout(r, 550)); setGen(k); }
    await new Promise((r) => setTimeout(r, Math.max(0, 1600 - (Date.now() - t0))));
    try { await putTrip(trip); nav(`/trip/${trip.id}`); } catch { setGen(-1); toast('일정을 저장하지 못했어요. 다시 시도해 주세요.'); }
  };

  if (gen >= 0) return (
    <main className="wrap gutter py-20 lg:py-32 flex flex-col items-center text-center gap-8" aria-live="polite">
      <div className="w-[240px] h-[170px] rounded-3xl overflow-hidden shadow-lift -rotate-2"><Photo k="songthaew" eager /></div>
      <h1 className="m-0 text-[30px] lg:text-[44px] font-extrabold tracking-[-0.03em]">일정을 만들고 있어요</h1>
      <ol className="m-0 p-0 list-none flex flex-col gap-3 text-[17px] font-semibold">{GEN_STEPS.map((g, i) => <li key={g} className={`flex items-center gap-3 ${i <= gen ? '' : 'text-slate'}`}><span className={i < gen ? 'text-sage' : 'text-primary'}><Icon name={i < gen ? 'check' : 'clock'} sw={2.4} /></span>{g}{i === gen ? '…' : ''}</li>)}</ol>
    </main>
  );

  const monthLabel = (m: number) => { const s = regionSeason('북부', m); return `${m}월 (${s.text.split(' · ')[1] ?? s.text})`; };
  const whenSummary = inp.whenMode === 'dates' && inp.start && inp.end ? `${inp.start.slice(5).replace('-', '.')} ~ ${inp.end.slice(5).replace('-', '.')}` : inp.whenMode === 'month' && inp.month ? monthLabel(inp.month) : '시기 팁 보는 중';
  const budget = BUDGETS.find((b) => b.v === inp.budget) ?? BUDGETS[2];
  const TRACK = [
    { t: '여행 시기', s: whenSummary, ok: whenOk }, { t: '일정 & 예산', s: `${inp.days}일 · ${budget.t.split(' ')[0]}`, ok: true },
    { t: '이동 강도', s: PACES.find((p) => p.v === inp.intensity)!.d.split(' · ')[0], ok: true },
    { t: '관심사', s: inp.interests.length ? `${inp.interests.length}개 선택` : '골라 주세요', ok: inp.interests.length > 0 },
    { t: '안심 옵션', s: inp.safe ? '안심 일정 ON' : '끔', ok: true },
  ];
  const routeStops = draft ? draft.stops.filter((s) => s.nights > 0) : preview.stops.filter((s) => s.nights > 0);
  const firstLeg = draft?.days[0]?.legs[0];
  const r0 = period?.regions[0];

  return (
    <main className="pb-40">
      {/* 머리 */}
      <section className="wrap gutter pt-8 lg:pt-12 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
        <div className="flex flex-col gap-3 max-w-[720px]">
          <span className="self-start inline-flex items-center gap-2 px-3 min-h-8 rounded-full bg-saffron-t text-alert-d text-[12px] font-bold tracking-[.06em]"><span className="w-1.5 h-1.5 rounded-full bg-saffron" aria-hidden="true" />SABAI SOLOW 맞춤 동선 진단</span>
          <h1 className="m-0 text-[32px] leading-[1.25] lg:text-[48px] lg:leading-[1.2] font-extrabold tracking-[-0.03em]">나만을 위한 느긋한 <span className="text-primary">소도시 여정</span> 만들기</h1>
          <p className="m-0 text-[16px] lg:text-[17px] leading-relaxed text-slate">치앙마이부터 빠이, 난, 치앙칸까지. 체류 리듬과 안심 기준에 맞춘 무리 없는 슬로우 일정을 5단계로 설계해요.</p>
        </div>
        <div className="card rounded-2xl px-4 py-3 flex items-center gap-3 self-start lg:self-auto"><span className="w-10 h-10 rounded-full bg-sage-t text-sage grid place-items-center"><Icon name="shield" size={20} /></span><span className="flex flex-col"><b className="text-[15px]">1인 안심 원칙</b><span className="text-[13px] text-slate">외교부 여행경보 지역 제외 · 21시 전 도착</span></span></div>
      </section>

      {/* 5단계 진행 */}
      <div className="wrap gutter mt-6 lg:mt-8">
        <ol aria-label="진단 5단계" className="card rounded-3xl p-3 lg:p-4 m-0 list-none grid grid-cols-5 gap-1 lg:gap-3">
          {TRACK.map((x, i) => (
            <li key={x.t} className="flex flex-col lg:flex-row items-center lg:items-center gap-1.5 lg:gap-3 text-center lg:text-left min-w-0">
              <span className={`w-9 h-9 lg:w-10 lg:h-10 rounded-full grid place-items-center text-[14px] font-bold shrink-0 ${x.ok ? (i === 4 && inp.safe ? 'bg-sage text-white' : 'bg-primary text-on-primary') : 'bg-oat text-slate'}`}>{x.ok ? <Icon name="check" size={18} sw={2.6} /> : i + 1}</span>
              <span className="flex flex-col min-w-0"><span className="text-[12px] lg:text-[14px] font-bold truncate">{i + 1}. {x.t}</span><span className={`hidden sm:block text-[12px] lg:text-[13px] truncate ${x.ok ? 'text-primary' : 'text-slate'}`}>{x.s}</span></span>
            </li>
          ))}
        </ol>
      </div>

      <div className="wrap gutter mt-6 lg:mt-8 grid lg:grid-cols-12 gap-5 lg:gap-6 items-start">
        <div className="lg:col-span-8 flex flex-col gap-5 lg:gap-6">
          {/* 1. 여행 시기 */}
          <StepCard n="01" id="s1" title="언제 떠나고 싶으신가요?" aside="Step 1 / 5">
            <div role="tablist" aria-label="시기 입력 방식" className="flex p-1.5 rounded-full bg-oat gap-1 self-start flex-wrap">
              {([['dates', '구체적 날짜'], ['month', '월 선택'], ['undecided', '아직 미정']] as const).map(([v, l]) => (
                <button key={v} type="button" role="tab" aria-selected={inp.whenMode === v} onClick={() => set(v === 'month' ? { whenMode: 'month', month: inp.month ?? (new Date().getMonth() + 1) % 12 + 1 } : { whenMode: v })} className={`min-h-11 px-5 rounded-full text-[15px] ${inp.whenMode === v ? 'bg-card text-primary font-bold shadow-soft' : 'font-semibold text-slate'}`}>{l}</button>
              ))}
            </div>
            {inp.whenMode === 'dates' && <div className="flex flex-col gap-3">
              <div className="grid sm:grid-cols-[1fr_1fr_auto] gap-3 sm:items-end">
                <div className="flex flex-col gap-1.5"><label htmlFor="d-start" className="text-[14px] font-semibold text-slate">출발일</label><div className="field"><Icon name="calendar" /><input id="d-start" type="date" value={inp.start ?? ''} min={todayISO()} onChange={(e) => set({ start: e.target.value })} /><span className="text-slate pr-2">{inp.start ? weekday(inp.start) : ''}</span></div></div>
                <div className="flex flex-col gap-1.5"><label htmlFor="d-end" className="text-[14px] font-semibold text-slate">귀국일</label><div className="field"><Icon name="calendar" /><input id="d-end" type="date" value={inp.end ?? ''} min={inp.start} onChange={(e) => set({ end: e.target.value })} /><span className="text-slate pr-2">{inp.end ? weekday(inp.end) : ''}</span></div></div>
                {dateDays !== null && dateDays > 0 && <span className="h-14 px-5 rounded-xl bg-mango-t text-mango-d flex items-center text-[17px] font-bold whitespace-nowrap">{dateDays - 1}박 {dateDays}일</span>}
              </div>
              {dateErr ? <p role="alert" className="m-0 text-[15px] font-bold text-alert-d flex gap-2 items-center"><Icon name="alert" size={16} />{dateErr}</p> : <p className="m-0 text-[14px] text-slate flex gap-2 items-center"><Icon name="info" size={16} />여행 일수는 3~21일까지 짤 수 있어요.</p>}
            </div>}
            {inp.whenMode === 'month' && <fieldset className="m-0 p-0 border-0 flex flex-col gap-3">
              <div className="flex flex-wrap justify-between gap-2"><legend className="text-[14px] font-semibold text-slate">출발 희망 월을 선택하세요</legend><span className="text-[13px] font-semibold text-sage flex items-center gap-1"><Icon name="sun" size={14} />건기 추천 시즌 (11월~2월)</span></div>
              <div role="radiogroup" className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">{Array.from({ length: 12 }, (_, k) => k + 1).map((mm) => <button key={mm} type="button" role="radio" aria-checked={inp.month === mm} onClick={() => set({ month: mm })} className={`min-h-12 px-2 rounded-xl text-[14px] font-semibold ${inp.month === mm ? 'bg-primary text-on-primary shadow-cta' : 'bg-oat hover:bg-hair'}`}>{monthLabel(mm)}</button>)}</div>
            </fieldset>}
            {inp.whenMode === 'undecided' && <div className="flex flex-col gap-4">
              <p className="m-0 text-[15px] text-slate">시기별 장단점을 보고 한 달을 골라 주세요. 고른 달로 이어서 계획해요.</p>
              <Timeline />
              <TipCards onPick={(m) => { set({ whenMode: 'month', month: m }); toast(`${m}월로 계획을 이어가요`); }} />
            </div>}
            {period && r0 && (
              <div className="rounded-2xl bg-linen line p-4 lg:p-5 flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="m-0 text-[17px] font-bold flex items-center gap-2"><span className="text-primary"><Icon name="calendar" size={18} /></span>{period.label} 여행 정보</h3><Badge kind={seasonKind(r0.badge)} size="sm">북부 {r0.text}</Badge></div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="card rounded-2xl p-4 flex gap-3"><span className="w-10 h-10 rounded-xl bg-saffron-t text-primary grid place-items-center shrink-0"><Icon name="sun" size={20} /></span><span className="flex flex-col gap-0.5"><span className="text-[13px] font-semibold text-slate">계절 상태</span><b className="text-[15px]">{r0.text}</b><span className="text-[13px] text-slate">{r0.note}</span></span></div>
                  <div className="card rounded-2xl p-4 flex gap-3"><span className="w-10 h-10 rounded-xl bg-sky-t text-sky-d grid place-items-center shrink-0"><Icon name="bag" size={20} /></span><span className="flex flex-col gap-0.5"><span className="text-[13px] font-semibold text-slate">숙소 가격 경향</span><b className="text-[15px]">{period.price}</b></span></div>
                </div>
                {period.events.slice(0, 2).map((e) => <div key={e.id} className="rounded-2xl bg-alert-t p-4 flex gap-3"><span className="text-alert-d"><Icon name={e.type === 'no_alcohol' ? 'nodrink' : 'spark'} size={20} /></span><span className="flex flex-col gap-0.5 flex-1"><span className="flex flex-wrap justify-between gap-2"><b className="text-[15px] text-alert-d">{e.type === 'no_alcohol' ? '금주일' : '기간 내 축제'}: {e.title}</b><span className="text-[13px] font-bold text-alert-d">{e.dateText}</span></span><span className="text-[14px]">{e.cities === 'all' ? '전국' : e.cities.map((c) => cityById(c).name).join(', ')} · {e.message}{e.impact ? ` · ${e.impact}` : ''}</span></span></div>)}
                <button type="button" aria-expanded={showPeriod} onClick={() => setShowPeriod(!showPeriod)} className="self-start min-h-11 text-[15px] font-bold text-primary inline-flex items-center gap-1">지역별 계절·위험 요소 {showPeriod ? '접기' : '자세히'}<span className={showPeriod ? 'rotate-180' : ''}><Icon name="chevd" size={16} /></span></button>
                {showPeriod && <PeriodPanel start={inp.whenMode === 'dates' ? inp.start : undefined} end={inp.whenMode === 'dates' ? inp.end : undefined} month={inp.whenMode === 'month' ? inp.month : undefined} compact />}
              </div>
            )}
          </StepCard>

          {/* 2. 일수 & 예산 */}
          <StepCard n="02" id="s2" title="여행 일수와 숙소 예산 설정" aside="Step 2 / 5">
            <div className="rounded-2xl bg-linen line p-4 lg:p-5 flex flex-col gap-3">
              <div className="flex justify-between items-center gap-3"><span className="flex flex-col"><label htmlFor="days" className="text-[15px] font-bold">총 여행 기간</label><span className="text-[13px] text-slate">{dateDays ? '날짜로 정해졌어요. 바꾸려면 날짜를 고쳐 주세요.' : '소도시 간 이동 피로도를 감안한 추천: 6~9일'}</span></span><span className="card rounded-xl px-4 py-2 text-[26px] font-extrabold tracking-[-0.02em] whitespace-nowrap"><span className="text-primary">{inp.days - 1}</span><span className="text-[15px] font-bold mx-0.5">박</span> <span className="text-primary">{inp.days}</span><span className="text-[15px] font-bold ml-0.5">일</span></span></div>
              <input id="days" type="range" min={3} max={21} value={inp.days} disabled={!!dateDays} onChange={(e) => set({ days: +e.target.value })} className="w-full h-11 accent-[rgb(var(--primary))]" />
              <div className="flex justify-between text-[12px] text-slate"><span>3일 (단기 휴식)</span><span className="hidden sm:inline">7일 (추천)</span><span className="hidden sm:inline">14일 (슬로우 2주)</span><span>21일 (소도시 완주)</span></div>
            </div>
            <fieldset className="m-0 p-0 border-0 flex flex-col gap-3"><legend className="text-[15px] font-bold mb-3">1박 숙소 예산 상한 (1인 1실 기준)</legend>
              <div className="grid sm:grid-cols-3 gap-3">{BUDGETS.map((b) => { const on = inp.budget === b.v; return (
                <label key={b.v} className={`relative cursor-pointer rounded-2xl p-4 flex flex-col gap-1.5 ${on ? 'bg-card shadow-[inset_0_0_0_2px_rgb(var(--primary))]' : 'bg-oat hover:bg-hair'}`}>
                  <input type="radio" name="budget" className="sr-only" checked={on} onChange={() => set({ budget: b.v })} />
                  <span className="flex justify-between gap-2"><b className="text-[15px]">{b.t}</b>{on ? <span className="px-2 py-0.5 rounded-full bg-saffron-t text-alert-d text-[12px] font-bold">선택됨</span> : <span className="text-[13px] text-slate">{b.p}</span>}</span>
                  {on && <span className="text-[14px] font-bold text-primary">{b.p}</span>}
                  <span className="text-[13px] leading-snug text-slate">{b.d}</span>
                </label>); })}</div>
            </fieldset>
          </StepCard>

          {/* 3·4. 이동 강도 & 관심사 */}
          <StepCard n="03·04" id="s3" title="이동 강도와 취향 태그" aside="Step 3 & 4">
            <fieldset className="m-0 p-0 border-0 flex flex-col gap-3"><legend className="text-[15px] font-bold mb-3">이동 리듬 (도시별 체류 박수)</legend>
              <div className="grid sm:grid-cols-3 gap-3">{PACES.map((p) => { const on = inp.intensity === p.v; return (
                <label key={p.v} className={`cursor-pointer rounded-2xl p-4 flex items-center justify-between gap-3 ${on ? 'bg-card shadow-[inset_0_0_0_2px_rgb(var(--primary))]' : 'bg-oat hover:bg-hair'}`}>
                  <input type="radio" name="pace" className="sr-only" checked={on} onChange={() => set({ intensity: p.v })} />
                  <span className="flex flex-col gap-0.5"><b className={`text-[15px] ${on ? 'text-primary' : ''}`}>{p.t}</b><span className="text-[13px] text-slate">{p.d}</span></span>
                  <span className={on ? 'text-primary' : 'text-slate'}><Icon name={p.icon} size={22} /></span>
                </label>); })}</div>
            </fieldset>
            <div className="rounded-2xl bg-linen line p-4 flex items-center gap-4"><span className="flex-1 flex flex-col"><label htmlFor="night" className="text-[15px] font-bold">야간 이동 허용</label><span className="text-[13px] text-slate">야간열차 침대칸·VIP 야간버스로 하루를 아껴요. 안심 일정이 켜져 있으면 야간버스는 빼요.</span></span><Toggle id="night" on={inp.nightMove} onChange={(v) => set({ nightMove: v })} label="야간 이동 허용" /></div>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center"><span className="text-[15px] font-bold">나의 힐링 취향 (여러 개 선택)</span><span className="text-[13px] font-bold text-primary">{inp.interests.length}개 선택됨</span></div>
              <div className="flex flex-wrap gap-2">{INTERESTS.map((x) => { const on = inp.interests.includes(x.id); return <button key={x.id} type="button" aria-pressed={on} onClick={() => set({ interests: on ? inp.interests.filter((y) => y !== x.id) : [...inp.interests, x.id] })} className="chip">{on ? <Icon name="check" size={16} sw={2.6} /> : <Icon name={x.icon} size={16} />}{x.label}</button>; })}</div>
              {inp.interests.length === 0 && <p role="alert" className="m-0 text-[14px] font-bold text-alert-d">관심사를 하나 이상 골라 주세요.</p>}
            </div>
          </StepCard>
        </div>

        {/* 오른쪽: 분위기 · 안심 옵션 · 동선 미리보기 */}
        <aside className="lg:col-span-4 flex flex-col gap-5 lg:sticky lg:top-24">
          <figure className="zoom m-0 relative h-[240px] lg:h-[280px] rounded-3xl overflow-hidden shadow-soft">
            <Photo k={preview.photo} />
            <span className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-[rgba(15,22,40,.8)] to-transparent" aria-hidden="true" />
            <figcaption className="absolute left-4 right-4 bottom-4 text-white flex flex-col gap-1"><span className="text-[12px] font-bold tracking-[.06em] opacity-90">{inp.courseId ? '고른 코스' : '지금 조건에 맞는 코스'}</span><span className="text-[20px] font-extrabold leading-snug">{preview.id} · {preview.name}</span><span className="text-[13px] opacity-90">{preview.route}</span></figcaption>
          </figure>
          {inp.courseId && <Link to="/plan" onClick={() => set({ courseId: undefined })} className="-mt-2 self-start min-h-11 inline-flex items-center text-[14px] font-bold text-primary underline">조건에 맞게 자동으로 고르기</Link>}

          <section aria-labelledby="s5" className="card rounded-3xl p-5 lg:p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3"><h2 id="s5" className="m-0 flex items-center gap-3 text-[20px] font-bold"><span className="w-9 h-9 rounded-full bg-sage-t text-sage grid place-items-center text-[14px] font-bold">05</span><label htmlFor="safe">혼행 안심 옵션 팩</label></h2><Toggle id="safe" on={inp.safe} onChange={(v) => set({ safe: v })} label="안심 일정" /></div>
            <div className={`rounded-2xl p-4 flex flex-col gap-3 ${inp.safe ? 'bg-sage-t' : 'bg-oat'}`}>
              <b className={`text-[15px] flex items-center gap-2 ${inp.safe ? 'text-sage' : 'text-slate'}`}><Icon name="shield" size={18} />{inp.safe ? '안심 일정이 켜져 있어요' : '안심 일정이 꺼져 있어요'}</b>
              <p className="m-0 text-[14px] text-slate">성별은 묻지 않아요. 누구나 켤 수 있고, 아래 조건이 일정에 바로 반영돼요.</p>
              <ul className="m-0 p-0 list-none flex flex-col gap-2.5 text-[14px]">{[['도시 도착은 21시 이전', 'clock'], ['야간버스 대신 열차 침대칸, 여성 전용칸 열차 우선', 'train'], ['하루 이동 6시간 → 5시간', 'route'], ['24시간 리셉션·1인 요금 숙소 우선', 'bed'], ['소규모·숙소 픽업 포함 투어 우선', 'user']].map(([t, ic]) => <li key={t} className={`flex gap-2.5 ${inp.safe ? '' : 'text-slate'}`}><span className={inp.safe ? 'text-sage' : ''}><Icon name={ic} size={18} /></span>{t}</li>)}</ul>
            </div>
          </section>

          <section aria-labelledby="pv" className="card rounded-3xl p-5 flex flex-col gap-3">
            <h2 id="pv" className="m-0 text-[15px] font-bold flex items-center gap-2"><span className="text-primary"><Icon name="route" size={18} /></span>현재 조건 기반 동선 미리보기</h2>
            <ol className="m-0 p-0 list-none flex flex-wrap items-center gap-x-1.5 gap-y-2 text-[14px]">
              <li className="font-semibold">{cityById(preview.start).name}{firstLeg ? ` (${firstLeg.option.label})` : ''}</li>
              {routeStops.map((s, k) => <li key={s.city + k} className="flex items-center gap-1.5"><span className="text-slate"><Icon name="arrow" size={14} /></span><b className="text-primary">{cityById(s.city).name}</b><span className="text-slate">({s.nights}박)</span></li>)}
            </ol>
            {draft && <p className="m-0 text-[13px] text-slate">{draft.nights}박 {draft.days.length}일 · 총 이동 약 {draft.totalHours}시간{draft.warnings.some((w) => w.includes('넘는')) ? ' · 긴 이동 구간이 있어요' : ''}</p>}
            {!whenOk && <p className="m-0 text-[13px] text-slate">여행 시기를 정하면 날짜별 배지와 이동 시간을 계산해요.</p>}
          </section>
        </aside>
      </div>

      {/* 떠 있는 실행 바 */}
      <div className="fixed left-3 right-3 lg:left-1/2 lg:-translate-x-1/2 lg:w-[min(1184px,calc(100%-96px))] z-40 glass rounded-3xl px-4 py-3 lg:px-6 flex items-center gap-4" style={{ bottom: 'calc(12px + env(safe-area-inset-bottom, 0px))' }}>
        <span className="hidden md:flex items-center gap-3 flex-1 min-w-0"><span className="w-10 h-10 rounded-full bg-sage-t text-sage grid place-items-center shrink-0"><Icon name="shield" size={20} /></span><span className="flex flex-col min-w-0"><b className="text-[14px] truncate">외교부 여행경보 2단계 이상 지역은 동선에서 빼요</b><span className="text-[13px] text-slate truncate">{canMake ? `${preview.id} · ${preview.name} 기준으로 ${inp.days}일 일정을 만들어요` : !whenOk ? '1단계 여행 시기를 먼저 정해 주세요' : '관심사를 하나 이상 골라 주세요'}</span></span></span>
        <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="btn btn-ghost !min-h-12 !px-5 text-[14px] hidden sm:inline-flex">위로</button>
        <button type="button" onClick={make} disabled={!canMake} className="btn btn-primary !min-h-12 flex-1 md:flex-none text-[15px]"><Icon name="spark" size={18} />맞춤 일정 만들기</button>
      </div>
    </main>
  );
}
