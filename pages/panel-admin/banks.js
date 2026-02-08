// pages/admin/banks.js
import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { Icon } from '@iconify/react';
import AdminLayout from '../../components/admin/Layout';
import useAdminAuth from '../../lib/auth/useAdminAuth';
import { adminRequest } from '../../utils/admin/api';

export default function BankManagement() {
  const { loading: authLoading } = useAdminAuth();
  const [activeTab, setActiveTab] = useState('banks');
  const [banks, setBanks] = useState([]);
  const [userAccounts, setUserAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBankModal, setShowBankModal] = useState(false);
  const [editingBank, setEditingBank] = useState(null);
  const [bankForm, setBankForm] = useState({ name: '', code: '', short_name: '', type: 'bank', status: 'Active' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // User Accounts filters and pagination
  const [accountsFilters, setAccountsFilters] = useState({
    bank: 'all',
    search: '',
    page: 1,
    limit: 25
  });
  const [searchInput, setSearchInput] = useState('');
  const [totalAccounts, setTotalAccounts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [accountsLoading, setAccountsLoading] = useState(false);

  // Stats
  const [bankStats, setBankStats] = useState({
    total: 0,
    active: 0,
    inactive: 0
  });

  useEffect(() => {
    if (authLoading) return;
    loadBanks();
  }, [authLoading]);

  useEffect(() => {
    if (authLoading || activeTab !== 'accounts') return;
    loadAccounts();
  }, [authLoading, activeTab, accountsFilters]);

  const loadBanks = async () => {
    setLoading(true);
    try {
      const res = await adminRequest('/banks', { method: 'GET' });
      if (res && Array.isArray(res.data)) {
        const mappedBanks = res.data.map(bank => ({
          id: bank.id,
          name: bank.name,
          code: bank.code,
          short_name: bank.short_name || '',
          type: bank.type || 'bank',
          status: bank.status || 'Active'
        }));

        setBanks(mappedBanks);

        // Calculate stats
        const stats = mappedBanks.reduce((acc, bank) => {
          acc.total++;
          if (bank.status === 'Active') acc.active++;
          else acc.inactive++;
          return acc;
        }, { total: 0, active: 0, inactive: 0 });
        setBankStats(stats);
      } else {
        setBanks([]);
        setBankStats({ total: 0, active: 0, inactive: 0 });
      }
    } catch (err) {
      console.error('Failed to load banks:', err);
      setBanks([]);
      setBankStats({ total: 0, active: 0, inactive: 0 });
    } finally {
      setLoading(false);
    }
  };

  const loadAccounts = async () => {
    setAccountsLoading(true);
    try {
      const params = [];
      if (accountsFilters.page) params.push(`page=${accountsFilters.page}`);
      if (accountsFilters.limit) params.push(`limit=${accountsFilters.limit}`);
      if (accountsFilters.search) params.push(`search=${encodeURIComponent(accountsFilters.search)}`);

      const query = params.length ? `?${params.join('&')}` : '';
      const res = await adminRequest(`/bank-accounts${query}`, { method: 'GET' });

      if (res && Array.isArray(res.data)) {
        const mappedAccounts = res.data.map(account => ({
          id: account.id,
          userId: account.user_id,
          userName: account.username || account.userName || `User ${account.user_id}`,
          userPhone: account.user_phone || account.phone || '',
          bankId: account.bank_id,
          bankName: account.bank_name || account.bankName || 'Unknown Bank',
          accountName: account.account_name || account.accountName || '',
          accountNumber: account.account_number || account.accountNumber || ''
        }));

        setUserAccounts(mappedAccounts);
        setTotalAccounts(res.total || mappedAccounts.length);
        setTotalPages(Math.ceil((res.total || mappedAccounts.length) / accountsFilters.limit));
      } else {
        setUserAccounts([]);
        setTotalAccounts(0);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Failed to load bank accounts:', err);
      setUserAccounts([]);
      setTotalAccounts(0);
    } finally {
      setAccountsLoading(false);
    }
  };

  const handleAccountsFilterChange = (field, value) => {
    setAccountsFilters(prev => ({ ...prev, [field]: value, page: field === 'page' ? value : 1 }));
  };

  const handleAccountsSearch = () => {
    setAccountsFilters(prev => ({ ...prev, search: searchInput, page: 1 }));
  };

  const handleAddBank = () => {
    setEditingBank(null);
    setBankForm({ name: '', code: '', short_name: '', type: 'bank', status: 'Active' });
    setError('');
    setShowBankModal(true);
  };

  const handleEditBank = (bank) => {
    setEditingBank(bank);
    setBankForm({ name: bank.name, code: bank.code, short_name: bank.short_name || '', type: bank.type || 'bank', status: bank.status });
    setError('');
    setShowBankModal(true);
  };

  const handleBankSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload = {
        name: bankForm.name.trim(),
        code: bankForm.code.trim().toUpperCase(),
        short_name: bankForm.short_name.trim(),
        type: bankForm.type,
        status: bankForm.status
      };

      let res;
      if (editingBank) {
        res = await adminRequest(`/banks/${editingBank.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        res = await adminRequest('/banks', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }

      if (res && res.success) {
        loadBanks(); // Reload banks
        setShowBankModal(false);
        setBankForm({ name: '', code: '', short_name: '', type: 'bank', status: 'Active' });
        setEditingBank(null);
      } else {
        setError(res?.message || `Gagal ${editingBank ? 'memperbarui' : 'menambahkan'} bank`);
      }
    } catch (err) {
      console.error('Bank submit failed:', err);
      setError(err?.message || `Gagal ${editingBank ? 'memperbarui' : 'menambahkan'} bank`);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleBankStatus = async (bank) => {
    const newStatus = bank.status === 'Active' ? 'Inactive' : 'Active';
    try {
      const res = await adminRequest(`/banks/${bank.id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...bank, status: newStatus })
      });

      if (res && res.success) {
        loadBanks(); // Reload banks
      } else {
        setError(res?.message || 'Gagal mengubah status bank');
      }
    } catch (err) {
      console.error('Failed to toggle bank status:', err);
      setError('Gagal mengubah status bank');
    }
  };

  const getStatusBadge = (status) => {
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${status === 'Active'
          ? 'bg-green-500/20 text-green-400 border-green-500/30'
          : 'bg-red-500/20 text-red-400 border-red-500/30'
        }`}>
        {status === 'Active' ? 'Aktif' : 'Tidak Aktif'}
      </span>
    );
  };

  const filteredAccounts = userAccounts.filter(account => {
    if (accountsFilters.bank !== 'all' && account.bankName !== accountsFilters.bank) return false;
    return true;
  });

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-400/30 border-t-purple-400 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-pink-400 rounded-full animate-spin animation-delay-150"></div>
          </div>
          <div className="mt-6 text-center">
            <p className="text-white font-medium text-lg">Memuat Data Bank...</p>
            <p className="text-gray-400 text-sm mt-1">Harap tunggu sebentar</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout title="Kelola Bank">
      <Head>
        <title>Vla Devs | Kelola Bank</title>
        <link rel="icon" type="image/x-icon" href="/vla-logo.png" />
      </Head>

      {/* Tabs */}
      <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-2 border border-white/10 mb-8">
        <div className="flex">
          <button
            className={`flex-1 px-6 py-4 font-medium text-sm rounded-2xl transition-all duration-300 ${activeTab === 'banks'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            onClick={() => setActiveTab('banks')}
          >
            <Icon icon="mdi:bank" className="inline mr-2 w-5 h-5" />
            Kelola Bank
          </button>
          <button
            className={`flex-1 px-6 py-4 font-medium text-sm rounded-2xl transition-all duration-300 ${activeTab === 'accounts'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            onClick={() => setActiveTab('accounts')}
          >
            <Icon icon="mdi:account-cash" className="inline mr-2 w-5 h-5" />
            Akun Bank Pengguna
          </button>
        </div>
      </div>

      {/* Stats Cards - Only show on Banks tab */}
      {activeTab === 'banks' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard title="Total Bank" value={bankStats.total} icon="mdi:bank" color="blue" />
          <StatCard title="Bank Aktif" value={bankStats.active} icon="mdi:bank-check" color="green" />
          <StatCard title="Bank Tidak Aktif" value={bankStats.inactive} icon="mdi:bank-remove" color="red" />
        </div>
      )}

      {/* Banks Section */}
      {activeTab === 'banks' && (
        <div className="space-y-6">
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
                    <Icon icon="mdi:bank" className="text-white w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-white font-semibold text-lg">Daftar Bank</h2>
                    <p className="text-gray-400 text-sm">{banks.length} bank terdaftar</p>
                  </div>
                </div>
                <button
                  onClick={handleAddBank}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 transition-all duration-300 hover:scale-105"
                >
                  <Icon icon="mdi:plus" className="w-5 h-5" />
                  Tambah Bank
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border-b border-red-500/20">
                <div className="flex items-center gap-2 text-red-400">
                  <Icon icon="mdi:alert-circle" className="w-4 h-4" />
                  {error}
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="py-4 px-6 text-left text-gray-300 font-medium">Nama Bank</th>
                    <th className="py-4 px-6 text-left text-gray-300 font-medium">Kode Bank</th>
                    <th className="py-4 px-6 text-left text-gray-300 font-medium">Status</th>
                    <th className="py-4 px-6 text-center text-gray-300 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {banks.map((bank, index) => (
                    <tr key={bank.id} className={`border-b border-white/5 hover:bg-white/5 transition-all duration-300 ${index % 2 === 0 ? 'bg-white/2' : ''}`}>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
                            <Icon icon="mdi:bank" className="text-white w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-medium text-white">{bank.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="bg-black/20 px-3 py-1 rounded-lg font-mono text-white text-sm">
                          {bank.code}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {getStatusBadge(bank.status)}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditBank(bank)}
                            className="p-2 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 rounded-xl transition-all duration-300 hover:scale-110"
                            title="Edit Bank"
                          >
                            <Icon icon="mdi:pencil" className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleBankStatus(bank)}
                            className={`p-2 rounded-xl transition-all duration-300 hover:scale-110 ${bank.status === 'Active'
                                ? 'bg-red-600/20 hover:bg-red-600/30 text-red-400'
                                : 'bg-green-600/20 hover:bg-green-600/30 text-green-400'
                              }`}
                            title={bank.status === 'Active' ? 'Nonaktifkan' : 'Aktifkan'}
                          >
                            <Icon
                              icon={bank.status === 'Active' ? 'mdi:close-circle' : 'mdi:check-circle'}
                              className="w-4 h-4"
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* User Accounts Section */}
      {activeTab === 'accounts' && (
        <div className="space-y-6">
          {/* Filter Section */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                <Icon icon="mdi:filter-variant" className="text-white w-5 h-5" />
              </div>
              <div>
                <h2 className="text-white font-semibold text-lg">Filter & Pencarian</h2>
                <p className="text-gray-400 text-sm">Cari akun bank pengguna</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div className="lg:col-span-1">
                <label className="block text-sm text-gray-400 mb-2">Pencarian</label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAccountsSearch()}
                    placeholder="Cari berdasarkan nama atau nomor rekening pengguna..."
                    className="w-full bg-white/10 border border-white/20 text-white rounded-2xl px-4 py-3 pl-12 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all dark-select"
                  />
                  <Icon icon="mdi:magnify" className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Filter Bank</label>
                <select
                  value={accountsFilters.bank}
                  onChange={(e) => handleAccountsFilterChange('bank', e.target.value)}
                  className="w-full bg-white/10 border border-white/20 text-white rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all dark-select"
                >
                  <option value="all">Semua Bank</option>
                  {[...new Set(userAccounts.map(acc => acc.bankName))].filter(Boolean).map(bank => (
                    <option key={bank} value={bank}>{bank}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <button
                onClick={handleAccountsSearch}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <Icon icon="mdi:magnify" className="w-5 h-5" />
                Cari Akun
              </button>
              <button
                onClick={() => {
                  setAccountsFilters({ bank: 'all', search: '', page: 1, limit: 25 });
                  setSearchInput('');
                }}
                className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-2xl flex items-center gap-2 transition-all"
              >
                <Icon icon="mdi:refresh" className="w-5 h-5" />
                Reset Filter
              </button>
            </div>
          </div>

          {/* User Accounts Table */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                    <Icon icon="mdi:account-cash" className="text-white w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-white font-semibold text-lg">Akun Bank Pengguna</h2>
                    <p className="text-gray-400 text-sm">{totalAccounts} akun ditemukan</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm">Tampilkan:</span>
                  <select
                    value={accountsFilters.limit}
                    onChange={(e) => handleAccountsFilterChange('limit', Number(e.target.value))}
                    className="bg-white/10 border border-white/20 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark-select"
                  >
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={75}>75</option>
                    <option value={100}>100</option>
                  </select>
                  <span className="text-gray-400 text-sm">per halaman</span>
                </div>
              </div>
            </div>

            {accountsLoading ? (
              <div className="p-12 text-center">
                <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400">Memuat data akun...</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5">
                        <th className="py-4 px-6 text-left text-gray-300 font-medium">Pengguna</th>
                        <th className="py-4 px-6 text-left text-gray-300 font-medium">Bank</th>
                        <th className="py-4 px-6 text-left text-gray-300 font-medium">Nama Rekening</th>
                        <th className="py-4 px-6 text-left text-gray-300 font-medium">Nomor Rekening</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAccounts.map((account, index) => (
                        <tr key={account.id} className={`border-b border-white/5 hover:bg-white/5 transition-all duration-300 ${index % 2 === 0 ? 'bg-white/2' : ''}`}>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
                                <Icon icon="mdi:account" className="text-white w-5 h-5" />
                              </div>
                              <div>
                                <p className="font-medium text-white">{account.userName}</p>
                                <p className="text-gray-400 text-sm">
                                  +62{account.userPhone}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                                <Icon icon="mdi:bank" className="text-white w-4 h-4" />
                              </div>
                              <span className="text-white font-medium">{account.bankName}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-white">{account.accountName}</span>
                          </td>
                          <td className="py-4 px-6">
                            <span className="bg-black/20 px-3 py-1 rounded-lg font-mono text-white text-sm">
                              {account.accountNumber}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="p-6 border-t border-white/10 bg-white/2">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-gray-400 text-sm">
                      Menampilkan {filteredAccounts.length ? ((accountsFilters.page - 1) * accountsFilters.limit + 1) : 0} sampai{' '}
                      {filteredAccounts.length ? ((accountsFilters.page - 1) * accountsFilters.limit + filteredAccounts.length) : 0} dari{' '}
                      {totalAccounts} akun
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAccountsFilterChange('page', Math.max(1, accountsFilters.page - 1))}
                        disabled={accountsFilters.page === 1}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:text-gray-600 text-white rounded-xl transition-all duration-300 disabled:cursor-not-allowed"
                      >
                        <Icon icon="mdi:chevron-left" className="w-4 h-4" />
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          className={`w-10 h-10 rounded-xl transition-all duration-300 bg-gradient-to-r from-purple-600 to-pink-600 text-white`}
                          disabled
                        >
                          {accountsFilters.page}
                        </button>
                      </div>

                      <button
                        onClick={() => handleAccountsFilterChange('page', accountsFilters.page + 1)}
                        disabled={filteredAccounts.length < accountsFilters.limit}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:text-gray-600 text-white rounded-xl transition-all duration-300 disabled:cursor-not-allowed"
                      >
                        <Icon icon="mdi:chevron-right" className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Bank Modal */}
      {showBankModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900/95 backdrop-blur-xl rounded-3xl w-full max-w-md border border-white/20 shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                    <Icon icon={editingBank ? "mdi:pencil" : "mdi:plus"} className="text-white w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">
                      {editingBank ? 'Edit Bank' : 'Tambah Bank Baru'}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {editingBank ? 'Perbarui informasi bank' : 'Tambahkan bank baru ke sistem'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowBankModal(false)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <Icon icon="mdi:close" className="text-gray-400 hover:text-white w-5 h-5" />
                </button>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-2xl text-sm mb-6">
                  <div className="flex items-center gap-2">
                    <Icon icon="mdi:alert-circle" className="w-4 h-4" />
                    {error}
                  </div>
                </div>
              )}

              <form onSubmit={handleBankSubmit} className="space-y-6">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Nama Bank</label>
                  <input
                    type="text"
                    value={bankForm.name}
                    onChange={(e) => setBankForm({ ...bankForm, name: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 text-white rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="Contoh: Bank Central Asia"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Kode Bank</label>
                    <input
                      type="text"
                      value={bankForm.code}
                      onChange={(e) => setBankForm({ ...bankForm, code: e.target.value.toUpperCase() })}
                      className="w-full bg-white/10 border border-white/20 text-white rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all font-mono"
                      placeholder="BCA"
                      maxLength={10}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Nama Pendek</label>
                    <input
                      type="text"
                      value={bankForm.short_name}
                      onChange={(e) => setBankForm({ ...bankForm, short_name: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 text-white rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      placeholder="BCA"
                      maxLength={20}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Tipe</label>
                    <select
                      value={bankForm.type}
                      onChange={(e) => setBankForm({ ...bankForm, type: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 text-white rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all dark-select"
                    >
                      <option value="bank">Bank</option>
                      <option value="ewallet">E-Wallet</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Status</label>
                    <select
                      value={bankForm.status}
                      onChange={(e) => setBankForm({ ...bankForm, status: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 text-white rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all dark-select"
                    >
                      <option value="Active">Aktif</option>
                      <option value="Inactive">Tidak Aktif</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 text-white py-3 rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95 disabled:scale-100"
                  >
                    {saving ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <Icon icon={editingBank ? "mdi:content-save" : "mdi:plus"} className="w-5 h-5" />
                    )}
                    {saving ? 'Menyimpan...' : editingBank ? 'Perbarui Bank' : 'Tambah Bank'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowBankModal(false)}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-2xl flex items-center justify-center gap-2 transition-all"
                  >
                    <Icon icon="mdi:close" className="w-5 h-5" />
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

// Stats Card Component
function StatCard({ title, value, icon, color }) {
  const colorClasses = {
    blue: { bg: 'from-blue-600 to-cyan-600', text: 'text-blue-400' },
    green: { bg: 'from-green-600 to-emerald-600', text: 'text-green-400' },
    red: { bg: 'from-red-600 to-pink-600', text: 'text-red-400' }
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 hover:bg-white/10 hover:scale-105 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-r ${colorClasses[color].bg} rounded-xl flex items-center justify-center`}>
          <Icon icon={icon} className="w-6 h-6 text-white" />
        </div>
      </div>
      <div>
        <h3 className="text-gray-400 text-sm font-medium mb-2">{title}</h3>
        <div className="text-2xl font-bold text-white">{value.toLocaleString('id-ID')}</div>
      </div>
    </div>
  );
}