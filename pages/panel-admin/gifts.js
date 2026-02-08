import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Icon } from '@iconify/react';
import AdminLayout from '../../components/admin/Layout';
import useAdminAuth from '../../lib/auth/useAdminAuth';
import { adminRequest } from '../../utils/admin/api';

export default function GiftManagement() {
    const { loading: authLoading } = useAdminAuth();
    const [gifts, setGifts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: 'all',
        search: '',
        page: 1,
        limit: 25
    });
    const [searchInput, setSearchInput] = useState('');
    const [totalGifts, setTotalGifts] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedGift, setSelectedGift] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        completed: 0
    });

    useEffect(() => {
        if (authLoading) return;
        loadGifts();
    }, [authLoading, filters]);

    const loadGifts = async () => {
        setLoading(true);
        setError('');
        try {
            const params = [];
            if (filters.page) params.push(`page=${filters.page}`);
            if (filters.limit) params.push(`limit=${filters.limit}`);
            if (filters.status && filters.status !== 'all') params.push(`status=${filters.status}`);
            if (filters.search) params.push(`code=${encodeURIComponent(filters.search)}`);

            const query = params.length ? `?${params.join('&')}` : '';
            const res = await adminRequest(`/gifts${query}`, { method: 'GET' });

            if (res && res.success && res.data && Array.isArray(res.data.items)) {
                setGifts(res.data.items);
                setTotalGifts(res.data.total || res.data.items.length); // Adjusted based on expected pagination structure
                setTotalPages(Math.ceil((res.data.total || res.data.items.length) / filters.limit));

                // Calculate stats client-side or separate endpoint if available?
                // Assuming we count from loaded page for immediate feedback or need separate stats endpoint
                // For simplicity, let's just count loaded items for now, ideally backend provides aggregate stats
                const statsData = res.data.items.reduce((acc, gift) => {
                    acc.total++;
                    const status = gift.status.toLowerCase();
                    if (status === 'active') acc.active++;
                    else if (status === 'completed') acc.completed++;
                    return acc;
                }, { total: 0, active: 0, completed: 0 });
                setStats(statsData);
            } else {
                setGifts([]);
                setTotalGifts(0);
                setTotalPages(1);
                setStats({ total: 0, active: 0, completed: 0 });
            }
        } catch (err) {
            console.error('Failed to load gifts:', err);
            setError('Gagal memuat data hadiah');
            setGifts([]);
            setTotalGifts(0);
        } finally {
            setLoading(false);
        }
    };

    const loadGiftDetail = async (id) => {
        try {
            const res = await adminRequest(`/gifts/${id}`, { method: 'GET' });
            if (res && res.success) {
                setSelectedGift(res.data);
            } else {
                setError(res?.message || 'Gagal memuat detail hadiah');
            }
        } catch (err) {
            console.error('Failed to load gift detail:', err);
            setError('Gagal memuat detail hadiah');
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value, page: field === 'page' ? value : 1 }));
    };

    const handleSearch = () => {
        setFilters(prev => ({ ...prev, search: searchInput, page: 1 }));
    };

    const handleViewDetail = async (gift) => {
        setProcessing(true); // Loading detail state
        await loadGiftDetail(gift.id);
        setProcessing(false);
        setShowDetailModal(true);
    };

    const handleCancelClick = (gift) => {
        setSelectedGift(gift);
        setShowCancelModal(true);
        setError('');
    };

    const confirmCancel = async () => {
        if (!selectedGift) return;

        setProcessing(true);
        setError('');
        try {
            const res = await adminRequest(`/gifts/${selectedGift.id}/cancel`, {
                method: 'PUT'
            });

            if (res && res.success) {
                loadGifts(); // Reload list
                setShowCancelModal(false);
                setSelectedGift(null);
            } else {
                setError(res?.message || 'Gagal membatalkan hadiah');
            }
        } catch (err) {
            console.error('Failed to cancel gift:', err);
            setError(err?.message || 'Gagal membatalkan hadiah');
        } finally {
            setProcessing(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            active: { class: 'bg-green-500/20 text-green-400 border-green-500/30', label: 'Aktif' },
            completed: { class: 'bg-blue-500/20 text-blue-400 border-blue-500/30', label: 'Selesai' },
            expired: { class: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', label: 'Kadaluarsa' },
            cancelled: { class: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'Dibatalkan' }
        };

        const config = statusConfig[status.toLowerCase()] || { class: 'bg-gray-500/20 text-gray-400 border-gray-500/30', label: status };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${config.class}`}>
                {config.label}
            </span>
        );
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount || 0);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-purple-400/30 border-t-purple-400 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-pink-400 rounded-full animate-spin animation-delay-150"></div>
                    </div>
                    <div className="mt-6 text-center">
                        <p className="text-white font-medium text-lg">Memuat Data Hadiah...</p>
                        <p className="text-gray-400 text-sm mt-1">Harap tunggu sebentar</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <AdminLayout title="Kelola Hadiah">
            <Head>
                <title>Vla Devs | Kelola Hadiah</title>
                <link rel="icon" type="image/x-icon" href="/vla-logo.png" />
            </Head>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard title="Total Hadiah" value={stats.total} icon="mdi:gift-outline" color="blue" />
                <StatCard title="Aktif" value={stats.active} icon="mdi:check-circle" color="green" />
                <StatCard title="Selesai" value={stats.completed} icon="mdi:checkbox-marked-circle-outline" color="purple" />
            </div>

            {/* Filter Section */}
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 mb-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                        <Icon icon="mdi:filter-variant" className="text-white w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-white font-semibold text-lg">Filter & Pencarian</h2>
                        <p className="text-gray-400 text-sm">Cari dan filter hadiah berdasarkan kriteria</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    {/* Search */}
                    <div className="lg:col-span-1">
                        <label className="block text-sm text-gray-400 mb-2">Pencarian Kode</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder="Cari Kode Hadiah..."
                                className="w-full bg-white/10 border border-white/20 text-white rounded-2xl px-4 py-3 pl-12 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                            />
                            <Icon icon="mdi:magnify" className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Status</label>
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="w-full bg-white/10 border border-white/20 text-white rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all dark-select"
                        >
                            <option value="all">Semua Status</option>
                            <option value="active">Aktif</option>
                            <option value="completed">Selesai</option>
                            <option value="expired">Kadaluarsa</option>
                            <option value="cancelled">Dibatalkan</option>
                        </select>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-end">
                    <button
                        onClick={handleSearch}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95"
                    >
                        <Icon icon="mdi:magnify" className="w-5 h-5" />
                        Cari Hadiah
                    </button>
                    <button
                        onClick={() => {
                            setFilters({ status: 'all', search: '', page: 1, limit: 25 });
                            setSearchInput('');
                        }}
                        className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-2xl flex items-center gap-2 transition-all"
                    >
                        <Icon icon="mdi:refresh" className="w-5 h-5" />
                        Reset Filter
                    </button>
                </div>
            </div>

            {/* Gifts Table */}
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
                <div className="p-6 border-b border-white/10">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl flex items-center justify-center">
                                <Icon icon="mdi:gift" className="text-white w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-white font-semibold text-lg">Daftar Hadiah</h2>
                                <p className="text-gray-400 text-sm">{totalGifts} hadiah ditemukan</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-gray-400 text-sm">Tampilkan:</span>
                            <select
                                value={filters.limit}
                                onChange={(e) => handleFilterChange('limit', Number(e.target.value))}
                                className="bg-white/10 border border-white/20 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark-select"
                            >
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value={75}>75</option>
                                <option value={100}>100</option>
                            </select>
                            <span className="text-gray-400 text-sm">per halaman</span>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-red-500/10 border-b border-red-500/20">
                        <div className="flex items-center gap-2 text-red-400">
                            <Icon icon="mdi:alert-circle" className="w-4 h-4" />
                            {error}
                        </div>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/5">
                                <th className="py-4 px-6 text-left text-gray-300 font-medium">Pengirim</th>
                                <th className="py-4 px-6 text-left text-gray-300 font-medium">Kode Hadiah</th>
                                <th className="py-4 px-6 text-left text-gray-300 font-medium">Total Nominal</th>
                                <th className="py-4 px-6 text-left text-gray-300 font-medium">Status</th>
                                <th className="py-4 px-6 text-left text-gray-300 font-medium">Klaim / Kuota</th>
                                <th className="py-4 px-6 text-left text-gray-300 font-medium">Tanggal</th>
                                <th className="py-4 px-6 text-center text-gray-300 font-medium">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {gifts.map((gift, index) => (
                                <tr key={gift.id} className={`border-b border-white/5 hover:bg-white/5 transition-all duration-300 ${index % 2 === 0 ? 'bg-white/2' : ''}`}>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
                                                <Icon icon="mdi:account" className="text-white w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-white">{gift.user_name || `User #${gift.user_id}`}</p>
                                                <p className="text-gray-400 text-sm">{gift.user_phone ? `+62${gift.user_phone}` : '-'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="bg-black/20 px-3 py-1 rounded-lg font-mono text-white text-sm inline-block">
                                            {gift.code}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="text-green-400 font-semibold">{formatCurrency(gift.total_deducted || gift.amount)}</div>
                                    </td>
                                    <td className="py-4 px-6">
                                        {getStatusBadge(gift.status)}
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="text-white text-sm">
                                            <span className="text-green-400">{gift.claimed_count || 0}</span> / {gift.winner_count}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="text-white text-sm">{formatDate(gift.created_at)}</div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => handleViewDetail(gift)}
                                                className="p-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-xl transition-all duration-300 hover:scale-110"
                                                title="Lihat Detail"
                                            >
                                                <Icon icon="mdi:eye" className="w-4 h-4" />
                                            </button>
                                            {gift.status.toLowerCase() === 'active' && (gift.claimed_count === 0 || !gift.claimed_count) && (
                                                <button
                                                    onClick={() => handleCancelClick(gift)}
                                                    className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-xl transition-all duration-300 hover:scale-110"
                                                    title="Batalkan Hadiah"
                                                >
                                                    <Icon icon="mdi:cancel" className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-6 border-t border-white/10 bg-white/2">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="text-gray-400 text-sm">
                            Menampilkan {gifts.length ? ((filters.page - 1) * filters.limit + 1) : 0} sampai{' '}
                            {gifts.length ? ((filters.page - 1) * filters.limit + gifts.length) : 0} dari{' '}
                            {totalGifts} hadiah
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))}
                                disabled={filters.page === 1}
                                className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:text-gray-600 text-white rounded-xl transition-all duration-300 disabled:cursor-not-allowed"
                            >
                                <Icon icon="mdi:chevron-left" className="w-4 h-4" />
                            </button>

                            <div className="flex items-center gap-1">
                                <button
                                    className={`w-10 h-10 rounded-xl transition-all duration-300 bg-gradient-to-r from-purple-600 to-pink-600 text-white`}
                                    disabled
                                >
                                    {filters.page}
                                </button>
                            </div>

                            <button
                                onClick={() => handleFilterChange('page', filters.page + 1)}
                                disabled={gifts.length < filters.limit}
                                className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:text-gray-600 text-white rounded-xl transition-all duration-300 disabled:cursor-not-allowed"
                            >
                                <Icon icon="mdi:chevron-right" className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            {showDetailModal && selectedGift && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900/95 backdrop-blur-xl rounded-3xl w-full max-w-2xl border border-white/20 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
                                        <Icon icon="mdi:gift-open" className="text-white w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-semibold text-lg">Detail Hadiah</h3>
                                        <p className="text-gray-400 text-sm">Informasi lengkap hadiah dan pemenang</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                                >
                                    <Icon icon="mdi:close" className="text-gray-400 hover:text-white w-5 h-5" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div className="space-y-4">
                                    <h4 className="text-white font-medium border-b border-white/10 pb-2">Informasi Pengirim</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Nama:</span>
                                            <span className="text-white">{selectedGift.sender_name || selectedGift.user_name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Telepon:</span>
                                            <span className="text-white">{selectedGift.sender_phone || selectedGift.user_phone}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Reff Code:</span>
                                            <span className="text-white font-mono">{selectedGift.sender_reff_code || '-'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-white font-medium border-b border-white/10 pb-2">Informasi Hadiah</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Kode Hadiah:</span>
                                            <span className="text-white font-mono bg-white/10 px-2 py-0.5 rounded">{selectedGift.code}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Status:</span>
                                            <span>{getStatusBadge(selectedGift.status)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Total Nominal:</span>
                                            <span className="text-green-400 font-bold">{formatCurrency(selectedGift.total_deducted || selectedGift.amount)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Tipe Distribusi:</span>
                                            <span className="text-white capitalize">{selectedGift.distribution_type}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Progress Klaim:</span>
                                            <span className="text-white">{selectedGift.claimed_count || 0} / {selectedGift.winner_count}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Claims / Winners List */}
                            <div className="mb-6">
                                <h4 className="text-white font-medium border-b border-white/10 pb-2 mb-4">Daftar Pemenang ({selectedGift.claims?.length || 0})</h4>

                                {selectedGift.claims && selectedGift.claims.length > 0 ? (
                                    <div className="bg-white/5 rounded-2xl overflow-hidden border border-white/10">
                                        <table className="w-full text-sm">
                                            <thead className="bg-white/5">
                                                <tr>
                                                    <th className="py-3 px-4 text-left text-gray-400 font-medium">Pemenang</th>
                                                    <th className="py-3 px-4 text-left text-gray-400 font-medium">Nominal</th>
                                                    <th className="py-3 px-4 text-right text-gray-400 font-medium">Waktu Klaim</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedGift.claims.map((claim, idx) => (
                                                    <tr key={idx} className="border-t border-white/5">
                                                        <td className="py-3 px-4">
                                                            <div className="text-white font-medium">{claim.user_name}</div>
                                                            <div className="text-gray-500 text-xs">{claim.user_phone}</div>
                                                        </td>
                                                        <td className="py-3 px-4 text-green-400 font-medium">
                                                            {formatCurrency(claim.amount)}
                                                        </td>
                                                        <td className="py-3 px-4 text-right text-gray-400 text-xs">
                                                            {formatDate(claim.created_at || claim.claimed_at)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500 bg-white/5 rounded-2xl border border-white/5">
                                        Belum ada pemenang yang mengklaim hadiah ini.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel Confirmation Modal */}
            {showCancelModal && selectedGift && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900/95 backdrop-blur-xl rounded-3xl w-full max-w-md border border-white/20 shadow-2xl">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-pink-600 rounded-xl flex items-center justify-center">
                                    <Icon icon="mdi:cancel" className="text-white w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-white font-semibold text-lg">Batalkan Hadiah</h3>
                                    <p className="text-gray-400 text-sm">Konfirmasi pembatalan hadiah</p>
                                </div>
                            </div>

                            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-6">
                                <div className="flex items-start gap-3">
                                    <Icon icon="mdi:alert" className="w-5 h-5 text-red-400 mt-0.5" />
                                    <div>
                                        <p className="text-red-400 font-medium text-sm">Perhatian!</p>
                                        <p className="text-red-300 text-sm mt-1">
                                            Tindakan ini akan membatalkan hadiah dengan kode <span className="font-mono font-bold bg-black/20 px-1 rounded">{selectedGift.code}</span>.
                                            Saldo tersisa akan dikembalikan ke pengirim. Tindakan ini tidak dapat dibatalkan.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowCancelModal(false)}
                                    className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-2xl flex items-center justify-center gap-2 transition-all"
                                >
                                    <Icon icon="mdi:close" className="w-4 h-4" />
                                    Batal
                                </button>
                                <button
                                    onClick={confirmCancel}
                                    disabled={processing}
                                    className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white py-3 rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95 disabled:scale-100 disabled:opacity-50"
                                >
                                    {processing ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <Icon icon="mdi:check" className="w-4 h-4" />
                                    )}
                                    {processing ? 'Memproses...' : 'Ya, Batalkan'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

// Stats Card Component
function StatCard({ title, value, icon, color }) {
    const colorClasses = {
        blue: { bg: 'from-blue-600 to-cyan-600', text: 'text-blue-400' },
        green: { bg: 'from-green-600 to-emerald-600', text: 'text-green-400' },
        purple: { bg: 'from-purple-600 to-pink-600', text: 'text-purple-400' },
        red: { bg: 'from-red-600 to-pink-600', text: 'text-red-400' },
        yellow: { bg: 'from-yellow-600 to-orange-600', text: 'text-yellow-400' }
    };

    return (
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 hover:bg-white/10 hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${colorClasses[color].bg} rounded-xl flex items-center justify-center`}>
                    <Icon icon={icon} className="w-6 h-6 text-white" />
                </div>
            </div>
            <div>
                <h3 className="text-gray-400 text-sm font-medium mb-2">{title}</h3>
                <div className="text-2xl font-bold text-white">{value.toLocaleString('id-ID')}</div>
            </div>
        </div>
    );
}
