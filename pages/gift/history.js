// pages/gift/history.js
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import BottomNavbar from '../../components/BottomNavbar';
import { getGiftHistory } from '../../utils/api';

export default function GiftHistory() {
    const router = useRouter();
    const [applicationData, setApplicationData] = useState(null);
    const [gifts, setGifts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(null);

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

        fetchHistory();
    }, [router]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const res = await getGiftHistory({ page: 1, limit: 20 });
            if (res.success && res.data) {
                setGifts(res.data.items || []);
            }
        } catch (e) {
            console.error('Error:', e);
        }
        setLoading(false);
    };

    const formatCurrency = (val) => new Intl.NumberFormat('id-ID').format(val);
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const getStatusBadge = (gift) => {
        if (gift.status === 'completed' || gift.claimed_count >= gift.winner_count) {
            return { bg: 'bg-green-600/20', text: 'text-green-400', label: 'Selesai' };
        }
        return { bg: 'bg-blue-600/20', text: 'text-blue-400', label: 'Aktif' };
    };

    const copyLink = (code) => {
        const link = `${window.location.origin}/gift/share?code=${code}`;
        navigator.clipboard.writeText(link);
        setCopied(code);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className="min-h-screen bg-slate-900 pb-28">
            <Head>
                <title>{applicationData?.name || 'Nova Vant'} | Riwayat Hadiah</title>
            </Head>

            {/* Header */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-400/20 via-transparent to-transparent" />

                <div className="relative px-5 pt-6 pb-6">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.push('/gift')} className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                            <Icon icon="mdi:arrow-left" className="w-5 h-5 text-white" />
                        </button>
                        <div className="flex-1">
                            <h1 className="text-xl font-bold text-white">Riwayat Hadiah</h1>
                            <p className="text-blue-200 text-sm">Hadiah yang Anda buat</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-md mx-auto px-5 pt-4">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="w-8 h-8 border-3 border-slate-700 border-t-blue-500 rounded-full animate-spin" />
                    </div>
                ) : gifts.length === 0 ? (
                    <div className="bg-slate-800 border border-slate-700/50 rounded-3xl p-8 text-center">
                        <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center mx-auto mb-4">
                            <Icon icon="mdi:gift-off-outline" className="w-8 h-8 text-slate-500" />
                        </div>
                        <p className="text-slate-400 mb-4">Belum ada hadiah yang dibuat</p>
                        <button
                            onClick={() => router.push('/gift')}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold px-6 py-3 rounded-xl"
                        >
                            Buat Nova Gift Sekarang
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {gifts.map((gift) => {
                            const status = getStatusBadge(gift);
                            return (
                                <div key={gift.id} className="bg-slate-800 border border-slate-700/50 rounded-2xl overflow-hidden">
                                    <div className="p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center">
                                                    <Icon icon="mdi:gift" className="w-5 h-5 text-blue-400" />
                                                </div>
                                                <div>
                                                    <p className="text-white font-bold tracking-wider">{gift.code}</p>
                                                    <p className="text-slate-500 text-xs">{formatDate(gift.created_at)}</p>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.bg} ${status.text}`}>
                                                {status.label}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-3 gap-3 text-center">
                                            <div className="bg-slate-700/30 rounded-xl py-2">
                                                <p className="text-slate-400 text-xs">Total</p>
                                                <p className="text-white font-semibold text-sm">Rp {formatCurrency(gift.total_deducted)}</p>
                                            </div>
                                            <div className="bg-slate-700/30 rounded-xl py-2">
                                                <p className="text-slate-400 text-xs">Diklaim</p>
                                                <p className="text-white font-semibold text-sm">{gift.claimed_count}/{gift.winner_count}</p>
                                            </div>
                                            <div className="bg-slate-700/30 rounded-xl py-2">
                                                <p className="text-slate-400 text-xs">Tipe</p>
                                                <p className="text-white font-semibold text-sm">{gift.distribution_type === 'random' ? 'Acak' : 'Rata'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex border-t border-slate-700/50">
                                        <button
                                            onClick={() => copyLink(gift.code)}
                                            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${copied === gift.code ? 'bg-green-600/20 text-green-400' : 'text-slate-400 hover:bg-slate-700/30'}`}
                                        >
                                            <Icon icon={copied === gift.code ? "mdi:check" : "mdi:content-copy"} className="w-4 h-4" />
                                            {copied === gift.code ? 'Tersalin!' : 'Salin Link'}
                                        </button>
                                        <button
                                            onClick={() => router.push(`/gift/${gift.id}/winners`)}
                                            className="flex-1 py-3 text-blue-400 text-sm font-medium flex items-center justify-center gap-2 hover:bg-slate-700/30 border-l border-slate-700/50 transition-colors"
                                        >
                                            <Icon icon="mdi:account-group" className="w-4 h-4" />
                                            Pemenang
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <BottomNavbar />
        </div>
    );
}
