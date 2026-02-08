// pages/transactions.js
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import BottomNavbar from '../components/BottomNavbar';
import { getUserTransactions } from '../utils/api';

export default function Transactions() {
  const router = useRouter();
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [applicationData, setApplicationData] = useState(null);

  const filterOptions = [
    { value: 'all', label: 'Semua', icon: 'mdi:view-grid', gradient: 'from-blue-600 to-indigo-600' },
    { value: 'investment', label: 'Investasi', icon: 'mdi:trending-up', gradient: 'from-amber-500 to-orange-600' },
    { value: 'withdrawal', label: 'Penarikan', icon: 'mdi:bank-transfer-out', gradient: 'from-red-500 to-rose-600' },
    { value: 'transfer', label: 'Transfer Uang', icon: 'mdi:bank-minus', gradient: 'from-red-500 to-rose-600' },
    { value: 'receive', label: 'Terima Uang', icon: 'mdi:bank-plus', gradient: 'from-green-500 to-emerald-600' },
    { value: 'return', label: 'Return', icon: 'mdi:cash-refund', gradient: 'from-purple-500 to-violet-600' },
    { value: 'team', label: 'Tim', icon: 'mdi:account-group', gradient: 'from-cyan-500 to-teal-600' },
    { value: 'bonus', label: 'Bonus', icon: 'mdi:gift', gradient: 'from-green-500 to-emerald-600' }
  ];

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = sessionStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchTransactions();
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

  useEffect(() => { setPage(1); }, [selectedFilter]);

  useEffect(() => {
    fetchTransactions();
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) { }
  }, [page, selectedFilter, debouncedSearchTerm]);

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = {
        limit: 10,
        page,
        ...(selectedFilter !== 'all' && { type: selectedFilter }),
        ...(debouncedSearchTerm && { search: debouncedSearchTerm })
      };

      const res = await getUserTransactions(queryParams);

      if (res.success && res.data) {
        const responseData = res.data.data || res.data;
        const fetchedTransactions = Array.isArray(responseData.data)
          ? responseData.data
          : (Array.isArray(responseData.transactions)
            ? responseData.transactions
            : (Array.isArray(responseData) ? responseData : []));

        setTransactions(fetchedTransactions);

        const pagination = res.data.pagination || res.data.meta || {};
        if (pagination.total_rows !== undefined) {
          setTotalTransactions(pagination.total_rows || 0);
          setTotalPages(pagination.total_pages || Math.max(1, Math.ceil((pagination.total_rows || 0) / limit)));
          setHasNextPage((pagination.page || page) < (pagination.total_pages || 1));
        } else {
          setTotalTransactions(fetchedTransactions.length);
          setTotalPages(Math.max(1, Math.ceil(fetchedTransactions.length / limit)));
          setHasNextPage(fetchedTransactions.length === limit);
        }

        filterTransactions(fetchedTransactions);
      } else {
        setTransactions([]);
        setFilteredTransactions([]);
        setTotalTransactions(0);
        setTotalPages(1);
        setHasNextPage(false);
        if (!res.success) setError(res.message || 'Gagal memuat riwayat transaksi');
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
      setTransactions([]);
      setFilteredTransactions([]);
      setTotalTransactions(0);
      setTotalPages(1);
      setHasNextPage(false);
    }
    setLoading(false);
  };

  const filterTransactions = (transactionList = transactions) => {
    if (selectedFilter === 'all') {
      setFilteredTransactions(transactionList);
    } else {
      setFilteredTransactions(transactionList.filter(tx => tx.transaction_type === selectedFilter));
    }
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
      'Success': { bg: 'bg-emerald-500', text: 'text-emerald-400', glow: 'shadow-emerald-500/30', label: 'Berhasil', icon: 'mdi:check-circle' },
      'Pending': { bg: 'bg-amber-500', text: 'text-amber-400', glow: 'shadow-amber-500/30', label: 'Menunggu', icon: 'mdi:clock-outline' },
      'Failed': { bg: 'bg-red-500', text: 'text-red-400', glow: 'shadow-red-500/30', label: 'Gagal', icon: 'mdi:close-circle' }
    };
    return configs[status] || configs['Pending'];
  };

  const getTxConfig = (type) => {
    const configs = {
      'withdrawal': { icon: 'mdi:bank-transfer-out', gradient: 'from-red-500 to-rose-600', bg: 'bg-red-500/10' },
      'transfer': { icon: 'mdi:bank-minus', gradient: 'from-red-500 to-rose-600', bg: 'bg-red-500/10' },
      'receive': { icon: 'mdi:bank-plus', gradient: 'from-green-500 to-emerald-600', bg: 'bg-green-500/10' },
      'bonus': { icon: 'mdi:gift', gradient: 'from-green-500 to-emerald-600', bg: 'bg-green-500/10' },
      'team': { icon: 'mdi:account-group', gradient: 'from-cyan-500 to-teal-600', bg: 'bg-cyan-500/10' },
      'return': { icon: 'mdi:cash-refund', gradient: 'from-purple-500 to-violet-600', bg: 'bg-purple-500/10' },
      'investment': { icon: 'mdi:trending-up', gradient: 'from-amber-500 to-orange-600', bg: 'bg-amber-500/10' }
    };
    return configs[type] || { icon: 'mdi:currency-usd', gradient: 'from-slate-500 to-slate-600', bg: 'bg-slate-500/10' };
  };

  const stats = {
    total: filteredTransactions.length,
    credit: filteredTransactions.filter(tx => tx.status === 'Success' && tx.transaction_flow === 'credit').reduce((s, tx) => s + (tx.amount || 0), 0),
    debit: filteredTransactions.filter(tx => tx.status === 'Success' && tx.transaction_flow === 'debit').reduce((s, tx) => s + (tx.amount || 0), 0)
  };

  const netBalance = stats.debit - stats.credit;

  return (
    <div className="min-h-screen bg-slate-950 pb-36">
      <Head>
        <title>{applicationData?.name || 'Nova Vant'} | Riwayat Transaksi</title>
      </Head>

      {/* Header with Gradient */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-indigo-600/10 to-transparent" />
        <div className="sticky top-0 z-40 backdrop-blur-2xl bg-slate-950/80 border-b border-white/5">
          <div className="max-w-md mx-auto px-5 py-4 flex items-center gap-4">
            <button onClick={() => router.back()} className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all">
              <Icon icon="mdi:arrow-left" className="w-5 h-5 text-white" />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-white">Riwayat Transaksi</h1>
              <p className="text-xs text-slate-400">Pantau semua aktivitas keuangan</p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Icon icon="mdi:swap-horizontal-bold" className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-5 pt-6">
        {/* Hero Stats Card */}
        <div className="relative mb-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 rounded-3xl" />
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-blue-200 text-sm font-medium mb-1">Saldo Bersih</p>
                <p className="text-4xl font-black text-white tracking-tight">
                  Rp {formatCurrency(Math.abs(netBalance))}
                </p>
                <div className={`inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full text-xs font-semibold ${netBalance >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                  <Icon icon={netBalance >= 0 ? 'mdi:trending-up' : 'mdi:trending-down'} className="w-3.5 h-3.5" />
                  {netBalance >= 0 ? 'Positif' : 'Negatif'}
                </div>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center">
                <Icon icon="mdi:chart-areaspline-variant" className="w-8 h-8 text-white" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-3 text-center">
                <Icon icon="mdi:counter" className="w-5 h-5 text-blue-200 mx-auto mb-1" />
                <p className="text-2xl font-bold text-white">{stats.total}</p>
                <p className="text-xs text-blue-200">Total</p>
              </div>
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-3 text-center">
                <Icon icon="mdi:arrow-down-circle" className="w-5 h-5 text-emerald-300 mx-auto mb-1" />
                <p className="text-lg font-bold text-white">{formatCurrency(stats.debit / 1000)}K</p>
                <p className="text-xs text-blue-200">Masuk</p>
              </div>
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-3 text-center">
                <Icon icon="mdi:arrow-up-circle" className="w-5 h-5 text-red-300 mx-auto mb-1" />
                <p className="text-lg font-bold text-white">{formatCurrency(stats.credit / 1000)}K</p>
                <p className="text-xs text-blue-200">Keluar</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search with Glass Effect */}
        <div className="mb-5">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
            <div className="relative">
              <Icon icon="mdi:magnify" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 w-5 h-5 transition-colors" />
              <input
                type="text"
                placeholder="Cari transaksi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900/80 border border-white/10 text-white rounded-2xl pl-12 pr-10 py-4 focus:outline-none focus:border-blue-500/50 focus:bg-slate-900 placeholder-slate-500 transition-all"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg bg-slate-700 flex items-center justify-center hover:bg-slate-600">
                  <Icon icon="mdi:close" className="w-4 h-4 text-white" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="mb-5">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedFilter(option.value)}
                className={`flex-shrink-0 px-4 py-2.5 rounded-2xl text-sm font-semibold flex items-center gap-2 transition-all ${selectedFilter === option.value
                  ? `bg-gradient-to-r ${option.gradient} text-white shadow-lg`
                  : 'bg-slate-900/80 text-slate-400 border border-white/5 hover:border-white/10 hover:text-white'
                  }`}
              >
                <Icon icon={option.icon} className="w-4 h-4" />
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-gradient-to-r from-red-500/10 to-rose-500/10 border border-red-500/20 rounded-2xl p-4 mb-5 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <Icon icon="mdi:alert-circle" className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <p className="text-red-300 text-sm font-medium">Terjadi Kesalahan</p>
              <p className="text-red-400/70 text-xs mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Transaction List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-slate-800" />
              <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
            </div>
            <p className="text-slate-400 mt-4 text-sm">Memuat transaksi...</p>
          </div>
        ) : filteredTransactions.length === 0 && !error ? (
          <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-12 text-center">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center mx-auto mb-4 shadow-2xl">
              <Icon icon="mdi:receipt-text-outline" className="w-10 h-10 text-slate-600" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Belum Ada Transaksi</h3>
            <p className="text-slate-500 text-sm">Tidak ada transaksi untuk filter ini</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((tx, idx) => {
              const txConfig = getTxConfig(tx.transaction_type);
              const statusConfig = getStatusConfig(tx.status);
              return (
                <div
                  key={tx.id}
                  className="group bg-slate-900/50 border border-white/5 rounded-3xl overflow-hidden hover:border-white/10 hover:bg-slate-900/80 transition-all"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="p-4">
                    {/* Top Row */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${txConfig.gradient} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}>
                        <Icon icon={txConfig.icon} className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-bold capitalize">{tx.transaction_type}</p>
                        <p className="text-slate-500 text-xs truncate">#{tx.order_id}</p>
                      </div>
                      <div className={`px-3 py-1.5 rounded-xl ${statusConfig.bg} shadow-lg ${statusConfig.glow}`}>
                        <span className="text-white text-xs font-bold">{statusConfig.label}</span>
                      </div>
                    </div>

                    {/* Message */}
                    <p className="text-slate-400 text-sm mb-4 line-clamp-2">{tx.message}</p>

                    {/* Amount Row */}
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-slate-500 text-xs mb-1">{tx.transaction_flow === 'debit' ? 'Dana Masuk' : 'Dana Keluar'}</p>
                        <p className={`text-2xl font-black ${tx.transaction_flow === 'debit' ? 'text-emerald-400' : 'text-red-400'}`}>
                          {tx.transaction_flow === 'debit' ? '+' : '-'}Rp {formatCurrency(tx.amount || 0)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-slate-500 text-xs">
                          <Icon icon="mdi:clock-outline" className="w-3.5 h-3.5" />
                          <span>
                            {tx.created_at ? formatDate(tx.created_at) : (() => {
                              const match = tx.order_id?.match(/INV-(\d{13})/);
                              if (match) {
                                const ts = parseInt(match[1]);
                                if (!isNaN(ts) && ts > 1000000000000) return formatDate(new Date(ts));
                              }
                              return 'N/A';
                            })()}
                          </span>
                        </div>
                        {(tx.charge || 0) > 0 && (
                          <p className="text-amber-400 text-xs mt-1 font-medium">Biaya: Rp {formatCurrency(tx.charge)}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {filteredTransactions.length > 0 && (
          <div className="mt-8 mb-4">
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => page > 1 && setPage(page - 1)}
                disabled={page === 1}
                className="w-12 h-12 rounded-2xl bg-slate-900/80 border border-white/10 flex items-center justify-center disabled:opacity-30 hover:bg-slate-800 hover:border-white/20 transition-all"
              >
                <Icon icon="mdi:chevron-left" className="w-6 h-6 text-white" />
              </button>

              <div className="flex items-center gap-1 bg-slate-900/80 border border-white/10 rounded-2xl px-2 py-1">
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <button
                      key={i}
                      onClick={() => setPage(pageNum)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${page === pageNum
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => page < totalPages && setPage(page + 1)}
                disabled={page === totalPages}
                className="w-12 h-12 rounded-2xl bg-slate-900/80 border border-white/10 flex items-center justify-center disabled:opacity-30 hover:bg-slate-800 hover:border-white/20 transition-all"
              >
                <Icon icon="mdi:chevron-right" className="w-6 h-6 text-white" />
              </button>
            </div>
            <p className="text-center text-slate-500 text-xs mt-3">
              Halaman {page} dari {totalPages} • {totalTransactions} transaksi
            </p>
          </div>
        )}
      </div>

      <BottomNavbar />
    </div>
  );
}
