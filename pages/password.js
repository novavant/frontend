// pages/ganti-sandi.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Icon } from '@iconify/react';
import { changePassword } from '../utils/api';
import BottomNavbar from '../components/BottomNavbar';

export default function GantiSandi() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showPassword, setShowPassword] = useState({
    current_password: false,
    new_password: false,
    confirm_password: false
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [applicationData, setApplicationData] = useState(null);

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    if (!formData.current_password) {
      setErrorMsg("Kata sandi saat ini wajib diisi.");
      setLoading(false);
      return;
    }
    if (!formData.new_password) {
      setErrorMsg("Kata sandi baru wajib diisi.");
      setLoading(false);
      return;
    }
    if (!formData.confirm_password) {
      setErrorMsg("Konfirmasi kata sandi wajib diisi.");
      setLoading(false);
      return;
    }
    if (formData.new_password.length < 6) {
      setErrorMsg("Kata sandi baru minimal 6 karakter.");
      setLoading(false);
      return;
    }
    if (formData.new_password !== formData.confirm_password) {
      setErrorMsg("Kata sandi baru dan konfirmasi tidak cocok.");
      setLoading(false);
      return;
    }

    try {
      const res = await changePassword({
        current_password: formData.current_password,
        password: formData.new_password,
        confirmation_password: formData.confirm_password
      });
      setSuccessMsg(res.message || "Kata sandi berhasil diperbarui!");
      setErrorMsg('');
      setLoading(false);
      setTimeout(() => {
        setSuccessMsg('');
        router.push('/profile');
      }, 2000);
    } catch (error) {
      setErrorMsg(error.message || "Terjadi kesalahan. Silakan coba lagi.");
      setSuccessMsg('');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = sessionStorage.getItem('token');
    const accessExpire = sessionStorage.getItem('access_expire');
    if (!token || !accessExpire) {
      router.push('/login');
    }
    const storedApplication = localStorage.getItem('application');
    if (storedApplication) {
      try {
        const parsed = JSON.parse(storedApplication);
        setApplicationData({
          name: parsed.name || 'Nova Vant',
          healthy: parsed.healthy || false,
        });
      } catch (e) {
        setApplicationData({ name: 'Nova Vant', healthy: false });
      }
    } else {
      setApplicationData({ name: 'Nova Vant', healthy: false });
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 pb-36 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[100px]" />
      </div>

      <Head>
        <title>{applicationData?.name || 'Nova Vant'} | Ganti Kata Sandi</title>
        <meta name="description" content={`${applicationData?.name || 'Nova Vant'} Change Password`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-slate-900/80 border-b border-white/5">
        <div className="max-w-md mx-auto px-5 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <Icon icon="mdi:arrow-left" className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-white">Ganti Kata Sandi</h1>
            <p className="text-xs text-slate-400">Keamanan akun Anda</p>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-5 space-y-6">
        {/* Intro Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-6 shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <Icon icon="mdi:shield-lock-outline" className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">Lindungi Akun</h2>
              <p className="text-blue-100 text-xs mt-1">Perbarui sandi Anda secara berkala</p>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-slate-900/50 backdrop-blur-md rounded-3xl p-6 border border-white/5 shadow-xl">
          {/* Messages */}
          {errorMsg && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex gap-3 animate-pulse">
              <Icon icon="mdi:alert-rhombus" className="w-6 h-6 text-red-400 flex-shrink-0" />
              <p className="text-red-300 text-sm font-medium">{errorMsg}</p>
            </div>
          )}
          {successMsg && (
            <div className="mb-6 bg-green-500/10 border border-green-500/20 rounded-2xl p-4 flex gap-3">
              <Icon icon="mdi:check-decagram" className="w-6 h-6 text-green-400 flex-shrink-0" />
              <p className="text-green-300 text-sm font-medium">{successMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {[
              { label: 'Kata Sandi Saat Ini', name: 'current_password', placeholder: 'Ketik sandi lama...', icon: 'mdi:lock-open-outline' },
              { label: 'Kata Sandi Baru', name: 'new_password', placeholder: 'Buat sandi baru...', icon: 'mdi:lock-outline' },
              { label: 'Konfirmasi Sandi', name: 'confirm_password', placeholder: 'Ulangi sandi baru...', icon: 'mdi:lock-check-outline' }
            ].map((field, index) => (
              <div key={index} className="group">
                <label className="block text-xs font-medium text-slate-400 mb-2 ml-1">{field.label}</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center">
                    <Icon icon={field.icon} className="text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                  </div>
                  <input
                    type={showPassword[field.name] ? "text" : "password"}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleInputChange}
                    placeholder={field.placeholder}
                    className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-3.5 pl-12 pr-12 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:bg-slate-900/80 transition-all shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility(field.name)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors p-1"
                  >
                    <Icon icon={showPassword[field.name] ? "mdi:eye-off-outline" : "mdi:eye-outline"} className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-600/20 border border-t-white/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <Icon icon="mdi:content-save-edit-outline" className="w-5 h-5" />
                  <span>Simpan Perubahan</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Security Tips */}
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-3xl border border-white/5 p-5">
          <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
            <Icon icon="mdi:shield-check-outline" className="text-green-400" />
            Tips Keamanan
          </h3>
          <div className="space-y-3">
            {[
              'Gunakan minimal 8 karakter',
              'Kombinasikan huruf, angka & simbol',
              'Jangan gunakan info pribadi'
            ].map((tip, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span className="text-xs text-slate-300">{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNavbar />
    </div>
  );
}
