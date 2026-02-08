// components/admin/Sidebar.js
import { useRouter } from 'next/router';
import { Icon } from '@iconify/react';
import { useState, useEffect } from 'react';
import { logoutAdmin } from '../../utils/admin/api';
import Image from 'next/image';
export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const router = useRouter();
  const [hoveredItem, setHoveredItem] = useState(null);
  const [adminApps, setAdminApps] = useState({ pending_withdrawals: null, pending_forums: null });
  const [adminProfile, setAdminProfile] = useState({ name: 'Administrator', role: 'Super Admin' });

  // Load sidebar state from localStorage on component mount
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarState');
    if (savedState !== null && setSidebarOpen) {
      setSidebarOpen(JSON.parse(savedState));
    }
  }, [setSidebarOpen]);

  // load admin profile
  useEffect(() => {
    try {
      const rawAdmin = localStorage.getItem('admin');
      const parsedAdmin = rawAdmin ? JSON.parse(rawAdmin) : null;
      if (parsedAdmin && parsedAdmin.name) {
        setAdminProfile({ name: parsedAdmin.name, role: parsedAdmin.role || 'Admin' });
      }
    } catch (e) { }
  }, []);

  // Save sidebar state to localStorage whenever it changes
  useEffect(() => {
    if (sidebarOpen !== undefined) {
      localStorage.setItem('sidebarState', JSON.stringify(sidebarOpen));
    }
  }, [sidebarOpen]);

  // Load admin_applications and listen for updates
  useEffect(() => {
    const readAdminApps = () => {
      try {
        const raw = localStorage.getItem('admin_applications');
        const parsed = raw ? JSON.parse(raw) : null;
        setAdminApps({
          pending_withdrawals: parsed && typeof parsed.pending_withdrawals === 'number' ? parsed.pending_withdrawals : null,
          pending_forums: parsed && typeof parsed.pending_forums === 'number' ? parsed.pending_forums : null,
        });
      } catch (e) {
        setAdminApps({ pending_withdrawals: null, pending_forums: null });
      }
    };

    readAdminApps();
    window.addEventListener('storage', readAdminApps);
    window.addEventListener('admin-info-updated', readAdminApps);
    return () => {
      window.removeEventListener('storage', readAdminApps);
      window.removeEventListener('admin-info-updated', readAdminApps);
    };
  }, []);

  const handleLogout = () => {
    try { logoutAdmin(); } catch { }
    try { localStorage.removeItem('sidebarState'); } catch { }
    try { localStorage.removeItem('admin'); } catch { }
    try { localStorage.removeItem('admin_servers'); } catch { }
    try { localStorage.removeItem('admin_applications'); } catch { }
    try { localStorage.removeItem('admin_notifications'); } catch { }
    router.push('/panel-admin/login');
  };

  const menuItems = [
    {
      icon: "mdi:view-dashboard",
      label: "Dashboard",
      path: "/panel-admin/dashboard",
      badge: null,
      color: "from-purple-600 to-pink-600"
    },
    {
      icon: "mdi:account-group",
      label: "Kelola Pengguna",
      path: "/panel-admin/users",
      badge: null,
      color: "from-blue-600 to-cyan-600"
    },
    {
      icon: "mdi:chart-box",
      label: "Kelola Investasi",
      path: "/panel-admin/investments",
      badge: null,
      color: "from-green-600 to-emerald-600"
    },
    {
      icon: "mdi:cash-check",
      label: "Kelola Penarikan",
      path: "/panel-admin/withdrawals",
      badge: 3,
      color: "from-yellow-600 to-orange-600"
    },
    {
      icon: "mdi:swap-horizontal",
      label: "Kelola Transaksi",
      path: "/panel-admin/transactions",
      badge: null,
      color: "from-indigo-600 to-purple-600"
    },
    {
      icon: "mdi:forum",
      label: "Kelola Forum",
      path: "/panel-admin/forums",
      badge: null,
      color: "from-pink-600 to-rose-600"
    },
    {
      icon: "mdi:category",
      label: "Kelola Kategori",
      path: "/panel-admin/categories",
      badge: null,
      color: "from-orange-600 to-yellow-600"
    },
    {
      icon: "mdi:package-variant",
      label: "Kelola Produk",
      path: "/panel-admin/products",
      badge: null,
      color: "from-teal-600 to-green-600"
    },
    {
      icon: "mdi:bank",
      label: "Kelola Bank",
      path: "/panel-admin/banks",
      badge: null,
      color: "from-slate-600 to-gray-600"
    },
    {
      icon: "mdi:gift-outline",
      label: "Kelola Hadiah",
      path: "/panel-admin/gifts",
      badge: null,
      color: "from-pink-600 to-purple-600"
    },
    {
      icon: "mdi:cards-spade",
      label: "Kelola Spin",
      path: "/panel-admin/spins",
      badge: null,
      color: "from-violet-600 to-purple-600"
    },
    {
      icon: "mdi:format-list-checks",
      label: "Kelola Tugas",
      path: "/panel-admin/tasks",
      badge: null,
      color: "from-emerald-600 to-teal-600"
    },
    {
      icon: "mdi:cog",
      label: "Pengaturan Website",
      path: "/panel-admin/settings",
      badge: null,
      color: "from-gray-600 to-slate-600"
    },
  ];

  // Prepare menu items with dynamic badges for withdrawals and forums
  const dynamicMenuItems = menuItems.map(mi => {
    if (mi.path === '/panel-admin/withdrawals') {
      return { ...mi, badge: adminApps.pending_withdrawals && adminApps.pending_withdrawals > 0 ? adminApps.pending_withdrawals : null };
    }
    if (mi.path === '/panel-admin/forums') {
      return { ...mi, badge: adminApps.pending_forums && adminApps.pending_forums > 0 ? adminApps.pending_forums : null };
    }
    return mi;
  });

  return (
    <div className={`bg-black/40 backdrop-blur-2xl border-r border-white/10 transition-all duration-300 ${sidebarOpen ? 'w-72' : 'w-20'} flex flex-col h-full relative`}>
      {/* Header */}
      <div className="p-6 border-b border-white/10 relative">
        {sidebarOpen ? (
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center overflow-hidden">
                <Image
                  src="/vla-icon.png"
                  alt="Vla Icon"
                  className="object-contain w-10 h-10"
                  style={{ maxWidth: '40px', maxHeight: '40px' }}
                />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black"></div>
            </div>
            <div>
              <h1 className="text-white font-bold text-xl">Admin Panel</h1>
              <p className="text-gray-400 text-sm">Vla Devs</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center overflow-hidden">
              <Image
                src="/vla-icon.png"
                alt="Vla Icon"
                className="object-contain w-10 h-10"
                style={{ maxWidth: '40px', maxHeight: '40px' }}
              />
            </div>
          </div>
        )}

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-8 w-6 h-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg"
        >
          <Icon icon={sidebarOpen ? "mdi:chevron-left" : "mdi:chevron-right"} className="w-4 h-4" />
        </button>
      </div>

      {/* Profile Section */}
      {sidebarOpen && (
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Icon icon="mdi:account" className="text-white w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-white font-medium text-sm">{adminProfile.name}</p>
              <p className="text-gray-400 text-xs">{adminProfile.role}</p>
            </div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      )}

      {/* Menu Items - Scrollable */}
      <div className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
        <div className="px-4 space-y-2">
          {dynamicMenuItems.map((item, index) => (
            <SidebarButton
              key={item.path}
              icon={item.icon}
              label={item.label}
              active={router.pathname === item.path}
              expanded={sidebarOpen}
              onClick={() => router.push(item.path)}
              badge={item.badge}
              color={item.color}
              onHover={setHoveredItem}
              isHovered={hoveredItem === index}
              index={index}
            />
          ))}
        </div>
      </div>

      {/* Footer with Logout */}
      <div className="p-4 border-t border-white/10">
        {sidebarOpen ? (
          <div className="space-y-3">
            <div className="text-center">
              <p className="text-gray-400 text-xs">Version 1.0.5</p>
              <p className="text-gray-500 text-xs">© 2025 Vla Devs</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-3 rounded-2xl text-sm transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
            >
              <Icon icon="mdi:logout" className="w-4 h-4" />
              Keluar
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogout}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white p-3 rounded-2xl transition-all duration-300 flex items-center justify-center hover:scale-105 active:scale-95"
            title="Keluar"
          >
            <Icon icon="mdi:logout" className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

function SidebarButton({ icon, label, active, expanded, onClick, badge, color, onHover, isHovered, index }) {
  return (
    <div className="relative">
      <button
        onClick={onClick}
        onMouseEnter={() => onHover(index)}
        onMouseLeave={() => onHover(null)}
        className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all duration-300 relative group ${active
            ? 'bg-gradient-to-r ' + color + ' text-white shadow-lg scale-105'
            : 'text-gray-400 hover:text-white hover:bg-white/10 hover:scale-105'
          }`}
      >
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${active ? 'bg-white/20' : 'bg-white/5 group-hover:bg-white/10'
          }`}>
          <Icon icon={icon} className="w-5 h-5 flex-shrink-0" />
        </div>

        {expanded && (
          <span className="text-sm font-medium flex-1 text-left">{label}</span>
        )}

        {badge && badge > 0 && (
          <div className={`${expanded ? 'relative' : 'absolute -top-1 -right-1'} w-5 h-5 bg-red-500 rounded-full flex items-center justify-center`}>
            <span className="text-white text-xs font-bold">{badge > 99 ? '99+' : badge}</span>
          </div>
        )}

        {/* Hover tooltip for collapsed sidebar */}
        {!expanded && isHovered && (
          <div className="absolute left-16 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap z-50 border border-white/20">
            {label}
            {badge && badge > 0 && (
              <span className="ml-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                {badge}
              </span>
            )}
            <div className="absolute right-full top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45 border-l border-b border-white/20"></div>
          </div>
        )}
      </button>
    </div>
  );
}