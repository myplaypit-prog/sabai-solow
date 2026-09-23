import { NavLink, Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Icon } from './Icon';
import { Logo, Btn, ExtLink } from './ui';
import { useApp } from '../state';

const MENU = [{ to: '/courses', label: '추천 코스' }, { to: '/season', label: '시기 가이드' }, { to: '/safety', label: '혼행 안심 팩' }];

function ThemeBtn() {
  const { theme, setTheme } = useApp();
  const next = theme === 'system' ? 'dark' : theme === 'dark' ? 'light' : 'system';
  const label = theme === 'system' ? '테마: 기기 설정' : theme === 'dark' ? '테마: 다크' : '테마: 라이트';
  return <button type="button" onClick={() => setTheme(next)} aria-label={`${label} (눌러서 바꾸기)`} title={label} className="w-11 h-11 rounded-full grid place-items-center hover:bg-sand"><Icon name={theme === 'dark' ? 'moon' : 'sun'} size={20} /></button>;
}

export function DesktopNav() {
  const { user } = useApp();
  return (
    <header className="hidden lg:flex h-[88px] gutter items-center justify-between border-b-[1.5px] rule no-print">
      <Logo size={30} />
      <div className="flex items-center gap-8">
        <nav aria-label="주요 메뉴" className="flex gap-8 text-[17px] font-semibold">
          {MENU.map((m) => <NavLink key={m.to} to={m.to} className={({ isActive }) => `min-h-11 inline-flex items-center hover:underline underline-offset-8 ${isActive ? 'font-extrabold underline decoration-2' : ''}`}>{m.label}</NavLink>)}
          {user ? <NavLink to="/my" className="min-h-11 inline-flex items-center gap-2 hover:underline underline-offset-8"><Icon name="user" />내 일정</NavLink> : <NavLink to="/login" className="min-h-11 inline-flex items-center hover:underline underline-offset-8">로그인</NavLink>}
        </nav>
        <ThemeBtn />
        <Btn to="/plan" className="h-[52px] text-[17px]">계획 만들기</Btn>
      </div>
    </header>
  );
}

export function MobileHeader() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useApp();
  const loc = useLocation(); const nav = useNavigate();
  const isHome = loc.pathname === '/';
  return (
    <header className="lg:hidden sticky z-40 bg-cloud border-b-[1.5px] rule no-print" style={{ top: 'env(safe-area-inset-top, 0px)' }}>
      <div className="h-16 px-4 flex items-center justify-between">
        {isHome ? <Logo size={24} /> : <button type="button" onClick={() => nav(-1)} aria-label="뒤로" className="w-11 h-11 -ml-2.5 grid place-items-center"><Icon name="back" size={24} /></button>}
        {!isHome && <span className="absolute left-1/2 -translate-x-1/2"><Logo size={20} /></span>}
        <div className="flex items-center -mr-2.5"><ThemeBtn />
          <button type="button" aria-label={open ? '메뉴 닫기' : '메뉴 열기'} aria-expanded={open} onClick={() => setOpen(!open)} className="w-11 h-11 grid place-items-center"><Icon name={open ? 'x' : 'menu'} size={24} /></button></div>
      </div>
      {open && (
        <nav aria-label="전체 메뉴" className="px-4 pb-5 flex flex-col text-lg font-bold" onClick={() => setOpen(false)}>
          {MENU.map((m) => <Link key={m.to} to={m.to} className="min-h-12 flex items-center border-t border-ink/15">{m.label}</Link>)}
          {user ? <><Link to="/my" className="min-h-12 flex items-center border-t border-ink/15">내 일정</Link><button type="button" onClick={logout} className="min-h-12 text-left border-t border-ink/15">로그아웃</button></> : <Link to="/login" className="min-h-12 flex items-center border-t border-ink/15">로그인</Link>}
        </nav>
      )}
    </header>
  );
}

export function TabBar() {
  const T = [{ to: '/', l: '홈', i: 'home', end: true }, { to: '/plan', l: '계획', i: 'route' }, { to: '/courses', l: '둘러보기', i: 'compass' }, { to: '/my', l: '내 일정', i: 'save' }];
  return (
    <nav aria-label="하단 탭" className="lg:hidden fixed left-0 right-0 bottom-0 z-40 bg-paper border-t-[1.5px] rule flex px-2 no-print" style={{ paddingBottom: 'calc(8px + env(safe-area-inset-bottom, 0px))' }}>
      {T.map((t) => (
        <NavLink key={t.to} to={t.to} end={t.end} className={({ isActive }) => `flex-1 min-h-14 flex flex-col items-center justify-center gap-1 text-xs ${isActive ? 'font-extrabold text-ink' : 'font-semibold text-muted'}`}>
          {({ isActive }) => <><span className={isActive ? 'text-lagoon' : ''}><Icon name={t.i} size={22} sw={isActive ? 2.2 : 1.8} /></span>{t.l}</>}
        </NavLink>
      ))}
    </nav>
  );
}

export function OfflineBar() {
  const { online } = useApp();
  if (online) return null;
  return <div role="status" className="bg-night text-on-night text-[15px] font-bold px-4 py-2.5 flex items-center gap-2 justify-center no-print"><Icon name="offline" size={18} />오프라인 — 저장된 일정을 보고 있어요. 외부 사이트 버튼은 잠시 꺼 둘게요.</div>;
}

export function Footer() {
  return (
    <footer className="grain relative z-[3] -mt-8 lg:-mt-14 bg-butter text-fixedink rounded-t-[32px] lg:rounded-t-[56px] no-print">
      <div className="wrap gutter pt-10 lg:pt-[72px] pb-[110px] lg:pb-11 flex flex-col gap-6 lg:gap-8">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
          <p className="m-0 serif-i text-4xl lg:text-[56px] leading-none">slow &amp; solo</p>
          <Btn to="/plan" className="hidden lg:inline-flex h-[60px] text-lg">내 여행 계획 만들기</Btn>
        </div>
        <div className="font-grot font-extrabold tracking-[-0.06em] leading-[.84] text-[64px] sm:text-[120px] xl:text-[212px] whitespace-nowrap overflow-hidden" aria-hidden="true">Sabai<span className="sm:hidden"><br /></span><span className="hidden sm:inline"> </span>Solo<span className="text-[#C23C17]">w</span></div>
        <div className="flex flex-col lg:flex-row lg:justify-between gap-3 border-t-[1.5px] border-[#2A1B14] pt-5 text-[15px]">
          <nav aria-label="하단 메뉴" className="flex flex-wrap gap-x-7 gap-y-2 font-bold">{MENU.map((m) => <Link key={m.to} to={m.to} className="hover:underline">{m.label}</Link>)}<Link to="/credits" className="hover:underline">사진 출처</Link></nav>
          <span>숙소 평점·가격, 교통 시간, 투어 내용은 확인일 기준이며 바뀔 수 있어요 · 사진 <ExtLink href="https://unsplash.com" className="underline">Unsplash</ExtLink></span>
        </div>
      </div>
    </footer>
  );
}

export function Shell({ footer = true, tabbar = true }: { footer?: boolean; tabbar?: boolean }) {
  return (
    <div className="min-h-full flex flex-col">
      <button type="button" onClick={() => document.getElementById('main')?.focus()} className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 bg-paper px-4 py-2 rounded-full">본문으로 건너뛰기</button>
      <OfflineBar /><DesktopNav /><MobileHeader />
      <div id="main" tabIndex={-1} className="flex-1 flex flex-col outline-none"><Outlet /></div>
      {footer && <Footer />}
      {tabbar && <TabBar />}
    </div>
  );
}
