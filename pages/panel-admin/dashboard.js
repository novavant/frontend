// pages/admin/dashboard.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Icon } from '@iconify/react';
import AdminLayout from '../../components/admin/Layout';
import { adminRequest } from '../../utils/admin/api';
import useAdminAuth from '../../lib/auth/useAdminAuth';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { useRouter } from 'next/router';

export default function AdminDashboard() {
  const { loading: authLoading } = useAdminAuth();
  const [data, setData] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [adminApps, setAdminApps] = useState({ pending_withdrawals: null, pending_forums: null });
  const router = useRouter();

  // Helper: get last 7 days names (Indonesian)
  const dayMapEnId = {
    'Sunday': 'Minggu',
    'Monday': 'Senin', 
    'Tuesday': 'Selasa',
    'Wednesday': 'Rabu',
    'Thursday': 'Kamis',
    'Friday': 'Jumat',
    'Saturday': 'Sabtu',
  };

  function getLast7Days() {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const todayIdx = new Date().getDay();
    let result = [];
    for (let i = 6; i >= 0; i--) {
      let idx = (todayIdx - i + 7) % 7;
      result.push(days[idx]);
    }
    return result;
  }

  // Helper: filter and sort API data for chart
  function getChartData(apiData, key = 'day') {
    if (!Array.isArray(apiData)) return [];
    const last7Days = getLast7Days();
    const dayMap = {};
    apiData.forEach(item => {
      let dayId = item[key];
      if (dayMapEnId[dayId]) dayId = dayMapEnId[dayId];
      dayMap[dayId] = item;
    });
    return last7Days.map(day => dayMap[day] || { [key]: day, amount: 0, count: 0 });
  }

  useEffect(() => {
    if (authLoading) return;
    
    const loadData = async () => {
      try {
        const res = await adminRequest('/dashboard', { method: 'GET' });
        if (res && res.success && res.data) {
          setData(res.data);
        } else {
          setData(null);
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        setData(null);
      } finally {
        setStatsLoading(false);
      }
    };

    loadData();
  }, [authLoading]);

  // Load admin_applications from localStorage for quick actions
  useEffect(() => {
    const readAdminApps = () => {
      try {
        const raw = localStorage.getItem('admin_applications');
        const parsed = raw ? JSON.parse(raw) : null;
        setAdminApps({
          pending_withdrawals: parsed && typeof parsed.pending_withdrawals === 'number' ? parsed.pending_withdrawals : null,
          pending_forums: parsed && typeof parsed.pending_forums === 'number' ? parsed.pending_forums : null,
        });
      } catch (e) {
        setAdminApps({ pending_withdrawals: null, pending_forums: null });
      }
    };
    readAdminApps();
    window.addEventListener('storage', readAdminApps);
    window.addEventListener('admin-info-updated', readAdminApps);
    return () => {
      window.removeEventListener('storage', readAdminApps);
      window.removeEventListener('admin-info-updated', readAdminApps);
    };
  }, []);

  if (authLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-400/30 border-t-purple-400 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-pink-400 rounded-full animate-spin animation-delay-150"></div>
          </div>
          <div className="mt-6 text-center">
            <p className="text-white font-medium text-lg">Memuat Dashboard...</p>
            <p className="text-gray-400 text-sm mt-1">Harap tunggu sebentar</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <AdminLayout title="Dashboard Overview">
        <div className="flex flex-col items-center justify-center min-h-96">
          <Icon icon="mdi:alert-circle" className="w-16 h-16 text-red-400 mb-4" />
          <h3 className="text-white text-xl font-semibold mb-2">Data Tidak Tersedia</h3>
          <p className="text-gray-400 text-center">Gagal memuat data dashboard. Silakan refresh halaman.</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors"
          >
            Refresh
          </button>
        </div>
      </AdminLayout>
    );
  }

  // Prepare pie chart data for transaction types. Prefer `data.type_transactions` if provided by API.
  const transactionTypes = (data.type_transactions && typeof data.type_transactions === 'object')
    ? data.type_transactions
    : (data.last_transactions?.reduce((acc, tx) => {
        acc[tx.type] = (acc[tx.type] || 0) + 1;
        return acc;
      }, {}) || {});

  // Map transaction types to readable names and colors
  const typeLabel = (type) => {
    return type === 'investment' ? 'Investasi' :
           type === 'withdrawal' ? 'Penarikan' :
           type === 'return' ? 'Profit' :
           type === 'team' ? 'Tim' :
           type === 'bonus' ? 'Bonus' :
           'Lainnya';
  };

  const typeColor = (type) => {
    return type === 'investment' ? '#8B5CF6' :
           type === 'withdrawal' ? '#EF4444' :
           type === 'return' ? '#F59E0B' :
           type === 'team' ? '#06B6D4' :
           type === 'bonus' ? '#10B981' :
           '#9CA3AF';
  };

  // Additional helpers for Recent Activity rendering
  const typeBgClass = (type) => {
    return type === 'investment' ? 'bg-purple-600/20' :
           type === 'withdrawal' ? 'bg-red-600/20' :
           type === 'return' ? 'bg-yellow-500/20' :
           type === 'team' ? 'bg-sky-500/20' :
           type === 'bonus' ? 'bg-green-600/20' :
           'bg-gray-600/20';
  };

  const typeIcon = (type) => {
    return type === 'investment' ? 'mdi:chart-box' :
           type === 'withdrawal' ? 'mdi:cash-multiple' :
           type === 'return' ? 'mdi:cash-refund' :
           type === 'team' ? 'mdi:account-group' :
           type === 'bonus' ? 'mdi:gift' :
           'mdi:swap-horizontal';
  };

  const typeBadgeClass = (type) => {
    return type === 'investment' ? 'bg-purple-600/20 text-purple-300' :
           type === 'withdrawal' ? 'bg-red-600/20 text-red-300' :
           type === 'return' ? 'bg-yellow-500/20 text-yellow-300' :
           type === 'team' ? 'bg-sky-500/20 text-sky-300' :
           type === 'bonus' ? 'bg-green-600/20 text-green-300' :
           'bg-blue-600/20 text-blue-300';
  };

  const pieData = Object.entries(transactionTypes).map(([type, count]) => ({
    name: typeLabel(type),
    value: (typeof count === 'number' && !isNaN(count)) ? count : 0,
    color: typeColor(type)
  }));

  const COLORS = pieData.map(p => p.color);

  return (
    <AdminLayout title="Dashboard Overview">
      <Head>
        <title>Vla Devs | Admin Dashboard</title>
        <link rel="icon" type="image/x-icon" href="/vla-logo.png" />
      </Head>

      {/* Welcome Section */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-xl rounded-3xl p-6 border border-purple-500/20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Selamat Datang, {typeof window !== 'undefined' && (() => {
                  try {
                    const raw = localStorage.getItem('admin');
                    const parsed = raw ? JSON.parse(raw) : null;
                    return parsed && parsed.name ? parsed.name : 'Admin';
                  } catch (e) { return 'Admin'; }
                })()}! 👋
              </h1>
              <p className="text-gray-300">
                Berikut adalah ringkasan aktivitas platform hari ini
              </p>
            </div>
            <div className="hidden lg:block">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center animate-pulse">
                <Icon icon="mdi:crown" className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Pengguna"
          value={data.total_users}
          change={data.active_users}
          changeText="aktif"
          icon="mdi:account-group"
          color="blue"
          trend="up"
        />
        <StatCard
          title="Total Investasi"
          value={data.total_investments}
          change={data.active_investments}
          changeText="aktif"
          icon="mdi:chart-box"
          color="green"
          trend="up"
        />
        <StatCard
          title="Penarikan"
          value={data.total_withdrawals}
          change={data.pending_withdrawals}
          changeText="menunggu"
          icon="mdi:cash-multiple"
          color="purple"
          trend="neutral"
        />
        <StatCard
          title="Total Saldo"
          value={`Rp ${data.total_balance?.toLocaleString('id-ID') || '0'}`}
          icon="mdi:bank"
          color="yellow"
          isAmount={true}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
        {/* Investment Chart - Takes 2 columns */}
        <div className="xl:col-span-2">
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 hover:border-purple-500/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                  <Icon icon="mdi:chart-line" className="text-white w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-white font-semibold text-lg">Investasi Mingguan</h2>
                  <p className="text-gray-400 text-sm">7 hari terakhir</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded-lg text-xs">
                  7 Hari
                </button>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={getChartData(data.overview_investments)}>
                  <defs>
                    <linearGradient id="colorInvestment" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="day" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(value) => value ? `${value/1000}K` : '0'} />
                  <Tooltip 
                    formatter={(value) => [`Rp ${value?.toLocaleString('id-ID') || '0'}`, 'Jumlah']}
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      borderColor: '#8B5CF6',
                      borderRadius: '12px',
                      border: '1px solid rgba(139, 92, 246, 0.3)'
                    }}
                    labelStyle={{ color: '#F3F4F6' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#8B5CF6" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorInvestment)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Transaction Types Pie Chart */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 hover:border-blue-500/30 transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
              <Icon icon="mdi:chart-pie" className="text-white w-5 h-5" />
            </div>
            <div>
              <h2 className="text-white font-semibold text-lg">Jenis Transaksi</h2>
              <p className="text-gray-400 text-sm">Distribusi aktivitas</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    borderColor: '#4B5563',
                    borderRadius: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {pieData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="text-gray-300 text-sm">{item.name}</span>
                </div>
                <span className="text-white font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Growth Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 hover:border-blue-500/30 transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <Icon icon="mdi:account-arrow-up" className="text-white w-5 h-5" />
            </div>
            <div>
              <h2 className="text-white font-semibold text-lg">Pertumbuhan Pengguna</h2>
              <p className="text-gray-400 text-sm">Pendaftaran mingguan</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getChartData(data.growth_users)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip 
                  formatter={(value) => [value || 0, 'Pengguna Baru']}
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    borderColor: '#3B82F6',
                    borderRadius: '12px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2, fill: '#1E40AF' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
              <Icon icon="mdi:lightning-bolt" className="text-white w-5 h-5" />
            </div>
            <div>
              <h2 className="text-white font-semibold text-lg">Aksi Cepat</h2>
              <p className="text-gray-400 text-sm">Navigasi ke halaman utama</p>
            </div>
          </div>
          <div className="space-y-3">
            <QuickActionButton
              icon="mdi:account-plus"
              label="Kelola Pengguna"
              description="Tambah, edit, atau hapus pengguna"
              href="/panel-admin/users"
            />
            <QuickActionButton
              icon="mdi:cash-check"
              label="Kelola Penarikan"
              description="Proses permintaan penarikan"
              href="/panel-admin/withdrawals"
              badge={adminApps.pending_withdrawals || null}
            />
            <QuickActionButton
              icon="mdi:chart-box"
              label="Kelola Investasi"
              description="Monitor dan kelola investasi"
              href="/panel-admin/investments"
            />
            <QuickActionButton
              icon="mdi:forum"
              label="Kelola Forum"
              description="Moderasi diskusi forum"
              href="/panel-admin/forums"
              badge={adminApps.pending_forums || null}
            />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl flex items-center justify-center">
              <Icon icon="mdi:clock-alert" className="text-white w-5 h-5" />
            </div>
            <div>
              <h2 className="text-white font-semibold text-lg">Aktivitas Terbaru</h2>
              <p className="text-gray-400 text-sm">Transaksi dan aktivitas pengguna</p>
            </div>
          </div>
          <button onClick={() => router.push('/panel-admin/transactions')} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm transition-colors">
            Lihat Semua
          </button>
        </div>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {data.last_transactions && data.last_transactions.map((item, idx) => (
            <div key={idx} className="group flex items-center justify-between p-4 bg-black/20 hover:bg-black/30 rounded-2xl transition-all duration-300 border border-transparent hover:border-white/10">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${typeBgClass(item.type)}`}>
                  <Icon 
                    icon={typeIcon(item.type)}
                    className={`w-6 h-6`} 
                    style={{ color: typeColor(item.type) }}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-white font-medium">{item.user_name}</p>
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${typeBadgeClass(item.type)}`}>
                      {typeLabel(item.type)}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mt-1">{item.message}</p>
                  <p className="text-gray-500 text-xs mt-1">
                    {new Date(item.created_at).toLocaleString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${item.amount > 0 ? 'text-green-400' : 'text-gray-400'}`}>
                  {item.amount ? `Rp ${item.amount.toLocaleString('id-ID')}` : '-'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}

// Enhanced Stat Card Component
function StatCard({ title, value, change, changeText, icon, color, trend, isAmount = false }) {
  const colorClasses = {
    blue: { bg: 'from-blue-600 to-cyan-600', text: 'text-blue-400', border: 'border-blue-500/30' },
    green: { bg: 'from-green-600 to-emerald-600', text: 'text-green-400', border: 'border-green-500/30' },
    purple: { bg: 'from-purple-600 to-pink-600', text: 'text-purple-400', border: 'border-purple-500/30' },
    yellow: { bg: 'from-yellow-600 to-orange-600', text: 'text-yellow-400', border: 'border-yellow-500/30' }
  };

  const trendIcons = {
    up: { icon: 'mdi:trending-up', color: 'text-green-400' },
    down: { icon: 'mdi:trending-down', color: 'text-red-400' },
    neutral: { icon: 'mdi:trending-neutral', color: 'text-gray-400' }
  };

  return (
    <div className={`bg-white/5 backdrop-blur-xl rounded-3xl p-6 border ${colorClasses[color].border} hover:bg-white/10 hover:scale-105 transition-all duration-300 group`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-r ${colorClasses[color].bg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
          <Icon icon={icon} className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div className="flex items-center gap-1">
            <Icon icon={trendIcons[trend].icon} className={`w-4 h-4 ${trendIcons[trend].color}`} />
          </div>
        )}
      </div>
      <div>
        <h3 className="text-gray-400 text-sm font-medium mb-2">{title}</h3>
        <div className={`text-2xl font-bold text-white mb-2 ${isAmount ? 'text-xl' : ''}`}>
          {isAmount ? value : (typeof value === 'number' ? value.toLocaleString('id-ID') : value)}
        </div>
        {change !== undefined && (
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
              trend === 'up' ? 'bg-green-600/20' : 
              trend === 'down' ? 'bg-red-600/20' : 'bg-gray-600/20'
            }`}>
              <span className={`text-sm font-medium ${
                trend === 'up' ? 'text-green-400' : 
                trend === 'down' ? 'text-red-400' : 'text-gray-400'
              }`}>
                {change} {changeText}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Quick Action Button Component
function QuickActionButton({ icon, label, description, href, badge }) {
  const handleClick = () => {
    if (typeof window !== 'undefined') {
      window.location.href = href;
    }
  };

  return (
    <button
      onClick={handleClick}
      className="w-full flex items-center gap-4 p-4 bg-black/20 hover:bg-black/40 rounded-2xl transition-all duration-300 group border border-transparent hover:border-white/10"
    >
      <div className="w-10 h-10 bg-white/10 group-hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors">
        <Icon icon={icon} className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 text-left">
        <div className="flex items-center gap-2">
          <p className="text-white font-medium text-sm">{label}</p>
          {badge > 0 && (
            <span className="px-2 py-1 bg-red-600 text-white text-xs rounded-full font-medium">
              {badge}
            </span>
          )}
        </div>
        <p className="text-gray-400 text-xs mt-1">{description}</p>
      </div>
      <Icon icon="mdi:chevron-right" className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
    </button>
  );
}