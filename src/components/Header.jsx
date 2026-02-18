import { Search, Bell, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Header({ isScrolled, tabs, activeTab, onTabChange, onSearchFocus }) {
  const navigate = useNavigate();

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-black/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
    }`}>
      <div className="flex items-center justify-between px-4 py-3 gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <button onClick={() => navigate('/')} className="flex-shrink-0">
            <span className="text-xl font-extrabold tracking-tight">
              <span className="text-white">M</span><span className="text-mflix-red">FLIX</span>
            </span>
          </button>
          <nav className="hidden sm:flex items-center gap-6">
            {tabs.map((tab, i) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(i)}
                className={`text-sm font-medium transition-colors ${
                  activeTab === i ? 'text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSearchFocus?.()}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Search"
          >
            <Search className="w-5 h-5 text-white" />
          </button>
          <button className="p-2 rounded-full hover:bg-white/10 transition-colors hidden sm:block" aria-label="Notifications">
            <Bell className="w-5 h-5 text-white" />
          </button>
          <button className="p-2 rounded-full hover:bg-white/10 transition-colors" aria-label="Profile">
            <User className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
      {/* Mobile Tab Bar */}
      <div className="sm:hidden overflow-x-auto scrollbar-hide border-b border-white/10">
        <div className="flex gap-1 px-4 py-2 min-w-max">
          {tabs.map((tab, i) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(i)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === i
                  ? 'bg-mflix-red text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}

export default Header;
