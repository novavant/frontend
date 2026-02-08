import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { isMobileApp, isIOS, isAndroid, isDesktop, isAppInstalled } from '../utils/mobileAppDetection';

/**
 * AppRedirectButton Component
 * Hanya melakukan redirect ke aplikasi jika sudah terinstall
 * Tidak menampilkan ajakan install, hanya pengecekan dan redirect
 * Hanya untuk login dan dashboard
 */
export default function AppRedirectButton({ applicationData, className = "" }) {
  const [isInMobileApp, setIsInMobileApp] = useState(false);
  const [deviceType, setDeviceType] = useState({ isIOS: false, isAndroid: false, isDesktop: false });
  const [isAppInstalledState, setIsAppInstalledState] = useState(false);
  const [isCheckingInstallation, setIsCheckingInstallation] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsInMobileApp(isMobileApp());
    setDeviceType({
      isIOS: isIOS(),
      isAndroid: isAndroid(),
      isDesktop: isDesktop()
    });

    // Check if app is installed
    const checkAppInstallation = async () => {
      try {
        const installed = await isAppInstalled();
        setIsAppInstalledState(installed);

        // AUTO REDIRECT DISABLED - App belum di upload ke Play Store
        // Jika aplikasi sudah terinstall, langsung redirect
        // if (installed) {
        //   openApp();
        // }
      } catch (error) {
        console.log('Error checking app installation:', error);
        setIsAppInstalledState(false);
      } finally {
        setIsCheckingInstallation(false);
      }
    };

    checkAppInstallation();
  }, []);

  const openApp = () => {
    if (deviceType.isAndroid) {
      // Android: Gunakan intent untuk membuka aplikasi
      const intent = `intent://${window.location.host}${window.location.pathname}#Intent;scheme=https;package=com.novavant.app;end`;
      window.location.href = intent;
    } else if (deviceType.isIOS) {
      // iOS: Gunakan custom URL scheme atau fallback ke PWA
      const customScheme = `novavant://${window.location.pathname}`;

      // Try custom scheme first
      const testLink = document.createElement('a');
      testLink.href = customScheme;
      testLink.style.display = 'none';
      document.body.appendChild(testLink);
      testLink.click();
      document.body.removeChild(testLink);

      // Fallback setelah timeout
      setTimeout(() => {
        // Jika tidak bisa buka custom scheme, buka PWA
        if (window.matchMedia('(display-mode: standalone)').matches) {
          // Already in PWA, do nothing
        } else {
          // Buka PWA jika tersedia
          window.location.href = window.location.href;
        }
      }, 1000);
    }
  };

  // Jangan tampilkan apa-apa jika di aplikasi mobile
  if (isInMobileApp) {
    return null;
  }

  // Jangan tampilkan apa-apa jika sedang checking
  if (isCheckingInstallation) {
    return null;
  }

  // Jangan tampilkan apa-apa jika aplikasi belum terinstall
  if (!isAppInstalledState) {
    return null;
  }

  // Hanya tampilkan jika aplikasi sudah terinstall dan tidak di mobile app
  return (
    <div className={`relative ${className}`}>
      <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl blur opacity-20"></div>
      <div className="relative bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] rounded-2xl p-4 border border-white/10 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-green-500/10">
            <Icon icon="mdi:open-in-app" className="w-5 h-5 text-green-400" />
          </div>
          <h3 className="text-white font-bold text-sm">
            {applicationData?.name || 'Nova Vant'} App
          </h3>
        </div>

        <p className="text-white/60 text-xs mb-3">
          Aplikasi sudah terinstall, lanjutkan menggunakan aplikasi
        </p>

        <button
          onClick={openApp}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 hover:scale-[1.02] active:scale-[0.98] text-white font-bold py-2 px-4 rounded-xl transition-all duration-300 shadow-lg text-sm"
        >
          <Icon icon="mdi:open-in-app" className="w-4 h-4" />
          LANJUTKAN DI APLIKASI
        </button>

        <p className="text-white/40 text-[10px] mt-2 flex items-center justify-center gap-1">
          <Icon icon="mdi:information" className="w-3 h-3" />
          Buka aplikasi Nova Vant
        </p>
      </div>
    </div>
  );
}
