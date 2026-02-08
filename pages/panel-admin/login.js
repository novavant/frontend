// pages/admin/login.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Icon } from '@iconify/react';
import { adminLogin } from '../../utils/admin/api';
import Image from 'next/image';

export default function AdminLogin() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isAnimated, setIsAnimated] = useState(false);
  const router = useRouter();

  // Animation trigger on mount
  useEffect(() => {
    setIsAnimated(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await adminLogin({ 
        username: credentials.username, 
        password: credentials.password,
        remember: rememberMe 
      });
      
      if (res && res.success) {
        // Show success animation before redirect
        setTimeout(() => {
          router.push('/panel-admin/dashboard');
        }, 500);
      } else {
        setError(res?.message || 'Kredensial tidak valid');
      }
      setLoading(false);
    } catch (err) {
      setError('Login gagal. Silakan coba lagi.');
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
    if (error) setError(''); // Clear error when user starts typing
  };

  return (
    <>
      <Head>
        <title>Masuk Admin | Vla Devs</title>
        <meta name="description" content="Panel admin Vla Devs - Masuk ke dashboard administrator" />
        <link rel="icon" type="image/x-icon" href="/vla-logo.png" />
      </Head>

  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center relative overflow-hidden px-6">
        {/* Subtle radial-dot background (same as admin layout) */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25px 25px, rgba(255,255,255,0.15) 2px, transparent 0)`,
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        <div className={`max-w-md w-full space-y-8 relative z-10 transform transition-all duration-700 ${
          isAnimated ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          {/* Main Login Container */}
          <div className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl hover:bg-white/10 transition-all duration-300">
            
            {/* Header Section */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 transition-all duration-300">
                  <Image
                    src="/vla-icon.png"
                    alt="Vla Icon"
                    className="object-contain w-10 h-10"
                    style={{ maxWidth: '100px', maxHeight: '100px' }}
                  />
                </div>
              </div>
              
              <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">
                Panel Administrator
              </h1>
              <div className="mt-4 h-1 w-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mx-auto"></div>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-6 bg-red-500/10 backdrop-blur-sm border border-red-500/20 text-red-300 px-4 py-3 rounded-2xl text-sm flex items-center transition-all duration-300">
                <Icon icon="mdi:alert-circle" className="w-5 h-5 mr-3 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              
              {/* Username Field */}
              <div className="space-y-2">
                <label htmlFor="username" className="block text-sm font-medium text-gray-300">
                  Nama Pengguna
                </label>
                <div className="relative">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={credentials.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    className="block w-full bg-white/10 border border-white/20 text-white rounded-2xl px-4 py-3 pl-12 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:bg-white/15"
                    placeholder="Masukkan nama pengguna"
                  />
                  <Icon icon="mdi:account" className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                  Kata Sandi
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={credentials.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="block w-full bg-white/10 border border-white/20 text-white rounded-2xl px-4 py-3 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:bg-white/15"
                    placeholder="Masukkan kata sandi"
                  />
                  <Icon icon="mdi:lock" className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-all duration-300"
                  >
                    <Icon icon={showPassword ? "mdi:eye-off" : "mdi:eye"} className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-purple-600 bg-white/10 border border-white/20 rounded focus:ring-purple-500 focus:ring-2 transition-all duration-300"
                  />
                  <span className="ml-3 text-sm text-gray-300">Ingat saya</span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || !credentials.username || !credentials.password}
                  className="group relative w-full flex justify-center py-4 px-6 border border-transparent rounded-2xl text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-all duration-300 shadow-lg"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="relative mr-3">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      </div>
                      <span>Memproses...</span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Icon icon="mdi:login" className="w-5 h-5 mr-2" />
                      <span>Masuk ke Panel</span>
                    </div>
                  )}
                </button>
              </div>
            </form>

            {/* Additional Info */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-2">
                  Dilindungi dengan keamanan tingkat enterprise
                </p>
                <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                  <div className="flex items-center">
                    <Icon icon="mdi:shield-check" className="w-4 h-4 mr-1 text-green-400" />
                    SSL
                  </div>
                  <div className="flex items-center">
                    <Icon icon="mdi:lock" className="w-4 h-4 mr-1 text-blue-400" />
                    2FA Ready
                  </div>
                  <div className="flex items-center">
                    <Icon icon="mdi:server-security" className="w-4 h-4 mr-1 text-purple-400" />
                    Encrypted
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
             © 2025 Vla Devs. All rights reserved. | Version 1.0.5
            </p>
          </div>
        </div>
      </div>
    </>
  );
}