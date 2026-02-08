import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { isMobileApp, isIOS, isAndroid, isDesktop, isAppInstalled } from '../utils/mobileAppDetection';
import CustomAlert from './CustomAlert';

/**
 * AppInstallButton Component
 * Smart app installation button that detects if app is installed
 * Only shows for browser users, hidden for mobile app users
 */
export default function AppInstallButton({ applicationData, className = "" }) {
  const [isInMobileApp, setIsInMobileApp] = useState(false);
  const [deviceType, setDeviceType] = useState({ isIOS: false, isAndroid: false, isDesktop: false });
  const [isAppInstalledState, setIsAppInstalledState] = useState(false);
  const [isCheckingInstallation, setIsCheckingInstallation] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({});

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsInMobileApp(isMobileApp());
    setDeviceType({
      isIOS: isIOS(),
      isAndroid: isAndroid(),
      isDesktop: isDesktop()
    });

    const checkAppInstallation = async () => {
      try {
        const installed = await isAppInstalled();
        setIsAppInstalledState(installed);
      } catch (error) {
        console.log('Error checking app installation:', error);
        setIsAppInstalledState(false);
      } finally {
        setIsCheckingInstallation(false);
      }
    };

    checkAppInstallation();
  }, []);

  const handleAppAction = () => {
    if (isAppInstalledState) {
      openApp();
      return;
    }
    handleInstallApp();
  };

  const openApp = () => {
    if (deviceType.isAndroid) {
      const packageName = 'com.novavant.app';
      const intent = `intent://${window.location.host}${window.location.pathname}#Intent;scheme=https;package=${packageName};end`;
      try {
        window.location.href = intent;
      } catch (error) {
        setAlertConfig({
          title: 'Tidak Dapat Membuka Aplikasi',
          message: 'Pastikan aplikasi sudah terinstall dengan benar.',
          type: 'error',
          confirmText: 'OK'
        });
        setShowAlert(true);
      }
    } else if (deviceType.isIOS) {
      const customScheme = `novavant://${window.location.pathname}`;
      try {
        window.location.href = customScheme;
        setTimeout(() => {
          if (!document.hidden) {
            showIOSInstallGuide();
          }
        }, 1500);
      } catch (error) {
        showIOSInstallGuide();
      }
    }
  };

  const handleInstallApp = () => {
    if (deviceType.isAndroid && applicationData?.link_app) {
      window.open(applicationData.link_app, '_blank');
      return;
    }
    if (deviceType.isIOS) {
      showIOSInstallGuide();
      return;
    }
    if (deviceType.isDesktop) {
      showDesktopAlert();
      return;
    }
    showNoLinkAlert();
  };

  const showIOSInstallGuide = () => {
    setAlertConfig({
      title: 'Install Aplikasi pada iOS',
      message: '1. Tap tombol Share di bawah\n2. Pilih "Add to Home Screen"\n3. Tap "Add"',
      type: 'info',
      confirmText: 'Mengerti'
    });
    setShowAlert(true);
  };

  const showDesktopAlert = () => {
    setAlertConfig({
      title: 'Install Hanya untuk Mobile',
      message: 'Aplikasi hanya tersedia untuk Android & iOS.',
      type: 'warning',
      confirmText: 'Mengerti'
    });
    setShowAlert(true);
  };

  const showNoLinkAlert = () => {
    setAlertConfig({
      title: 'Link Belum Tersedia',
      message: 'Link download aplikasi belum tersedia.',
      type: 'error',
      confirmText: 'OK'
    });
    setShowAlert(true);
  };

  if (isInMobileApp) {
    return null;
  }

  return (
    <>
      <div className={`mb-4 ${className}`}>
        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-700 flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isAppInstalledState ? 'bg-green-600' : 'bg-blue-600'}`}>
              <Icon
                icon={isAppInstalledState ? 'mdi:check-circle' : (deviceType.isAndroid ? 'mdi:android' : deviceType.isIOS ? 'mdi:apple' : 'mdi:cellphone-arrow-down')}
                className={`w-6 h-6 text-white ${isCheckingInstallation ? 'animate-spin' : ''}`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-white">
                {applicationData?.name || 'Nova Vant'} Mobile App
              </h3>
              <p className="text-xs text-slate-400">
                {isAppInstalledState
                  ? 'Aplikasi Terinstall'
                  : deviceType.isAndroid
                    ? 'Download APK'
                    : deviceType.isIOS
                      ? 'Add to Home Screen'
                      : 'Untuk perangkat mobile'
                }
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {isCheckingInstallation ? (
              <div className="flex items-center justify-center gap-2 py-3 mb-3 bg-slate-700/50 rounded-xl">
                <div className="w-4 h-4 border-2 border-slate-500 border-t-blue-500 rounded-full animate-spin"></div>
                <p className="text-xs text-slate-400">Memeriksa instalasi...</p>
              </div>
            ) : (
              <p className="text-sm text-slate-300 text-center mb-4">
                {isAppInstalledState
                  ? '✅ Aplikasi sudah terinstall. Klik untuk membuka.'
                  : deviceType.isIOS
                    ? '📱 Install untuk pengalaman lebih baik.'
                    : deviceType.isAndroid
                      ? '📲 Download APK untuk akses cepat.'
                      : '💻 Tersedia untuk Android & iOS.'
                }
              </p>
            )}

            {/* Action Button */}
            <button
              onClick={handleAppAction}
              disabled={isCheckingInstallation}
              className={`w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-sm transition-all ${isCheckingInstallation
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                : isAppInstalledState
                  ? 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-600/20'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20'
                }`}
            >
              <Icon
                icon={isCheckingInstallation ? 'mdi:loading' : (isAppInstalledState ? 'mdi:open-in-app' : deviceType.isAndroid ? 'mdi:download' : 'mdi:cellphone-arrow-down')}
                className={`w-5 h-5 ${isCheckingInstallation ? 'animate-spin' : ''}`}
              />
              <span>
                {isCheckingInstallation
                  ? 'Checking...'
                  : isAppInstalledState
                    ? 'Buka Aplikasi'
                    : deviceType.isAndroid
                      ? 'Install Aplikasi'
                      : deviceType.isIOS
                        ? 'Panduan Install'
                        : 'Install Aplikasi'
                }
              </span>
            </button>

            {/* Additional Info */}
            {!isCheckingInstallation && (
              <div className="mt-3">
                {deviceType.isAndroid && !isAppInstalledState && (
                  <div className="flex items-center justify-center gap-1.5 text-xs text-green-300 bg-green-900/30 border border-green-700/50 rounded-xl py-2 px-3">
                    <Icon icon="mdi:shield-check" className="w-4 h-4" />
                    <span>Aplikasi resmi & terverifikasi</span>
                  </div>
                )}
                {deviceType.isIOS && !isAppInstalledState && (
                  <div className="flex items-center justify-center gap-1.5 text-xs text-blue-300 bg-blue-900/30 border border-blue-700/50 rounded-xl py-2 px-3">
                    <Icon icon="mdi:information" className="w-4 h-4" />
                    <span>Gunakan Safari untuk install</span>
                  </div>
                )}
                {isAppInstalledState && (
                  <div className="flex items-center justify-center gap-1.5 text-xs text-green-300 bg-green-900/30 border border-green-700/50 rounded-xl py-2 px-3">
                    <Icon icon="mdi:check-circle" className="w-4 h-4" />
                    <span>Siap digunakan</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <CustomAlert
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        {...alertConfig}
      />
    </>
  );
}