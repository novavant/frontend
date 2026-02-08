import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { isMobileApp } from '../utils/mobileAppDetection';

/**
 * MobileAppStatus Component
 * Shows mobile app status when running in TWA/WebView
 * Only shows for mobile app users, hidden for browser users
 */
export default function MobileAppStatus({ applicationData, className = "" }) {
  const [isInMobileApp, setIsInMobileApp] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setIsInMobileApp(isMobileApp());
  }, []);

  // Jangan tampilkan jika tidak di aplikasi mobile
  if (!isInMobileApp) {
    return null;
  }

  const primaryColor = '#fe7d17';

  return (
    <div className={`${className}`}>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {/* Header Section with Gradient */}
        <div className="px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center flex-shrink-0 shadow-sm">
              <Icon icon="mdi:check-decagram" className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-gray-900">
                {applicationData?.name || 'Nova Vant'} Mobile App
              </h3>
              <p className="text-xs text-green-700 mt-0.5 font-semibold">
                ✓ Aplikasi Aktif
              </p>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4">
          {/* Status Card */}
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-3">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Icon icon="mdi:cellphone-check" className="w-6 h-6 text-green-600" />
              <span className="text-sm font-bold text-green-900">TERINSTALL</span>
            </div>
            <p className="text-xs text-green-700 text-center">
              Anda sedang menggunakan aplikasi mobile
            </p>
          </div>

          {/* Features List */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-gray-700">
              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Icon icon="mdi:lightning-bolt" className="w-3 h-3 text-green-600" />
              </div>
              <span>Akses lebih cepat</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-700">
              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Icon icon="mdi:bell-ring" className="w-3 h-3 text-green-600" />
              </div>
              <span>Notifikasi real-time</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-700">
              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Icon icon="mdi:shield-check" className="w-3 h-3 text-green-600" />
              </div>
              <span>Pengalaman terbaik</span>
            </div>
          </div>

          {/* Info Footer */}
          <div className="mt-4 pt-3 border-t border-gray-100">
            <p className="text-center text-xs text-gray-500 flex items-center justify-center gap-1">
              <Icon icon="mdi:information-outline" className="w-3.5 h-3.5" />
              Nikmati fitur lengkap aplikasi mobile
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
