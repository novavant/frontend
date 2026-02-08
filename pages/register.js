import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Icon } from '@iconify/react';
import { registerUser, getInfo } from '../utils/api';
import Image from 'next/image';
import LiveChatWidget from '../components/LiveChat/LiveChatWidget';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    number: '',
    password: '',
    password_confirmation: '',
    referral_code: '',
  });
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [applicationData, setApplicationData] = useState(null);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [closedRegister, setClosedRegister] = useState(false);
  const [referralLocked, setReferralLocked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [rateLimitCountdown, setRateLimitCountdown] = useState(0);
  const [formValidation, setFormValidation] = useState({
    name: false,
    number: false,
    password: false,
    passwordMatch: false,
    referralCode: false
  });

  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('token');
      const accessExpire = sessionStorage.getItem('access_expire');
      if (token && accessExpire) {
        const now = new Date();
        const expiry = new Date(accessExpire);
        if (now < expiry) {
          router.replace('/dashboard');
          return;
        }
      }
    }

    if (router.query && router.query.reff) {
      setFormData((prev) => ({ ...prev, referral_code: router.query.reff }));
      setReferralLocked(true);
    }

    const storedApplication = sessionStorage.getItem('application');
    if (storedApplication) {
      try {
        const parsed = JSON.parse(storedApplication);
        setApplicationData({
          name: parsed.name || 'NovaVant',
          company: parsed.company || 'PT NovaVant Next Generation',
          healthy: parsed.healthy || false,
        });
      } catch (e) {
        setApplicationData({ name: 'NovaVant', company: 'PT NovaVant Next Generation', healthy: false });
      }
    } else {
      setApplicationData({ name: 'NovaVant', company: 'PT NovaVant Next Generation', healthy: false });
    }

    (async () => {
      try {
        const data = await getInfo();
        if (data && data.success && data.data) {
          const app = data.data;
          if (app.name && app.company) {
            const stored = JSON.parse(sessionStorage.getItem('application') || '{}');
            const merged = { ...(stored || {}), name: app.name, company: app.company };
            sessionStorage.setItem('application', JSON.stringify(merged));
            setApplicationData(prev => ({ ...(prev || {}), name: app.name, company: app.company }));
          }
          if (app.maintenance) {
            setMaintenanceMode(true);
            setNotification({ message: 'Aplikasi sedang dalam pemeliharaan, Anda tidak dapat mendaftar. Silakan coba lagi nanti.', type: 'error' });
          }
          if (app.closed_register) {
            setClosedRegister(true);
            setNotification({ message: 'Pendaftaran sedang ditutup, Anda tidak dapat mendaftar. Silakan coba lagi nanti.', type: 'error' });
          }
        }
      } catch (err) { }
    })();
  }, [router]);

  useEffect(() => {
    setFormValidation({
      name: formData.name.trim().length >= 3,
      number: /^8[0-9]{8,11}$/.test(formData.number),
      password: formData.password.length >= 6,
      passwordMatch: formData.password === formData.password_confirmation && formData.password.length > 0,
      referralCode: formData.referral_code.trim().length > 0
    });
    setPasswordStrength(checkPasswordStrength(formData.password));
  }, [formData]);

  useEffect(() => {
    if (rateLimitCountdown > 0) {
      const timer = setTimeout(() => setRateLimitCountdown(rateLimitCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [rateLimitCountdown]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    if (id === 'name') {
      const sanitized = value.replace(/[^A-Za-z\s]/g, '');
      setFormData((prev) => ({ ...prev, [id]: sanitized }));
      return;
    }
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleNumberChange = (e) => {
    let value = e.target.value.replace(/[^0-9+]/g, '');
    if (value.startsWith('+')) value = value.slice(1);
    if (value.startsWith('62') && value[2] === '8') value = value.slice(2);
    if (value.startsWith('0') && value[1] === '8') value = value.slice(1);
    value = value.replace(/[^0-9]/g, '');
    if (value.length > 12) value = value.slice(0, 12);
    setFormData((prev) => ({ ...prev, number: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (maintenanceMode) {
      setNotification({ message: 'Aplikasi sedang dalam pemeliharaan. Silakan coba lagi nanti.', type: 'error' });
      return;
    }
    if (closedRegister) {
      setNotification({ message: 'Pendaftaran sedang ditutup. Silakan coba lagi nanti.', type: 'error' });
      return;
    }
    if (formData.password !== formData.password_confirmation) {
      setNotification({ message: 'Password dan konfirmasi password tidak sama', type: 'error' });
      return;
    }

    setIsLoading(true);
    setNotification({ message: '', type: '' });

    try {
      const result = await registerUser(formData);

      if (result && result.success === true) {
        setFormData({
          name: '',
          number: '',
          password: '',
          password_confirmation: '',
          referral_code: referralLocked ? formData.referral_code : ''
        });

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('user-token-changed'));
        }

        setTimeout(() => {
          router.push('/dashboard');
        }, 500);

      } else if (result && result.success === false) {
        if (result.status === 429 && result.data?.retry_after_seconds) {
          setRateLimitCountdown(result.data.retry_after_seconds);
          setNotification({
            message: result.message || 'Terlalu banyak permintaan. Silakan coba lagi nanti.',
            type: 'error'
          });
        } else {
          setNotification({ message: result.message || 'Terjadi kesalahan. Silakan coba lagi.', type: 'error' });
        }
      } else {
        setNotification({ message: 'Respon server tidak valid. Silakan coba lagi.', type: 'error' });
      }
    } catch (error) {
      console.error('Register error:', error);
      setNotification({ message: error.message || 'Terjadi kesalahan. Silakan coba lagi.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return 'bg-red-500';
    if (passwordStrength <= 2) return 'bg-orange-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    if (passwordStrength <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 1) return 'Sangat Lemah';
    if (passwordStrength <= 2) return 'Lemah';
    if (passwordStrength <= 3) return 'Sedang';
    if (passwordStrength <= 4) return 'Kuat';
    return 'Sangat Kuat';
  };

  const isFormValid = Object.values(formValidation).every(Boolean) && termsAgreed;
  const referralCode = router.query?.reff || '';

  const getDescription = () => {
    if (referralCode) {
      return `Bergabung bersama saya di NovaVant dan mulai berinvestasi bersama saya, Gunakan kode '${referralCode}' untuk keuntungan maksimal`;
    }
    return 'Mulailah berinvestasi di NovaVant dan raih keuntungan maksimal.';
  };

  const [ogImageUrl, setOgImageUrl] = useState('/logo.png');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const baseUrl = window.location.origin;
      setOgImageUrl(`${baseUrl}/logo.png`);
    }
  }, [router.query]);

  return (
    <>
      <Head>
        <title>{applicationData?.name || 'NovaVant'} | Daftar</title>
        <meta name="description" content={getDescription()} />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={`${applicationData?.name || 'NovaVant'} | Daftar`} />
        <meta property="og:description" content={getDescription()} />
        <meta property="og:image" content={ogImageUrl} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <div className="min-h-screen min-h-[100dvh] flex flex-col bg-slate-900">
        {/* Top Bar with Logo */}
        <div className="px-6 py-5">
          <Image
            src="/logo.png"
            alt={applicationData?.name || 'NovaVant'}
            width={120}
            height={48}
            className="h-10 w-auto object-contain"
            priority
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-center px-6 pb-8">
          <div className="w-full max-w-sm mx-auto">

            {/* Greeting */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-white mb-2">
                Buat Akun 🚀
              </h1>
              <p className="text-base text-slate-400">
                Mulai perjalanan investasi Anda sekarang
              </p>
            </div>

            {/* Notification */}
            {notification.message && (
              <div className={`mb-5 flex items-start gap-3 rounded-xl px-4 py-3 text-sm ${notification.type === 'success'
                ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-700'
                : 'bg-red-900/50 text-red-300 border border-red-700'
                }`}>
                <Icon
                  icon={notification.type === 'success' ? 'mdi:check-circle' : 'mdi:alert-circle'}
                  className="mt-0.5 h-4 w-4 flex-shrink-0"
                />
                <span className="flex-1">{notification.message}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Input */}
              <div>
                <div className="flex items-center bg-slate-800/80 border border-slate-700 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
                  <div className="px-4 py-4 border-r border-slate-700">
                    <Icon icon="mdi:account-outline" className="w-6 h-6 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    className="flex-1 px-4 py-4 bg-transparent text-base text-white outline-none placeholder:text-slate-500"
                    placeholder="Nama Lengkap"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    autoComplete="name"
                  />
                </div>
              </div>

              {/* Phone Input */}
              <div>
                <div className="flex items-center bg-slate-800/80 border border-slate-700 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
                  <div className="flex items-center gap-2 px-4 py-4 border-r border-slate-700">
                    <img
                      src="https://react-circle-flags.pages.dev/id.svg"
                      alt="ID"
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-sm font-medium text-slate-300">+62</span>
                  </div>
                  <input
                    type="tel"
                    id="number"
                    inputMode="numeric"
                    className="flex-1 px-4 py-4 bg-transparent text-base text-white outline-none placeholder:text-slate-500"
                    placeholder="Nomor WhatsApp"
                    value={formData.number}
                    onChange={handleNumberChange}
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center bg-slate-800/80 border border-slate-700 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
                  <div className="px-4 py-4 border-r border-slate-700">
                    <Icon icon="mdi:lock-outline" className="w-6 h-6 text-slate-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    className="flex-1 px-4 py-4 bg-transparent text-base text-white outline-none placeholder:text-slate-500"
                    placeholder="Kata Sandi (min. 6 karakter)"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="px-4 py-4 text-slate-400 hover:text-white transition-colors"
                  >
                    <Icon icon={showPassword ? 'mdi:eye-off-outline' : 'mdi:eye-outline'} className="w-5 h-5" />
                  </button>
                </div>
                {formData.password && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${getPasswordStrengthColor()}`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400">{getPasswordStrengthText()}</span>
                  </div>
                )}
              </div>

              {/* Confirm Password Input */}
              <div>
                <div className="flex items-center bg-slate-800/80 border border-slate-700 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
                  <div className="px-4 py-4 border-r border-slate-700">
                    <Icon icon="mdi:lock-check-outline" className="w-6 h-6 text-slate-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="password_confirmation"
                    className="flex-1 px-4 py-4 bg-transparent text-base text-white outline-none placeholder:text-slate-500"
                    placeholder="Konfirmasi Kata Sandi"
                    value={formData.password_confirmation}
                    onChange={handleChange}
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="px-4 py-4 text-slate-400 hover:text-white transition-colors"
                  >
                    <Icon icon={showConfirmPassword ? 'mdi:eye-off-outline' : 'mdi:eye-outline'} className="w-5 h-5" />
                  </button>
                </div>
                {formData.password_confirmation && formData.password.length >= 6 && formData.password_confirmation !== formData.password && (
                  <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
                    <Icon icon="mdi:alert-circle" className="w-3.5 h-3.5" />
                    Password tidak cocok
                  </p>
                )}
              </div>

              {/* Referral Code Input */}
              <div>
                <div className={`flex items-center bg-slate-800/80 border border-slate-700 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all ${referralLocked ? 'opacity-60' : ''}`}>
                  <div className="px-4 py-4 border-r border-slate-700">
                    <Icon icon="mdi:ticket-percent-outline" className="w-6 h-6 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    id="referral_code"
                    className="flex-1 px-4 py-4 bg-transparent text-base text-white outline-none placeholder:text-slate-500 disabled:cursor-not-allowed"
                    placeholder="Kode Referral"
                    value={formData.referral_code}
                    onChange={handleChange}
                    disabled={referralLocked}
                    required
                  />
                  {referralLocked && (
                    <div className="px-4">
                      <Icon icon="mdi:lock" className="w-5 h-5 text-slate-500" />
                    </div>
                  )}
                </div>
              </div>

              {/* Terms Agreement */}
              <div className="bg-slate-800/50 rounded-xl p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <div className="relative mt-0.5">
                    <input
                      type="checkbox"
                      checked={termsAgreed}
                      onChange={(e) => setTermsAgreed(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${termsAgreed
                      ? 'bg-blue-600 border-blue-600'
                      : 'bg-transparent border-slate-600'
                      }`}>
                      {termsAgreed && (
                        <Icon icon="mdi:check" className="w-3.5 h-3.5 text-white" />
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-slate-400">
                    Saya menyetujui{' '}
                    <Link href="/terms-and-conditions" className="text-blue-400 hover:text-blue-300 underline">
                      Syarat & Ketentuan
                    </Link>{' '}
                    dan{' '}
                    <Link href="/privacy-policy" className="text-blue-400 hover:text-blue-300 underline">
                      Kebijakan Privasi
                    </Link>
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !isFormValid || maintenanceMode || closedRegister || rateLimitCountdown > 0}
                className="w-full h-14 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white text-base font-semibold rounded-xl transition-colors"
              >
                {isLoading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Mendaftar...</span>
                  </>
                ) : rateLimitCountdown > 0 ? (
                  <>
                    <Icon icon="mdi:timer-sand" className="w-5 h-5" />
                    <span>Tunggu {formatTime(rateLimitCountdown)}</span>
                  </>
                ) : (
                  <span>Daftar Sekarang</span>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-slate-700"></div>
              <span className="text-sm text-slate-500">atau</span>
              <div className="flex-1 h-px bg-slate-700"></div>
            </div>

            {/* Login Button */}
            <Link
              href="/login"
              className="w-full h-14 flex items-center justify-center gap-2 bg-transparent border border-slate-600 hover:border-slate-500 hover:bg-slate-800/50 text-white text-base font-semibold rounded-xl transition-all"
            >
              Sudah Punya Akun? Masuk
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-4">
          <p className="text-xs text-slate-600">© 2026 {applicationData?.company}</p>
        </div>
      </div>
      <LiveChatWidget />
    </>
  );
}