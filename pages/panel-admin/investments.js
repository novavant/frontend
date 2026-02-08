// pages/admin/investments.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Icon } from '@iconify/react';
import AdminLayout from '../../components/admin/Layout';
import useAdminAuth from '../../lib/auth/useAdminAuth';
import { adminRequest } from '../../utils/admin/api';

export default function InvestmentManagement() {
  const { loading: authLoading } = useAdminAuth();
  const router = useRouter();
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    product: 'all',
    status: 'all',
    page: 1,
    limit: 25
  });
  const [searchInput, setSearchInput] = useState('');
  const [totalInvestments, setTotalInvestments] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedInvestment, setSelectedInvestment] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [actionReason, setActionReason] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    running: 0,
    completed: 0,
    suspended: 0,
    cancelled: 0
  });

  useEffect(() => {
    if (authLoading) return;
    loadInvestments();
  }, [authLoading, filters]);

  const loadInvestments = async () => {
    setLoading(true);
    try {
      const params = [];
      if (filters.page) params.push(`page=${filters.page}`);
      if (filters.limit) params.push(`limit=${filters.limit}`);
      if (filters.status && filters.status !== 'all') params.push(`status=${filters.status}`);
      if (filters.product && filters.product !== 'all') params.push(`product_id=${filters.product}`);
      if (filters.search) params.push(`search=${encodeURIComponent(filters.search)}`);
      
      const query = params.length ? `?${params.join('&')}` : '';
      const res = await adminRequest(`/investments${query}`, { method: 'GET' });
      
      if (res && res.success && Array.isArray(res.data)) {
        const mappedData = res.data.map(investment => ({
          ...investment,
          userName: investment.user_name || investment.username || `User ${investment.user_id}`,
          productName: investment.product_name || investment.product || investment.product_id || 'Unknown Product'
        }));
        
        setInvestments(mappedData);
        setTotalInvestments(res.total || mappedData.length);
        setTotalPages(Math.ceil((res.total || mappedData.length) / filters.limit));
        
        // Calculate stats
        const statsData = mappedData.reduce((acc, investment) => {
          acc.total++;
          const status = investment.status.toLowerCase();
          if (acc[status] !== undefined) acc[status]++;
          return acc;
        }, { total: 0, pending: 0, running: 0, completed: 0, suspended: 0, cancelled: 0 });
        setStats(statsData);
      } else {
        setInvestments([]);
        setTotalInvestments(0);
        setTotalPages(1);
        setStats({ total: 0, pending: 0, running: 0, completed: 0, suspended: 0, cancelled: 0 });
      }
    } catch (error) {
      console.error('Failed to load investments:', error);
      setInvestments([]);
      setTotalInvestments(0);
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

  const handleAction = (investment, type) => {
    setSelectedInvestment(investment);
    setActionType(type);
    setActionReason('');
    setShowActionModal(true);
  };

  const confirmAction = async () => {
    if (!selectedInvestment) return;
    
    try {
      const statusMap = {
        approve: 'Running',
        reject: 'Cancelled',
        suspend: 'Suspended',
        reactivate: 'Running',
        cancel: 'Cancelled',
        complete: 'Completed'
      };
      
      const newStatus = statusMap[actionType];
      const res = await adminRequest(`/investments/${selectedInvestment.id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ 
          status: newStatus,
          reason: actionReason || undefined 
        })
      });
      
      if (res && res.success) {
        loadInvestments(); // Reload data
        setShowActionModal(false);
        setActionReason('');
      }
    } catch (error) {
      console.error('Failed to process investment action:', error);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { class: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', label: 'Menunggu' },
      running: { class: 'bg-green-500/20 text-green-400 border-green-500/30', label: 'Berjalan' },
      completed: { class: 'bg-blue-500/20 text-blue-400 border-blue-500/30', label: 'Selesai' },
      suspended: { class: 'bg-orange-500/20 text-orange-400 border-orange-500/30', label: 'Ditangguhkan' },
      cancelled: { class: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'Dibatalkan' },
      rejected: { class: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'Ditolak' }
    };
    
    const config = statusConfig[status.toLowerCase()] || statusConfig.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${config.class}`}>
        {config.label}
      </span>
    );
  };

  const getAvailableActions = (investment) => {
    const actionMap = {
      pending: [
        { type: 'approve', label: 'Setujui', icon: 'mdi:check', color: 'text-green-400' },
        { type: 'reject', label: 'Tolak', icon: 'mdi:close', color: 'text-red-400' }
      ],
      running: [
        { type: 'suspend', label: 'Tangguhkan', icon: 'mdi:pause', color: 'text-orange-400' },
        { type: 'complete', label: 'Selesaikan', icon: 'mdi:check-all', color: 'text-blue-400' },
        { type: 'cancel', label: 'Batalkan', icon: 'mdi:cancel', color: 'text-red-400' }
      ],
      suspended: [
        { type: 'reactivate', label: 'Aktifkan', icon: 'mdi:play', color: 'text-green-400' },
        { type: 'cancel', label: 'Batalkan', icon: 'mdi:cancel', color: 'text-red-400' }
      ],
      completed: [],
      cancelled: [],
      rejected: []
    };
    
    return actionMap[investment.status.toLowerCase()] || [];
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
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
            <p className="text-white font-medium text-lg">Memuat Data Investasi...</p>
            <p className="text-gray-400 text-sm mt-1">Harap tunggu sebentar</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout title="Kelola Investasi">
      <Head>
        <title>Vla Devs | Kelola Investasi</title>
        <link rel="icon" type="image/x-icon" href="/vla-logo.png" />
      </Head>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        <StatCard title="Total Investasi" value={stats.total} icon="mdi:chart-box" color="blue" />
        <StatCard title="Menunggu" value={stats.pending} icon="mdi:clock-alert" color="yellow" />
        <StatCard title="Berjalan" value={stats.running} icon="mdi:play-circle" color="green" />
        <StatCard title="Selesai" value={stats.completed} icon="mdi:check-circle" color="cyan" />
        <StatCard title="Ditangguhkan" value={stats.suspended} icon="mdi:pause-circle" color="orange" />
        <StatCard title="Dibatalkan" value={stats.cancelled} icon="mdi:cancel" color="red" />
      </div>

      {/* Filter Section */}
      <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
            <Icon icon="mdi:filter-variant" className="text-white w-5 h-5" />
          </div>
          <div>
            <h2 className="text-white font-semibold text-lg">Filter & Pencarian</h2>
            <p className="text-gray-400 text-sm">Cari dan filter investasi berdasarkan kriteria</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-sm text-gray-400 mb-2">Pencarian</label>
            <div className="relative">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Cari berdasarkan Order ID..."
                className="w-full bg-white/10 border border-white/20 text-white rounded-2xl px-4 py-3 pl-12 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all dark-select"
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
              <option value="pending">Menunggu</option>
              <option value="running">Berjalan</option>
              <option value="completed">Selesai</option>
              <option value="suspended">Ditangguhkan</option>
              <option value="cancelled">Dibatalkan</option>
            </select>
          </div>

          {/* Product Filter */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Produk</label>
            <select 
              value={filters.product}
              onChange={(e) => handleFilterChange('product', e.target.value)}
              className="w-full bg-white/10 border border-white/20 text-white rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all dark-select"
            >
              <option value="all">Semua Produk</option>
              <option value="1">Bintang 1</option>
              <option value="2">Bintang 2</option>
              <option value="3">Bintang 3</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <button
            onClick={handleSearch}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <Icon icon="mdi:magnify" className="w-5 h-5" />
            Cari Investasi
          </button>
          <button
            onClick={() => {
              setFilters({ search: '', product: 'all', status: 'all', page: 1, limit: 25 });
              setSearchInput('');
            }}
            className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-2xl flex items-center gap-2 transition-all"
          >
            <Icon icon="mdi:refresh" className="w-5 h-5" />
            Reset Filter
          </button>
        </div>
      </div>

      {/* Investments Table */}
      <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                <Icon icon="mdi:chart-box" className="text-white w-5 h-5" />
              </div>
              <div>
                <h2 className="text-white font-semibold text-lg">Portfolio Investasi</h2>
                <p className="text-gray-400 text-sm">{totalInvestments} investasi ditemukan</p>
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
                <th className="py-4 px-6 text-left text-gray-300 font-medium">Order ID</th>
                <th className="py-4 px-6 text-left text-gray-300 font-medium">Produk</th>
                <th className="py-4 px-6 text-left text-gray-300 font-medium">Jumlah</th>
                <th className="py-4 px-6 text-left text-gray-300 font-medium">Durasi</th>
                <th className="py-4 px-6 text-left text-gray-300 font-medium">Status</th>
                <th className="py-4 px-6 text-left text-gray-300 font-medium">Tanggal</th>
                <th className="py-4 px-6 text-center text-gray-300 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {investments.map((investment, index) => (
                <tr key={investment.id} className={`border-b border-white/5 hover:bg-white/5 transition-all duration-300 ${index % 2 === 0 ? 'bg-white/2' : ''}`}>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
                        <Icon icon="mdi:account" className="text-white w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{investment.userName}</p>
                        <p className="text-gray-400 text-sm">+62{investment.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-white font-medium">{investment.order_id}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-white font-medium">{investment.productName}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-white font-medium">{formatCurrency(investment.amount)}</div>
                    {investment.current_value && (
                      <div className="text-green-400 text-sm">
                        Current: {formatCurrency(investment.current_value)}
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-white">{investment.duration} hari</div>
                    {investment.end_date && (
                      <div className="text-gray-400 text-sm">
                        Berakhir: {new Date(investment.end_date).toLocaleDateString('id-ID')}
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    {getStatusBadge(investment.status)}
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-white text-sm">{formatDate(investment.created_at)}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => router.push(`/panel-admin/investments/${investment.id}`)}
                        className="p-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-xl transition-all duration-300 hover:scale-110"
                        title="Lihat Detail"
                      >
                        <Icon icon="mdi:eye" className="w-4 h-4" />
                      </button>
                      {getAvailableActions(investment).map((action) => (
                        <button
                          key={action.type}
                          onClick={() => handleAction(investment, action.type)}
                          className={`p-2 rounded-xl transition-all duration-300 hover:scale-110 ${action.color} bg-current bg-opacity-20 hover:bg-opacity-30`}
                          title={action.label}
                        >
                          <Icon icon={action.icon} className="w-4 h-4 text-white" />
                        </button>
                      ))}
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
              Menampilkan {investments.length ? ((filters.page - 1) * filters.limit + 1) : 0} sampai{' '}
              {investments.length ? ((filters.page - 1) * filters.limit + investments.length) : 0} dari{' '}
              {totalInvestments} investasi
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
                disabled={investments.length < filters.limit}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:text-gray-600 text-white rounded-xl transition-all duration-300 disabled:cursor-not-allowed"
              >
                <Icon icon="mdi:chevron-right" className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Action Confirmation Modal */}
      {showActionModal && selectedInvestment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900/95 backdrop-blur-xl rounded-3xl w-full max-w-md border border-white/20 shadow-2xl">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  actionType === 'approve' || actionType === 'reactivate' 
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600' 
                    : actionType === 'reject' || actionType === 'cancel'
                    ? 'bg-gradient-to-r from-red-600 to-pink-600'
                    : 'bg-gradient-to-r from-orange-600 to-yellow-600'
                }`}>
                  <Icon 
                    icon={
                      actionType === 'approve' ? 'mdi:check' :
                      actionType === 'reject' ? 'mdi:close' :
                      actionType === 'suspend' ? 'mdi:pause' :
                      actionType === 'reactivate' ? 'mdi:play' :
                      actionType === 'complete' ? 'mdi:check-all' :
                      'mdi:cancel'
                    } 
                    className="text-white w-5 h-5" 
                  />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">
                    Konfirmasi {
                      actionType === 'approve' ? 'Persetujuan' :
                      actionType === 'reject' ? 'Penolakan' :
                      actionType === 'suspend' ? 'Penangguhan' :
                      actionType === 'reactivate' ? 'Reaktivasi' :
                      actionType === 'complete' ? 'Penyelesaian' :
                      'Pembatalan'
                    }
                  </h3>
                  <p className="text-gray-400 text-sm">Tindakan ini akan mengubah status investasi</p>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-2xl p-4 mb-6">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Pengguna:</span>
                    <span className="text-white font-medium">{selectedInvestment.userName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Produk:</span>
                    <span className="text-white font-medium">{selectedInvestment.productName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Jumlah:</span>
                    <span className="text-white font-medium">{formatCurrency(selectedInvestment.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Order ID:</span>
                    <span className="text-white font-medium font-mono">{selectedInvestment.order_id}</span>
                  </div>
                </div>
              </div>

              {(actionType === 'reject' || actionType === 'suspend' || actionType === 'cancel') && (
                <div className="mb-6">
                  <label className="block text-gray-400 text-sm mb-2">
                    Alasan {
                      actionType === 'reject' ? 'Penolakan' :
                      actionType === 'suspend' ? 'Penangguhan' :
                      'Pembatalan'
                    }
                  </label>
                  <textarea
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                    placeholder={`Masukkan alasan ${actionType}...`}
                    className="w-full bg-white/10 border border-white/20 text-white rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all min-h-[80px] resize-none"
                  />
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
                  disabled={(actionType === 'reject' || actionType === 'suspend' || actionType === 'cancel') && !actionReason.trim()}
                  className={`flex-1 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95 disabled:scale-100 disabled:opacity-50 disabled:cursor-not-allowed ${
                    actionType === 'approve' || actionType === 'reactivate' 
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700' 
                      : actionType === 'reject' || actionType === 'cancel'
                      ? 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700'
                      : 'bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700'
                  } text-white`}
                >
                  <Icon 
                    icon={
                      actionType === 'approve' ? 'mdi:check' :
                      actionType === 'reject' ? 'mdi:close' :
                      actionType === 'suspend' ? 'mdi:pause' :
                      actionType === 'reactivate' ? 'mdi:play' :
                      actionType === 'complete' ? 'mdi:check-all' :
                      'mdi:cancel'
                    } 
                    className="w-4 h-4" 
                  />
                  Konfirmasi {
                    actionType === 'approve' ? 'Setuju' :
                    actionType === 'reject' ? 'Tolak' :
                    actionType === 'suspend' ? 'Tangguhkan' :
                    actionType === 'reactivate' ? 'Aktifkan' :
                    actionType === 'complete' ? 'Selesaikan' :
                    'Batalkan'
                  }
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
    red: { bg: 'from-red-600 to-pink-600', text: 'text-red-400' },
    orange: { bg: 'from-orange-600 to-red-600', text: 'text-orange-400' },
    cyan: { bg: 'from-cyan-600 to-blue-600', text: 'text-cyan-400' }
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