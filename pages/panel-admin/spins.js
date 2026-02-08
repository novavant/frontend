// pages/admin/spin.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Icon } from '@iconify/react';
import AdminLayout from '../../components/admin/Layout';
import useAdminAuth from '../../lib/auth/useAdminAuth';
import { adminRequest } from '../../utils/admin/api';

export default function SpinPrizes() {
  const { loading: authLoading } = useAdminAuth();
  const [activeTab, setActiveTab] = useState('prizes');

  // Prizes state
  const [prizes, setPrizes] = useState([]);
  const [prizesLoading, setPrizesLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPrize, setEditingPrize] = useState(null);
  const [prizeForm, setPrizeForm] = useState({
    name: '',
    amount: '',
    chance_weight: '',
    status: 'active'
  });
  const [prizeSaving, setPrizeSaving] = useState(false);
  const [prizeError, setPrizeError] = useState('');

  // User Spins state
  const [userSpins, setUserSpins] = useState([]);
  const [userSpinsLoading, setUserSpinsLoading] = useState(false);
  const [userSpinsFilters, setUserSpinsFilters] = useState({
    search: '',
    page: 1,
    limit: 25
  });
  const [searchInput, setSearchInput] = useState('');
  const [totalUserSpins, setTotalUserSpins] = useState(0);
  const [totalUserSpinsPages, setTotalUserSpinsPages] = useState(1);

  // Stats
  const [prizeStats, setPrizeStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    totalWins: 0,
    totalPayout: 0
  });
  const [userSpinStats, setUserSpinStats] = useState({
    totalClaims: 0,
    claimedToday: 0,
    totalRewardsPaid: 0,
    uniqueUsers: 0
  });

  useEffect(() => {
    if (authLoading) return;
    loadPrizes();
  }, [authLoading]);

  useEffect(() => {
    if (authLoading || activeTab !== 'user-spins') return;
    loadUserSpins();
  }, [authLoading, activeTab, userSpinsFilters]);

  const loadPrizes = async () => {
    setPrizesLoading(true);
    try {
      const res = await adminRequest('/spin-prizes');
      if (res && Array.isArray(res.data)) {
        const mappedPrizes = res.data.map(p => ({
          id: p.id,
          name: p.code,
          amount: p.amount ?? 0,
          chance_weight: p.chance_weight ?? 0,
          chancePercentage: p.chance ?? 0,
          status: (p.status || 'active').toLowerCase(),
          totalWins: p.total_wins ?? 0,
          totalPaid: p.total_paid ?? 0,
          createdAt: p.created_at || null,
          updatedAt: p.updated_at || null
        }));
        setPrizes(mappedPrizes);

        // Calculate stats
        const stats = mappedPrizes.reduce((acc, prize) => {
          acc.total++;
          if (prize.status === 'active') acc.active++;
          else acc.inactive++;
          acc.totalWins += prize.totalWins;
          acc.totalPayout += prize.totalPaid;
          return acc;
        }, { total: 0, active: 0, inactive: 0, totalWins: 0, totalPayout: 0 });

        setPrizeStats(stats);
      } else {
        setPrizes([]);
        setPrizeStats({ total: 0, active: 0, inactive: 0, totalWins: 0, totalPayout: 0 });
      }
    } catch (err) {
      console.error('Failed to load prizes:', err);
      setPrizes([]);
      setPrizeStats({ total: 0, active: 0, inactive: 0, totalWins: 0, totalPayout: 0 });
    } finally {
      setPrizesLoading(false);
    }
  };

  const loadUserSpins = async () => {
    setUserSpinsLoading(true);
    try {
      const params = [];
      if (userSpinsFilters.page) params.push(`page=${userSpinsFilters.page}`);
      if (userSpinsFilters.limit) params.push(`limit=${userSpinsFilters.limit}`);
      if (userSpinsFilters.search) params.push(`search=${encodeURIComponent(userSpinsFilters.search)}`);
      const query = params.length ? `?${params.join('&')}` : '';
      const res = await adminRequest(`/user-spins${query}`);
      if (res && res.data && Array.isArray(res.data.items)) {
        const mappedUserSpins = res.data.items.map(s => ({
          id: s.id,
          userId: s.user_id,
          userName: s.user_name || `User ${s.user_id}`,
          phone: s.phone || 'N/A',
          prizeId: s.prize_id,
          code: s.code || `Prize ${s.prize_id}`,
          amount: s.amount ?? 0,
          wonAt: s.won_at || null,
          status: 'won'
        }));
        setUserSpins(mappedUserSpins);
        setTotalUserSpins(res.data.total_wins || mappedUserSpins.length);
        setTotalUserSpinsPages(Math.ceil((res.data.total_wins || mappedUserSpins.length) / userSpinsFilters.limit));

        // Calculate user spin stats
        const today = new Date().toDateString();
        const userSpinStatsCalc = mappedUserSpins.reduce((acc, spin) => {
          acc.totalClaims++;
          acc.totalRewardsPaid += spin.amount;
          if (new Date(spin.wonAt).toDateString() === today) {
            acc.claimedToday++;
          }
          return acc;
        }, { totalClaims: 0, claimedToday: 0, totalRewardsPaid: 0 });
        userSpinStatsCalc.uniqueUsers = new Set(mappedUserSpins.map(s => s.userId)).size;
        setUserSpinStats(userSpinStatsCalc);
      } else {
        setUserSpins([]);
        setTotalUserSpins(0);
        setTotalUserSpinsPages(1);
        setUserSpinStats({ totalClaims: 0, claimedToday: 0, totalRewardsPaid: 0, uniqueUsers: 0 });
      }
    } catch (err) {
      console.error('Failed to load user spins:', err);
      setUserSpins([]);
      setTotalUserSpins(0);
      setUserSpinStats({ totalClaims: 0, claimedToday: 0, totalRewardsPaid: 0, uniqueUsers: 0 });
    } finally {
      setUserSpinsLoading(false);
    }
  };

  const handleUserSpinsFilterChange = (field, value) => {
    setUserSpinsFilters(prev => ({ ...prev, [field]: value, page: field === 'page' ? value : 1 }));
  };

  const handleUserSpinsSearch = () => {
    setUserSpinsFilters(prev => ({ ...prev, search: searchInput, page: 1 }));
  };

  const handleEditPrize = (prize) => {
    setEditingPrize(prize);
    setPrizeForm({
      name: prize.name,
      amount: prize.amount,
      chance_weight: prize.chance_weight,
      status: prize.status
    });
    setPrizeError('');
    setShowEditModal(true);
  };

  const handlePrizeSubmit = async (e) => {
    e.preventDefault();
    setPrizeSaving(true);
    setPrizeError('');
    try {
      const payload = {
        amount: Number(prizeForm.amount),
        code: prizeForm.name.trim(),
        chance_weight: Number(prizeForm.chance_weight),
        status: prizeForm.status.charAt(0).toUpperCase() + prizeForm.status.slice(1)
      };

      const res = await adminRequest(`/spin-prizes/${editingPrize.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });

      if (res && res.success) {
        loadPrizes(); // Reload prizes
        setShowEditModal(false);
        setPrizeForm({
          name: '',
          amount: '',
          chance_weight: '',
          status: 'active'
        });
        setEditingPrize(null);
      } else {
        setPrizeError(res?.message || 'Gagal memperbarui hadiah');
      }
    } catch (err) {
      console.error('Prize submit failed:', err);
      setPrizeError(err?.message || 'Gagal memperbarui hadiah');
    } finally {
      setPrizeSaving(false);
    }
  };

  const handleTogglePrizeStatus = async (prize) => {
    const newStatus = prize.status === 'active' ? 'inactive' : 'active';
    try {
      const payload = {
        amount: prize.amount,
        code: prize.name,
        chance_weight: prize.chance_weight,
        status: newStatus.charAt(0).toUpperCase() + newStatus.slice(1)
      };
      const res = await adminRequest(`/spin-prizes/${prize.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      if (res && res.success) {
        loadPrizes(); // Reload prizes
      } else {
        setPrizeError(res?.message || 'Gagal mengubah status hadiah');
      }
    } catch (err) {
      console.error('Failed to toggle prize status:', err);
      setPrizeError('Gagal mengubah status hadiah');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30', label: 'Aktif' },
      inactive: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', label: 'Tidak Aktif' },
      won: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', label: 'Dimenangkan' }
    };
    const config = statusConfig[status] || statusConfig.active;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
        {config.label}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredUserSpins = userSpins; // No status filter needed as all are 'won'

  if (authLoading || (activeTab === 'prizes' && prizesLoading)) {
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
    <AdminLayout title="Kelola Hadiah Spin">
      <Head>
        <title>Vla Devs | Kelola Hadiah Spin</title>
        <link rel="icon" type="image/x-icon" href="/vla-logo.png" />
      </Head>

      {/* Tabs */}
      <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-2 border border-white/10 mb-8">
        <div className="flex">
          <button
            className={`flex-1 px-6 py-4 font-medium text-sm rounded-2xl transition-all duration-300 ${
              activeTab === 'prizes'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
            onClick={() => setActiveTab('prizes')}
          >
            <Icon icon="mdi:gift" className="inline mr-2 w-5 h-5" />
            Kelola Hadiah
          </button>
          <button
            className={`flex-1 px-6 py-4 font-medium text-sm rounded-2xl transition-all duration-300 ${
              activeTab === 'user-spins'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
            onClick={() => setActiveTab('user-spins')}
          >
            <Icon icon="mdi:account-check" className="inline mr-2 w-5 h-5" />
            Klaim Pengguna
          </button>
        </div>
      </div>

      {/* Stats Cards - Prizes */}
      {activeTab === 'prizes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard title="Total Hadiah" value={prizeStats.total} icon="mdi:gift" color="blue" />
          <StatCard title="Hadiah Aktif" value={prizeStats.active} icon="mdi:gift-open" color="green" />
          <StatCard title="Hadiah Tidak Aktif" value={prizeStats.inactive} icon="mdi:gift-off" color="red" />
          <StatCard title="Total Kemenangan" value={prizeStats.totalWins} icon="mdi:trophy" color="orange" />
          <StatCard title="Total Pembayaran" value={formatCurrency(prizeStats.totalPayout)} icon="mdi:cash" color="purple" isAmount />
        </div>
      )}

      {/* Stats Cards - User Spins */}
      {activeTab === 'user-spins' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Klaim" value={userSpinStats.totalClaims} icon="mdi:account-check" color="blue" />
          <StatCard title="Klaim Hari Ini" value={userSpinStats.claimedToday} icon="mdi:calendar-today" color="green" />
          <StatCard title="Total Reward Dibayar" value={formatCurrency(userSpinStats.totalRewardsPaid)} icon="mdi:cash-multiple" color="purple" isAmount />
          <StatCard title="Pengguna Unik" value={userSpinStats.uniqueUsers} icon="mdi:account-group" color="orange" />
        </div>
      )}

      {/* Prizes Management Section */}
      {activeTab === 'prizes' && (
        <div className="space-y-6">
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                    <Icon icon="mdi:gift" className="text-white w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-white font-semibold text-lg">Daftar Hadiah Spin</h2>
                    <p className="text-gray-400 text-sm">{prizes.length} hadiah terdaftar</p>
                  </div>
                </div>
              </div>
            </div>
            {prizeError && (
              <div className="p-4 bg-red-500/10 border-b border-red-500/20">
                <div className="flex items-center gap-2 text-red-400">
                  <Icon icon="mdi:alert-circle" className="w-4 h-4" />
                  {prizeError}
                </div>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="py-4 px-6 text-left text-gray-300 font-medium">Nama Hadiah</th>
                    <th className="py-4 px-6 text-left text-gray-300 font-medium">Jumlah</th>
                    <th className="py-4 px-6 text-left text-gray-300 font-medium">Bobot</th>
                    <th className="py-4 px-6 text-left text-gray-300 font-medium">Peluang</th>
                    <th className="py-4 px-6 text-left text-gray-300 font-medium">Status</th>
                    <th className="py-4 px-6 text-left text-gray-300 font-medium">Kemenangan</th>
                    <th className="py-4 px-6 text-center text-gray-300 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {prizes.map((prize, index) => (
                    <tr key={prize.id} className={`border-b border-white/5 hover:bg-white/5 transition-all duration-300 ${index % 2 === 0 ? 'bg-white/2' : ''}`}>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
                            <Icon icon="mdi:gift" className="text-white w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-medium text-white">{prize.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-green-400 font-semibold">{formatCurrency(prize.amount)}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="bg-black/20 px-3 py-1 rounded-lg font-mono text-white text-sm">
                          {prize.chance_weight}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(prize.chancePercentage, 100)}%` }}
                            />
                          </div>
                          <span className="text-white font-medium">{prize.chancePercentage.toFixed(2)}%</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {getStatusBadge(prize.status)}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Icon icon="mdi:trophy" className="text-yellow-400 w-4 h-4" />
                          <span className="text-white font-medium">{prize.totalWins.toLocaleString('id-ID')}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditPrize(prize)}
                            className="p-2 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 rounded-xl transition-all duration-300 hover:scale-110"
                            title="Edit Hadiah"
                          >
                            <Icon icon="mdi:pencil" className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleTogglePrizeStatus(prize)}
                            className={`p-2 rounded-xl transition-all duration-300 hover:scale-110 ${
                              prize.status === 'active'
                                ? 'bg-red-600/20 hover:bg-red-600/30 text-red-400'
                                : 'bg-green-600/20 hover:bg-green-600/30 text-green-400'
                            }`}
                            title={prize.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                          >
                            <Icon
                              icon={prize.status === 'active' ? 'mdi:close-circle' : 'mdi:check-circle'}
                              className="w-4 h-4"
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* User Spins Section */}
      {activeTab === 'user-spins' && (
        <div className="space-y-6">
          {/* Filter Section */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Icon icon="mdi:filter-variant" className="text-white w-5 h-5" />
              </div>
              <div>
                <h2 className="text-white font-semibold text-lg">Filter & Pencarian</h2>
                <p className="text-gray-400 text-sm">Cari klaim hadiah spin pengguna</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div className="lg:col-span-1">
                <label className="block text-sm text-gray-400 mb-2">Pencarian</label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleUserSpinsSearch()}
                    placeholder="Cari berdasarkan nama atau nomor telepon pengguna..."
                    className="w-full bg-white/10 border border-white/20 text-white rounded-2xl px-4 py-3 pl-12 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                  <Icon icon="mdi:magnify" className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <button
                onClick={handleUserSpinsSearch}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <Icon icon="mdi:magnify" className="w-5 h-5" />
                Cari Klaim
              </button>
              <button
                onClick={() => {
                  setUserSpinsFilters({ search: '', page: 1, limit: 25 });
                  setSearchInput('');
                }}
                className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-2xl flex items-center gap-2 transition-all"
              >
                <Icon icon="mdi:refresh" className="w-5 h-5" />
                Reset Filter
              </button>
            </div>
          </div>

          {/* User Spins Table */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
                    <Icon icon="mdi:account-check" className="text-white w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-white font-semibold text-lg">Klaim Hadiah Spin Pengguna</h2>
                    <p className="text-gray-400 text-sm">{totalUserSpins} klaim ditemukan</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm">Tampilkan:</span>
                  <select
                    value={userSpinsFilters.limit}
                    onChange={(e) => handleUserSpinsFilterChange('limit', Number(e.target.value))}
                    className="bg-white/10 border border-white/20 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark-select transition-all"
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
            {userSpinsLoading ? (
              <div className="p-12 text-center">
                <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400">Memuat data klaim...</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5">
                        <th className="py-4 px-6 text-left text-gray-300 font-medium">Pengguna</th>
                        <th className="py-4 px-6 text-left text-gray-300 font-medium">Hadiah</th>
                        <th className="py-4 px-6 text-left text-gray-300 font-medium">Jumlah</th>
                        <th className="py-4 px-6 text-left text-gray-300 font-medium">Status</th>
                        <th className="py-4 px-6 text-left text-gray-300 font-medium">Tanggal Menang</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUserSpins.map((spin, index) => (
                        <tr key={spin.id} className={`border-b border-white/5 hover:bg-white/5 transition-all duration-300 ${index % 2 === 0 ? 'bg-white/2' : ''}`}>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                                <Icon icon="mdi:account-circle" className="text-white w-5 h-5" />
                              </div>
                              <div>
                                <p className="font-medium text-white">{spin.userName}</p>
                                <p className="text-gray-400 text-sm">+62{spin.phone}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
                                <Icon icon="mdi:gift" className="text-white w-4 h-4" />
                              </div>
                              <span className="text-white font-medium">{spin.code}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-green-400 font-semibold">{formatCurrency(spin.amount)}</span>
                          </td>
                          <td className="py-4 px-6">
                            {getStatusBadge(spin.status)}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <Icon icon="mdi:calendar-clock" className="text-gray-400 w-4 h-4" />
                              <span className="text-gray-400 text-sm">{formatDate(spin.wonAt)}</span>
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
                      Menampilkan {filteredUserSpins.length ? ((userSpinsFilters.page - 1) * userSpinsFilters.limit + 1) : 0} sampai{' '}
                      {filteredUserSpins.length ? ((userSpinsFilters.page - 1) * userSpinsFilters.limit + filteredUserSpins.length) : 0} dari{' '}
                      {totalUserSpins} klaim
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUserSpinsFilterChange('page', Math.max(1, userSpinsFilters.page - 1))}
                        disabled={userSpinsFilters.page === 1}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:text-gray-600 text-white rounded-xl transition-all duration-300 disabled:cursor-not-allowed"
                      >
                        <Icon icon="mdi:chevron-left" className="w-4 h-4" />
                      </button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalUserSpinsPages) }, (_, i) => {
                          const page = userSpinsFilters.page <= 3 ? i + 1 : userSpinsFilters.page - 2 + i;
                          if (page > totalUserSpinsPages) return null;
                          return (
                            <button
                              key={page}
                              onClick={() => handleUserSpinsFilterChange('page', page)}
                              className={`w-10 h-10 rounded-xl transition-all duration-300 ${
                                userSpinsFilters.page === page
                                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                                  : 'bg-white/10 hover:bg-white/20 text-gray-300'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        })}
                      </div>
                      <button
                        onClick={() => handleUserSpinsFilterChange('page', Math.min(totalUserSpinsPages, userSpinsFilters.page + 1))}
                        disabled={userSpinsFilters.page === totalUserSpinsPages || totalUserSpinsPages === 0}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:text-gray-600 text-white rounded-xl transition-all duration-300 disabled:cursor-not-allowed"
                      >
                        <Icon icon="mdi:chevron-right" className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
            {filteredUserSpins.length === 0 && !userSpinsLoading && (
              <div className="text-center py-12">
                <Icon icon="mdi:gift-off" className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-gray-400 text-lg font-medium mb-2">Tidak ada klaim ditemukan</h3>
                <p className="text-gray-500 text-sm">
                  {userSpinsFilters.search
                    ? 'Coba ubah kata kunci pencarian.'
                    : 'Belum ada klaim hadiah spin dari pengguna.'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Prize Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900/95 backdrop-blur-xl rounded-3xl w-full max-w-md border border-white/20 shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                    <Icon icon="mdi:pencil" className="text-white w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">
                      Edit Hadiah
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Perbarui informasi hadiah spin
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <Icon icon="mdi:close" className="text-gray-400 hover:text-white w-5 h-5" />
                </button>
              </div>
              {prizeError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-2xl text-sm mb-6">
                  <div className="flex items-center gap-2">
                    <Icon icon="mdi:alert-circle" className="w-4 h-4" />
                    {prizeError}
                  </div>
                </div>
              )}
              <form onSubmit={handlePrizeSubmit} className="space-y-6">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Kode Hadiah</label>
                  <input
                    type="text"
                    value={prizeForm.name}
                    onChange={(e) => setPrizeForm({ ...prizeForm, name: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 text-white rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Contoh: SPIN_10K"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Jumlah (IDR)</label>
                  <input
                    type="number"
                    value={prizeForm.amount}
                    onChange={(e) => setPrizeForm({ ...prizeForm, amount: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 text-white rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="10000"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Bobot Peluang</label>
                  <input
                    type="number"
                    value={prizeForm.chance_weight}
                    onChange={(e) => setPrizeForm({ ...prizeForm, chance_weight: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 text-white rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="500"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Status</label>
                  <select
                    value={prizeForm.status}
                    onChange={(e) => setPrizeForm({ ...prizeForm, status: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 text-white rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all dark-select"
                  >
                    <option value="active">Aktif</option>
                    <option value="inactive">Tidak Aktif</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={prizeSaving}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white py-3 rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95 disabled:scale-100"
                  >
                    {prizeSaving ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <Icon icon="mdi:content-save" className="w-5 h-5" />
                    )}
                    {prizeSaving ? 'Menyimpan...' : 'Perbarui Hadiah'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-2xl flex items-center justify-center gap-2 transition-all"
                  >
                    <Icon icon="mdi:close" className="w-5 h-5" />
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

// Stats Card Component
function StatCard({ title, value, icon, color, isAmount = false }) {
  const colorClasses = {
    blue: { bg: 'from-blue-600 to-cyan-600', text: 'text-blue-400' },
    green: { bg: 'from-green-600 to-emerald-600', text: 'text-green-400' },
    red: { bg: 'from-red-600 to-pink-600', text: 'text-red-400' },
    orange: { bg: 'from-orange-600 to-amber-600', text: 'text-orange-400' },
    purple: { bg: 'from-purple-600 to-pink-600', text: 'text-purple-400' }
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
        <div className="text-2xl font-bold text-white">
          {isAmount ? value : (typeof value === 'number' ? value.toLocaleString('id-ID') : value)}
        </div>
      </div>
    </div>
  );
}