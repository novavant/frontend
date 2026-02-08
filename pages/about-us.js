// pages/about.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Icon } from '@iconify/react';
import BottomNavbar from '../components/BottomNavbar';
import Image from 'next/image';

export default function About() {
  const router = useRouter();
  const [applicationData, setApplicationData] = useState(null);

  useEffect(() => {
    const storedApplication = localStorage.getItem('application');
    if (storedApplication) {
      try { setApplicationData(JSON.parse(storedApplication)); } catch (e) { }
    }
  }, []);

  const features = [
    { title: "Memperluas Akses Investasi", text: "Memberikan kesempatan bagi investor di Indonesia untuk memiliki bagian dari properti strategis", icon: "mdi:earth" },
    { title: "Meningkatkan Likuiditas", text: "Proses investasi yang cepat dan fleksibel, memungkinkan keluar-masuk investasi dengan mudah", icon: "mdi:flash" },
    { title: "Transparansi & Efisiensi", text: "Laporan kinerja berkala untuk memantau perkembangan aset secara jelas", icon: "mdi:chart-bar" },
    { title: "Keamanan & Kepatuhan", text: "Mematuhi regulasi investasi internasional dan menerapkan sistem keamanan yang ketat", icon: "mdi:shield-check" }
  ];

  const values = [
    { icon: "mdi:earth", title: "Akses Global", text: "Terbuka untuk investor dari berbagai negara" },
    { icon: "mdi:office-building", title: "Kualitas Aset Premium", text: "Fokus pada properti bernilai tinggi dengan prospek pertumbuhan" },
    { icon: "mdi:chart-bar", title: "Manajemen Profesional", text: "Dikelola oleh tim berpengalaman di bidang investasi digital" },
    { icon: "mdi:handshake", title: "Inklusif", text: "Membuka peluang investasi bagi siapa saja" }
  ];

  return (
    <div className="min-h-screen bg-slate-950 pb-36">
      <Head>
        <title>{applicationData?.name || 'Nova Vant'} | Tentang Kami</title>
      </Head>

      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/90 border-b border-white/5">
        <div className="max-w-md mx-auto px-5 py-4 flex items-center gap-4">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10">
            <Icon icon="mdi:arrow-left" className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-lg font-bold text-white">Tentang Kami</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-5 pt-6">
        {/* Hero Card */}
        <div className="relative mb-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 rounded-3xl" />
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative p-6 text-center">
            <div className="w-24 h-16 relative mx-auto mb-4 bg-white/10 rounded-xl p-2">
              <Image src="/new_logo.png" alt="Logo" fill className="object-contain" onError={(e) => e.target.style.display = 'none'} />
            </div>
            <h2 className="text-2xl font-black text-white mb-1">{applicationData?.name || 'Nova Vant'}</h2>
            <p className="text-blue-200 text-sm">#1 Platform Investasi Properti di Indonesia</p>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-5 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center">
              <Icon icon="mdi:information" className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-white font-bold">Latar Belakang</h3>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed mb-3">
            {applicationData?.name || 'Nova Vant'} adalah platform investasi yang berpusat di Kota Dongguan, Tiongkok. Didirikan oleh {applicationData?.company || 'Novavant, Inc.'} dengan visi dan misi menciptakan akses investasi properti premium bagi semua kalangan.
          </p>
          <p className="text-slate-400 text-sm leading-relaxed">
            Platform ini lahir untuk menghapus hambatan tradisional dalam kepemilikan properti, sehingga investor lokal dapat berpartisipasi dengan modal yang lebih terjangkau.
          </p>
        </div>

        {/* Features */}
        <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-5 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-600/20 flex items-center justify-center">
              <Icon icon="mdi:target" className="w-5 h-5 text-green-400" />
            </div>
            <h3 className="text-white font-bold">Tujuan Pendirian</h3>
          </div>
          <div className="space-y-3">
            {features.map((item, i) => (
              <div key={i} className="flex items-start gap-3 bg-slate-800/50 rounded-xl p-3 border border-white/5">
                <div className="w-8 h-8 rounded-lg bg-green-600/20 flex items-center justify-center flex-shrink-0">
                  <Icon icon={item.icon} className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{item.title}</p>
                  <p className="text-slate-400 text-xs">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Values */}
        <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-5 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-600/20 flex items-center justify-center">
              <Icon icon="mdi:diamond-stone" className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className="text-white font-bold">Nilai Utama</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {values.map((item, i) => (
              <div key={i} className="bg-slate-800/50 rounded-xl p-3 border border-white/5 text-center">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center mx-auto mb-2">
                  <Icon icon={item.icon} className="w-5 h-5 text-blue-400" />
                </div>
                <p className="text-white font-semibold text-xs mb-1">{item.title}</p>
                <p className="text-slate-500 text-[10px]">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Conclusion */}
        <div className="bg-gradient-to-br from-indigo-600/20 to-violet-600/20 border border-indigo-500/20 rounded-3xl p-5 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <Icon icon="mdi:lightbulb-on" className="w-5 h-5 text-yellow-400" />
            <h3 className="text-white font-bold">Kesimpulan</h3>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">
            {applicationData?.name || 'Nova Vant'} hadir untuk menjadi penghubung antara pasar properti kelas atas dan investor lokal. Dengan pengelolaan yang profesional, transparansi penuh, serta komitmen pada keamanan.
          </p>
        </div>

        {/*
        <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-5">
          <h3 className="text-white font-bold text-center mb-4">Sertifikat Legal</h3>
          <div className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Icon icon="mdi:certificate" className="w-5 h-5 text-blue-400" />
              <span className="text-blue-300 font-semibold text-sm">Sertifikat Konformitas</span>
            </div>
            <div className="relative w-full h-48 rounded-xl overflow-hidden bg-white/5 mb-3">
              <Image src="/certificate_of_conformity.jpg" alt="Certificate" fill className="object-contain p-2" />
            </div>
            <p className="text-center text-white font-semibold text-sm">{applicationData?.company || 'PT NovaVant Next Generation'}</p>
          </div>
        </div>
        */}
      </div>

      <BottomNavbar />
    </div>
  );
}
