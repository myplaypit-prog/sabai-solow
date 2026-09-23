import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../state';
import { COURSES } from '../data/courses';
import { CITIES, cityById } from '../data/cities';
import { tourById } from '../data/tours';
import { ALL_CREDITS, GENERATED } from '../data/photos';
import { EMERGENCY, EMERGENCY_SRC } from '../components/Layout';
import { stayName } from '../data/stays';
import { listTrips, deleteTrip, getTrip, putTrip } from '../lib/trips';
import { deleteAll } from '../lib/auth';
import { storageMode } from '../lib/storage';
import { fmtDot, fmtMD, weekday, todayISO, addDays, diffDays } from '../lib/dates';
import type { Trip } from '../lib/planner';
import type { TourType } from '../data/types';
import { Badge, Btn, Kicker, Photo, ExtLink } from '../components/ui';
import { Icon } from '../components/Icon';
import { BigCourse, TextCourse } from '../components/CourseCards';
import { PeriodPanel } from '../components/PeriodPanel';
import { Timeline, TipCards } from '../components/SeasonTips';
import { TourBlocks } from '../components/TourSheet';

export function Courses() {
  const order = 'ECABDFGH'.split('').map((id) => COURSES.find((c) => c.id === id)!);
  return (
    <main className="wrap gutter pt-8 lg:pt-12 pb-28 lg:pb-16 flex flex-col gap-10 lg:gap-14">
      <div className="flex flex-col gap-3"><span className="kicker flex items-center gap-1.5"><Icon name="route" size={16} />엄선한 소도시 힐링 여정</span><h1 className="m-0 text-[32px] lg:text-[48px] leading-[1.2] font-extrabold tracking-[-0.03em]">Sabai Solow 추천 코스 <span className="text-primary">8선</span></h1><p className="m-0 max-w-[640px] text-[17px] leading-relaxed text-slate">카드를 누르면 그 코스로 계획을 시작해요. 20개 소도시 가운데 외교부 여행경보 지역은 모두 뺐어요. 숙소비는 임시 데이터 기준 어림값이에요.</p></div>
      <h2 className="sr-only">추천 코스 8선</h2>
      <div className="grid lg:grid-cols-12 gap-4 lg:gap-5">
        {order.slice(0, 2).map((c, k) => <BigCourse key={c.id} c={c} wide={k === 0} />)}
        {order.slice(2, 4).map((c, k) => <BigCourse key={c.id} c={c} wide={k === 1} />)}
        {order.slice(4).map((c) => <TextCourse key={c.id} c={c} />)}
      </div>
      <section aria-labelledby="cities" className="flex flex-col gap-5">
        <div className="flex flex-col gap-2"><span className="kicker">20 slow towns</span><h2 id="cities" className="m-0 text-[28px] lg:text-[36px] font-bold tracking-[-0.02em]">추천 소도시 20</h2></div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{CITIES.filter((c) => c.id !== 'bangkok').map((c) => (
          <article key={c.id} className="lift card rounded-3xl overflow-hidden flex flex-col"><div className="zoom h-40 overflow-hidden"><Photo k={c.photo} /></div>
            <div className="p-4 lg:p-5 flex flex-col gap-2 flex-1"><div className="flex justify-between items-center gap-2"><h3 className="m-0 text-[19px] font-bold">{c.name}</h3><span className="px-2.5 py-1 rounded-full bg-mango-t text-mango-d text-[12px] font-bold inline-flex items-center gap-1 whitespace-nowrap"><Icon name="star" size={13} />혼행 {c.solo}.0</span></div>
              <span className="text-[15px] leading-snug">{c.summary}</span><span className="text-[14px] text-slate leading-snug">{c.point}</span>
              <span className="mt-auto pt-2 flex flex-wrap gap-1.5"><span className="px-2.5 py-1 rounded-full bg-oat text-[12px] font-semibold">{c.region}</span><span className="px-2.5 py-1 rounded-full bg-oat text-[12px] font-semibold">추천 {c.stay}</span>{c.mountainRoad && <span className="px-2.5 py-1 rounded-full bg-sky-t text-sky-d text-[12px] font-semibold">산간 도로</span>}</span></div></article>))}</div>
        <p className="m-0 text-sm text-muted">혼행 적합도: 치안·대중교통·혼밥 환경·투어 참여 쉬움을 5점 만점으로 본 내부 초안 점수(현지 검수 필요).</p>
      </section>
    </main>
  );
}
export function Season() {
  const nav = useNavigate();
  const [mode, setMode] = useState<'dates' | 'tips'>('dates');
  const [start, setStart] = useState(addDays(todayISO(), 27)); const [end, setEnd] = useState(addDays(todayISO(), 36));
  const ok = diffDays(start, end) >= 0;
  return (
    <main className="wrap gutter pt-8 lg:pt-12 pb-28 lg:pb-40 flex flex-col gap-7">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-5"><div className="flex flex-col gap-3"><Kicker>Season guide</Kicker><h1 className="m-0 text-[36px] lg:text-[48px] leading-[1.1] font-extrabold tracking-[-0.03em]">언제 가면 좋을까요?</h1></div>
        <div role="tablist" aria-label="시기 입력 방식" className="flex p-1.5 rounded-full bg-oat gap-1 self-start">{(['dates', 'tips'] as const).map((m) => <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => setMode(m)} className={`min-h-11 px-5 rounded-full text-[15px] ${mode === m ? 'bg-card text-primary font-bold shadow-soft' : 'font-semibold text-slate'}`}>{m === 'dates' ? '기간 입력' : '시기 팁'}</button>)}</div></div>
      {mode === 'dates' ? (
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="flex flex-col gap-2"><label htmlFor="s-start" className="font-bold">출발일</label><div className="field"><Icon name="calendar" /><input id="s-start" type="date" value={start} onChange={(e) => setStart(e.target.value)} /><span className="text-muted pr-2">{weekday(start)}</span></div></div>
            <div className="flex flex-col gap-2"><label htmlFor="s-end" className="font-bold">귀국일</label><div className="field"><Icon name="calendar" /><input id="s-end" type="date" value={end} min={start} onChange={(e) => setEnd(e.target.value)} /><span className="text-muted pr-2">{weekday(end)}</span></div></div>
            {!ok && <p role="alert" className="m-0 font-bold text-chili-d">귀국일이 출발일보다 빨라요.</p>}
            <Btn to={ok ? `/plan?start=${start}&end=${end}` : '/plan'}>이 기간으로 계획하기</Btn>
          </div>
          <div className="lg:col-span-7">{ok && <PeriodPanel start={start} end={end} />}</div>
        </div>
      ) : (<><Timeline /><TipCards onPick={(m) => nav(`/plan?month=${m}`)} /></>)}
    </main>
  );
}

