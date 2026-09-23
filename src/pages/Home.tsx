import { Link } from 'react-router-dom';
import { COURSES } from '../data/courses';
import { EVENTS } from '../data/events';
import { SEASON_TIPS } from '../data/seasons';
import { cityById } from '../data/cities';
import { Badge, Btn, Kicker, Photo } from '../components/ui';
import { Icon } from '../components/Icon';
import { FeatureCourse, SmallCourse, CourseRow } from '../components/CourseCards';
import { todayISO, monthOf, diffDays } from '../lib/dates';

const STEPS = [['동선', '하루 이동 최대 6시간, 도시 순서와 체류일까지'], ['교통', '기차·버스·미니밴·배·항공을 구간별로 비교'], ['숙소', '구글맵 평점 4.5+ · 1박 10만원 이하 · 최저가'], ['투어', '코끼리 목욕·쿠킹클래스·짚라인·트레킹']];

export function monthTip(m = monthOf(todayISO())) {
  // 이달의 시기: 북부 기준 대표 시기 + 걸프 섬 예외
  const t = SEASON_TIPS.find((x) => x.id !== 'gulf' && x.id !== 'haze' && x.months.includes(m)) ?? SEASON_TIPS[0];
  return t;
}

export function upcomingEvents(n = 4) {
  const today = todayISO(); const m = monthOf(today);
  const withKey = EVENTS.map((e) => {
    if (e.from) return { e, key: e.from, dday: diffDays(today, e.from), active: e.to ? e.to >= today && e.from <= today : false };
    const ms = e.months ?? []; const next = ms.map((x) => (x - m + 12) % 12).sort((a, b) => a - b)[0] ?? 99;
    return { e, key: `m${String(next).padStart(2, '0')}`, dday: next === 0 ? 0 : NaN, active: ms.includes(m) };
  });
  return withKey.filter((x) => (x.e.from ? (x.e.to ?? x.e.from) >= today : true))
    .sort((a, b) => (a.active === b.active ? 0 : a.active ? -1 : 1) || ((isNaN(a.dday) ? 400 : a.dday) - (isNaN(b.dday) ? 400 : b.dday)))
    .filter((x) => x.e.photo).slice(0, n);
}

