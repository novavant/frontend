// pages/gift/redeem.js
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import BottomNavbar from '../../components/BottomNavbar';
import { giftInquiry, redeemGift, getUserInfo } from '../../utils/api';

export default function RedeemGift() {
    const router = useRouter();
    const { code: queryCode } = router.query;
    const [applicationData, setApplicationData] = useState(null);
    const [userData, setUserData] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    const [code, setCode] = useState('');
    const [giftInfo, setGiftInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingInquiry, setLoadingInquiry] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const token = sessionStorage.getItem('token');
        setIsLoggedIn(!!token);
        setIsCheckingAuth(false);

        const storedApplication = localStorage.getItem('application');
        if (storedApplication) {
            try { setApplicationData(JSON.parse(storedApplication)); } catch (e) { }
        }

        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try { setUserData(JSON.parse(storedUser)); } catch (e) { }
        }
    }, []);

    useEffect(() => {
        if (queryCode && !isCheckingAuth) {
            setCode(queryCode);
            handleInquiry(queryCode);
        }
    }, [queryCode, isCheckingAuth]);

    const handleInquiry = async (codeToCheck) => {
        const checkCode = codeToCheck || code;
        if (!checkCode.trim()) {
            setError('Masukkan kode hadiah');
            return;
        }

        setLoadingInquiry(true);
        setError('');
        setGiftInfo(null);

        try {
            const res = await giftInquiry(checkCode.trim());
            if (res.success && res.data) {
                setGiftInfo(res.data);
            } else {
                setError(res.message || 'Hadiah tidak ditemukan');
            }
        } catch (e) {
            setError(e.message || 'Terjadi kesalahan');
        }
        setLoadingInquiry(false);
    };

    const handleRedeem = async () => {
        if (!isLoggedIn) {
            const returnUrl = `/gift/redeem?code=${giftInfo?.code || code}`;
            localStorage.setItem('returnUrl', returnUrl);
            router.push('/login');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await redeemGift(giftInfo?.code || code);
            if (res.success && res.data) {
                setSuccess(res.data);
                const userRes = await getUserInfo();
                if (userRes.success && userRes.data) {
                    localStorage.setItem('user', JSON.stringify(userRes.data));
                    setUserData(userRes.data);
                }
            } else {
                setError(res.message || 'Gagal klaim hadiah');
            }
        } catch (e) {
            setError(e.message || 'Terjadi kesalahan');
        }
        setLoading(false);
    };

    const formatCurrency = (val) => new Intl.NumberFormat('id-ID').format(val);

    // NOT logged in - Show public gift claim page (no bottom bar)
    if (!isLoggedIn && !isCheckingAuth) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col">
                <Head>
                    <title>{applicationData?.name || 'Nova Vant'} | Klaim Hadiah</title>
                </Head>

                {/* Header */}
                <div className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-400/20 via-transparent to-transparent" />

                    <div className="relative px-5 pt-8 pb-10 text-center">
                        <div className="w-20 h-20 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-4">
                            <Icon icon="mdi:gift" className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-1">Nova Gift</h1>
                        <p className="text-blue-200">Anda mendapat hadiah!</p>
                    </div>
                </div>

                <div className="flex-1 max-w-md mx-auto w-full px-5 pt-4">
                    {/* Success State */}
                    {success ? (
                        <div className="bg-slate-800 border border-green-500/30 rounded-3xl p-6 text-center">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/30">
                                <Icon icon="mdi:check" className="w-10 h-10 text-white" />
                            </div>
                            <h2 className="text-2xl font-black text-white mb-2">Selamat!</h2>
                            <p className="text-slate-400 mb-4">Anda berhasil klaim hadiah</p>
                            <div className="bg-slate-700/50 rounded-2xl p-4 mb-6">
                                <p className="text-slate-400 text-sm">Hadiah Anda</p>
                                <p className="text-3xl font-black text-green-400">+Rp {formatCurrency(success.amount)}</p>
                            </div>
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-xl"
                            >
                                Ke Dashboard
                            </button>
                        </div>
                    ) : !giftInfo ? (
                        /* Code Input */
                        <div className="bg-slate-800 border border-slate-700/50 rounded-3xl p-6">
                            <h3 className="text-white font-bold mb-4 text-center">Masukkan Kode Hadiah</h3>
                            <input
                                type="text"
                                placeholder="XXXXXXXX"
                                value={code}
                                onChange={(e) => setCode(e.target.value.toUpperCase())}
                                maxLength={8}
                                className="w-full bg-slate-700/50 border border-slate-600/50 text-white text-2xl font-bold rounded-xl px-4 py-4 focus:outline-none focus:border-blue-500 placeholder-slate-600 text-center tracking-[0.3em] uppercase"
                            />
                            {error && (
                                <div className="mt-3 flex items-center gap-2 text-red-400 text-sm justify-center">
                                    <Icon icon="mdi:alert-circle" className="w-4 h-4" />
                                    {error}
                                </div>
                            )}
                            <button
                                onClick={() => handleInquiry()}
                                disabled={loadingInquiry || !code.trim()}
                                className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loadingInquiry ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Icon icon="mdi:magnify" className="w-5 h-5" />
                                        Cek Hadiah
                                    </>
                                )}
                            </button>
                        </div>
                    ) : (
                        /* Gift Info */
                        <div className="bg-slate-800 border border-slate-700/50 rounded-3xl overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 p-6 text-center border-b border-slate-700/50">
                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-3">
                                    <Icon icon="mdi:gift" className="w-7 h-7 text-white" />
                                </div>
                                <p className="text-blue-300 text-sm">Hadiah dari</p>
                                <p className="text-xl font-bold text-white">{giftInfo.sender_name}</p>
                            </div>

                            <div className="p-5 space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Total Hadiah</span>
                                    <span className="text-white font-semibold">Rp {formatCurrency(giftInfo.total_deducted)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Diklaim</span>
                                    <span className="text-white">{giftInfo.claimed_count} / {giftInfo.winner_count}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Tersisa</span>
                                    <span className={giftInfo.remaining > 0 ? 'text-green-400' : 'text-red-400'}>{giftInfo.remaining} slot</span>
                                </div>
                            </div>

                            {error && (
                                <div className="mx-5 mb-4 flex items-center gap-2 text-red-400 text-sm bg-red-600/10 rounded-xl p-3">
                                    <Icon icon="mdi:alert-circle" className="w-4 h-4 flex-shrink-0" />
                                    {error}
                                </div>
                            )}

                            <div className="p-5 pt-0">
                                {!giftInfo.can_claim && giftInfo.reason ? (
                                    <div className="text-center py-4">
                                        <p className="text-slate-400">{giftInfo.reason}</p>
                                    </div>
                                ) : giftInfo.remaining <= 0 ? (
                                    <div className="text-center py-4">
                                        <Icon icon="mdi:gift-off" className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                                        <p className="text-slate-400">Hadiah sudah habis</p>
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleRedeem}
                                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-green-600/20"
                                    >
                                        <Icon icon="mdi:login" className="w-5 h-5" />
                                        Login untuk Klaim
                                    </button>
                                )}
                            </div>

                            <button
                                onClick={() => { setGiftInfo(null); setError(''); }}
                                className="w-full py-3 text-slate-400 text-sm border-t border-slate-700/50"
                            >
                                Gunakan kode lain
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="py-6 text-center">
                    <p className="text-slate-500 text-sm">Sudah punya akun?</p>
                    <button onClick={() => router.push('/login')} className="text-blue-400 font-semibold">
                        Login di sini
                    </button>
                </div>
            </div>
        );
    }

    // LOGGED IN - Show full redeem page with bottom bar
    return (
        <div className="min-h-screen bg-slate-900 pb-28">
            <Head>
                <title>{applicationData?.name || 'Nova Vant'} | Klaim Hadiah</title>
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
                            <h1 className="text-xl font-bold text-white">Klaim Hadiah</h1>
                            <p className="text-blue-200 text-sm">Masukkan kode untuk klaim hadiah</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-md mx-auto px-5 pt-4">
                {/* Success State */}
                {success ? (
                    <div className="bg-slate-800 border border-green-500/30 rounded-3xl p-6 text-center">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/30">
                            <Icon icon="mdi:check" className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-2xl font-black text-white mb-2">Selamat!</h2>
                        <p className="text-slate-400 mb-4">Anda berhasil klaim hadiah</p>
                        <div className="bg-slate-700/50 rounded-2xl p-4 mb-6">
                            <p className="text-slate-400 text-sm">Hadiah Anda</p>
                            <p className="text-3xl font-black text-green-400">+Rp {formatCurrency(success.amount)}</p>
                        </div>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-xl"
                        >
                            Ke Dashboard
                        </button>
                    </div>
                ) : !giftInfo ? (
                    /* Code Input */
                    <div className="bg-slate-800 border border-slate-700/50 rounded-3xl p-6">
                        <div className="w-14 h-14 rounded-full bg-blue-600/20 flex items-center justify-center mx-auto mb-4">
                            <Icon icon="mdi:key" className="w-7 h-7 text-blue-400" />
                        </div>
                        <h3 className="text-white font-bold mb-4 text-center">Masukkan Kode Hadiah</h3>
                        <input
                            type="text"
                            placeholder="XXXXXXXX"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            maxLength={8}
                            className="w-full bg-slate-700/50 border border-slate-600/50 text-white text-2xl font-bold rounded-xl px-4 py-4 focus:outline-none focus:border-blue-500 placeholder-slate-600 text-center tracking-[0.3em] uppercase"
                        />
                        {error && (
                            <div className="mt-3 flex items-center gap-2 text-red-400 text-sm justify-center">
                                <Icon icon="mdi:alert-circle" className="w-4 h-4" />
                                {error}
                            </div>
                        )}
                        <button
                            onClick={() => handleInquiry()}
                            disabled={loadingInquiry || !code.trim()}
                            className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loadingInquiry ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Icon icon="mdi:magnify" className="w-5 h-5" />
                                    Cek Hadiah
                                </>
                            )}
                        </button>
                    </div>
                ) : (
                    /* Gift Info */
                    <div className="bg-slate-800 border border-slate-700/50 rounded-3xl overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 p-6 text-center border-b border-slate-700/50">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-3">
                                <Icon icon="mdi:gift" className="w-7 h-7 text-white" />
                            </div>
                            <p className="text-blue-300 text-sm">Hadiah dari</p>
                            <p className="text-xl font-bold text-white">{giftInfo.sender_name}</p>
                        </div>

                        <div className="p-5 space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-400">Total Hadiah</span>
                                <span className="text-white font-semibold">Rp {formatCurrency(giftInfo.total_deducted)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Diklaim</span>
                                <span className="text-white">{giftInfo.claimed_count} / {giftInfo.winner_count}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Tersisa</span>
                                <span className={giftInfo.remaining > 0 ? 'text-green-400' : 'text-red-400'}>{giftInfo.remaining} slot</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Distribusi</span>
                                <span className="text-slate-300">{giftInfo.distribution_type === 'random' ? 'Acak' : 'Rata'}</span>
                            </div>
                        </div>

                        {error && (
                            <div className="mx-5 mb-4 flex items-center gap-2 text-red-400 text-sm bg-red-600/10 rounded-xl p-3">
                                <Icon icon="mdi:alert-circle" className="w-4 h-4 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        <div className="p-5 pt-0">
                            {!giftInfo.can_claim && giftInfo.reason ? (
                                <div className="text-center py-4">
                                    <p className="text-slate-400">{giftInfo.reason}</p>
                                </div>
                            ) : giftInfo.remaining <= 0 ? (
                                <div className="text-center py-4">
                                    <Icon icon="mdi:gift-off" className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                                    <p className="text-slate-400">Hadiah sudah habis</p>
                                </div>
                            ) : (
                                <button
                                    onClick={handleRedeem}
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-green-600/20"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Icon icon="mdi:hand-clap" className="w-5 h-5" />
                                            Klaim Sekarang!
                                        </>
                                    )}
                                </button>
                            )}
                        </div>

                        <button
                            onClick={() => { setGiftInfo(null); setError(''); }}
                            className="w-full py-3 text-slate-400 text-sm border-t border-slate-700/50"
                        >
                            Gunakan kode lain
                        </button>
                    </div>
                )}
            </div>

            <BottomNavbar />
        </div>
    );
}
