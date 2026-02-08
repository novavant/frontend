import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import { getBankAccounts, deleteBankAccount } from '../utils/api';
import BottomNavbar from '../components/BottomNavbar';
import Modal from '../components/Modal';

export default function BankAccount() {
  const router = useRouter();
  const [bankAccounts, setBankAccounts] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');
  const [loading, setLoading] = useState(true);
  const [applicationData, setApplicationData] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, account: null });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchData();
    const appConfigStr = localStorage.getItem('application');
    if (appConfigStr) {
      try { setApplicationData(JSON.parse(appConfigStr)); } catch (e) { }
    }
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const bankRes = await getBankAccounts();
      setBankAccounts(bankRes.data.bank_account || []);
    } catch (err) {
      setMessage(err.message);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteModal.account) return;
    setIsDeleting(true);
    try {
      const res = await deleteBankAccount(deleteModal.account.id);
      setMessage(res.message);
      setMessageType('success');
      fetchData();
    } catch (err) {
      setMessage(err.message);
      setMessageType('error');
    }
    setIsDeleting(false);
    setDeleteModal({ show: false, account: null });
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="min-h-screen bg-slate-900 pb-36">
      <Head>
        <title>{applicationData?.name || 'Nova Vant'} | Rekening Bank</title>
      </Head>

      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-slate-900/90 border-b border-slate-800">
        <div className="max-w-md mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center hover:bg-slate-700"
            >
              <Icon icon="mdi:arrow-left" className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-lg font-bold text-white">Rekening Bank</h1>
          </div>
          <Link href="/bank/add">
            <button className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Icon icon="mdi:plus" className="w-5 h-5 text-white" />
            </button>
          </Link>
        </div>
      </div>

      {/* Toast Message */}
      {message && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-sm w-full px-4">
          <div className={`p-4 rounded-xl border backdrop-blur-sm ${messageType === 'success' ? 'bg-green-900/90 border-green-700 text-green-200'
            : 'bg-red-900/90 border-red-700 text-red-200'
            }`}>
            <div className="flex items-center gap-2">
              <Icon icon={messageType === 'success' ? 'mdi:check-circle' : 'mdi:alert-circle'} className="w-5 h-5" />
              <span className="text-sm font-medium">{message}</span>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-md mx-auto px-5 pt-6">
        {/* Stats Banner */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-5 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm mb-1">Total Rekening</p>
              <p className="text-3xl font-black text-white">{bankAccounts.length}</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Icon icon="mdi:bank" className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        {/* Add Button Card */}
        <Link href="/bank/add">
          <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700 mb-4 hover:border-blue-500/50 hover:bg-slate-800/80 transition-all cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Icon icon="mdi:plus" className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold">Tambah Rekening Baru</p>
                <p className="text-slate-400 text-sm">Daftarkan rekening untuk penarikan</p>
              </div>
              <Icon icon="mdi:chevron-right" className="w-5 h-5 text-slate-500 group-hover:text-blue-400 transition-colors" />
            </div>
          </div>
        </Link>

        {/* Bank Accounts List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-12 h-12 border-3 border-slate-700 border-t-blue-500 rounded-full animate-spin mb-4" />
            <p className="text-slate-400">Memuat rekening...</p>
          </div>
        ) : bankAccounts.length === 0 ? (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-10 text-center">
            <div className="w-20 h-20 rounded-full bg-slate-700 flex items-center justify-center mx-auto mb-4">
              <Icon icon="mdi:bank-off" className="w-10 h-10 text-slate-500" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Belum Ada Rekening</h3>
            <p className="text-slate-400 text-sm mb-6">Tambahkan rekening bank untuk menarik dana</p>
            <Link href="/bank/add">
              <button className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold inline-flex items-center gap-2 shadow-lg shadow-blue-600/20">
                <Icon icon="mdi:plus" className="w-5 h-5" />
                Tambah Rekening
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-slate-400 text-sm font-medium mb-2">Daftar Rekening</p>
            {bankAccounts.map((account, index) => (
              <div key={account.id} className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden hover:border-slate-600 transition-all">
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Bank Icon with number */}
                    <div className="relative">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                        <Icon icon="mdi:bank" className="w-7 h-7 text-white" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-700 border-2 border-slate-800 flex items-center justify-center">
                        <span className="text-xs text-white font-bold">{index + 1}</span>
                      </div>
                    </div>

                    {/* Account Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-bold">{account.bank_name}</h3>
                        <div className="px-2 py-0.5 rounded-full bg-green-600/20 text-green-400 text-xs font-semibold">
                          Aktif
                        </div>
                      </div>
                      <p className="text-slate-300 font-mono text-sm mb-0.5">{account.account_number}</p>
                      <p className="text-slate-500 text-xs truncate">{account.account_name}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex border-t border-slate-700">
                  <Link href={`/bank/edit?id=${account.id}`} className="flex-1">
                    <button className="w-full py-3 flex items-center justify-center gap-2 text-blue-400 hover:bg-blue-600/10 transition-colors">
                      <Icon icon="mdi:pencil" className="w-4 h-4" />
                      <span className="text-sm font-medium">Edit</span>
                    </button>
                  </Link>
                  <div className="w-px bg-slate-700" />
                  <button
                    onClick={() => setDeleteModal({ show: true, account })}
                    className="flex-1 py-3 flex items-center justify-center gap-2 text-red-400 hover:bg-red-600/10 transition-colors"
                  >
                    <Icon icon="mdi:delete" className="w-4 h-4" />
                    <span className="text-sm font-medium">Hapus</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tips */}
        <div className="mt-6 bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
          <div className="flex items-start gap-3">
            <Icon icon="mdi:lightbulb" className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-white text-sm font-medium mb-1">Tips</p>
              <p className="text-slate-400 text-xs">Pastikan nama rekening sesuai dengan identitas Anda untuk memperlancar proses penarikan.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModal.show}
        onClose={() => setDeleteModal({ show: false, account: null })}
        title="Hapus Rekening?"
        maxWidth="max-w-sm"
        icon="mdi:alert-circle"
        iconColor="text-red-400"
        iconBgColor="bg-red-900/20"
      >
        <div className="p-6 pt-2">
          <p className="text-slate-400 text-center text-sm mb-2 font-medium">
            {deleteModal.account?.bank_name} - {deleteModal.account?.account_number}
          </p>
          <p className="text-red-400 text-center text-xs mb-6 bg-red-900/20 py-2 rounded-lg border border-red-900/50">
            Tindakan ini tidak dapat dibatalkan
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => setDeleteModal({ show: false, account: null })}
              disabled={isDeleting}
              className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold disabled:opacity-50 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold disabled:opacity-50 flex items-center justify-center gap-2 transition-colors shadow-lg shadow-red-600/20"
            >
              {isDeleting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Icon icon="mdi:delete" className="w-5 h-5" />
                  Hapus
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      <BottomNavbar />
    </div>
  );
}
