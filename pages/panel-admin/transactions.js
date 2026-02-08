// pages/admin/transactions.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Icon } from '@iconify/react';
import AdminLayout from '../../components/admin/Layout';
import useAdminAuth from '../../lib/auth/useAdminAuth';
import { adminRequest } from '../../utils/admin/api';

export default function TransactionsManagement() {
  const { loading: authLoading } = useAdminAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    search: '',
    userId: '',
    dateFrom: '',
    dateTo: '',
    page: 1,
    limit: 25
  });
  const [searchInput, setSearchInput] = useState('');
  const [userIdInput, setUserIdInput] = useState('');
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    investment: 0,
    withdrawal: 0,
    bonus: 0,
    success: 0,
    pending: 0,
    failed: 0
  });

  useEffect(() => {
    if (authLoading) return;
    loadTransactions();
  }, [authLoading, filters]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const params = [];
      if (filters.page) params.push(`page=${filters.page}`);
      if (filters.limit) params.push(`limit=${filters.limit}`);
      if (filters.type && filters.type !== 'all') params.push(`type=${filters.type}`);
      if (filters.status && filters.status !== 'all') params.push(`status=${filters.status}`);
      if (filters.search) params.push(`search=${encodeURIComponent(filters.search)}`);
      if (filters.dateFrom) params.push(`start_date=${filters.dateFrom}`);
      if (filters.dateTo) params.push(`end_date=${filters.dateTo}`);
      if (userIdInput) params.push(`userId=${userIdInput}`);
      const query = params.length ? `?${params.join('&')}` : '';
      const res = await adminRequest(`/transactions${query}`, { method: 'GET' });
      
      if (res && res.success && Array.isArray(res.data)) {
        // Map API fields to UI model
        const mappedData = res.data.map(transaction => {
          // Normalize status
          const rawStatus = transaction.status || '';
          let status = 'Unknown';
          if (rawStatus) {
            const s = String(rawStatus).toLowerCase();
            if (s === 'success' || s === 'completed') status = 'Success';
            else if (s === 'pending') status = 'Pending';
            else if (s === 'failed' || s === 'fail' || s === 'rejected') status = 'Failed';
            else status = String(rawStatus).charAt(0).toUpperCase() + String(rawStatus).slice(1);
          }

          return {
            id: transaction.id,
            userId: transaction.user_id || transaction.userId || 'N/A',
            userName: transaction.user_name || transaction.username || (transaction.user_id ? `User ${transaction.user_id}` : 'Unknown'),
            phone: transaction.phone || transaction.user_phone || '',
            type: transaction.transaction_type || transaction.type || 'other',
            amount: transaction.amount || 0,
            status,
            date: transaction.created_at || transaction.date || new Date().toISOString(),
            reference: transaction.order_id || transaction.reference || '',
            message: transaction.message || transaction.msg || '',
            investmentId: transaction.investment_id || transaction.investmentId || null
          };
        });

        setTransactions(mappedData);
        setTotalTransactions(res.total || mappedData.length);
        setTotalPages(Math.ceil((res.total || mappedData.length) / filters.limit));
        
        // Calculate stats
        const statsData = mappedData.reduce((acc, transaction) => {
          acc.total++;
          
          // Count by type
          const type = transaction.type.toLowerCase();
          if (type === 'investment') acc.investment++;
          else if (type === 'withdrawal') acc.withdrawal++;
          else if (type === 'bonus') acc.bonus++;
          
          // Count by status
          if (transaction.status === 'Success') acc.success++;
          else if (transaction.status === 'Pending') acc.pending++;
          else if (transaction.status === 'Failed') acc.failed++;
          
          return acc;
        }, { total: 0, investment: 0, withdrawal: 0, bonus: 0, success: 0, pending: 0, failed: 0 });
        
        setStats(statsData);
      } else {
        setTransactions([]);
        setTotalTransactions(0);
        setTotalPages(1);
        setStats({ total: 0, investment: 0, withdrawal: 0, bonus: 0, success: 0, pending: 0, failed: 0 });
      }
    } catch (error) {
      console.error('Failed to load transactions:', error);
      setTransactions([]);
      setTotalTransactions(0);
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

  const getStatusBadge = (status) => {
    const statusConfig = {
      success: { class: 'bg-green-500/20 text-green-400 border-green-500/30', label: 'Berhasil' },
      pending: { class: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', label: 'Menunggu' },
      failed: { class: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'Gagal' }
    };
    
    const config = statusConfig[status.toLowerCase()] || { class: 'bg-gray-500/20 text-gray-400 border-gray-500/30', label: status };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${config.class}`}>
        {config.label}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const key = (type || '').toLowerCase();
    const typeConfig = {
      investment: { class: 'bg-purple-600/20 text-purple-300 border-purple-500/30', label: 'Investasi', icon: 'mdi:chart-box' },
      withdrawal: { class: 'bg-red-600/20 text-red-300 border-red-500/30', label: 'Penarikan', icon: 'mdi:cash-multiple' },
      return: { class: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', label: 'Profit', icon: 'mdi:cash-refund' },
      team: { class: 'bg-sky-500/20 text-sky-300 border-sky-500/30', label: 'Tim', icon: 'mdi:account-group' },
      bonus: { class: 'bg-green-600/20 text-green-300 border-green-500/30', label: 'Bonus', icon: 'mdi:gift' }
    };

    const config = typeConfig[key] || { class: 'bg-gray-500/20 text-gray-400 border-gray-500/30', label: (type || 'Lainnya'), icon: 'mdi:swap-horizontal' };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${config.class} flex items-center gap-1`}>
        <Icon icon={config.icon} className="w-3 h-3" />
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
            <p className="text-white font-medium text-lg">Memuat Data Transaksi...</p>
            <p className="text-gray-400 text-sm mt-1">Harap tunggu sebentar</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout title="Kelola Transaksi">
      <Head>
        <title>Vla Devs | Kelola Transaksi</title>
        <link rel="icon" type="image/x-icon" href="/vla-logo.png" />
      </Head>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Transaksi" value={stats.total} icon="mdi:swap-horizontal" color="blue" />
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
            <p className="text-gray-400 text-sm">Cari dan filter transaksi berdasarkan kriteria</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          {/* Search */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Pencarian</label>
            <div className="relative">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Cari berdasarkan referensi."
                className="w-full bg-white/10 border border-white/20 text-white rounded-2xl px-4 py-3 pl-12 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all dark-select"
              />
              <Icon icon="mdi:magnify" className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
          </div>

          {/* User ID Filter */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">ID Pengguna</label>
            <input
              type="text"
              value={userIdInput}
              onChange={(e) => setUserIdInput(e.target.value)}
              className="w-full bg-white/10 border border-white/20 text-white rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="Cari berdasarkan ID pengguna"
            />
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Jenis Transaksi</label>
            <select 
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full bg-white/10 border border-white/20 text-white rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all dark-select"
            >
              <option value="all">Semua Jenis</option>
              <option value="investment">Investasi</option>
              <option value="withdrawal">Penarikan</option>
              <option value="return">Profit</option>
              <option value="team">Tim</option>
              <option value="bonus">Bonus</option>
            </select>
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
              <option value="Success">Berhasil</option>
              <option value="Pending">Menunggu</option>
              <option value="Failed">Gagal</option>
            </select>
          </div>

          {/* Date From */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Dari Tanggal</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="w-full bg-white/10 border border-white/20 text-white rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Sampai Tanggal</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="w-full bg-white/10 border border-white/20 text-white rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <button
            onClick={handleSearch}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <Icon icon="mdi:magnify" className="w-5 h-5" />
            Cari Transaksi
          </button>
          <button
            onClick={() => {
              setFilters({ type: 'all', status: 'all', search: '', dateFrom: '', dateTo: '', page: 1, limit: 25 });
              setSearchInput('');
              setUserIdInput('');
            }}
            className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-2xl flex items-center gap-2 transition-all"
          >
            <Icon icon="mdi:refresh" className="w-5 h-5" />
            Reset Filter
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Icon icon="mdi:swap-horizontal" className="text-white w-5 h-5" />
              </div>
              <div>
                <h2 className="text-white font-semibold text-lg">Riwayat Transaksi</h2>
                <p className="text-gray-400 text-sm">{totalTransactions} transaksi ditemukan</p>
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

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="py-4 px-6 text-left text-gray-300 font-medium">Pengguna</th>
                <th className="py-4 px-6 text-left text-gray-300 font-medium">Referensi</th>
                <th className="py-4 px-6 text-left text-gray-300 font-medium">Jumlah</th>
                <th className="py-4 px-6 text-left text-gray-300 font-medium">Jenis</th>
                <th className="py-4 px-6 text-left text-gray-300 font-medium">Status</th>
                <th className="py-4 px-6 text-left text-gray-300 font-medium">Pesan</th>
                <th className="py-4 px-6 text-left text-gray-300 font-medium">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction, index) => (
                <tr key={transaction.id} className={`border-b border-white/5 hover:bg-white/5 transition-all duration-300 ${index % 2 === 0 ? 'bg-white/2' : ''}`}>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
                        <Icon icon="mdi:account" className="text-white w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium text-white text-sm">{transaction.userName}</p>
                        <p className="text-gray-400 text-sm">+62{transaction.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-white font-medium">
                      {transaction.reference || '-'}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-white font-medium">{formatCurrency(transaction.amount)}</div>
                  </td>
                  <td className="py-4 px-6">
                    {getTypeBadge(transaction.type)}
                  </td>
                  <td className="py-4 px-6">
                    {getStatusBadge(transaction.status)}
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-white text-sm">
                      {transaction.message || '-'}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-white text-sm">{formatDate(transaction.date)}</div>
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
              Menampilkan {transactions.length ? ((filters.page - 1) * filters.limit + 1) : 0} sampai{' '}
              {transactions.length ? ((filters.page - 1) * filters.limit + transactions.length) : 0} dari{' '}
              {totalTransactions} transaksi
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
                disabled={transactions.length < filters.limit}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:text-gray-600 text-white rounded-xl transition-all duration-300 disabled:cursor-not-allowed"
              >
                <Icon icon="mdi:chevron-right" className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

// Stats Card Component
function StatCard({ title, value, icon, color }) {
  const colorClasses = {
    blue: { bg: 'from-blue-600 to-cyan-600', text: 'text-blue-400' },
    green: { bg: 'from-green-600 to-emerald-600', text: 'text-green-400' },
    yellow: { bg: 'from-yellow-600 to-orange-600', text: 'text-yellow-400' },
    red: { bg: 'from-red-600 to-pink-600', text: 'text-red-400' },
    purple: { bg: 'from-purple-600 to-pink-600', text: 'text-purple-400' }
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-4 border border-white/10 hover:bg-white/10 hover:scale-105 transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 bg-gradient-to-r ${colorClasses[color].bg} rounded-xl flex items-center justify-center`}>
          <Icon icon={icon} className="w-5 h-5 text-white" />
        </div>
      </div>
      <div>
        <h3 className="text-gray-400 text-xs font-medium mb-1">{title}</h3>
        <div className="text-xl font-bold text-white">{value.toLocaleString('id-ID')}</div>
      </div>
    </div>
  );
}