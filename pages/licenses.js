// pages/licenses.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Icon } from '@iconify/react';
import BottomNavbar from '../components/BottomNavbar';
import Image from 'next/image';

const licensesData = {
  'Indonesia': [
    { institution: 'Otoritas Jasa Keuangan', company: 'PT Xdana Investa Indonesia', logo: '/licenses/ojk_indonesia.png' },
    { institution: 'Kementerian Komunikasi dan Digital', company: 'PT NovaVant Next Generation', logo: '/licenses/komdigi_indonesia.png' }
  ],
  'China': [
    { institution: 'China Securities Regulatory Commission', company: 'PT NovaVant Next Generation', logo: '/licenses/csrc_china.png' }
  ],
  'Hongkong': [
    { institution: 'Securities and Futures Commission', company: 'Novavant Limited', logo: '/licenses/sfc_hongkong.png' }
  ],
  'Singapore': [
    { institution: 'Monetary Authority of Singapore', company: 'Novavant SG, Ltd', logo: '/licenses/mas_singapore.png' },
    { institution: 'Government of Singapore Investment Corporation', company: 'Novavant SG, Ltd', logo: '/licenses/gic_singapore.png' }
  ],
  'Malaysia': [
    { institution: 'Securities Commission Malaysia', company: 'Novavant PLT', logo: '/licenses/scm_malaysia.png' }
  ],
  'Philippines': [
    { institution: 'Securities and Exchange Commission', company: 'Novavant, Inc', logo: '/licenses/sec_philippines.png' }
  ],
  'Thailand': [
    { institution: 'Securities and Exchange Commission', company: 'Novavant Thai, Ltd', logo: '/licenses/sec_thailand.png' }
  ],
  'Vietnam': [
    { institution: 'Ministry of Planning and Investment', company: 'Novavant Company', logo: '/licenses/mpi_vietnam.png' }
  ]
};

const countryFlags = {
  'Indonesia': '🇮🇩', 'China': '🇨🇳', 'Hongkong': '🇭🇰', 'Singapore': '🇸🇬',
  'Malaysia': '🇲🇾', 'Philippines': '🇵🇭', 'Thailand': '🇹🇭', 'Vietnam': '🇻🇳'
};

export default function Licenses() {
  const router = useRouter();
  const [applicationData, setApplicationData] = useState(null);

  useEffect(() => {
    const storedApplication = localStorage.getItem('application');
    if (storedApplication) {
      try { setApplicationData(JSON.parse(storedApplication)); } catch (e) { }
    }
  }, []);

  const totalLicenses = Object.values(licensesData).flat().length;

  return (
    <div className="min-h-screen bg-slate-950 pb-36">
      <Head>
        <title>{applicationData?.name || 'Nova Vant'} | Lisensi & Regulasi</title>
      </Head>

      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/90 border-b border-white/5">
        <div className="max-w-md mx-auto px-5 py-4 flex items-center gap-4">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10">
            <Icon icon="mdi:arrow-left" className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-lg font-bold text-white">Lisensi & Regulasi</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-5 pt-6">
        {/* Hero Stats */}
        <div className="relative mb-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700 rounded-3xl" />
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-200 text-sm mb-1">Total Lisensi Aktif</p>
                <p className="text-5xl font-black text-white">{totalLicenses}</p>
                <p className="text-green-200 text-xs mt-1">{Object.keys(licensesData).length} Negara</p>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Icon icon="mdi:certificate" className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Countries */}
        <div className="space-y-4">
          {Object.entries(licensesData).map(([country, licenses]) => (
            <div key={country} className="bg-slate-900/50 border border-white/5 rounded-3xl overflow-hidden">
              {/* Country Header */}
              <div className="px-4 py-3 bg-slate-800/50 border-b border-white/5 flex items-center gap-3">
                <span className="text-2xl">{countryFlags[country]}</span>
                <div>
                  <h3 className="text-white font-bold">{country}</h3>
                  <p className="text-slate-500 text-xs">{licenses.length} lisensi</p>
                </div>
              </div>

              {/* Licenses */}
              <div className="p-4 space-y-3">
                {licenses.map((license, index) => (
                  <div key={index} className="bg-slate-800/50 rounded-2xl p-4 border border-white/5">
                    <h4 className="text-white font-semibold text-sm mb-1">{license.institution}</h4>
                    <p className="text-slate-400 text-xs mb-3">{license.company}</p>
                    <div className="flex justify-center bg-white rounded-xl p-2">
                      <div className="relative w-full max-w-[140px] h-12">
                        <Image
                          src={license.logo}
                          alt={license.institution}
                          fill
                          className="object-contain"
                          unoptimized
                          onError={(e) => { e.target.parentElement.innerHTML = '<span class="text-slate-400 text-xs">Logo</span>'; }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomNavbar />
    </div>
  );
}
