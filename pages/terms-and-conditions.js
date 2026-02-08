// pages/terms-and-conditions.js
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { useRouter } from 'next/router';
import BottomNavbar from '../components/BottomNavbar';

export default function TermsAndConditions() {
  const [applicationData, setApplicationData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedApplication = localStorage.getItem('application');
      if (storedApplication) {
        try { setApplicationData(JSON.parse(storedApplication)); } catch (e) { }
      }
    }
  }, []);

  const sections = [
    {
      icon: 'mdi:file-document',
      title: 'Pengantar',
      color: 'blue',
      content: 'Harap baca syarat dan ketentuan ini dengan seksama sebelum menggunakan Layanan Kami. Syarat ini mengatur penggunaan Layanan dan perjanjian antara Anda dan Perusahaan.'
    },
    {
      icon: 'mdi:handshake',
      title: 'Pengakuan',
      color: 'green',
      content: 'Dengan mengakses atau menggunakan Layanan, Anda menyetujui untuk terikat oleh Syarat dan Ketentuan ini. Anda menyatakan bahwa Anda berusia di atas 18 tahun.'
    },
    {
      icon: 'mdi:link',
      title: 'Tautan Eksternal',
      color: 'purple',
      content: 'Layanan Kami mungkin berisi tautan ke situs web pihak ketiga. Perusahaan tidak bertanggung jawab atas konten atau praktik dari situs tersebut.'
    },
    {
      icon: 'mdi:stop-circle',
      title: 'Penghentian',
      color: 'red',
      content: 'Kami dapat menghentikan atau menangguhkan akses Anda segera tanpa pemberitahuan sebelumnya jika Anda melanggar Syarat dan Ketentuan ini.'
    },
    {
      icon: 'mdi:shield-alert',
      title: 'Pembatasan Tanggung Jawab',
      color: 'amber',
      content: 'Tanggung jawab Perusahaan dibatasi pada jumlah yang dibayar oleh Anda atau 100 USD. Perusahaan tidak bertanggung jawab atas kerusakan tidak langsung atau konsekuensial.'
    },
    {
      icon: 'mdi:gavel',
      title: 'Hukum yang Berlaku',
      color: 'cyan',
      content: 'Hukum Negara akan mengatur Syarat ini dan penggunaan Anda terhadap Layanan, tidak termasuk aturan konflik hukumnya.'
    },
    {
      icon: 'mdi:scale-balance',
      title: 'Penyelesaian Sengketa',
      color: 'indigo',
      content: 'Jika Anda memiliki sengketa tentang Layanan, Anda menyetujui untuk terlebih dahulu mencoba menyelesaikan sengketa secara informal dengan menghubungi Perusahaan.'
    },
    {
      icon: 'mdi:update',
      title: 'Perubahan Syarat',
      color: 'pink',
      content: 'Kami berhak untuk memodifikasi Syarat ini kapan saja. Jika revisi bersifat material, Kami akan memberikan pemberitahuan setidaknya 30 hari sebelumnya.'
    },
    {
      icon: 'mdi:email',
      title: 'Hubungi Kami',
      color: 'teal',
      content: 'Jika Anda memiliki pertanyaan tentang Syarat dan Ketentuan ini, hubungi kami di help@novavant.com'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: { bg: 'bg-blue-600/20', text: 'text-blue-400', border: 'border-blue-500/20' },
      green: { bg: 'bg-green-600/20', text: 'text-green-400', border: 'border-green-500/20' },
      amber: { bg: 'bg-amber-600/20', text: 'text-amber-400', border: 'border-amber-500/20' },
      purple: { bg: 'bg-purple-600/20', text: 'text-purple-400', border: 'border-purple-500/20' },
      cyan: { bg: 'bg-cyan-600/20', text: 'text-cyan-400', border: 'border-cyan-500/20' },
      red: { bg: 'bg-red-600/20', text: 'text-red-400', border: 'border-red-500/20' },
      pink: { bg: 'bg-pink-600/20', text: 'text-pink-400', border: 'border-pink-500/20' },
      indigo: { bg: 'bg-indigo-600/20', text: 'text-indigo-400', border: 'border-indigo-500/20' },
      teal: { bg: 'bg-teal-600/20', text: 'text-teal-400', border: 'border-teal-500/20' }
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-36">
      <Head>
        <title>{applicationData?.name || 'Nova Vant'} | Syarat dan Ketentuan</title>
      </Head>

      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/90 border-b border-white/5">
        <div className="max-w-md mx-auto px-5 py-4 flex items-center gap-4">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10">
            <Icon icon="mdi:arrow-left" className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-lg font-bold text-white">Syarat & Ketentuan</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-5 pt-6">
        {/* Hero */}
        <div className="relative mb-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-600 via-orange-600 to-red-700 rounded-3xl" />
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative p-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-3">
              <Icon icon="mdi:file-document-outline" className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-black text-white mb-1">Syarat dan Ketentuan</h2>
            <p className="text-amber-200 text-sm">Terakhir diperbarui: 3 Februari 2026</p>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-3">
          {sections.map((section, i) => {
            const colorClass = getColorClasses(section.color);
            return (
              <div key={i} className={`bg-slate-900/50 border ${colorClass.border} rounded-2xl p-4`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl ${colorClass.bg} flex items-center justify-center`}>
                    <Icon icon={section.icon} className={`w-5 h-5 ${colorClass.text}`} />
                  </div>
                  <h3 className="text-white font-bold text-sm">{section.title}</h3>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">{section.content}</p>
              </div>
            );
          })}
        </div>

        {/* Important Note */}
        <div className="mt-6 bg-gradient-to-br from-red-600/10 to-orange-600/10 border border-red-500/20 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <Icon icon="mdi:alert-circle" className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-300 text-xs font-semibold mb-1">Penting</p>
              <p className="text-slate-400 text-xs">
                Dengan terus menggunakan Layanan Kami, Anda menyetujui untuk terikat oleh syarat yang berlaku. Jika tidak setuju, harap berhenti menggunakan Layanan.
              </p>
            </div>
          </div>
        </div>
      </div>

      <BottomNavbar />
    </div>
  );
}
