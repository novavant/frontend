// pages/panel-admin/products.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Icon } from '@iconify/react';
import AdminLayout from '../../components/admin/Layout';
import useAdminAuth from '../../lib/auth/useAdminAuth';
import { adminRequest } from '../../utils/admin/api';

export default function ProductManagement() {
  const { loading: authLoading } = useAdminAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editForm, setEditForm] = useState({
    category_id: '',
    name: '',
    amount: '',
    daily_profit: '',
    duration: '',
    required_vip: '0',
    purchase_limit: '0',
    status: 'Active'
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0
  });

  useEffect(() => {
    if (authLoading) return;
    loadCategories();
    loadProducts();
  }, [authLoading]);

  const loadCategories = async () => {
    try {
      const res = await adminRequest('/categories', { method: 'GET' });
      if (res && res.data && res.data.categories) {
        setCategories(res.data.categories);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await adminRequest('/products', { method: 'GET' });
      if (res && res.data && res.data.products) {
        setProducts(res.data.products);

        // Calculate stats
        const statsData = res.data.products.reduce((acc, product) => {
          acc.total++;
          if (product.status === 'Active') acc.active++;
          else acc.inactive++;
          return acc;
        }, { total: 0, active: 0, inactive: 0 });
        setStats(statsData);
      } else {
        setProducts([]);
        setStats({ total: 0, active: 0, inactive: 0 });
      }
    } catch (err) {
      console.error('Failed to load products:', err);
      setProducts([]);
      setStats({ total: 0, active: 0, inactive: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setEditForm({
      category_id: product.category_id?.toString() || '',
      name: product.name,
      amount: product.amount?.toString() || '',
      daily_profit: product.daily_profit?.toString() || '',
      duration: product.duration?.toString() || '',
      required_vip: product.required_vip?.toString() || '0',
      purchase_limit: product.purchase_limit?.toString() || '0',
      status: product.status
    });
    setError('');
    setShowEditModal(true);
  };

  const handleAdd = () => {
    setSelectedProduct(null);
    setEditForm({
      category_id: categories[0]?.id?.toString() || '',
      name: '',
      amount: '',
      daily_profit: '',
      duration: '1',
      required_vip: '0',
      purchase_limit: '0',
      status: 'Active'
    });
    setError('');
    setShowAddModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');

    try {
      const body = {
        category_id: Number(editForm.category_id),
        name: editForm.name,
        amount: Number(editForm.amount),
        daily_profit: Number(editForm.daily_profit),
        duration: Number(editForm.duration),
        required_vip: Number(editForm.required_vip),
        purchase_limit: Number(editForm.purchase_limit),
        status: editForm.status
      };

      let res;
      if (selectedProduct) {
        // Update existing
        res = await adminRequest(`/products/${selectedProduct.id}`, {
          method: 'PUT',
          body: JSON.stringify(body)
        });
      } else {
        // Create new
        res = await adminRequest('/products', {
          method: 'POST',
          body: JSON.stringify(body)
        });
      }

      if (res && res.success) {
        loadProducts();
        setShowEditModal(false);
        setShowAddModal(false);
      } else {
        setError(res?.message || 'Gagal menyimpan produk');
      }
    } catch (err) {
      console.error('Save failed:', err);
      setError(err?.message || 'Gagal menyimpan produk');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!confirm('Yakin ingin menghapus produk ini? Produk yang memiliki investasi tidak dapat dihapus.')) return;

    try {
      const res = await adminRequest(`/products/${productId}`, { method: 'DELETE' });
      if (res && res.success) {
        loadProducts();
      } else {
        alert(res?.message || 'Gagal menghapus produk');
      }
    } catch (err) {
      alert(err?.message || 'Gagal menghapus produk');
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getCategoryName = (categoryId) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat?.name || 'Unknown';
  };

  const getCategoryColor = (categoryName) => {
    if (categoryName.toLowerCase().includes('monitor')) return { bg: 'from-blue-600 to-cyan-600', text: 'text-blue-400' };
    if (categoryName.toLowerCase().includes('insight')) return { bg: 'from-green-600 to-emerald-600', text: 'text-green-400' };
    if (categoryName.toLowerCase().includes('autopilot')) return { bg: 'from-orange-600 to-red-600', text: 'text-orange-400' };
    return { bg: 'from-gray-600 to-gray-700', text: 'text-gray-400' };
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-400/30 border-t-purple-400 rounded-full animate-spin"></div>
          </div>
          <div className="mt-6 text-center">
            <p className="text-white font-medium text-lg">Memuat Data Produk...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout title="Kelola Produk">
      <Head>
        <title>Admin | Kelola Produk</title>
        <link rel="icon" type="image/x-icon" href="/vla-logo.png" />
      </Head>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Produk" value={stats.total} icon="mdi:package-variant" color="blue" />
        <StatCard title="Produk Aktif" value={stats.active} icon="mdi:package-variant-closed" color="green" />
        <StatCard title="Tidak Aktif" value={stats.inactive} icon="mdi:package-variant-remove" color="red" />
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
          <button
            onClick={handleAdd}
            className="w-full h-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-2xl flex flex-col items-center justify-center gap-2 transition-all duration-300 hover:scale-105"
          >
            <Icon icon="mdi:plus-circle" className="w-8 h-8" />
            <span className="font-semibold">Tambah Produk</span>
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-white font-semibold text-lg flex items-center gap-2">
            <Icon icon="mdi:format-list-bulleted" className="w-6 h-6 text-purple-400" />
            Daftar Produk ({products.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Kategori</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Nama</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase">Amount</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase">Profit</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase">Durasi</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase">VIP</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase">Limit</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase">Status</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, idx) => {
                const catName = product.category?.name || getCategoryName(product.category_id);
                const catColor = getCategoryColor(catName);

                return (
                  <tr key={product.id} className={`border-b border-white/5 hover:bg-white/5 transition-colors ${idx % 2 === 0 ? 'bg-white/[0.02]' : ''}`}>
                    <td className="px-6 py-4 text-white/90 font-mono text-sm">{product.id}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gradient-to-r ${catColor.bg} bg-opacity-20 border border-white/10`}>
                        <span className={`text-xs font-semibold ${catColor.text}`}>{catName}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white font-medium">{product.name}</td>
                    <td className="px-6 py-4 text-right text-white/90">{formatCurrency(product.amount)}</td>
                    <td className="px-6 py-4 text-right text-green-400 font-semibold">{formatCurrency(product.daily_profit)}</td>
                    <td className="px-6 py-4 text-center text-white/90">{product.duration} hari</td>
                    <td className="px-6 py-4 text-center">
                      {product.required_vip > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded text-yellow-300 text-xs font-semibold">
                          <Icon icon="mdi:crown" className="w-3 h-3" />
                          VIP {product.required_vip}
                        </span>
                      ) : (
                        <span className="text-gray-500 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {product.purchase_limit > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-500/20 border border-orange-500/30 rounded text-orange-300 text-xs font-semibold">
                          {product.purchase_limit}x
                        </span>
                      ) : (
                        <span className="text-gray-500 text-xs">∞</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">{getStatusBadge(product.status)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Icon icon="mdi:pencil" className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Icon icon="mdi:delete" className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {products.length === 0 && (
                <tr>
                  <td colSpan="10" className="px-6 py-8 text-center text-gray-500">
                    Tidak ada produk
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit/Add Modal */}
      {(showEditModal || showAddModal) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900/95 backdrop-blur-xl rounded-3xl w-full max-w-3xl border border-white/20 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                    <Icon icon={selectedProduct ? "mdi:pencil" : "mdi:plus"} className="text-white w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">
                      {selectedProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
                    </h3>
                    {selectedProduct && (
                      <p className="text-gray-400 text-sm">ID: {selectedProduct.id}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => { setShowEditModal(false); setShowAddModal(false); }}
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

              <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-gray-400 text-sm mb-2">Kategori *</label>
                    <select
                      value={editForm.category_id}
                      onChange={(e) => setEditForm({ ...editForm, category_id: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 text-white rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                      required
                    >
                      <option value="">Pilih Kategori</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id} className="bg-gray-900">
                          {cat.name} ({cat.profit_type})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-gray-400 text-sm mb-2">Nama Produk *</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 text-white rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                      placeholder="Monitor 1, Insight 2, dll"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Jumlah Investasi (Rp) *</label>
                    <input
                      type="number"
                      value={editForm.amount}
                      onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 text-white rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                      min="0"
                      step="1000"
                      placeholder="50000"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Profit Harian (Rp) *</label>
                    <input
                      type="number"
                      value={editForm.daily_profit}
                      onChange={(e) => setEditForm({ ...editForm, daily_profit: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 text-white rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                      min="0"
                      step="1000"
                      placeholder="15000"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Durasi (Hari) *</label>
                    <input
                      type="number"
                      value={editForm.duration}
                      onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 text-white rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                      min="1"
                      placeholder="70"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 text-sm mb-2">VIP Required</label>
                    <input
                      type="number"
                      value={editForm.required_vip}
                      onChange={(e) => setEditForm({ ...editForm, required_vip: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 text-white rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                      min="0"
                      max="5"
                      placeholder="0 (tidak perlu VIP)"
                    />
                    <p className="text-gray-500 text-xs mt-1">0 = tidak perlu VIP, 1-5 = VIP level</p>
                  </div>

                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Purchase Limit</label>
                    <input
                      type="number"
                      value={editForm.purchase_limit}
                      onChange={(e) => setEditForm({ ...editForm, purchase_limit: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 text-white rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                      min="0"
                      placeholder="0 (unlimited)"
                    />
                    <p className="text-gray-500 text-xs mt-1">0 = unlimited, 1 = sekali, 2 = dua kali</p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-gray-400 text-sm mb-2">Status</label>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 text-white rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    >
                      <option value="Active" className="bg-gray-900">Aktif</option>
                      <option value="Inactive" className="bg-gray-900">Tidak Aktif</option>
                    </select>
                  </div>
                </div>

                {/* Preview */}
                {editForm.amount && editForm.daily_profit && editForm.duration && (
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                    <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <Icon icon="mdi:calculator" className="text-green-400 w-5 h-5" />
                      Preview Total Return
                    </h4>
                    <div className="bg-gradient-to-r from-green-600/10 to-emerald-600/10 border border-green-500/20 rounded-2xl p-4 text-center">
                      <p className="text-gray-400 text-sm mb-2">
                        Investasi: {formatCurrency(Number(editForm.amount))}
                      </p>
                      <p className="text-gray-400 text-sm mb-2">
                        Profit: {formatCurrency(Number(editForm.daily_profit) * Number(editForm.duration))}
                      </p>
                      <div className="h-px bg-white/10 my-3"></div>
                      <div className="text-green-400 font-bold text-2xl">
                        {formatCurrency(Number(editForm.amount) + (Number(editForm.daily_profit) * Number(editForm.duration)))}
                      </div>
                      <p className="text-gray-500 text-xs mt-1">Total yang diterima user</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 text-white py-3 rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95 disabled:scale-100"
                  >
                    {saving ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <Icon icon="mdi:content-save" className="w-5 h-5" />
                    )}
                    {saving ? 'Menyimpan...' : (selectedProduct ? 'Simpan Perubahan' : 'Tambah Produk')}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowEditModal(false); setShowAddModal(false); }}
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
