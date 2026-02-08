// pages/history/investment.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Icon } from '@iconify/react';
import { getInvestmentHistory } from '../../utils/api';
import BottomNavbar from '../../components/BottomNavbar';

export default function RiwayatDeposit() {
  const router = useRouter();
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalInvestments, setTotalInvestments] = useState(0);
  const [applicationData, setApplicationData] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = sessionStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchInvestmentHistory();
    const storedApplication = localStorage.getItem('application');
    if (storedApplication) {
      try { setApplicationData(JSON.parse(storedApplication)); } catch (e) { }
    }
  }, [router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchInvestmentHistory();
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) { }
  }, [page, debouncedSearchTerm]);

  const fetchInvestmentHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = {
        limit: 10,
        page,
        ...(debouncedSearchTerm && { search: debouncedSearchTerm })
      };

      const res = await getInvestmentHistory(queryParams);
      if (res.success && res.data) {
        const responseData = res.data.data || res.data;
        const fetchedInvestments = Array.isArray(responseData.data)
          ? responseData.data
          : (Array.isArray(responseData.investments)
            ? responseData.investments
            : (Array.isArray(responseData) ? responseData : []));

        setInvestments(fetchedInvestments);

        const pagination = res.data.pagination || {};
        if (pagination.total_rows !== undefined) {
          setTotalInvestments(pagination.total_rows || 0);
          setTotalPages(pagination.total_pages || Math.max(1, Math.ceil((pagination.total_rows || 0) / limit)));
        } else {
          setTotalInvestments(fetchedInvestments.length);
          setTotalPages(Math.max(1, Math.ceil(fetchedInvestments.length / limit)));
        }
      } else {
        setInvestments([]);
        setTotalInvestments(0);
        setTotalPages(1);
        setError(res.message || 'Gagal memuat riwayat investasi');
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan. Silakan coba lagi.');
      setInvestments([]);
      setTotalInvestments(0);
      setTotalPages(1);
    }
    setLoading(false);
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('id-ID').format(amount);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }).format(date);
  };

  const getStatusConfig = (status, expired_at) => {
    if (status === 'Pending' && expired_at) {
      const diff = (new Date(expired_at).getTime() - Date.now()) / 1000;
      if (diff < 0) return { bg: 'bg-slate-600/20', text: 'text-slate-400', label: 'Kadaluarsa', icon: 'mdi:timer-off' };
    }
    const configs = {
      'Success': { bg: 'bg-green-600/20', text: 'text-green-400', label: 'Berhasil', icon: 'mdi:check-circle' },
      'Completed': { bg: 'bg-green-600/20', text: 'text-green-400', label: 'Berhasil', icon: 'mdi:check-circle' },
      'Running': { bg: 'bg-green-600/20', text: 'text-green-400', label: 'Berjalan', icon: 'mdi:play-circle' },
      'Pending': { bg: 'bg-yellow-600/20', text: 'text-yellow-400', label: 'Menunggu', icon: 'mdi:clock-outline' },
      'Failed': { bg: 'bg-red-600/20', text: 'text-red-400', label: 'Gagal', icon: 'mdi:close-circle' },
      'Expired': { bg: 'bg-slate-600/20', text: 'text-slate-400', label: 'Kadaluarsa', icon: 'mdi:timer-off' }
    };
    return configs[status] || configs['Pending'];
  };

  const shouldShowPayButton = (status, expired_at) => {
    if (status === 'Pending' && expired_at) {
      const diff = (new Date(expired_at).getTime() - Date.now()) / 1000;
      return diff > 0;
    }
    return false;
  };

  const totalInvested = investments.filter(inv => ['Success'].includes(inv.status)).reduce((sum, inv) => sum + (inv.amount || 0), 0);

  return (
    <div className="min-h-screen bg-slate-900 pb-36">
      <Head>
        <title>{applicationData?.name || 'Nova Vant'} | Riwayat Investasi</title>
      </Head>

      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-slate-900/90 border-b border-slate-800">
        <div className="max-w-md mx-auto px-5 py-4 flex items-center gap-4">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center hover:bg-slate-700">
            <Icon icon="mdi:arrow-left" className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-lg font-bold text-white">Riwayat Investasi</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-5 pt-6">
        {/* Stats Banner */}
        <div className="bg-gradient-to-br from-amber-600 via-amber-700 to-orange-800 rounded-2xl p-5 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-amber-200 text-sm mb-1">Total Investasi Berhasil</p>
                <p className="text-3xl font-black text-white">Rp {formatCurrency(totalInvested)}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Icon icon="mdi:chart-line" className="w-7 h-7 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-amber-200 text-sm">
              <Icon icon="mdi:counter" className="w-4 h-4" />
              <span>{totalInvestments} transaksi</span>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Icon icon="mdi:magnify" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari berdasarkan Order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl pl-11 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-slate-500"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                <Icon icon="mdi:close" className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-900/30 border border-red-700/50 rounded-xl p-4 mb-4 flex items-start gap-3">
            <Icon icon="mdi:alert-circle" className="w-5 h-5 text-red-400 flex-shrink-0" />
            <span className="text-red-300 text-sm">{error}</span>
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-12 h-12 border-3 border-slate-700 border-t-amber-500 rounded-full animate-spin mb-4" />
            <p className="text-slate-400">Memuat riwayat...</p>
          </div>
        ) : investments.length === 0 && !error ? (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center mx-auto mb-4">
              <Icon icon="mdi:chart-line" className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-white font-bold mb-2">Belum Ada Investasi</h3>
            <p className="text-slate-400 text-sm">Mulai berinvestasi untuk melihat riwayat</p>
          </div>
        ) : (
          <div className="space-y-3">
            {investments.map((inv) => {
              const statusConfig = getStatusConfig(inv.status, inv.expired_at);
              const showPay = shouldShowPayButton(inv.status, inv.expired_at);
              return (
                <div key={inv.id || inv.order_id} className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden hover:border-slate-600 transition-all">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 bg-slate-700/30 border-b border-slate-700/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center">
                        <Icon icon="mdi:chart-line" className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white truncate max-w-[150px]">{inv.product || 'Paket Investasi'}</p>
                        <p className="text-xs text-slate-500">#{inv.order_id}</p>
                      </div>
                    </div>
                    <div className={`px-2.5 py-1 rounded-lg ${statusConfig.bg} flex items-center gap-1.5`}>
                      <Icon icon={statusConfig.icon} className={`w-3.5 h-3.5 ${statusConfig.text}`} />
                      <span className={`text-xs font-semibold ${statusConfig.text}`}>{statusConfig.label}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="mb-3">
                      <p className="text-xs text-slate-500 mb-1">Jumlah Investasi</p>
                      <p className="text-2xl font-bold text-white">Rp {formatCurrency(inv.amount || 0)}</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
                      <Icon icon="mdi:calendar-clock" className="w-3.5 h-3.5" />
                      <span>{inv.created_at ? formatDate(inv.created_at) : new Date().toLocaleDateString('id-ID')}</span>
                    </div>

                    {showPay && (
                      <div className="pt-3 border-t border-slate-700/50">
                        <button
                          onClick={() => router.push(`/payment?order_id=${inv.order_id}`)}
                          className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20"
                        >
                          <Icon icon="mdi:credit-card" className="w-5 h-5" />
                          Bayar Sekarang
                        </button>
                        {inv.expired_at && (
                          <div className="flex items-center justify-center gap-1.5 mt-2 text-xs text-yellow-400">
                            <Icon icon="mdi:clock-alert" className="w-3.5 h-3.5" />
                            <span>Batas: {formatDate(inv.expired_at)}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {investments.length > 0 && (
          <div className="mt-6">
            <p className="text-center text-xs text-slate-500 mb-3">Halaman {page} dari {totalPages}</p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => page > 1 && setPage(page - 1)}
                disabled={page === 1}
                className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center disabled:opacity-40 hover:bg-slate-700"
              >
                <Icon icon="mdi:chevron-left" className="w-5 h-5 text-white" />
              </button>
              <div className="px-4 py-2 rounded-xl bg-amber-600 text-white font-bold">{page}</div>
              <button
                onClick={() => page < totalPages && setPage(page + 1)}
                disabled={page === totalPages}
                className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center disabled:opacity-40 hover:bg-slate-700"
              >
                <Icon icon="mdi:chevron-right" className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        )}
      </div>

      <BottomNavbar />
    </div>
  );
}
