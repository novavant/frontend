// components/admin/Layout.js
import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import Sidebar from './Sidebar';
import Header from './Header';
import Image from 'next/image';
import { getAdminToken, startAdminInfoPolling, stopAdminInfoPolling } from '../../utils/admin/api';

export default function AdminLayout({ children, title = 'Admin Panel' }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      } else {
        // Load from localStorage for desktop
        const savedState = localStorage.getItem('sidebarState');
        if (savedState !== null) {
          setSidebarOpen(JSON.parse(savedState));
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Start admin info polling when token exists; stop on token removal
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const startIfNeeded = () => {
      const token = getAdminToken();
      if (token) startAdminInfoPolling();
      else stopAdminInfoPolling();
    };

    // run once on mount
    startIfNeeded();

    // Listen for token changes (other tabs or same-tab dispatch)
    window.addEventListener('storage', startIfNeeded);
    window.addEventListener('admin-token-changed', startIfNeeded);

    return () => {
      window.removeEventListener('storage', startIfNeeded);
      window.removeEventListener('admin-token-changed', startIfNeeded);
      stopAdminInfoPolling();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25px 25px, rgba(255,255,255,0.15) 2px, transparent 0)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Sidebar */}
      <div className={`${isMobile ? 'fixed inset-y-0 left-0 z-50' : 'relative'} transition-transform duration-300 ${
        isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'
      }`}>
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      </div>

      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <Header 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen} 
          title={title} 
        />
        
        <main className="flex-1 overflow-auto">
          {/* Content Container */}
          <div className="p-6 lg:p-8 space-y-6">
            {children}
          </div>

          {/* Footer */}
                <footer className="mt-12 py-8 px-6 lg:px-8 border-t border-white/10 bg-black/20">
                <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center overflow-hidden">
                    <Image 
                    src="/vla-icon.png" 
                    alt="Vla Devs Icon" 
                    className="w-7 h-3 object-contain"
                    style={{ maxWidth: '28px', maxHeight: '12px' }}
                    />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">Vla Devs</p>
                    <p className="text-gray-400 text-xs">Admin Management System</p>
                  </div>
                  </div>

                  <div className="flex flex-col lg:flex-row items-center gap-6 text-sm">
                  <div className="flex items-center gap-6">
                    <ServerStatusIndicators />
                  </div>
                  
                  <div className="text-gray-400 text-xs">
                    © 2025 Vla Devs. All rights reserved. | Version 1.0.5
                  </div>
                  </div>
                </div>
                </footer>
              </main>
              </div>

              {/* Scroll to Top Button */}
      <ScrollToTopButton />

      {/* Toast Notifications Container */}
      <div id="toast-container" className="fixed top-20 right-6 z-50 space-y-3">
        {/* Toast notifications will be rendered here */}
      </div>
    </div>
  );
}

// Scroll to Top Button Component
function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      const mainContent = document.querySelector('main');
      if (mainContent && mainContent.scrollTop > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    const mainContent = document.querySelector('main');
    if (mainContent) {
      mainContent.addEventListener('scroll', toggleVisibility);
      return () => mainContent.removeEventListener('scroll', toggleVisibility);
    }
  }, []);

  const scrollToTop = () => {
    const mainContent = document.querySelector('main');
    if (mainContent) {
      mainContent.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-8 right-8 p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 z-50 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
      }`}
    >
      <Icon icon="mdi:arrow-up" className="w-6 h-6" />
    </button>
  );
}

// Component to show system/database/security status based on localStorage `admin_servers`
function ServerStatusIndicators() {
  const [servers, setServers] = useState({ status: true, database: true, security: true });

  const readServers = () => {
    try {
      const raw = localStorage.getItem('admin_servers');
      if (!raw) return setServers({ status: true, database: true, security: true });
      const parsed = JSON.parse(raw);
      if (!parsed) return setServers({ status: true, database: true, security: true });
      setServers({
        status: typeof parsed.status === 'boolean' ? parsed.status : true,
        database: typeof parsed.database === 'boolean' ? parsed.database : true,
        security: typeof parsed.security === 'boolean' ? parsed.security : true,
      });
    } catch (e) {
      setServers({ status: true, database: true, security: true });
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    readServers();
    const handler = () => readServers();
    window.addEventListener('storage', handler);
    window.addEventListener('admin-info-updated', handler);
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener('admin-info-updated', handler);
    };
  }, []);

  return (
    <>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${servers.status ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
        <span className={`${servers.status ? 'text-green-400' : 'text-red-400'} text-xs`}>{servers.status ? 'System Online' : 'System Offline'}</span>
      </div>

      <div className="flex items-center gap-2">
        <Icon icon="mdi:database" className={`w-4 h-4 ${servers.database ? 'text-blue-400' : 'text-red-400'}`} />
        <span className={`${servers.database ? 'text-blue-400' : 'text-red-400'} text-xs`}>{servers.database ? 'Database Connected' : 'Database Disconnected'}</span>
      </div>

      <div className="flex items-center gap-2">
        <Icon icon="mdi:shield-check" className={`w-4 h-4 ${servers.security ? 'text-purple-400' : 'text-red-400'}`} />
        <span className={`${servers.security ? 'text-purple-400' : 'text-red-400'} text-xs`}>{servers.security ? 'Security Active' : 'Security Issue'}</span>
      </div>
    </>
  );
}

// Utility function to show toast notifications
export function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toastId = Date.now();
  const toast = document.createElement('div');
  toast.id = `toast-${toastId}`;
  toast.className = `transform translate-x-full opacity-0 transition-all duration-300`;
  
  const bgColor = {
    success: 'from-green-600 to-emerald-600',
    error: 'from-red-600 to-rose-600',
    warning: 'from-yellow-600 to-orange-600',
    info: 'from-blue-600 to-cyan-600'
  }[type] || 'from-blue-600 to-cyan-600';

  const icon = {
    success: 'mdi:check-circle',
    error: 'mdi:alert-circle',
    warning: 'mdi:alert',
    info: 'mdi:information'
  }[type] || 'mdi:information';

  toast.innerHTML = `
    <div class="bg-gradient-to-r ${bgColor} backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-2xl max-w-sm">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
          <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            ${type === 'success' ? '<path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M11,16.5L18,9.5L16.59,8.09L11,13.67L7.91,10.59L6.5,12L11,16.5Z"/>' :
             type === 'error' ? '<path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>' :
             type === 'warning' ? '<path d="M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z"/>' :
             '<path d="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>'}
          </svg>
        </div>
        <div class="flex-1">
          <p class="text-white font-medium text-sm">${message}</p>
        </div>
        <button onclick="removeToast('${toastId}')" class="text-white/70 hover:text-white p-1">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
          </svg>
        </button>
      </div>
    </div>
  `;

  container.appendChild(toast);

  // Animate in
  setTimeout(() => {
    toast.className = `transform translate-x-0 opacity-100 transition-all duration-300`;
  }, 10);

  // Auto remove after 5 seconds
  setTimeout(() => {
    removeToast(toastId);
  }, 5000);
}

// Function to remove toast
// Function to remove toast (attach only in browser)
if (typeof window !== 'undefined') {
  window.removeToast = function(toastId) {
    const toast = document.getElementById(`toast-${toastId}`);
    if (toast) {
      toast.className = `transform translate-x-full opacity-0 transition-all duration-300`;
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }
  };
}