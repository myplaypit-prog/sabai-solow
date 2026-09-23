import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useApp } from '../state';
import { getTrip, putTrip } from '../lib/trips';
import { planTrip, type Trip as TripT, type PlannedLeg, type TripDay, RULES } from '../lib/planner';
import { cityById } from '../data/cities';
import { tourById, TOURS } from '../data/tours';
import { STAYS, BAND_LABEL, mapsSearch, stayById, stayName, cheapestStay } from '../data/stays';
import { regionSeason } from '../data/seasons';
import { prepareOffline } from '../lib/offline';
import { BOOKING } from '../data/legs';
import { fmtDot, weekday, fmtMD, addDays } from '../lib/dates';
import { Badge, Kicker, Photo, ExtLink, seasonKind } from '../components/ui';
import { Icon } from '../components/Icon';
import { TripMap, stopsOf, pinColor } from '../components/TripMap';
import { TourSheet } from '../components/TourSheet';
import { PeriodPanel } from '../components/PeriodPanel';
import type { CourseStop, TourType, TransportOption } from '../data/types';

const TABS = ['일자별', '지도', '숙소', '교통', '투어'] as const;
type Tab = (typeof TABS)[number];
const MODE_ICON: Record<string, string> = { train: 'train', night_train: 'train', bus: 'bus', night_bus: 'bus', minivan: 'bus', songthaew: 'bus', ferry: 'boat', flight: 'plane' };
const cname = (id: string) => cityById(id).name;

function LegCard({ l, onCompare, warnAck, onAck }: { l: PlannedLeg; onCompare: () => void; warnAck?: boolean; onAck?: () => void }) {
  return (
    <div className="flex gap-3 lg:gap-4 pl-3.5 lg:pl-[22px]">
      <div aria-hidden="true" className="w-0.5 mx-[9px] lg:mx-[13px] shrink-0" style={{ backgroundImage: 'linear-gradient(rgb(var(--ink)) 50%, transparent 0)', backgroundSize: '2px 10px' }} />
      <div className="flex-1 flex flex-col gap-2.5 py-3.5">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="w-10 h-10 rounded-full bg-night text-butter grid place-items-center"><Icon name={MODE_ICON[l.option.mode]} /></span>
          <span className="flex flex-col"><span className="font-extrabold">{cname(l.from)} → {cname(l.to)}</span><span className="text-[15px] text-muted">{l.option.label} {l.option.hoursText}{l.option.overnight ? ' · 야간' : ''}{l.option.ladies ? ' · 여성 전용칸' : ''}{l.option.note ? ` · ${l.option.note}` : ''}</span></span>
          <button type="button" onClick={onCompare} className="ml-auto min-h-11 inline-flex items-center gap-1.5 text-[15px] font-extrabold text-lagoon">교통편 비교<Icon name="chev" size={16} sw={2.4} /></button>
        </div>
        {l.overLimit && !warnAck && (
          <div role="alert" className="flex flex-col gap-2.5 p-4 rounded-2xl bg-paper shadow-[inset_0_0_0_2px_rgb(var(--chili-d))]">
            <span className="flex gap-2 text-[15px] font-extrabold text-chili-d"><Icon name="alert" size={18} sw={2.2} />하루 이동 기준({l.limit}시간)을 넘어요</span>
            <span className="text-[15px] leading-normal">이 구간은 다른 수단이 없어요. 그대로 가거나, 편집에서 앞 도시에 1박을 더해 쉬어 가세요.</span>
            <div className="flex gap-2 flex-wrap"><button type="button" onClick={onAck} className="btn min-h-11 bg-night text-on-night text-[15px]">그대로 진행</button><button type="button" onClick={onCompare} className="btn btn-line min-h-11 text-[15px]">다른 교통편 보기</button></div>
          </div>
        )}
      </div>
    </div>
  );
}

