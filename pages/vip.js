// pages/vip.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Icon } from '@iconify/react';
import BottomNavbar from '../components/BottomNavbar';

export default function VIPPage() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [applicationData, setApplicationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState(null);

  const VIP_THRESHOLDS = {
    1: 50000,
    2: 1200000,
    3: 10000000,
    4: 30000000,
    5: 150000000
  };

  const VIP_DATA = {
    0: {
      name: 'Basic',
      icon: 'mdi:shield-account',
      gradient: 'from-slate-600 via-slate-500 to-slate-600',
      bgGlow: 'bg-slate-500/20',
      borderColor: 'border-slate-500',
      textColor: 'text-slate-400',
      benefits: [
        { icon: 'mdi:brain', text: 'Akses produk Neura' },
        { icon: 'mdi:shield-check', text: 'Investasi dengan aman' },
        { icon: 'mdi:infinity', text: 'Investasi tanpa batas' }
      ],
      profitRate: '100%'
    },
    1: {
      name: 'Bronze',
      icon: 'mdi:star-circle',
      gradient: 'from-amber-700 via-amber-600 to-yellow-600',
      bgGlow: 'bg-amber-500/20',
      borderColor: 'border-amber-500',
      textColor: 'text-amber-400',
      benefits: [
        { icon: 'mdi:star-four-points', text: 'Membuka Finora 1' },
        { icon: 'mdi:gift', text: 'Fitur Nova Gift' },
        { icon: 'mdi:trending-up', text: 'Profit hingga 140%' }
      ],
      profitRate: '140%'
    },
    2: {
      name: 'Silver',
      icon: 'mdi:medal',
      gradient: 'from-slate-400 via-slate-300 to-slate-400',
      bgGlow: 'bg-slate-300/20',
      borderColor: 'border-slate-400',
      textColor: 'text-slate-300',
      benefits: [
        { icon: 'mdi:star-four-points', text: 'Membuka Finora 2' },
        { icon: 'mdi:chart-areaspline', text: 'Profit hingga 210%' },
        { icon: 'mdi:account-group', text: 'Priority Support' }
      ],
      profitRate: '210%'
    },
    3: {
      name: 'Gold',
      icon: 'mdi:trophy-variant',
      gradient: 'from-yellow-500 via-amber-400 to-yellow-500',
      bgGlow: 'bg-yellow-400/20',
      borderColor: 'border-yellow-500',
      textColor: 'text-yellow-400',
      benefits: [
        { icon: 'mdi:star-four-points', text: 'Membuka Finora 3' },
        { icon: 'mdi:hexagon-multiple', text: 'Semua produk Corex' },
        { icon: 'mdi:swap-horizontal', text: 'Fitur Transfer' },
        { icon: 'mdi:chart-line-variant', text: 'Profit hingga 235%' }
      ],
      profitRate: '235%'
    },
    4: {
      name: 'Platinum',
      icon: 'mdi:diamond-stone',
      gradient: 'from-blue-500 via-indigo-400 to-purple-500',
      bgGlow: 'bg-blue-400/20',
      borderColor: 'border-blue-500',
      textColor: 'text-blue-400',
      benefits: [
        { icon: 'mdi:star-four-points', text: 'Membuka Finora 4' },
        { icon: 'mdi:rocket-launch', text: 'Profit hingga 280%' },
        { icon: 'mdi:star-shooting', text: 'Exclusive Products' }
      ],
      profitRate: '280%'
    },
    5: {
      name: 'Ultimate',
      icon: 'mdi:crown-circle',
      gradient: 'from-cyan-400 via-blue-500 to-purple-600',
      bgGlow: 'bg-cyan-400/20',
      borderColor: 'border-cyan-400',
      textColor: 'text-cyan-400',
      benefits: [
        { icon: 'mdi:check-all', text: 'Semua fitur tersedia' },
        { icon: 'mdi:star-four-points', text: 'Maximum Profit Rate' },
        { icon: 'mdi:crown', text: 'VIP Ultimate Benefits' }
      ],
      profitRate: 'MAX'
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = sessionStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const app = JSON.parse(localStorage.getItem('application') || '{}');

    const level = user.level || 0;
    setUserData({
      name: user.name || 'User',
      level: level,
      total_invest_vip: user.total_invest_vip || 0,
      total_invest: user.total_invest || 0,
      balance: user.balance || 0
    });
    setSelectedLevel(level);

    setApplicationData({
      name: app.name || 'Nova Vant',
      company: app.company || 'PT NovaVant Next Generation'
    });

    setLoading(false);
  }, [router]);

  const getVIPProgress = () => {
    const totalVIP = userData?.total_invest_vip || 0;
    const currentLevel = userData?.level || 0;
    const nextLevel = currentLevel + 1;

    if (nextLevel > 5) {
      return { current: currentLevel, next: null, progress: 100, remaining: 0, nextThreshold: 0 };
    }

    const nextThreshold = VIP_THRESHOLDS[nextLevel];
    const prevThreshold = VIP_THRESHOLDS[currentLevel] || 0;
    const progress = ((totalVIP - prevThreshold) / (nextThreshold - prevThreshold)) * 100;
    const remaining = nextThreshold - totalVIP;

    return {
      current: currentLevel,
      next: nextLevel,
      progress: Math.min(Math.max(progress, 0), 100),
      remaining: Math.max(remaining, 0),
      nextThreshold
    };
  };

  const formatCurrency = (amount) => {
    if (amount >= 1000000000) {
      return `Rp ${(amount / 1000000000).toFixed(1)}M`;
    } else if (amount >= 1000000) {
      return `Rp ${(amount / 1000000).toFixed(1)}Jt`;
    } else if (amount >= 1000) {
      return `Rp ${(amount / 1000).toFixed(0)}Rb`;
    }
    return `Rp ${amount}`;
  };

  const formatFullCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-slate-700 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  const vipProgress = getVIPProgress();
  const currentLevel = userData?.level || 0;
  const currentData = VIP_DATA[currentLevel];
  const selectedData = VIP_DATA[selectedLevel] || currentData;

  return (
    <div className="min-h-screen bg-slate-900 pb-36">
      <Head>
        <title>{applicationData?.name || 'Nova Vant'} | VIP Status</title>
        <meta name="description" content="VIP Membership Status" />
        <link rel="icon" href="/favicon.ico" />
      </Head>



      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-slate-800">
          <div className="max-w-md mx-auto px-5 py-4 flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800/50 border border-slate-700 hover:bg-slate-700 transition-all"
            >
              <Icon icon="mdi:arrow-left" className="w-5 h-5 text-slate-300" />
            </button>
            <h1 className="text-lg font-bold text-white">VIP Center</h1>
            <div className="w-10" />
          </div>
        </div>

        <div className="max-w-md mx-auto px-5 pt-6">
          {/* Main VIP Card */}
          <div className="relative mb-8">
            {/* Glow Effect */}
            <div className={`absolute inset-0 ${currentData.bgGlow} rounded-3xl blur-2xl scale-105`} />

            {/* Card */}
            <div className={`relative bg-gradient-to-br ${currentData.gradient} rounded-3xl p-6 overflow-hidden`}>
              {/* Pattern Overlay */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 1px)`,
                  backgroundSize: '24px 24px'
                }} />
              </div>

              {/* Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent" />

              {/* Content */}
              <div className="relative">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <p className="text-white/60 text-sm mb-1">Keanggotaan Anda</p>
                    <div className="flex items-center gap-2">
                      <span className="text-4xl font-black text-white">VIP {currentLevel}</span>
                    </div>
                    <p className="text-white/80 text-lg font-semibold mt-1">{currentData.name}</p>
                  </div>
                  <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 shadow-2xl">
                    <Icon icon={currentData.icon} className="w-10 h-10 text-white" />
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-black/20 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                    <p className="text-white/60 text-xs mb-1">Investasi VIP</p>
                    <p className="text-white font-bold text-lg">{formatCurrency(userData?.total_invest_vip || 0)}</p>
                  </div>
                  <div className="bg-black/20 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                    <p className="text-white/60 text-xs mb-1">Profit Rate</p>
                    <p className="text-white font-bold text-lg">{currentData.profitRate}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Section */}
          {vipProgress.next ? (
            <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-5 border border-slate-800 mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Icon icon="mdi:rocket-launch-outline" className="w-5 h-5 text-blue-400" />
                  <span className="text-white font-semibold">Progress ke VIP {vipProgress.next}</span>
                </div>
                <span className="text-blue-400 font-bold">{vipProgress.progress.toFixed(0)}%</span>
              </div>

              {/* Progress Bar */}
              <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden mb-4">
                <div
                  className="absolute inset-y-0 left-0 bg-blue-600 rounded-full transition-all duration-1000"
                  style={{ width: `${vipProgress.progress}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Kurang <span className="text-blue-400 font-semibold">{formatFullCurrency(vipProgress.remaining)}</span></span>
                <span className="text-slate-500">Target: {formatFullCurrency(vipProgress.nextThreshold)}</span>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-emerald-900/50 to-cyan-900/50 backdrop-blur-xl rounded-2xl p-6 border border-emerald-700/50 mb-8 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-3 animate-bounce">
                <Icon icon="mdi:crown" className="w-8 h-8 text-emerald-400" />
              </div>
              <p className="text-2xl font-black text-white mb-1">Level Maksimal! 🎉</p>
              <p className="text-emerald-300">Selamat! Anda sudah mencapai VIP tertinggi</p>
            </div>
          )}

          {/* VIP Level Selector */}
          <div className="mb-6">
            <h2 className="text-white font-bold mb-4 flex items-center gap-2">
              <Icon icon="mdi:star-four-points" className="w-5 h-5 text-yellow-400" />
              Pilih Level untuk Detail
            </h2>

            <div className="grid grid-cols-6 gap-2">
              {[0, 1, 2, 3, 4, 5].map((level) => {
                const data = VIP_DATA[level];
                const isSelected = selectedLevel === level;
                const isUnlocked = currentLevel >= level;
                const isCurrent = currentLevel === level;

                return (
                  <button
                    key={level}
                    onClick={() => setSelectedLevel(level)}
                    className={`relative aspect-square rounded-xl flex flex-col items-center justify-center transition-all ${isSelected
                      ? `bg-gradient-to-br ${data.gradient} shadow-lg scale-105`
                      : isUnlocked
                        ? 'bg-slate-800 hover:bg-slate-700'
                        : 'bg-slate-900/50 opacity-50'
                      } ${isCurrent ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-900' : ''}`}
                  >
                    <Icon
                      icon={data.icon}
                      className={`w-5 h-5 ${isSelected ? 'text-white' : data.textColor}`}
                    />
                    <span className={`text-xs font-bold mt-1 ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                      {level}
                    </span>
                    {!isUnlocked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 rounded-xl">
                        <Icon icon="mdi:lock" className="w-4 h-4 text-slate-500" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Level Detail */}
          <div className={`bg-slate-900/80 backdrop-blur-xl rounded-2xl border ${selectedData.borderColor}/30 overflow-hidden mb-8`}>
            {/* Header */}
            <div className={`bg-gradient-to-r ${selectedData.gradient} p-5`}>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                  <Icon icon={selectedData.icon} className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-2xl font-black text-white">VIP {selectedLevel}</h3>
                    {currentLevel === selectedLevel && (
                      <span className="px-2 py-0.5 text-xs font-bold bg-white/20 text-white rounded-full">
                        Aktif
                      </span>
                    )}
                  </div>
                  <p className="text-white/80 font-medium">{selectedData.name} Membership</p>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="p-5">
              <p className="text-sm text-slate-400 mb-4 flex items-center gap-2">
                <Icon icon="mdi:gift-outline" className="w-4 h-4" />
                Keuntungan VIP {selectedLevel}
              </p>
              <div className="space-y-3">
                {selectedData.benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                    <div className={`w-10 h-10 rounded-lg ${selectedData.bgGlow} flex items-center justify-center`}>
                      <Icon icon={benefit.icon} className={`w-5 h-5 ${selectedData.textColor}`} />
                    </div>
                    <span className="text-white font-medium">{benefit.text}</span>
                  </div>
                ))}
              </div>

              {/* Threshold Info */}
              {VIP_THRESHOLDS[selectedLevel] && (
                <div className="mt-4 p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">Investasi yang dibutuhkan</span>
                    <span className={`font-bold ${selectedData.textColor}`}>
                      {formatFullCurrency(VIP_THRESHOLDS[selectedLevel])}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* How to Upgrade */}
          <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-5 border border-slate-800 mb-8">
            <h3 className="font-bold text-white mb-5 flex items-center gap-2">
              <Icon icon="mdi:lightbulb-on" className="w-5 h-5 text-yellow-400" />
              Cara Naik Level VIP
            </h3>

            <div className="space-y-4">
              {/* Router */}
              <div className="flex items-start gap-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <Icon icon="mdi:brain" className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <p className="font-bold text-emerald-300 mb-1">Investasi pada Neura ✓</p>
                  <p className="text-sm text-emerald-400/80">Profit terkunci & menaikkan level VIP</p>
                </div>
              </div>

              {/* Finora & Corex */}
              <div className="flex items-start gap-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <Icon icon="mdi:close" className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <p className="font-bold text-red-300 mb-1">Finora & Corex</p>
                  <p className="text-sm text-red-400/80">TIDAK menaikkan level VIP</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => router.push('/dashboard')}
              className="w-full mt-6 py-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30"
            >
              <Icon icon="mdi:rocket-launch" className="w-5 h-5" />
              Mulai Investasi Sekarang
            </button>
          </div>

          {/* Footer */}
          <div className="text-center py-4">
            <p className="text-xs text-slate-600">© 2026 {applicationData?.company}</p>
          </div>
        </div>
      </div>

      {/* Shimmer Animation Style */}
      <style jsx>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-shimmer {
                    animation: shimmer 2s infinite;
                }
            `}</style>

      {/* Bottom Nav */}
      <BottomNavbar />
    </div>
  );
}
