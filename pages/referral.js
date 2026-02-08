import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { getTeamInvited, getBonusTasks, submitBonusTask } from '../utils/api';
import { Icon } from '@iconify/react';
import BottomNavbar from '../components/BottomNavbar';
import Image from 'next/image';

export default function Referral() {
  const router = useRouter();
  const [applicationData, setApplicationData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [copied, setCopied] = useState({ code: false, link: false });
  const [reffCode, setReffCode] = useState('');
  const [teamStats, setTeamStats] = useState({
    1: { active: 0, count: 0, total_invest: 0 },
    2: { active: 0, count: 0, total_invest: 0 },
    3: { active: 0, count: 0, total_invest: 0 },
  });
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [claiming, setClaiming] = useState({});
  const [message, setMessage] = useState('');

  const primaryColor = '#2563EB';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = sessionStorage.getItem('token');
    const accessExpire = sessionStorage.getItem('access_expire');
    if (!token || !accessExpire) {
      router.push('/login');
      return;
    }

    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserData({
          name: user.name || '',
          balance: user.balance || 0,
          level: user.level || 0,
        });
        if (user?.reff_code) setReffCode(user.reff_code);
      }
    } catch (e) { }

    getTeamInvited().then((res) => {
      if (res?.data) setTeamStats(res.data);
    }).catch(() => { });

    setLoadingTasks(true);
    getBonusTasks()
      .then(res => setTasks(res.data || []))
      .catch(e => setMessage(e.message || 'Gagal memuat tugas'))
      .finally(() => setLoadingTasks(false));

    const storedApp = localStorage.getItem('application');
    if (storedApp) {
      try {
        const parsed = JSON.parse(storedApp);
        setApplicationData({ name: parsed.name || 'Nova Vant', company: parsed.company || 'Novavant, Inc.' });
      } catch (e) {
        setApplicationData({ name: 'Nova Vant', company: 'Novavant, Inc.' });
      }
    } else {
      setApplicationData({ name: 'Nova Vant', company: 'Novavant, Inc.' });
    }
  }, [router]);

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied((prev) => ({ ...prev, [type]: true }));
    setTimeout(() => setCopied((prev) => ({ ...prev, [type]: false })), 2000);
  };

  const handleClaim = async (taskId) => {
    setClaiming(prev => ({ ...prev, [taskId]: true }));
    setMessage('');
    try {
      await submitBonusTask(taskId);
      setMessage('Selamat! Hadiah berhasil diklaim.');
      const res = await getBonusTasks();
      setTasks(res.data || []);
    } catch (e) {
      setMessage(e.message || 'Gagal mengambil hadiah');
    } finally {
      setClaiming(prev => ({ ...prev, [taskId]: false }));
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const referralLink = typeof window !== 'undefined' && reffCode ? `${window.location.origin}/register?reff=${reffCode}` : '';

  return (
    <div className="min-h-screen bg-slate-900 pb-28">
      <Head>
        <title>{applicationData?.name || 'Nova Vant'} | Referral</title>
        <meta name="description" content="Referral Program" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="max-w-md mx-auto">
        {/* Hero Section - Same style as Dashboard */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-400/20 via-transparent to-transparent" />

          <div className="relative px-5 pt-6 pb-8">
            {/* Top Row */}
            <div className="flex items-center justify-between mb-6">
              <Image src="/logo.png" alt="Logo" width={100} height={36} className="h-8 w-auto brightness-0 invert" priority />
              <button
                onClick={() => router.push('/vip')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all"
              >
                <Icon icon="mdi:crown" className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-semibold text-white">VIP {userData?.level || 0}</span>
              </button>
            </div>

            {/* Page Title */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white mb-1">Program Referral</h1>
              <p className="text-blue-100 text-sm">Ajak teman, dapatkan komisi 30%</p>
            </div>

            {/* Stats Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-3xl font-black text-white">{teamStats[1]?.count || 0}</p>
                  <p className="text-xs text-blue-100 mt-1">Total Referral</p>
                </div>
                <div>
                  <p className="text-3xl font-black text-green-400">{teamStats[1]?.active || 0}</p>
                  <p className="text-xs text-blue-100 mt-1">Aktif</p>
                </div>
                <div>
                  <p className="text-xl font-black text-white">{formatCurrency(teamStats[1]?.total_invest || 0).replace('Rp', '')}</p>
                  <p className="text-xs text-blue-100 mt-1">Total Invest</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-5 py-6">
          {/* Share Section */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white mb-4">Bagikan Kode Anda</h3>

            {/* Referral Code */}
            <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700 mb-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-slate-400">Kode Referral</p>
                <button
                  onClick={() => copyToClipboard(reffCode, 'code')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${copied.code
                    ? 'bg-green-600 text-white'
                    : 'bg-blue-600 text-white hover:bg-blue-500'
                    }`}
                >
                  <Icon icon={copied.code ? "mdi:check" : "mdi:content-copy"} className="w-3.5 h-3.5" />
                  {copied.code ? 'Tersalin!' : 'Salin'}
                </button>
              </div>
              <p className="text-2xl font-black text-white tracking-widest font-mono text-center py-3 bg-slate-900/50 rounded-xl border border-slate-700">
                {reffCode || '------'}
              </p>
            </div>

            {/* Referral Link */}
            <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-slate-400">Link Referral</p>
                <button
                  onClick={() => copyToClipboard(referralLink, 'link')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${copied.link
                    ? 'bg-green-600 text-white'
                    : 'bg-blue-600 text-white hover:bg-blue-500'
                    }`}
                >
                  <Icon icon={copied.link ? "mdi:check" : "mdi:link-variant"} className="w-3.5 h-3.5" />
                  {copied.link ? 'Tersalin!' : 'Salin'}
                </button>
              </div>
              <p className="text-xs text-slate-300 break-all p-3 bg-slate-900/50 rounded-xl border border-slate-700 font-mono">
                {referralLink || 'Loading...'}
              </p>
            </div>
          </div>

          {/* Team Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Tim Saya</h3>
            </div>

            <button
              onClick={() => router.push('/referral/my-team?level=1')}
              className="w-full bg-slate-800 rounded-xl p-4 border border-slate-700 hover:border-slate-600 transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${primaryColor}20` }}
                >
                  <Icon icon="mdi:account-group" className="w-6 h-6" style={{ color: primaryColor }} />
                </div>
                <div className="text-left">
                  <p className="font-bold text-white">Lihat Anggota</p>
                  <p className="text-xs text-slate-400">{teamStats[1]?.count || 0} anggota • {teamStats[1]?.active || 0} aktif</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 rounded-lg text-xs font-bold bg-green-900/50 text-green-400 border border-green-700/50">
                  30%
                </span>
                <Icon icon="mdi:chevron-right" className="w-5 h-5 text-slate-500" />
              </div>
            </button>
          </div>

          {/* Commission Info */}
          <div className="mb-6">
            <div className="bg-blue-900/30 border border-blue-700/50 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                  <Icon icon="mdi:information" className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-white">Cara Kerja Komisi</p>
                  <p className="text-xs text-blue-300">Otomatis masuk saldo</p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-blue-200">
                <p>• <span className="font-bold text-white">30%</span> dari profit harian referral langsung</p>
              </div>
            </div>
          </div>

          {/* Bonus Tasks */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white mb-4">Bonus & Rewards</h3>

            {loadingTasks ? (
              <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 text-center">
                <div className="w-10 h-10 border-3 border-slate-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-slate-400">Memuat bonus...</p>
              </div>
            ) : tasks.length === 0 ? (
              <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 text-center">
                <Icon icon="mdi:gift-off-outline" className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">Belum ada bonus tersedia</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => {
                  const percent = Math.min(task.percent || 0, 100);
                  const canClaim = !task.lock && !task.taken;

                  return (
                    <div key={task.id} className={`bg-slate-800 rounded-xl border overflow-hidden ${canClaim ? 'border-green-600' : 'border-slate-700'}`}>
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${canClaim ? 'bg-green-900/50' : 'bg-slate-700'}`}>
                              <Icon icon={canClaim ? 'mdi:gift' : task.taken ? 'mdi:check-circle' : 'mdi:lock'} className={`w-5 h-5 ${canClaim ? 'text-green-400' : task.taken ? 'text-blue-400' : 'text-slate-500'}`} />
                            </div>
                            <div>
                              <p className="font-bold text-white">{task.name}</p>
                              <p className="text-xs text-slate-400">{task.active_subordinate_count}/{task.required_active_members} anggota aktif</p>
                            </div>
                          </div>
                          <div className="bg-yellow-900/50 px-3 py-1 rounded-lg border border-yellow-700/50">
                            <span className="text-yellow-400 font-bold text-sm">{formatCurrency(task.reward)}</span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-2 bg-slate-900 rounded-full overflow-hidden mb-3">
                          <div
                            className={`h-full rounded-full transition-all ${canClaim ? 'bg-green-500' : 'bg-slate-600'}`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>

                        <button
                          disabled={!canClaim || claiming[task.id]}
                          onClick={() => handleClaim(task.id)}
                          className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${canClaim
                            ? 'bg-green-600 text-white hover:bg-green-500 shadow-lg shadow-green-600/30'
                            : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                            }`}
                        >
                          {claiming[task.id] ? 'Memproses...' : task.taken ? '✓ Sudah Diklaim' : task.lock ? '🔒 Terkunci' : 'Klaim Hadiah'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {message && (
              <div className="mt-4 p-4 rounded-xl bg-green-900/30 border border-green-700/50 flex items-center gap-3">
                <Icon icon="mdi:check-circle" className="w-5 h-5 text-green-400" />
                <span className="text-green-300 font-medium text-sm">{message}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center py-4">
            <p className="text-xs text-slate-600">© 2026 {applicationData?.company}</p>
          </div>
        </div>
      </div>

      <BottomNavbar />
    </div>
  );
}
