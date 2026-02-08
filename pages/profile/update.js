import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Icon } from '@iconify/react';
import { updateUserProfile, deleteUserProfile } from '../../utils/api';
import BottomNavbar from '../../components/BottomNavbar';
import Modal from '../../components/Modal';
import Image from 'next/image';
import ProfileImage from '../../components/ProfileImage';

export default function UpdateProfile() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [userData, setUserData] = useState(null);
  const [name, setName] = useState('');
  const [profile, setProfile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [applicationData, setApplicationData] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = sessionStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUserData(parsed);
        setName(parsed.name || '');
        setProfile(parsed.profile || null);
      } catch (e) {
        setUserData({ name: '', profile: null });
      }
    }

    const storedApp = localStorage.getItem('application');
    if (storedApp) {
      try {
        setApplicationData(JSON.parse(storedApp));
      } catch (e) {
        setApplicationData({ name: 'Nova Vant' });
      }
    }
  }, [router]);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        setErrorMsg('File harus JPG atau PNG.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('Ukuran file maksimal 5MB.');
        return;
      }
      setErrorMsg('');
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!name.trim()) {
      setErrorMsg('Nama tidak boleh kosong.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await updateUserProfile({ name: name.trim(), profile: selectedFile });

      if (res?.success) {
        const updatedUser = { ...userData, name: res.data.name, profile: res.data.profile };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUserData(updatedUser);
        setProfile(res.data.profile);
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setSuccessMsg(res?.message || 'Profile berhasil diperbarui.');
        if (typeof window !== 'undefined') window.dispatchEvent(new Event('user-profile-updated'));
      } else {
        setErrorMsg(res?.message || 'Gagal memperbarui profile.');
      }
    } catch (err) {
      setErrorMsg('Gagal memperbarui profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProfile = async () => {
    if (!profile) return;
    setIsDeleting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await deleteUserProfile();

      if (res?.success) {
        const updatedUser = { ...userData, profile: null };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUserData(updatedUser);
        setProfile(null);
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setSuccessMsg(res?.message || 'Foto profile berhasil dihapus.');
        if (typeof window !== 'undefined') window.dispatchEvent(new Event('user-profile-updated'));
      } else {
        setErrorMsg(res?.message || 'Gagal menghapus foto profile.');
      }
    } catch (err) {
      setErrorMsg('Gagal menghapus foto profile.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 pb-36">
      <Head>
        <title>{applicationData?.name || 'Nova Vant'} | Update Profile</title>
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
          <h1 className="text-lg font-bold text-white">Update Profile</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-5 pt-6">
        {/* Profile Photo Card */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 mb-4">
          <h2 className="text-sm font-semibold text-slate-400 mb-4 text-center">Foto Profile</h2>
          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={() => setShowProfileModal(true)}
              className="relative group"
            >
              {previewUrl ? (
                <div className="relative w-28 h-28 rounded-full overflow-hidden ring-4 ring-blue-600/30">
                  <Image src={previewUrl} alt="Preview" unoptimized fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Icon icon="mdi:camera" className="w-8 h-8 text-white" />
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <ProfileImage
                    profile={profile}
                    className="w-28 h-28 ring-4 ring-slate-700"
                    iconClassName="w-14 h-14"
                    primaryColor="#2563EB"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center">
                    <Icon icon={profile ? "mdi:camera" : "mdi:image-plus"} className="w-8 h-8 text-white" />
                  </div>
                </div>
              )}
              {/* Edit Badge */}
              <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center border-4 border-slate-800">
                <Icon icon="mdi:pencil" className="w-5 h-5 text-white" />
              </div>
            </button>
          </div>
          <p className="text-xs text-slate-500 text-center mt-4">Tap untuk mengubah foto</p>
        </div>

        {/* Form Card */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-900/30 border border-red-700/50 flex items-start gap-2">
              <Icon icon="mdi:alert-circle" className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-300">{errorMsg}</p>
            </div>
          )}
          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-green-900/30 border border-green-700/50 flex items-start gap-2">
              <Icon icon="mdi:check-circle" className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-green-300">{successMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Nama Lengkap</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masukkan nama Anda"
                required
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Phone (Read Only) */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Nomor HP</label>
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl">
                <Icon icon="mdi:phone" className="w-5 h-5 text-slate-500" />
                <span className="text-slate-400">+62{userData?.number || '-'}</span>
                <Icon icon="mdi:lock" className="w-4 h-4 text-slate-600 ml-auto" />
              </div>
              <p className="text-xs text-slate-500 mt-1">Nomor tidak dapat diubah</p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || isDeleting}
              className={`w-full py-3.5 rounded-xl text-white font-bold flex items-center justify-center gap-2 transition-all ${isSubmitting || isDeleting
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/20'
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
        </div>
      </div>

      {/* Profile Modal */}
      <Modal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        title={profile || previewUrl ? 'Ganti Foto' : 'Tambah Foto'}
        maxWidth="max-w-sm"
        showCloseButton={true}
      >
        <div className="p-5 space-y-3">
          <button
            onClick={() => { handleFileSelect(); setShowProfileModal(false); }}
            className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center justify-center gap-2"
          >
            <Icon icon="mdi:image-plus" className="w-5 h-5" />
            {profile || previewUrl ? 'Ganti Foto' : 'Pilih Foto'}
          </button>

          {(profile || previewUrl) && (
            <button
              onClick={() => {
                if (previewUrl) {
                  setSelectedFile(null);
                  setPreviewUrl(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                  setShowProfileModal(false);
                } else {
                  setShowProfileModal(false);
                  setShowDeleteConfirm(true);
                }
              }}
              disabled={isDeleting}
              className="w-full py-3.5 px-4 rounded-xl bg-red-900/30 border border-red-700/50 text-red-400 font-semibold flex items-center justify-center gap-2 hover:bg-red-900/50 disabled:opacity-50"
            >
              <Icon icon="mdi:delete" className="w-5 h-5" />
              Hapus Foto
            </button>
          )}

          <button
            onClick={() => setShowProfileModal(false)}
            className="w-full py-3.5 px-4 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold"
          >
            Batal
          </button>

          <div className="pt-2">
            <p className="text-xs text-slate-500 text-center">Format: JPG/PNG, maksimal 5MB</p>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Hapus Foto Profile?"
        maxWidth="max-w-sm"
        icon="mdi:alert-circle"
        iconColor="text-red-400"
        iconBgColor="bg-red-900/20"
      >
        <div className="p-6 pt-2">
          <p className="text-sm text-slate-400 text-center mb-6">
            Tindakan ini tidak dapat dibatalkan.
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
              className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold disabled:opacity-50 transition-colors"
            >
              Batal
            </button>

            <button
              onClick={async () => { setShowDeleteConfirm(false); await handleDeleteProfile(); }}
              disabled={isDeleting}
              className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold disabled:opacity-50 flex items-center justify-center gap-2 transition-colors shadow-lg shadow-red-600/20"
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Menghapus...
                </>
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

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/jpg"
        className="hidden"
        disabled={isSubmitting}
      />

      <BottomNavbar />
    </div>
  );
}