export function MyTrips() {
  const { user, ready, logout, toast } = useApp(); const nav = useNavigate();
  const [trips, setTrips] = useState<Trip[] | null>(null); const [confirm, setConfirm] = useState(false);
  useEffect(() => { if (ready && !user) nav('/login', { replace: true, state: { next: '/my' } }); if (user) listTrips(user.id).then(setTrips); }, [ready, user, nav]);
  if (!user) return null;
  return (
    <main className="wrap gutter pt-8 lg:pt-12 pb-28 lg:pb-40 flex flex-col gap-8">
      <div className="flex flex-col gap-3"><Kicker>My trips</Kicker><h1 className="m-0 text-[36px] lg:text-[48px] leading-[1.1] font-extrabold tracking-[-0.03em]">내 일정</h1><p className="m-0 text-muted">{user.email} · 저장 위치: {storageMode()} · 브라우저 데이터를 지우면 사라져요.</p></div>
      {trips === null ? <p aria-busy="true">불러오는 중…</p> : trips.length === 0 ? (
        <div className="card rounded-[28px] p-8 flex flex-col items-start gap-4"><span className="text-2xl font-extrabold">아직 만든 일정이 없어요</span><span>시기와 취향만 알려 주면 5분이면 초안이 나와요.</span><Btn to="/plan">첫 일정 만들기</Btn></div>
      ) : (
        <ul className="m-0 p-0 list-none grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{trips.map((t) => { const c = COURSES.find((x) => x.id === t.courseId)!; const d0 = t.days[0].date; return (
          <li key={t.id} className="card rounded-[26px] overflow-hidden flex flex-col">
            <Link to={`/trip/${t.id}`} className="block h-40 zoom overflow-hidden"><Photo k={c.photo} /></Link>
            <div className="p-5 flex flex-col gap-2">
              <Link to={`/trip/${t.id}`} className="min-h-11 inline-flex items-center text-xl font-extrabold hover:underline">{t.name}</Link>
              <span className="text-[15px]">{d0 ? `${fmtDot(d0)} 출발 · ` : `${t.month}월 · `}{t.nights}박 {t.days.length}일 · 도시 {t.cityIds.filter((x) => x !== 'bangkok').length}곳</span>
              <div className="flex gap-1.5 flex-wrap">{t.offline ? <Badge kind="rec" size="sm">오프라인 저장됨</Badge> : <Badge kind="holiday" size="sm">온라인에서만</Badge>}{t.inputs.safe && <Badge kind="safe" size="sm">안심 일정</Badge>}</div>
              <span className="text-sm text-muted">마지막 저장 {new Date(t.createdAt).toLocaleString('ko-KR')}</span>
              <button type="button" onClick={async () => { await deleteTrip(t.id); setTrips((xs) => (xs ?? []).filter((x) => x.id !== t.id)); toast('일정을 지웠어요', { label: '되돌리기', run: async () => { await putTrip(t); setTrips(await listTrips(t.userId)); } }); }} className="self-start min-h-11 text-[15px] font-bold text-chili-d flex items-center gap-1.5"><Icon name="trash" size={18} />일정 지우기</button>
            </div>
          </li>); })}</ul>
      )}
      <section className="card rounded-[28px] p-6 flex flex-col gap-4"><h2 className="m-0 text-2xl font-extrabold">계정 설정</h2>
        <div className="flex flex-wrap gap-2.5"><button type="button" onClick={() => toast('준비 중인 기능이에요')} className="btn btn-line">구글 계정 연결 · 준비 중</button><button type="button" onClick={() => toast('준비 중인 기능이에요')} className="btn btn-line">네이버 계정 연결 · 준비 중</button><Link to="/reset-password" className="btn btn-line">비밀번호 바꾸기</Link><button type="button" onClick={async () => { await logout(); nav('/'); }} className="btn btn-line">로그아웃</button></div>
        {!confirm ? <button type="button" onClick={() => setConfirm(true)} className="self-start min-h-11 font-bold text-chili-d">내 데이터 모두 삭제(회원 탈퇴)</button> :
          <div role="alert" className="p-4 rounded-2xl bg-lemon text-ink flex flex-col sm:flex-row gap-3 sm:items-center"><span className="flex-1 font-bold">계정과 모든 일정을 이 기기에서 바로 지워요. 되돌릴 수 없어요.</span><button type="button" onClick={() => setConfirm(false)} className="btn btn-line">취소</button><button type="button" onClick={async () => { await deleteAll(); await logout(); nav('/'); toast('모든 데이터를 지웠어요'); }} className="btn bg-chili-d text-cloud">모두 삭제</button></div>}
      </section>
    </main>
  );
}

