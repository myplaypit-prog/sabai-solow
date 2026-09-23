import { HashRouter, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { tourById } from './data/tours';
import { AppProvider } from './state';
import { Shell } from './components/Layout';
import Home from './pages/Home';
import Plan from './pages/Plan';
import Trip from './pages/Trip';
import { Login, Signup, Verify, Reset } from './pages/Auth';
import { Courses, Season, MyTrips, Safety, PrintView, Credits, TourPage, NotFound } from './pages/Misc';

const TITLES: Record<string, string> = {
  '/': '혼자 누리는 태국 소도시 쉼표 여행', '/plan': '맞춤 일정 플래너', '/season': '시기 가이드', '/courses': '추천 코스 8선',
  '/safety': '혼행 안심 팩', '/my': '내 일정', '/credits': '사진 출처', '/login': '로그인', '/signup': '회원가입',
  '/verify': '이메일 인증', '/reset-password': '비밀번호 재설정',
};
/** 화면마다 탭 제목을 달아 탭 구분·화면 읽기 프로그램이 알아듣게 해요 */
function TitleSync() {
  const { pathname } = useLocation();
  useEffect(() => {
    const tour = pathname.match(/^\/tours\/([^/]+)$/)?.[1];
    const t = TITLES[pathname] ?? (tour ? tourById(tour)?.name ?? '투어' : pathname.endsWith('/print') ? '일정표 인쇄' : pathname.startsWith('/trip/') ? '내 여행 일정' : '페이지를 찾을 수 없어요');
    document.title = `${t} · Sabai Solow`;
  }, [pathname]);
  return null;
}
function ScrollTop() { const { pathname } = useLocation(); useEffect(() => { window.scrollTo(0, 0); }, [pathname]); return null; }

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <ScrollTop /><TitleSync />
        <Routes>
          <Route element={<Shell />}>
            <Route path="/" element={<Home />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/season" element={<Season />} />
            <Route path="/safety" element={<Safety />} />
            <Route path="/my" element={<MyTrips />} />
            <Route path="/credits" element={<Credits />} />
            <Route path="/tours/:id" element={<TourPage />} />
          </Route>
          <Route element={<Shell footer={false} />}>
            <Route path="/trip/:id" element={<Trip />} />
          </Route>
          <Route element={<Shell footer={false} tabbar={false} />}>
            <Route path="/plan" element={<Plan />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/reset-password" element={<Reset />} />
          </Route>
          <Route path="/trip/:id/print" element={<PrintView />} />
          <Route element={<Shell />}><Route path="*" element={<NotFound />} /></Route>
        </Routes>
      </HashRouter>
    </AppProvider>
  );
}
