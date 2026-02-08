// pages/admin/forums.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Icon } from '@iconify/react';
import AdminLayout from '../../components/admin/Layout';
import useAdminAuth from '../../lib/auth/useAdminAuth';
import { adminRequest } from '../../utils/admin/api';
import { useRouter } from 'next/router';
import S3Image from '../../components/S3Image';
import Image from 'next/image';


export default function ForumModeration() {
  const { loading: authLoading } = useAdminAuth();
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    dateFrom: '',
    dateTo: '',
    page: 1,
    limit: 25
  });
  const [searchInput, setSearchInput] = useState('');
  const [totalPosts, setTotalPosts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [rewardAmount, setRewardAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0
  });

  useEffect(() => {
    if (authLoading) return;
    loadPosts();
  }, [authLoading, filters]);

  const loadPosts = async () => {
    setLoading(true);
    setError('');
    try {
      const params = [];
      if (filters.page) params.push(`page=${filters.page}`);
      if (filters.limit) params.push(`limit=${filters.limit}`);
      if (filters.status && filters.status !== 'all') params.push(`status=${filters.status}`);
      if (filters.search) params.push(`search=${encodeURIComponent(filters.search)}`);
      if (filters.dateFrom) params.push(`start_date=${filters.dateFrom}`);
      if (filters.dateTo) params.push(`end_date=${filters.dateTo}`);
      
      const query = params.length ? `?${params.join('&')}` : '';
      const res = await adminRequest(`/forums${query}`, { method: 'GET' });
      
      if (res && res.success && Array.isArray(res.data)) {
        setPosts(res.data);
        setTotalPosts(res.total || res.data.length);
        setTotalPages(Math.ceil((res.total || res.data.length) / filters.limit));
        
        // Calculate stats
        const statsData = res.data.reduce((acc, post) => {
          acc.total++;
          const status = post.status.toLowerCase();
          if (status === 'pending') acc.pending++;
          else if (status === 'accepted') acc.accepted++;
          else if (status === 'rejected') acc.rejected++;
          return acc;
        }, { total: 0, pending: 0, accepted: 0, rejected: 0 });
        setStats(statsData);
      } else {
        setPosts([]);
        setTotalPosts(0);
        setTotalPages(1);
        setStats({ total: 0, pending: 0, accepted: 0, rejected: 0 });
        setError(res?.message || 'Gagal memuat data forum');
      }
    } catch (err) {
      console.error('Failed to load forum posts:', err);
      setError('Gagal memuat data forum');
      setPosts([]);
      setTotalPosts(0);
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

  const handleAction = (post, action) => {
    setSelectedPost(post);
    setActionType(action);
    setRewardAmount(action === 'accept' ? '2000' : ''); // Default reward
    setError('');
    setShowActionModal(true);
  };

  const confirmAction = async () => {
    if (!selectedPost) return;
    
    setProcessing(true);
    setError('');
    try {
      let res;
      if (actionType === 'accept') {
        const reward = Number(rewardAmount) || 0;
        res = await adminRequest(`/forums/${selectedPost.id}/approve`, { 
          method: 'PUT',
          body: JSON.stringify({ reward })
        });
      } else if (actionType === 'reject') {
        res = await adminRequest(`/forums/${selectedPost.id}/reject`, { 
          method: 'PUT' 
        });
      }
      
      if (res && res.success) {
        loadPosts(); // Reload data
        setShowActionModal(false);
        setRewardAmount('');
      } else {
        setError(res?.message || 'Gagal memproses forum post');
      }
    } catch (err) {
      console.error('Failed to process forum action:', err);
      setError(err?.message || 'Gagal memproses forum post');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { class: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', label: 'Menunggu' },
      accepted: { class: 'bg-green-500/20 text-green-400 border-green-500/30', label: 'Disetujui' },
      rejected: { class: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'Ditolak' }
    };
    
    const config = statusConfig[status.toLowerCase()] || statusConfig.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${config.class}`}>
        {config.label}
      </span>
    );
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
            <p className="text-white font-medium text-lg">Memuat Data Forum...</p>
            <p className="text-gray-400 text-sm mt-1">Harap tunggu sebentar</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout title="Kelola Forum">
      <Head>
        <title>Vla Devs | Kelola Forum</title>
        <link rel="icon" type="image/x-icon" href="/vla-logo.png" />
      </Head>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Post Forum" value={stats.total} icon="mdi:forum" color="blue" />
        <StatCard title="Menunggu" value={stats.pending} icon="mdi:clock-alert" color="yellow" />
        <StatCard title="Disetujui" value={stats.accepted} icon="mdi:check-circle" color="green" />
        <StatCard title="Ditolak" value={stats.rejected} icon="mdi:close-circle" color="red" />
      </div>

      {/* Filter Section */}
      <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
            <Icon icon="mdi:filter-variant" className="text-white w-5 h-5" />
          </div>
          <div>
            <h2 className="text-white font-semibold text-lg">Filter & Pencarian</h2>
            <p className="text-gray-400 text-sm">Cari dan filter post forum berdasarkan kriteria</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Search */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Pencarian</label>
            <div className="relative">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Cari berdasarkan nama atau nomor telepon pengguna..."
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
              <option value="Accepted">Disetujui</option>
              <option value="Rejected">Ditolak</option>
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
            Cari Post Forum
          </button>
          <button
            onClick={() => {
              setFilters({ status: 'all', search: '', dateFrom: '', dateTo: '', page: 1, limit: 25 });
              setSearchInput('');
            }}
            className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-2xl flex items-center gap-2 transition-all"
          >
            <Icon icon="mdi:refresh" className="w-5 h-5" />
            Reset Filter
          </button>
        </div>
      </div>

      {/* Posts List */}
      <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Icon icon="mdi:forum" className="text-white w-5 h-5" />
              </div>
              <div>
                <h2 className="text-white font-semibold text-lg">Post Forum</h2>
                <p className="text-gray-400 text-sm">{totalPosts} post ditemukan</p>
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

        <div className="p-6">
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <Icon icon="mdi:forum-remove" className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-gray-400 text-lg font-medium mb-2">Tidak Ada Post Forum</h3>
              <p className="text-gray-500">
                {filters.status === 'all' 
                  ? 'Belum ada post forum yang tersedia.' 
                  : `Tidak ada post dengan status ${filters.status}.`}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <div key={post.id} className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        <h3 className="text-white font-semibold text-lg">Forum #{post.id}</h3>
                        {getStatusBadge(post.status)}
                        {post.reward > 0 && (
                          <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium border border-green-500/30">
                            <Icon icon="mdi:gift" className="w-3 h-3 inline mr-1" />
                            Rp {post.reward.toLocaleString('id-ID')}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-300 mb-4 leading-relaxed">{post.description}</p>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
                            <Icon icon="mdi:account" className="w-3 h-3 text-white" />
                          </div>
                          <span>{post.username}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Icon icon="mdi:phone" className="w-4 h-4" />
                          <span>+62{post.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Icon icon="mdi:clock" className="w-4 h-4" />
                          <span>{formatDate(post.created_at)}</span>
                        </div>
                      </div>
                      
                      {post.image && (
                                            <div className="mt-4">
                                              <label className="block text-sm text-gray-400 mb-2">Gambar Terlampir</label>
                                              <div className="max-w-xs">
                                                <div className="relative inline-block">
                                                  <S3Image
                                                    imageKey={post.image}
                                                    className="w-40 h-28 object-cover rounded-2xl border border-white/20 hover:border-white/40 transition-all"
                                                  />
                                                  <button
                                                    onClick={async (e) => {
                                                      e.stopPropagation();
                                                      try {
                                                        const res = await fetch(`/api/s3-image?key=${encodeURIComponent(post.image)}`);
                                                        const j = await res.json();
                                                        if (j && j.url) {
                                                          const evt = new CustomEvent('admin-open-image', { detail: { url: j.url } });
                                                          window.dispatchEvent(evt);
                                                        }
                                                      } catch (err) { console.error(err); }
                                                    }}
                                                    className="absolute inset-0 w-full h-full bg-transparent rounded-2xl"
                                                    aria-label="Preview image"
                                                  />
                                                </div>
                                              </div>
                                            </div>
                      )}
                    </div>
                    
                    <div className="flex lg:flex-col gap-3 lg:min-w-[140px]">
                      <button
                        onClick={() => router.push(`/panel-admin/forums/${post.id}`)}
                        className="flex-1 lg:flex-none bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 px-4 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105"
                      >
                        <Icon icon="mdi:eye" className="w-4 h-4" />
                        <span className="font-medium">Detail</span>
                      </button>
                      
                      {post.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => handleAction(post, 'accept')}
                            className="flex-1 lg:flex-none bg-green-600/20 hover:bg-green-600/30 text-green-400 px-4 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105"
                          >
                            <Icon icon="mdi:check" className="w-4 h-4" />
                            <span className="font-medium">Setuju</span>
                          </button>
                          <button
                            onClick={() => handleAction(post, 'reject')}
                            className="flex-1 lg:flex-none bg-red-600/20 hover:bg-red-600/30 text-red-400 px-4 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105"
                          >
                            <Icon icon="mdi:close" className="w-4 h-4" />
                            <span className="font-medium">Tolak</span>
                          </button>
                        </>
                      )}
                      
                      {post.status !== 'Pending' && (
                        <div className="flex-1 lg:flex-none text-center py-3 text-gray-500 text-sm">
                          Status sudah diproses
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="p-6 border-t border-white/10 bg-white/2">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-gray-400 text-sm">
              Menampilkan {posts.length ? ((filters.page - 1) * filters.limit + 1) : 0} sampai{' '}
              {posts.length ? ((filters.page - 1) * filters.limit + posts.length) : 0} dari{' '}
              {totalPosts} post
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
                disabled={posts.length < filters.limit}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:text-gray-600 text-white rounded-xl transition-all duration-300 disabled:cursor-not-allowed"
              >
                <Icon icon="mdi:chevron-right" className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Action Confirmation Modal */}
      {showActionModal && selectedPost && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900/95 backdrop-blur-xl rounded-3xl w-full max-w-md border border-white/20 shadow-2xl">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  actionType === 'accept' 
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600' 
                    : 'bg-gradient-to-r from-red-600 to-pink-600'
                }`}>
                  <Icon 
                    icon={actionType === 'accept' ? 'mdi:check' : 'mdi:close'} 
                    className="text-white w-5 h-5" 
                  />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">
                    {actionType === 'accept' ? 'Setujui Post Forum' : 'Tolak Post Forum'}
                  </h3>
                  <p className="text-gray-400 text-sm">Konfirmasi tindakan moderasi</p>
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-4 mb-6">
                {selectedPost.image && (
                  <div className="max-w-32">
                    <div className="relative inline-block">
                      <S3Image
                        imageKey={selectedPost.image}
                        className="w-36 h-24 object-cover rounded-lg border border-white/20"
                      />
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            const res = await fetch(`/api/s3-image?key=${encodeURIComponent(selectedPost.image)}`);
                            const j = await res.json();
                            if (j && j.url) {
                              const evt = new CustomEvent('admin-open-image', { detail: { url: j.url } });
                              window.dispatchEvent(evt);
                            }
                          } catch (err) { console.error(err); }
                        }}
                        className="absolute inset-0 w-full h-full bg-transparent rounded-lg"
                        aria-label="Preview image"
                      />
                    </div>
                  </div>
                )}
              </div>

              {actionType === 'accept' && (
                <div className="mb-6">
                  <label className="block text-gray-400 text-sm mb-2">Jumlah Reward (Rp)</label>
                  <input
                    type="number"
                    value={rewardAmount}
                    onChange={e => setRewardAmount(e.target.value)}
                    placeholder="2000"
                    min="0"
                    className="w-full bg-white/10 border border-white/20 text-white rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                  <p className="text-gray-500 text-xs mt-1">Masukkan jumlah reward yang akan diberikan kepada user</p>
                </div>
              )}

              {actionType === 'accept' && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Icon icon="mdi:information" className="w-5 h-5 text-green-400 mt-0.5" />
                    <div>
                      <p className="text-green-400 font-medium text-sm">Informasi</p>
                      <p className="text-green-300 text-sm">
                        Post akan disetujui dan user akan mendapatkan reward sesuai jumlah yang dimasukkan.
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
                  disabled={processing}
                  className={`flex-1 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95 disabled:scale-100 disabled:opacity-50 disabled:cursor-not-allowed ${
                    actionType === 'accept' 
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700' 
                      : 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700'
                  } text-white`}
                >
                  {processing ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <Icon icon={actionType === 'accept' ? 'mdi:check' : 'mdi:close'} className="w-4 h-4" />
                  )}
                  {processing ? 'Memproses...' : actionType === 'accept' ? 'Setujui' : 'Tolak'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Image Preview Modal (opened via dispatch 'admin-open-image') */}
      <ImagePreviewModal />
    </AdminLayout>
  );
}

// Image preview modal component listens for `admin-open-image` events
function ImagePreviewModal() {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');

  useEffect(() => {
    const handler = (e) => {
      setUrl(e.detail?.url || '');
      setOpen(true);
    };
    window.addEventListener('admin-open-image', handler);
    const esc = (ev) => { if (ev.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', esc);
    return () => {
      window.removeEventListener('admin-open-image', handler);
      window.removeEventListener('keydown', esc);
    };
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setOpen(false)}>
      <div className="relative max-w-full max-h-full" onClick={(e) => e.stopPropagation()}>
        <button 
          onClick={() => setOpen(false)} 
          className="absolute -top-3 -right-3 bg-red-500/80 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg transition-all z-50"
          aria-label="Tutup"
        >
          <Icon icon="mdi:close" className="w-5 h-5" />
        </button>
        <Image 
          src={url} 
          alt="Preview" 
          unoptimized
          width={800}
          height={600}
          className="max-h-[80vh] max-w-[80vw] rounded-2xl shadow-2xl border-2 border-white/10 object-contain bg-gray-900" 
        />
      </div>
    </div>
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