const THAI_CITIES = ['chiangmai', 'chiangrai', 'lampang', 'phrae', 'nan', 'pai', 'maehongson', 'sukhothai', 'kanchanaburi', 'huahin', 'kohtao', 'trang', 'kohlipe'];
export function DestCard({ city, big, onClose }: { city: string; big?: boolean; onClose?: () => void }) {
  const c = cityById(city);
  return (
    <div className={big ? 'fixed inset-0 z-[80] bg-paper text-ink flex flex-col items-center justify-center gap-6 p-6 text-center' : 'card rounded-[22px] p-5 flex flex-col gap-2'} role={big ? 'dialog' : undefined} aria-modal={big || undefined} aria-label={big ? `${c.name} 태국어 목적지 카드` : undefined}>
      <span className={big ? 'text-[64px] sm:text-[120px] font-bold leading-tight' : 'text-3xl font-bold'} lang="th">{c.thai}</span>
      <span className={big ? 'text-2xl font-extrabold' : 'font-extrabold'}>{c.name} · [숙소 주소(태국어)]</span>
      <span className={big ? 'text-lg' : 'text-sm text-muted'}>기사님께 이 화면을 보여 주세요.</span>
      {big && <button type="button" onClick={onClose} className="btn btn-lagoon h-14">닫기</button>}
    </div>
  );
}
export function Safety() {
  const [big, setBig] = useState<string | null>(null);
  return (
    <main className="wrap gutter pt-8 lg:pt-12 pb-28 lg:pb-40 flex flex-col gap-8">
      <div className="flex flex-col gap-3"><Kicker>Safety pack</Kicker><h1 className="m-0 text-[36px] lg:text-[48px] leading-[1.1] font-extrabold tracking-[-0.03em]">혼행 안심 팩</h1><p className="m-0 text-muted">오프라인에서도 보이도록 글자 중심으로 만들었어요.</p></div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {EMERGENCY.map((e) => <section key={e.num} className="card rounded-[26px] p-6 flex flex-col gap-2"><span className="text-sm font-bold text-muted">{e.label}</span><a href={`tel:${e.tel}`} className="min-h-12 inline-flex items-center text-3xl lg:text-4xl font-extrabold leading-none select-all hover:text-primary">{e.num}</a><span className="text-[15px]">{e.note}</span></section>)}
        <section className="card rounded-[26px] p-6 flex flex-col gap-2"><span className="text-sm font-extrabold text-muted">여행경보</span><span className="text-[15px] leading-relaxed">송클라 42번 국도 이남·파타니·나라티왓·얄라, 태국–캄보디아 국경 50km 이내, 딱주, 매싸이·치앙센 국경검문소는 추천에서 모두 뺐어요.</span><span className="text-sm text-muted">2026-09-23 확인 · <ExtLink href={EMERGENCY_SRC} className="underline">외교부 해외안전여행</ExtLink> 기준 · 연락처도 같은 출처</span></section>
      </div>
      <section className="flex flex-col gap-4"><h2 className="m-0 text-2xl lg:text-3xl font-extrabold">태국어 목적지 카드</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">{THAI_CITIES.map((c) => <button key={c} type="button" onClick={() => setBig(c)} className="text-left"><DestCard city={c} /></button>)}</div>
        <p className="m-0 text-sm text-muted">카드를 누르면 크게 보여 줘요. 숙소 주소는 일정에서 숙소를 고르면 채워져요.</p></section>
      <section className="card rounded-[26px] p-6 flex flex-col gap-3"><h2 className="m-0 text-2xl font-extrabold">야간 이동 팁</h2>
        <ul className="m-0 pl-5 flex flex-col gap-2 text-[16px] leading-relaxed"><li>야간버스보다 열차 침대칸. 특급 9/10호(방콕–치앙마이), 31/32호(방콕–수랏타니 구간)에는 여성·유아 전용 침대칸이 있어요.</li><li>밤에는 그랩·볼트처럼 기록이 남는 호출 앱을 먼저 쓰세요. 스쿠터 렌탈은 권하지 않아요.</li><li>숙소 주소 태국어 카드와 일정표 공유 링크를 가족에게 보내 두세요.</li></ul></section>
      {big && <DestCard city={big} big onClose={() => setBig(null)} />}
    </main>
  );
}