function DayCard({ d, trip, color, onTour, onStays }: { d: TripDay; trip: TripT; color: string; onTour: (t: TourType) => void; onStays: (c: string) => void }) {
  const stayRaw = trip.notes?.[`stay:${d.city}`]; const stayPick = stayName(stayRaw); const stayObj = stayById(stayRaw);
  const nodrink = d.badges.find((b) => b.kind === 'nodrink'); const fest = d.badges.find((b) => b.kind === 'fest');
  return (
    <article className="flex gap-3 lg:gap-4" aria-labelledby={`day-${d.n}`}>
      <span className="w-12 h-12 lg:w-14 lg:h-14 rounded-full shadow-[inset_0_0_0_1px_rgb(var(--hair-2))] grid place-items-center font-bold text-[26px] lg:text-3xl leading-none shrink-0 text-fixedink" style={{ background: color }}>{d.n}</span>
      <div className="flex-1 min-w-0 p-[18px] lg:p-[22px] rounded-3xl card flex flex-col gap-3.5">
        <div className="flex items-baseline gap-2.5 flex-wrap"><h3 id={`day-${d.n}`} className="m-0 text-[21px] lg:text-2xl font-extrabold tracking-[-0.03em]">{cname(d.city)}</h3><span className={`text-[15px] font-bold ${nodrink ? 'text-chili-d' : ''}`}>Day {d.n}{d.date ? ` · ${fmtDot(d.date)}(${weekday(d.date)})` : ''}</span></div>
        {d.badges.length > 0 && <div className="flex gap-1.5 flex-wrap">{d.badges.map((b, i) => <Badge key={i} kind={b.kind} size="sm">{b.text}</Badge>)}</div>}
        {nodrink && <p className="m-0 px-3.5 py-2.5 rounded-[14px] bg-night text-on-night text-[15px] leading-normal flex gap-2"><span className="text-butter"><Icon name="nodrink" size={18} /></span><span>{nodrink.message}</span></p>}
        {fest && <p className="m-0 px-3.5 py-2.5 rounded-[14px] bg-hib text-[15px] leading-normal flex gap-2"><Icon name="spark" size={18} /><span>{fest.text} · {fest.message}</span></p>}
        <ul className="m-0 p-0 list-none flex flex-col gap-2">{d.slots.map((s, i) => <li key={i} className="grid grid-cols-[48px_minmax(0,1fr)] gap-2.5 leading-normal"><span className="text-sm font-extrabold text-muted pt-px">{s.label}</span><span>{s.text}</span></li>)}</ul>
        {d.tour && (() => { const t = tourById(d.tour); return (
          <button type="button" onClick={() => onTour(d.tour!)} className="lift text-left grid grid-cols-[88px_minmax(0,1fr)_auto] gap-3.5 items-center p-2.5 rounded-[18px] card">
            <span className="h-[72px] rounded-xl overflow-hidden block"><Photo k={t.photo} /></span>
            <span className="flex flex-col gap-1"><span className="text-[13px] font-extrabold tracking-[.08em] text-chili-d">추천 투어</span><span className="text-[17px] font-extrabold">{t.name}</span><span className="flex gap-1.5 flex-wrap items-center text-sm text-muted">{t.duration}{t.noRiding && <Badge kind="noride" size="sm" />}{d.tourCaution && <Badge kind="warn" size="sm">우기 주의</Badge>}</span></span>
            <Icon name="chev" />
          </button>); })()}
        {d.stay && <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3.5 py-3 rounded-2xl bg-cloud"><Icon name="bed" /><span className="flex-1 min-w-[180px] flex flex-col gap-0.5"><span className="font-extrabold">{stayPick ?? `${cname(d.city)} 숙소를 골라 주세요`}</span><span className="text-sm text-muted">{stayObj ? `구글맵 ★ ${stayObj.rating} · 1박 ${stayObj.priceKrw} · ${stayObj.site}${stayObj.sample ? ' · 임시 데이터' : ''}` : stayPick ? cname(d.city) : `평점 4.5+ · 1박 ${trip.inputs.budget}만원 이하에서 골라요`}</span></span><button type="button" onClick={() => onStays(d.city)} className="ml-auto min-h-11 text-[15px] font-extrabold text-lagoon whitespace-nowrap">{stayPick ? '바꾸기' : '숙소 고르기'}</button></div>}
        {d.departLegs?.map((l) => <p key={l.from + l.to} className="m-0 text-[15px] text-muted flex gap-2 items-center"><Icon name={MODE_ICON[l.option.mode]} size={18} />{cname(l.from)} → {cname(l.to)} {l.option.label} {l.option.hoursText}</p>)}
      </div>
    </article>
  );
}

function Editor({ trip, onApply, onCancel }: { trip: TripT; onApply: (s: CourseStop[]) => void; onCancel: () => void }) {
  const [st, setSt] = useState<CourseStop[]>(trip.stops.filter((s) => s.nights > 0));
  const total = st.reduce((a, s) => a + s.nights, 0);
  const mv = (i: number, d: number) => { const n = [...st]; const j = i + d; if (j < 0 || j >= n.length) return; [n[i], n[j]] = [n[j], n[i]]; setSt(n); };
  return (
    <section aria-label="일정 편집" className="card rounded-[28px] p-5 lg:p-7 flex flex-col gap-4">
      <div className="flex justify-between items-baseline"><h2 className="m-0 text-2xl font-extrabold">도시 순서 · 체류일 편집</h2><span className="text-[15px] font-bold">{total}박 {total + 1}일</span></div>
      <ol className="m-0 p-0 list-none flex flex-col gap-2">{st.map((s, i) => (
        <li key={s.city + i} className="flex items-center gap-2 p-2.5 rounded-2xl bg-cloud">
          <span className="flex flex-col"><button type="button" aria-label={`${cname(s.city)} 위로`} onClick={() => mv(i, -1)} disabled={i === 0} className="w-11 h-9 grid place-items-center disabled:opacity-30"><Icon name="up" size={18} /></button><button type="button" aria-label={`${cname(s.city)} 아래로`} onClick={() => mv(i, 1)} disabled={i === st.length - 1} className="w-11 h-9 grid place-items-center disabled:opacity-30"><Icon name="down" size={18} /></button></span>
          <span className="flex-1 text-lg font-extrabold">{cname(s.city)}</span>
          <button type="button" aria-label={`${cname(s.city)} 1박 줄이기`} onClick={() => setSt(st.map((x, k) => (k === i ? { ...x, nights: Math.max(1, x.nights - 1) } : x)))} className="w-11 h-11 rounded-full line grid place-items-center"><Icon name="minus" /></button>
          <span className="w-12 text-center font-bold text-2xl" aria-live="polite">{s.nights}박</span>
          <button type="button" aria-label={`${cname(s.city)} 1박 늘리기`} onClick={() => setSt(st.map((x, k) => (k === i ? { ...x, nights: x.nights + 1 } : x)))} className="w-11 h-11 rounded-full line grid place-items-center"><Icon name="plus" /></button>
          <button type="button" aria-label={`${cname(s.city)} 빼기`} onClick={() => setSt(st.filter((_, k) => k !== i))} disabled={st.length <= 1} className="w-11 h-11 grid place-items-center text-chili-d disabled:opacity-30"><Icon name="trash" /></button>
        </li>))}</ol>
      {total + 1 > 21 && <p role="alert" className="m-0 text-chili-d font-bold">21일을 넘었어요. 체류일을 줄여 주세요.</p>}
      <p className="m-0 text-sm text-muted">바꾸면 규칙(하루 최대 {trip.inputs.safe ? RULES.safeMaxHours : RULES.maxHours}시간, 연속 이동 2일)으로 다시 검사해요. 날짜를 정했다면 귀국일도 함께 바뀌어요.</p>
      <div className="flex gap-2.5 justify-end"><button type="button" onClick={onCancel} className="btn btn-line">취소</button><button type="button" disabled={total + 1 > 21} onClick={() => onApply(st)} className="btn btn-lagoon">다시 계산</button></div>
    </section>
  );
}

function Stays({ trip, city, setCity, onPick }: { trip: TripT; city: string; setCity: (c: string) => void; onPick: (city: string, stayId: string) => void }) {
  const [band, setBand] = useState<0 | 1 | 2 | 3>(0);
  const { online } = useApp();
  const maxBand = trip.inputs.budget <= 3 ? 1 : trip.inputs.budget <= 6 ? 2 : 3;
  const list = STAYS.filter((s) => s.city === city && s.price <= trip.inputs.budget * 10000 && s.band <= maxBand && (!band || s.band === band));
  const picked = trip.notes?.[`stay:${city}`];
  return (
    <div className="flex flex-col gap-5">
      <div role="tablist" aria-label="도시" className="flex gap-2 flex-wrap">{trip.cityIds.filter((c) => c !== 'bangkok').map((c) => <button key={c} type="button" role="tab" aria-selected={c === city} onClick={() => setCity(c)} className="chip" aria-pressed={c === city}>{cname(c)}</button>)}</div>
      <div className="flex gap-2 flex-wrap items-center"><span className="text-[15px] font-bold mr-1">가격대</span>{([0, 1, 2, 3] as const).map((b) => <button key={b} type="button" aria-pressed={band === b} onClick={() => setBand(b)} className="chip min-h-11 text-[15px]" disabled={b > maxBand}>{b ? BAND_LABEL[b] : '전체'}</button>)}</div>
      <p className="m-0 text-[15px] text-muted">구글맵 평점 4.5 이상 · 1박 {trip.inputs.budget}만원 이하(세금 포함, 1인 1실)만 보여 드려요. 가격은 날짜·시기에 따라 바뀌어요.</p>
      {list.some((s) => s.sample) && <p role="note" className="m-0 px-4 py-3 rounded-2xl bg-butter text-fixedink text-[15px] font-bold flex gap-2 items-center"><Icon name="info" size={18} />프로토타입이라 숙소 이름·평점·가격은 화면 확인용 임시 데이터예요.</p>}
      {list.length === 0 ? <div className="card rounded-3xl p-6 flex flex-col gap-2"><span className="text-lg font-extrabold">조건에 맞는 숙소가 없어요</span><span className="text-[15px]">예산을 올리거나 가격대 필터를 ‘전체’로 바꿔 보세요.</span></div> :
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">{list.map((s) => (
          <article key={s.id} className="card rounded-[26px] overflow-hidden flex flex-col">
            <div className="h-44 relative"><Photo k={s.photo} /><span className="absolute left-3 top-3 z-[4]"><Badge kind="rec" size="sm">{BAND_LABEL[s.band]}</Badge></span></div>
            <div className="p-5 flex flex-col gap-2.5 flex-1">
              <h3 className="m-0 text-lg font-extrabold">{s.name}</h3>
              <span className="text-[15px]">구글맵 ★ {s.rating} · 리뷰 {s.reviews}</span>
              <span className="text-[15px]"><b>1박 {s.priceKrw}</b> ({s.priceThb}) · {s.site}</span>
              <span className="text-sm text-muted">{s.distance} · 확인 {s.checkedOn}</span>
              <div className="flex gap-1.5 flex-wrap">{s.tags.map((t) => <span key={t} className="text-[13px] font-bold px-2.5 py-1 rounded-full bg-mint">{t}</span>)}</div>
              <div className="mt-auto pt-2 flex gap-2 flex-wrap">
                {online ? <ExtLink href={mapsSearch(`${cityById(city).name} hotel`)} className="btn btn-line min-h-11 text-[15px] flex-1">구글맵에서 최저가 보기 <Icon name="ext" size={16} /></ExtLink> : <span className="btn btn-line min-h-11 text-[15px] opacity-45 flex-1">오프라인</span>}
                <button type="button" aria-pressed={picked === s.id} onClick={() => onPick(city, s.id)} className="btn btn-lagoon min-h-11 text-[15px]">{picked === s.id ? <><Icon name="check" size={16} sw={2.6} />담았어요</> : '일정에 담기'}</button>
              </div>
            </div>
          </article>))}</div>}
    </div>
  );
}

