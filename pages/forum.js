import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Icon } from '@iconify/react';
import { getForumTestimonials } from '../utils/api';
import BottomNavbar from '../components/BottomNavbar';
import Modal from '../components/Modal';
import Image from 'next/image';
import ProfileImage from '../components/ProfileImage';

export default function Forum() {
  const router = useRouter();
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalImage, setModalImage] = useState(null);
  const [applicationData, setApplicationData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalTestimonials, setTotalTestimonials] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = sessionStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    const fetchTestimonials = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getForumTestimonials({ limit, page });
        let rawItems = [];

        if (res.data?.data && Array.isArray(res.data.data)) {
          rawItems = res.data.data;
        } else if (res.data?.items && Array.isArray(res.data.items)) {
          rawItems = res.data.items;
        } else if (Array.isArray(res.data)) {
          rawItems = res.data;
        }

        if (!Array.isArray(rawItems)) rawItems = [];
        const items = rawItems.filter(t => t && t.status === 'Accepted');
        setTestimonials(items);

        const pagination = res.data?.pagination || {};
        if (pagination.total_rows !== undefined) {
          setTotalTestimonials(pagination.total_rows || 0);
          setTotalPages(pagination.total_pages || 1);
        } else {
          setTotalTestimonials(items.length);
          setTotalPages(Math.max(1, Math.ceil(items.length / limit)));
        }
      } catch (err) {
        setError(err.message || 'Gagal memuat testimoni');
        setTestimonials([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTestimonials();

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUserData(JSON.parse(storedUser));
      } catch (e) {
        setUserData({});
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
  }, [page, limit]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  };

  // Filter testimonials based on active tab
  const getFilteredTestimonials = () => {
    if (activeTab === 'latest') {
      // Sort by time descending (newest first)
      return [...testimonials].sort((a, b) => {
        const timeA = new Date(a.time?.replace(' ', 'T') || 0);
        const timeB = new Date(b.time?.replace(' ', 'T') || 0);
        return timeB - timeA;
      });
    } else if (activeTab === 'popular') {
      // Random shuffle
      return [...testimonials].sort(() => Math.random() - 0.5);
    }
    // Default 'all' - return as is from API
    return testimonials;
  };

  const filteredTestimonials = getFilteredTestimonials();



  return (
    <div className="min-h-screen bg-slate-900 pb-36">
      <Head>
        <title>{applicationData?.name || 'Nova Vant'} | Forum</title>
        <meta name="description" content="Forum Testimoni" />
      </Head>

      <Modal
        isOpen={!!modalImage}
        onClose={() => setModalImage(null)}
        maxWidth="max-w-4xl"
        showCloseButton={true}
        className="bg-transparent shadow-none border-none p-0"
      >
        <div className="relative flex items-center justify-center p-1">
          {modalImage && (
            <Image
              src={modalImage}
              alt="Preview"
              unoptimized
              width={800}
              height={800}
              className="rounded-2xl max-h-[85vh] w-auto object-contain shadow-2xl"
            />
          )}
        </div>
      </Modal>

      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-slate-900/90 border-b border-slate-800">
        <div className="max-w-md mx-auto px-5 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-white">Forum</h1>
            <button
              onClick={() => router.push('/forum/upload')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all"
            >
              <Icon icon="mdi:plus" className="w-4 h-4" />
              Posting
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-5 pt-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 text-center">
            <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center mx-auto mb-2">
              <Icon icon="mdi:forum" className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-lg font-bold text-white">{totalTestimonials}</p>
            <p className="text-xs text-slate-400">Total Post</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 text-center">
            <div className="w-10 h-10 rounded-full bg-green-600/20 flex items-center justify-center mx-auto mb-2">
              <Icon icon="mdi:check-decagram" className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-lg font-bold text-white">{testimonials.length}</p>
            <p className="text-xs text-slate-400">Verified</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 text-center">
            <div className="w-10 h-10 rounded-full bg-yellow-600/20 flex items-center justify-center mx-auto mb-2">
              <Icon icon="mdi:gift" className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-lg font-bold text-white">20K</p>
            <p className="text-xs text-slate-400">Max Bonus</p>
          </div>
        </div>

        {/* Bonus Banner */}
        <div className="mb-6 relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-5">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Icon icon="mdi:cash-multiple" className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-lg">Dapatkan Bonus!</p>
              <p className="text-blue-100 text-sm">Rp 2.000 - Rp 20.000 per post terverifikasi</p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {[
            { id: 'all', label: 'Semua', icon: 'mdi:view-grid' },
            { id: 'latest', label: 'Terbaru', icon: 'mdi:clock-outline' },
            { id: 'popular', label: 'Populer', icon: 'mdi:fire' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
                }`}
            >
              <Icon icon={tab.icon} className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-3 border-slate-700 border-t-blue-500 rounded-full animate-spin mb-4" />
            <p className="text-slate-400">Memuat...</p>
          </div>
        ) : error ? (
          <div className="bg-red-900/30 border border-red-700/50 rounded-2xl p-6 text-center">
            <Icon icon="mdi:alert-circle" className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <p className="text-white font-semibold mb-1">Terjadi Kesalahan</p>
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        ) : testimonials.length === 0 ? (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-700 flex items-center justify-center mx-auto mb-4">
              <Icon icon="mdi:forum-outline" className="w-8 h-8 text-slate-500" />
            </div>
            <p className="text-white font-semibold mb-2">Belum Ada Postingan</p>
            <p className="text-slate-400 text-sm mb-4">Jadilah yang pertama berbagi pengalaman Anda</p>
            <button
              onClick={() => router.push('/forum/upload')}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold"
            >
              Buat Postingan
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTestimonials.map((t) => (
              <TestimonialCard key={t.id} t={t} setModalImage={setModalImage} formatCurrency={formatCurrency} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && testimonials.length > 0 && totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center disabled:opacity-40"
            >
              <Icon icon="mdi:chevron-left" className="w-5 h-5 text-white" />
            </button>
            <span className="px-4 py-2 text-sm text-slate-400">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center disabled:opacity-40"
            >
              <Icon icon="mdi:chevron-right" className="w-5 h-5 text-white" />
            </button>
          </div>
        )}
      </div>

      <BottomNavbar />
    </div>
  );
}

function TestimonialCard({ t, setModalImage, formatCurrency }) {
  const [imgUrl, setImgUrl] = useState(null);

  useEffect(() => {
    let isMounted = true;
    if (t.image) {
      fetch(`/api/s3-image?key=${encodeURIComponent(t.image)}`)
        .then(res => res.json())
        .then(data => { if (isMounted && data.url) setImgUrl(data.url); });
    }
    return () => { isMounted = false; };
  }, [t.image]);

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden hover:border-slate-600 transition-all">
      {/* Header */}
      <div className="p-4 flex items-center gap-3">
        <ProfileImage profile={t.profile} className="w-11 h-11" iconClassName="w-5 h-5" primaryColor="#2563EB" />
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm truncate">{t.name}</p>
          <p className="text-slate-500 text-xs">+62{String(t.number).replace(/^\+?62|^0/, '').slice(0, 4)}****</p>
        </div>
        <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-green-600/20 text-green-400 text-xs font-bold">
          <Icon icon="mdi:gift" className="w-3.5 h-3.5" />
          {formatCurrency(t.reward)}
        </div>
      </div>

      {/* Image */}
      {imgUrl && (
        <button onClick={() => setModalImage(imgUrl)} className="w-full aspect-video bg-slate-900 overflow-hidden">
          <Image src={imgUrl} alt="Preview" unoptimized width={400} height={225} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
        </button>
      )}

      {/* Content */}
      <div className="p-4 pt-3">
        <p className="text-slate-300 text-sm leading-relaxed">{t.description}</p>
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-700">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs">
            <Icon icon="mdi:clock-outline" className="w-4 h-4" />
            {new Date(t.time.replace(' ', 'T')).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
          <div className="flex items-center gap-1.5 text-slate-500 text-xs">
            <Icon icon="mdi:check-decagram" className="w-4 h-4 text-green-500" />
            Verified
          </div>
        </div>
      </div>
    </div>
  );
}