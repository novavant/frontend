// pages/panel-admin/categories.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Icon } from '@iconify/react';
import AdminLayout from '../../components/admin/Layout';
import useAdminAuth from '../../lib/auth/useAdminAuth';
import { adminRequest } from '../../utils/admin/api';

export default function CategoryManagement() {
  const { loading: authLoading } = useAdminAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    profit_type: 'unlocked',
    status: 'Active'
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    loadCategories();
  }, [authLoading]);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await adminRequest('/categories', { method: 'GET' });
      if (res && res.data && res.data.categories) {
        setCategories(res.data.categories);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setForm({
      name: category.name,
      description: category.description || '',
      profit_type: category.profit_type,
      status: category.status
    });
    setError('');
    setShowModal(true);
  };

  const handleAdd = () => {
    setSelectedCategory(null);
    setForm({
      name: '',
      description: '',
      profit_type: 'unlocked',
      status: 'Active'
    });
    setError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    
    try {
      const body = {
        name: form.name,
        description: form.description,
        profit_type: form.profit_type,
        status: form.status
      };

      let res;
      if (selectedCategory) {
        res = await adminRequest(`/categories/${selectedCategory.id}`, { 
          method: 'PUT', 
          body: JSON.stringify(body) 
        });
      } else {
        res = await adminRequest('/categories', { 
          method: 'POST', 
          body: JSON.stringify(body) 
        });
      }
      
      if (res && res.success) {
        loadCategories();
        setShowModal(false);
      } else {
        setError(res?.message || 'Gagal menyimpan kategori');
      }
    } catch (err) {
      console.error('Save failed:', err);
      setError(err?.message || 'Gagal menyimpan kategori');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (categoryId) => {
    if (!confirm('Yakin ingin menghapus kategori ini? Kategori yang memiliki produk tidak dapat dihapus.')) return;
    
    try {
      const res = await adminRequest(`/categories/${categoryId}`, { method: 'DELETE' });
      if (res && res.success) {
        loadCategories();
      } else {
        alert(res?.message || 'Gagal menghapus kategori');
      }
    } catch (err) {
      alert(err?.message || 'Gagal menghapus kategori');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-purple-400/30 border-t-purple-400 rounded-full animate-spin"></div>
          <p className="text-white font-medium text-lg mt-6">Memuat Data...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout title="Kelola Kategori">
      <Head>
        <title>Admin | Kelola Kategori</title>
        <link rel="icon" type="image/x-icon" href="/vla-logo.png" />
      </Head>

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Icon icon="mdi:shape" className="w-8 h-8 text-purple-400" />
          <div>
            <h1 className="text-white font-bold text-2xl">Kategori Produk</h1>
            <p className="text-gray-400 text-sm">Kelola kategori investasi</p>
          </div>
        </div>
        <button
          onClick={handleAdd}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 transition-all duration-300 hover:scale-105"
        >
          <Icon icon="mdi:plus-circle" className="w-5 h-5" />
          Tambah Kategori
        </button>
      </div>

      {/* Categories Table */}
      <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Nama</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Deskripsi</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase">Profit Type</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase">Status</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category, idx) => (
                <tr key={category.id} className={`border-b border-white/5 hover:bg-white/5 transition-colors ${idx % 2 === 0 ? 'bg-white/[0.02]' : ''}`}>
                  <td className="px-6 py-4 text-white/90 font-mono text-sm">{category.id}</td>
                  <td className="px-6 py-4 text-white font-semibold">{category.name}</td>
                  <td className="px-6 py-4 text-white/70 text-sm max-w-xs truncate">{category.description || '-'}</td>
                  <td className="px-6 py-4 text-center">
                    {category.profit_type === 'locked' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-300 text-xs font-semibold">
                        <Icon icon="mdi:lock" className="w-3 h-3" />
                        Locked
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-lg text-green-300 text-xs font-semibold">
                        <Icon icon="mdi:flash" className="w-3 h-3" />
                        Unlocked
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                      category.status === 'Active' 
                        ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                        : 'bg-red-500/20 text-red-400 border-red-500/30'
                    }`}>
                      {category.status === 'Active' ? 'Aktif' : 'Tidak Aktif'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="p-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Icon icon="mdi:pencil" className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="p-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg transition-colors"
                        title="Hapus"
                      >
                        <Icon icon="mdi:delete" className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    Tidak ada kategori
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit/Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900/95 backdrop-blur-xl rounded-3xl w-full max-w-2xl border border-white/20 shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                    <Icon icon={selectedCategory ? "mdi:pencil" : "mdi:plus"} className="text-white w-5 h-5" />
                  </div>
                  <h3 className="text-white font-semibold text-lg">
                    {selectedCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowModal(false)}
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
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Nama Kategori *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({...form, name: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 text-white rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    placeholder="Monitor, Insight, AutoPilot"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Deskripsi</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({...form, description: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 text-white rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none"
                    rows="3"
                    placeholder="Deskripsi kategori (optional)"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Tipe Profit *</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setForm({...form, profit_type: 'locked'})}
                      className={`p-4 rounded-2xl border transition-all ${
                        form.profit_type === 'locked'
                          ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                          : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      <Icon icon="mdi:lock" className="w-6 h-6 mx-auto mb-2" />
                      <p className="font-semibold text-sm">Locked</p>
                      <p className="text-xs opacity-70 mt-1">Profit dibayar saat selesai</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({...form, profit_type: 'unlocked'})}
                      className={`p-4 rounded-2xl border transition-all ${
                        form.profit_type === 'unlocked'
                          ? 'bg-green-600/20 border-green-500 text-green-300'
                          : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      <Icon icon="mdi:flash" className="w-6 h-6 mx-auto mb-2" />
                      <p className="font-semibold text-sm">Unlocked</p>
                      <p className="text-xs opacity-70 mt-1">Profit langsung dibayar</p>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Status *</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({...form, status: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 text-white rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  >
                    <option value="Active" className="bg-gray-900">Aktif</option>
                    <option value="Inactive" className="bg-gray-900">Tidak Aktif</option>
                  </select>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
                  <div className="flex items-start gap-2">
                    <Icon icon="mdi:information" className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-200">
                      <p className="font-semibold mb-1">Catatan:</p>
                      <p>Kategori dengan tipe "Locked" akan menambah VIP level user saat investasi. Tipe "Unlocked" tidak menambah VIP.</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 text-white py-3 rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 disabled:scale-100"
                  >
                    {saving ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <Icon icon="mdi:content-save" className="w-5 h-5" />
                    )}
                    {saving ? 'Menyimpan...' : (selectedCategory ? 'Simpan' : 'Tambah')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
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

