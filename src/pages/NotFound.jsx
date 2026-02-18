import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { HiFilm, HiHome } from 'react-icons/hi2';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>404 - Page Not Found | MFLIX</title>
      </Helmet>
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-bg-base">
        <div className="w-24 h-24 rounded-full bg-bg-elevated flex items-center justify-center mb-6">
          <HiFilm className="text-5xl text-text-muted" />
        </div>
        <h1 className="text-6xl font-black text-primary mb-2">404</h1>
        <h2 className="text-xl font-bold text-white mb-2">Page Not Found</h2>
        <p className="text-sm text-text-muted max-w-sm mb-6">
          The page you're looking for doesn't exist or has been moved. Let's get you back to watching!
        </p>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-colors shadow-lg shadow-primary/30"
        >
          <HiHome className="text-lg" /> Back to Home
        </button>
      </div>
    </>
  );
}
