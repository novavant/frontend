// pages/admin/profile.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Icon } from '@iconify/react';
import AdminLayout from '../../components/admin/Layout';
import useAdminAuth from '../../lib/auth/useAdminAuth';
import { adminRequest } from '../../utils/admin/api';

export default function AdminProfile() {
  const { admin, setAdmin } = useAdminAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  // Form states
  const [profileData, setProfileData] = useState({
    username: '',
    name: '',
    email: ''
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirmation_password: ''
  });

  useEffect(() => {
    loadProfile();
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProfile = async () => {
    try {
      const res = await adminRequest('/profile');
      if (res && res.success && res.data) {
        setProfileData({
          username: res.data.username || 'vla',
          name: res.data.name || 'Vla Devs',
          email: res.data.email || 'admin@vladevs.com'
        });
        // Update global admin state
        setAdmin(res.data);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      setMessage({ type: 'error', text: 'Gagal memuat data profil' });
    }
  };

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const payload = {
        username: profileData.username.trim(),
        name: profileData.name.trim(),
        email: profileData.email.trim()
      };

      const res = await adminRequest('/profile', {
        method: 'PUT',
        body: JSON.stringify(payload)
      });

      if (res && res.success && res.data) {
        // Update global admin state
        setAdmin(res.data);
        setMessage({ type: 'success', text: res.message || 'Profil berhasil diperbarui' });
        // Refresh profile data
        loadProfile();
      } else {
        setMessage({ type: 'error', text: res?.message || 'Gagal memperbarui profil' });
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      setMessage({ type: 'error', text: 'Gagal memperbarui profil' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    // Basic validation
    if (passwordData.new_password !== passwordData.confirmation_password) {
      setMessage({ type: 'error', text: 'Password baru tidak cocok' });
      setLoading(false);
      return;
    }

    if (passwordData.new_password.length < 6) {
      setMessage({ type: 'error', text: 'Password minimal 6 karakter' });
      setLoading(false);
      return;
    }

    try {
      const payload = {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
        confirmation_password: passwordData.confirmation_password
      };

      const res = await adminRequest('/password', {
        method: 'PUT',
        body: JSON.stringify(payload)
      });

      if (res && res.success) {
        setMessage({ type: 'success', text: res.message || 'Password berhasil diperbarui' });
        setPasswordData({
          current_password: '',
          new_password: '',
          confirmation_password: ''
        });
        setShowPasswordModal(false);
      } else {
        setMessage({ type: 'error', text: res?.message || 'Gagal mengubah password' });
      }
    } catch (error) {
      console.error('Failed to update password:', error);
      setMessage({ type: 'error', text: 'Gagal mengubah password' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Profil Administrator">
      <Head>
        <title>Vla Devs | Profil Administrator</title>
        <link rel="icon" type="image/x-icon" href="/vla-logo.png" />
      </Head>

      <div className="space-y-8">
        {/* Header */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-white text-2xl font-bold mb-2">Profil Administrator</h1>
              <p className="text-gray-400">Kelola informasi akun dan keamanan Anda</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center border border-purple-500/50">
                <Icon icon="mdi:account-circle" className="w-8 h-8 text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Message Display */}
        {message.text && (
          <div className={`p-4 rounded-2xl mb-6 border transition-all duration-300 ${
            message.type === 'error' 
              ? 'bg-red-500/20 border-red-500/50 text-red-400' 
              : 'bg-green-500/20 border-green-500/50 text-green-400'
          }`}>
            <div className="flex items-center gap-2">
              <Icon 
                icon={message.type === 'error' ? 'mdi:alert-circle' : 'mdi:check-circle'} 
                className="w-5 h-5" 
              />
              <p className="font-medium">{message.text}</p>
            </div>
          </div>
        )}

        {/* Profile Form */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                <Icon icon="mdi:account" className="text-white w-5 h-5" />
              </div>
              <div>
                <h2 className="text-white font-semibold text-lg">Informasi Profil</h2>
                <p className="text-gray-400 text-sm">Perbarui informasi akun Anda</p>
              </div>
            </div>
          </div>
          
          <form onSubmit={handleProfileSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="username" className="block text-gray-400 text-sm font-medium mb-2">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={profileData.username}
                  onChange={handleProfileChange}
                  className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                  required
                />
              </div>

              <div>
                <label htmlFor="name" className="block text-gray-400 text-sm font-medium mb-2">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={profileData.name}
                  onChange={handleProfileChange}
                  className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="email" className="block text-gray-400 text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <button
                type="button"
                onClick={() => setShowPasswordModal(true)}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-300 hover:scale-105 flex items-center gap-2"
              >
                <Icon icon="mdi:lock-reset" className="w-5 h-5" />
                Ganti Password
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-2xl font-medium hover:from-purple-700 hover:to-pink-700 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Memperbarui...
                  </>
                ) : (
                  <>
                    <Icon icon="mdi:content-save" className="w-5 h-5" />
                    Simpan Perubahan
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900/95 backdrop-blur-xl rounded-3xl w-full max-w-md border border-white/20 shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
                    <Icon icon="mdi:lock-reset" className="text-white w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">Ganti Password</h3>
                    <p className="text-gray-400 text-sm">Masukkan password baru Anda</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <Icon icon="mdi:close" className="text-gray-400 hover:text-white w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div>
                  <label htmlFor="current_password" className="block text-gray-400 text-sm mb-2">Password Saat Ini</label>
                  <input
                    type="password"
                    id="current_password"
                    name="current_password"
                    value={passwordData.current_password}
                    onChange={handlePasswordChange}
                    className="w-full bg-white/10 border border-white/20 text-white rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="new_password" className="block text-gray-400 text-sm mb-2">Password Baru</label>
                  <input
                    type="password"
                    id="new_password"
                    name="new_password"
                    value={passwordData.new_password}
                    onChange={handlePasswordChange}
                    className="w-full bg-white/10 border border-white/20 text-white rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    required
                    minLength={6}
                  />
                  <p className="text-gray-400 text-xs mt-1">Minimal 6 karakter</p>
                </div>
                <div>
                  <label htmlFor="confirmation_password" className="block text-gray-400 text-sm mb-2">Konfirmasi Password Baru</label>
                  <input
                    type="password"
                    id="confirmation_password"
                    name="confirmation_password"
                    value={passwordData.confirmation_password}
                    onChange={handlePasswordChange}
                    className="w-full bg-white/10 border border-white/20 text-white rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-2xl flex items-center justify-center gap-2 transition-all"
                  >
                    <Icon icon="mdi:close" className="w-5 h-5" />
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-600 disabled:to-gray-700 text-white py-3 rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95 disabled:scale-100"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <Icon icon="mdi:lock-reset" className="w-5 h-5" />
                    )}
                    {loading ? 'Mengubah...' : 'Ubah Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}