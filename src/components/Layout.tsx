import { NavLink, Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Icon } from './Icon';
import { Logo, ExtLink } from './ui';
import { useApp } from '../state';
import { SEASON_TIPS } from '../data/seasons';
import { todayISO, monthOf } from '../lib/dates';

const MENU = [
  { to: '/', label: '홈', end: true }, { to: '/plan', label: '맞춤 일정 플래너' }, { to: '/season', label: '시기 가이드' },
  { to: '/courses', label: '추천 코스 8선' }, { to: '/safety', label: '혼행 안심 팩' },
];
export const EMERGENCY = [
  { label: '관광경찰', num: '1155', tel: '1155', note: '영어 등 외국어 · 24시간' },
  { label: '주태국 대한민국 대사관', num: '+66-2-481-6000', tel: '+6624816000', note: '대표번호 · 근무시간' },
  { label: '대사관 긴급(사건사고)', num: '+66-81-914-5803', tel: '+66819145803', note: '24시간' },
];
export const EMERGENCY_SRC = 'https://0404.go.kr/ntnSafetyInfo/260/detail';

/** 이번 달 시기(우기·성수기 등) 한 줄 */
export function monthTip(m = monthOf(todayISO())) {
  const t = SEASON_TIPS.find((x) => x.id !== 'haze' && x.id !== 'gulf' && x.months.includes(m)) ?? SEASON_TIPS[0];
  return { m, tip: t };
}

function ThemeBtn() {
  const { theme, setTheme } = useApp();
  const next = theme === 'system' ? 'dark' : theme === 'dark' ? 'light' : 'system';
  const label = theme === 'system' ? '테마: 기기 설정' : theme === 'dark' ? '테마: 다크' : '테마: 라이트';
  return <button type="button" onClick={() => setTheme(next)} aria-label={`${label} (눌러서 바꾸기)`} title={label} className="w-11 h-11 rounded-full grid place-items-center hover:bg-oat"><Icon name={theme === 'dark' ? 'moon' : 'sun'} size={20} /></button>;
}

export function Header() {
  const { user, logout } = useApp();
  const [open, setOpen] = useState(false);
  const loc = useLocation(); const nav = useNavigate();
  const isHome = loc.pathname === '/';
  const { m, tip } = monthTip();
  return (
    <header className="sticky top-0 z-50 bg-linen/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] no-print" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      <div className="wrap gutter h-16 lg:h-20 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          {!isHome && <button type="button" onClick={() => nav(-1)} aria-label="뒤로" className="lg:hidden w-11 h-11 -ml-3 grid place-items-center"><Icon name="back" size={22} /></button>}
          <Logo size={22} />
        </div>
        <nav aria-label="주요 메뉴" className="hidden xl:flex items-center gap-1 px-2 py-1.5 bg-oat rounded-full">
          {MENU.map((x) => <NavLink key={x.to} to={x.to} end={x.end} className={({ isActive }) => `px-4 min-h-10 inline-flex items-center rounded-full text-[14px] transition-colors ${isActive ? 'bg-card text-primary font-bold shadow-soft' : 'font-semibold text-slate hover:text-marine'}`}>{x.label}</NavLink>)}
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/season" className="hidden md:inline-flex items-center gap-1.5 px-3 min-h-9 rounded-full bg-oat text-[13px] font-semibold text-slate hover:text-marine"><span className="text-saffron"><Icon name="sun" size={16} /></span>{m}월 · {tip.badgeText.split(' · ')[1] ?? tip.badgeText}</Link>
          <ThemeBtn />
          {user
            ? <Link to="/my" className="hidden sm:inline-flex items-center gap-2 min-h-10 pl-1.5 pr-3.5 rounded-full bg-oat hover:bg-hair text-[14px] font-semibold"><span className="w-8 h-8 rounded-full bg-night text-on-night grid place-items-center text-[13px] font-bold" aria-hidden="true">{user.email.slice(0, 1).toUpperCase()}</span>내 일정</Link>
            : <Link to="/login" className="hidden sm:inline-flex items-center min-h-10 px-4 rounded-full bg-oat hover:bg-hair text-[14px] font-semibold">로그인</Link>}
          <button type="button" aria-label={open ? '메뉴 닫기' : '메뉴 열기'} aria-expanded={open} onClick={() => setOpen(!open)} className="xl:hidden w-11 h-11 -mr-2 grid place-items-center"><Icon name={open ? 'x' : 'menu'} size={22} /></button>
        </div>
      </div>
      {open && (
        <nav aria-label="전체 메뉴" className="xl:hidden wrap gutter pb-4 flex flex-col text-[17px] font-semibold" onClick={() => setOpen(false)}>
          {MENU.map((x) => <Link key={x.to} to={x.to} className="min-h-12 flex items-center border-t rule">{x.label}</Link>)}
          {user ? <><Link to="/my" className="min-h-12 flex items-center border-t rule">내 일정</Link><button type="button" onClick={logout} className="min-h-12 text-left border-t rule">로그아웃</button></> : <Link to="/login" className="min-h-12 flex items-center border-t rule">로그인</Link>}
        </nav>
      )}
    </header>
  );
}

