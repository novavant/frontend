// pages/admin/users.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Icon } from '@iconify/react';
import AdminLayout from '../../components/admin/Layout';
import useAdminAuth from '../../lib/auth/useAdminAuth';
import { adminRequest } from '../../utils/admin/api';

export default function UserManagement() {
  const { loading: authLoading } = useAdminAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    investment_status: 'all',
    search: '',
    page: 1,
    limit: 25
  });
  const [searchInput, setSearchInput] = useState('');
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    suspended: 0
  });

  useEffect(() => {
    if (authLoading) return;
    loadUsers();
  }, [authLoading, filters]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const params = [];
      if (filters.page) params.push(`page=${filters.page}`);
      if (filters.limit) params.push(`limit=${filters.limit}`);
      if (filters.status && filters.status !== 'all') params.push(`status=${filters.status}`);
      if (filters.investment_status && filters.investment_status !== 'all') params.push(`investment_status=${filters.investment_status}`);
      if (filters.search) params.push(`search=${encodeURIComponent(filters.search)}`);
      
      const query = params.length ? `?${params.join('&')}` : '';
      const res = await adminRequest(`/users${query}`, { method: 'GET' });
      
      if (res && res.success && Array.isArray(res.data)) {
        setUsers(res.data);
        setTotalUsers(res.total || res.data.length);
        setTotalPages(Math.ceil((res.total || res.data.length) / filters.limit));
        
        // Calculate stats
        const statsData = res.data.reduce((acc, user) => {
          acc.total++;
          if (user.status === 'Active') acc.active++;
          else if (user.status === 'Inactive') acc.inactive++;
          else if (user.status === 'Suspend') acc.suspended++;
          return acc;
        }, { total: 0, active: 0, inactive: 0, suspended: 0 });
        setStats(statsData);
      } else {
        setUsers([]);
        setTotalUsers(0);
        setTotalPages(1);
        setStats({ total: 0, active: 0, inactive: 0, suspended: 0 });
      }
    } catch (error) {
      console.error('Failed to load users:', error);
      setUsers([]);
      setTotalUsers(0);
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

  const handleStatusToggle = async (user) => {
    try {
      const newStatus = user.status === 'Suspend' ? 'Active' : 'Suspend';
      const res = await adminRequest(`/users/${user.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: user.name,
          number: user.number,
          status: newStatus,
          investment_status: user.investment_status
        })
      });
      
      if (res && res.success) {
        loadUsers(); // Reload data
        // Show toast notification would be great here
      }
    } catch (error) {
      console.error('Failed to update user status:', error);
    }
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
            <p className="text-white font-medium text-lg">Memuat Data Pengguna...</p>
            <p className="text-gray-400 text-sm mt-1">Harap tunggu sebentar</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout title="Kelola Pengguna">
      <Head>
        <title>Vla Devs | Kelola Pengguna</title>
        <link rel="icon" type="image/x-icon" href="/vla-logo.png" />
      </Head>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Pengguna" value={stats.total} icon="mdi:account-group" color="blue" />
        <StatCard title="Pengguna Aktif" value={stats.active} icon="mdi:account-check" color="green" />
        <StatCard title="Tidak Aktif" value={stats.inactive} icon="mdi:account-clock" color="yellow" />
        <StatCard title="Tersuspend" value={stats.suspended} icon="mdi:account-cancel" color="red" />
      </div>

      {/* Filter Section */}
      <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
            <Icon icon="mdi:filter-variant" className="text-white w-5 h-5" />
          </div>
          <div>
            <h2 className="text-white font-semibold text-lg">Filter & Pencarian</h2>
            <p className="text-gray-400 text-sm">Cari dan filter pengguna berdasarkan kriteria</p>
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
                placeholder="Cari berdasarkan nama, nomor atau kode referral..."
                className="w-full bg-white/10 border border-white/20 text-white rounded-2xl px-4 py-3 pl-12 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
              <Icon icon="mdi:magnify" className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Status Pengguna</label>
            <select 
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full bg-white/10 border border-white/20 text-white rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all dark-select"
            >
              <option value="all">Semua Status</option>
              <option value="Active">Aktif</option>
              <option value="Inactive">Tidak Aktif</option>
              <option value="Suspend">Tersuspend</option>
            </select>
          </div>

          {/* Investment Status Filter */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Status Investasi</label>
            <select 
              value={filters.investment_status}
              onChange={(e) => handleFilterChange('investment_status', e.target.value)}
              className="w-full bg-white/10 border border-white/20 text-white rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all dark-select"
            >
              <option value="all">Semua Status</option>
              <option value="Active">Aktif</option>
              <option value="Inactive">Tidak Aktif</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <button
            onClick={handleSearch}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <Icon icon="mdi:magnify" className="w-5 h-5" />
            Cari Pengguna
          </button>
          <button
            onClick={() => {
              setFilters({ status: 'all', investment_status: 'all', search: '', page: 1, limit: 25 });
              setSearchInput('');
            }}
            className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-2xl flex items-center gap-2 transition-all"
          >
            <Icon icon="mdi:refresh" className="w-5 h-5" />
            Reset Filter
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
                <Icon icon="mdi:account-group" className="text-white w-5 h-5" />
              </div>
              <div>
                <h2 className="text-white font-semibold text-lg">Daftar Pengguna</h2>
                <p className="text-gray-400 text-sm">{totalUsers} pengguna ditemukan</p>
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
                <th className="py-4 px-6 text-left text-gray-300 font-medium">Status</th>
                <th className="py-4 px-6 text-left text-gray-300 font-medium">Status Investasi</th>
                <th className="py-4 px-6 text-left text-gray-300 font-medium">Bergabung</th>
                <th className="py-4 px-6 text-left text-gray-300 font-medium">Saldo</th>
                <th className="py-4 px-6 text-left text-gray-300 font-medium">Total Investasi</th>
                <th className="py-4 px-6 text-center text-gray-300 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user.id} className={`border-b border-white/5 hover:bg-white/5 transition-all duration-300 ${index % 2 === 0 ? 'bg-white/2' : ''}`}>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                        <Icon icon="mdi:account" className="text-white w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{user.name}</p>
                        <p className="text-gray-400 text-sm">+62{user.number}</p>
                        <p className="text-gray-500 text-xs">Ref: {user.reff_code}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.status === 'Active' 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                        : user.status === 'Inactive'
                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {user.status === 'Active' ? 'Aktif' : user.status === 'Inactive' ? 'Tidak Aktif' : 'Tersuspend'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.investment_status === 'Active' 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {user.investment_status === 'Active' ? 'Aktif' : 'Tidak Aktif'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-white text-sm">
                      {new Date(user.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-white font-medium">
                      Rp {user.balance.toLocaleString('id-ID')}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-white font-medium">
                      Rp {user.total_invest.toLocaleString('id-ID')}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => window.location.href = `/panel-admin/users/detail/${user.id}`}
                        className="p-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-xl transition-all duration-300 hover:scale-110"
                        title="Lihat Detail"
                      >
                        <Icon icon="mdi:eye" className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleStatusToggle(user)}
                        className={`p-2 rounded-xl transition-all duration-300 hover:scale-110 ${
                          user.status === 'Suspend' 
                            ? 'bg-green-600/20 hover:bg-green-600/30 text-green-400' 
                            : 'bg-red-600/20 hover:bg-red-600/30 text-red-400'
                        }`}
                        title={user.status === 'Suspend' ? 'Batalkan Suspend' : 'Suspend Pengguna'}
                      >
                        <Icon icon={user.status === 'Suspend' ? 'mdi:account-check' : 'mdi:account-cancel'} className="w-4 h-4" />
                      </button>
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
              Menampilkan {users.length ? ((filters.page - 1) * filters.limit + 1) : 0} sampai{' '}
              {users.length ? ((filters.page - 1) * filters.limit + users.length) : 0} dari{' '}
              {totalUsers} pengguna
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
                disabled={users.length < filters.limit}
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