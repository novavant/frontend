import Head from 'next/head';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Icon } from '@iconify/react';
import { loginUser, getInfo } from '../utils/api';
import Image from 'next/image';
import LiveChatWidget from '../components/LiveChat/LiveChatWidget';

export default function Login() {
    const router = useRouter();
    const [formData, setFormData] = useState({ number: '', password: '' });
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isFormValid, setIsFormValid] = useState(false);
    const [applicationData, setApplicationData] = useState(null);
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [rateLimitCountdown, setRateLimitCountdown] = useState(0);

    useEffect(() => {
        const storedApplication = sessionStorage.getItem('application');
        if (storedApplication) {
            try {
                const parsed = JSON.parse(storedApplication);
                setApplicationData({
                    name: parsed.name || 'NovaVant',
                    healthy: parsed.healthy || false,
                });
            } catch (e) {
                setApplicationData({ name: 'NovaVant', healthy: false });
            }
        } else {
            setApplicationData({ name: 'NovaVant', healthy: false });
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
                        setNotification({ message: 'Aplikasi sedang dalam pemeliharaan. Silakan coba lagi nanti.', type: 'error' });
                    }
                }
            } catch (err) {
                // ignore fetch errors here
            }
        })();
    }, []);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    const handleNumberChange = (e) => {
        let value = e.target.value.replace(/[^0-9+]/g, '');
        if (value.startsWith('+')) value = value.slice(1);
        value = value.replace(/[^0-9]/g, '');
        if (/^(62|0)8/.test(value)) value = value.replace(/^(62|0)/, '');
        if (!value.startsWith('8') && value.length > 0) value = value.replace(/^62/, '');
        if (value.length > 12) value = value.slice(0, 12);
        setFormData((prev) => ({ ...prev, number: value }));
    };

    useEffect(() => {
        const num = formData.number || '';
        const isPhoneValid = /^8\d{8,11}$/.test(num);
        setIsFormValid(isPhoneValid && (formData.password || '').length >= 6);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (maintenanceMode) {
            setNotification({ message: 'Aplikasi sedang dalam pemeliharaan, Anda tidak dapat masuk. Silakan coba lagi nanti.', type: 'error' });
            return;
        }
        setIsLoading(true);
        setNotification({ message: '', type: '' });

        try {
            const result = await loginUser(formData);

            if (result && result.success === true) {
                setFormData({ number: '', password: '' });
                if (typeof window !== 'undefined') {
                    setTimeout(() => {
                        window.dispatchEvent(new Event('user-token-changed'));
                    }, 100);
                }
                // Check for returnUrl (gift redeem flow)
                const returnUrl = localStorage.getItem('returnUrl');
                if (returnUrl) {
                    localStorage.removeItem('returnUrl');
                    router.replace(returnUrl);
                } else {
                    router.replace('/dashboard');
                }
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
            console.error('Login error:', error);
            setNotification({ message: error.message || 'Terjadi kesalahan. Silakan coba lagi.', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (typeof window === 'undefined') return;
        sessionStorage.setItem('is_on_login_page', 'true');

        const justLoggedOut = sessionStorage.getItem('just_logged_out');
        if (justLoggedOut) {
            sessionStorage.removeItem('just_logged_out');
            return () => sessionStorage.removeItem('is_on_login_page');
        }

        const token = sessionStorage.getItem('token');
        const accessExpire = sessionStorage.getItem('access_expire');
        if (token && accessExpire) {
            try {
                const now = new Date();
                const expiry = new Date(accessExpire);
                if (expiry && expiry.getTime() > now.getTime()) {
                    if (window.location.pathname === '/login') {
                        sessionStorage.removeItem('is_on_login_page');
                        router.replace('/dashboard');
                        return;
                    }
                }
            } catch (e) { }
        }

        return () => sessionStorage.removeItem('is_on_login_page');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [ogImageUrl, setOgImageUrl] = useState('/logo.png');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const baseUrl = window.location.origin;
            setOgImageUrl(`${baseUrl}/logo.png`);
        }
    }, []);

    return (
        <>
            <Head>
                <title>{applicationData?.name || 'NovaVant'} | Masuk</title>
                <meta name="description" content={`Masuk ke akun ${applicationData?.name || 'NovaVant'} Anda.`} />
                <link rel="icon" href="/favicon.ico" />
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
                <meta property="og:type" content="website" />
                <meta property="og:title" content={`${applicationData?.name || 'NovaVant'} | Masuk`} />
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
                <div className="flex-1 flex flex-col justify-center px-6 pb-10">
                    <div className="w-full max-w-sm mx-auto">

                        {/* Greeting */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-white mb-3">
                                Halo! 👋
                            </h1>
                            <p className="text-base text-slate-400">
                                Silakan masuk untuk melanjutkan
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
                                        <Icon icon="mdi:chevron-down" className="w-4 h-4 text-slate-500" />
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
                                        placeholder="Kata Sandi"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        autoComplete="current-password"
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

                            {/* Forgot Password - Left aligned */}
                            <div>
                                <Link href="/forgot-password" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                                    Lupa kata sandi?
                                </Link>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading || !isFormValid || maintenanceMode || rateLimitCountdown > 0}
                                className="w-full h-14 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white text-base font-semibold rounded-xl transition-colors"
                            >
                                {isLoading ? (
                                    <>
                                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Memproses...</span>
                                    </>
                                ) : rateLimitCountdown > 0 ? (
                                    <>
                                        <Icon icon="mdi:timer-sand" className="w-5 h-5" />
                                        <span>Tunggu {formatTime(rateLimitCountdown)}</span>
                                    </>
                                ) : (
                                    <span>Masuk</span>
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="flex items-center gap-4 my-6">
                            <div className="flex-1 h-px bg-slate-700"></div>
                            <span className="text-sm text-slate-500">atau</span>
                            <div className="flex-1 h-px bg-slate-700"></div>
                        </div>

                        {/* Register Button */}
                        <Link
                            href="/register"
                            className="w-full h-14 flex items-center justify-center gap-2 bg-transparent border border-slate-600 hover:border-slate-500 hover:bg-slate-800/50 text-white text-base font-semibold rounded-xl transition-all"
                        >
                            Buat Akun Baru
                        </Link>

                        {/* Terms */}
                        <p className="mt-6 text-center text-xs text-slate-500 leading-relaxed">
                            Dengan melanjutkan, Anda menyetujui{' '}
                            <Link href="/terms-and-conditions" className="text-slate-400 hover:text-blue-400 underline transition-colors">
                                Ketentuan Layanan
                            </Link>{' '}
                            dan{' '}
                            <Link href="/privacy-policy" className="text-slate-400 hover:text-blue-400 underline transition-colors">
                                Kebijakan Privasi
                            </Link>
                        </p>
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