/** 모바일 하단 떠 있는 탭(바닥에서 16px 위, 블러) */
export function TabBar() {
  const T = [{ to: '/', l: '홈', i: 'home', end: true }, { to: '/plan', l: '맞춤 일정', i: 'route' }, { to: '/courses', l: '둘러보기', i: 'compass' }, { to: '/safety', l: '안심 팩', i: 'shield' }, { to: '/my', l: '내 일정', i: 'save' }];
  return (
    <nav aria-label="하단 탭" className="lg:hidden fixed left-3 right-3 z-40 glass rounded-[22px] flex px-1 no-print" style={{ bottom: 'calc(12px + env(safe-area-inset-bottom, 0px))' }}>
      {T.map((t) => (
        <NavLink key={t.to} to={t.to} end={t.end} className={({ isActive }) => `flex-1 min-h-[60px] flex flex-col items-center justify-center gap-0.5 text-[12px] ${isActive ? 'font-bold text-marine' : 'font-medium text-slate'}`}>
          {({ isActive }) => <><span className={isActive ? 'text-primary' : ''}><Icon name={t.i} size={22} sw={isActive ? 2.2 : 1.8} /></span>{t.l}<span className={`w-1 h-1 rounded-full ${isActive ? 'bg-saffron' : 'bg-transparent'}`} aria-hidden="true" /></>}
        </NavLink>
      ))}
    </nav>
  );
}

export function OfflineBar() {
  const { online } = useApp();
  if (online) return null;
  return <div role="status" className="bg-night text-on-night text-[15px] font-semibold px-4 py-2.5 flex items-center gap-2 justify-center no-print"><Icon name="offline" size={18} />오프라인 — 저장된 일정을 보고 있어요. 외부 사이트 버튼은 잠시 꺼 둘게요.</div>;
}

export function Hotline() {
  return (
    <section aria-labelledby="hotline" className="card rounded-3xl p-5 lg:p-7 flex flex-col lg:flex-row lg:items-center gap-5 lg:gap-8">
      <div className="flex items-center gap-4 flex-1">
        <span className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-sage-t text-sage grid place-items-center shrink-0"><Icon name="shield" size={26} /></span>
        <div className="flex flex-col"><h2 id="hotline" className="m-0 text-xl lg:text-2xl font-bold tracking-[-0.015em]">태국 긴급 안심 핫라인</h2><p className="m-0 text-[15px] text-slate">혼자 걷는 길에도 바로 걸 수 있게 번호를 모아 뒀어요.</p></div>
      </div>
      <ul className="m-0 p-0 list-none flex flex-wrap gap-2.5">
        {EMERGENCY.map((e) => <li key={e.num}><a href={`tel:${e.tel}`} className="inline-flex items-center gap-2 min-h-12 px-4 rounded-full bg-linen line text-[15px] font-semibold hover:bg-oat"><span className="text-primary"><Icon name="phone" size={18} /></span>{e.label} <b className="font-bold">{e.num}</b></a></li>)}
      </ul>
    </section>
  );
}

export function Footer() {
  const G = [['/courses', '북부: 빠이·매홍손 산간'], ['/courses', '동북부: 치앙칸 메콩강변'], ['/courses', '북부: 난 고즈넉한 사원 마을'], ['/courses', '남부: 카오속·꼬리뻬']];
  const S = [['/safety', '혼행 안심 팩 · 태국어 카드'], ['/season', '건기·우기 시기 가이드'], ['/plan', '나만의 맞춤 동선 만들기'], ['/credits', '사진 출처']];
  return (
    <footer className="bg-oat mt-14 lg:mt-20 no-print">
      <div className="wrap gutter pt-10 lg:pt-14 pb-[120px] lg:pb-10 flex flex-col gap-10">
        <Hotline />
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-6 flex flex-col gap-3">
            <div className="flex items-center gap-3"><Logo size={22} /><span className="px-2.5 py-1 rounded-full bg-saffron-t text-alert-d text-[12px] font-bold">태국 소도시 혼행</span></div>
            <p className="m-0 text-[15px] leading-relaxed text-slate max-w-[520px]">복잡한 단체 패키지 대신 빠이, 난, 치앙칸 같은 조용한 소도시의 느린 하루를 제안해요. 내 리듬에 맞춘 안전하고 다정한 힐링 여정을 설계해 보세요.</p>
            <span className="text-[14px] text-slate flex items-center gap-2"><Icon name="offline" size={16} />오프라인 저장 · 인쇄용 일정표(PDF) 지원</span>
          </div>
          {[['소도시 가이드', G], ['혼행 서포트', S]].map(([h, items]) => (
            <nav key={h as string} aria-label={h as string} className="lg:col-span-3 flex flex-col gap-2">
              <h3 className="m-0 text-[15px] font-bold">{h as string}</h3>
              {(items as string[][]).map(([to, l]) => <Link key={l} to={to} className="text-[15px] text-slate hover:text-marine min-h-8 inline-flex items-center">{l}</Link>)}
            </nav>
          ))}
        </div>
        <div className="flex flex-col lg:flex-row lg:justify-between gap-2 border-t rule pt-5 text-[13px] text-slate">
          <span>© 2026 Sabai Solow · 프로토타입 · 숙소·투어 가격 등 일부 값은 임시 데이터예요.</span>
          <span>사진 <ExtLink href="https://unsplash.com" className="underline">Unsplash</ExtLink> · 비상 연락처 출처 <ExtLink href={EMERGENCY_SRC} className="underline">외교부 해외안전여행</ExtLink></span>
        </div>
      </div>
    </footer>
  );
}

export function Shell({ footer = true, tabbar = true }: { footer?: boolean; tabbar?: boolean }) {
  return (
    <div className="min-h-full flex flex-col">
      <button type="button" onClick={() => document.getElementById('main')?.focus()} className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] bg-card px-4 py-2 rounded-full">본문으로 건너뛰기</button>
      <OfflineBar /><Header />
      <div id="main" tabIndex={-1} className="flex-1 flex flex-col outline-none"><Outlet /></div>
      {footer && <Footer />}
      {tabbar && <TabBar />}
    </div>
  );
}