export function PrintView() {
  const { id } = useParams(); const [t, setT] = useState<Trip | null>(null);
  useEffect(() => { if (id) getTrip(id).then(setT); }, [id]);
  if (!t) return <main className="p-10">불러오는 중…</main>;
  const inFrame = (() => { try { return window.top !== window.self; } catch { return true; } })();
  return (
    <main className="bg-paper text-ink">
      <div className="no-print wrap gutter py-4 flex flex-wrap gap-3 items-center justify-between border-b-[1.5px] rule"><Link to={`/trip/${t.id}`} className="btn btn-line"><Icon name="back" size={18} />일정으로</Link>
        {inFrame ? <span className="text-[15px] font-bold">인쇄용 화면이에요. 로컬에서 실행하면 브라우저 인쇄(Ctrl/⌘+P)로 PDF를 저장할 수 있어요.</span> : <button type="button" onClick={() => window.print()} className="btn btn-lagoon">인쇄 · PDF로 저장</button>}</div>
      <article className="print-page max-w-[800px] mx-auto px-6 py-10 flex flex-col gap-4"><span className="font-grot text-3xl font-extrabold">Sabai Solo<span className="text-chili">w</span></span><h1 className="m-0 text-4xl font-extrabold">{t.name}</h1>
        <p className="m-0 text-lg">{t.days[0].date ? `${fmtMD(t.days[0].date)} ~ ${fmtMD(t.days[t.days.length - 1].date!)}` : `${t.month}월`} · {t.nights}박 {t.days.length}일 · 총 이동 약 {t.totalHours}시간</p>
        <ul className="m-0 pl-5">{t.warnings.map((w) => <li key={w}>{w}</li>)}</ul>
        <PeriodPanel start={t.days[0].date} end={t.days[t.days.length - 1].date} month={t.days[0].date ? undefined : t.month} compact /></article>
      {t.days.map((d) => (
        <article key={d.n} className="print-page max-w-[800px] mx-auto px-6 py-8 flex flex-col gap-3 border-t border-hair">
          <h2 className="m-0 text-2xl font-extrabold">Day {d.n} · {cityById(d.city).name}{d.date ? ` · ${fmtDot(d.date)}(${weekday(d.date)})` : ''}</h2>
          {d.badges.map((b, i) => <p key={i} className="m-0 font-bold">[{b.text}] {b.message}</p>)}
          {d.legs.map((l) => <p key={l.from} className="m-0">이동: {cityById(l.from).name} → {cityById(l.to).name} · {l.option.label} {l.option.hoursText}</p>)}
          <ul className="m-0 pl-5">{d.slots.map((s, i) => <li key={i}><b>{s.label}</b> {s.text}</li>)}</ul>
          {d.tour && <div><b>투어: {tourById(d.tour).name}</b><TourBlocks id={d.tour as TourType} /></div>}
          {d.stay && <p className="m-0">숙소: {stayName(t.notes?.[`stay:${d.city}`]) ?? '아직 고르지 않았어요'} · 예약 번호: {t.notes?.[`res:${d.n}`] ?? '________'}</p>}
        </article>))}
      <article className="max-w-[800px] mx-auto px-6 py-8 flex flex-col gap-3 border-t border-hair"><h2 className="m-0 text-2xl font-extrabold">비상 연락처 · 태국어 목적지 카드</h2><p className="m-0">{EMERGENCY.map((e) => `${e.label} ${e.num}`).join(' · ')}</p>
        <div className="grid grid-cols-2 gap-3">{t.cityIds.filter((c) => c !== 'bangkok').map((c) => <DestCard key={c} city={c} />)}</div></article>
    </main>
  );
}

