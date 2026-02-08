// pages/dashboard.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { getProducts } from '../utils/api';
import InvestmentModal from '../components/InvestmentModal';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import { Icon } from '@iconify/react';
import BottomNavbar from '../components/BottomNavbar';
import Image from 'next/image';
import ProfileImage from '../components/ProfileImage';

export default function Dashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [applicationData, setApplicationData] = useState(null);
  const [products, setProducts] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('Router');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', type: 'success' });
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [showPromoPopup, setShowPromoPopup] = useState(false);
  const [hidePopupChecked, setHidePopupChecked] = useState(false);
  const [articles, setArticles] = useState(null);
  const [loadingArticles, setLoadingArticles] = useState(false);

  const primaryColor = '#2563EB';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = sessionStorage.getItem('token');
    const accessExpire = sessionStorage.getItem('access_expire');
    if (!token || !accessExpire) {
      router.push('/login');
      return;
    }
    const storedUser = localStorage.getItem('user');
    const storedApplication = localStorage.getItem('application');

    const popupHiddenUntil = localStorage.getItem('popupHiddenUntil');
    const now = new Date().getTime();

    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUserData({
          name: parsed.name || '',
          balance: parsed.balance || 0,
          active: parsed.active || false,
          level: parsed.level || 0,
          total_invest: parsed.total_invest || 0,
          total_invest_vip: parsed.total_invest_vip || 0,
          profile: parsed.profile || null
        });
      } catch (e) {
        setUserData({ name: '', balance: 0, active: false, level: 0, profile: null });
      }
    }

    if (storedApplication) {
      try {
        const parsed = JSON.parse(storedApplication);
        setApplicationData({
          name: parsed.name || 'NovaVant',
          healthy: parsed.healthy || false,
          link_app: parsed.link_app,
          link_cs: parsed.link_cs,
          link_group: parsed.link_group,
          logo: parsed.logo,
          max_withdraw: parsed.max_withdraw,
          min_withdraw: parsed.min_withdraw,
          withdraw_charge: parsed.withdraw_charge
        });
      } catch (e) {
        setApplicationData({ name: 'NovaVant', healthy: false });
      }
    } else {
      setApplicationData({ name: 'NovaVant', healthy: false });
    }

    fetchProducts();
    fetchArticles();

    if (!popupHiddenUntil || now > parseInt(popupHiddenUntil)) {
      const popupTimer = setTimeout(() => {
        setShowWelcomePopup(true);
      }, 1000);
      return () => clearTimeout(popupTimer);
    }

    const handleProfileUpdate = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          setUserData(prev => ({
            ...prev,
            name: parsed.name || prev.name,
            profile: parsed.profile || null
          }));
        } catch (e) { }
      }
    };

    window.addEventListener('user-profile-updated', handleProfileUpdate);
    return () => {
      window.removeEventListener('user-profile-updated', handleProfileUpdate);
    };
  }, []);

  useEffect(() => {
    if (products[selectedCategory] && products[selectedCategory].length > 0 && !selectedProduct) {
      setSelectedProduct(products[selectedCategory][0]);
    }
  }, [products, selectedCategory, selectedProduct]);

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getProducts();
      setProducts((data && data.data) ? data.data : {});

      if (data && data.data) {
        const categories = Object.keys(data.data);
        const preferred = ['Neura', 'Finora', 'Corex'];
        const orderedCategories = [
          ...preferred.filter(k => categories.includes(k)),
          ...categories.filter(k => !preferred.includes(k))
        ];
        if (orderedCategories.length > 0) {
          setSelectedCategory(orderedCategories[0]);
        }
      }
    } catch (err) {
      setError(err.message || 'Gagal memuat produk');
      setToast({ open: true, message: err.message || 'Gagal memuat produk', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchArticles = async () => {
    setLoadingArticles(true);
    try {
      const response = await fetch('https://api-news.novavant.com/v1/novavant/newest');
      const data = await response.json().catch(() => ({}));

      if (data.success && data.data && Array.isArray(data.data) && data.data.length > 0) {
        setArticles(data.data.slice(0, 3));
      } else {
        setArticles(null);
      }
    } catch (error) {
      setArticles(null);
    } finally {
      setLoadingArticles(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getCategoryIcon = (categoryName) => {
    if (categoryName.toLowerCase().includes('neura')) return 'mdi:brain';
    if (categoryName.toLowerCase().includes('finora')) return 'mdi:star-four-points';
    if (categoryName.toLowerCase().includes('corex')) return 'mdi:hexagon-multiple';
    return 'mdi:star-outline';
  };

  const calculateTotalReturn = (product) => {
    if (!product) return 0;
    return product.amount + (product.daily_profit * product.duration);
  };

  const handleCloseWelcomePopup = () => {
    setShowWelcomePopup(false);
    setTimeout(() => {
      setShowPromoPopup(true);
    }, 300);
  };

  const handleClosePromoPopup = () => {
    if (hidePopupChecked) {
      const tenMinutesFromNow = new Date().getTime() + 10 * 60 * 1000;
      localStorage.setItem('popupHiddenUntil', tenMinutesFromNow.toString());
    }
    setShowPromoPopup(false);
    setHidePopupChecked(false);
  };

  const handleClaimReward = () => {
    if (applicationData?.link_group) {
      window.open(applicationData.link_group, '_blank');
    }
  };

  // Quick action buttons config
  const quickActions = [
    { icon: 'mdi:swap-horizontal', label: 'Transfer', href: '/transfer', color: 'blue' },
    { icon: 'mdi:gift-outline', label: 'Nova Gift', href: '/gift', color: 'purple' },
    { icon: 'mdi:cash-fast', label: 'Tarik Uang', href: '/withdraw', color: 'green' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 pb-28">
      <Head>
        <title>{applicationData?.name || 'NovaVant'} | Dashboard</title>
        <meta name="description" content={`${applicationData?.name || 'NovaVant'} Dashboard`} />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </Head>

      <div className="max-w-md mx-auto">
        {/* Hero Section - Gradient Header */}
        <div className="relative overflow-hidden">
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-400/20 via-transparent to-transparent" />

          {/* Content */}
          <div className="relative px-5 pt-6 pb-8">
            {/* Top Row - Logo & VIP */}
            <div className="flex items-center justify-between mb-6">
              <Image
                src="/logo.png"
                alt="Logo"
                width={100}
                height={36}
                className="h-8 w-auto object-contain brightness-0 invert"
                priority
              />
              <button
                onClick={() => router.push('/vip')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all"
              >
                <Icon icon="mdi:crown" className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-semibold text-white">VIP {userData?.level || 0}</span>
              </button>
            </div>

            {/* User Greeting */}
            <div className="flex items-center gap-3 mb-6">
              <ProfileImage
                profile={userData?.profile}
                className="w-12 h-12 ring-2 ring-white/30"
                iconClassName="w-6 h-6"
                primaryColor="#ffffff"
              />
              <div>
                <p className="text-sm text-blue-100">Selamat datang kembali,</p>
                <h1 className="text-lg font-bold text-white">{userData?.name || 'Investor'} 👋</h1>
              </div>
            </div>

            {/* Balance Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-blue-100 flex items-center gap-2">
                  <Icon icon="mdi:wallet-outline" className="w-4 h-4" />
                  Saldo Tersedia
                </p>
                <button
                  onClick={() => router.push('/portofolio')}
                  className="text-xs text-blue-200 hover:text-white flex items-center gap-1 transition-colors"
                >
                  Lihat Detail
                  <Icon icon="mdi:chevron-right" className="w-4 h-4" />
                </button>
              </div>
              <h2 className="text-3xl font-black text-white mb-4">
                {formatCurrency(userData?.balance || 0)}
              </h2>

              {/* Quick Action Buttons */}
              <div className="grid grid-cols-3 gap-3">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => action.href !== '#' ? router.push(action.href) : null}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 transition-all active:scale-95"
                  >
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <Icon icon={action.icon} className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs font-medium text-white">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-5 py-6">
          {/* Loading */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block w-10 h-10 border-3 border-slate-700 border-t-blue-500 rounded-full animate-spin" />
              <p className="mt-4 text-sm text-slate-400">Memuat produk...</p>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="bg-red-900/30 border border-red-700/50 rounded-2xl p-5 text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-red-900/50 flex items-center justify-center mx-auto mb-3">
                <Icon icon="mdi:alert-circle" className="w-6 h-6 text-red-400" />
              </div>
              <p className="text-sm text-red-300 mb-4">{error}</p>
              <button
                onClick={fetchProducts}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors"
              >
                Coba Lagi
              </button>
            </div>
          )}

          {/* Products */}
          {!loading && !error && (
            <div>
              {Object.keys(products).length === 0 ? (
                <div className="bg-slate-800/50 rounded-2xl p-8 text-center border border-slate-700">
                  <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center mx-auto mb-4">
                    <Icon icon="mdi:package-variant" className="w-8 h-8 text-slate-500" />
                  </div>
                  <p className="text-slate-400">Tidak ada produk tersedia</p>
                </div>
              ) : (
                <>
                  {/* Section Title */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white">Produk Investasi</h3>
                      <p className="text-xs text-slate-400">Pilih produk sesuai kebutuhan Anda</p>
                    </div>
                    <button
                      onClick={() => router.push('/portofolio')}
                      className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                    >
                      Lihat Semua
                    </button>
                  </div>

                  {/* Category Pills - Horizontal Scroll */}
                  <div className="flex gap-2 mb-5 overflow-x-auto pb-2 -mx-5 px-5" style={{ scrollbarWidth: 'none' }}>
                    {(() => {
                      const categories = Object.keys(products);
                      const preferred = ['Neura', 'Finora', 'Corex'];
                      const orderedCategories = [
                        ...preferred.filter((k) => categories.includes(k)),
                        ...categories.filter((k) => !preferred.includes(k)),
                      ];
                      return orderedCategories;
                    })().map((categoryName) => (
                      <button
                        key={categoryName}
                        onClick={() => {
                          setSelectedCategory(categoryName);
                          setSelectedProduct(products[categoryName][0] || null);
                        }}
                        className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${selectedCategory === categoryName
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                          : 'bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-600'
                          }`}
                      >
                        <Icon icon={getCategoryIcon(categoryName)} className="w-4 h-4" />
                        {categoryName}
                      </button>
                    ))}
                  </div>

                  {/* Product Cards */}
                  {products[selectedCategory] && products[selectedCategory].length > 0 ? (
                    <div className="space-y-4">
                      {products[selectedCategory].map((product) => {
                        const isVipEnough = (userData?.level || 0) >= product.required_vip;
                        const canBuy = product.status === 'Active' && isVipEnough;

                        return (
                          <div
                            key={product.id}
                            className="bg-slate-800/80 rounded-2xl overflow-hidden border border-slate-700 hover:border-slate-600 transition-all"
                          >
                            {/* Product Header */}
                            <div className="p-4 border-b border-slate-700/50">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg">
                                    <Icon icon={getCategoryIcon(selectedCategory)} className="w-6 h-6 text-white" />
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-white text-lg">{product.name}</h4>
                                    <p className="text-blue-400 font-semibold">{formatCurrency(product.amount)}</p>
                                  </div>
                                </div>
                                {product.required_vip > 0 && (
                                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-900/30 border border-yellow-600/30 rounded-lg">
                                    <Icon icon="mdi:crown" className="w-4 h-4 text-yellow-400" />
                                    <span className="text-xs font-bold text-yellow-400">VIP {product.required_vip}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Product Stats */}
                            <div className="p-4">
                              <div className="grid grid-cols-3 gap-3 mb-4">
                                <div className="text-center p-3 rounded-xl bg-slate-900/50">
                                  <Icon icon="mdi:chart-line" className="w-5 h-5 text-green-400 mx-auto mb-1" />
                                  <p className="text-xs text-slate-400 mb-0.5">Profit/hari</p>
                                  <p className="text-sm font-bold text-green-400">
                                    {formatCurrency(product.daily_profit)}
                                  </p>
                                </div>
                                <div className="text-center p-3 rounded-xl bg-slate-900/50">
                                  <Icon icon="mdi:calendar-clock" className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                                  <p className="text-xs text-slate-400 mb-0.5">Durasi</p>
                                  <p className="text-sm font-bold text-white">{product.duration} hari</p>
                                </div>
                                <div className="text-center p-3 rounded-xl bg-slate-900/50">
                                  <Icon icon="mdi:cash-multiple" className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                                  <p className="text-xs text-slate-400 mb-0.5">Total Return</p>
                                  <p className="text-sm font-bold text-amber-400">{formatCurrency(calculateTotalReturn(product))}</p>
                                </div>
                              </div>

                              {product.purchase_limit > 0 && (
                                <div className="mb-4 flex items-center justify-center gap-2 px-3 py-2 bg-amber-900/20 border border-amber-700/30 rounded-xl">
                                  <Icon icon="mdi:information" className="w-4 h-4 text-amber-400" />
                                  <span className="text-xs text-amber-300 font-medium">
                                    Maksimal {product.purchase_limit}x pembelian
                                  </span>
                                </div>
                              )}

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedProduct(product);
                                  setShowModal(true);
                                }}
                                disabled={!canBuy}
                                className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${canBuy
                                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-600/30'
                                  : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                                  }`}
                              >
                                {!isVipEnough ? (
                                  <>
                                    <Icon icon="mdi:lock" className="w-4 h-4" />
                                    Butuh VIP {product.required_vip}
                                  </>
                                ) : (
                                  <>
                                    <Icon icon="mdi:cart-plus" className="w-4 h-4" />
                                    Investasi Sekarang
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-slate-800/50 rounded-2xl p-8 text-center border border-slate-700">
                      <Icon icon="mdi:package-variant" className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                      <p className="text-slate-400">Tidak ada produk di kategori {selectedCategory}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Articles Section */}
          {!loadingArticles && articles && articles.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Berita Terbaru</h3>
                  <p className="text-xs text-slate-400">Update dan informasi terkini</p>
                </div>
                <a
                  href="https://news.novavant.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                >
                  Lihat Semua
                </a>
              </div>

              <div className="space-y-3">
                {articles.map((article, index) => (
                  <a
                    key={index}
                    href={article.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-slate-600 transition-all group"
                  >
                    {article.thumbnail && (
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-slate-700">
                        <Image
                          src={article.thumbnail}
                          alt={article.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                          unoptimized
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      {article.categories && (
                        <span className="inline-block px-2 py-0.5 bg-blue-900/50 text-blue-300 text-xs font-medium rounded mb-2">
                          {article.categories}
                        </span>
                      )}
                      <h4 className="font-semibold text-white text-sm group-hover:text-blue-400 transition-colors line-clamp-2">
                        {article.title}
                      </h4>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="text-center py-4">
            <p className="text-xs text-slate-600">© 2026 {applicationData?.company}</p>
          </div>
        </div>
      </div>

      {/* Bottom Nav */}
      <BottomNavbar />

      {/* Welcome Popup */}
      <Modal
        isOpen={showWelcomePopup}
        onClose={handleCloseWelcomePopup}
        showCloseButton={true}
        maxWidth="max-w-sm"
      >
        <div className="relative overflow-hidden rounded-t-3xl">
          {/* Decorative Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 opacity-90" />
          <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-10" />
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />

          <div className="relative p-6 pt-10 pb-10 text-center">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-white/10 backdrop-blur-sm shadow-xl shadow-blue-900/20 ring-4 ring-white/10">
              <Icon icon="mdi:rocket-launch" className="w-8 h-8 text-white animate-bounce" />
            </div>
            <h2 className="text-xl font-black text-white mb-2 tracking-tight leading-tight">
              Selamat Datang,<br />
              <span className="text-blue-100">{userData?.name ? (userData.name.length > 20 ? userData.name.substring(0, 20) + '...' : userData.name) : 'Investor'}! 🚀</span>
            </h2>
            <p className="text-xs text-blue-200 font-medium">Platform investasi masa depan untuk pertumbuhan aset Anda.</p>
          </div>
        </div>

        <div className="p-6 -mt-6 bg-slate-900 rounded-t-3xl relative z-10 border-t border-white/5">
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 transition-colors text-center h-full">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center mb-2">
                <Icon icon="mdi:shield-check" className="w-5 h-5 text-blue-400" />
              </div>
              <p className="font-bold text-white text-xs mb-0.5">Aman</p>
              <p className="text-[10px] text-slate-400 leading-tight">Data Terjamin</p>
            </div>
            <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 transition-colors text-center h-full">
              <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center mb-2">
                <Icon icon="mdi:lightning-bolt" className="w-5 h-5 text-yellow-400" />
              </div>
              <p className="font-bold text-white text-xs mb-0.5">Cepat</p>
              <p className="text-[10px] text-slate-400 leading-tight">Transaksi Kilat</p>
            </div>
            <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 transition-colors text-center h-full">
              <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center mb-2">
                <Icon icon="mdi:chart-line-variant" className="w-5 h-5 text-green-400" />
              </div>
              <p className="font-bold text-white text-xs mb-0.5">Profit</p>
              <p className="text-[10px] text-slate-400 leading-tight">Cair Harian</p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => {
                if (applicationData?.link_group) {
                  window.open(applicationData.link_group, '_blank');
                }
              }}
              className="w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 bg-[#229ED9] hover:bg-[#1e8dbf] transition-all shadow-lg shadow-blue-500/20"
            >
              <Icon icon="mdi:telegram" className="w-5 h-5" />
              Gabung Grup VIP
            </button>
            <button
              onClick={handleCloseWelcomePopup}
              className="w-full py-3.5 rounded-xl font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700"
            >
              Mulai Investasi
            </button>
          </div>
        </div>
      </Modal>

      {/* Promo Popup */}
      <Modal
        isOpen={showPromoPopup}
        onClose={handleClosePromoPopup}
        title="🔥 Event Spesial Creator"
        maxWidth="max-w-sm"
        icon="mdi:fire"
        iconColor="text-orange-500"
        iconBgColor="bg-orange-900/20"
      >
        <div className="p-5">
          <div className="relative mb-6 text-center">
            <div className="inline-flex items-center justify-center gap-3 p-3 bg-slate-800/50 rounded-2xl border border-white/5 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-lg shadow-red-500/20">
                <Icon icon="mdi:youtube" className="w-7 h-7 text-white" />
              </div>
              <Icon icon="mdi:plus" className="w-5 h-5 text-slate-500" />
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-black to-slate-800 flex items-center justify-center border border-white/10 shadow-lg">
                <Icon icon="logos:tiktok-icon" className="w-6 h-6" />
              </div>
            </div>

            <div className="mt-4">
              <h4 className="font-black text-white text-lg mb-1">Bikin Konten, Dapat Cuan! 💸</h4>
              <p className="text-sm text-slate-400 leading-relaxed px-2">
                Bagikan keseruan investasi Anda dan menangkan total hadiah hingga <span className="text-green-400 font-bold">Rp 2.000.000!</span>
              </p>
            </div>
          </div>

          <div className="space-y-2 mb-6">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tiers Reward</p>
            {[
              { views: '20K Views', reward: 'Rp 100.000', icon: 'mdi:trophy-outline', color: 'slate' },
              { views: '50K Views', reward: 'Rp 300.000', icon: 'mdi:trophy-bronze', color: 'orange' },
              { views: '100K Views', reward: 'Rp 700.000', icon: 'mdi:trophy-silver', color: 'slate' },
              { views: '250K Views', reward: 'Rp 1.000.000', icon: 'mdi:trophy-gold', color: 'yellow' },
              { views: '500K Views', reward: 'Rp 2.000.000', icon: 'mdi:crown', color: 'purple' },
            ].map((tier, index) => (
              <div key={index} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/30 border border-slate-700/30 hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg bg-${tier.color}-500/10 flex items-center justify-center`}>
                    <Icon icon={tier.icon} className={`w-4 h-4 text-${tier.color}-400`} />
                  </div>
                  <span className="text-xs font-semibold text-slate-300">{tier.views}</span>
                </div>
                <div className="px-2 py-1 rounded bg-green-500/10 border border-green-500/20">
                  <span className="text-xs font-bold text-green-400">{tier.reward}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3 mb-4">
            <button
              onClick={handleClaimReward}
              className="w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 transition-all shadow-lg shadow-orange-500/20"
            >
              <Icon icon="mdi:gift-open" className="w-5 h-5 animate-pulse" />
              Klaim Sekarang
            </button>

            <div className="flex items-center justify-between gap-4">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    checked={hidePopupChecked}
                    onChange={(e) => setHidePopupChecked(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-orange-500 focus:ring-orange-500 focus:ring-offset-slate-900 transition-colors"
                  />
                </div>
                <span className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors">Jangan tampilkan (10m)</span>
              </label>

              <button
                onClick={handleClosePromoPopup}
                className="text-xs font-semibold text-slate-400 hover:text-white transition-colors py-2 px-3 hover:bg-slate-800 rounded-lg"
              >
                Nanti Saja
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Investment Modal */}
      {showModal && selectedProduct && (
        <InvestmentModal
          open={showModal}
          onClose={() => setShowModal(false)}
          product={selectedProduct}
          user={userData}
          onSuccess={(paymentData) => {
            setShowModal(false);
            setSelectedProduct(null);
            setToast({
              open: true,
              message: 'Investasi berhasil! Silakan lakukan pembayaran.',
              type: 'success',
            });
            router.push({
              pathname: '/payment',
              query: { data: encodeURIComponent(JSON.stringify(paymentData)) },
            });
          }}
        />
      )}

      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, open: false })}
      />

      <style jsx>{`
                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            `}</style>
    </div>
  );
}
