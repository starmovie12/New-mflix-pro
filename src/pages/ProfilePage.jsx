import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  HiUser, HiBookmark, HiClock, HiHeart, HiCog6Tooth,
  HiMoon, HiSun, HiTrash, HiInformationCircle, HiShieldCheck,
  HiGlobeAlt, HiDevicePhoneMobile, HiChevronRight, HiFilm
} from 'react-icons/hi2';
import useStore from '../store/useStore';

export default function ProfilePage() {
  const {
    watchlist, watchHistory, likedMovies, continueWatching,
    userPreferences, updatePreferences,
    clearSearchHistory, searchHistory
  } = useStore();

  const [showPrefs, setShowPrefs] = useState(false);

  const stats = [
    { label: 'Watchlist', value: watchlist.length, icon: HiBookmark, color: 'text-blue-400' },
    { label: 'Watched', value: watchHistory.length, icon: HiClock, color: 'text-green-400' },
    { label: 'Liked', value: likedMovies.length, icon: HiHeart, color: 'text-red-400' },
    { label: 'Continue', value: continueWatching.length, icon: HiFilm, color: 'text-yellow-400' },
  ];

  const menuItems = [
    { label: 'Preferences', icon: HiCog6Tooth, action: () => setShowPrefs(!showPrefs) },
    {
      label: 'Clear Search History',
      icon: HiTrash,
      action: clearSearchHistory,
      subtitle: `${searchHistory.length} searches`
    },
    { label: 'About MFLIX', icon: HiInformationCircle, action: () => {} },
    { label: 'Privacy Policy', icon: HiShieldCheck, action: () => {} },
  ];

  return (
    <>
      <Helmet>
        <title>Profile - MFLIX</title>
      </Helmet>

      <div className="pt-[108px] pb-20 min-h-screen px-3">
        {/* Profile Header */}
        <div className="flex flex-col items-center py-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center mb-3 shadow-lg shadow-primary/20">
            <HiUser className="text-3xl text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">MFLIX User</h1>
          <p className="text-xs text-text-muted mt-1">Free Account</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center p-3 rounded-xl bg-bg-elevated border border-border"
            >
              <stat.icon className={`text-xl ${stat.color} mb-1`} />
              <span className="text-lg font-bold text-white">{stat.value}</span>
              <span className="text-[10px] text-text-muted">{stat.label}</span>
            </motion.div>
          ))}
        </div>

        {/* Menu */}
        <div className="space-y-1 mb-6">
          {menuItems.map((item, i) => (
            <button
              key={item.label}
              onClick={item.action}
              className="flex items-center w-full p-3.5 rounded-xl bg-bg-elevated border border-border hover:bg-bg-hover transition-colors"
            >
              <item.icon className="text-xl text-text-secondary mr-3" />
              <div className="flex-1 text-left">
                <span className="text-sm font-medium text-white">{item.label}</span>
                {item.subtitle && (
                  <p className="text-[11px] text-text-muted">{item.subtitle}</p>
                )}
              </div>
              <HiChevronRight className="text-text-muted" />
            </button>
          ))}
        </div>

        {/* Preferences Panel */}
        {showPrefs && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="p-4 rounded-xl bg-bg-elevated border border-border space-y-4 mb-6"
          >
            <h3 className="text-sm font-bold text-white">Preferences</h3>

            <div>
              <label className="text-xs text-text-muted mb-1.5 block">Default Quality</label>
              <div className="flex gap-2">
                {['Auto', 'HD', '720p', '480p'].map(q => (
                  <button
                    key={q}
                    onClick={() => updatePreferences({ defaultQuality: q })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      userPreferences.defaultQuality === q
                        ? 'bg-primary text-white'
                        : 'bg-bg-hover text-text-secondary border border-border'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-text-secondary">Autoplay</span>
              <button
                onClick={() => updatePreferences({ autoplay: !userPreferences.autoplay })}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  userPreferences.autoplay ? 'bg-primary' : 'bg-bg-hover border border-border'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${
                  userPreferences.autoplay ? 'left-6' : 'left-1'
                }`} />
              </button>
            </div>
          </motion.div>
        )}

        {/* App Info */}
        <div className="text-center py-4">
          <div className="text-xl font-black tracking-tighter mb-1">
            <span className="text-white">M</span><span className="text-primary">FLIX</span>
          </div>
          <p className="text-[10px] text-text-muted">Version 2.0.0 • Built with React</p>
          <p className="text-[10px] text-text-muted mt-0.5">&copy; 2026 MFLIX. All rights reserved.</p>
        </div>
      </div>
    </>
  );
}
