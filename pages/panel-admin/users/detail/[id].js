// pages/admin/users/detail/[id].js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Icon } from '@iconify/react';
import AdminLayout from '../../../../components/admin/Layout';
import { adminRequest } from '../../../../utils/admin/api';

export default function UserDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [password, setPassword] = useState('');
  const [balanceAmount, setBalanceAmount] = useState('');
  const [balanceType, setBalanceType] = useState('add');
  const [editData, setEditData] = useState({ name: '', number: '', status: '', investment_status: '', status_publisher: '', user_mode: '' });
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadUserDetail();
  }, [id]);

  const loadUserDetail = async () => {
    setLoading(true);
    try {
      const res = await adminRequest(`/users/${id}`, { method: 'GET' });
      if (res && res.success && res.data) {
        setUser(res.data);
        setEditData({
          name: res.data.name,
          number: res.data.number,
          status: res.data.status,
          investment_status: res.data.investment_status,
          status_publisher: res.data.status_publisher,
          user_mode: res.data.user_mode
        });
      }
    } catch (error) {
      console.error('Failed to load user detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = async () => {
    setError('');
    setSaving(true);
    try {
      const res = await adminRequest(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(editData)
      });
      if (res && res.success && res.data) {
        setUser(res.data);
        setEditMode(false);
        // Show success message
      } else if (res && res.message) {
        setError(res.message);
      }
    } catch (error) {
      setError('Gagal memperbarui data pengguna');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    setError('');
    if (password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }
    setSaving(true);
    try {
      const res = await adminRequest(`/users/password/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ password })
      });
      if (res && res.success) {
        setShowPasswordModal(false);
        setPassword('');
        // Show success message
      } else if (res && res.message) {
        setError(res.message);
      }
    } catch (error) {
      setError('Gagal memperbarui password');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateBalance = async () => {
    setError('');
    if (!balanceAmount || isNaN(balanceAmount) || Number(balanceAmount) <= 0) {
      setError('Masukkan jumlah saldo yang valid');
      return;
    }
    setSaving(true);
    try {
      const res = await adminRequest(`/users/balance/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ amount: Number(balanceAmount), type: balanceType })
      });
      if (res && res.success) {
        setShowBalanceModal(false);
        setBalanceAmount('');
        loadUserDetail(); // Reload user data
      } else if (res && res.message) {
        setError(res.message);
      }
    } catch (error) {
      setError('Gagal memperbarui saldo');
    } finally {
      setSaving(false);
    }
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
            <p className="text-white font-medium text-lg">Memuat Detail Pengguna...</p>
            <p className="text-gray-400 text-sm mt-1">Harap tunggu sebentar</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <AdminLayout title="Detail Pengguna">
        <div className="flex flex-col items-center justify-center min-h-96">
          <Icon icon="mdi:account-alert" className="w-16 h-16 text-red-400 mb-4" />
          <h3 className="text-white text-xl font-semibold mb-2">Pengguna Tidak Ditemukan</h3>
          <p className="text-gray-400 text-center mb-6">Pengguna dengan ID tersebut tidak ada atau telah dihapus.</p>
          <button 
            onClick={() => router.push('/panel-admin/users')}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors"
          >
            Kembali ke Daftar Pengguna
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={`Detail Pengguna - ${user.name}`}>
      <Head>
        <title>Vla Devs | Detail Pengguna - {user.name}</title>
        <link rel="icon" type="image/x-icon" href="/vla-logo.png" />
      </Head>

      {/* Header */}
      <div className="mb-8">
        <button 
          onClick={() => router.push('/panel-admin/users')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
        >
          <Icon icon="mdi:arrow-left" className="w-5 h-5" />
          Kembali ke Daftar Pengguna
        </button>
        
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-xl rounded-3xl p-6 border border-purple-500/20">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center">
              <Icon icon="mdi:account" className="text-white text-2xl" />
            </div>
            <div className="flex-1">
              <h1 className="text-white text-2xl font-bold">{user.name}</h1>
              <p className="text-gray-300">+62{user.number}</p>
              <div className="flex items-center gap-4 mt-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  user.status === 'Active' 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                    : user.status === 'Inactive'
                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  Status: {user.status === 'Active' ? 'Aktif' : user.status === 'Inactive' ? 'Tidak Aktif' : 'Tersuspend'}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  user.investment_status === 'Active' 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  Investasi: {user.investment_status === 'Active' ? 'Aktif' : 'Tidak Aktif'}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  user.status_publisher === 'Active' 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : user.status_publisher === 'Inactive'
                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    : user.status_publisher === 'Suspend'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                }`}>
                  Publisher: {user.status_publisher === 'Active' ? 'Aktif' : user.status_publisher === 'Inactive' ? 'Tidak Aktif' : 'Tersuspend'}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  user.user_mode === 'real' 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  User Mode: {user.user_mode === 'real' ? 'Real' : 'Promotor'}
                  </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Information */}
        <div className="lg:col-span-2">
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
                  <Icon icon="mdi:account-edit" className="text-white w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-white font-semibold text-lg">Informasi Pengguna</h2>
                  <p className="text-gray-400 text-sm">Data lengkap pengguna</p>
                </div>
              </div>
              {!editMode && (
                <button
                  onClick={() => setEditMode(true)}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-300"
                >
                  <Icon icon="mdi:pencil" className="w-4 h-4" />
                  Edit Data
                </button>
              )}
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-2xl text-sm mb-6">
                <div className="flex items-center gap-2">
                  <Icon icon="mdi:alert-circle" className="w-4 h-4" />
                  {error}
                </div>
              </div>
            )}

            <div className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">Nama Lengkap</label>
                {editMode ? (
                  <input 
                    type="text"
                    value={editData.name} 
                    onChange={e => setEditData(d => ({ ...d, name: e.target.value }))}
                    className="w-full bg-white/10 border border-white/20 text-white rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                ) : (
                  <div className="bg-white/5 rounded-2xl px-4 py-3 text-white font-medium">
                    {user.name}
                  </div>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">Nomor Telepon</label>
                {editMode ? (
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">+62</span>
                    <input 
                      type="text"
                      value={editData.number} 
                      onChange={e => setEditData(d => ({ ...d, number: e.target.value }))}
                      className="w-full bg-white/10 border border-white/20 text-white rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                ) : (
                  <div className="bg-white/5 rounded-2xl px-4 py-3 text-white font-medium">
                    +62{user.number}
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Status Pengguna</label>
                  {editMode ? (
                    <select 
                      value={editData.status} 
                      onChange={e => setEditData(d => ({ ...d, status: e.target.value }))}
                      className="w-full bg-white/10 border border-white/20 text-white rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark-select"
                    >
                      <option value="Active">Aktif</option>
                      <option value="Inactive">Tidak Aktif</option>
                      <option value="Suspend">Tersuspend</option>
                    </select>
                  ) : (
                    <div className="bg-white/5 rounded-2xl px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.status === 'Active' 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                          : user.status === 'Inactive'
                          ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {user.status === 'Active' ? 'Aktif' : user.status === 'Inactive' ? 'Tidak Aktif' : 'Tersuspend'}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Status Investasi</label>
                  {editMode ? (
                    <select 
                      value={editData.investment_status} 
                      onChange={e => setEditData(d => ({ ...d, investment_status: e.target.value }))}
                      className="w-full bg-white/10 border border-white/20 text-white rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="Active">Aktif</option>
                      <option value="Inactive">Tidak Aktif</option>
                    </select>
                  ) : (
                    <div className="bg-white/5 rounded-2xl px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.investment_status === 'Active' 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {user.investment_status === 'Active' ? 'Aktif' : 'Tidak Aktif'}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Status Publisher</label>
                  {editMode ? (
                    <select 
                      value={editData.status_publisher} 
                      onChange={e => setEditData(d => ({ ...d, status_publisher: e.target.value }))}
                      className="w-full bg-white/10 border border-white/20 text-white rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="Active">Aktif</option>
                      <option value="Inactive">Tidak Aktif</option>
                      <option value="Suspend">Tersuspend</option>
                    </select>
                  ) : (
                    <div className="bg-white/5 rounded-2xl px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.status_publisher === 'Active' 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : user.status_publisher === 'Inactive'
                          ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                          : user.status_publisher === 'Suspend'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                      }`}>
                        {user.status_publisher === 'Active' ? 'Aktif' : user.status_publisher === 'Inactive' ? 'Tidak Aktif' : 'Tersuspend'}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">User Mode</label>
                  {editMode ? (
                    <select 
                      value={editData.user_mode} 
                      onChange={e => setEditData(d => ({ ...d, user_mode: e.target.value }))}
                      className="w-full bg-white/10 border border-white/20 text-white rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="real">Real</option>
                      <option value="promotor">Promotor</option>
                    </select>
                  ) : (
                    <div className="bg-white/5 rounded-2xl px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.user_mode === 'real' 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : user.user_mode === 'promotor'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                      }`}>
                        {user.user_mode === 'real' ? 'Real' : 'Promotor'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {editMode && (
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={handleEditUser}
                    disabled={saving}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95 disabled:scale-100"
                  >
                    {saving ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <Icon icon="mdi:content-save" className="w-4 h-4" />
                    )}
                    {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                  <button
                    onClick={() => {
                      setEditMode(false);
                      setError('');
                      setEditData({
                        name: user.name,
                        number: user.number,
                        status: user.status,
                        investment_status: user.investment_status,
                        status_publisher: user.status_publisher,
                        user_mode: user.user_mode ?? 'real'
                      });
                    }}
                    className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-2xl flex items-center gap-2 transition-all"
                  >
                    <Icon icon="mdi:close" className="w-4 h-4" />
                    Batal
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Statistics */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                <Icon icon="mdi:chart-line" className="text-white w-5 h-5" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Statistik</h3>
                <p className="text-gray-400 text-sm">Ringkasan aktivitas</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white/5 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Saldo Aktif</span>
                  <Icon icon="mdi:wallet" className="text-green-400 w-4 h-4" />
                </div>
                <div className="text-white font-bold text-lg">
                  Rp {user.balance.toLocaleString('id-ID')}
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Total Investasi</span>
                  <Icon icon="mdi:chart-box" className="text-purple-400 w-4 h-4" />
                </div>
                <div className="text-white font-bold text-lg">
                  Rp {user.total_invest.toLocaleString('id-ID')}
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Tiket Spin</span>
                  <Icon icon="mdi:ticket" className="text-yellow-400 w-4 h-4" />
                </div>
                <div className="text-white font-bold text-lg">
                  {user.spin_ticket.toLocaleString('id-ID')}
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Kode Referral</span>
                  <Icon icon="mdi:account-multiple" className="text-blue-400 w-4 h-4" />
                </div>
                <div className="text-white font-bold text-lg">
                  {user.reff_code || '-'}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                <Icon icon="mdi:lightning-bolt" className="text-white w-5 h-5" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Aksi Cepat</h3>
                <p className="text-gray-400 text-sm">Kelola akun pengguna</p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => { setShowBalanceModal(true); setError(''); }}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white p-4 rounded-2xl flex items-center gap-3 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                  <Icon icon="mdi:cash-plus" className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Kelola Saldo</div>
                  <div className="text-xs text-green-200">Tambah atau kurangi saldo</div>
                </div>
              </button>

              <button
                onClick={() => { setShowPasswordModal(true); setError(''); }}
                className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white p-4 rounded-2xl flex items-center gap-3 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                  <Icon icon="mdi:lock-reset" className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Reset Password</div>
                  <div className="text-xs text-yellow-200">Ganti kata sandi pengguna</div>
                </div>
              </button>
            </div>
          </div>

          {/* User Info */}
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
                <span className="text-gray-400">User ID</span>
                <span className="text-white font-medium">#{user.id}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-gray-400">Bergabung</span>
                <span className="text-white font-medium">
                  {new Date(user.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
              {user.updated_at && (
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-gray-400">Terakhir Update</span>
                  <span className="text-white font-medium">
                    {new Date(user.updated_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-400">Referral By</span>
                <span className="text-white font-medium">
                  {user.reff_by ? `User #${user.reff_by}` : 'Tidak ada'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900/95 backdrop-blur-xl rounded-3xl w-full max-w-md border border-white/20 shadow-2xl">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl flex items-center justify-center">
                  <Icon icon="mdi:lock-reset" className="text-white w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">Reset Password</h3>
                  <p className="text-gray-400 text-sm">Masukkan password baru untuk pengguna</p>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-2xl text-sm mb-4">
                  <div className="flex items-center gap-2">
                    <Icon icon="mdi:alert-circle" className="w-4 h-4" />
                    {error}
                  </div>
                </div>
              )}

              <div className="mb-6">
                <label className="block text-gray-400 text-sm mb-2">Password Baru</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full bg-white/10 border border-white/20 text-white rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleUpdatePassword}
                  disabled={saving}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 text-white py-3 rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95 disabled:scale-100"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <Icon icon="mdi:content-save" className="w-4 h-4" />
                  )}
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
                <button
                  onClick={() => { setShowPasswordModal(false); setError(''); setPassword(''); }}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-2xl flex items-center justify-center gap-2 transition-all"
                >
                  <Icon icon="mdi:close" className="w-4 h-4" />
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Balance Modal */}
      {showBalanceModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900/95 backdrop-blur-xl rounded-3xl w-full max-w-md border border-white/20 shadow-2xl">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                  <Icon icon="mdi:cash-plus" className="text-white w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">Kelola Saldo</h3>
                  <p className="text-gray-400 text-sm">Tambah atau kurangi saldo pengguna</p>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-2xl text-sm mb-4">
                  <div className="flex items-center gap-2">
                    <Icon icon="mdi:alert-circle" className="w-4 h-4" />
                    {error}
                  </div>
                </div>
              )}

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Saldo Saat Ini</label>
                  <div className="bg-white/5 rounded-2xl px-4 py-3 text-white font-medium">
                    Rp {user.balance.toLocaleString('id-ID')}
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Jenis Operasi</label>
                  <select
                    value={balanceType}
                    onChange={e => setBalanceType(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 text-white rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all dark-select"
                  >
                    <option value="add">Tambah Saldo</option>
                    <option value="less">Kurangi Saldo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Jumlah</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={balanceAmount}
                    onChange={e => setBalanceAmount(e.target.value)}
                    placeholder="Masukkan jumlah saldo"
                    className="w-full bg-white/10 border border-white/20 text-white rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleUpdateBalance}
                  disabled={saving}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 text-white py-3 rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95 disabled:scale-100"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <Icon icon="mdi:content-save" className="w-4 h-4" />
                  )}
                  {saving ? 'Memproses...' : 'Simpan'}
                </button>
                <button
                  onClick={() => { setShowBalanceModal(false); setError(''); setBalanceAmount(''); }}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-2xl flex items-center justify-center gap-2 transition-all"
                >
                  <Icon icon="mdi:close" className="w-4 h-4" />
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}