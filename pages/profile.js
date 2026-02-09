import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Icon } from '@iconify/react';
import BottomNavbar from '../components/BottomNavbar';
import AppInstallButton from '../components/AppInstallButton';
import MobileAppStatus from '../components/MobileAppStatus';
import AndroidAppLinksTester from '../components/AndroidAppLinksTester';
import { logoutUser } from '../utils/api';
import { clearTokenFromAndroid } from '../utils/androidInterface';
import { isMobileApp } from '../utils/mobileAppDetection';
import Image from 'next/image';
import ProfileImage from '../components/ProfileImage';

export default function Profile() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [applicationData, setApplicationData] = useState({ link_app: '', link_cs: '', link_group: '' });
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('menu');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = sessionStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserData(user.name ? user : {
      name: "User", number: "000000000", balance: 0, level: 0,
      total_deposit: 0, total_withdraw: 0, active: false, publisher: false, profile: null
    });

    let appData = { name: 'Nova Vant', healthy: false, link_app: '', link_cs: '', link_group: '' };
    try {
      const rawApp = localStorage.getItem('application');
      if (rawApp) {
        const parsedApp = JSON.parse(rawApp);
        appData = {
          name: parsedApp.name || 'Nova Vant',
          healthy: parsedApp.healthy ?? false,
          link_app: parsedApp.link_app || '',
          link_cs: parsedApp.link_cs || '',
          link_group: parsedApp.link_group || '',
          company: parsedApp.company || 'PT NovaVant'
        };
      }
    } catch (e) { }
    setApplicationData(appData);
    setLoading(false);
  }, []);

  const handleLogout = async () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('access_expire');
    localStorage.removeItem('user');
    localStorage.removeItem('application');
    clearTokenFromAndroid();
    if (typeof document !== 'undefined') {
      document.cookie = 'refresh_token=; Max-Age=0; path=/;';
    }
    sessionStorage.setItem('just_logged_out', 'true');
    try { logoutUser().catch(() => { }); } catch (e) { }
    router.replace('/login');
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('id-ID').format(amount);

  const getVIPLabel = (level) => {
    const labels = { 0: 'Basic', 1: 'Bronze', 2: 'Silver', 3: 'Gold', 4: 'Platinum', 5: 'Diamond' };
    return labels[level] || 'Member';
  };

  const getVIPGradient = (level) => {
    const gradients = {
      0: 'from-slate-500 to-slate-600',
      1: 'from-amber-600 to-orange-600',
      2: 'from-slate-400 to-slate-500',
      3: 'from-yellow-500 to-amber-500',
      4: 'from-blue-500 to-indigo-500',
      5: 'from-cyan-400 to-blue-500'
    };
    return gradients[level] || 'from-slate-500 to-slate-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-12 h-12 border-3 border-slate-700 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  const quickActions = [
    { icon: 'mdi:bank-transfer', label: 'Bank', href: '/bank', color: 'blue' },
    { icon: 'mdi:history', label: 'Riwayat', href: '/transactions', color: 'purple' },
    { icon: 'mdi:lock', label: 'Password', href: '/password', color: 'amber' },
    { icon: 'mdi:crown', label: 'VIP', href: '/vip', color: 'yellow' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 pb-36">
      <Head>
        <title>{applicationData?.name || 'Nova Vant'} | Profile</title>
      </Head>

      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-slate-900/90 border-b border-slate-800">
        <div className="max-w-md mx-auto px-5 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">Profil</h1>
          <button
            onClick={() => router.push('/profile/update')}
            className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center hover:bg-slate-700"
          >
            <Icon icon="mdi:cog" className="w-5 h-5 text-slate-300" />
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-5 pt-6">
        {/* Profile Card */}
        <div className="relative mb-6 bg-slate-800 rounded-3xl border border-slate-700 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />
          </div>

          <div className="relative pt-12 pb-5 px-5">
            {/* Avatar */}
            <div className="flex justify-center mb-4">
              <div className="relative">
                <ProfileImage
                  profile={userData?.profile}
                  className="w-24 h-24 ring-4 ring-slate-800 shadow-xl"
                  iconClassName="w-12 h-12"
                  primaryColor="#2563EB"
                />
                {userData?.active && (
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-slate-800 flex items-center justify-center">
                    <Icon icon="mdi:check" className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </div>

            {/* Name & Phone */}
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-white mb-1">{userData?.name || 'User'}</h2>
              <p className="text-sm text-slate-400">+62{userData?.number || '000000000'}</p>
            </div>

            {/* VIP Badge */}
            <div className="flex justify-center mb-5">
              <button
                onClick={() => router.push('/vip')}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${getVIPGradient(userData?.level || 0)} text-white text-sm font-bold shadow-lg`}
              >
                <Icon icon="mdi:crown" className="w-4 h-4" />
                VIP {userData?.level || 0} - {getVIPLabel(userData?.level || 0)}
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-700/50 rounded-xl p-3 text-center">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center mx-auto mb-2">
                  <Icon icon="mdi:wallet" className="w-4 h-4 text-blue-400" />
                </div>
                <p className="text-xs text-slate-400 mb-0.5">Saldo</p>
                <p className="text-sm font-bold text-white">Rp {formatCurrency(userData?.balance || 0)}</p>
              </div>
              <div className="bg-slate-700/50 rounded-xl p-3 text-center">
                <div className="w-8 h-8 rounded-lg bg-green-600/20 flex items-center justify-center mx-auto mb-2">
                  <Icon icon="mdi:trending-up" className="w-4 h-4 text-green-400" />
                </div>
                <p className="text-xs text-slate-400 mb-0.5">Investasi</p>
                <p className="text-sm font-bold text-green-400">Rp {formatCurrency(userData?.total_invest || 0)}</p>
              </div>
              <div className="bg-slate-700/50 rounded-xl p-3 text-center">
                <div className="w-8 h-8 rounded-lg bg-red-600/20 flex items-center justify-center mx-auto mb-2">
                  <Icon icon="mdi:cash-fast" className="w-4 h-4 text-red-400" />
                </div>
                <p className="text-xs text-slate-400 mb-0.5">Penarikan</p>
                <p className="text-sm font-bold text-red-400">Rp {formatCurrency(userData?.total_withdraw || 0)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {quickActions.map((action, i) => (
            <button
              key={i}
              onClick={() => router.push(action.href)}
              className="flex flex-col items-center gap-2 p-3 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-all"
            >
              <div className={`w-10 h-10 rounded-xl bg-${action.color}-600/20 flex items-center justify-center`}>
                <Icon icon={action.icon} className={`w-5 h-5 text-${action.color}-400`} />
              </div>
              <span className="text-xs text-slate-300 font-medium">{action.label}</span>
            </button>
          ))}
        </div>

        {/* App Install */}
        <AppInstallButton applicationData={applicationData} />
        <MobileAppStatus applicationData={applicationData} />

        {/* Section Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {[
            { id: 'menu', label: 'Menu', icon: 'mdi:menu' },
            { id: 'support', label: 'Bantuan', icon: 'mdi:headset' },
            { id: 'info', label: 'Informasi', icon: 'mdi:information' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${activeSection === tab.id
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
                }`}
            >
              <Icon icon={tab.icon} className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Menu Section */}
        {activeSection === 'menu' && (
          <div className="space-y-2 mb-6">
            <MenuItem icon="mdi:history" label="Riwayat Investasi" desc="Lihat transaksi investasi" onClick={() => router.push('/history/investment')} />
            <MenuItem icon="mdi:cash-clock" label="Riwayat Penarikan" desc="Lihat transaksi penarikan" onClick={() => router.push('/history/withdraw')} iconColor="text-red-400" bgColor="bg-red-600/20" />
            <MenuItem icon="mdi:format-list-bulleted" label="Semua Transaksi" desc="Riwayat lengkap" onClick={() => router.push('/transactions')} iconColor="text-purple-400" bgColor="bg-purple-600/20" />
            <MenuItem icon="mdi:chart-box" label="Portofolio" desc="Lihat investasi aktif" onClick={() => router.push('/portofolio')} iconColor="text-green-400" bgColor="bg-green-600/20" />
            {userData?.publisher && (
              <MenuItem icon="mdi:newspaper" label="Publisher Site" desc="Kelola artikel" onClick={() => window.open('https://news.novavant.com/publisher/login', '_blank')} iconColor="text-indigo-400" bgColor="bg-indigo-600/20" external />
            )}
          </div>
        )}

        {/* Support Section */}
        {activeSection === 'support' && (
          <div className="space-y-2 mb-6">
            {applicationData.link_cs && (
              <MenuItem icon="mdi:headset" label="Customer Service" desc="Hubungi tim support" onClick={() => window.open(applicationData.link_cs, '_blank')} iconColor="text-green-400" bgColor="bg-green-600/20" external />
            )}
            {applicationData.link_group && (
              <MenuItem icon="mdi:telegram" label="Grup Telegram" desc="Bergabung dengan komunitas" onClick={() => window.open(applicationData.link_group, '_blank')} iconColor="text-blue-400" bgColor="bg-blue-600/20" external />
            )}
            {userData?.level !== 0 && (
              <MenuItem icon="mdi:forum" label="Forum VIP" desc="Diskusi khusus member VIP" onClick={() => window.open('https://t.me/+qR9OtCeRBTdhZjRl', '_blank')} iconColor="text-cyan-400" bgColor="bg-cyan-600/20" external />
            )}
            <MenuItem icon="mdi:help-circle" label="FAQ" desc="Pertanyaan yang sering diajukan" onClick={() => router.push('/faq')} iconColor="text-amber-400" bgColor="bg-amber-600/20" />
          </div>
        )}

        {/* Info Section */}
        {activeSection === 'info' && (
          <div className="space-y-2 mb-6">
            <MenuItem icon="mdi:information" label="Tentang Kami" onClick={() => router.push('/about-us')} />
            {/*
            <MenuItem icon="mdi:license" label="Lisensi" onClick={() => router.push('/licenses')} />
            */}
            <MenuItem icon="mdi:shield-check" label="Kebijakan Privasi" onClick={() => router.push('/privacy-policy')} iconColor="text-green-400" bgColor="bg-green-600/20" />
            <MenuItem icon="mdi:file-document" label="Syarat & Ketentuan" onClick={() => router.push('/terms-and-conditions')} iconColor="text-amber-400" bgColor="bg-amber-600/20" />
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full py-4 rounded-xl bg-red-900/30 border border-red-700/50 text-red-400 font-bold flex items-center justify-center gap-2 hover:bg-red-900/50 transition-colors mb-4"
        >
          <Icon icon="mdi:logout" className="w-5 h-5" />
          Keluar dari Akun
        </button>

        {/* Footer */}
        <div className="text-center py-4">
          <p className="text-xs text-slate-600">© 2026 {applicationData?.company}</p>
        </div>
      </div>

      <BottomNavbar />
      <AndroidAppLinksTester />
    </div>
  );
}

// Menu Item Component
function MenuItem({ icon, label, desc, onClick, iconColor = 'text-blue-400', bgColor = 'bg-blue-600/20', external = false }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 p-4 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-all">
      <div className={`w-10 h-10 rounded-xl ${bgColor} flex items-center justify-center`}>
        <Icon icon={icon} className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div className="flex-1 text-left">
        <p className="text-sm font-medium text-white">{label}</p>
        {desc && <p className="text-xs text-slate-400">{desc}</p>}
      </div>
      <Icon icon={external ? 'mdi:open-in-new' : 'mdi:chevron-right'} className="w-5 h-5 text-slate-500" />
    </button>
  );
}
