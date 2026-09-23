import { HashRouter, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AppProvider } from './state';
import { Shell } from './components/Layout';
import Home from './pages/Home';
import Plan from './pages/Plan';
import Trip from './pages/Trip';
import { Login, Signup, Verify, Reset } from './pages/Auth';
import { Courses, Season, MyTrips, Safety, PrintView, Credits, TourPage } from './pages/Misc';

function ScrollTop() { const { pathname } = useLocation(); useEffect(() => { window.scrollTo(0, 0); }, [pathname]); return null; }

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <ScrollTop />
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
          <Route path="*" element={<Shell />} />
        </Routes>
      </HashRouter>
    </AppProvider>
  );
}
