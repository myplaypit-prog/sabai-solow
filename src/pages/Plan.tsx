import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useApp } from '../state';
import { DEFAULT_INPUTS, planTrip, rankCourses, type PlanInputs, type Intensity } from '../lib/planner';
import { putTrip } from '../lib/trips';
import { diffDays, todayISO, addDays, weekday } from '../lib/dates';
import { PeriodPanel } from '../components/PeriodPanel';
import { Timeline, TipCards } from '../components/SeasonTips';
import { Icon } from '../components/Icon';
import { Kicker, Photo } from '../components/ui';
import { courseById } from '../data/courses';
import type { Interest } from '../data/types';

const STEPS = ['여행 시기', '일수·예산', '이동 강도', '관심사', '안심 일정'];
const INTERESTS: { id: Interest; label: string }[] = [{ id: 'temple', label: '사원·역사' }, { id: 'cafe', label: '카페·미식' }, { id: 'nature', label: '자연·트레킹' }, { id: 'sea', label: '바다·섬' }, { id: 'yoga', label: '요가·휴식' }, { id: 'work', label: '워케이션' }];

function Progress({ cur }: { cur: number }) {
  return (<>
    <div className="lg:hidden gutter pt-3.5 flex flex-col gap-2"><div className="flex justify-between text-sm font-bold"><span>{STEPS[cur]}</span><span>{cur + 1} / 5</span></div>
      <div role="progressbar" aria-label="진단 진행" aria-valuemin={1} aria-valuemax={5} aria-valuenow={cur + 1} className="h-2 rounded-full bg-sand overflow-hidden"><div className="h-full bg-lagoon rounded-full transition-all" style={{ width: `${(cur + 1) * 20}%` }} /></div></div>
    <ol aria-label={`진단 5단계 중 ${cur + 1}단계`} className="hidden lg:flex m-0 wrap gutter pt-8 list-none gap-4">
      {STEPS.map((s, i) => <li key={s} className="flex-1 flex flex-col gap-2.5" aria-current={i === cur ? 'step' : undefined}><span className={`h-1.5 rounded-full ${i <= cur ? 'bg-lagoon' : 'bg-sand'}`} /><span className={`text-[15px] flex gap-2 ${i === cur ? 'font-extrabold' : i < cur ? 'font-semibold' : 'font-semibold text-muted'}`}><span className={`serif-i text-lg leading-none ${i === cur ? 'text-chili-d' : 'text-muted'}`}>0{i + 1}</span>{s}</span></li>)}
    </ol></>);
}

function RadioCard({ checked, onChange, title, desc, icon, name }: { checked: boolean; onChange: () => void; title: string; desc: string; icon: string; name: string }) {
  return (
    <label className={`flex-1 min-h-11 px-[18px] py-4 lg:px-6 lg:py-[22px] rounded-[22px] flex lg:flex-col items-center lg:items-stretch gap-3.5 cursor-pointer relative ${checked ? 'bg-paper shadow-[inset_0_0_0_2.5px_rgb(var(--lagoon))]' : 'line'}`}>
      <input type="radio" name={name} checked={checked} onChange={onChange} className="sr-only peer" />
      <div className="flex lg:justify-between items-center"><span className={checked ? 'text-lagoon' : ''}><Icon name={icon} size={28} /></span></div>
      <span className="flex flex-col gap-1 flex-1"><span className="text-[19px] lg:text-[22px] font-extrabold">{title}</span><span className="text-[15px] leading-snug text-muted">{desc}</span></span>
      <span className={`lg:absolute lg:top-6 lg:right-6 w-6 h-6 rounded-full grid place-items-center shrink-0 ${checked ? 'shadow-[inset_0_0_0_2px_rgb(var(--lagoon))]' : 'shadow-[inset_0_0_0_2px_rgb(var(--ink))]'} peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-chili-d`}>{checked && <span className="w-3 h-3 rounded-full bg-lagoon" />}</span>
    </label>
  );
}

function Toggle({ on, onChange, label, id }: { on: boolean; onChange: (v: boolean) => void; label: string; id: string }) {
  return <button id={id} type="button" role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)} className="w-16 h-11 grid place-items-center shrink-0"><span className={`w-16 h-9 rounded-full line flex items-center px-[3px] transition-colors ${on ? 'bg-lagoon justify-end' : 'bg-sand justify-start'}`}><span className="w-6 h-6 rounded-full bg-paper shadow" /></span></button>;
}

const GEN_STEPS = ['도시 고르는 중', '이동 경로 맞추는 중', '숙소·투어 붙이는 중'];

