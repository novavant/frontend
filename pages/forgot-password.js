import Head from 'next/head';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Icon } from '@iconify/react';
import Image from 'next/image';
import LiveChatWidget from '../components/LiveChat/LiveChatWidget';
import {
  requestForgotPasswordOTP,
  resendForgotPasswordOTP,
  verifyForgotPasswordOTP,
  resetPassword
} from '../utils/api';

export default function ForgotPassword() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    number: '',
    otp: '',
    password: '',
    confirmPassword: ''
  });
  const [otpDigits, setOtpDigits] = useState(['', '', '', '']);
  const otpInputRef0 = useRef(null);
  const otpInputRef1 = useRef(null);
  const otpInputRef2 = useRef(null);
  const otpInputRef3 = useRef(null);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [requestId, setRequestId] = useState(null);
  const [resetToken, setResetToken] = useState(null);
  const [applicationData, setApplicationData] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [resendCountdown, setResendCountdown] = useState(0);

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleNumberChange = (e) => {
    let value = e.target.value.replace(/[^0-9+]/g, '');
    if (value.startsWith('+')) value = value.slice(1);
    value = value.replace(/[^0-9]/g, '');
    if (/^(62|0)8/.test(value)) value = value.replace(/^(62|0)/, '');
    if (!value.startsWith('8') && value.length > 0) value = value.replace(/^62/, '');
    if (value.length > 12) value = value.slice(0, 12);
    setFormData((prev) => ({ ...prev, number: value }));
    setNotification({ message: '', type: '' });
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    setNotification({ message: '', type: '' });
  };

  const handleOtpChange = (index, value) => {
    const digit = value.replace(/[^0-9]/g, '').slice(0, 1);
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);
    const otpValue = newDigits.join('');
    setFormData((prev) => ({ ...prev, otp: otpValue }));
    setNotification({ message: '', type: '' });
    if (digit && index < 3) {
      const refs = [otpInputRef0, otpInputRef1, otpInputRef2, otpInputRef3];
      refs[index + 1]?.current?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 4);
    if (pastedData.length > 0) {
      const newDigits = [...otpDigits];
      for (let i = 0; i < 4; i++) {
        newDigits[i] = pastedData[i] || '';
      }
      setOtpDigits(newDigits);
      const otpValue = newDigits.join('');
      setFormData((prev) => ({ ...prev, otp: otpValue }));
      const refs = [otpInputRef0, otpInputRef1, otpInputRef2, otpInputRef3];
      const focusIndex = Math.min(pastedData.length, 3);
      refs[focusIndex]?.current?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const refs = [otpInputRef0, otpInputRef1, otpInputRef2, otpInputRef3];
      refs[index - 1]?.current?.focus();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    if (!/^8\d{8,11}$/.test(formData.number)) {
      setNotification({ message: 'Nomor HP tidak valid', type: 'error' });
      return;
    }
    setIsLoading(true);
    setNotification({ message: '', type: '' });

    try {
      const result = await requestForgotPasswordOTP(formData.number);
      if (result?.success) {
        setRequestId(result.data?.request_id || null);
        setNotification({ message: result.message || 'Kode Verifikasi berhasil dikirim', type: 'success' });
        if (result.data?.retry_after_seconds) setCountdown(result.data.retry_after_seconds);
        setResendCountdown(60);
        setOtpDigits(['', '', '', '']);
        setFormData(prev => ({ ...prev, otp: '' }));
        setStep(2);
        setTimeout(() => otpInputRef0.current?.focus(), 100);
      } else {
        setNotification({ message: result?.message || 'Gagal mengirim kode verifikasi', type: 'error' });
        if (result?.data?.retry_after_seconds) setCountdown(result.data.retry_after_seconds);
      }
    } catch (error) {
      setNotification({ message: error.message || 'Terjadi kesalahan. Silakan coba lagi.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCountdown > 0 || countdown > 0) return;
    setIsLoading(true);
    setNotification({ message: '', type: '' });

    try {
      const result = await resendForgotPasswordOTP(formData.number);
      if (result?.success) {
        setRequestId(result.data?.request_id || null);
        setNotification({ message: result.message || 'Kode Verifikasi berhasil dikirim ulang', type: 'success' });
        setOtpDigits(['', '', '', '']);
        setFormData(prev => ({ ...prev, otp: '' }));
        setTimeout(() => otpInputRef0.current?.focus(), 100);
        if (result.data?.retry_after_seconds) {
          setCountdown(result.data.retry_after_seconds);
          setResendCountdown(result.data.retry_after_seconds);
        }
      } else {
        setNotification({ message: result?.message || 'Gagal mengirim ulang kode verifikasi', type: 'error' });
        if (result?.data?.retry_after_seconds) {
          setCountdown(result.data.retry_after_seconds);
          setResendCountdown(result.data.retry_after_seconds);
        }
      }
    } catch (error) {
      setNotification({ message: error.message || 'Terjadi kesalahan. Silakan coba lagi.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!formData.otp || formData.otp.length !== 4) {
      setNotification({ message: 'Kode Verifikasi harus 4 digit', type: 'error' });
      return;
    }
    setIsLoading(true);
    setNotification({ message: '', type: '' });

    try {
      const result = await verifyForgotPasswordOTP(formData.otp, requestId);
      if (result?.success) {
        setResetToken(result.data?.token || null);
        setNotification({ message: result.message || 'Kode Verifikasi benar', type: 'success' });
        setOtpDigits(['', '', '', '']);
        setStep(3);
      } else {
        setNotification({ message: result?.message || 'Kode Verifikasi tidak valid', type: 'error' });
      }
    } catch (error) {
      setNotification({ message: error.message || 'Terjadi kesalahan. Silakan coba lagi.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      setNotification({ message: 'Password minimal 6 karakter', type: 'error' });
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setNotification({ message: 'Password dan konfirmasi password tidak sama', type: 'error' });
      return;
    }
    setIsLoading(true);
    setNotification({ message: '', type: '' });

    try {
      const result = await resetPassword(formData.password, formData.confirmPassword, resetToken);
      if (result?.success) {
        setNotification({ message: result.message || 'Password berhasil diubah', type: 'success' });
        setTimeout(() => router.push('/login'), 3000);
      } else {
        setNotification({ message: result?.message || 'Gagal mengubah password', type: 'error' });
      }
    } catch (error) {
      setNotification({ message: error.message || 'Terjadi kesalahan. Silakan coba lagi.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const getStepTitle = () => {
    if (step === 1) return 'Lupa Password? 🔐';
    if (step === 2) return 'Verifikasi OTP 📱';
    return 'Password Baru 🔒';
  };

  const getStepDescription = () => {
    if (step === 1) return 'Masukkan nomor WhatsApp untuk reset password';
    if (step === 2) return `Kode verifikasi telah dikirim ke +62${formData.number}`;
    return 'Buat password baru untuk akun Anda';
  };

  return (
    <>
      <Head>
        <title>{applicationData?.name || 'NovaVant'} | Lupa Password</title>
        <meta name="description" content={`Reset password untuk akun ${applicationData?.name || 'NovaVant'} Anda.`} />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
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

            {/* Progress Steps */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
                  {step > 1 ? <Icon icon="mdi:check" className="w-5 h-5" /> : '1'}
                </div>
                <div className={`w-16 h-1 rounded-full transition-all ${step >= 2 ? 'bg-blue-600' : 'bg-slate-700'}`} />
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
                  {step > 2 ? <Icon icon="mdi:check" className="w-5 h-5" /> : '2'}
                </div>
                <div className={`w-16 h-1 rounded-full transition-all ${step >= 3 ? 'bg-blue-600' : 'bg-slate-700'}`} />
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
                  3
                </div>
              </div>
            </div>

            {/* Greeting */}
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold text-white mb-2">
                {getStepTitle()}
              </h1>
              <p className="text-sm text-slate-400">
                {getStepDescription()}
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

            {/* Step 1: Request OTP */}
            {step === 1 && (
              <form onSubmit={handleRequestOTP} className="space-y-4">
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
                      autoComplete="tel"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || countdown > 0 || !/^8\d{8,11}$/.test(formData.number)}
                  className="w-full h-14 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white text-base font-semibold rounded-xl transition-colors"
                >
                  {isLoading ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Mengirim...</span>
                    </>
                  ) : countdown > 0 ? (
                    <>
                      <Icon icon="mdi:timer-sand" className="w-5 h-5" />
                      <span>Tunggu {formatTime(countdown)}</span>
                    </>
                  ) : (
                    <>
                      <Icon icon="mdi:send" className="w-5 h-5" />
                      <span>Kirim Kode Verifikasi</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Step 2: Verify OTP */}
            {step === 2 && (
              <form onSubmit={handleVerifyOTP} className="space-y-5">
                <div>
                  <div className="flex items-center justify-center gap-3">
                    {[0, 1, 2, 3].map((index) => (
                      <input
                        key={index}
                        ref={index === 0 ? otpInputRef0 : index === 1 ? otpInputRef1 : index === 2 ? otpInputRef2 : otpInputRef3}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className={`w-16 h-16 text-center text-2xl font-bold rounded-xl border-2 bg-slate-800 text-white outline-none transition-all ${otpDigits[index]
                          ? 'border-blue-500 ring-2 ring-blue-500/30'
                          : 'border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30'
                          }`}
                        value={otpDigits[index]}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onPaste={handleOtpPaste}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        maxLength={1}
                        required
                        autoComplete="off"
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={isLoading || resendCountdown > 0 || countdown > 0}
                    className="flex-1 h-14 flex items-center justify-center gap-2 bg-transparent border border-slate-600 hover:border-slate-500 hover:bg-slate-800/50 disabled:opacity-50 disabled:cursor-not-allowed text-white text-base font-semibold rounded-xl transition-all"
                  >
                    {resendCountdown > 0 || countdown > 0 ? (
                      <>
                        <Icon icon="mdi:timer-sand" className="w-5 h-5" />
                        <span>{formatTime(resendCountdown || countdown)}</span>
                      </>
                    ) : (
                      <>
                        <Icon icon="mdi:refresh" className="w-5 h-5" />
                        <span>Kirim Ulang</span>
                      </>
                    )}
                  </button>

                  <button
                    type="submit"
                    disabled={isLoading || !formData.otp || formData.otp.length !== 4}
                    className="flex-1 h-14 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white text-base font-semibold rounded-xl transition-colors"
                  >
                    {isLoading ? (
                      <>
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>...</span>
                      </>
                    ) : (
                      <span>Verifikasi</span>
                    )}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setFormData(prev => ({ ...prev, otp: '' }));
                    setOtpDigits(['', '', '', '']);
                    setNotification({ message: '', type: '' });
                  }}
                  className="w-full text-center text-sm text-slate-400 hover:text-white transition-colors"
                >
                  ← Ubah nomor HP
                </button>
              </form>
            )}

            {/* Step 3: Reset Password */}
            {step === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <div className="flex items-center bg-slate-800/80 border border-slate-700 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
                    <div className="px-4 py-4 border-r border-slate-700">
                      <Icon icon="mdi:lock-outline" className="w-6 h-6 text-slate-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      className="flex-1 px-4 py-4 bg-transparent text-base text-white outline-none placeholder:text-slate-500"
                      placeholder="Password Baru (min. 6 karakter)"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      autoComplete="new-password"
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="px-4 py-4 text-slate-400 hover:text-white transition-colors"
                    >
                      <Icon icon={showPassword ? 'mdi:eye-off-outline' : 'mdi:eye-outline'} className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center bg-slate-800/80 border border-slate-700 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
                    <div className="px-4 py-4 border-r border-slate-700">
                      <Icon icon="mdi:lock-check-outline" className="w-6 h-6 text-slate-400" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      className="flex-1 px-4 py-4 bg-transparent text-base text-white outline-none placeholder:text-slate-500"
                      placeholder="Konfirmasi Password Baru"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      autoComplete="new-password"
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="px-4 py-4 text-slate-400 hover:text-white transition-colors"
                    >
                      <Icon icon={showConfirmPassword ? 'mdi:eye-off-outline' : 'mdi:eye-outline'} className="w-5 h-5" />
                    </button>
                  </div>
                  {formData.confirmPassword && formData.password.length >= 6 && formData.confirmPassword !== formData.password && (
                    <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
                      <Icon icon="mdi:alert-circle" className="w-3.5 h-3.5" />
                      Password tidak cocok
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !formData.password || formData.password.length < 6 || formData.password !== formData.confirmPassword}
                  className="w-full h-14 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white text-base font-semibold rounded-xl transition-colors"
                >
                  {isLoading ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Mengubah password...</span>
                    </>
                  ) : (
                    <>
                      <Icon icon="mdi:lock-reset" className="w-5 h-5" />
                      <span>Ubah Password</span>
                    </>
                  )}
                </button>

                {notification.type === 'success' && (
                  <p className="text-center text-sm text-emerald-400 flex items-center justify-center gap-2">
                    <Icon icon="mdi:check-circle" className="w-4 h-4" />
                    Redirect ke login dalam 3 detik...
                  </p>
                )}
              </form>
            )}

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-slate-700"></div>
              <span className="text-sm text-slate-500">atau</span>
              <div className="flex-1 h-px bg-slate-700"></div>
            </div>

            {/* Back to Login Button */}
            <Link
              href="/login"
              className="w-full h-14 flex items-center justify-center gap-2 bg-transparent border border-slate-600 hover:border-slate-500 hover:bg-slate-800/50 text-white text-base font-semibold rounded-xl transition-all"
            >
              <Icon icon="mdi:arrow-left" className="w-5 h-5" />
              Kembali ke Login
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
