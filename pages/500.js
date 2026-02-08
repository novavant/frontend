import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Icon } from '@iconify/react';

export default function Error500() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);
  const [isRetrying, setIsRetrying] = useState(false);
  const [applicationData, setApplicationData] = useState(null);

  useEffect(() => {
    const storedApplication = localStorage.getItem('application');
    if (storedApplication) {
      try {
        const parsed = JSON.parse(storedApplication);
        setApplicationData({
          name: parsed.name || 'Nova Vant',
          healthy: parsed.healthy || false,
        });
      } catch (e) {
        setApplicationData({ name: 'Nova Vant', healthy: false });
      }
    } else {
      setApplicationData({ name: 'Nova Vant', healthy: false });
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleRetry();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleRetry = () => {
    setIsRetrying(true);
    setTimeout(() => {
      router.reload();
    }, 500);
  };

  const goHome = () => {
    router.push('/');
  };

  const primaryColor = '#fe7d17';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Head>
        <title>{applicationData?.name || 'Nova Vant'} | 500 - Server Error</title>
        <meta name="description" content={`${applicationData?.name || 'Nova Vant'} 500 - Server Error`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="max-w-md w-full">
        {/* Icon Container */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-6">
            <div className="w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-4 bg-red-50">
              <Icon icon="mdi:server-off" className="w-20 h-20 text-red-600" />
            </div>
          </div>
          <h1 className="text-8xl font-black text-gray-900 mb-2">500</h1>
          <p className="text-xl font-bold text-gray-900 mb-2">Server Error</p>
          <p className="text-gray-600 text-sm leading-relaxed mb-6">
            Maaf, server kami sedang mengalami masalah teknis. Tim kami sedang bekerja untuk memperbaikinya.
          </p>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 mb-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
              <span className="text-gray-700 text-sm font-medium">Status Server</span>
            </div>
            <span className="text-red-600 text-sm font-semibold">Maintenance</span>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Icon icon="mdi:clock-outline" className="w-4 h-4 text-gray-600" />
              <span className="text-gray-700 text-sm">Auto Retry</span>
            </div>
            <span className="text-gray-900 font-mono text-sm font-bold">{countdown}s</span>
          </div>

          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-1000 rounded-full"
              style={{
                width: `${((10 - countdown) / 10) * 100}%`,
                backgroundColor: primaryColor
              }}
            ></div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className={`flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold transition-all duration-300 shadow-sm ${isRetrying
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'text-white hover:scale-[1.02] active:scale-[0.98]'
              }`}
            style={!isRetrying ? { backgroundColor: primaryColor } : {}}
          >
            <Icon
              icon={isRetrying ? "mdi:loading" : "mdi:refresh"}
              className={`w-5 h-5 ${isRetrying ? 'animate-spin' : ''}`}
            />
            {isRetrying ? 'Mencoba...' : 'Coba Lagi'}
          </button>

          <button
            onClick={goHome}
            className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 py-3.5 rounded-xl font-bold transition-all duration-300 border border-gray-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Icon icon="mdi:home" className="w-5 h-5" />
            Beranda
          </button>
        </div>

        {/* Tips */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200 mb-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Icon icon="mdi:information" className="w-5 h-5" style={{ color: primaryColor }} />
            <h3 className="text-gray-900 text-sm font-semibold">Yang Bisa Dilakukan:</h3>
          </div>
          <ul className="space-y-2">
            <li className="flex items-start gap-2 text-gray-600 text-sm">
              <Icon icon="mdi:check" className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: primaryColor }} />
              <span>Tunggu beberapa saat dan coba lagi</span>
            </li>
            <li className="flex items-start gap-2 text-gray-600 text-sm">
              <Icon icon="mdi:check" className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: primaryColor }} />
              <span>Periksa koneksi internet Anda</span>
            </li>
            <li className="flex items-start gap-2 text-gray-600 text-sm">
              <Icon icon="mdi:check" className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: primaryColor }} />
              <span>Hubungi customer service jika masalah berlanjut</span>
            </li>
          </ul>
        </div>

        {/* Support Info */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200 text-center shadow-sm">
          <Icon icon="mdi:lifebuoy" className="w-8 h-8 mx-auto mb-3" style={{ color: primaryColor }} />
          <p className="text-gray-600 text-xs mb-3">Butuh bantuan?</p>
          <button
            onClick={() => {
              const link_cs = applicationData?.link_cs || localStorage.getItem('link_cs') || 'https://t.me/NovaVant_Ai';
              window.open(link_cs, '_blank');
            }}
            className="inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:opacity-80"
            style={{ color: primaryColor }}
          >
            <Icon icon="mdi:headset" className="w-5 h-5" />
            Hubungi Customer Service
          </button>
        </div>

        {/* Footer */}
        <div className="text-center py-4">
          <p className="text-xs text-slate-600">© 2026 {applicationData?.company}</p>
        </div>
      </div>
    </div>
  );
}
