import { memo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiHome, HiMagnifyingGlass, HiBookmark, HiClock, HiUser } from 'react-icons/hi2';
import useStore from '../store/useStore';

const navItems = [
  { id: 'home', label: 'Home', icon: HiHome, path: '/' },
  { id: 'search', label: 'Search', icon: HiMagnifyingGlass, path: '/', action: 'search' },
  { id: 'watchlist', label: 'My List', icon: HiBookmark, path: '/watchlist' },
  { id: 'history', label: 'History', icon: HiClock, path: '/history' },
  { id: 'profile', label: 'Profile', icon: HiUser, path: '/profile' },
];

const BottomNav = memo(function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setCurrentTab } = useStore();

  const isPlayerPage = location.pathname.startsWith('/watch');
  if (isPlayerPage) return null;

  const handleClick = (item) => {
    if (item.id === 'home') {
      setCurrentTab(0);
      navigate('/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (item.id === 'search') {
      document.querySelector('input[aria-label="Search movies"]')?.focus();
    } else {
      navigate(item.path);
    }
  };

  const getIsActive = (item) => {
    if (item.id === 'home') return location.pathname === '/' && !location.pathname.startsWith('/watchlist') && !location.pathname.startsWith('/history');
    if (item.id === 'search') return false;
    return location.pathname === item.path;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass border-t border-border safe-area-pb">
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = getIsActive(item);
          return (
            <button
              key={item.id}
              onClick={() => handleClick(item)}
              className="relative flex flex-col items-center justify-center gap-0.5 min-w-[60px] py-1 transition-colors"
            >
              <Icon className={`text-xl transition-colors ${isActive ? 'text-primary' : 'text-text-muted'}`} />
              <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-primary' : 'text-text-muted'}`}>
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="bottomNav"
                  className="absolute -top-0.5 w-8 h-0.5 bg-primary rounded-full"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
});

export default BottomNav;
