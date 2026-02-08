// pages/privacy-policy.js
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { useRouter } from 'next/router';
import BottomNavbar from '../components/BottomNavbar';

export default function PrivacyPolicy() {
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
      icon: 'mdi:shield-check',
      title: 'Pengantar',
      color: 'blue',
      content: 'Kebijakan Privasi ini menjelaskan kebijakan dan prosedur Kami dalam mengumpulkan, menggunakan, dan mengungkapkan informasi Anda. Dengan menggunakan Layanan, Anda menyetujui pengumpulan dan penggunaan informasi sesuai dengan Kebijakan Privasi ini.'
    },
    {
      icon: 'mdi:database',
      title: 'Data yang Dikumpulkan',
      color: 'green',
      content: 'Kami mengumpulkan: Nama lengkap, Nomor telepon, Data penggunaan, Alamat IP, Jenis browser, dan informasi perangkat lainnya untuk menyediakan dan meningkatkan Layanan.'
    },
    {
      icon: 'mdi:cookie',
      title: 'Cookies',
      color: 'amber',
      content: 'Kami menggunakan Cookies untuk melacak aktivitas dan menyimpan informasi. Jenis cookies yang digunakan: Cookies Penting, Cookies Kebijakan, dan Cookies Fungsionalitas.'
    },
    {
      icon: 'mdi:chart-line',
      title: 'Penggunaan Data',
      color: 'purple',
      content: 'Data digunakan untuk: Menyediakan dan memelihara Layanan, Mengelola akun Anda, Menghubungi Anda, Memberikan penawaran khusus, dan Mengelola permintaan Anda.'
    },
    {
      icon: 'mdi:clock',
      title: 'Penyimpanan Data',
      color: 'cyan',
      content: 'Kami menyimpan Data Pribadi Anda hanya selama diperlukan untuk tujuan yang diuraikan dalam Kebijakan ini dan untuk mematuhi kewajiban hukum kami.'
    },
    {
      icon: 'mdi:security',
      title: 'Keamanan Data',
      color: 'red',
      content: 'Keamanan Data Pribadi Anda penting bagi Kami. Meskipun tidak ada metode yang 100% aman, Kami berusaha menggunakan cara yang masuk akal untuk melindungi Data Anda.'
    },
    {
      icon: 'mdi:account-child',
      title: 'Privasi Anak',
      color: 'pink',
      content: 'Layanan kami tidak ditujukan untuk siapa pun yang berusia di bawah 18 tahun. Kami tidak secara sadar mengumpulkan informasi dari anak-anak di bawah 18 tahun.'
    },
    {
      icon: 'mdi:email',
      title: 'Hubungi Kami',
      color: 'indigo',
      content: 'Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini, hubungi kami di help@novavant.com'
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
      indigo: { bg: 'bg-indigo-600/20', text: 'text-indigo-400', border: 'border-indigo-500/20' }
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-36">
      <Head>
        <title>{applicationData?.name || 'Nova Vant'} | Kebijakan Privasi</title>
      </Head>

      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/90 border-b border-white/5">
        <div className="max-w-md mx-auto px-5 py-4 flex items-center gap-4">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10">
            <Icon icon="mdi:arrow-left" className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-lg font-bold text-white">Kebijakan Privasi</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-5 pt-6">
        {/* Hero */}
        <div className="relative mb-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 rounded-3xl" />
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative p-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-3">
              <Icon icon="mdi:shield-check" className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-black text-white mb-1">Kebijakan Privasi</h2>
            <p className="text-green-200 text-sm">Terakhir diperbarui: 5 Februari 2026</p>
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
      </div>

      <BottomNavbar />
    </div>
  );
}
