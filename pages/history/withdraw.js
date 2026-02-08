// pages/history/withdraw.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Icon } from '@iconify/react';
import { getWithdrawalHistory } from '../../utils/api';
import BottomNavbar from '../../components/BottomNavbar';

export default function RiwayatWithdraw() {
  const router = useRouter();
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalWithdrawals, setTotalWithdrawals] = useState(0);
  const [applicationData, setApplicationData] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = sessionStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchWithdrawalHistory();
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
    fetchWithdrawalHistory();
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) { }
  }, [page, debouncedSearchTerm]);

  const fetchWithdrawalHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = {
        limit: 10,
        page,
        ...(debouncedSearchTerm && { search: debouncedSearchTerm })
      };

      const res = await getWithdrawalHistory(queryParams);
      if (res.success && res.data) {
        const responseData = res.data.data || res.data;
        const fetchedWithdrawals = Array.isArray(responseData.data)
          ? responseData.data
          : (Array.isArray(responseData) && responseData !== null ? responseData : []);

        setWithdrawals(fetchedWithdrawals);

        const pagination = res.data.pagination || {};
        if (pagination.total_rows !== undefined) {
          setTotalWithdrawals(pagination.total_rows || 0);
          setTotalPages(pagination.total_pages || Math.max(1, Math.ceil((pagination.total_rows || 0) / limit)));
        } else {
          setTotalWithdrawals(fetchedWithdrawals.length);
          setTotalPages(Math.max(1, Math.ceil(fetchedWithdrawals.length / limit)));
        }
        setError(null);
      } else {
        setWithdrawals([]);
        setTotalWithdrawals(0);
        setTotalPages(1);
        setError(res.message || 'Gagal memuat riwayat penarikan');
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
      setWithdrawals([]);
      setTotalWithdrawals(0);
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

  const getStatusConfig = (status) => {
    const configs = {
      'Success': { bg: 'bg-green-600/20', text: 'text-green-400', border: 'border-green-500/30', label: 'Berhasil', icon: 'mdi:check-circle' },
      'Pending': { bg: 'bg-yellow-600/20', text: 'text-yellow-400', border: 'border-yellow-500/30', label: 'Menunggu', icon: 'mdi:clock-outline' },
      'Failed': { bg: 'bg-red-600/20', text: 'text-red-400', border: 'border-red-500/30', label: 'Gagal', icon: 'mdi:close-circle' }
    };
    return configs[status] || configs['Pending'];
  };

  const totalWithdrawn = withdrawals.filter(w => w.status === 'Success').reduce((sum, w) => sum + (w.final_amount || 0), 0);

  return (
    <div className="min-h-screen bg-slate-900 pb-36">
      <Head>
        <title>{applicationData?.name || 'Nova Vant'} | Riwayat Penarikan</title>
      </Head>

      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-slate-900/90 border-b border-slate-800">
        <div className="max-w-md mx-auto px-5 py-4 flex items-center gap-4">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center hover:bg-slate-700">
            <Icon icon="mdi:arrow-left" className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-lg font-bold text-white">Riwayat Penarikan</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-5 pt-6">
        {/* Stats Banner */}
        <div className="bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 rounded-2xl p-5 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-green-200 text-sm mb-1">Total Diterima</p>
                <p className="text-3xl font-black text-white">Rp {formatCurrency(totalWithdrawn)}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Icon icon="mdi:cash-check" className="w-7 h-7 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-green-200 text-sm">
              <Icon icon="mdi:counter" className="w-4 h-4" />
              <span>{totalWithdrawals} transaksi</span>
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
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl pl-11 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-slate-500"
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
            <div className="w-12 h-12 border-3 border-slate-700 border-t-green-500 rounded-full animate-spin mb-4" />
            <p className="text-slate-400">Memuat riwayat...</p>
          </div>
        ) : withdrawals.length === 0 && !error ? (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center mx-auto mb-4">
              <Icon icon="mdi:cash-clock" className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-white font-bold mb-2">Belum Ada Penarikan</h3>
            <p className="text-slate-400 text-sm">Anda belum melakukan penarikan dana</p>
          </div>
        ) : (
          <div className="space-y-3">
            {withdrawals.map((wd, index) => {
              const statusConfig = getStatusConfig(wd.status);
              return (
                <div key={wd.id || index} className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden hover:border-slate-600 transition-all">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 bg-slate-700/30 border-b border-slate-700/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center">
                        <Icon icon="mdi:bank-transfer-out" className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">#{wd.order_id}</p>
                        <p className="text-xs text-slate-500">
                          {wd.withdrawal_time ? formatDate(wd.withdrawal_time) : `ID: ${wd.id || index}`}
                        </p>
                      </div>
                    </div>
                    <div className={`px-2.5 py-1 rounded-lg ${statusConfig.bg} flex items-center gap-1.5`}>
                      <Icon icon={statusConfig.icon} className={`w-3.5 h-3.5 ${statusConfig.text}`} />
                      <span className={`text-xs font-semibold ${statusConfig.text}`}>{statusConfig.label}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    {/* Bank Info */}
                    <div className="bg-slate-700/30 rounded-xl p-3 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon icon="mdi:bank" className="w-4 h-4 text-blue-400" />
                        <p className="text-sm font-bold text-white">{wd.bank_name || 'Bank'}</p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                        <Icon icon="mdi:account" className="w-3.5 h-3.5" />
                        <span>{wd.account_name || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Icon icon="mdi:credit-card" className="w-3.5 h-3.5" />
                        <span className="font-mono">{wd.account_number || 'N/A'}</span>
                      </div>
                    </div>

                    {/* Amount Breakdown */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">Jumlah Penarikan</span>
                        <span className="text-sm font-semibold text-white">Rp {formatCurrency(wd.amount || 0)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">Biaya Admin</span>
                        <span className="text-sm font-semibold text-red-400">- Rp {formatCurrency(wd.charge || 0)}</span>
                      </div>
                    </div>

                    {/* Final Amount */}
                    <div className={`rounded-xl p-3 ${statusConfig.bg} border ${statusConfig.border}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon icon="mdi:cash-check" className={`w-4 h-4 ${statusConfig.text}`} />
                          <span className={`text-xs font-semibold ${statusConfig.text}`}>Diterima</span>
                        </div>
                        <span className={`text-xl font-bold ${statusConfig.text}`}>
                          Rp {formatCurrency(wd.final_amount || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {withdrawals.length > 0 && (
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
              <div className="px-4 py-2 rounded-xl bg-green-600 text-white font-bold">{page}</div>
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
