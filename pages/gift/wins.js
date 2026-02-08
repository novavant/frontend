// pages/gift/wins.js
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import BottomNavbar from '../../components/BottomNavbar';
import { getGiftWins } from '../../utils/api';

export default function GiftWins() {
    const router = useRouter();
    const [applicationData, setApplicationData] = useState(null);
    const [wins, setWins] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const token = sessionStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        const storedApplication = localStorage.getItem('application');
        if (storedApplication) {
            try { setApplicationData(JSON.parse(storedApplication)); } catch (e) { }
        }

        fetchWins();
    }, [router]);

    const fetchWins = async () => {
        setLoading(true);
        try {
            const res = await getGiftWins({ page: 1, limit: 20 });
            if (res.success && res.data) {
                setWins(res.data.items || []);
            }
        } catch (e) {
            console.error('Error:', e);
        }
        setLoading(false);
    };

    const formatCurrency = (val) => new Intl.NumberFormat('id-ID').format(val);
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    };

    const totalWon = wins.reduce((sum, w) => sum + (w.amount || 0), 0);

    return (
        <div className="min-h-screen bg-slate-900 pb-28">
            <Head>
                <title>{applicationData?.name || 'Nova Vant'} | Hadiah Diklaim</title>
            </Head>

            {/* Header */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-400/20 via-transparent to-transparent" />

                <div className="relative px-5 pt-6 pb-6">
                    <div className="flex items-center gap-4 mb-5">
                        <button onClick={() => router.push('/gift')} className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                            <Icon icon="mdi:arrow-left" className="w-5 h-5 text-white" />
                        </button>
                        <div className="flex-1">
                            <h1 className="text-xl font-bold text-white">Hadiah Diklaim</h1>
                            <p className="text-blue-200 text-sm">Hadiah yang Anda dapatkan</p>
                        </div>
                    </div>

                    {/* Stats Card */}
                    {wins.length > 0 && (
                        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-200 text-sm">Total Hadiah</p>
                                    <p className="text-2xl font-black text-white">Rp {formatCurrency(totalWon)}</p>
                                    <p className="text-blue-300/70 text-sm">{wins.length} hadiah diklaim</p>
                                </div>
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500/30 to-emerald-600/30 flex items-center justify-center">
                                    <Icon icon="mdi:trophy" className="w-7 h-7 text-green-400" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-md mx-auto px-5 pt-4">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="w-8 h-8 border-3 border-slate-700 border-t-blue-500 rounded-full animate-spin" />
                    </div>
                ) : wins.length === 0 ? (
                    <div className="bg-slate-800 border border-slate-700/50 rounded-3xl p-8 text-center">
                        <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center mx-auto mb-4">
                            <Icon icon="mdi:gift-off-outline" className="w-8 h-8 text-slate-500" />
                        </div>
                        <p className="text-slate-400 mb-4">Belum ada hadiah yang diklaim</p>
                        <button
                            onClick={() => router.push('/gift/redeem')}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold px-6 py-3 rounded-xl"
                        >
                            Klaim Hadiah
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {wins.map((win) => (
                            <div key={win.id} className="bg-slate-800 border border-slate-700/50 rounded-2xl p-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-green-600/20 flex items-center justify-center">
                                        <Icon icon="mdi:gift" className="w-6 h-6 text-green-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-green-400 font-bold">+Rp {formatCurrency(win.amount)}</p>
                                        <p className="text-slate-400 text-sm truncate">Dari {win.sender}</p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className="text-slate-500 text-xs tracking-wider">{win.code}</p>
                                        <p className="text-slate-600 text-xs">{formatDate(win.created_at)}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <BottomNavbar />
        </div>
    );
}