export function Credits() {
  return (
    <main className="wrap gutter pt-8 lg:pt-12 pb-28 lg:pb-40 flex flex-col gap-6"><Kicker>Photo credits</Kicker><h1 className="m-0 text-4xl lg:text-6xl font-extrabold tracking-[-0.03em]">사진 출처</h1><p className="m-0">실사 사진은 Unsplash 라이선스(무료, 상업적 이용 가능)로 쓰고 있어요. 홈 첫 화면 이미지는 Google Stitch로 만든 AI 생성 이미지예요. 공개 전 숙소 사진은 실제 숙소 사진으로 바꿔야 해요.</p>
      <ul className="m-0 p-0 list-none grid sm:grid-cols-2 lg:grid-cols-3 gap-2">{GENERATED.map((g) => <li key={g.key} className="flex gap-3 items-center p-2 rounded-2xl card"><span className="w-16 h-12 rounded-xl overflow-hidden block shrink-0"><Photo k={g.key} /></span><span className="text-[15px]"><b>{g.note}</b><span className="block text-sm text-muted">{g.key}</span></span></li>)}</ul>
      <ul className="m-0 p-0 list-none grid sm:grid-cols-2 lg:grid-cols-3 gap-2">{ALL_CREDITS.map((c) => <li key={c.key} className="flex gap-3 items-center p-2 rounded-2xl card"><span className="w-16 h-12 rounded-xl overflow-hidden block shrink-0"><Photo k={c.key} /></span><span className="text-[15px]"><ExtLink href={c.url} className="font-bold underline">{c.name}</ExtLink><span className="block text-sm text-muted">{c.key}</span></span></li>)}</ul></main>
  );
}

export function TourPage() {
  const { id } = useParams(); const t = tourById(id as TourType);
  if (!t) return <main className="p-10">투어를 찾을 수 없어요.</main>;
  return (
    <main className="wrap gutter pt-8 pb-28 flex flex-col gap-6"><div className="h-[260px] lg:h-[420px] rounded-[28px] overflow-hidden"><Photo k={t.photo} eager /></div>
      <Kicker>Local tour</Kicker><h1 className="m-0 text-4xl lg:text-6xl font-extrabold tracking-[-0.03em]">{t.name}</h1><span className="text-[15px]">{t.cities.map((c) => cityById(c).name).join(', ')} · {t.duration} · {t.priceBand}</span>
      {t.noRiding && <div><Badge kind="noride" /></div>}<h2 className="sr-only">투어 안내</h2><TourBlocks id={t.id} /></main>
  );
}

export function NotFound() {
  return (
    <main className="wrap gutter py-14 lg:py-24 pb-28 flex-1 grid lg:grid-cols-2 gap-8 items-center">
      <div className="flex flex-col gap-5 items-start">
        <Kicker>404 · Lost in the alley</Kicker>
        <h1 className="m-0 text-[32px] lg:text-[48px] leading-[1.2] font-extrabold tracking-[-0.03em]">골목을 잘못 들어왔어요</h1>
        <p className="m-0 text-[16px] leading-relaxed text-slate">찾는 페이지가 없거나 주소가 바뀌었어요. 홈에서 다시 시작하거나 바로 일정을 만들어 보세요.</p>
        <div className="flex flex-col sm:flex-row gap-3"><Btn to="/">홈으로</Btn><Btn to="/plan" kind="line" icon="spark">맞춤 일정 만들기</Btn></div>
      </div>
      <div className="h-[260px] lg:h-[380px] rounded-3xl overflow-hidden"><Photo k="songthaew" /></div>
    </main>
  );
}
