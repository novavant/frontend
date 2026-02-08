// pages/gift/index.js
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import BottomNavbar from '../../components/BottomNavbar';
import { createGift, getUserInfo } from '../../utils/api';
import Modal from '../../components/Modal';

export default function Gift() {
    const router = useRouter();
    const [applicationData, setApplicationData] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [createdGift, setCreatedGift] = useState(null);
    const [copied, setCopied] = useState(false);

    // Form state
    const [recipientType, setRecipientType] = useState('all');
    const [distributionType, setDistributionType] = useState('random');
    const [amount, setAmount] = useState('');
    const [winnerCount, setWinnerCount] = useState('');

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

        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try { setUserData(JSON.parse(storedUser)); } catch (e) { }
        }
    }, [router]);

    const formatCurrency = (val) => new Intl.NumberFormat('id-ID').format(val);

    const handleAmountChange = (e) => {
        const val = e.target.value.replace(/\D/g, '');
        setAmount(val ? formatCurrency(parseInt(val, 10)) : '');
    };

    const getAmountNum = () => parseInt(amount.replace(/\D/g, ''), 10) || 0;
    const getWinnerNum = () => parseInt(winnerCount, 10) || 0;

    const calculateTotal = () => {
        const amountNum = getAmountNum();
        const winners = getWinnerNum();
        if (distributionType === 'random') {
            return amountNum;
        } else {
            return amountNum * winners;
        }
    };

    const handleCreate = async () => {
        const amountNum = getAmountNum();
        const winners = getWinnerNum();

        if (!amountNum || amountNum < 1000) {
            setError('Jumlah minimal Rp 1.000');
            return;
        }
        if (amountNum > 10000000) {
            setError('Jumlah maksimal Rp 10.000.000');
            return;
        }
        if (!winners || winners < 1) {
            setError('Jumlah pemenang minimal 1');
            return;
        }
        if (winners > 100) {
            setError('Jumlah pemenang maksimal 100');
            return;
        }

        const total = calculateTotal();
        if (total > (userData?.balance || 0)) {
            setError('Saldo tidak mencukupi');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await createGift({
                amount: amountNum,
                winner_count: winners,
                distribution_type: distributionType,
                recipient_type: recipientType,
            });

            if (res.success && res.data) {
                setCreatedGift(res.data);
                setShowSuccessModal(true);
                const userRes = await getUserInfo();
                if (userRes.success && userRes.data) {
                    localStorage.setItem('user', JSON.stringify(userRes.data));
                    setUserData(userRes.data);
                }
            } else {
                setError(res.message || 'Gagal membuat hadiah');
            }
        } catch (e) {
            setError(e.message || 'Terjadi kesalahan');
        }
        setLoading(false);
    };

    const copyLink = () => {
        if (createdGift?.code) {
            const link = `${window.location.origin}/gift/share?code=${createdGift.code}`;
            navigator.clipboard.writeText(link);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const shareGift = () => {
        if (createdGift?.code) {
            const link = `${window.location.origin}/gift/share?code=${createdGift.code}`;
            const message = `Ada Nova Gift nih buat kamu dari aku, Buruan dapetin sebelum kehabisan!!\n${link}`;
            if (navigator.share) {
                navigator.share({
                    title: 'Nova Gift',
                    text: message,
                    url: link,
                });
            } else {
                copyLink();
            }
        }
    };

    const quickAmounts = [10000, 50000, 100000, 500000];

    return (
        <div className="min-h-screen bg-slate-900 pb-28">
            <Head>
                <title>{applicationData?.name || 'Nova Vant'} | Nova Gift</title>
            </Head>

            {/* Header - Same style as dashboard */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-400/20 via-transparent to-transparent" />

                <div className="relative px-5 pt-6 pb-6">
                    <div className="flex items-center gap-4 mb-5">
                        <button onClick={() => router.back()} className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                            <Icon icon="mdi:arrow-left" className="w-5 h-5 text-white" />
                        </button>
                        <div className="flex-1">
                            <h1 className="text-xl font-bold text-white">Nova Gift</h1>
                            <p className="text-blue-200 text-sm">Bagikan keberuntungan Anda</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
                            <Icon icon="mdi:gift" className="w-6 h-6 text-white" />
                        </div>
                    </div>

                    {/* Balance Card */}
                    {userData && (
                        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-200 text-sm">Saldo Tersedia</p>
                                    <p className="text-2xl font-black text-white">Rp {formatCurrency(userData.balance || 0)}</p>
                                </div>
                                <Icon icon="mdi:wallet" className="w-8 h-8 text-blue-300/50" />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-md mx-auto px-5 pt-4">
                {/* Quick Links */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <button onClick={() => router.push('/gift/history')} className="bg-slate-800 border border-slate-700/50 rounded-2xl p-4 text-center hover:bg-slate-700/50 transition-colors">
                        <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center mx-auto mb-2">
                            <Icon icon="mdi:history" className="w-5 h-5 text-blue-400" />
                        </div>
                        <p className="text-white text-xs font-medium">Riwayat</p>
                    </button>
                    <button onClick={() => router.push('/gift/wins')} className="bg-slate-800 border border-slate-700/50 rounded-2xl p-4 text-center hover:bg-slate-700/50 transition-colors">
                        <div className="w-10 h-10 rounded-xl bg-green-600/20 flex items-center justify-center mx-auto mb-2">
                            <Icon icon="mdi:trophy" className="w-5 h-5 text-green-400" />
                        </div>
                        <p className="text-white text-xs font-medium">Diklaim</p>
                    </button>
                    <button onClick={() => router.push('/gift/redeem')} className="bg-slate-800 border border-slate-700/50 rounded-2xl p-4 text-center hover:bg-slate-700/50 transition-colors">
                        <div className="w-10 h-10 rounded-xl bg-amber-600/20 flex items-center justify-center mx-auto mb-2">
                            <Icon icon="mdi:key" className="w-5 h-5 text-amber-400" />
                        </div>
                        <p className="text-white text-xs font-medium">Klaim</p>
                    </button>
                </div>

                {/* Create Gift Form */}
                <div className="bg-slate-800 border border-slate-700/50 rounded-3xl overflow-hidden">
                    {/* Form Header */}
                    <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border-b border-slate-700/50 px-5 py-4">
                        <h2 className="text-white font-bold flex items-center gap-2">
                            <Icon icon="mdi:gift-outline" className="w-5 h-5 text-blue-400" />
                            Buat Hadiah Baru
                        </h2>
                    </div>

                    <div className="p-5 space-y-5">
                        {/* Recipient Type */}
                        <div>
                            <label className="text-slate-400 text-sm mb-3 block">Siapa yang bisa klaim?</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setRecipientType('all')}
                                    className={`p-3 rounded-xl border-2 transition-all ${recipientType === 'all' ? 'bg-blue-600/20 border-blue-500' : 'bg-slate-700/30 border-slate-600/50'}`}
                                >
                                    <Icon icon="mdi:earth" className={`w-5 h-5 mx-auto mb-1 ${recipientType === 'all' ? 'text-blue-400' : 'text-slate-500'}`} />
                                    <p className={`text-sm font-semibold ${recipientType === 'all' ? 'text-white' : 'text-slate-400'}`}>Semua</p>
                                </button>
                                <button
                                    onClick={() => setRecipientType('referral_only')}
                                    className={`p-3 rounded-xl border-2 transition-all ${recipientType === 'referral_only' ? 'bg-green-600/20 border-green-500' : 'bg-slate-700/30 border-slate-600/50'}`}
                                >
                                    <Icon icon="mdi:account-group" className={`w-5 h-5 mx-auto mb-1 ${recipientType === 'referral_only' ? 'text-green-400' : 'text-slate-500'}`} />
                                    <p className={`text-sm font-semibold ${recipientType === 'referral_only' ? 'text-white' : 'text-slate-400'}`}>Referral</p>
                                </button>
                            </div>
                        </div>

                        {/* Distribution Type */}
                        <div>
                            <label className="text-slate-400 text-sm mb-3 block">Cara pembagian nominal?</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setDistributionType('random')}
                                    className={`p-3 rounded-xl border-2 transition-all ${distributionType === 'random' ? 'bg-amber-600/20 border-amber-500' : 'bg-slate-700/30 border-slate-600/50'}`}
                                >
                                    <Icon icon="mdi:shuffle-variant" className={`w-5 h-5 mx-auto mb-1 ${distributionType === 'random' ? 'text-amber-400' : 'text-slate-500'}`} />
                                    <p className={`text-sm font-semibold ${distributionType === 'random' ? 'text-white' : 'text-slate-400'}`}>Acak</p>
                                </button>
                                <button
                                    onClick={() => setDistributionType('equal')}
                                    className={`p-3 rounded-xl border-2 transition-all ${distributionType === 'equal' ? 'bg-cyan-600/20 border-cyan-500' : 'bg-slate-700/30 border-slate-600/50'}`}
                                >
                                    <Icon icon="mdi:equal" className={`w-5 h-5 mx-auto mb-1 ${distributionType === 'equal' ? 'text-cyan-400' : 'text-slate-500'}`} />
                                    <p className={`text-sm font-semibold ${distributionType === 'equal' ? 'text-white' : 'text-slate-400'}`}>Rata</p>
                                </button>
                            </div>
                        </div>

                        {/* Amount Input */}
                        <div>
                            <label className="text-slate-400 text-sm mb-2 block">
                                {distributionType === 'random' ? 'Total Nominal Hadiah' : 'Nominal per Pemenang'}
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">Rp</span>
                                <input
                                    type="text"
                                    placeholder="0"
                                    value={amount}
                                    onChange={handleAmountChange}
                                    className="w-full bg-slate-700/50 border border-slate-600/50 text-white text-lg font-bold rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-blue-500 placeholder-slate-600"
                                />
                            </div>
                            {/* Quick Amount Buttons */}
                            <div className="flex gap-2 mt-2">
                                {quickAmounts.map((val) => (
                                    <button
                                        key={val}
                                        onClick={() => setAmount(formatCurrency(val))}
                                        className="flex-1 py-2 bg-slate-700/30 border border-slate-600/50 rounded-lg text-slate-400 text-xs font-medium hover:bg-slate-600/50 hover:text-white transition-colors"
                                    >
                                        {val >= 1000000 ? `${val / 1000000}jt` : `${val / 1000}k`}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Winner Count */}
                        <div>
                            <label className="text-slate-400 text-sm mb-2 block">Jumlah Pemenang</label>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setWinnerCount(Math.max(1, getWinnerNum() - 1).toString())}
                                    className="w-12 h-12 rounded-xl bg-slate-700/50 border border-slate-600/50 flex items-center justify-center text-white hover:bg-slate-600/50"
                                >
                                    <Icon icon="mdi:minus" className="w-5 h-5" />
                                </button>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={winnerCount}
                                    onChange={(e) => setWinnerCount(e.target.value)}
                                    min="1"
                                    max="100"
                                    className="flex-1 bg-slate-700/50 border border-slate-600/50 text-white text-lg font-bold rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 placeholder-slate-600 text-center"
                                />
                                <button
                                    onClick={() => setWinnerCount(Math.min(100, getWinnerNum() + 1).toString())}
                                    className="w-12 h-12 rounded-xl bg-slate-700/50 border border-slate-600/50 flex items-center justify-center text-white hover:bg-slate-600/50"
                                >
                                    <Icon icon="mdi:plus" className="w-5 h-5" />
                                </button>
                            </div>
                            <p className="text-slate-500 text-xs mt-1 text-center">Maks. 100 pemenang</p>
                        </div>

                        {/* Summary */}
                        {getAmountNum() > 0 && getWinnerNum() > 0 && (
                            <div className="bg-blue-600/10 border border-blue-500/30 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-slate-400 text-sm">Total Dipotong</span>
                                    <span className="text-blue-400 font-bold text-lg">Rp {formatCurrency(calculateTotal())}</span>
                                </div>
                                {distributionType === 'equal' && (
                                    <p className="text-slate-500 text-xs">Rp {formatCurrency(getAmountNum())} × {getWinnerNum()} pemenang</p>
                                )}
                            </div>
                        )}

                        {/* Error */}
                        {error && (
                            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-600/10 rounded-xl p-3">
                                <Icon icon="mdi:alert-circle" className="w-4 h-4 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        {/* Create Button */}
                        <button
                            onClick={handleCreate}
                            disabled={loading || !getAmountNum() || !getWinnerNum()}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-600/20"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Icon icon="mdi:gift" className="w-5 h-5" />
                                    Buat Hadiah
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <BottomNavbar />

            {/* Success Modal */}
            <Modal
                isOpen={showSuccessModal && !!createdGift}
                onClose={() => {
                    setShowSuccessModal(false);
                    setAmount('');
                    setWinnerCount('');
                    setCreatedGift(null);
                }}
                title="Hadiah Berhasil Dibuat!"
                maxWidth="max-w-sm"
                icon="mdi:check-decagram"
                iconColor="text-green-400"
                iconBgColor="bg-green-900/20"
            >
                <div className="p-6 pt-2 text-center">
                    <p className="text-slate-400 text-sm mb-5">Bagikan kode di bawah ini kepada teman</p>

                    {/* Code Display */}
                    <div className="bg-slate-700/50 rounded-2xl p-4 mb-4 border border-white/5 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <p className="text-slate-400 text-xs mb-1 uppercase tracking-wider">Kode Hadiah</p>
                        <p className="text-3xl font-black text-white tracking-widest font-mono">{createdGift?.code}</p>
                    </div>

                    {/* Details */}
                    <div className="bg-slate-700/30 rounded-xl p-4 text-sm space-y-3 mb-6 border border-white/5">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400">Total Nilai</span>
                            <span className="text-green-400 font-bold bg-green-900/20 px-2 py-0.5 rounded">
                                Rp {formatCurrency(createdGift?.total_deducted || 0)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400">Jumlah Pemenang</span>
                            <span className="text-white font-semibold">{createdGift?.winner_count} Orang</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400">Tipe Pembagian</span>
                            <span className="text-blue-400 capitalize">{createdGift?.distribution_type === 'random' ? 'Acak' : 'Rata'}</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={copyLink}
                            className={`flex-1 font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg ${copied
                                ? 'bg-green-600 text-white shadow-green-600/20'
                                : 'bg-slate-700 text-white hover:bg-slate-600 border border-slate-600'}`}
                        >
                            <Icon icon={copied ? "mdi:check-bold" : "mdi:content-copy"} className="w-5 h-5" />
                            {copied ? 'Tersalin' : 'Salin'}
                        </button>
                        <button
                            onClick={shareGift}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all"
                        >
                            <Icon icon="mdi:share-variant" className="w-5 h-5" />
                            Bagikan
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
