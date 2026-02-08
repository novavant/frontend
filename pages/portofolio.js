// pages/portofolio.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { getActiveInvestments } from '../utils/api';
import { Icon } from '@iconify/react';
import BottomNavbar from '../components/BottomNavbar';
import Image from 'next/image';

export default function Portofolio() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [investments, setInvestments] = useState({});
  const [tabKeys, setTabKeys] = useState([]);
  const [invLoading, setInvLoading] = useState(true);
  const [invError, setInvError] = useState('');
  const [applicationData, setApplicationData] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);

  const primaryColor = '#2563EB';

  const getCategoryIcon = (category) => {
    if (category?.toLowerCase().includes('neura')) return 'mdi:brain';
    if (category?.toLowerCase().includes('finora')) return 'mdi:star-four-points';
    if (category?.toLowerCase().includes('corex')) return 'mdi:hexagon-multiple';
    return 'mdi:package-variant';
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = sessionStorage.getItem('token');
    const accessExpire = sessionStorage.getItem('access_expire');
    if (!token || !accessExpire) {
      router.push('/login');
      return;
    }
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserData({
      name: user.name || "Tester",
      balance: user.balance || 0,
      level: user.level || 0,
    });
    setLoading(false);

    const storedApp = localStorage.getItem('application');
    if (storedApp) {
      try {
        const parsed = JSON.parse(storedApp);
        setApplicationData({ name: parsed.name || 'Nova Vant', company: parsed.company || 'Novavant, Inc.' });
      } catch (e) {
        setApplicationData({ name: 'Nova Vant', company: 'Novavant, Inc.' });
      }
    } else {
      setApplicationData({ name: 'Nova Vant', company: 'Novavant, Inc.' });
    }
  }, [router]);

  useEffect(() => {
    setInvLoading(true);
    setInvError('');
    getActiveInvestments()
      .then(res => {
        const data = res.data || {};
        setInvestments(data);
        const origKeys = Object.keys(data);
        const preferred = ['Neura', 'Finora', 'Corex'];
        const keys = [
          ...preferred.filter(k => origKeys.includes(k)),
          ...origKeys.filter(k => !preferred.includes(k))
        ];
        setTabKeys(keys);
        if (keys.length > 0) setActiveTab(keys[0]);
      })
      .catch(e => setInvError(e.message || 'Gagal memuat investasi aktif'))
      .finally(() => setInvLoading(false));
  }, []);

  const formatCurrency = (amount) => new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-slate-700 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  const allInvestments = Object.values(investments).flat();
  const totalInvestments = allInvestments.length;
  const totalReturn = allInvestments.reduce((sum, inv) => sum + inv.total_returned, 0);
  const totalInvested = allInvestments.reduce((sum, inv) => sum + inv.amount, 0);
  const runningCount = allInvestments.filter(inv => inv.status === 'Running').length;

  return (
    <div className="min-h-screen bg-slate-900 pb-28">
      <Head>
        <title>{applicationData?.name || 'Nova Vant'} | Portofolio</title>
        <meta name="description" content="Portfolio" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="max-w-md mx-auto">
        {/* Hero Section - Same as Dashboard */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-400/20 via-transparent to-transparent" />

          <div className="relative px-5 pt-6 pb-8">
            {/* Top Row */}
            <div className="flex items-center justify-between mb-6">
              <Image src="/logo.png" alt="Logo" width={100} height={36} className="h-8 w-auto brightness-0 invert" priority />
              <button
                onClick={() => router.push('/vip')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all"
              >
                <Icon icon="mdi:crown" className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-semibold text-white">VIP {userData?.level || 0}</span>
              </button>
            </div>

            {/* Title */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white mb-1">Portofolio Saya</h1>
              <p className="text-blue-100 text-sm">Pantau investasi aktif Anda</p>
            </div>

            {/* Stats Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20">
              <div className="mb-4">
                <p className="text-blue-100 text-sm mb-1">Total Investasi</p>
                <p className="text-3xl font-black text-white">{formatCurrency(totalInvested)}</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 rounded-xl bg-white/10">
                  <p className="text-2xl font-bold text-white">{totalInvestments}</p>
                  <p className="text-xs text-blue-100">Produk</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-white/10">
                  <p className="text-2xl font-bold text-green-400">{runningCount}</p>
                  <p className="text-xs text-blue-100">Aktif</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-white/10">
                  <p className="text-lg font-bold text-white">{formatCurrency(totalReturn).replace('Rp', '')}</p>
                  <p className="text-xs text-blue-100">Profit</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-5 py-6">
          {/* Category Tabs */}
          {tabKeys.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white mb-4">Kategori</h3>
              <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                {tabKeys.map((key) => {
                  const isActive = activeTab === key;
                  const count = investments[key]?.length || 0;

                  return (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key)}
                      className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                        : 'bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-600'
                        }`}
                    >
                      <Icon icon={getCategoryIcon(key)} className="w-4 h-4" />
                      {key}
                      <span className={`px-1.5 py-0.5 rounded text-xs ${isActive ? 'bg-white/20' : 'bg-slate-700'}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Investment List */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white mb-4">Investasi Aktif</h3>

            {invLoading ? (
              <div className="bg-slate-800 rounded-2xl p-10 border border-slate-700 text-center">
                <div className="w-10 h-10 border-3 border-slate-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-slate-400">Memuat investasi...</p>
              </div>
            ) : invError ? (
              <div className="bg-red-900/30 border border-red-700/50 rounded-2xl p-5">
                <div className="flex items-center gap-3">
                  <Icon icon="mdi:alert-circle" className="w-6 h-6 text-red-400" />
                  <div>
                    <p className="text-red-300 font-semibold">Terjadi Kesalahan</p>
                    <p className="text-red-400/80 text-sm">{invError}</p>
                  </div>
                </div>
              </div>
            ) : !activeTab || !investments[activeTab] || investments[activeTab].length === 0 ? (
              <div className="bg-slate-800 rounded-2xl p-10 border border-slate-700 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center mx-auto mb-4">
                  <Icon icon="mdi:package-variant" className="w-8 h-8 text-slate-500" />
                </div>
                <h4 className="font-bold text-white text-lg mb-2">Belum Ada Investasi</h4>
                <p className="text-sm text-slate-400 mb-4">Mulai investasi untuk melihat portofolio</p>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="px-5 py-2.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors"
                >
                  Mulai Investasi
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {investments[activeTab].map((inv) => {
                  const percent = inv.duration > 0 ? Math.round((inv.total_paid / inv.duration) * 100) : 0;
                  const isExpanded = expandedCard === inv.id;

                  return (
                    <div
                      key={inv.id}
                      className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden"
                    >
                      {/* Header - Clickable */}
                      <div
                        className="p-4 cursor-pointer"
                        onClick={() => setExpandedCard(isExpanded ? null : inv.id)}
                      >
                        <div className="flex items-center gap-3">
                          {/* Icon */}
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: `${primaryColor}20` }}
                          >
                            <Icon icon={getCategoryIcon(activeTab)} className="w-6 h-6" style={{ color: primaryColor }} />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-white font-bold text-sm truncate">{inv.product_name}</p>
                              <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${inv.status === 'Running'
                                ? 'bg-green-900/50 text-green-400 border border-green-700/50'
                                : inv.status === 'Completed'
                                  ? 'bg-blue-900/50 text-blue-400 border border-blue-700/50'
                                  : 'bg-slate-700 text-slate-400'
                                }`}>
                                {inv.status}
                              </span>
                            </div>
                            <p className="text-slate-500 text-xs">Modal: {formatCurrency(inv.amount)}</p>
                          </div>

                          {/* Profit */}
                          <div className="text-right">
                            <p className="text-green-400 font-bold">+{formatCurrency(inv.total_returned)}</p>
                            <p className="text-slate-500 text-xs">profit</p>
                          </div>

                          <Icon
                            icon={isExpanded ? 'mdi:chevron-up' : 'mdi:chevron-down'}
                            className="w-5 h-5 text-slate-500"
                          />
                        </div>

                        {/* Mini Progress */}
                        <div className="mt-3 h-1.5 bg-slate-900 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-blue-600"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>

                      {/* Expanded Content */}
                      {isExpanded && (
                        <div className="px-4 pb-4 border-t border-slate-700">
                          <div className="pt-4 space-y-3">
                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-slate-900 rounded-xl p-3 border border-slate-700">
                                <p className="text-slate-500 text-xs mb-1">Profit/Hari</p>
                                <p className="text-green-400 font-bold">+{formatCurrency(inv.daily_profit)}</p>
                              </div>
                              <div className="bg-slate-900 rounded-xl p-3 border border-slate-700">
                                <p className="text-slate-500 text-xs mb-1">Progress</p>
                                <p className="text-white font-bold">{inv.total_paid}/{inv.duration} hari</p>
                              </div>
                            </div>

                            {/* Dates */}
                            {inv.last_return_at && inv.next_return_at && (
                              <div className="grid grid-cols-2 gap-3">
                                <div className="bg-slate-900 rounded-xl p-3 border border-slate-700">
                                  <p className="text-slate-500 text-xs mb-1">Profit Terakhir</p>
                                  <p className="text-white font-medium text-sm">{new Date(inv.last_return_at).toLocaleDateString('id-ID')}</p>
                                </div>
                                <div className="bg-blue-900/30 rounded-xl p-3 border border-blue-700/50">
                                  <p className="text-blue-400 text-xs mb-1">Berikutnya</p>
                                  <p className="text-white font-medium text-sm">{new Date(inv.next_return_at).toLocaleDateString('id-ID')}</p>
                                </div>
                              </div>
                            )}

                            {/* Order ID */}
                            <div className="text-center">
                              <p className="text-slate-500 text-xs">Order ID: <span className="font-mono">{inv.order_id}</span></p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center py-4">
            <p className="text-xs text-slate-600">© 2026 {applicationData?.company}</p>
          </div>
        </div>
      </div>

      <BottomNavbar />
    </div>
  );
}
