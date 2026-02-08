import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Icon } from '@iconify/react';
import BottomNavbar from '../components/BottomNavbar';

export default function FAQ() {
    const router = useRouter();
    const [openIndex, setOpenIndex] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');

    const toggleAccordion = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const categories = [
        { id: 'all', label: 'Semua', icon: 'mdi:view-grid' },
        { id: 'general', label: 'Umum', icon: 'mdi:information' },
        { id: 'investment', label: 'Investasi', icon: 'mdi:finance' },
        { id: 'withdrawal', label: 'Penarikan', icon: 'mdi:cash-fast' },
        { id: 'referral', label: 'Referral', icon: 'mdi:account-group' },
    ];

    const faqData = [
        {
            category: 'general',
            question: 'Apa itu Nova Vant?',
            answer: 'Nova Vant adalah platform investasi digital modern yang memungkinkan Anda mengembangkan aset melalui berbagai portofolio investasi yang aman, transparan, dan menguntungkan. Kami didukung oleh teknologi terkini untuk memastikan keamanan dana dan data Anda.',
        },
        {
            category: 'general',
            question: 'Apakah Nova Vant aman?',
            answer: 'Ya, keamanan adalah prioritas utama kami. Nova Vant menggunakan enkripsi tingkat lanjut untuk melindungi data pribadi dan transaksi Anda. Kami juga bekerja sama dengan mitra pembayaran terpercaya untuk memastikan setiap transaksi berjalan lancar.',
        },
        {
            category: 'investment',
            question: 'Bagaimana cara mulai berinvestasi?',
            answer: 'Sangat mudah! Cukup daftar akun, pilih produk investasi yang Anda inginkan di halaman Investasi, lakukan pembayaran, dan mulai nikmati keuntungan harian yang otomatis masuk ke saldo Anda.',
        },
        {
            category: 'investment',
            question: 'Berapa minimal investasi?',
            answer: 'Minimal investasi di Nova Vant sangat terjangkau, mulai dari Rp 50.000 untuk paket Basic. Anda dapat melihat detail minimal investasi pada setiap produk di halaman Investasi.',
        },
        {
            category: 'investment',
            question: 'Kapan profit investasi cair?',
            answer: 'Profit investasi dibagikan setiap hari (harian) dan langsung masuk ke saldo akun Anda. Anda bisa memantau perkembangan profit Anda secara real-time melalui halaman Portofolio.',
        },
        {
            category: 'withdrawal',
            question: 'Berapa minimal penarikan (Withdraw)?',
            answer: 'Minimal penarikan dana adalah Rp 50.000. Pastikan saldo Anda mencukupi sebelum melakukan permintaan penarikan.',
        },
        {
            category: 'withdrawal',
            question: 'Berapa lama proses penarikan?',
            answer: 'Penarikan diproses secara realtime pada hari kerja. Penarikan pada akhir pekan atau hari libur mungkin membutuhkan waktu sedikit lebih lama.',
        },
        {
            category: 'withdrawal',
            question: 'Apakah ada biaya penarikan?',
            answer: 'Ya, terdapat biaya administrasi sebesar 10% untuk setiap penarikan dana. Biaya ini digunakan untuk pemeliharaan sistem dan biaya transfer antar bank.',
        },
        {
            category: 'referral',
            question: 'Bagaimana cara kerja sistem referral?',
            answer: 'Anda akan mendapatkan komisi setiap kali teman yang Anda undang melakukan investasi.',
        },
        {
            category: 'referral',
            question: 'Berapa besar komisi referral?',
            answer: 'Komisi referral: Direct Referral sebesar 30%. Detail lengkap bisa dilihat di halaman Tim Saya.',
        },
    ];

    const filteredFAQs = faqData.filter((item) => {
        const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
        const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.answer.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-slate-950 pb-36 relative overflow-hidden">
            <Head>
                <title>FAQ | Nova Vant</title>
            </Head>

            {/* Background Gradients */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[100px]" />
            </div>

            {/* Header */}
            <div className="sticky top-0 z-40 backdrop-blur-xl bg-slate-900/80 border-b border-white/5">
                <div className="max-w-md mx-auto px-5 py-4 flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 rounded-xl bg-slate-800/50 border border-white/10 flex items-center justify-center hover:bg-slate-700/50 transition-colors"
                    >
                        <Icon icon="mdi:arrow-left" className="w-5 h-5 text-white" />
                    </button>
                    <h1 className="text-lg font-bold text-white">Bantuan & FAQ</h1>
                </div>
            </div>

            <div className="max-w-md mx-auto px-5 pt-6">
                {/* Search Bar */}
                <div className="relative mb-6">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <Icon icon="mdi:magnify" className="w-5 h-5" />
                    </div>
                    <input
                        type="text"
                        placeholder="Cari pertanyaan..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                    />
                </div>

                {/* Categories */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all border ${activeCategory === cat.id
                                ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20'
                                : 'bg-slate-800/50 border-white/5 text-slate-400 hover:bg-slate-800'
                                }`}
                        >
                            <Icon icon={cat.icon} className="w-4 h-4" />
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* FAQ List */}
                <div className="space-y-4">
                    {filteredFAQs.length > 0 ? (
                        filteredFAQs.map((item, index) => (
                            <div
                                key={index}
                                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${openIndex === index
                                    ? 'bg-slate-800/60 border-blue-500/30 shadow-lg shadow-blue-900/10'
                                    : 'bg-slate-900/40 border-white/5 hover:bg-slate-800/40'
                                    }`}
                            >
                                <button
                                    onClick={() => toggleAccordion(index)}
                                    className="w-full px-5 py-4 flex items-center justify-between text-left gap-4"
                                >
                                    <span className={`font-medium transition-colors ${openIndex === index ? 'text-blue-300' : 'text-slate-200'
                                        }`}>
                                        {item.question}
                                    </span>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${openIndex === index ? 'bg-blue-500/20 rotate-180' : 'bg-slate-800'
                                        }`}>
                                        <Icon
                                            icon="mdi:chevron-down"
                                            className={`w-5 h-5 transition-colors ${openIndex === index ? 'text-blue-400' : 'text-slate-500'
                                                }`}
                                        />
                                    </div>
                                </button>
                                <div
                                    className={`transition-all duration-300 ease-in-out overflow-hidden ${openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                        }`}
                                >
                                    <div className="px-5 pb-5 pt-0 text-slate-400 text-sm leading-relaxed border-t border-white/5 mt-2">
                                        <div className="pt-4">{item.answer}</div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10">
                            <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto mb-4">
                                <Icon icon="mdi:text-search" className="w-8 h-8 text-slate-500" />
                            </div>
                            <p className="text-slate-400 font-medium">Tidak ada hasil ditemukan</p>
                            <p className="text-slate-500 text-sm mt-1">Coba kata kunci lain</p>
                        </div>
                    )}
                </div>

                {/* Contact Support */}
                <div className="mt-8 mb-6 p-5 rounded-2xl bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border border-blue-500/20 text-center">
                    <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center mx-auto mb-3">
                        <Icon icon="mdi:headset" className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-white font-bold mb-1">Masih butuh bantuan?</h3>
                    <p className="text-slate-400 text-sm mb-4">Tim support kami siap membantu Anda 24/7</p>
                    <button
                        onClick={() => window.open('https://t.me/novavant_support', '_blank')}
                        className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2 mx-auto"
                    >
                        <Icon icon="mdi:telegram" className="w-5 h-5" />
                        Hubungi via Telegram
                    </button>
                </div>
            </div>

            <BottomNavbar />
        </div>
    );
}
