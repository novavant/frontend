import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { checkForumStatus, submitForumTestimonial } from '../../utils/api';
import BottomNavbar from '../../components/BottomNavbar';
import { Icon } from '@iconify/react';
import Image from 'next/image';

export default function UploadTestimoni() {
    const router = useRouter();
    const fileInputRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [statusLoading, setStatusLoading] = useState(true);
    const [canUpload, setCanUpload] = useState(false);
    const [statusMsg, setStatusMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [applicationData, setApplicationData] = useState(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const token = sessionStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        const checkStatus = async () => {
            setStatusLoading(true);
            try {
                const res = await checkForumStatus();
                if (res?.data?.has_withdrawal) {
                    setCanUpload(true);
                    setStatusMsg('Anda memiliki penarikan dalam 3 hari terakhir.');
                } else {
                    setCanUpload(false);
                    setStatusMsg('Lakukan penarikan terlebih dahulu untuk upload testimoni.');
                }
            } catch (err) {
                setErrorMsg('Gagal memeriksa status.');
            } finally {
                setStatusLoading(false);
            }
        };
        checkStatus();

        const storedApp = localStorage.getItem('application');
        if (storedApp) {
            try {
                setApplicationData(JSON.parse(storedApp));
            } catch (e) {
                setApplicationData({ name: 'Nova Vant' });
            }
        }
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            setErrorMsg('Format file harus JPG, PNG, atau WEBP.');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            setErrorMsg('Ukuran file maksimal 10MB.');
            return;
        }

        setErrorMsg('');
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setPreviewUrl(reader.result);
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');

        if (!selectedFile) {
            setErrorMsg('Pilih gambar terlebih dahulu.');
            return;
        }
        if (comment.trim().length < 5 || comment.trim().length > 60) {
            setErrorMsg('Deskripsi harus 5-60 karakter.');
            return;
        }

        setIsSubmitting(true);
        setUploadProgress(0);

        try {
            const interval = setInterval(() => {
                setUploadProgress(p => Math.min(p + 15, 95));
            }, 150);

            const res = await submitForumTestimonial({ image: selectedFile, description: comment });
            clearInterval(interval);
            setUploadProgress(100);

            if (res?.success) {
                setSelectedFile(null);
                setPreviewUrl(null);
                setComment('');
                setSuccessMsg(res?.message || 'Berhasil! Menunggu verifikasi.');
                setTimeout(() => router.push('/forum'), 3000);
            } else {
                setErrorMsg(res?.message || 'Gagal mengunggah.');
            }
        } catch (err) {
            setErrorMsg(err.message || 'Terjadi kesalahan.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 pb-36">
            <Head>
                <title>{applicationData?.name || 'Nova Vant'} | Upload Testimoni</title>
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
                    <h1 className="text-lg font-bold text-white">Buat Postingan</h1>
                </div>
            </div>

            <div className="max-w-md mx-auto px-5 pt-6">
                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-2 mb-6">
                    <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${previewUrl ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'}`}>
                            {previewUrl ? <Icon icon="mdi:check" className="w-4 h-4" /> : '1'}
                        </div>
                        <span className="text-xs text-slate-400">Foto</span>
                    </div>
                    <div className="w-8 h-0.5 bg-slate-700" />
                    <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${comment.length >= 5 ? 'bg-green-600 text-white' : previewUrl ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
                            {comment.length >= 5 ? <Icon icon="mdi:check" className="w-4 h-4" /> : '2'}
                        </div>
                        <span className="text-xs text-slate-400">Deskripsi</span>
                    </div>
                    <div className="w-8 h-0.5 bg-slate-700" />
                    <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${successMsg ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
                            {successMsg ? <Icon icon="mdi:check" className="w-4 h-4" /> : '3'}
                        </div>
                        <span className="text-xs text-slate-400">Selesai</span>
                    </div>
                </div>

                {/* Status Card */}
                {statusLoading ? (
                    <div className="mb-6 bg-slate-800 rounded-2xl p-4 border border-slate-700 flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-slate-600 border-t-blue-500 rounded-full animate-spin" />
                        <span className="text-slate-300 text-sm">Memeriksa status...</span>
                    </div>
                ) : (
                    <div className={`mb-6 rounded-2xl p-4 border ${canUpload ? 'bg-green-900/30 border-green-700/50' : 'bg-amber-900/30 border-amber-700/50'}`}>
                        <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${canUpload ? 'bg-green-600' : 'bg-amber-600'}`}>
                                <Icon icon={canUpload ? 'mdi:check' : 'mdi:alert'} className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className={`font-bold ${canUpload ? 'text-green-300' : 'text-amber-300'}`}>
                                    {canUpload ? 'Siap Upload!' : 'Belum Dapat Upload'}
                                </p>
                                <p className={`text-xs ${canUpload ? 'text-green-200' : 'text-amber-200'}`}>{statusMsg}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Reward Info */}
                <div className="mb-6 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-4 relative overflow-hidden">
                    <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full" />
                    <div className="relative flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                            <Icon icon="mdi:gift" className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-white font-bold">Bonus hingga Rp 20.000</p>
                            <p className="text-blue-100 text-xs">Untuk setiap post terverifikasi</p>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                {errorMsg && (
                    <div className="mb-4 p-4 rounded-xl bg-red-900/30 border border-red-700/50 flex items-center gap-3">
                        <Icon icon="mdi:alert-circle" className="w-5 h-5 text-red-400 flex-shrink-0" />
                        <p className="text-red-300 text-sm">{errorMsg}</p>
                    </div>
                )}
                {successMsg && (
                    <div className="mb-4 p-4 rounded-xl bg-green-900/30 border border-green-700/50 flex items-center gap-3">
                        <Icon icon="mdi:check-circle" className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <p className="text-green-300 text-sm">{successMsg}</p>
                    </div>
                )}

                {/* Upload Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Image Upload */}
                    <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
                        <label className="text-white font-semibold text-sm mb-3 block">
                            📸 Screenshot Bukti Penarikan
                        </label>

                        {previewUrl ? (
                            <div className="relative">
                                <div className="aspect-video rounded-xl overflow-hidden bg-slate-900">
                                    <Image src={previewUrl} alt="Preview" unoptimized width={400} height={225} className="w-full h-full object-cover" />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                                    disabled={isSubmitting}
                                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center"
                                >
                                    <Icon icon="mdi:close" className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => canUpload && fileInputRef.current?.click()}
                                disabled={!canUpload || isSubmitting}
                                className={`w-full aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all ${canUpload ? 'border-blue-500/50 bg-blue-900/20 hover:bg-blue-900/30' : 'border-slate-700 bg-slate-900/50 cursor-not-allowed'
                                    }`}
                            >
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${canUpload ? 'bg-blue-600' : 'bg-slate-700'}`}>
                                    <Icon icon="mdi:image-plus" className={`w-7 h-7 ${canUpload ? 'text-white' : 'text-slate-500'}`} />
                                </div>
                                <div className="text-center">
                                    <p className={`font-semibold ${canUpload ? 'text-white' : 'text-slate-500'}`}>Pilih Foto</p>
                                    <p className="text-xs text-slate-500">JPG, PNG, WEBP • Max 10MB</p>
                                </div>
                            </button>
                        )}

                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            disabled={!canUpload || isSubmitting}
                        />
                    </div>

                    {/* Description */}
                    <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
                        <label className="text-white font-semibold text-sm mb-3 block">
                            ✍️ Ceritakan Pengalaman Anda
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Bagikan pengalaman penarikan Anda..."
                            disabled={!canUpload || isSubmitting}
                            className="w-full h-28 px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        />
                        <div className="flex justify-between items-center mt-2">
                            <p className="text-xs text-slate-500">Min 5, max 60 karakter</p>
                            <p className={`text-xs font-medium ${comment.length > 60 ? 'text-red-400' : comment.length >= 5 ? 'text-green-400' : 'text-slate-500'}`}>
                                {comment.length}/60
                            </p>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting || !canUpload || !selectedFile || comment.length < 5}
                        className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all ${isSubmitting || !canUpload || !selectedFile || comment.length < 5
                            ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30'
                            }`}
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Mengunggah... {uploadProgress}%
                            </>
                        ) : (
                            <>
                                <Icon icon="mdi:send" className="w-5 h-5" />
                                Posting Testimoni
                            </>
                        )}
                    </button>

                    {/* Progress Bar */}
                    {isSubmitting && (
                        <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
                            <div
                                className="h-full bg-blue-600 transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>
                    )}
                </form>
            </div>

            <BottomNavbar />
        </div>
    );
}