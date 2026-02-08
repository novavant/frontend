import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Icon } from '@iconify/react';

export default function Error404() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(8);
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
          router.push('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  const goHome = () => {
    router.push('/');
  };

  const goBack = () => {
    router.back();
  };

  const primaryColor = '#fe7d17';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Head>
        <title>{applicationData?.name || 'Nova Vant'} | 404 - Halaman Tidak Ditemukan</title>
        <meta name="description" content={`${applicationData?.name || 'Nova Vant'} 404 - Halaman Tidak Ditemukan`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="max-w-md w-full">
        {/* Icon & 404 Number */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-6">
            <div className="w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${primaryColor}15` }}>
              <Icon icon="mdi:map-marker-question" className="w-20 h-20" style={{ color: primaryColor }} />
            </div>
          </div>
          <h1 className="text-8xl font-black text-gray-900 mb-2">404</h1>
          <p className="text-xl font-bold text-gray-900 mb-2">Halaman Tidak Ditemukan</p>
          <p className="text-gray-600 text-sm leading-relaxed mb-6">
            Halaman yang Anda cari mungkin telah dipindahkan, dihapus, atau tidak pernah ada.
          </p>

          {/* Auto Redirect Notice */}
          <div className="inline-flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-lg border border-orange-100">
            <Icon icon="mdi:information" className="w-4 h-4" style={{ color: primaryColor }} />
            <span className="text-gray-700 text-sm">
              Redirect otomatis dalam <span className="font-bold font-mono" style={{ color: primaryColor }}>{countdown}s</span>
            </span>
          </div>
        </div>

        {/* Search Box */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200 mb-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Icon icon="mdi:magnify" className="w-5 h-5" style={{ color: primaryColor }} />
            <h3 className="text-gray-900 text-sm font-semibold">Mungkin Anda Mencari:</h3>
          </div>
          <div className="space-y-2">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full flex items-center justify-between bg-gray-50 hover:bg-gray-100 p-3 rounded-xl transition-all duration-300 group border border-gray-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${primaryColor}15` }}>
                  <Icon icon="mdi:view-dashboard" className="w-5 h-5" style={{ color: primaryColor }} />
                </div>
                <span className="text-gray-900 text-sm font-medium">Dashboard</span>
              </div>
              <Icon icon="mdi:chevron-right" className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </button>

            <button
              onClick={() => router.push('/profile')}
              className="w-full flex items-center justify-between bg-gray-50 hover:bg-gray-100 p-3 rounded-xl transition-all duration-300 group border border-gray-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Icon icon="mdi:account" className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-gray-900 text-sm font-medium">Profile</span>
              </div>
              <Icon icon="mdi:chevron-right" className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </button>

            <button
              onClick={() => router.push('/portofolio')}
              className="w-full flex items-center justify-between bg-gray-50 hover:bg-gray-100 p-3 rounded-xl transition-all duration-300 group border border-gray-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                  <Icon icon="mdi:chart-line" className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-gray-900 text-sm font-medium">Portofolio</span>
              </div>
              <Icon icon="mdi:chevron-right" className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={goBack}
            className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 py-3.5 rounded-xl font-bold transition-all duration-300 border border-gray-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Icon icon="mdi:arrow-left" className="w-5 h-5" />
            Kembali
          </button>

          <button
            onClick={goHome}
            className="flex items-center justify-center gap-2 text-white py-3.5 rounded-xl font-bold transition-all duration-300 shadow-sm hover:scale-[1.02] active:scale-[0.98]"
            style={{ backgroundColor: primaryColor }}
          >
            <Icon icon="mdi:home" className="w-5 h-5" />
            Beranda
          </button>
        </div>

        {/* Help Card */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200 text-center shadow-sm">
          <Icon icon="mdi:lifebuoy" className="w-8 h-8 mx-auto mb-3" style={{ color: primaryColor }} />
          <p className="text-gray-600 text-xs mb-3">Masih butuh bantuan?</p>
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
