// components/InvestmentModal.js
import React, { useState, useEffect } from 'react';
import { createInvestment } from '../utils/api';
import { useRouter } from 'next/router';
import { BANKS } from '../constants/products';
import { Icon } from '@iconify/react';
import Modal from './Modal';

const PAYMENT_METHODS = [
  { value: 'QRIS', label: 'QRIS', icon: 'mdi:qrcode-scan' },
  { value: 'BANK', label: 'Bank Transfer', icon: 'mdi:bank' }
];

export default function InvestmentModal({ open, onClose, product, user, onSuccess }) {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState('');
  const [bank, setBank] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!product) return null;

  const amount = product.amount;
  const dailyProfit = product.daily_profit;
  const duration = product.duration;
  const totalReturn = amount + (dailyProfit * duration);

  const isQRISDisabled = amount > 10000000;

  useEffect(() => {
    if (open && product) {
      const defaultMethod = isQRISDisabled ? 'BANK' : 'QRIS';
      setPaymentMethod(defaultMethod);
      if (BANKS && BANKS.length > 0) {
        setBank(BANKS[0].code);
      }
      setError('');
    }
  }, [open, product?.id, isQRISDisabled]);

  const category = product.category || {};
  const categoryName = category.name || 'Unknown';

  const formatCurrency = (amt) => new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amt);

  const handlePaymentMethodClick = (methodValue) => {
    if (loading) return;
    if (methodValue === 'QRIS' && isQRISDisabled) return;
    setPaymentMethod(methodValue);
  };

  const handleConfirm = async () => {
    setError('');
    if (paymentMethod === 'BANK' && !bank) {
      setError('Pilih bank transfer.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        product_id: product.id,
        payment_method: paymentMethod,
        payment_channel: paymentMethod === 'BANK' ? bank : undefined,
      };
      const data = await createInvestment(payload);
      setLoading(false);
      if (data && data.data && data.data.order_id) {
        router.push(`/payment?order_id=${encodeURIComponent(data.data.order_id)}`);
      } else {
        setError('Gagal mendapatkan order ID pembayaran');
      }
    } catch (err) {
      setError(err.message || 'Gagal melakukan investasi');
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={product.name}
      icon="mdi:shopping"
      iconColor="text-blue-400"
      iconBgColor="bg-blue-600/20"
      maxWidth="max-w-md"
    >
      <div className="p-6 pt-2">
        {/* Category Badge */}
        <div className="flex items-center gap-2 mb-6">
          <span className="px-2.5 py-1 rounded-lg bg-slate-700/50 text-xs font-semibold text-slate-300">
            {categoryName}
          </span>
          {isQRISDisabled && (
            <span className="px-2.5 py-1 rounded-lg bg-amber-900/30 text-xs font-semibold text-amber-500 border border-amber-500/20">
              High Value
            </span>
          )}
        </div>

        {/* Investment Summary */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <Icon icon="mdi:chart-box-outline" className="w-4 h-4 text-blue-400" />
            Ringkasan Investasi
          </h3>
          <div className="bg-slate-700/30 rounded-2xl p-4 border border-white/5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <span className="text-sm text-slate-400">Modal Investasi</span>
              <span className="font-bold text-white text-lg">{formatCurrency(amount)}</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 rounded-xl bg-slate-800/50 border border-white/5 text-center">
                <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Profit</p>
                <p className="text-sm font-bold text-green-400">
                  {formatCurrency(dailyProfit * duration)}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/50 border border-white/5 text-center">
                <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Durasi</p>
                <p className="text-sm font-bold text-white">{duration} Hari</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/50 border border-white/5 text-center">
                <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Total</p>
                <p className="text-sm font-bold text-blue-400">{formatCurrency(totalReturn)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <Icon icon="mdi:credit-card-outline" className="w-4 h-4 text-purple-400" />
            Metode Pembayaran
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {PAYMENT_METHODS.map((method) => {
              const isDisabled = method.value === 'QRIS' && isQRISDisabled;
              const isSelected = paymentMethod === method.value;

              return (
                <button
                  key={method.value}
                  type="button"
                  onClick={() => handlePaymentMethodClick(method.value)}
                  disabled={loading || isDisabled}
                  className={`relative p-4 rounded-2xl border transition-all flex flex-col items-center justify-center gap-2 ${isSelected
                    ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10'
                    : isDisabled
                      ? 'border-slate-700 bg-slate-800/30 opacity-40 cursor-not-allowed'
                      : 'border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800'
                    }`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                      <Icon icon="mdi:check" className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSelected ? 'bg-blue-500/20' : 'bg-slate-700/50'}`}>
                    <Icon
                      icon={method.icon}
                      className={`w-5 h-5 ${isSelected ? 'text-blue-400' : 'text-slate-400'}`}
                    />
                  </div>
                  <span className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                    {method.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Bank Selection */}
          {paymentMethod === 'BANK' && BANKS && BANKS.length > 0 && (
            <div className="mt-4 animate-fadeIn">
              <label className="text-xs font-semibold text-slate-400 mb-2 block ml-1">Pilih Bank Tujuan</label>
              <div className="relative">
                <select
                  value={bank}
                  onChange={(e) => setBank(e.target.value)}
                  disabled={loading}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-600 bg-slate-800/50 text-sm font-medium text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 appearance-none"
                >
                  {BANKS.map((b) => (
                    <option key={b.code} value={b.code}>
                      {b.name}
                    </option>
                  ))}
                </select>
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Icon icon="mdi:bank-outline" className="w-5 h-5 text-slate-400" />
                </div>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Icon icon="mdi:chevron-down" className="w-5 h-5 text-slate-400" />
                </div>
              </div>
            </div>
          )}

          {/* QRIS Warning */}
          {isQRISDisabled && (
            <div className="mt-3 flex gap-3 p-3 bg-amber-900/20 border border-amber-500/20 rounded-xl">
              <Icon icon="mdi:information" className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-200/80 leading-relaxed">
                <span className="font-semibold text-amber-400 block mb-0.5">Limit Transaksi QRIS</span>
                Transaksi di atas Rp 10.000.000 wajib menggunakan metode Bank Transfer.
              </p>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 flex gap-3 p-3 bg-red-900/20 border border-red-500/20 rounded-xl animate-shake">
            <Icon icon="mdi:alert-circle" className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-200/80">
              <p className="font-semibold text-red-400 mb-0.5">Gagal Memproses</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="py-3.5 px-4 rounded-xl font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Batal
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="group relative py-3.5 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-600/20 overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <div className="relative flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <Icon icon="mdi:check-circle" className="w-5 h-5" />
                  <span>Konfirmasi</span>
                </>
              )}
            </div>
          </button>
        </div>
      </div>
    </Modal>
  );
}