export default function Plan() {
  const { user, ready, toast } = useApp();
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const preset = sp.get('course') ?? undefined;
  const [step, setStep] = useState(0);
  const [tips, setTips] = useState(false);
  const [gen, setGen] = useState(-1);
  const [inp, setInp] = useState<PlanInputs>(() => ({ ...DEFAULT_INPUTS, courseId: preset, start: addDays(todayISO(), 27), end: addDays(todayISO(), 36) }));
  const set = (p: Partial<PlanInputs>) => setInp((x) => ({ ...x, ...p }));

  useEffect(() => { if (ready && !user) nav('/login', { replace: true, state: { next: `/plan${preset ? `?course=${preset}` : ''}` } }); else if (ready && user && !user.verified) nav('/verify', { replace: true }); }, [ready, user, nav, preset]);
  useEffect(() => { if (preset) { const c = courseById(preset); if (c) set({ days: c.days, courseId: preset }); } }, [preset]);

  const dateDays = inp.whenMode === 'dates' && inp.start && inp.end ? diffDays(inp.start, inp.end) + 1 : null;
  const dateErr = dateDays !== null && (dateDays < 3 || dateDays > 21) ? '여행 일수는 3~21일까지 짤 수 있어요. 날짜를 다시 골라 주세요.' : dateDays !== null && dateDays < 1 ? '귀국일이 출발일보다 빨라요.' : null;
  useEffect(() => { if (dateDays && dateDays >= 3 && dateDays <= 21) set({ days: dateDays }); }, [dateDays]);
  const preview = useMemo(() => (inp.courseId ? courseById(inp.courseId) : rankCourses(inp)[0].c), [inp]);

  const canNext = step === 0 ? (inp.whenMode === 'dates' ? !!(inp.start && inp.end) && !dateErr : inp.whenMode === 'month' ? !!inp.month : false) : step === 3 ? inp.interests.length > 0 : true;

  const make = async () => {
    if (!user) return;
    setGen(0);
    const t0 = Date.now();
    const trip = planTrip(inp, user.id);
    for (let k = 1; k < 3; k++) { await new Promise((r) => setTimeout(r, 550)); setGen(k); }
    await new Promise((r) => setTimeout(r, Math.max(0, 1600 - (Date.now() - t0))));
    try { await putTrip(trip); nav(`/trip/${trip.id}`); } catch { setGen(-1); toast('일정을 저장하지 못했어요. 다시 시도해 주세요.'); }
  };

  if (gen >= 0) return (
    <main className="wrap gutter py-20 lg:py-32 flex flex-col items-center text-center gap-8" aria-live="polite">
      <div className="grain w-[220px] h-[160px] rounded-[28px] overflow-hidden line -rotate-3"><Photo k="songthaew" /></div>
      <h1 className="m-0 text-[32px] lg:text-5xl font-extrabold tracking-[-0.04em]">일정을 만들고 있어요</h1>
      <ol className="m-0 p-0 list-none flex flex-col gap-3 text-lg font-bold">{GEN_STEPS.map((g, i) => <li key={g} className={`flex items-center gap-3 ${i <= gen ? '' : 'text-muted'}`}><span className={i < gen ? 'text-lagoon' : ''}><Icon name={i < gen ? 'check' : 'clock'} sw={2.4} /></span>{g}{i === gen ? '…' : ''}</li>)}</ol>
    </main>
  );

  if (tips) return (
    <main className="wrap gutter pt-6 lg:pt-12 pb-32 flex flex-col gap-6 lg:gap-9">
      <Progress cur={0} />
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-5"><div className="flex flex-col gap-3"><Kicker>Step 01 · 시기 미정</Kicker><h1 className="m-0 text-[32px] lg:text-[64px] leading-[1.15] font-extrabold tracking-[-0.05em]">언제 가면 좋을지,<br />시기별로 정리했어요</h1></div>
        <div role="tablist" aria-label="시기 입력 방식" className="flex p-1.5 rounded-full bg-sand gap-1 self-start lg:self-auto">
          <button type="button" role="tab" aria-selected={false} onClick={() => { setTips(false); set({ whenMode: 'dates' }); }} className="min-h-11 lg:min-h-12 px-5 rounded-full font-bold">기간 입력</button>
          <button type="button" role="tab" aria-selected={true} className="min-h-11 lg:min-h-12 px-5 rounded-full bg-night text-on-night font-extrabold">시기 팁</button></div></div>
      <Timeline />
      <TipCards onPick={(m) => { set({ whenMode: 'month', month: m }); setTips(false); toast(`${m}월로 계획을 이어가요`); }} />
    </main>
  );

  return (
    <main className="pb-32 lg:pb-[120px]">
      <Progress cur={step} />
      <div className="wrap gutter pt-6 lg:pt-12 grid lg:grid-cols-12 gap-x-8 gap-y-6 items-start">
        <div className="lg:col-span-7 flex flex-col gap-6 lg:gap-8">
          {step === 0 && <>
            <div className="flex justify-between items-end gap-6"><div className="flex flex-col gap-3"><Kicker>Step 01 · 여행 시기</Kicker><h1 className="m-0 text-[34px] lg:text-[64px] leading-[1.1] font-extrabold tracking-[-0.05em]">언제 떠나세요?</h1>
              <p className="m-0 hidden lg:block text-lg leading-relaxed max-w-[520px]">날짜를 넣으면 그 기간의 계절·가격·위험, 걸려 있는 축제와 금주일을 바로 보여 드려요.</p></div>
              <div className="grain w-24 h-[76px] lg:w-[200px] lg:h-[150px] rounded-2xl lg:rounded-3xl overflow-hidden shadow-[inset_0_0_0_3px_rgb(var(--ink))] -rotate-3 shrink-0"><Photo k="songthaew" /></div></div>
            <fieldset className="m-0 p-0 border-0 flex flex-col gap-3.5"><legend className="text-base font-extrabold mb-3.5">여행 시기 정하기</legend>
              <div className="flex flex-col lg:flex-row gap-2.5 lg:gap-3.5">
                <RadioCard name="when" checked={inp.whenMode === 'dates'} onChange={() => set({ whenMode: 'dates' })} title="날짜 지정" desc="출발일과 귀국일을 알아요" icon="calendar" />
                <RadioCard name="when" checked={inp.whenMode === 'month'} onChange={() => set({ whenMode: 'month', month: inp.month ?? new Date().getMonth() + 2 })} title="월만 지정" desc="가고 싶은 달만 정했어요" icon="sun" />
                <RadioCard name="when" checked={inp.whenMode === 'undecided'} onChange={() => set({ whenMode: 'undecided' })} title="아직 미정" desc="시기 팁을 보고 고를래요" icon="compass" />
              </div></fieldset>
            {inp.whenMode === 'dates' && <div className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
                <div className="flex-1 flex flex-col gap-2"><label htmlFor="d-start" className="text-[15px] font-bold">출발일</label><div className="field"><Icon name="calendar" /><input id="d-start" type="date" value={inp.start ?? ''} min={todayISO()} onChange={(e) => set({ start: e.target.value })} /><span className="text-muted pr-2">{inp.start ? weekday(inp.start) : ''}</span></div></div>
                <div className="flex-1 flex flex-col gap-2"><label htmlFor="d-end" className="text-[15px] font-bold">귀국일</label><div className="field"><Icon name="calendar" /><input id="d-end" type="date" value={inp.end ?? ''} min={inp.start} onChange={(e) => set({ end: e.target.value })} /><span className="text-muted pr-2">{inp.end ? weekday(inp.end) : ''}</span></div></div>
                {dateDays && dateDays > 0 && <span className="h-[60px] px-5 rounded-2xl bg-butter text-fixedink flex items-center text-lg font-extrabold whitespace-nowrap self-start sm:self-auto">{dateDays - 1}박 {dateDays}일</span>}
              </div>
              {dateErr ? <p role="alert" className="m-0 text-[15px] font-bold text-chili-d flex gap-2 items-center"><Icon name="alert" size={16} />{dateErr}</p> : <p className="m-0 text-[15px] text-muted flex gap-2 items-center"><Icon name="info" size={16} />여행 일수는 3~21일까지 짤 수 있어요.</p>}
            </div>}
            {inp.whenMode === 'month' && <fieldset className="m-0 p-0 border-0"><legend className="text-[15px] font-bold mb-3">가고 싶은 달</legend><div role="radiogroup" className="grid grid-cols-4 sm:grid-cols-6 gap-2">{Array.from({ length: 12 }, (_, k) => k + 1).map((mm) => <button key={mm} type="button" role="radio" aria-checked={inp.month === mm} onClick={() => set({ month: mm })} className="chip justify-center">{mm}월</button>)}</div></fieldset>}
            {inp.whenMode === 'undecided' && <div className="card rounded-3xl p-6 flex flex-col sm:flex-row gap-5 sm:items-center"><div className="flex-1 flex flex-col gap-2"><span className="text-xl font-extrabold">시기를 아직 못 정했다면</span><span className="text-[15px] text-muted leading-normal">최적기·우기·폭염기·연무기·걸프 우기를 카드로 정리했어요. 고른 달로 이어서 계획해요.</span></div><button type="button" onClick={() => setTips(true)} className="btn btn-lagoon h-14">시기 팁 보기 <Icon name="arrow" sw={2.4} /></button></div>}
          </>}

          {step === 1 && <>
            <div className="flex flex-col gap-3"><Kicker>Step 02 · 일수·예산</Kicker><h1 className="m-0 text-[34px] lg:text-[64px] leading-[1.1] font-extrabold tracking-[-0.05em]">며칠, 얼마나?</h1></div>
            <div className="card rounded-3xl p-6 flex flex-col gap-4"><div className="flex justify-between items-baseline"><label htmlFor="days" className="text-lg font-extrabold">여행 일수</label><span className="font-serif text-4xl">{inp.days}일</span></div>
              <input id="days" type="range" min={3} max={21} value={inp.days} disabled={!!dateDays} onChange={(e) => set({ days: +e.target.value })} className="w-full accent-[rgb(var(--lagoon))] h-11" />
              <span className="text-[15px] text-muted">{dateDays ? '날짜로 정해졌어요. 바꾸려면 1단계에서 날짜를 고쳐 주세요.' : '3~21일'}</span></div>
            <div className="card rounded-3xl p-6 flex flex-col gap-4"><div className="flex justify-between items-baseline"><label htmlFor="budget" className="text-lg font-extrabold">1박 숙소 예산 상한</label><span className="font-serif text-4xl">{inp.budget}만원</span></div>
              <input id="budget" type="range" min={3} max={10} value={inp.budget} onChange={(e) => set({ budget: +e.target.value })} className="w-full accent-[rgb(var(--lagoon))] h-11" />
              <span className="text-[15px] text-muted">기본 10만원 · 구글맵 평점 4.5 이상만 보여 드려요.</span></div>
          </>}

          {step === 2 && <>
            <div className="flex flex-col gap-3"><Kicker>Step 03 · 이동 강도</Kicker><h1 className="m-0 text-[34px] lg:text-[64px] leading-[1.1] font-extrabold tracking-[-0.05em]">얼마나 움직일까요?</h1></div>
            <fieldset className="m-0 p-0 border-0"><legend className="sr-only">이동 강도</legend><div className="flex flex-col lg:flex-row gap-2.5 lg:gap-3.5">
              {([['slow', '여유', '도시당 평균 3박', 'bed'], ['normal', '보통', '도시당 평균 2박', 'route'], ['busy', '부지런', '도시당 평균 1.5박', 'arrow']] as [Intensity, string, string, string][]).map(([v, t, d, ic]) => <RadioCard key={v} name="intensity" checked={inp.intensity === v} onChange={() => set({ intensity: v })} title={t} desc={d} icon={ic} />)}
            </div></fieldset>
            <div className="card rounded-3xl p-5 flex items-center gap-4"><div className="flex-1 flex flex-col gap-1"><label htmlFor="night" className="text-lg font-extrabold">야간 이동 허용</label><span className="text-[15px] text-muted">야간열차 침대칸·VIP 야간버스로 하루를 아껴요.</span></div><Toggle id="night" on={inp.nightMove} onChange={(v) => set({ nightMove: v })} label="야간 이동 허용" /></div>
          </>}

          {step === 3 && <>
            <div className="flex flex-col gap-3"><Kicker>Step 04 · 관심사</Kicker><h1 className="m-0 text-[34px] lg:text-[64px] leading-[1.1] font-extrabold tracking-[-0.05em]">무엇을 좋아하세요?</h1><p className="m-0 text-base text-muted">여러 개 골라도 돼요.</p></div>
            <div className="flex flex-wrap gap-2.5">{INTERESTS.map((x) => { const on = inp.interests.includes(x.id); return <button key={x.id} type="button" aria-pressed={on} onClick={() => set({ interests: on ? inp.interests.filter((y) => y !== x.id) : [...inp.interests, x.id] })} className="chip min-h-[52px] text-[17px] px-5">{on && <Icon name="check" size={18} sw={2.6} />}{x.label}</button>; })}</div>
            {inp.interests.length === 0 && <p role="alert" className="m-0 text-chili-d font-bold">관심사를 하나 이상 골라 주세요.</p>}
          </>}

          {step === 4 && <>
            <div className="flex flex-col gap-3"><Kicker>Step 05 · 안심 일정</Kicker><h1 className="m-0 text-[34px] lg:text-[64px] leading-[1.1] font-extrabold tracking-[-0.05em]">안심 일정을 켤까요?</h1><p className="m-0 text-base text-muted">성별은 묻지 않아요. 누구나 켤 수 있어요.</p></div>
            <div className="card rounded-3xl p-6 flex flex-col gap-5"><div className="flex items-center gap-4"><span className="text-lagoon"><Icon name="shield" size={30} /></span><label htmlFor="safe" className="flex-1 text-xl font-extrabold">안심 일정</label><Toggle id="safe" on={inp.safe} onChange={(v) => set({ safe: v })} label="안심 일정" /></div>
              <ul className="m-0 p-0 list-none flex flex-col gap-3 text-base">{[['clock', '도시 도착은 21시 이전으로'], ['train', '야간버스 대신 열차 침대칸, 여성 전용칸 있는 열차 우선'], ['route', '하루 최대 이동 6시간 → 5시간'], ['bed', '24시간 리셉션·여성 전용 층 숙소 우선'], ['user', '소규모·숙소 픽업 포함 투어 우선']].map(([ic, t]) => <li key={t} className={`flex gap-3 ${inp.safe ? '' : 'text-muted'}`}><Icon name={ic} />{t}</li>)}</ul></div>
          </>}

          <div className="hidden lg:flex justify-between items-center pt-6 border-t-[1.5px] rule">
            <button type="button" onClick={() => setStep(step - 1)} disabled={step === 0} className="btn btn-line min-h-14 disabled:opacity-40"><Icon name="back" size={18} />이전</button>
            {step < 4 ? <button type="button" disabled={!canNext} onClick={() => setStep(step + 1)} className="btn btn-lagoon h-[60px] text-lg">다음 · {STEPS[step + 1]} <Icon name="arrow" sw={2.4} /></button> : <button type="button" onClick={make} className="btn btn-lagoon h-[60px] text-lg">일정 만들기 <Icon name="arrow" sw={2.4} /></button>}
          </div>

        </div>
        <div className="lg:col-span-5 lg:row-span-2 lg:sticky lg:top-6">
          {inp.whenMode === 'dates' && inp.start && inp.end && !dateErr && <PeriodPanel start={inp.start} end={inp.end} />}
          {inp.whenMode === 'month' && inp.month && <PeriodPanel month={inp.month} />}
        </div>
        <div className="lg:col-span-7">
          <section className="grid sm:grid-cols-[220px_minmax(0,1fr)] rounded-[28px] overflow-hidden card" aria-label={`미리보기: ${preview.name}`}>
            <span className="zoom block h-40 sm:h-full min-h-[180px] overflow-hidden"><Photo k={preview.photo} /></span>
            <span className="p-6 flex flex-col gap-2.5 justify-center"><Kicker className="!text-chili-d">{inp.courseId ? '고른 코스' : '미리보기 · 지금 조건에 맞는 코스'}</Kicker>
              <span className="flex items-baseline gap-3"><span className="serif-i text-[56px] leading-[.8] text-lagoon">{preview.id}</span><span className="text-[26px] font-extrabold tracking-[-0.03em]">{preview.name}</span></span>
              <span className="text-base leading-normal">{inp.days}일 · {preview.route}</span>
              {!inp.courseId && <span className="text-sm text-muted">다음 단계에서 고르는 값에 따라 바뀔 수 있어요.</span>}
              {inp.courseId && <Link to="/plan" onClick={() => set({ courseId: undefined })} className="text-[15px] font-bold text-lagoon underline self-start min-h-11 inline-flex items-center">조건에 맞게 자동으로 고르기</Link>}</span>
          </section>
        </div>
      </div>
      <div className="lg:hidden fixed left-0 right-0 bottom-0 z-40 bg-paper border-t-[1.5px] rule px-4 pt-3 flex gap-2.5" style={{ paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))' }}>
        <button type="button" onClick={() => setStep(step - 1)} disabled={step === 0} className="btn btn-line h-14 disabled:opacity-40">이전</button>
        {step < 4 ? <button type="button" disabled={!canNext} onClick={() => setStep(step + 1)} className="btn btn-lagoon h-14 flex-1">다음 <Icon name="arrow" sw={2.4} /></button> : <button type="button" onClick={make} className="btn btn-lagoon h-14 flex-1">일정 만들기 <Icon name="arrow" sw={2.4} /></button>}
      </div>
    </main>
  );
}
