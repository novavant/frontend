// pages/gift/share.js
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';

export default function GiftShare() {
    const router = useRouter();
    const { code } = router.query;
    const [applicationData, setApplicationData] = useState(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const storedApplication = localStorage.getItem('application');
        if (storedApplication) {
            try { setApplicationData(JSON.parse(storedApplication)); } catch (e) { }
        }
    }, []);

    const handleClaim = () => {
        if (code) {
            router.push(`/gift/redeem?code=${code}`);
        } else {
            router.push('/gift/redeem');
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-5 relative overflow-hidden">
            <Head>
                <title>{applicationData?.name || 'Nova Vant'} | Nova Gift</title>
                <meta property="og:title" content="Ada Nova Gift nih buat kamu!" />
                <meta property="og:description" content="Buruan dapetin sebelum kehabisan!!" />
            </Head>

            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-slate-900 to-indigo-900" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent" />

            {/* Content */}
            <div className="relative w-full max-w-sm text-center">
                {/* Gift Icon Animation */}
                <div className="relative w-32 h-32 mx-auto mb-8">
                    <div className="absolute inset-0 bg-blue-500/30 rounded-full animate-ping" />
                    <div className="relative w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/50 border-4 border-slate-900">
                        <Icon icon="mdi:gift" className="w-16 h-16 text-white animate-bounce" />
                    </div>
                </div>

                <div className="bg-slate-800/80 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-2xl">
                    <h1 className="text-2xl font-black text-white mb-2">Kamu Dapat Hadiah!</h1>
                    <p className="text-blue-200 mb-6 font-medium">
                        Seseorang mengirimkan hadiah spesial untukmu di Nova Gift.
                    </p>

                    <div className="space-y-3">
                        <button
                            onClick={handleClaim}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/30 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
                        >
                            <Icon icon="mdi:gift-open" className="w-6 h-6" />
                            Ambil Sekarang
                        </button>
                    </div>
                </div>

                <p className="mt-8 text-slate-500 text-sm font-medium">
                    Powered by {applicationData?.name || 'Nova Vant'}
                </p>
            </div>
        </div>
    );
}
