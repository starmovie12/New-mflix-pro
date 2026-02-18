import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import ScrollToTop from './components/ScrollToTop';

const HomePage = lazy(() => import('./pages/HomePage'));
const PlayerPage = lazy(() => import('./pages/PlayerPage'));
const WatchlistPage = lazy(() => import('./pages/WatchlistPage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const NotFound = lazy(() => import('./pages/NotFound'));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-base">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        <div className="text-xl font-black tracking-tighter">
          <span className="text-white">M</span><span className="text-primary">FLIX</span>
        </div>
      </div>
    </div>
  );
}

function ScrollRestoration() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return null;
}

export default function App() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
      });
    }
  }, []);

  return (
    <HelmetProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-bg-base text-text-primary">
          <Header />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/watch/:id" element={<PlayerPage />} />
              <Route path="/watchlist" element={<WatchlistPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <BottomNav />
          <ScrollToTop />
          <Toaster
            position="bottom-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1a1a1a',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: 500,
              },
            }}
          />
        </div>
      </BrowserRouter>
    </HelmetProvider>
  );
}
