// pages/admin/withdrawals.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Icon } from '@iconify/react';
import AdminLayout from '../../components/admin/Layout';
import useAdminAuth from '../../lib/auth/useAdminAuth';
import { adminRequest } from '../../utils/admin/api';

export default function WithdrawalManagement() {
  const { loading: authLoading } = useAdminAuth();
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    page: 1,
    limit: 25
  });
  const [searchInput, setSearchInput] = useState('');
  const [totalWithdrawals, setTotalWithdrawals] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    success: 0,
    failed: 0
  });

  useEffect(() => {
    if (authLoading) return;
    loadWithdrawals();
  }, [authLoading, filters]);

  const loadWithdrawals = async () => {
    setLoading(true);
    setError('');
    try {
      const params = [];
      if (filters.page) params.push(`page=${filters.page}`);
      if (filters.limit) params.push(`limit=${filters.limit}`);
      if (filters.status && filters.status !== 'all') params.push(`status=${filters.status}`);
      if (filters.search) params.push(`search=${encodeURIComponent(filters.search)}`);

      const query = params.length ? `?${params.join('&')}` : '';
      const res = await adminRequest(`/withdrawals${query}`, { method: 'GET' });

      if (res && res.success && Array.isArray(res.data)) {
        setWithdrawals(res.data);
        setTotalWithdrawals(res.total || res.data.length);
        setTotalPages(Math.ceil((res.total || res.data.length) / filters.limit));

        // Calculate stats
        const statsData = res.data.reduce((acc, withdrawal) => {
          acc.total++;
          const status = withdrawal.status.toLowerCase();
          if (status === 'pending') acc.pending++;
          else if (status === 'success') acc.success++;
          else if (status === 'failed') acc.failed++;
          return acc;
        }, { total: 0, pending: 0, success: 0, failed: 0 });
        setStats(statsData);
      } else {
        setWithdrawals([]);
        setTotalWithdrawals(0);
        setTotalPages(1);
        setStats({ total: 0, pending: 0, success: 0, failed: 0 });
      }
    } catch (err) {
      console.error('Failed to load withdrawals:', err);
      setError('Gagal memuat data penarikan');
      setWithdrawals([]);
      setTotalWithdrawals(0);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value, page: field === 'page' ? value : 1 }));
  };

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, search: searchInput, page: 1 }));
  };

  const handleAction = (withdrawal, type) => {
    setSelectedWithdrawal(withdrawal);
    setActionType(type);
    setRejectionReason('');
    setError('');
    setShowActionModal(true);
  };

  const confirmAction = async () => {
    if (!selectedWithdrawal) return;

    setProcessing(true);
    setError('');
    try {
      let res;
      if (actionType === 'approve') {
        res = await adminRequest(`/withdrawals/${selectedWithdrawal.id}/approve`, {
          method: 'PUT'
        });
      } else if (actionType === 'reject') {
        if (!rejectionReason.trim()) {
          setError('Alasan penolakan harus diisi');
          setProcessing(false);
          return;
        }
        res = await adminRequest(`/withdrawals/${selectedWithdrawal.id}/reject`, {
          method: 'PUT',
          body: JSON.stringify({ reason: rejectionReason })
        });
      }

      if (res && res.success) {
        loadWithdrawals(); // Reload data
        setShowActionModal(false);
        setRejectionReason('');
      } else {
        setError(res?.message || 'Gagal memproses penarikan');
      }
    } catch (err) {
      console.error('Failed to process withdrawal:', err);
      setError(err?.message || 'Gagal memproses penarikan');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { class: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', label: 'Menunggu' },
      success: { class: 'bg-green-500/20 text-green-400 border-green-500/30', label: 'Berhasil' },
      failed: { class: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'Gagal' }
    };

    const config = statusConfig[status.toLowerCase()] || statusConfig.pending;
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
            <p className="text-white font-medium text-lg">Memuat Data Penarikan...</p>
            <p className="text-gray-400 text-sm mt-1">Harap tunggu sebentar</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout title="Kelola Penarikan">
      <Head>
        <title>Vla Devs | Kelola Penarikan</title>
        <link rel="icon" type="image/x-icon" href="/vla-logo.png" />
      </Head>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Penarikan" value={stats.total} icon="mdi:cash-multiple" color="blue" />
        <StatCard title="Berhasil" value={stats.success} icon="mdi:check-circle" color="green" />
        <StatCard title="Menunggu" value={stats.pending} icon="mdi:clock-alert" color="yellow" />
        <StatCard title="Gagal" value={stats.failed} icon="mdi:close-circle" color="red" />
      </div>

      {/* Filter Section */}
      <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
            <Icon icon="mdi:filter-variant" className="text-white w-5 h-5" />
          </div>
          <div>
            <h2 className="text-white font-semibold text-lg">Filter & Pencarian</h2>
            <p className="text-gray-400 text-sm">Cari dan filter penarikan berdasarkan kriteria</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {/* Search */}
          <div className="lg:col-span-1">
            <label className="block text-sm text-gray-400 mb-2">Pencarian</label>
            <div className="relative">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Cari berdasarkan Order ID..."
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
              <option value="Pending">Menunggu</option>
              <option value="Success">Berhasil</option>
              <option value="Failed">Gagal</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <button
            onClick={handleSearch}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <Icon icon="mdi:magnify" className="w-5 h-5" />
            Cari Penarikan
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

      {/* Withdrawals Table */}
      <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl flex items-center justify-center">
                <Icon icon="mdi:cash-remove" className="text-white w-5 h-5" />
              </div>
              <div>
                <h2 className="text-white font-semibold text-lg">Permintaan Penarikan</h2>
                <p className="text-gray-400 text-sm">{totalWithdrawals} penarikan ditemukan</p>
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
                <th className="py-4 px-6 text-left text-gray-300 font-medium">Pengguna</th>
                <th className="py-4 px-6 text-left text-gray-300 font-medium">Order ID</th>
                <th className="py-4 px-6 text-left text-gray-300 font-medium">Detail Jumlah</th>
                <th className="py-4 px-6 text-left text-gray-300 font-medium">Detail Bank</th>
                <th className="py-4 px-6 text-left text-gray-300 font-medium">Status</th>
                <th className="py-4 px-6 text-left text-gray-300 font-medium">Tanggal</th>
                <th className="py-4 px-6 text-center text-gray-300 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map((withdrawal, index) => (
                <tr key={withdrawal.id} className={`border-b border-white/5 hover:bg-white/5 transition-all duration-300 ${index % 2 === 0 ? 'bg-white/2' : ''}`}>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
                        <Icon icon="mdi:account" className="text-white w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{withdrawal.user_name}</p>
                        <p className="text-gray-400 text-sm">+62{withdrawal.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-white font-medium">{withdrawal.order_id}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="space-y-1">
                      <div className="text-white font-medium">{formatCurrency(withdrawal.amount)}</div>
                      <div className="text-gray-400 text-sm">Biaya: {formatCurrency(withdrawal.charge)}</div>
                      <div className="text-green-400 font-semibold">
                        Final: {formatCurrency(withdrawal.final_amount)}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="space-y-1">
                      <div className="text-white font-medium">{withdrawal.bank_name}</div>
                      <div className="text-gray-400 text-sm font-mono">{withdrawal.account_number}</div>
                      <div className="text-gray-400 text-xs">{withdrawal.account_name}</div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    {getStatusBadge(withdrawal.status)}
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-white text-sm">{formatDate(withdrawal.created_at)}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-2">
                      {withdrawal.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => handleAction(withdrawal, 'approve')}
                            className="p-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-xl transition-all duration-300 hover:scale-110"
                            title="Setujui Penarikan"
                          >
                            <Icon icon="mdi:check" className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleAction(withdrawal, 'reject')}
                            className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-xl transition-all duration-300 hover:scale-110"
                            title="Tolak Penarikan"
                          >
                            <Icon icon="mdi:close" className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {withdrawal.status !== 'Pending' && (
                        <div className="text-gray-500 text-sm">No action</div>
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
              Menampilkan {withdrawals.length ? ((filters.page - 1) * filters.limit + 1) : 0} sampai{' '}
              {withdrawals.length ? ((filters.page - 1) * filters.limit + withdrawals.length) : 0} dari{' '}
              {totalWithdrawals} penarikan
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
                disabled={withdrawals.length < filters.limit}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:text-gray-600 text-white rounded-xl transition-all duration-300 disabled:cursor-not-allowed"
              >
                <Icon icon="mdi:chevron-right" className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Action Confirmation Modal */}
      {showActionModal && selectedWithdrawal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900/95 backdrop-blur-xl rounded-3xl w-full max-w-md border border-white/20 shadow-2xl">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${actionType === 'approve'
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600'
                    : 'bg-gradient-to-r from-red-600 to-pink-600'
                  }`}>
                  <Icon
                    icon={actionType === 'approve' ? 'mdi:check' : 'mdi:close'}
                    className="text-white w-5 h-5"
                  />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">
                    {actionType === 'approve' ? 'Setujui Penarikan' : 'Tolak Penarikan'}
                  </h3>
                  <p className="text-gray-400 text-sm">Konfirmasi tindakan ini</p>
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-4 mb-6">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Pengguna:</span>
                    <span className="text-white font-medium">{selectedWithdrawal.user_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Jumlah:</span>
                    <span className="text-white font-medium">{formatCurrency(selectedWithdrawal.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Biaya Admin:</span>
                    <span className="text-white font-medium">{formatCurrency(selectedWithdrawal.charge)}</span>
                  </div>
                  <div className="flex justify-between border-t border-white/10 pt-2">
                    <span className="text-gray-400">Total Diterima:</span>
                    <span className="text-green-400 font-bold">{formatCurrency(selectedWithdrawal.final_amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Bank:</span>
                    <span className="text-white font-medium">{selectedWithdrawal.bank_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">No. Rekening:</span>
                    <span className="text-white font-medium font-mono">{selectedWithdrawal.account_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Nama Rekening:</span>
                    <span className="text-white font-medium">{selectedWithdrawal.account_name}</span>
                  </div>
                </div>
              </div>

              {actionType === 'reject' && (
                <div className="mb-6">
                  <label className="block text-gray-400 text-sm mb-2">Alasan Penolakan</label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Masukkan alasan penolakan..."
                    className="w-full bg-white/10 border border-white/20 text-white rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all min-h-[80px] resize-none"
                  />
                </div>
              )}

              {actionType === 'approve' && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Icon icon="mdi:alert" className="w-5 h-5 text-yellow-400 mt-0.5" />
                    <div>
                      <p className="text-yellow-400 font-medium text-sm">Perhatian!</p>
                      <p className="text-yellow-300 text-sm">
                        Tindakan ini akan memproses pembayaran dan mengubah status menjadi Berhasil.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-2xl text-sm mb-4">
                  <div className="flex items-center gap-2">
                    <Icon icon="mdi:alert-circle" className="w-4 h-4" />
                    {error}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowActionModal(false)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-2xl flex items-center justify-center gap-2 transition-all"
                >
                  <Icon icon="mdi:close" className="w-4 h-4" />
                  Batal
                </button>
                <button
                  onClick={confirmAction}
                  disabled={processing || (actionType === 'reject' && !rejectionReason.trim())}
                  className={`flex-1 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95 disabled:scale-100 disabled:opacity-50 disabled:cursor-not-allowed ${actionType === 'approve'
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                      : 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700'
                    } text-white`}
                >
                  {processing ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <Icon icon={actionType === 'approve' ? 'mdi:check' : 'mdi:close'} className="w-4 h-4" />
                  )}
                  {processing ? 'Memproses...' : actionType === 'approve' ? 'Setujui' : 'Tolak'}
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
    yellow: { bg: 'from-yellow-600 to-orange-600', text: 'text-yellow-400' },
    red: { bg: 'from-red-600 to-pink-600', text: 'text-red-400' }
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