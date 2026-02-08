import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Icon } from '@iconify/react';
import { getBankAccounts, withdrawUser } from '../utils/api';
import BottomNavbar from '../components/BottomNavbar';

const Withdraw = () => {
  const router = useRouter();
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [selectedBankId, setSelectedBankId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [userData, setUserData] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);
  const [minWithdraw, setMinWithdraw] = useState(50000);
  const [maxWithdraw, setMaxWithdraw] = useState(5000000);
  const [fee, setFee] = useState(10);
  const [applicationData, setApplicationData] = useState(null);
  const [isWithdrawalAvailable, setIsWithdrawalAvailable] = useState(false);
  const [withdrawalMessage, setWithdrawalMessage] = useState('');

  const primaryColor = '#2563EB';

  const checkWithdrawalAvailability = () => {
    const now = new Date();
    const wibTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
    const day = wibTime.getDay();
    const hours = wibTime.getHours();

    if (day === 0) {
      setIsWithdrawalAvailable(false);
      setWithdrawalMessage('Penarikan hanya dapat dilakukan pada hari kerja');
      return false;
    }

    if (hours < 1 || hours > 17) {
      setIsWithdrawalAvailable(false);
      setWithdrawalMessage('Penarikan hanya dapat dilakukan pada jam kerja');
      return false;
    }

    setIsWithdrawalAvailable(true);
    setWithdrawalMessage('');
    return true;
  };

  useEffect(() => {
    checkWithdrawalAvailability();
    const interval = setInterval(checkWithdrawalAvailability, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;
    const accessExpire = typeof window !== 'undefined' ? sessionStorage.getItem('access_expire') : null;

    if (!token || !accessExpire || new Date() > new Date(accessExpire)) {
      if (typeof window !== 'undefined') router.push('/login');
      return;
    }

    const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserData({
          name: user.name || "Tester",
          number: user.number || "882646678601",
          balance: user.balance || 0,
        });
      } catch (e) { }
    }

    const appConfigStr = typeof window !== 'undefined' ? localStorage.getItem('application') : null;
    if (appConfigStr) {
      try {
        const appConfig = JSON.parse(appConfigStr);
        if (appConfig.min_withdraw) setMinWithdraw(Number(appConfig.min_withdraw));
        if (appConfig.max_withdraw) setMaxWithdraw(Number(appConfig.max_withdraw));
        if (appConfig.withdraw_charge) setFee(Number(appConfig.withdraw_charge));
        setApplicationData({
          name: appConfig.name || 'Nova Vant',
          healthy: appConfig.healthy || false,
        });
      } catch (e) {
        setApplicationData({ name: 'Nova Vant', healthy: false });
      }
    }

    setPageLoading(false);
  }, [router]);

  useEffect(() => {
    if (!pageLoading) {
      const fetchBank = async () => {
        setFetching(true);
        try {
          const res = await getBankAccounts();
          const accounts = res.data?.bank_account || [];
          setBankAccounts(accounts);
          if (accounts.length > 0) {
            setSelectedBankId(accounts[0].id);
          }
        } catch (err) {
          setErrorMsg('Gagal mengambil data rekening bank');
        } finally {
          setFetching(false);
        }
      };
      fetchBank();
    }
  }, [pageLoading]);

  const formatCurrency = (amount) => new Intl.NumberFormat('id-ID').format(amount);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!selectedBankId) {
      setErrorMsg('Silakan pilih rekening bank terlebih dahulu');
      return;
    }
    const amountNum = Number(withdrawAmount);
    if (isNaN(amountNum) || amountNum < minWithdraw || amountNum > maxWithdraw) {
      setErrorMsg(`Jumlah penarikan minimal IDR ${formatCurrency(minWithdraw)} dan maksimal IDR ${formatCurrency(maxWithdraw)}`);
      return;
    }
    if (amountNum > userData?.balance) {
      setErrorMsg('Saldo tidak mencukupi untuk penarikan ini');
      return;
    }
    setLoading(true);
    try {
      const data = await withdrawUser({ amount: amountNum, bank_account_id: selectedBankId });
      if (data.success) {
        setSuccessMsg(data.message);
        setWithdrawAmount('');
      } else {
        setErrorMsg(data.message);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat memproses penarikan');
    }
    setLoading(false);
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-slate-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 pb-28">
      <Head>
        <title>{applicationData?.name || 'Nova Vant'} | Penarikan Dana</title>
        <meta name="description" content={`${applicationData?.name || 'Nova Vant'} Withdraw Funds`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Top Navigation */}
      <div className="sticky top-0 z-40 bg-slate-800/80 backdrop-blur-md border-b border-slate-700">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-700 hover:bg-slate-600 border border-slate-600"
          >
            <Icon icon="mdi:arrow-left" className="w-5 h-5 text-slate-300" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-900/50 flex items-center justify-center">
              <Icon icon="mdi:cash-fast" className="w-5 h-5 text-blue-400" />
            </div>
            <h1 className="text-base font-bold text-white">Penarikan Dana</h1>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-5">
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-5 mb-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Icon icon="mdi:account" className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">{userData?.name || 'Tester'}</h2>
                <p className="text-xs text-blue-200">+62{userData?.number || '882646678601'}</p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <p className="text-xs text-blue-200 mb-1">Saldo Tersedia</p>
              <p className="text-2xl font-black text-white">Rp {formatCurrency(userData?.balance || 0)}</p>
            </div>
          </div>
        </div>

        {/* Bank Account Selection */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden mb-5">
          <div className="px-5 py-4 bg-slate-700/50 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <Icon icon="mdi:bank" className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-white">Rekening Tujuan</h3>
            </div>
          </div>

          <div className="p-5">
            {fetching ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-10 h-10 border-3 border-slate-700 border-t-blue-500 rounded-full animate-spin mb-3" />
                <p className="text-sm text-slate-400">Memuat rekening...</p>
              </div>
            ) : bankAccounts.length === 0 ? (
              <div className="text-center py-6 bg-slate-700/30 rounded-xl border border-slate-600">
                <div className="w-12 h-12 bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Icon icon="mdi:bank-off-outline" className="text-red-400 w-6 h-6" />
                </div>
                <h4 className="text-white font-bold mb-1 text-sm">Belum Ada Rekening</h4>
                <p className="text-slate-400 text-xs mb-4">Tambah rekening untuk withdraw</p>
                <button
                  onClick={() => router.push('/bank')}
                  className="px-5 py-2.5 rounded-xl text-white font-bold text-sm inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 transition-all"
                >
                  <Icon icon="mdi:plus-circle" className="w-4 h-4" />
                  Tambah Rekening
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {bankAccounts.map((bank) => (
                  <label
                    key={bank.id}
                    className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedBankId === bank.id
                      ? 'bg-blue-900/30 border-blue-500'
                      : 'border-slate-600 hover:bg-slate-700/50'
                      }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${selectedBankId === bank.id ? 'border-blue-500 bg-blue-500' : 'border-slate-500'
                      }`}>
                      {selectedBankId === bank.id && (
                        <Icon icon="mdi:check" className="text-white w-3 h-3" />
                      )}
                    </div>
                    <input
                      type="radio"
                      name="bank_account"
                      value={bank.id}
                      checked={selectedBankId === bank.id}
                      onChange={() => setSelectedBankId(bank.id)}
                      className="sr-only"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon icon="mdi:bank" className={`w-4 h-4 ${selectedBankId === bank.id ? 'text-blue-400' : 'text-slate-400'}`} />
                        <h4 className="font-bold text-sm text-white">{bank.bank_name}</h4>
                      </div>
                      <p className="text-xs text-slate-300 font-mono">{bank.account_number}</p>
                      <p className="text-xs text-slate-400">{bank.account_name}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Withdrawal Form */}
        {bankAccounts.length > 0 && (
          <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden mb-5">
            <div className="px-5 py-4 bg-slate-700/50 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <Icon icon="mdi:cash-fast" className="w-4 h-4 text-green-400" />
                <h3 className="text-sm font-bold text-white">Form Penarikan</h3>
              </div>
            </div>

            <form onSubmit={handleWithdraw} className="p-5 space-y-4">
              {/* Withdrawal Not Available Warning */}
              {!isWithdrawalAvailable && withdrawalMessage && (
                <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-xl p-4 flex items-start gap-3">
                  <Icon icon="mdi:clock-alert-outline" className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-yellow-300 text-sm font-semibold mb-1">{withdrawalMessage}</p>
                    <p className="text-yellow-400/80 text-xs">Senin-Sabtu pukul 09:00 - 17:00 WIB</p>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {errorMsg && (
                <div className="bg-red-900/30 border border-red-700/50 rounded-xl p-4 flex items-start gap-2">
                  <Icon icon="mdi:alert-circle" className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-300 text-sm">{errorMsg}</p>
                </div>
              )}

              {/* Success Message */}
              {successMsg && (
                <div className="bg-green-900/30 border border-green-700/50 rounded-xl p-4 flex items-start gap-2">
                  <Icon icon="mdi:check-circle" className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <p className="text-green-300 text-sm">{successMsg}</p>
                </div>
              )}

              {/* Withdrawal Amount */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                  <Icon icon="mdi:cash-multiple" className="w-4 h-4 text-blue-400" />
                  Jumlah Penarikan
                </label>
                <div className="flex items-center bg-slate-700 border-2 border-slate-600 rounded-xl overflow-hidden focus-within:border-blue-500 transition-colors">
                  <div className="flex items-center justify-center px-4 bg-slate-600 h-full border-r border-slate-600 py-3">
                    <span className="text-slate-300 text-sm font-semibold">IDR</span>
                  </div>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="flex-1 bg-transparent outline-none py-3 px-4 text-white placeholder-slate-500 text-base font-medium"
                    placeholder={minWithdraw.toLocaleString('id-ID')}
                    min={minWithdraw}
                    max={maxWithdraw}
                    required
                  />
                </div>
                <div className="flex items-center justify-between mt-2 text-xs">
                  <span className="text-slate-500">Min: Rp {formatCurrency(minWithdraw)}</span>
                  <span className="text-slate-500">Maks: Rp {formatCurrency(maxWithdraw)}</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !isWithdrawalAvailable}
                className={`w-full py-3.5 rounded-xl text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all ${isWithdrawalAvailable
                  ? 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 shadow-lg shadow-green-600/30'
                  : 'bg-slate-600'
                  }`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : !isWithdrawalAvailable ? (
                  <>
                    <Icon icon="mdi:lock-clock" className="w-5 h-5" />
                    <span>Penarikan Tidak Tersedia</span>
                  </>
                ) : (
                  <>
                    <Icon icon="mdi:send-check" className="w-5 h-5" />
                    <span>Konfirmasi Penarikan</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Information Section */}
        <div className="bg-blue-900/30 rounded-2xl border border-blue-700/50 p-5">
          <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Icon icon="mdi:information-variant" className="w-5 h-5 text-blue-400" />
            Informasi Penarikan
          </h4>
          <div className="space-y-3">
            {[
              { icon: "mdi:cash-multiple", text: `Penarikan dana min sebesar Rp ${formatCurrency(minWithdraw)}` },
              { icon: "mdi:cash-minus", text: `Biaya admin ${fee}% dipotong dari jumlah penarikan` },
              { icon: "mdi:wallet-outline", text: "Tarik seluruh saldo tanpa syarat apapun" },
              { icon: "mdi:calendar-clock", text: "Penarikan maksimal 1x per hari" },
              { icon: "mdi:clock-outline", text: "Tersedia Senin-Sabtu, 09:00-17:00 WIB" },
              { icon: "mdi:lightning-bolt", text: "Proses otomatis jika data bank valid" }
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <Icon icon={item.icon} className="text-blue-400 w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="text-slate-300 text-xs leading-relaxed">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-4">
          <p className="text-xs text-slate-600">© 2026 {applicationData?.company}</p>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavbar />
    </div>
  );
};

export default Withdraw;