function Transport({ trip, legKey, safe }: { trip: TripT; legKey?: string; safe: boolean }) {
  const { online } = useApp();
  const legs = trip.days.flatMap((d) => [...d.legs, ...(d.departLegs ?? [])]);
  const why = (o: TransportOption) => (safe && o.mode === 'night_bus' ? '안심 일정: 야간버스 대신 침대칸을 추천해요' : !trip.inputs.nightMove && o.overnight ? '야간 이동을 끄셨어요' : null);
  return (
    <div className="flex flex-col gap-4">
      {legs.map((l) => { const all = [l.option, ...l.alternatives]; const k = `${l.from}-${l.to}`; return (
        <section key={k} id={`leg-${k}`} className={`card rounded-[26px] p-5 lg:p-6 flex flex-col gap-3 ${legKey === k ? 'shadow-[inset_0_0_0_3px_rgb(var(--lagoon))]' : ''}`}>
          <h3 className="m-0 text-xl font-extrabold">{cname(l.from)} → {cname(l.to)}</h3>
          <ul className="m-0 p-0 list-none flex flex-col gap-2">{all.map((o, i) => { const w = why(o); const links = BOOKING[(o.mode.includes('train') ? 'train' : o.mode.includes('bus') || o.mode === 'songthaew' ? 'bus' : o.mode) as keyof typeof BOOKING] ?? BOOKING.bus; return (
            <li key={i} className={`grid lg:grid-cols-[minmax(0,1fr)_auto] gap-3 p-3.5 rounded-2xl ${i === 0 ? 'bg-mint' : 'bg-cloud'} ${w ? 'opacity-55' : ''}`}>
              <div className="flex gap-3 items-start"><Icon name={MODE_ICON[o.mode]} size={22} /><div className="flex flex-col gap-1"><span className="font-extrabold">{o.label} · {o.hoursText}{i === 0 && <span className="ml-2 text-[13px] px-2 py-0.5 rounded-full bg-lagoon text-on-lagoon align-middle">선택됨</span>}</span>
                <span className="text-sm text-muted">{[o.overnight && '야간 이동', o.ladies && '여성 전용칸 있음', o.note, o.seasonal, '가격은 예약 사이트에서 확인'].filter(Boolean).join(' · ')}</span>{w && <span className="text-sm font-bold text-chili-d">{w}</span>}</div></div>
              <div className="flex gap-2 flex-wrap lg:justify-end">{links.slice(0, 2).map((b) => online ? <ExtLink key={b.name} href={b.url} className="btn btn-line min-h-11 text-sm px-4">{b.name} <Icon name="ext" size={14} /></ExtLink> : <span key={b.name} className="btn btn-line min-h-11 text-sm px-4 opacity-45">{b.name}</span>)}</div>
            </li>); })}</ul>
          <p className="m-0 text-sm text-muted">검색 조건은 예약 사이트에서 직접 넣어 주세요(프로토타입). 소요 시간은 어림값이에요.</p>
        </section>); })}
    </div>
  );
}

