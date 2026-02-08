// pages/payment.js
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { getPaymentByOrderId } from '../utils/api';

export default function Payment() {
  const router = useRouter();
  const [payment, setPayment] = useState(null);
  const [expired, setExpired] = useState(false);
  const [timer, setTimer] = useState('');
  const [copied, setCopied] = useState({});
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [applicationData, setApplicationData] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = sessionStorage.getItem('token');
    const accessExpire = sessionStorage.getItem('access_expire');
    if (!token || !accessExpire) {
      router.push('/login');
      return;
    }
    const fetchPayment = async () => {
      if (router.query.order_id) {
        setLoading(true);
        setErrorMsg('');
        try {
          const res = await getPaymentByOrderId(router.query.order_id);
          if (res && res.data) {
            setPayment(res.data);
            startCountdown(res.data.expired_at);
            setErrorMsg('');
          } else if (res && res.message) {
            setErrorMsg(res.message);
            setPayment(null);
          } else {
            setErrorMsg('Data pembayaran tidak ditemukan.');
            setPayment(null);
          }
        } catch (e) {
          if (e?.response?.status === 404 && e?.response?.data?.message) {
            setErrorMsg(e.response.data.message);
          } else {
            setErrorMsg('Data pembayaran tidak ditemukan.');
          }
          setPayment(null);
        }
        setLoading(false);
      }
    };
    fetchPayment();

    const storedApplication = localStorage.getItem('application');
    if (storedApplication) {
      try {
        const parsed = JSON.parse(storedApplication);
        setApplicationData({
          name: parsed.name || 'Nova Vant',
          healthy: parsed.healthy || false,
        });
      } catch (e) {
        setApplicationData({ name: 'Nova Vant', healthy: false });
      }
    } else {
      setApplicationData({ name: 'Nova Vant', healthy: false });
    }
  }, [router.query.order_id]);

  const startCountdown = (expiredAt) => {
    const end = new Date(expiredAt).getTime();
    const interval = setInterval(() => {
      const now = Date.now();
      const diff = end - now;
      if (diff <= 0) {
        setTimer('00:00:00');
        setExpired(true);
        clearInterval(interval);
        return;
      }
      const h = String(Math.floor(diff / 3600000)).padStart(2, '0');
      const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
      setTimer(`${h}:${m}:${s}`);
    }, 1000);
  };

  const formatCurrency = (amt) => new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amt);

  const handleCopy = (key, text) => {
    navigator.clipboard.writeText(text);
    setCopied((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setCopied((prev) => ({ ...prev, [key]: false }));
    }, 1800);
  };

  const handleDownloadQR = async (url) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'qris.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading QR code:', error);
      window.open(url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
        <Head>
          <title>{applicationData?.name || 'Nova Vant'} | Pembayaran</title>
          <meta name="description" content={`${applicationData?.name || 'Nova Vant'} Pembayaran`} />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <div className="w-full max-w-md bg-slate-800 rounded-2xl p-8 text-center border border-slate-700">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-600/20 flex items-center justify-center">
            <div className="w-8 h-8 border-3 border-slate-600 border-t-blue-500 rounded-full animate-spin" />
          </div>
          <h3 className="font-bold text-white mb-2">Memuat Pembayaran</h3>
          <p className="text-sm text-slate-400">Mohon tunggu sebentar...</p>
        </div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
        <Head>
          <title>{applicationData?.name || 'Nova Vant'} | Pembayaran</title>
          <meta name="description" content={`${applicationData?.name || 'Nova Vant'} Pembayaran`} />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <div className="w-full max-w-md bg-slate-800 rounded-2xl p-8 text-center border border-red-900/50">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-600/20 flex items-center justify-center">
            <Icon icon="mdi:alert-circle" className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="font-bold text-white text-lg mb-2">Data Tidak Ditemukan</h3>
          <p className="text-sm text-slate-400 mb-6">
            {errorMsg || 'Data pembayaran tidak ditemukan.'}
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  const amount = payment.amount || 0;
  const paymentMethod = payment.payment_method || '';
  const paymentChannel = payment.payment_channel || '';
  const paymentCode = payment.payment_code || '';
  const product = payment.product || '';
  const orderId = payment.order_id || '';
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(paymentCode)}`;

  return (
    <div className="min-h-screen bg-slate-900 pb-8">
      <Head>
        <title>{applicationData?.name || 'Nova Vant'} | Pembayaran</title>
        <meta name="description" content={`${applicationData?.name || 'Nova Vant'} Pembayaran`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-slate-900/90 border-b border-slate-800">
        <div className="max-w-md mx-auto px-5 py-4 flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center hover:bg-slate-700 transition-colors"
          >
            <Icon icon="mdi:arrow-left" className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-lg font-bold text-white flex-1">Pembayaran</h1>

          {/* Timer Badge */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${expired
            ? 'bg-red-600/20 border border-red-600/30'
            : 'bg-blue-600/20 border border-blue-600/30'
            }`}>
            <Icon
              icon={expired ? 'mdi:clock-alert' : 'mdi:timer-outline'}
              className={`w-4 h-4 ${expired ? 'text-red-400' : 'text-blue-400'}`}
            />
            <span className={`font-mono text-sm font-bold ${expired ? 'text-red-400' : 'text-blue-400'}`}>
              {timer}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-5 pt-6">
        {/* Amount Card */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-6 mb-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative text-center">
            <p className="text-blue-200 text-xs font-medium mb-1">Total Pembayaran</p>
            <h2 className="text-3xl font-black text-white mb-3">{formatCurrency(amount)}</h2>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm">
              <Icon icon="mdi:package-variant" className="w-4 h-4 text-white" />
              <span className="text-sm font-medium text-white">{product}</span>
            </div>
          </div>
        </div>

        {/* Payment Method Info */}
        <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700 mb-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-slate-400">Metode Pembayaran</span>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-700/50">
              <Icon
                icon={paymentMethod === 'QRIS' ? 'mdi:qrcode-scan' : 'mdi:bank'}
                className="w-4 h-4 text-blue-400"
              />
              <span className="text-sm font-bold text-white">
                {paymentMethod === 'QRIS' ? 'QRIS' : paymentChannel}
              </span>
            </div>
          </div>

          {/* Order ID */}
          <div>
            <label className="text-xs font-medium text-slate-500 mb-2 block">Order ID</label>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-900 border border-slate-700">
              <span className="flex-1 font-mono text-xs text-slate-300 break-all">{orderId}</span>
              <button
                onClick={() => handleCopy('orderId', orderId)}
                className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-all ${copied.orderId
                  ? 'bg-green-600/20 text-green-400'
                  : 'bg-slate-700 text-slate-400 hover:text-white hover:bg-slate-600'
                  }`}
              >
                <Icon icon={copied.orderId ? 'mdi:check' : 'mdi:content-copy'} className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Payment Details - QRIS or Bank */}
        {paymentMethod === 'QRIS' ? (
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 mb-4">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center">
                <Icon icon="mdi:qrcode-scan" className="w-4 h-4 text-blue-400" />
              </div>
              Scan QR Code
            </h3>

            <div className="bg-white rounded-xl p-4 mb-4">
              <img
                src={qrUrl}
                alt="QRIS"
                className="w-full aspect-square object-contain rounded-lg"
              />
            </div>

            <button
              onClick={() => handleDownloadQR(qrUrl)}
              className="w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20"
            >
              <Icon icon="mdi:download" className="w-5 h-5" />
              Download QR Code
            </button>

            <p className="text-xs text-slate-500 text-center mt-4">
              Scan menggunakan aplikasi e-wallet atau mobile banking
            </p>
          </div>
        ) : (
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 mb-4">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center">
                <Icon icon="mdi:bank-transfer" className="w-4 h-4 text-blue-400" />
              </div>
              Transfer Bank
            </h3>

            <label className="text-xs font-medium text-slate-500 mb-2 block">
              Virtual Account {paymentChannel}
            </label>
            <div className="flex items-center gap-2 p-4 rounded-xl bg-slate-900 border border-slate-700 mb-4">
              <span className="flex-1 font-mono text-lg font-bold text-white break-all tracking-wider">
                {paymentCode}
              </span>
              <button
                onClick={() => handleCopy('va', paymentCode)}
                className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl transition-all ${copied.va
                  ? 'bg-green-600/20 text-green-400'
                  : 'bg-slate-700 text-slate-400 hover:text-white hover:bg-slate-600'
                  }`}
              >
                <Icon icon={copied.va ? 'mdi:check' : 'mdi:content-copy'} className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 text-center">
              Transfer melalui ATM, mobile banking, atau internet banking
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 mb-6">
          <button
            onClick={() => router.push('/history/investment')}
            className="w-full py-3.5 rounded-xl font-bold bg-slate-800 border border-slate-700 text-white hover:bg-slate-700 flex items-center justify-center gap-2 transition-colors"
          >
            <Icon icon="mdi:history" className="w-5 h-5" />
            Lihat Status Pembayaran
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20"
          >
            <Icon icon="mdi:home" className="w-5 h-5" />
            Kembali ke Dashboard
          </button>
        </div>

        {/* Footer */}
        <div className="text-center py-4">
          <p className="text-xs text-slate-600">© 2026 {applicationData?.company}</p>
        </div>
      </div>
    </div>
  );
}
