// components/BottomNavbar.js
import { useRouter } from 'next/router';
import { Icon } from '@iconify/react';
import LiveChatWidget from './LiveChat/LiveChatWidget';
import { motion } from 'framer-motion';

const navItems = [
  { label: 'Beranda', icon: 'mdi:home-variant-outline', activeIcon: 'mdi:home-variant', href: '/dashboard', key: 'dashboard' },
  { label: 'Komisi', icon: 'mdi:account-group-outline', activeIcon: 'mdi:account-group', href: '/referral', key: 'referral' },
  { label: 'Spin', icon: 'mdi:slot-machine', href: '/spin-wheel', key: 'spin', isFab: true },
  { label: 'Forum', icon: 'mdi:forum-outline', activeIcon: 'mdi:forum', href: '/forum', key: 'forum' },
  { label: 'Saya', icon: 'mdi:account-circle-outline', activeIcon: 'mdi:account-circle', href: '/profile', key: 'profile' },
];

export default function BottomNavbar() {
  const router = useRouter();

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">

        {/* Floating Container */}
        <div className="max-w-md mx-auto relative pointer-events-auto">

          {/* Main Navbar Background with Glassmorphism */}
          <div className="bg-slate-900/80 backdrop-blur-xl border-t border-white/5 pb-6 pt-3 px-6 relative">

            {/* Top Border Gradient Line */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

            <div className="flex items-end justify-between relative z-10">
              {navItems.map((item) => {
                const isActive = router.pathname === item.href ||
                  (item.key === 'dashboard' && router.pathname === '/') ||
                  (item.href !== '/dashboard' && router.pathname.startsWith(item.href) && !item.isFab);

                if (item.isFab) {
                  return (
                    <div key={item.key} className="relative -top-8 group">
                      <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
                      <button
                        onClick={() => router.push(item.href)}
                        className="relative w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 border-4 border-slate-900 transform transition-transform duration-300 hover:scale-105 active:scale-95"
                      >
                        <Icon icon={item.icon} className="w-8 h-8 text-white animate-pulse" />
                      </button>
                      <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-blue-400 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.label}
                      </span>
                    </div>
                  );
                }

                return (
                  <button
                    key={item.key}
                    onClick={() => router.push(item.href)}
                    className="flex flex-col items-center justify-center w-12 group relative"
                  >
                    {/* Active Indicator Background */}
                    {isActive && (
                      <div className="absolute -top-3 w-8 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                    )}

                    <div className={`relative p-1.5 rounded-xl transition-all duration-300 transform group-active:scale-90 ${isActive ? '-translate-y-1' : ''
                      }`}>
                      <Icon
                        icon={isActive ? item.activeIcon : item.icon}
                        className={`w-6 h-6 transition-all duration-300 ${isActive
                            ? 'text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]'
                            : 'text-slate-500 group-hover:text-slate-300'
                          }`}
                      />
                    </div>

                    <span className={`text-[10px] font-medium transition-all duration-300 ${isActive
                      ? 'text-blue-400 font-bold translate-y-0 opacity-100'
                      : 'text-slate-500 translate-y-1 opacity-0 group-hover:opacity-100 group-hover:translate-y-0'
                      }`}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Adjust LiveChat Position */}
      <div className="pointer-events-auto">
        <LiveChatWidget customPosition="bottom-24 right-4" />
      </div>
    </>
  );
}
