// pages/admin/forums/[id].js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Icon } from '@iconify/react';
import AdminLayout from '../../../components/admin/Layout';
import { adminRequest } from '../../../utils/admin/api';
import S3Image from '../../../components/S3Image';
import Image from 'next/image';

export default function ForumDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [forum, setForum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [rewardAmount, setRewardAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadForumDetail();
  }, [id]);

  const loadForumDetail = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminRequest(`/forums?id=${id}`, { method: 'GET' });
      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        setForum(res.data[0]);
        setRewardAmount(res.data[0].reward || '2000'); // Default reward
      } else {
        setError(res?.message || 'Forum tidak ditemukan');
      }
    } catch (err) {
      console.error('Failed to load forum detail:', err);
      setError('Gagal memuat detail forum');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (type) => {
    setActionType(type);
    setError('');
    setShowActionModal(true);
  };

  const confirmAction = async () => {
    if (!forum) return;
    
    setProcessing(true);
    setError('');
    try {
      let res;
      if (actionType === 'approve') {
        const reward = Number(rewardAmount) || 0;
        res = await adminRequest(`/forums/${forum.id}/approve`, { 
          method: 'PUT', 
          body: JSON.stringify({ reward }) 
        });
      } else if (actionType === 'reject') {
        res = await adminRequest(`/forums/${forum.id}/reject`, { 
          method: 'PUT' 
        });
      }
      
      if (res && res.success) {
        loadForumDetail(); // Reload data
        setShowActionModal(false);
      } else {
        setError(res?.message || 'Gagal memproses forum');
      }
    } catch (err) {
      console.error('Failed to process forum action:', err);
      setError(err?.message || 'Gagal memproses forum');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusConfig = (status) => {
    const statusConfigs = {
      pending: { 
        class: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', 
        label: 'Menunggu',
        icon: 'mdi:clock-alert'
      },
      accepted: { 
        class: 'bg-green-500/20 text-green-400 border-green-500/30', 
        label: 'Disetujui',
        icon: 'mdi:check-circle'
      },
      rejected: { 
        class: 'bg-red-500/20 text-red-400 border-red-500/30', 
        label: 'Ditolak',
        icon: 'mdi:close-circle'
      }
    };
    
    return statusConfigs[status?.toLowerCase()] || statusConfigs.pending;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-400/30 border-t-purple-400 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-pink-400 rounded-full animate-spin animation-delay-150"></div>
          </div>
          <div className="mt-6 text-center">
            <p className="text-white font-medium text-lg">Memuat Detail Forum...</p>
            <p className="text-gray-400 text-sm mt-1">Harap tunggu sebentar</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !forum) {
    return (
      <AdminLayout title="Detail Forum">
        <div className="flex flex-col items-center justify-center min-h-96">
          <Icon icon="mdi:forum-remove" className="w-16 h-16 text-red-400 mb-4" />
          <h3 className="text-white text-xl font-semibold mb-2">Forum Tidak Ditemukan</h3>
          <p className="text-gray-400 text-center mb-6">{error || 'Forum dengan ID tersebut tidak ada atau telah dihapus.'}</p>
          <button 
            onClick={() => router.push('/panel-admin/forums')}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors"
          >
            Kembali ke Daftar Forum
          </button>
        </div>
      </AdminLayout>
    );
  }

  const statusConfig = getStatusConfig(forum.status);

  return (
    <AdminLayout title={`Detail Forum #${forum.id}`}>
      <Head>
        <title>Vla Devs | Detail Forum #{forum.id}</title>
        <link rel="icon" type="image/x-icon" href="/vla-logo.png" />
      </Head>

      {/* Header */}
      <div className="mb-8">
        <button 
          onClick={() => router.push('/panel-admin/forums')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
        >
          <Icon icon="mdi:arrow-left" className="w-5 h-5" />
          Kembali ke Daftar Forum
        </button>
        
        <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 backdrop-blur-xl rounded-3xl p-6 border border-indigo-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center">
                <Icon icon="mdi:forum" className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-white text-2xl font-bold">Forum #{forum.id}</h1>
                <p className="text-gray-300">Post oleh {forum.username}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusConfig.class}`}>
                    <Icon icon={statusConfig.icon} className="w-4 h-4 inline mr-1" />
                    {statusConfig.label}
                  </span>
                  {forum.reward > 0 && (
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium border border-green-500/30">
                      <Icon icon="mdi:gift" className="w-4 h-4 inline mr-1" />
                      Rp {forum.reward.toLocaleString('id-ID')}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {forum.status === 'Pending' && (
              <div className="flex gap-3">
                <button
                  onClick={() => handleAction('approve')}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-2xl flex items-center gap-2 transition-all duration-300 hover:scale-105"
                >
                  <Icon icon="mdi:check" className="w-5 h-5" />
                  Setujui
                </button>
                <button
                  onClick={() => handleAction('reject')}
                  className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-2xl flex items-center gap-2 transition-all duration-300 hover:scale-105"
                >
                  <Icon icon="mdi:close" className="w-5 h-5" />
                  Tolak
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Forum Content */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
                <Icon icon="mdi:text" className="text-white w-5 h-5" />
              </div>
              <div>
                <h2 className="text-white font-semibold text-lg">Konten Post</h2>
                <p className="text-gray-400 text-sm">Deskripsi yang ditulis oleh pengguna</p>
              </div>
            </div>

            <div className="bg-white/5 rounded-2xl p-6">
              <p className="text-white leading-relaxed text-base">
                {forum.description}
              </p>
            </div>
          </div>

          {/* Image if exists */}
          {forum.image && (
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                  <Icon icon="mdi:image" className="text-white w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-white font-semibold text-lg">Gambar Terlampir</h2>
                  <p className="text-gray-400 text-sm">File gambar yang diupload pengguna</p>
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-6">
                <div className="flex justify-center">
                  <div className="relative inline-block">
                    <S3Image
                      imageKey={forum.image}
                      className="w-72 h-44 object-cover rounded-2xl border border-white/20 hover:border-white/40 transition-all"
                    />
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          const res = await fetch(`/api/s3-image?key=${encodeURIComponent(forum.image)}`);
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
            </div>
          )}

      {/* Image Preview Modal for detail page */}
      <DetailImagePreview />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* User Information */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
                <Icon icon="mdi:account" className="text-white w-5 h-5" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Informasi Pengguna</h3>
                <p className="text-gray-400 text-sm">Data pemilik post</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white/5 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Username</span>
                  <Icon icon="mdi:account-circle" className="text-blue-400 w-4 h-4" />
                </div>
                <div className="text-white font-medium text-lg">
                  {forum.username}
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Nomor Telepon</span>
                  <Icon icon="mdi:phone" className="text-purple-400 w-4 h-4" />
                </div>
                <div className="text-white font-medium text-lg">
                  +62{forum.phone}
                </div>
              </div>
            </div>
          </div>

          {/* Forum Statistics */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                <Icon icon="mdi:chart-line" className="text-white w-5 h-5" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Statistik Forum</h3>
                <p className="text-gray-400 text-sm">Informasi post</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white/5 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Current Reward</span>
                  <Icon icon="mdi:gift" className="text-green-400 w-4 h-4" />
                </div>
                <div className="text-white font-bold text-lg">
                  Rp {forum.reward.toLocaleString('id-ID')}
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Status</span>
                  <Icon icon={statusConfig.icon} className={statusConfig.class.split(' ')[1]} />
                </div>
                <div className={`font-bold text-lg ${statusConfig.class.split(' ')[1]}`}>
                  {statusConfig.label}
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Tanggal Post</span>
                  <Icon icon="mdi:calendar" className="text-blue-400 w-4 h-4" />
                </div>
                <div className="text-white font-medium">
                  {formatDate(forum.created_at)}
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Forum ID</span>
                  <Icon icon="mdi:pound" className="text-gray-400 w-4 h-4" />
                </div>
                <div className="text-white font-mono text-lg">
                  #{forum.id}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          {forum.status === 'Pending' && (
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl flex items-center justify-center">
                  <Icon icon="mdi:lightning-bolt" className="text-white w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Aksi Moderasi</h3>
                  <p className="text-gray-400 text-sm">Proses post forum</p>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleAction('approve')}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white p-4 rounded-2xl flex items-center gap-3 transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                    <Icon icon="mdi:check" className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Setujui Post</div>
                    <div className="text-xs text-green-200">Berikan reward kepada pengguna</div>
                  </div>
                </button>

                <button
                  onClick={() => handleAction('reject')}
                  className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white p-4 rounded-2xl flex items-center gap-3 transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                    <Icon icon="mdi:close" className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Tolak Post</div>
                    <div className="text-xs text-red-200">Post tidak memenuhi kriteria</div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Confirmation Modal */}
      {showActionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900/95 backdrop-blur-xl rounded-3xl w-full max-w-md border border-white/20 shadow-2xl">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  actionType === 'approve' 
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600' 
                    : 'bg-gradient-to-r from-red-600 to-pink-600'
                }`}>
                  <Icon 
                    icon={actionType === 'approve' ? 'mdi:check' : 'mdi:close'} 
                    className="text-white w-5 h-5" 
                  />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">
                    {actionType === 'approve' ? 'Setujui Forum' : 'Tolak Forum'}
                  </h3>
                  <p className="text-gray-400 text-sm">Konfirmasi tindakan moderasi</p>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-2xl p-4 mb-6">
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-400 text-sm">Forum ID</p>
                    <p className="text-white font-medium">#{forum.id}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Username</p>
                    <p className="text-white font-medium">{forum.username}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">User ID</p>
                    <p className="text-white font-medium">#{forum.user_id}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Current Reward</p>
                    <p className="text-white font-medium">Rp {forum.reward.toLocaleString('id-ID')}</p>
                  </div>
                </div>
              </div>

              {actionType === 'approve' && (
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
                  <p className="text-gray-500 text-xs mt-1">Masukkan jumlah reward yang akan diberikan</p>
                </div>
              )}

              {actionType === 'approve' && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Icon icon="mdi:information" className="w-5 h-5 text-green-400 mt-0.5" />
                    <div>
                      <p className="text-green-400 font-medium text-sm">Konfirmasi Persetujuan</p>
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
                    actionType === 'approve' 
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700' 
                      : 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700'
                  } text-white`}
                >
                  {processing ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <Icon icon={actionType === 'approve' ? 'mdi:check' : 'mdi:close'} className="w-4 h-4" />
                  )}
                  {processing ? 'Memproses...' : actionType === 'approve' ? 'Setujui' : 'Tolak'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

function DetailImagePreview() {
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