export default function Trip() {
  const { id } = useParams(); const nav = useNavigate(); const [sp, setSp] = useSearchParams();
  const { user, ready, toast, online } = useApp();
  const [trip, setTrip] = useState<TripT | null | undefined>(undefined);
  const [tour, setTour] = useState<TourType | null>(null);
  const [edit, setEdit] = useState(false);
  const [undo, setUndo] = useState<TripT | null>(null);
  const [stayCity, setStayCity] = useState<string>('');
  const [legKey, setLegKey] = useState<string>();
  const [mapFocus, setMapFocus] = useState<string>();
  const [periodOpen, setPeriodOpen] = useState(false);
  const tab = (TABS.includes(sp.get('tab') as Tab) ? sp.get('tab') : '일자별') as Tab;
  const setTab = (t: Tab) => setSp(t === '일자별' ? {} : { tab: t }, { replace: true });

  useEffect(() => { if (!id) return; getTrip(id).then((t) => { setTrip(t); if (t) setStayCity(t.cityIds.find((c) => c !== 'bangkok') ?? ''); }); }, [id]);
  useEffect(() => { if (ready && !user) nav('/login', { replace: true, state: { next: `/trip/${id}` } }); }, [ready, user, nav, id]);
  const stops = useMemo(() => (trip ? stopsOf(trip) : []), [trip]);
  if (trip === undefined) return <main className="wrap gutter py-24 text-center text-lg font-bold" aria-busy="true">일정을 불러오는 중…</main>;
  if (trip === null) return <main className="wrap gutter py-24 flex flex-col items-center gap-4 text-center"><h1 className="m-0 text-3xl font-extrabold">일정을 찾을 수 없어요</h1><p className="m-0">이 기기에 저장된 일정만 볼 수 있어요.</p><Link to="/plan" className="btn btn-lagoon">새 일정 만들기</Link></main>;

  const save = async (t: TripT, msg?: string) => { setTrip(t); await putTrip(t); if (msg) toast(msg); };
  const ack = (k: string) => save({ ...trip, notes: { ...trip.notes, [`ack:${k}`]: '1' } });
  const compare = (l: PlannedLeg) => { setLegKey(`${l.from}-${l.to}`); setTab('교통'); window.scrollTo({ top: 0 }); };
  const apply = (st: CourseStop[]) => {
    const lead = trip.stops.slice(0, trip.stops.findIndex((x) => x.nights > 0)).filter((x) => x.nights === 0);
    const nights = st.reduce((a, s) => a + s.nights, 0);
    const inputs = { ...trip.inputs, days: nights + 1, end: trip.inputs.start ? addDays(trip.inputs.start, nights) : trip.inputs.end };
    const nt = planTrip(inputs, trip.userId, trip.courseId, [...lead, ...st]);
    setUndo(trip); setEdit(false);
    save({ ...nt, id: trip.id, createdAt: trip.createdAt, notes: trip.notes, offline: trip.offline }, '규칙에 맞춰 다시 계산했어요');
  };
  const copyLink = async () => { try { await navigator.clipboard.writeText(location.href); toast('링크를 복사했어요'); } catch { toast('복사할 수 없어요. 주소창의 링크를 직접 복사해 주세요.'); } };
  const offline = async () => {
    toast('오프라인용 파일을 받는 중이에요…');
    const r = await prepareOffline(trip);
    const msg = r.kind === 'unsupported' ? '이 화면에선 오프라인 캐시를 못 써요. 일정은 이 기기에 저장했어요.'
      : r.kind === 'error' ? '오프라인 파일을 받지 못했어요. 연결을 확인하고 다시 눌러 주세요.'
      : r.failed > 0 ? `오프라인 준비 완료 · 파일 ${r.failed}개는 받지 못했어요` : '오프라인 준비 완료 · 연결이 끊겨도 이 일정을 볼 수 있어요';
    save(r.kind === 'error' ? trip : { ...trip, offline: true }, msg);
  };
  const first = trip.days[0], last = trip.days[trip.days.length - 1];
  const rainy = RULES.rainyMonths.includes(trip.month);
  // 머리 배지: 일정 도시 중 가장 주의가 필요한 계절(없으면 첫 도시)
  const seasons = trip.cityIds.filter((c) => c !== 'bangkok').map((c) => regionSeason(cityById(c).region, trip.month));
  const headSeason = seasons.find((s) => s.badge === 'warn') ?? seasons.find((s) => s.badge === 'save') ?? seasons[0] ?? regionSeason('중부', trip.month);
  // 예상 숙박비: 고른 숙소 가격, 안 고른 도시는 예산 안 최저가(임시 데이터 기준 어림)
  const lodging = trip.days.filter((d) => d.stay).reduce((a, d) => a + (stayById(trip.notes?.[`stay:${d.city}`])?.price ?? cheapestStay(d.city, trip.inputs.budget)?.price ?? 0), 0);
  const cities = trip.cityIds.filter((c) => c !== 'bangkok');
  const actions = [
    { i: 'save', t: '일정 저장', s: '저장', f: () => save(trip, '일정을 저장했어요') },
    { i: 'download', t: 'PDF', s: 'PDF', f: () => nav(`/trip/${trip.id}/print`) },
    { i: 'offline', t: trip.offline ? '오프라인 저장됨' : '오프라인에 저장', s: trip.offline ? '저장됨' : '오프라인', f: offline },
    { i: 'link', t: '링크 복사', s: '링크 복사', f: copyLink },
  ];

  return (
    <main className="pb-28 lg:pb-[120px]">
      <section className="wrap gutter pt-5 lg:pt-10 flex flex-col gap-4 lg:gap-6">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-4 lg:gap-8">
          <div className="flex flex-col gap-3"><div className="flex gap-2 flex-wrap"><Badge kind={seasonKind(headSeason.badge)}>{trip.month}월 · {headSeason.text}</Badge>{trip.inputs.safe && <Badge kind="safe">안심 일정 ON</Badge>}{trip.offline && <Badge kind="rec">오프라인 저장됨</Badge>}</div>
            <h1 className="m-0 text-[34px] lg:text-[44px] leading-[1.15] font-extrabold tracking-[-0.03em]">{trip.name} <span className="serif-i text-lagoon">my trip</span></h1></div>
          <div className="grid grid-cols-4 lg:flex gap-2 lg:gap-2.5 no-print">{actions.map((a, k) => (
            <button key={a.i} type="button" onClick={a.f} className={`min-h-16 lg:min-h-[52px] rounded-2xl lg:rounded-full lg:px-5 flex flex-col lg:flex-row items-center justify-center gap-1 lg:gap-2 text-xs lg:text-base font-extrabold line ${k === 0 ? 'bg-lagoon text-on-lagoon shadow-none' : 'bg-paper'}`}><Icon name={a.i} size={20} /><span className="lg:hidden">{a.s}</span><span className="hidden lg:inline">{a.t}</span></button>))}</div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 rounded-[22px] card overflow-hidden">
          {[['기간', first.date ? `${fmtDot(first.date)} – ${fmtDot(last.date!)}` : `${trip.month}월 · ${trip.days.length}일`, `${trip.nights}박 ${trip.days.length}일`], ['도시', `${cities.length}곳`, cities.map(cname).join(' → ')], ['총 이동', `약 ${trip.totalHours}시간`, trip.days.some((d) => d.legs.some((l) => l.option.overnight)) ? '야간열차 포함' : '낮 이동'], ['예상 숙박비', lodging ? `약 ${Math.round(lodging / 10000)}만원` : '—', lodging ? '고른 숙소·예산 안 최저가 · 임시 데이터' : `1박 ${trip.inputs.budget}만원 이하 기준`]].map(([a, b, c], i) => (
            <div key={a} className={`flex flex-col gap-1 p-3.5 lg:px-[22px] lg:py-[18px] ${i % 2 ? 'border-l-[1.5px] rule' : ''} ${i === 2 ? 'lg:border-l-[1.5px]' : ''} ${i > 1 ? 'border-t-[1.5px] lg:border-t-0 rule' : ''}`}>
              <span className="text-[13px] font-extrabold tracking-[.06em] text-muted">{a}</span><span className="font-bold text-[26px] lg:text-4xl leading-none">{b}</span><span className="text-sm text-muted truncate">{c}</span></div>))}
        </div>
        <div className="rounded-[18px] bg-butter text-fixedink">
          <button type="button" aria-expanded={periodOpen} onClick={() => setPeriodOpen(!periodOpen)} className="w-full min-h-[52px] px-[18px] py-3 flex items-center gap-2.5 flex-wrap text-left text-[15px] font-bold"><Icon name="info" size={18} /><span className="font-extrabold">이 기간의 여행 정보</span><span className="hidden lg:inline">{trip.warnings[0]}</span><span className={`ml-auto ${periodOpen ? 'rotate-180' : ''}`}><Icon name="chevd" size={18} /></span></button>
        </div>
        {periodOpen && <div className="text-ink">{first.date ? <PeriodPanel start={first.date} end={last.date} /> : <PeriodPanel month={trip.month} />}{trip.warnings.length > 0 && <ul className="mt-3 m-0 p-0 list-none flex flex-col gap-2">{trip.warnings.map((w) => <li key={w} className="flex gap-2 text-[15px]"><span className="text-chili-d"><Icon name="alert" size={18} /></span>{w}</li>)}</ul>}</div>}
        {undo && <div role="status" className="flex items-center gap-3 p-3 rounded-2xl bg-mint"><span className="flex-1 text-[15px] font-bold">일정을 바꿨어요.</span><button type="button" onClick={() => { save(undo, '되돌렸어요'); setUndo(null); }} className="btn btn-line min-h-11 text-[15px]">되돌리기</button></div>}
        <div role="tablist" aria-label="일정 보기" className="flex gap-1 lg:gap-2 border-b-[1.5px] rule overflow-x-auto no-print">{TABS.map((t) => <button key={t} type="button" role="tab" aria-selected={t === tab} onClick={() => setTab(t)} className={`min-h-12 px-3.5 lg:px-5 text-base lg:text-[17px] whitespace-nowrap ${t === tab ? 'font-extrabold shadow-[inset_0_-4px_0_rgb(var(--lagoon))]' : 'font-semibold text-muted'}`}>{t}</button>)}</div>
      </section>

      <div className="wrap gutter pt-6 lg:pt-7">
        {tab === '일자별' && (
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 flex flex-col">
              <div className="flex justify-end mb-2 no-print"><button type="button" onClick={() => setEdit(!edit)} aria-expanded={edit} className="btn btn-line min-h-11 text-[15px]"><Icon name="route" size={18} />{edit ? '편집 닫기' : '도시 순서·체류일 편집'}</button></div>
              {edit && <div className="mb-5"><Editor trip={trip} onApply={apply} onCancel={() => setEdit(false)} /></div>}
              {trip.days.map((d) => { const si = stops.findIndex((s) => s.from <= d.n && s.to >= d.n); return (
                <div key={d.n}>{d.legs.map((l) => <LegCard key={l.from + l.to} l={l} onCompare={() => compare(l)} warnAck={!!trip.notes?.[`ack:${l.from}-${l.to}`]} onAck={() => ack(`${l.from}-${l.to}`)} />)}
                  <DayCard d={d} trip={trip} color={pinColor(si)} onTour={setTour} onStays={(c) => { setStayCity(c); setTab('숙소'); }} />
                  {d.departLegs?.map((l) => <LegCard key={'d' + l.from + l.to} l={l} onCompare={() => compare(l)} />)}</div>); })}
            </div>
            <aside className="hidden lg:flex lg:col-span-5 sticky top-6 flex-col gap-3.5">
              <div className="grain h-[760px] rounded-[28px] overflow-hidden line"><TripMap trip={trip} /></div>
              <div className="flex justify-between items-center text-sm text-muted"><span>정적 지도(프로토타입) · 지도 데이터 © OpenStreetMap 기여자</span>{online && <ExtLink href={mapsSearch(cities.map(cname).join(' '))} className="min-h-11 inline-flex items-center gap-1.5 font-extrabold text-lagoon">구글맵에서 보기 <Icon name="ext" size={16} /></ExtLink>}</div>
            </aside>
          </div>
        )}
        {tab === '지도' && (
          <div className="flex flex-col gap-4">
            <div role="radiogroup" aria-label="도시 선택" className="flex gap-2 flex-wrap"><button type="button" role="radio" aria-checked={!mapFocus} onClick={() => setMapFocus(undefined)} className="chip">전체</button>{stops.map((s) => <button key={s.city + s.from} type="button" role="radio" aria-checked={mapFocus === s.city} onClick={() => setMapFocus(s.city)} className="chip">Day {s.from === s.to ? s.from : `${s.from}–${s.to}`} · {cname(s.city)}</button>)}</div>
            <div className="grid lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 grain h-[520px] lg:h-[720px] rounded-[28px] overflow-hidden line"><TripMap trip={trip} w={820} h={720} focus={mapFocus} /></div>
              <div className="lg:col-span-4 flex flex-col gap-3">{stops.map((s) => { const c = cityById(s.city); return (
                <button type="button" key={s.city + s.from} onClick={() => setMapFocus(s.city)} className={`text-left grid grid-cols-[80px_minmax(0,1fr)] gap-3.5 items-center p-3 rounded-[22px] card ${mapFocus === s.city ? 'shadow-[inset_0_0_0_3px_rgb(var(--lagoon))]' : ''}`}>
                  <span className="h-20 rounded-[14px] overflow-hidden block"><Photo k={c.photo} /></span>
                  <span className="flex flex-col gap-1"><span className="text-[13px] font-extrabold text-chili-d">Day {s.from === s.to ? s.from : `${s.from}–${s.to}`}{trip.days[s.from - 1].date ? ` · ${fmtMD(trip.days[s.from - 1].date!)}` : ''}</span><span className="text-[19px] font-extrabold">{c.name} · {s.to - s.from + (s.to === trip.days.length ? 0 : 1)}박</span><span className="text-sm text-muted">{c.highlights.slice(0, 3).join(' · ')}</span></span>
                </button>); })}
                {online && <ExtLink href={mapsSearch(cities.map(cname).join(' '))} className="btn btn-line">구글맵에서 길찾기 <Icon name="ext" size={16} /></ExtLink>}
              </div>
            </div>
          </div>
        )}
        {tab === '숙소' && <Stays trip={trip} city={stayCity} setCity={setStayCity} onPick={(c, sid) => save({ ...trip, notes: { ...trip.notes, [`stay:${c}`]: sid } }, `${cname(c)} 숙소를 일정에 담았어요`)} />}
        {tab === '교통' && <Transport trip={trip} legKey={legKey} safe={trip.inputs.safe} />}
        {tab === '투어' && (
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">{TOURS.map((t) => { const here = t.cities.filter((c) => trip.cityIds.includes(c)); return (
            <button key={t.id} type="button" onClick={() => setTour(t.id)} className={`lift text-left card rounded-[26px] overflow-hidden flex flex-col ${here.length ? '' : 'opacity-60'}`}>
              <span className="h-48 block zoom overflow-hidden"><Photo k={t.photo} /></span>
              <span className="p-5 flex flex-col gap-2"><span className="text-xl font-extrabold">{t.name}</span><span className="text-[15px]">{here.length ? `이 일정에서: ${here.map(cname).join(', ')}` : `가능한 도시: ${t.cities.map(cname).join(', ')}`}</span><span className="text-sm text-muted">{t.duration} · {t.priceBand}</span>
                <span className="flex gap-1.5 flex-wrap">{trip.notes?.[`tour:${t.id}`] && <Badge kind="safe" size="sm">일정에 담음</Badge>}{t.noRiding && <Badge kind="noride" size="sm" />}{rainy && t.rainyCaution && <Badge kind="warn" size="sm">우기 주의</Badge>}</span></span>
            </button>); })}</div>
        )}
      </div>
      {tour && <TourSheet id={tour} rainy={rainy} onClose={() => setTour(null)} context={trip.name} added={!!trip.notes?.[`tour:${tour}`]} onAdd={() => { save({ ...trip, notes: { ...trip.notes, [`tour:${tour}`]: '1' } }, `${tourById(tour).name}을 일정에 담았어요`); setTour(null); }} />}
    </main>
  );
}
