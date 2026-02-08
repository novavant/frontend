// pages/admin/investments/[id].js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Icon } from '@iconify/react';
import AdminLayout from '../../../components/admin/Layout';
import { adminRequest } from '../../../utils/admin/api';

export default function InvestmentDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [investment, setInvestment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusReason, setStatusReason] = useState('');

  useEffect(() => {
    if (!id) return;
    loadInvestmentDetail();
  }, [id]);

  const loadInvestmentDetail = async () => {
    setLoading(true);
    try {
      const res = await adminRequest(`/investments/${id}`, { method: 'GET' });
      if (res && res.success) {
        let investmentData;
        if (Array.isArray(res.data) && res.data.length > 0) {
          investmentData = res.data[0];
        } else if (res.data && typeof res.data === 'object') {
          investmentData = res.data;
        } else {
          throw new Error('Investment not found');
        }

        // Map the data to ensure consistent field names
        setInvestment({
          ...investmentData,
          userName: investmentData.user_name || investmentData.username || `User ${investmentData.user_id}`,
          productName: investmentData.product_name || investmentData.product || investmentData.product_id || 'Unknown Product',
          userPhone: investmentData.user_phone || investmentData.phone || '',
          userEmail: investmentData.user_email || investmentData.email || ''
        });
      } else {
        setError(res?.message || 'Investment not found');
      }
    } catch (err) {
      console.error('Failed to load investment detail:', err);
      setError(err?.message || 'Failed to load investment detail');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (newStatus) => {
    setSelectedStatus(newStatus);
    setStatusReason('');
    setShowStatusModal(true);
  };

  const confirmStatusChange = async () => {
    if (!investment) return;
    
    setStatusLoading(true);
    try {
      const res = await adminRequest(`/investments/${investment.id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ 
          status: selectedStatus,
          reason: statusReason || undefined
        })
      });
      
      if (res && res.success) {
        setInvestment(prev => ({
          ...prev,
          status: res.data?.status || selectedStatus
        }));
        setShowStatusModal(false);
        setStatusReason('');
      } else {
        setError(res?.message || 'Failed to update status');
      }
    } catch (err) {
      setError(err?.message || 'Failed to update status');
    } finally {
      setStatusLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const statusConfigs = {
      pending: { 
        class: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', 
        label: 'Menunggu',
        icon: 'mdi:clock-alert'
      },
      running: { 
        class: 'bg-green-500/20 text-green-400 border-green-500/30', 
        label: 'Berjalan',
        icon: 'mdi:play-circle'
      },
      completed: { 
        class: 'bg-blue-500/20 text-blue-400 border-blue-500/30', 
        label: 'Selesai',
        icon: 'mdi:check-circle'
      },
      suspended: { 
        class: 'bg-orange-500/20 text-orange-400 border-orange-500/30', 
        label: 'Ditangguhkan',
        icon: 'mdi:pause-circle'
      },
      cancelled: { 
        class: 'bg-red-500/20 text-red-400 border-red-500/30', 
        label: 'Dibatalkan',
        icon: 'mdi:cancel'
      },
      rejected: { 
        class: 'bg-red-500/20 text-red-400 border-red-500/30', 
        label: 'Ditolak',
        icon: 'mdi:close-circle'
      }
    };
    
    return statusConfigs[status?.toLowerCase()] || statusConfigs.pending;
  };

  const getAvailableStatusActions = (currentStatus) => {
    const actions = {
      pending: [
        { value: 'Running', label: 'Setujui', icon: 'mdi:check', color: 'green' },
        { value: 'Cancelled', label: 'Tolak', icon: 'mdi:close', color: 'red' }
      ],
      running: [
        { value: 'Suspended', label: 'Tangguhkan', icon: 'mdi:pause', color: 'orange' },
        { value: 'Completed', label: 'Selesaikan', icon: 'mdi:check-all', color: 'blue' },
        { value: 'Cancelled', label: 'Batalkan', icon: 'mdi:cancel', color: 'red' }
      ],
      suspended: [
        { value: 'Running', label: 'Aktifkan Kembali', icon: 'mdi:play', color: 'green' },
        { value: 'Cancelled', label: 'Batalkan', icon: 'mdi:cancel', color: 'red' }
      ],
      completed: [],
      cancelled: [],
      rejected: []
    };
    
    return actions[currentStatus?.toLowerCase()] || [];
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
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateReturn = (amount, investamount) => {
    if (!amount || !investamount) return 0;
    return (amount + investamount);
  };

  const calculateProfit = (amount, percentage) => {
    if (!amount || !percentage) return 0;
    return (amount * percentage) / 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-400/30 border-t-purple-400 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-pink-400 rounded-full animate-spin animation-delay-150"></div>
          </div>
          <div className="mt-6 text-center">
            <p className="text-white font-medium text-lg">Memuat Detail Investasi...</p>
            <p className="text-gray-400 text-sm mt-1">Harap tunggu sebentar</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !investment) {
    return (
      <AdminLayout title="Detail Investasi">
        <div className="flex flex-col items-center justify-center min-h-96">
          <Icon icon="mdi:alert-circle" className="w-16 h-16 text-red-400 mb-4" />
          <h3 className="text-white text-xl font-semibold mb-2">Investasi Tidak Ditemukan</h3>
          <p className="text-gray-400 text-center mb-6">{error || 'Investasi dengan ID tersebut tidak ada atau telah dihapus.'}</p>
          <button 
            onClick={() => router.push('/panel-admin/investments')}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors"
          >
            Kembali ke Daftar Investasi
          </button>
        </div>
      </AdminLayout>
    );
  }

  const statusConfig = getStatusConfig(investment.status);
  const availableActions = getAvailableStatusActions(investment.status);

  return (
    <AdminLayout title={`Detail Investasi #${investment.id}`}>
      <Head>
        <title>Vla Devs | Detail Investasi #{investment.order_id}</title>
        <link rel="icon" type="image/x-icon" href="/vla-logo.png" />
      </Head>

      {/* Header */}
      <div className="mb-8">
        <button 
          onClick={() => router.push('/panel-admin/investments')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
        >
          <Icon icon="mdi:arrow-left" className="w-5 h-5" />
          Kembali ke Daftar Investasi
        </button>
        
        <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 backdrop-blur-xl rounded-3xl p-6 border border-green-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center">
                <Icon icon="mdi:chart-box" className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-white text-2xl font-bold">Investasi #{investment.id}</h1>
                <p className="text-gray-300">{investment.order_id}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusConfig.class}`}>
                    <Icon icon={statusConfig.icon} className="w-4 h-4 inline mr-1" />
                    {statusConfig.label}
                  </span>
                </div>
              </div>
            </div>
            
            {availableActions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {availableActions.map((action) => (
                  <button
                    key={action.value}
                    onClick={() => handleStatusChange(action.value)}
                    className={`px-4 py-2 rounded-xl text-white transition-all duration-300 hover:scale-105 active:scale-95 ${
                      action.color === 'green' ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700' :
                      action.color === 'red' ? 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700' :
                      action.color === 'orange' ? 'bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700' :
                      'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'
                    }`}
                  >
                    <Icon icon={action.icon} className="w-4 h-4 inline mr-2 text-white" />
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-8">
          {/* User Information */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
                <Icon icon="mdi:account" className="text-white w-5 h-5" />
              </div>
              <div>
                <h2 className="text-white font-semibold text-lg">Informasi Pengguna</h2>
                <p className="text-gray-400 text-sm">Data pemilik investasi</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Nama Lengkap</label>
                <div className="bg-white/5 rounded-2xl px-4 py-3 text-white font-medium">
                  {investment.userName}
                </div>
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-2">User ID</label>
                <div className="bg-white/5 rounded-2xl px-4 py-3 text-white font-medium">
                  #{investment.user_id}
                </div>
              </div>
              
              {investment.userPhone && (
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Nomor Telepon</label>
                  <div className="bg-white/5 rounded-2xl px-4 py-3 text-white font-medium">
                    +62{investment.userPhone}
                  </div>
                </div>
              )}
              
              {investment.userEmail && (
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Email</label>
                  <div className="bg-white/5 rounded-2xl px-4 py-3 text-white font-medium">
                    {investment.userEmail}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Investment Details */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                <Icon icon="mdi:file-document" className="text-white w-5 h-5" />
              </div>
              <div>
                <h2 className="text-white font-semibold text-lg">Detail Investasi</h2>
                <p className="text-gray-400 text-sm">Informasi lengkap investasi</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Nama Produk</label>
                <div className="bg-white/5 rounded-2xl px-4 py-3 text-white font-medium">
                  {investment.productName}
                </div>
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-2">Product ID</label>
                <div className="bg-white/5 rounded-2xl px-4 py-3 text-white font-medium">
                  #{investment.product_id}
                </div>
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-2">Jumlah Investasi</label>
                <div className="bg-white/5 rounded-2xl px-4 py-3 text-white font-medium">
                  {formatCurrency(investment.amount)}
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Durasi</label>
                <div className="bg-white/5 rounded-2xl px-4 py-3 text-white font-medium">
                  {investment.duration} hari
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Persentase Harian</label>
                <div className="bg-white/5 rounded-2xl px-4 py-3 text-green-400 font-medium">
                  {Math.ceil((investment.percentage * 2) / investment.duration)}%
                </div>
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-2">Persentase Return</label>
                <div className="bg-white/5 rounded-2xl px-4 py-3 text-green-400 font-medium">
                  {investment.percentage}%
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Estimasi Harian</label>
                <div className="bg-white/5 rounded-2xl px-4 py-3 text-green-400 font-medium">
                  {formatCurrency(investment.daily_profit)}
                </div>
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-2">Estimasi Keuntungan</label>
                <div className="bg-white/5 rounded-2xl px-4 py-3 text-green-400 font-medium">
                  {formatCurrency(calculateProfit(investment.amount, investment.percentage))}
                </div>
              </div>
            </div>
          </div>

          {/* Dates & Timeline */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Icon icon="mdi:calendar-clock" className="text-white w-5 h-5" />
              </div>
              <div>
                <h2 className="text-white font-semibold text-lg">Timeline Investasi</h2>
                <p className="text-gray-400 text-sm">Tanggal penting investasi</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600/20 rounded-xl flex items-center justify-center">
                    <Icon icon="mdi:calendar-plus" className="text-blue-400 w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Tanggal Dibuat</p>
                    <p className="text-gray-400 text-sm">Waktu investasi dibuat</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white">{formatDate(investment.created_at)}</p>
                </div>
              </div>

              {investment.start_date && (
                <div className="flex items-center justify-between py-3 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-600/20 rounded-xl flex items-center justify-center">
                      <Icon icon="mdi:play-circle" className="text-green-400 w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Tanggal Mulai</p>
                      <p className="text-gray-400 text-sm">Investasi mulai berjalan</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white">{formatDate(investment.start_date)}</p>
                  </div>
                </div>
              )}

              {investment.end_date && (
                <div className="flex items-center justify-between py-3 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-600/20 rounded-xl flex items-center justify-center">
                      <Icon icon="mdi:calendar-check" className="text-purple-400 w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Tanggal Berakhir</p>
                      <p className="text-gray-400 text-sm">Target selesai investasi</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white">{formatDate(investment.end_date)}</p>
                  </div>
                </div>
              )}

              {investment.updated_at && (
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-600/20 rounded-xl flex items-center justify-center">
                      <Icon icon="mdi:update" className="text-orange-400 w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Terakhir Update</p>
                      <p className="text-gray-400 text-sm">Status terakhir diubah</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white">{formatDate(investment.updated_at)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Investment Summary */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                <Icon icon="mdi:chart-line" className="text-white w-5 h-5" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Ringkasan</h3>
                <p className="text-gray-400 text-sm">Informasi cepat</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-600/10 to-cyan-600/10 rounded-2xl p-4 border border-blue-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Jumlah Investasi</span>
                  <Icon icon="mdi:wallet" className="text-blue-400 w-4 h-4" />
                </div>
                <div className="text-white font-bold text-lg">
                  {formatCurrency(investment.amount)}
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-600/10 to-emerald-600/10 rounded-2xl p-4 border border-green-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Estimasi Keuntungan</span>
                  <Icon icon="mdi:trending-up" className="text-green-400 w-4 h-4" />
                </div>
                <div className="text-green-400 font-bold text-lg">
                  {formatCurrency(calculateProfit(investment.amount, investment.percentage))}
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-2xl p-4 border border-purple-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Total Pengembalian</span>
                  <Icon icon="mdi:calculator" className="text-purple-400 w-4 h-4" />
                </div>
                <div className="text-purple-400 font-bold text-lg">
                  {formatCurrency(calculateReturn(calculateProfit(investment.amount, investment.percentage), investment.amount))}
                </div>
              </div>
            </div>
          </div>

          {/* Status History - if available */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl flex items-center justify-center">
                <Icon icon="mdi:history" className="text-white w-5 h-5" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Status Saat Ini</h3>
                <p className="text-gray-400 text-sm">Informasi status investasi</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className={`p-4 rounded-2xl border ${statusConfig.class}`}>
                <div className="flex items-center gap-3">
                  <Icon icon={statusConfig.icon} className="w-6 h-6" />
                  <div>
                    <p className="font-semibold">{statusConfig.label}</p>
                    <p className="text-xs opacity-75">Status aktif investasi</p>
                  </div>
                </div>
              </div>
              
              <div className="text-center pt-4">
                <p className="text-gray-400 text-sm">ID Investasi</p>
                <p className="text-white font-mono text-lg">#{investment.id}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          {availableActions.length > 0 && (
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                  <Icon icon="mdi:lightning-bolt" className="text-white w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Aksi Cepat</h3>
                  <p className="text-gray-400 text-sm">Ubah status investasi</p>
                </div>
              </div>

              <div className="space-y-3">
                {availableActions.map((action) => (
                  <button
                    key={action.value}
                    onClick={() => handleStatusChange(action.value)}
                    className={`w-full p-4 rounded-2xl flex items-center gap-3 transition-all duration-300 hover:scale-105 active:scale-95 ${
                      action.color === 'green' ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700' :
                      action.color === 'red' ? 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700' :
                      action.color === 'orange' ? 'bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700' :
                      'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'
                    } text-white`}
                  >
                    <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                      <Icon icon={action.icon} className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{action.label}</div>
                      <div className="text-xs opacity-75">Ubah status ke {action.value}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Additional Info */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-gray-600 to-slate-600 rounded-xl flex items-center justify-center">
                <Icon icon="mdi:information" className="text-white w-5 h-5" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Informasi Tambahan</h3>
                <p className="text-gray-400 text-sm">Data sistem</p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-gray-400">Investment ID</span>
                <span className="text-white font-medium">#{investment.id}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-gray-400">Order ID</span>
                <span className="text-white font-medium font-mono">{investment.order_id}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-gray-400">User ID</span>
                <span className="text-white font-medium">#{investment.user_id}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-400">Product ID</span>
                <span className="text-white font-medium">#{investment.product_id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Change Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900/95 backdrop-blur-xl rounded-3xl w-full max-w-md border border-white/20 shadow-2xl">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  selectedStatus === 'Running' 
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600' 
                    : selectedStatus === 'Cancelled'
                    ? 'bg-gradient-to-r from-red-600 to-pink-600'
                    : selectedStatus === 'Suspended'
                    ? 'bg-gradient-to-r from-orange-600 to-yellow-600'
                    : 'bg-gradient-to-r from-blue-600 to-cyan-600'
                }`}>
                  <Icon 
                    icon={
                      selectedStatus === 'Running' ? 'mdi:play' :
                      selectedStatus === 'Cancelled' ? 'mdi:cancel' :
                      selectedStatus === 'Suspended' ? 'mdi:pause' :
                      'mdi:check-all'
                    } 
                    className="text-white w-5 h-5" 
                  />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">Konfirmasi Perubahan Status</h3>
                  <p className="text-gray-400 text-sm">Ubah status investasi ke {selectedStatus}</p>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-2xl p-4 mb-6">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Investasi ID:</span>
                    <span className="text-white font-medium">#{investment.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Pengguna:</span>
                    <span className="text-white font-medium">{investment.userName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Jumlah:</span>
                    <span className="text-white font-medium">{formatCurrency(investment.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status Saat Ini:</span>
                    <span className={`font-medium ${getStatusConfig(investment.status).class.split(' ')[1]}`}>
                      {getStatusConfig(investment.status).label}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status Baru:</span>
                    <span className={`font-medium ${getStatusConfig(selectedStatus).class.split(' ')[1]}`}>
                      {getStatusConfig(selectedStatus).label}
                    </span>
                  </div>
                </div>
              </div>

              {(selectedStatus === 'Cancelled' || selectedStatus === 'Suspended') && (
                <div className="mb-6">
                  <label className="block text-gray-400 text-sm mb-2">
                    Alasan {selectedStatus === 'Cancelled' ? 'Pembatalan' : 'Penangguhan'}
                  </label>
                  <textarea
                    value={statusReason}
                    onChange={(e) => setStatusReason(e.target.value)}
                    placeholder={`Masukkan alasan ${selectedStatus === 'Cancelled' ? 'pembatalan' : 'penangguhan'}...`}
                    className="w-full bg-white/10 border border-white/20 text-white rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all min-h-[80px] resize-none"
                  />
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-2xl flex items-center justify-center gap-2 transition-all"
                >
                  <Icon icon="mdi:close" className="w-4 h-4" />
                  Batal
                </button>
                <button
                  onClick={confirmStatusChange}
                  disabled={statusLoading || ((selectedStatus === 'Cancelled' || selectedStatus === 'Suspended') && !statusReason.trim())}
                  className={`flex-1 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95 disabled:scale-100 disabled:opacity-50 disabled:cursor-not-allowed ${
                    selectedStatus === 'Running' 
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700' 
                      : selectedStatus === 'Cancelled'
                      ? 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700'
                      : selectedStatus === 'Suspended'
                      ? 'bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700'
                      : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'
                  } text-white`}
                >
                  {statusLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <Icon 
                      icon={
                        selectedStatus === 'Running' ? 'mdi:play' :
                        selectedStatus === 'Cancelled' ? 'mdi:cancel' :
                        selectedStatus === 'Suspended' ? 'mdi:pause' :
                        'mdi:check-all'
                      } 
                      className="w-4 h-4" 
                    />
                  )}
                  {statusLoading ? 'Memproses...' : 'Konfirmasi'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}