export default function Home() {
  const m = monthOf(todayISO());
  const tip = monthTip(m);
  const evs = upcomingEvents(4);
  const [A, , , , , F] = COURSES;
  return (
    <main>
      <div className="bg-butter text-fixedink min-h-11 px-4 py-2 flex items-center justify-center gap-3 lg:gap-4 text-sm lg:text-base font-semibold flex-wrap">
        <Badge kind={tip.badge === 'rec' ? 'rec' : tip.badge === 'warn' ? 'warn' : 'save'} size="sm">{m}월 · {tip.badgeText}</Badge>
        <span>{tip.price}. {tip.id === 'rain' ? '걸프 섬 코타오는 오히려 맑아요.' : tip.pros}</span>
        <Link to="/season" className="hidden lg:inline-flex min-h-11 items-center gap-1.5 font-extrabold">시기 가이드 <Icon name="arrow" size={16} sw={2.4} /></Link>
      </div>

      <section className="wrap gutter pt-5 lg:pt-14 grid lg:grid-cols-12 gap-x-6 gap-y-5">
        <div className="order-2 lg:order-1 lg:col-span-5 flex flex-col gap-5 lg:gap-7 lg:pt-2 relative z-[2]">
          <Kicker>Slow towns of Thailand</Kicker>
          <h1 className="m-0 text-[48px] lg:text-[88px] leading-[1.1] font-extrabold tracking-[-0.05em]">혼자 누리는<br />태국 소도시<br />힐링 여행</h1>
          <span className="serif-i text-[40px] lg:text-[64px] leading-none text-lagoon">slow <span className="text-chili-d">&amp;</span> solo</span>
          <p className="m-0 max-w-[460px] text-[17px] lg:text-[19px] leading-[1.65]">여행 시기와 취향만 알려 주세요. 방콕·푸켓 다음, 조용한 소도시로 가는 동선과 교통, 검증된 숙소, 현지 투어를 한 번에 짜 드려요.</p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5"><Btn to="/plan" className="h-[60px] lg:h-16 text-lg lg:text-[19px]">내 여행 계획 만들기</Btn><a href="#courses" onClick={(e) => { e.preventDefault(); document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' }); }} className="min-h-11 inline-flex items-center justify-center text-lg font-bold underline underline-offset-[6px]">추천 코스 보기</a></div>
        </div>
        <div className="order-1 lg:order-2 lg:col-span-7 relative h-[440px] lg:h-[760px]">
          <figure className="zoom grain m-0 absolute inset-0 bottom-14 lg:left-10 lg:bottom-[60px] rounded-[28px] lg:rounded-[32px] overflow-hidden">
            <Photo k="khaosok" eager />
            <figcaption className="absolute left-3.5 top-3.5 lg:left-5 lg:top-5 z-[4] px-3 py-1.5 rounded-full bg-paper text-[13px] lg:text-sm font-bold flex items-center gap-1.5"><Icon name="pin" size={14} />카오속 · 치어란 호수</figcaption>
          </figure>
          <div className="zoom absolute left-3.5 lg:-left-10 bottom-0 w-[132px] h-[170px] lg:w-[260px] lg:h-[340px] rounded-[20px] lg:rounded-3xl overflow-hidden border-[6px] lg:border-[10px] border-cloud"><Photo k="solo_hat" /></div>
          <div className="absolute right-2.5 bottom-3.5 lg:bottom-auto lg:-top-[18px] lg:-right-3.5 w-28 h-28 lg:w-[168px] lg:h-[168px] rounded-full bg-chili text-fixedink flex flex-col items-center justify-center rotate-[10deg] text-center shadow-[0_12px_30px_-12px_rgba(42,27,20,.5)] z-[5]">
            <span className="text-xs lg:text-[15px] font-extrabold">숙소는 딱 이 기준</span><span className="font-serif text-[34px] lg:text-5xl leading-none">4.5+</span><span className="text-xs lg:text-[15px] font-extrabold">1박 10만원 이하</span>
          </div>
          <div className="hidden lg:block grain absolute right-9 bottom-4 w-[180px] h-[180px] rounded-[28px] overflow-hidden -rotate-[4deg] border-[3px] border-ink z-[5]"><Photo k="songthaew" /></div>
        </div>
      </section>

      <section aria-label="한 번에 짜 드리는 것" className="wrap gutter mt-9 lg:mt-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 border-y-[1.5px] rule">
          {STEPS.map(([t, d], i) => (
            <div key={t} className={`py-5 lg:py-7 px-3.5 lg:px-7 flex flex-col gap-2 ${i % 2 ? 'border-l-[1.5px] rule' : ''} ${i > 1 ? 'border-t-[1.5px] lg:border-t-0 rule' : ''} ${i === 2 ? 'lg:border-l-[1.5px]' : ''} ${i === 0 ? 'lg:pl-0' : ''}`}>
              <div className="flex items-baseline gap-2.5"><span className="serif-i text-[28px] lg:text-[38px] leading-none text-chili-d">0{i + 1}</span><span className="text-[19px] lg:text-2xl font-extrabold">{t}</span></div>
              <p className="m-0 text-[15px] lg:text-base leading-normal text-muted">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="courses" className="wrap gutter pt-16 lg:pt-[120px] pb-28 lg:pb-[180px] scroll-mt-20">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-4 mb-8 lg:mb-14">
          <div className="flex flex-col gap-3"><Kicker>8 routes</Kicker><h2 className="m-0 text-[40px] lg:text-[80px] leading-[1.05] font-extrabold tracking-[-0.05em]">추천 코스 <span className="serif-i text-lagoon">A—H</span></h2></div>
          <p className="m-0 lg:w-[440px] text-base lg:text-lg leading-[1.65]">관심사·여행 월·일수로 가장 맞는 코스를 골라 일정을 늘리거나 줄여 드려요. 야간 이동은 열차 침대칸·VIP 버스로만.</p>
        </div>
        <div className="grid lg:grid-cols-2 gap-10 mb-10 lg:mb-[72px]"><FeatureCourse c={A} accent="rgb(var(--chili-d))" /><FeatureCourse c={F} accent="rgb(var(--lagoon))" /></div>
        <div className="hidden lg:grid grid-cols-3 gap-x-10 gap-y-16">{COURSES.filter((c) => !'AF'.includes(c.id)).map((c) => <SmallCourse key={c.id} c={c} />)}</div>
        <div className="lg:hidden">{COURSES.filter((c) => !'AF'.includes(c.id)).map((c) => <CourseRow key={c.id} c={c} />)}</div>
      </section>

      <section className="grain relative z-[2] -mt-10 lg:-mt-[72px] bg-night text-on-night rounded-t-[32px] lg:rounded-t-[56px]">
        <div className="wrap gutter pt-12 lg:pt-24 pb-20 lg:pb-[150px]">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-4 mb-6 lg:mb-10">
            <div className="flex flex-col gap-3"><span className="kicker !text-butter">Calendar 2026</span><h2 className="m-0 text-[34px] lg:text-[72px] leading-[1.1] font-extrabold tracking-[-0.05em]">다가오는 금주일 · 축제</h2></div>
            <p className="m-0 lg:w-[420px] text-base lg:text-lg leading-[1.65] opacity-90">일정에 걸리면 날짜 카드에 배지와 한 줄 안내가 붙어요. 불교 기념일에는 술을 팔지 않아요.</p>
          </div>
          {evs.map(({ e, dday, active }) => (
            <article key={e.id} className="grid grid-cols-[104px_minmax(0,1fr)] lg:grid-cols-[300px_190px_minmax(0,1fr)_280px] gap-x-4 lg:gap-x-8 gap-y-2 items-center py-5 lg:py-8 border-t-[1.5px] border-on-night/35">
              <span className="font-serif text-[38px] lg:text-[104px] leading-[.9] text-butter whitespace-nowrap row-span-2 lg:row-span-1 self-start lg:self-center">{e.from ? `${e.from.slice(5, 7)}.${e.from.slice(8)}` : e.dateText.split(' ')[0]}</span>
              <div className="flex lg:flex-col gap-2.5 items-center lg:items-start"><Badge kind={e.type === 'no_alcohol' ? 'nodrink' : 'fest'} size="sm" />{<span className="text-sm lg:text-base font-extrabold text-hib">{active ? '진행 시기' : !isNaN(dday) && dday > 0 ? `D-${dday}` : e.dateText.includes('[빈칸]') ? '날짜 [빈칸]' : '다가오는 시기'}</span>}</div>
              <div className="col-start-2 lg:col-start-auto flex flex-col gap-2"><h3 className="m-0 text-[21px] lg:text-[30px] font-extrabold tracking-[-0.03em]">{e.title}</h3>
                <span className="text-[15px] lg:text-[17px] font-semibold flex items-center gap-1.5"><Icon name="pin" size={16} />{e.cities === 'all' ? '전국' : e.cities.map((id) => cityById(id).name).join(', ')} · {e.dateText}</span>
                <p className="m-0 text-[15px] lg:text-[17px] leading-normal opacity-90">{e.message}{e.impact ? ` · ${e.impact}` : ''}</p></div>
              <div className="hidden lg:block zoom grain h-40 rounded-[22px] overflow-hidden"><Photo k={e.photo!} /></div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
