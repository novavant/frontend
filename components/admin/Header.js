// components/admin/Header.js
import { Icon } from '@iconify/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Header({ sidebarOpen, setSidebarOpen, title }) {
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);
  const [adminServers, setAdminServers] = useState({ status: true, security: true });
  const [adminNotifications, setAdminNotifications] = useState({ pending_withdrawals: null, pending_forums: null, new_users: null });
  const [adminProfile, setAdminProfile] = useState({ name: 'Administrator', role: 'Super Admin' });
  const [isClient, setIsClient] = useState(false); // Add this state

  useEffect(() => {
    setIsClient(true); // Set to true when component mounts on client
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Load admin servers and notifications from localStorage and listen for updates
  useEffect(() => {
    const readAdminData = () => {
      try {
        const rawServers = localStorage.getItem('admin_servers');
        const parsedServers = rawServers ? JSON.parse(rawServers) : null;
        setAdminServers({
          status: parsedServers && typeof parsedServers.status === 'boolean' ? parsedServers.status : true,
          security: parsedServers && typeof parsedServers.security === 'boolean' ? parsedServers.security : true,
        });
      } catch (e) {
        setAdminServers({ status: true, security: true });
      }

      try {
        const rawNotifs = localStorage.getItem('admin_notifications');
        const parsedNotifs = rawNotifs ? JSON.parse(rawNotifs) : null;
        setAdminNotifications({
          pending_withdrawals: parsedNotifs ? parsedNotifs.pending_withdrawals || null : null,
          pending_forums: parsedNotifs ? parsedNotifs.pending_forums || null : null,
          new_users: parsedNotifs ? parsedNotifs.new_users || null : null,
        });
      } catch (e) {
        setAdminNotifications({ pending_withdrawals: null, pending_forums: null, new_users: null });
      }
    };

    readAdminData();
    // load admin profile
    try {
      const rawAdmin = localStorage.getItem('admin');
      const parsedAdmin = rawAdmin ? JSON.parse(rawAdmin) : null;
      if (parsedAdmin && parsedAdmin.name) {
        setAdminProfile({ name: parsedAdmin.name, role: parsedAdmin.role || 'Admin' });
      }
    } catch (e) {}
    window.addEventListener('storage', readAdminData);
    window.addEventListener('admin-info-updated', readAdminData);
    return () => {
      window.removeEventListener('storage', readAdminData);
      window.removeEventListener('admin-info-updated', readAdminData);
    };
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const countNotifycated = () => {
    let count = 0;
    const lists = ['pending_withdrawals', 'pending_forums', 'new_users'];
    lists.forEach((k) => {
      const arr = adminNotifications[k];
      if (Array.isArray(arr)) {
        arr.forEach(item => { if (item && item.notifycated) count += 1; });
      }
    });
    return count;
  };
  const urgentNotifications = countNotifycated();

  return (
    <header className="bg-black/40 backdrop-blur-2xl border-b border-white/10 sticky top-0 z-40">
      <div className="px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Left Section */}
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-white/10 md:hidden transition-all duration-300"
            >
              <Icon icon="mdi:menu" className="w-6 h-6" />
            </button>
            
            <div>
              <h2 className="text-white font-bold text-xl">{title}</h2>
              <div className="flex items-center gap-4 mt-1">
                {/* Only render date/time on client to prevent hydration mismatch */}
                {isClient ? (
                  <>
                    <p className="text-gray-400 text-sm">{formatDate(currentTime)}</p>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-green-400 text-sm font-mono">{formatTime(currentTime)}</span>
                    </div>
                  </>
                ) : (
                  // Placeholder during SSR
                  <div className="h-4 bg-gray-700 rounded animate-pulse w-48"></div>
                )}
              </div>
            </div>
          </div>
          
          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Quick Stats */}
            <div className="hidden lg:flex items-center gap-6 mr-4">
              <div className="text-center">
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${adminServers.status ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                  <span className={`${adminServers.status ? 'text-green-400' : 'text-red-400'} text-sm font-medium`}>{adminServers.status ? 'System Online' : 'System Offline'}</span>
                </div>
              </div>
              
              <div className="w-px h-8 bg-white/20"></div>
              
              <div className="text-center">
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${adminServers.security ? 'bg-purple-400 animate-pulse' : 'bg-red-500'}`}></div>
                  <span className={`${adminServers.security ? 'text-purple-400' : 'text-red-400'} text-sm font-medium`}>{adminServers.security ? 'Security Active' : 'Security Issue'}</span>
                </div>
              </div>
            </div>

            {/* Search Button */}
            <button className="p-3 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300 hidden md:block">
              <Icon icon="mdi:magnify" className="w-5 h-5" />
            </button>

            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-3 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300"
              >
                <Icon icon="mdi:bell" className="w-5 h-5" />
                {urgentNotifications > 0 && (
                  <>
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{urgentNotifications}</span>
                    </div>
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full animate-ping opacity-75"></div>
                  </>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-96 bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl z-50">
                  <div className="p-4 border-b border-white/10">
                    <div className="flex items-center justify-between">
                      <h3 className="text-white font-semibold">Notifikasi</h3>
                      <span className="text-gray-400 text-sm">{[...(adminNotifications.pending_withdrawals||[]), ...(adminNotifications.pending_forums||[]), ...(adminNotifications.new_users||[])].filter(Boolean).length} item</span>
                    </div>
                  </div>
                  
                  <div className="max-h-64 overflow-y-auto">
                    {/* pending_withdrawals */}
                    {Array.isArray(adminNotifications.pending_withdrawals) && adminNotifications.pending_withdrawals.map((item, idx) => (
                      <div key={`pw-${idx}`} onClick={() => { router.push('/panel-admin/withdrawals'); setShowNotifications(false); }} className="p-4 hover:bg-white/5 border-b border-white/5 last:border-b-0 transition-colors cursor-pointer">
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center bg-yellow-600/20`}>
                            <Icon icon="mdi:cash-check" className="w-4 h-4 text-yellow-400" />
                          </div>
                          <div className="flex-1">
                            <p className="text-white text-sm">{item.message}</p>
                            <p className="text-gray-400 text-xs mt-1">{timeAgo(item.time)}</p>
                          </div>
                          {item.notifycated && (
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mt-1"></div>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* pending_forums */}
                    {Array.isArray(adminNotifications.pending_forums) && adminNotifications.pending_forums.map((item, idx) => (
                      <div key={`pf-${idx}`} onClick={() => { router.push('/panel-admin/forums'); setShowNotifications(false); }} className="p-4 hover:bg-white/5 border-b border-white/5 last:border-b-0 transition-colors cursor-pointer">
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center bg-indigo-600/20`}>
                            <Icon icon="mdi:forum" className="w-4 h-4 text-indigo-400" />
                          </div>
                          <div className="flex-1">
                            <p className="text-white text-sm">{item.message}</p>
                            <p className="text-gray-400 text-xs mt-1">{timeAgo(item.time)}</p>
                          </div>
                          {item.notifycated && (
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mt-1"></div>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* new_users */}
                    {Array.isArray(adminNotifications.new_users) && adminNotifications.new_users.map((item, idx) => (
                      <div key={`nu-${idx}`} onClick={() => { router.push('/panel-admin/users'); setShowNotifications(false); }} className="p-4 hover:bg-white/5 border-b border-white/5 last:border-b-0 transition-colors cursor-pointer">
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center bg-blue-600/20`}>
                            <Icon icon="mdi:account-plus" className="w-4 h-4 text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <p className="text-white text-sm">{item.message}</p>
                            <p className="text-gray-400 text-xs mt-1">{timeAgo(item.time)}</p>
                          </div>
                          {item.notifycated && (
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mt-1"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Settings */}
            <button onClick={() => router.push('/panel-admin/settings')} className="p-3 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300">
              <Icon icon="mdi:cog" className="w-5 h-5" />
            </button>

            {/* Profile Menu */}
            <div className="flex items-center gap-3 pl-4 border-l border-white/20 relative">
              <div className="hidden md:block text-right">
                <p className="text-white font-medium text-sm">{adminProfile.name}</p>
                <p className="text-gray-400 text-xs">{adminProfile.role}</p>
              </div>
              
              <div className="relative">
                <div onClick={() => setShowProfileMenu(!showProfileMenu)} className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                  <Icon icon="mdi:account" className="text-white w-5 h-5" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
              </div>

              {/* Dropdown */}
              {showProfileMenu && (
                <>
                  <div className="absolute right-0 top-full mt-2 w-44 bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl z-50 py-2">
                    <button onClick={() => { router.push('/panel-admin/profile'); setShowProfileMenu(false); }} className="w-full text-left px-4 py-2 hover:bg-white/5 transition-colors">
                      Profile
                    </button>
                    <button onClick={() => {
                      // Logout: clear admin info and redirect to login
                      try { localStorage.removeItem('sidebarState'); localStorage.removeItem('admin'); localStorage.removeItem('admin_servers'); localStorage.removeItem('admin_applications'); localStorage.removeItem('admin_notifications'); window.dispatchEvent(new Event('admin-info-updated')); } catch(e) {}
                      router.push('/panel-admin/login');
                    }} className="w-full text-left px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-b-2xl transition-colors">
                      Logout
                    </button>
                  </div>
                  {/* Click-away overlay for profile dropdown */}
                  <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)}></div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close notifications */}
      {showNotifications && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowNotifications(false)}
        ></div>
      )}
    </header>
  );
}

// Helper to display relative time
function timeAgo(isoString) {
  try {
    const then = new Date(isoString);
    const now = new Date();
    const sec = Math.floor((now - then) / 1000);
    if (isNaN(sec) || sec < 0) return 'Baru saja';
    if (sec < 60) return 'Baru saja';
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min} menit yang lalu`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr} jam yang lalu`;
    const days = Math.floor(hr / 24);
    return `${days} hari yang lalu`;
  } catch (e) {
    return 'Baru saja';
  }
}