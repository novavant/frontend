// pages/gift/[id]/winners.js
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import BottomNavbar from '../../../components/BottomNavbar';
import { getGiftWinners } from '../../../utils/api';

export default function GiftWinners() {
    const router = useRouter();
    const { id } = router.query;
    const [applicationData, setApplicationData] = useState(null);
    const [gift, setGift] = useState(null);
    const [winners, setWinners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

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

        if (id) {
            fetchWinners();
        }
    }, [router, id]);

    const fetchWinners = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await getGiftWinners(id);
            if (res.success && res.data) {
                setGift(res.data.gift);
                setWinners(res.data.winners || []);
            } else {
                setError(res.message || 'Gagal memuat data');
            }
        } catch (e) {
            setError(e.message || 'Terjadi kesalahan');
        }
        setLoading(false);
    };

    const formatCurrency = (val) => new Intl.NumberFormat('id-ID').format(val);
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    };

    const copyLink = () => {
        if (gift?.code) {
            const link = `${window.location.origin}/gift/share?code=${gift.code}`;
            navigator.clipboard.writeText(link);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 pb-28">
            <Head>
                <title>{applicationData?.name || 'Nova Vant'} | Pemenang Hadiah</title>
            </Head>

            {/* Header */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-400/20 via-transparent to-transparent" />

                <div className="relative px-5 pt-6 pb-6">
                    <div className="flex items-center gap-4 mb-5">
                        <button onClick={() => router.back()} className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                            <Icon icon="mdi:arrow-left" className="w-5 h-5 text-white" />
                        </button>
                        <div className="flex-1">
                            <h1 className="text-xl font-bold text-white">Pemenang Hadiah</h1>
                            <p className="text-blue-200 text-sm">{gift?.code || 'Loading...'}</p>
                        </div>
                    </div>

                    {/* Gift Info Card */}
                    {gift && (
                        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-2xl font-black text-white tracking-wider">{gift.code}</p>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${gift.status === 'completed' || gift.claimed_count >= gift.winner_count ? 'bg-green-600/30 text-green-300' : 'bg-blue-600/30 text-blue-300'}`}>
                                    {gift.status === 'completed' || gift.claimed_count >= gift.winner_count ? 'Selesai' : 'Aktif'}
                                </span>
                            </div>
                            <p className="text-blue-200 text-sm mb-3">Diklaim: {gift.claimed_count} / {gift.winner_count}</p>
                            <button
                                onClick={copyLink}
                                className={`text-sm flex items-center gap-1 transition-colors ${copied ? 'text-green-400' : 'text-white/70 hover:text-white'}`}
                            >
                                <Icon icon={copied ? "mdi:check" : "mdi:content-copy"} className="w-4 h-4" />
                                {copied ? 'Tersalin!' : 'Salin Link'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-md mx-auto px-5 pt-4">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="w-8 h-8 border-3 border-slate-700 border-t-blue-500 rounded-full animate-spin" />
                    </div>
                ) : error ? (
                    <div className="bg-slate-800 border border-red-500/30 rounded-3xl p-8 text-center">
                        <div className="w-16 h-16 rounded-full bg-red-600/20 flex items-center justify-center mx-auto mb-4">
                            <Icon icon="mdi:alert-circle" className="w-8 h-8 text-red-400" />
                        </div>
                        <p className="text-red-400 mb-4">{error}</p>
                        <button onClick={() => router.back()} className="text-blue-400 font-semibold">
                            Kembali
                        </button>
                    </div>
                ) : winners.length === 0 ? (
                    <div className="bg-slate-800 border border-slate-700/50 rounded-3xl p-8 text-center">
                        <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center mx-auto mb-4">
                            <Icon icon="mdi:account-group-outline" className="w-8 h-8 text-slate-500" />
                        </div>
                        <p className="text-slate-400">Belum ada pemenang</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {winners.map((winner, idx) => (
                            <div key={winner.user_id || idx} className="bg-slate-800 border border-slate-700/50 rounded-2xl p-4">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-xl bg-slate-700/50 flex items-center justify-center overflow-hidden">
                                            {winner.profile ? (
                                                <img src={winner.profile} alt={winner.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <Icon icon="mdi:account" className="w-6 h-6 text-slate-400" />
                                            )}
                                        </div>
                                        <div className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white shadow-lg">
                                            {winner.slot}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-semibold truncate">{winner.name}</p>
                                        <p className="text-slate-500 text-xs">+62{winner.number}</p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className="text-green-400 font-bold">+Rp {formatCurrency(winner.amount)}</p>
                                        <p className="text-slate-600 text-xs">{formatDate(winner.claimed_at)}</p>
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
