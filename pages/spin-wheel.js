// pages/spin-wheel.js
import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { getSpinPrizeList, spinWheel, spinV2 } from '../utils/api';
import { Icon } from '@iconify/react';
import BottomNavbar from '../components/BottomNavbar';
import Modal from '../components/Modal';
import Image from 'next/image';

export default function SpinWheel() {
  const router = useRouter();
  const [prizes, setPrizes] = useState([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState({
    balance: 0,
    name: '',
    number: '',
    reff_code: '',
    spin_ticket: 0,
    total_invest: 0,
    total_withdraw: 0,
    level: 0
  });
  const wheelRef = useRef(null);
  const [currentRotation, setCurrentRotation] = useState(0);
  const [pointerActive, setPointerActive] = useState(false);
  const [applicationData, setApplicationData] = useState(null);

  const primaryColor = '#2563EB';

  const prizeColors = [
    '#3B82F6', '#2563EB', '#1D4ED8', '#1E40AF',
    '#6366F1', '#4F46E5', '#4338CA', '#3730A3'
  ];

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = sessionStorage.getItem('token');
    const accessExpire = sessionStorage.getItem('access_expire');
    if (!token || !accessExpire) {
      router.push('/login');
      return;
    }
    const fetchSpinData = async () => {
      try {
        setLoading(true);
        setError(null);
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          setUserData(user);
        }
        const res = await getSpinPrizeList();
        if (res && res.success && Array.isArray(res.data)) {
          const filtered = res.data.filter((prize) => prize.status === 'Active');
          const totalChance = filtered.reduce((sum, prize) => sum + (typeof prize.chance === 'number' ? prize.chance : 0), 0);
          const processedPrizes = filtered.map((prize, index) => ({
            ...prize,
            color: prizeColors[index % prizeColors.length],
            textColor: '#FFFFFF',
            name: prize.amount >= 1000 ? `Rp ${formatCurrency(prize.amount)}` : `${prize.amount} Poin`,
            chancePercent: totalChance > 0 ? ((prize.chance / totalChance) * 100) : 0
          }));
          setPrizes(processedPrizes);
        } else {
          setError('Gagal memuat hadiah spin');
        }
      } catch (err) {
        setError('Network error. Please try again.');
        console.error('Error fetching spin data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSpinData();
    const storedApplication = localStorage.getItem('application');
    if (storedApplication) {
      try {
        const parsed = JSON.parse(storedApplication);
        setApplicationData({
          name: parsed.name || 'Nova Vant',
          company: parsed.company || 'Novavant, Inc.',
        });
      } catch (e) {
        setApplicationData({ name: 'Nova Vant', company: 'Novavant, Inc.' });
      }
    } else {
      setApplicationData({ name: 'Nova Vant', company: 'Novavant, Inc.' });
    }
  }, []);

  const calculateRotation = (prizeIndex) => {
    if (!prizes || prizes.length === 0) return 0;
    const segmentAngle = 360 / prizes.length;
    const targetCenter = (prizeIndex + 0.5) * segmentAngle;
    const desiredFinal = (270 - targetCenter + 360) % 360;
    const fullSpins = (5 + Math.floor(Math.random() * 2)) * 360;
    const finalRotation = fullSpins + desiredFinal;
    return finalRotation;
  };

  const handleSpin = async () => {
    if (userData.spin_ticket < 1) {
      setError('Tidak memiliki tiket spin yang cukup');
      return;
    }

    if (prizes.length === 0) {
      setError('Data hadiah belum dimuat');
      return;
    }

    setIsSpinning(true);
    setError(null);
    setResult(null);

    try {
      const previousRotation = currentRotation;
      const response = await spinV2();

      if (!response || !response.success) {
        setError(response?.message || 'Spin gagal');
        if (wheelRef.current) {
          wheelRef.current.style.transition = 'transform 600ms ease-out';
          wheelRef.current.style.transform = `rotate(${previousRotation}deg)`;
        }
        setCurrentRotation(previousRotation);
        setIsSpinning(false);
        return;
      }

      const serverPrize = response.data && response.data.spin_result ? response.data.spin_result : null;
      let serverIndex = -1;
      if (serverPrize) {
        serverIndex = prizes.findIndex(p => (p.code && serverPrize.code && p.code === serverPrize.code) || (Number(p.amount) === Number(serverPrize.amount)));
      }
      if (serverIndex === -1) serverIndex = 0;

      const finalRotation = calculateRotation(serverIndex);
      const baseFull = Math.floor(currentRotation / 360) * 360;
      let targetRotation = baseFull + finalRotation;
      if (targetRotation <= currentRotation) targetRotation += 360;
      if (wheelRef.current) {
        wheelRef.current.style.transition = 'transform 4s cubic-bezier(0.2,0.7,0.3,1)';
        wheelRef.current.style.transform = `rotate(${targetRotation}deg)`;
      }
      await new Promise(resolve => setTimeout(resolve, 4200));
      setCurrentRotation(targetRotation);

      setPointerActive(true);
      setResult({
        prize: {
          amount: response.data.spin_result.amount,
          name: response.data.spin_result.amount >= 1000 ? `Rp ${formatCurrency(response.data.spin_result.amount)}` : `${response.data.spin_result.amount} Poin`
        },
        message: response.message,
        previousBalance: response.data.balance_info.previous_balance,
        currentBalance: response.data.balance_info.current_balance,
        prizeAmount: response.data.balance_info.prize_amount
      });
      setTimeout(() => setPointerActive(false), 1800);

      const updatedUserData = {
        ...userData,
        balance: response.data.balance_info.current_balance,
        spin_ticket: userData.spin_ticket - 1
      };
      setUserData(updatedUserData);
      localStorage.setItem('user', JSON.stringify(updatedUserData));

    } catch (err) {
      setError(err.message || 'Network error. Please try again.');
      if (wheelRef.current) {
        wheelRef.current.style.transition = 'none';
        wheelRef.current.style.transform = `rotate(${currentRotation}deg)`;
      }
    } finally {
      setIsSpinning(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID').format(amount);
  };

  const createWheelSegments = () => {
    if (prizes.length === 0) return null;

    const segmentAngle = 360 / prizes.length;
    const radius = 140;
    const centerX = 140;
    const centerY = 140;

    return prizes.map((prize, index) => {
      const startAngleRad = (index * segmentAngle) * (Math.PI / 180);
      const endAngleRad = ((index + 1) * segmentAngle) * (Math.PI / 180);

      const x1 = centerX + radius * Math.cos(startAngleRad);
      const y1 = centerY + radius * Math.sin(startAngleRad);
      const x2 = centerX + radius * Math.cos(endAngleRad);
      const y2 = centerY + radius * Math.sin(endAngleRad);

      const largeArcFlag = segmentAngle > 180 ? 1 : 0;
      const pathData = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

      const textAngleRad = (startAngleRad + endAngleRad) / 2;
      const textRadius = radius * 0.65;
      const textX = centerX + textRadius * Math.cos(textAngleRad);
      const textY = centerY + textRadius * Math.sin(textAngleRad);

      const textAngleDeg = (textAngleRad * (180 / Math.PI)) + 90;
      return (
        <g key={index}>
          <path d={pathData} fill={prize.color} stroke="#1e293b" strokeWidth="3" />
          <text
            x={textX}
            y={textY}
            fill={prize.textColor}
            fontSize="10"
            fontWeight="bold"
            textAnchor="middle"
            dominantBaseline="central"
            transform={`rotate(${textAngleDeg}, ${textX}, ${textY})`}
          >
            {prize.name}
          </text>
        </g>
      );
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 pb-36">
      <Head>
        <title>{applicationData?.name || 'Nova Vant'} | Spin Wheel</title>
        <meta name="description" content="Spin Wheel" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="max-w-md mx-auto">
        {/* Hero Section */}
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

            {/* Title */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white mb-1">Spin & Win</h1>
              <p className="text-blue-100 text-sm">Putar roda dan menangkan hadiah</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-1">
                  <Icon icon="mdi:wallet" className="w-4 h-4 text-blue-200" />
                  <span className="text-xs text-blue-100">Saldo</span>
                </div>
                <p className="text-lg font-bold text-white">Rp {formatCurrency(userData.balance)}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-1">
                  <Icon icon="mdi:ticket" className="w-4 h-4 text-yellow-400" />
                  <span className="text-xs text-blue-100">Tiket</span>
                </div>
                <p className="text-lg font-bold text-yellow-400">{userData.spin_ticket}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-5 py-6">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 rounded-xl bg-red-900/30 border border-red-700/50 flex items-center gap-2">
              <Icon icon="mdi:alert-circle" className="w-5 h-5 text-red-400 flex-shrink-0" />
              <span className="text-sm text-red-300">{error}</span>
            </div>
          )}

          {/* Wheel Container */}
          <div className="mb-6 bg-slate-800 rounded-2xl p-6 border border-slate-700">
            <div className="relative flex justify-center">
              <div className="relative w-72 h-72">
                {loading ? (
                  <div className="absolute inset-0 rounded-full bg-slate-700 border-2 border-slate-600 grid place-items-center">
                    <div className="w-10 h-10 border-3 border-slate-600 border-t-blue-500 rounded-full animate-spin" />
                  </div>
                ) : (
                  <svg
                    ref={wheelRef}
                    className="absolute inset-0 w-full h-full"
                    viewBox="0 0 280 280"
                    style={{
                      transform: `rotate(${currentRotation}deg)`,
                      transition: 'transform 4s cubic-bezier(0.2, 0.7, 0.3, 1)',
                      filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))'
                    }}
                  >
                    {createWheelSegments()}
                  </svg>
                )}

                {/* Center Button */}
                <div className="absolute top-1/2 left-1/2 w-14 h-14 rounded-full transform -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center border-4 border-slate-700 bg-blue-600 shadow-lg">
                  <Icon icon="mdi:star" className="w-7 h-7 text-white" />
                </div>

                {/* Pointer */}
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none">
                  <div className={`w-0 h-0 border-l-[16px] border-r-[16px] border-t-[24px] border-l-transparent border-r-transparent drop-shadow-lg transition-all duration-300 ${pointerActive ? 'border-t-green-500 scale-125' : 'border-t-blue-500'}`}></div>
                </div>
              </div>
            </div>

            {/* Spin Button */}
            <button
              onClick={handleSpin}
              disabled={isSpinning || userData.spin_ticket < 1}
              className={`w-full mt-6 py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${isSpinning || userData.spin_ticket < 1
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30'
                }`}
            >
              {isSpinning ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Memutar...
                </>
              ) : (
                <>
                  <Icon icon="mdi:play-circle" className="w-6 h-6" />
                  {userData.spin_ticket < 1 ? 'Tiket Habis' : 'Putar Sekarang'}
                </>
              )}
            </button>
          </div>

          {/* How to Get Tickets */}
          <div className="mb-6 bg-blue-900/30 rounded-2xl p-5 border border-blue-700/50">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
                <Icon icon="mdi:information" className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white mb-1 text-sm">Cara Dapat Tiket Spin</h3>
                <p className="text-xs text-blue-200 leading-relaxed">
                  Lakukan investasi dan mengundang teman untuk mendapatkan tiket spin gratis!
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center py-4">
            <p className="text-xs text-slate-600">© 2026 {applicationData?.company}</p>
          </div>
        </div>
      </div>

      {/* Result Modal */}
      <Modal
        isOpen={!!result}
        onClose={() => setResult(null)}
        maxWidth="max-w-sm"
        showCloseButton={true}
      >
        <div className="p-6 text-center">
          <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center bg-gradient-to-br from-yellow-400 to-amber-600 shadow-lg shadow-yellow-500/30 animate-bounce">
            <Icon icon="mdi:trophy" className="w-10 h-10 text-white" />
          </div>

          <h2 className="text-2xl font-black text-white mb-2">Selamat! 🎉</h2>
          <p className="text-sm text-slate-400 mb-6">Anda memenangkan</p>

          <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/30">
            <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              {result?.prize?.name}
            </p>
          </div>

          <div className="mb-6 bg-slate-700/30 rounded-2xl p-4 border border-white/5">
            <div className="flex items-center justify-between text-sm mb-3">
              <span className="text-slate-400">Saldo Sebelum</span>
              <span className="font-semibold text-white">Rp {formatCurrency(result?.previousBalance || 0)}</span>
            </div>
            <div className="flex items-center justify-between text-sm mb-3">
              <span className="text-slate-400">Hadiah</span>
              <span className="font-bold text-green-400">+Rp {formatCurrency(result?.prizeAmount || 0)}</span>
            </div>
            <div className="h-px bg-white/10 my-3" />
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">Saldo Sekarang</span>
              <span className="text-lg font-bold text-blue-400">Rp {formatCurrency(result?.currentBalance || 0)}</span>
            </div>
          </div>

          <button
            onClick={() => setResult(null)}
            className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-blue-600/20"
          >
            Ambil Hadiah
          </button>
        </div>
      </Modal>

      <BottomNavbar />
    </div>
  );
}
