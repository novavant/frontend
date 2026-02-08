import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Icon } from '@iconify/react';
import { getBankList, editBankAccount, getBankAccountById } from '../../utils/api';
import BottomNavbar from '../../components/BottomNavbar';

export default function BankEdit() {
  const router = useRouter();
  const { id } = router.query;
  const [bankId, setBankId] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [fullName, setFullName] = useState('');
  const [originalData, setOriginalData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [banks, setBanks] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');
  const [applicationData, setApplicationData] = useState(null);
  const [success, setSuccess] = useState(false);
  const [bankSearch, setBankSearch] = useState('');
  const [showBankDropdown, setShowBankDropdown] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchBanks();
    if (id) fetchAccount();
    const appConfigStr = localStorage.getItem('application');
    if (appConfigStr) {
      try { setApplicationData(JSON.parse(appConfigStr)); } catch (e) { }
    }
  }, [id]);

  const fetchBanks = async () => {
    try {
      const banksRes = await getBankList();
      setBanks(banksRes.data.banks || []);
    } catch (err) {
      setMessage(err.message);
      setMessageType('error');
    }
  };

  const fetchAccount = async () => {
    setIsLoading(true);
    try {
      const res = await getBankAccountById(id);
      let acc = res.data.bank_account;
      if (Array.isArray(acc)) acc = acc[0];
      if (acc) {
        const data = {
          bankId: acc.bank_id ? acc.bank_id.toString() : '',
          bankAccount: acc.account_number || '',
          fullName: acc.account_name || ''
        };
        setOriginalData(data);
        setBankId(data.bankId);
        setBankAccount(data.bankAccount);
        setFullName(data.fullName);
      } else {
        setMessage('Data rekening tidak ditemukan');
        setMessageType('error');
      }
    } catch (err) {
      setMessage(err.message);
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    try {
      const res = await editBankAccount({
        id: parseInt(id, 10),
        bank_id: parseInt(bankId, 10),
        account_number: String(bankAccount),
        account_name: String(fullName)
      });
      setMessage(res.message);
      setMessageType('success');
      setSuccess(true);
      setTimeout(() => router.push('/bank'), 2000);
    } catch (err) {
      setMessage(err.message);
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasChanges = bankId !== originalData.bankId || bankAccount !== originalData.bankAccount || fullName !== originalData.fullName;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-slate-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">Memuat data rekening...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 pb-36">
      <Head>
        <title>{applicationData?.name || 'Nova Vant'} | Edit Rekening</title>
      </Head>

      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-slate-900/90 border-b border-slate-800">
        <div className="max-w-md mx-auto px-5 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center hover:bg-slate-700"
          >
            <Icon icon="mdi:arrow-left" className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-white">Edit Rekening</h1>
            <p className="text-xs text-slate-400">Perbarui informasi rekening</p>
          </div>
          {hasChanges && !success && (
            <div className="px-2 py-1 rounded-full bg-amber-600/20 text-amber-400 text-xs font-medium">
              Belum disimpan
            </div>
          )}
        </div>
      </div>

      <div className="max-w-md mx-auto px-5 pt-6">
        {/* Success State */}
        {success ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 rounded-full bg-green-600 flex items-center justify-center mx-auto mb-6 animate-bounce">
              <Icon icon="mdi:check" className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Berhasil!</h2>
            <p className="text-slate-400 mb-4">{message}</p>
            <p className="text-slate-500 text-sm">Mengalihkan ke halaman rekening...</p>
          </div>
        ) : (
          <>
            {/* Current Account Info */}
            <div className="bg-gradient-to-br from-amber-600/20 to-orange-600/20 rounded-2xl p-4 border border-amber-500/30 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center">
                  <Icon icon="mdi:pencil" className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-amber-300 text-xs font-medium">Mengedit Rekening</p>
                  <p className="text-white font-bold">{banks.find(b => b.id == originalData.bankId)?.name || 'Bank'}</p>
                </div>
              </div>
              <div className="bg-slate-900/50 rounded-xl p-3">
                <p className="text-slate-300 text-sm font-mono">{originalData.bankAccount}</p>
                <p className="text-slate-500 text-xs">{originalData.fullName}</p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Bank Selection with Search */}
              <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
                <label className="flex items-center gap-2 text-white font-semibold mb-3">
                  <Icon icon="mdi:bank" className="w-5 h-5 text-blue-400" />
                  Pilih Bank
                </label>
                <div className="relative">
                  <div
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3.5 cursor-pointer flex items-center justify-between"
                    onClick={() => setShowBankDropdown(!showBankDropdown)}
                  >
                    <span className={bankId ? 'text-white' : 'text-slate-500'}>
                      {bankId ? (banks.find(b => b.id == bankId)?.name || 'Bank') : '-- Pilih Bank --'}
                    </span>
                    <Icon icon={showBankDropdown ? 'mdi:chevron-up' : 'mdi:chevron-down'} className="w-5 h-5 text-slate-400" />
                  </div>

                  {showBankDropdown && (
                    <div className="absolute z-50 left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-xl max-h-64 overflow-hidden">
                      <div className="p-2 border-b border-slate-700">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Cari bank atau e-wallet..."
                            value={bankSearch}
                            onChange={(e) => setBankSearch(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-4 py-2.5 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500 text-sm"
                            autoFocus
                          />
                          <Icon icon="mdi:magnify" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        </div>
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        {banks
                          .filter(bank => {
                            const search = bankSearch.toLowerCase();
                            return bank.name?.toLowerCase().includes(search) || bank.short_name?.toLowerCase().includes(search);
                          })
                          .map(bank => (
                            <div
                              key={bank.id}
                              className={`px-4 py-3 cursor-pointer hover:bg-slate-700/50 flex items-center gap-3 transition-colors ${bankId == bank.id ? 'bg-blue-600/20' : ''}`}
                              onClick={() => { setBankId(bank.id.toString()); setShowBankDropdown(false); setBankSearch(''); }}
                            >
                              <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center flex-shrink-0">
                                <Icon icon={bank.type === 'ewallet' ? 'mdi:wallet' : 'mdi:bank'} className="w-4 h-4 text-blue-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-medium truncate">{bank.name}</p>
                              </div>
                              {bankId == bank.id && <Icon icon="mdi:check" className="w-4 h-4 text-blue-400" />}
                            </div>
                          ))
                        }
                        {banks.filter(bank => {
                          const search = bankSearch.toLowerCase();
                          return bank.name?.toLowerCase().includes(search) || bank.short_name?.toLowerCase().includes(search);
                        }).length === 0 && (
                            <p className="px-4 py-6 text-center text-slate-500 text-sm">Tidak ditemukan</p>
                          )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Account Number */}
              <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
                <label className="flex items-center gap-2 text-white font-semibold mb-3">
                  <Icon icon="mdi:credit-card" className="w-5 h-5 text-blue-400" />
                  Nomor Rekening
                </label>
                <input
                  type="text"
                  placeholder="Masukkan nomor rekening"
                  value={bankAccount}
                  onChange={e => setBankAccount(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500 font-mono"
                  required
                />
              </div>

              {/* Account Name */}
              <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
                <label className="flex items-center gap-2 text-white font-semibold mb-3">
                  <Icon icon="mdi:account" className="w-5 h-5 text-blue-400" />
                  Nama Pemilik
                </label>
                <input
                  type="text"
                  placeholder="Nama sesuai rekening bank"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500"
                  required
                />
              </div>

              {/* Error Message */}
              {message && messageType === 'error' && (
                <div className="p-4 rounded-xl bg-red-900/30 border border-red-700/50 flex items-center gap-3">
                  <Icon icon="mdi:alert-circle" className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <span className="text-red-300 text-sm">{message}</span>
                </div>
              )}

              {/* Changes Preview */}
              {hasChanges && (
                <div className="bg-blue-900/20 rounded-2xl p-4 border border-blue-500/30">
                  <p className="text-blue-300 text-xs font-medium mb-2">Perubahan akan diterapkan</p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
                      <Icon icon="mdi:bank" className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-bold">{banks.find(b => b.id == bankId)?.name || 'Bank'}</p>
                      <p className="text-slate-300 text-sm font-mono">{bankAccount}</p>
                      <p className="text-slate-400 text-xs">{fullName}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !bankId || !bankAccount || !fullName || !hasChanges}
                className={`w-full py-4 rounded-xl text-white font-bold flex items-center justify-center gap-2 transition-all ${isSubmitting || !bankId || !bankAccount || !fullName || !hasChanges
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-600/30'
                  }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Icon icon="mdi:content-save" className="w-5 h-5" />
                    Simpan Perubahan
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>

      <BottomNavbar />
    </div>
  );
}
