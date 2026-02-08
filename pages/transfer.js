// pages/transfer.js
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import BottomNavbar from '../components/BottomNavbar';
import Modal from '../components/Modal';
import { transferInquiry, executeTransfer, getTransferContacts, getUserInfo } from '../utils/api';

export default function Transfer() {
    const router = useRouter();
    const [step, setStep] = useState(1); // 1: input, 2: confirm, 3: success
    const [number, setNumber] = useState('');
    const [amount, setAmount] = useState('');
    const [recipient, setRecipient] = useState(null);
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingContacts, setLoadingContacts] = useState(true);
    const [error, setError] = useState('');
    const [transferResult, setTransferResult] = useState(null);
    const [applicationData, setApplicationData] = useState(null);
    const [userData, setUserData] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const quickAmounts = [50000, 100000, 200000, 500000, 1000000];

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

        fetchContacts();
    }, [router]);

    const fetchContacts = async () => {
        setLoadingContacts(true);
        try {
            const res = await getTransferContacts();
            if (res.success && res.data) {
                setContacts(Array.isArray(res.data) ? res.data : []);
            }
        } catch (e) {
            console.error('Error fetching contacts:', e);
        }
        setLoadingContacts(false);
    };

    const handleInquiry = async () => {
        if (!number.trim()) {
            setError('Masukkan nomor penerima');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const res = await transferInquiry(number);
            if (res.success && res.data) {
                setRecipient(res.data);
                setStep(2);
            } else {
                setError(res.message || 'Pengguna tidak ditemukan');
            }
        } catch (e) {
            setError(e.message || 'Terjadi kesalahan');
        }
        setLoading(false);
    };

    const handleShowConfirm = () => {
        const amountNum = parseInt(amount.replace(/\D/g, ''), 10);
        if (!amountNum || amountNum < 10000) {
            setError('Minimal transfer Rp 10.000');
            return;
        }
        if (amountNum > 10000000) {
            setError('Maksimal transfer Rp 10.000.000');
            return;
        }
        setError('');
        setShowConfirmModal(true);
    };

    const handleTransfer = async () => {
        setShowConfirmModal(false);
        const amountNum = parseInt(amount.replace(/\D/g, ''), 10);
        setLoading(true);
        setError('');
        try {
            const res = await executeTransfer({ number: recipient.number, amount: amountNum });
            if (res.success) {
                setTransferResult(res.data);
                setStep(3);
                // Refresh user data
                const userRes = await getUserInfo();
                if (userRes.success && userRes.data) {
                    localStorage.setItem('user', JSON.stringify(userRes.data));
                    setUserData(userRes.data);
                }
            } else {
                setError(res.message || 'Transfer gagal');
            }
        } catch (e) {
            setError(e.message || 'Terjadi kesalahan');
        }
        setLoading(false);
    };

    const handleContactSelect = (contact) => {
        setNumber(contact.number);
        setRecipient({ name: contact.name, number: contact.number, profile: contact.profile });
        setStep(2);
    };

    const handleReset = () => {
        setStep(1);
        setNumber('');
        setAmount('');
        setRecipient(null);
        setError('');
        setTransferResult(null);
        fetchContacts();
    };

    const formatCurrency = (val) => new Intl.NumberFormat('id-ID').format(val);

    const handleAmountChange = (e) => {
        const val = e.target.value.replace(/\D/g, '');
        setAmount(val ? formatCurrency(parseInt(val, 10)) : '');
    };

    return (
        <div className="min-h-screen bg-slate-950 pb-36">
            <Head>
                <title>{applicationData?.name || 'Nova Vant'} | Transfer</title>
            </Head>

            {/* Header */}
            <div className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/90 border-b border-white/5">
                <div className="max-w-md mx-auto px-5 py-4 flex items-center gap-4">
                    <button
                        onClick={() => step > 1 && step < 3 ? setStep(step - 1) : router.back()}
                        className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10"
                    >
                        <Icon icon="mdi:arrow-left" className="w-5 h-5 text-white" />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-lg font-bold text-white">Transfer Saldo</h1>
                        <p className="text-xs text-slate-400">Kirim saldo ke pengguna lain</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                        <Icon icon="mdi:send" className="w-5 h-5 text-white" />
                    </div>
                </div>
            </div>

            <div className="max-w-md mx-auto px-5 pt-6">
                {/* VIP Restriction Check - only on step 1 and 2, not on success screen */}
                {userData && (userData.level) < 3 && step !== 3 ? (
                    <div className="bg-slate-900/50 border border-amber-500/20 rounded-3xl p-6 text-center">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center mx-auto mb-4">
                            <Icon icon="mdi:crown" className="w-10 h-10 text-amber-400" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Fitur VIP Eksklusif</h2>
                        <p className="text-slate-400 text-sm mb-4">
                            Fitur Transfer hanya tersedia untuk member VIP Level 3 ke atas.
                        </p>
                        <div className="bg-slate-800/50 rounded-2xl p-4 mb-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-400 text-sm">Level Anda Saat Ini</span>
                                <span className="text-white font-bold">VIP {userData.level || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-400 text-sm">Level Dibutuhkan</span>
                                <span className="text-amber-400 font-bold">VIP 3</span>
                            </div>
                        </div>
                        <button
                            onClick={() => router.push('/vip')}
                            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
                        >
                            <Icon icon="mdi:arrow-up-bold" className="w-5 h-5" />
                            Upgrade ke VIP 3
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Balance Card */}
                        {userData && (
                            <div className="relative mb-6 overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 rounded-3xl" />
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                                <div className="relative p-5">
                                    <p className="text-blue-200 text-sm mb-1">Saldo Tersedia</p>
                                    <p className="text-3xl font-black text-white">Rp {formatCurrency(userData.balance || 0)}</p>
                                </div>
                            </div>
                        )}

                        {/* Step 1: Input Number */}
                        {step === 1 && (
                            <>
                                {/* Search Input */}
                                <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-5 mb-4">
                                    <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                                        <Icon icon="mdi:account-search" className="w-5 h-5 text-blue-400" />
                                        Cari Penerima
                                    </h3>
                                    <div className="relative">
                                        <Icon icon="mdi:phone" className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                        <input
                                            type="tel"
                                            placeholder="Masukkan nomor telepon (08xx)"
                                            value={number}
                                            onChange={(e) => setNumber(e.target.value)}
                                            className="w-full bg-slate-800/50 border border-white/10 text-white rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:border-blue-500/50 placeholder-slate-500"
                                        />
                                    </div>
                                    {error && (
                                        <div className="mt-3 flex items-center gap-2 text-red-400 text-sm">
                                            <Icon icon="mdi:alert-circle" className="w-4 h-4" />
                                            {error}
                                        </div>
                                    )}
                                    <button
                                        onClick={handleInquiry}
                                        disabled={loading || !number.trim()}
                                        className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <Icon icon="mdi:magnify" className="w-5 h-5" />
                                                Cari Penerima
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Recent Contacts */}
                                {contacts.length > 0 && (
                                    <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-5">
                                        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                            <Icon icon="mdi:history" className="w-5 h-5 text-green-400" />
                                            Kontak Terakhir
                                        </h3>
                                        <div className="space-y-3">
                                            {contacts.slice(0, 5).map((contact, idx) => (
                                                <button
                                                    key={contact.id || idx}
                                                    onClick={() => handleContactSelect(contact)}
                                                    className="w-full flex items-center gap-3 bg-slate-800/50 rounded-2xl p-3 border border-white/5 hover:border-blue-500/30 transition-all"
                                                >
                                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center overflow-hidden">
                                                        {contact.profile ? (
                                                            <img src={contact.profile} alt={contact.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <Icon icon="mdi:account" className="w-6 h-6 text-blue-400" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 text-left">
                                                        <p className="text-white font-semibold">{contact.name}</p>
                                                        <p className="text-slate-400 text-sm">+62{contact.number}</p>
                                                    </div>
                                                    <Icon icon="mdi:chevron-right" className="w-5 h-5 text-slate-500" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {loadingContacts && (
                                    <div className="flex justify-center py-8">
                                        <div className="w-8 h-8 border-3 border-slate-700 border-t-blue-500 rounded-full animate-spin" />
                                    </div>
                                )}
                            </>
                        )}

                        {/* Step 2: Confirm Amount */}
                        {step === 2 && recipient && (
                            <>
                                {/* Recipient Card */}
                                <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-5 mb-4">
                                    <h3 className="text-slate-400 text-sm mb-3">Penerima</h3>
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center overflow-hidden">
                                            {recipient.profile ? (
                                                <img src={recipient.profile} alt={recipient.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <Icon icon="mdi:account" className="w-8 h-8 text-green-400" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-white font-bold text-lg">{recipient.name}</p>
                                            <p className="text-slate-400">+62{recipient.number}</p>
                                        </div>
                                        <div className="ml-auto">
                                            <div className="w-10 h-10 rounded-xl bg-green-600/20 flex items-center justify-center">
                                                <Icon icon="mdi:check-circle" className="w-5 h-5 text-green-400" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Amount Input */}
                                <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-5 mb-4">
                                    <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                                        <Icon icon="mdi:cash" className="w-5 h-5 text-amber-400" />
                                        Jumlah Transfer
                                    </h3>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white font-bold">Rp</span>
                                        <input
                                            type="text"
                                            placeholder="0"
                                            value={amount}
                                            onChange={handleAmountChange}
                                            className="w-full bg-slate-800/50 border border-white/10 text-white text-2xl font-bold rounded-2xl pl-14 pr-4 py-4 focus:outline-none focus:border-blue-500/50 placeholder-slate-600"
                                        />
                                    </div>
                                    <p className="text-slate-500 text-xs mt-2">Min. Rp 10.000 • Max. Rp 10.000.000</p>

                                    {/* Quick Amounts */}
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {quickAmounts.map((val) => (
                                            <button
                                                key={val}
                                                onClick={() => setAmount(formatCurrency(val))}
                                                className="px-4 py-2 bg-slate-800/50 border border-white/10 rounded-xl text-white text-sm font-medium hover:border-blue-500/30"
                                            >
                                                {formatCurrency(val)}
                                            </button>
                                        ))}
                                    </div>

                                    {error && (
                                        <div className="mt-4 flex items-center gap-2 text-red-400 text-sm">
                                            <Icon icon="mdi:alert-circle" className="w-4 h-4" />
                                            {error}
                                        </div>
                                    )}
                                </div>

                                {/* Transfer Button */}
                                <button
                                    onClick={handleShowConfirm}
                                    disabled={loading || !amount}
                                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-green-600/20"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Icon icon="mdi:send" className="w-5 h-5" />
                                            Kirim Sekarang
                                        </>
                                    )}
                                </button>
                            </>
                        )}

                        {/* Step 3: Success */}
                        {step === 3 && transferResult && (
                            <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-6 text-center">
                                {/* Success Icon */}
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/30">
                                    <Icon icon="mdi:check" className="w-10 h-10 text-white" />
                                </div>

                                <h2 className="text-2xl font-black text-white mb-2">Transfer Berhasil!</h2>
                                <p className="text-slate-400 mb-6">Dana telah dikirim ke penerima</p>

                                {/* Details */}
                                <div className="bg-slate-800/50 rounded-2xl p-4 text-left space-y-3 mb-6">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Penerima</span>
                                        <span className="text-white font-semibold">{transferResult.recipient}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Nomor</span>
                                        <span className="text-white">+62{transferResult.number}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Jumlah</span>
                                        <span className="text-green-400 font-bold">Rp {formatCurrency(transferResult.amount)}</span>
                                    </div>
                                    {transferResult.charge > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Biaya</span>
                                            <span className="text-amber-400">Rp {formatCurrency(transferResult.charge)}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleReset}
                                        className="flex-1 bg-slate-800/50 border border-white/10 text-white font-semibold py-3 rounded-xl"
                                    >
                                        Transfer Lagi
                                    </button>
                                    <button
                                        onClick={() => router.push('/dashboard')}
                                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 rounded-xl"
                                    >
                                        Selesai
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            <BottomNavbar />

            {/* Confirmation Modal */}
            <Modal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                title="Konfirmasi Transfer"
                maxWidth="max-w-sm"
                icon="mdi:alert-circle"
                iconColor="text-amber-400"
                iconBgColor="bg-amber-900/20"
            >
                <div className="p-6 pt-2">
                    <p className="text-slate-400 text-sm text-center mb-5">Pastikan data berikut sudah benar</p>

                    {/* Details */}
                    <div className="bg-slate-700/30 border border-white/5 rounded-2xl p-4 space-y-3 mb-5">
                        <div className="flex justify-between">
                            <span className="text-slate-400 text-sm">Penerima</span>
                            <span className="text-white font-semibold">{recipient?.name}</span>
                        </div>
                        {userData && (
                            <div className="flex justify-between">
                                <span className="text-slate-400 text-sm">Pengirim</span>
                                <span className="text-white font-semibold">{userData.name}</span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span className="text-slate-400 text-sm">Nomor</span>
                            <span className="text-white">+62{recipient?.number}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-white/5">
                            <span className="text-slate-400 text-sm">Jumlah</span>
                            <span className="text-green-400 font-bold">Rp {amount}</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowConfirmModal(false)}
                            className="flex-1 py-3 px-4 rounded-xl font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleTransfer}
                            disabled={loading}
                            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-green-600/20 transition-all disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Memproses...</span>
                                </>
                            ) : (
                                <>
                                    <Icon icon="mdi:check-circle" className="w-5 h-5" />
                                    <span>Konfirmasi</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

