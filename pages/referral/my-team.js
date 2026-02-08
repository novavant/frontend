import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Icon } from '@iconify/react';
import { getTeamInvitedByLevel, getTeamDataByLevel } from '../../utils/api';
import BottomNavbar from '../../components/BottomNavbar';
import ProfileImage from '../../components/ProfileImage';

export default function Team() {
  const router = useRouter();
  const [applicationData, setApplicationData] = useState(null);
  const { level } = router.query;
  const [teamData, setTeamData] = useState({
    level: null,
    totalInvestment: 0,
    totalMembers: 0,
    activeMembers: 0,
    inactiveMembers: 0,
    members: [],
    pagination: {
      limit: 10,
      page: 1,
      total_pages: 0,
      total_rows: 0,
    },
  });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const primaryColor = '#2563EB';

  async function fetchData(cancelToken) {
    setLoading(true);
    try {
      const statsRes = await getTeamInvitedByLevel(level);
      const stats = statsRes?.data?.[level] || { active: 0, inactive: 0, count: 0, total_invest: 0 };

      const queryParams = { limit, page, search: debouncedSearchTerm };
      if (filterStatus !== 'all') queryParams.status = filterStatus;

      const membersRes = await getTeamDataByLevel(level, queryParams);
      const responseData = membersRes?.data || {};
      const membersArr = responseData.members || [];
      const pagination = responseData.pagination || { limit, page, total_pages: 0, total_rows: 0 };
      const responseLevel = responseData.level || level;

      const members = membersArr.map((m, idx) => {
        let phone = (m.number || '').toString();
        if (phone.startsWith('0')) phone = `62${phone.slice(1)}`;
        else if (phone.startsWith('+62')) phone = phone.slice(1);
        else if (phone.startsWith('62')) phone = phone;
        else if (phone.length > 0) phone = `62${phone}`;
        return {
          id: (page - 1) * limit + idx + 1,
          phone,
          name: m.name,
          investment: m.total_invest || 0,
          status: m.active ? 'active' : 'inactive',
          profile: m.profile || null,
        };
      });

      if (!cancelToken?.current) {
        setTeamData({
          level: responseLevel,
          totalInvestment: stats.total_invest || 0,
          totalMembers: stats.count || 0,
          activeMembers: stats.active || 0,
          inactiveMembers: stats.inactive || 0,
          members,
          pagination,
        });
      }
    } catch (e) {
      if (!cancelToken?.current) {
        setTeamData({
          level: null,
          totalInvestment: 0,
          totalMembers: 0,
          activeMembers: 0,
          inactiveMembers: 0,
          members: [],
          pagination: { limit, page, total_pages: 0, total_rows: 0 },
        });
      }
    } finally {
      if (!cancelToken?.current) setLoading(false);
    }
  }

  const prevLevelRef = useRef();
  const searchDebounceRef = useRef(null);

  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(1);
    }, 500);
    return () => { if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current); };
  }, [searchTerm]);

  useEffect(() => {
    const storedApp = localStorage.getItem('application');
    if (storedApp) {
      try {
        const parsed = JSON.parse(storedApp);
        setApplicationData({ name: parsed.name || 'Nova Vant' });
      } catch (e) {
        setApplicationData({ name: 'Nova Vant' });
      }
    } else {
      setApplicationData({ name: 'Nova Vant' });
    }

    if (!level) return;
    const cancelToken = { current: false };

    if (prevLevelRef.current !== level) {
      prevLevelRef.current = level;
      if (page !== 1) {
        setPage(1);
        return () => { cancelToken.current = true; };
      }
    }

    fetchData(cancelToken);
    return () => { cancelToken.current = true; };
  }, [level, page, debouncedSearchTerm, filterStatus]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage !== page) setPage(newPage);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const filteredMembers = teamData.members;

  return (
    <div className="min-h-screen bg-slate-900 pb-28">
      <Head>
        <title>{applicationData?.name || 'Nova Vant'} | Anggota Tim</title>
        <meta name="description" content="Team Members" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="max-w-md mx-auto">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-400/20 via-transparent to-transparent" />

          <div className="relative px-5 pt-6 pb-8">
            {/* Top Row */}
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => router.back()}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition-all"
              >
                <Icon icon="mdi:arrow-left" className="w-5 h-5 text-white" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-white">Anggota Tim</h1>
                <p className="text-blue-100 text-sm">Daftar anggota referral Anda</p>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20">
              <div className="text-center mb-4">
                <p className="text-blue-100 text-sm mb-1">Total Investasi</p>
                <p className="text-3xl font-black text-white">{formatCurrency(teamData.totalInvestment)}</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 rounded-xl bg-white/10">
                  <p className="text-2xl font-bold text-white">{teamData.totalMembers}</p>
                  <p className="text-xs text-blue-100">Total</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-white/10">
                  <p className="text-2xl font-bold text-green-400">{teamData.activeMembers}</p>
                  <p className="text-xs text-blue-100">Aktif</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-white/10">
                  <p className="text-2xl font-bold text-slate-300">{teamData.inactiveMembers}</p>
                  <p className="text-xs text-blue-100">Non-Aktif</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-5 py-6">
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Icon icon="mdi:magnify" className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                placeholder="Cari nama atau nomor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500 placeholder-slate-500"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2">
                  <Icon icon="mdi:close" className="w-5 h-5 text-slate-500 hover:text-slate-300" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6">
            {[
              { key: 'all', label: 'Semua', count: teamData.totalMembers },
              { key: 'active', label: 'Aktif', count: teamData.activeMembers, color: 'green' },
              { key: 'inactive', label: 'Non-Aktif', count: teamData.inactiveMembers }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => { setFilterStatus(tab.key); setPage(1); }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${filterStatus === tab.key
                  ? tab.color === 'green'
                    ? 'bg-green-600 text-white shadow-lg shadow-green-600/30'
                    : 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'
                  }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Members List */}
          {loading ? (
            <div className="bg-slate-800 rounded-2xl p-10 border border-slate-700 text-center">
              <div className="w-10 h-10 border-3 border-slate-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-slate-400">Memuat data...</p>
            </div>
          ) : filteredMembers.length > 0 ? (
            <div className="space-y-3 mb-6">
              {filteredMembers.map((member) => (
                <div key={member.id} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                  <div className="flex items-center gap-3">
                    <ProfileImage
                      profile={member.profile}
                      className="w-12 h-12"
                      iconClassName="w-6 h-6"
                      primaryColor={primaryColor}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-white text-sm truncate">{member.name}</h4>
                        <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${member.status === 'active'
                          ? 'bg-green-900/50 text-green-400 border border-green-700/50'
                          : 'bg-slate-700 text-slate-400'
                          }`}>
                          {member.status === 'active' ? 'Aktif' : 'Non-Aktif'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">+{member.phone}</span>
                        <span className="font-semibold text-blue-400">{formatCurrency(member.investment)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : teamData.members.length === 0 ? (
            <div className="bg-slate-800 rounded-2xl p-10 border border-slate-700 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center mx-auto mb-4">
                <Icon icon="mdi:account-group-outline" className="w-8 h-8 text-slate-500" />
              </div>
              <h4 className="font-bold text-white text-lg mb-2">Belum Ada Anggota</h4>
              <p className="text-sm text-slate-400 mb-4">Anggota Anda masih kosong</p>
              <button
                onClick={() => router.push('/referral')}
                className="px-5 py-2.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors"
              >
                Mulai Referral
              </button>
            </div>
          ) : (
            <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 text-center">
              <Icon icon="mdi:magnify-close" className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <h4 className="font-bold text-white text-sm mb-1">Tidak Ditemukan</h4>
              <p className="text-xs text-slate-500">Tidak ada anggota yang sesuai</p>
            </div>
          )}

          {/* Pagination */}
          {teamData.members.length > 0 && teamData.pagination.total_pages > 1 && (
            <div className="mb-6">
              <p className="text-center text-xs text-slate-500 mb-3">
                Halaman {page} dari {teamData.pagination.total_pages} • {teamData.pagination.total_rows} anggota
              </p>
              <Pagination
                currentPage={page}
                totalPages={teamData.pagination.total_pages}
                onPageChange={handlePageChange}
                primaryColor={primaryColor}
              />
            </div>
          )}

          {/* Footer */}
          <div className="text-center py-4">
            <p className="text-xs text-slate-600">© 2026 {applicationData?.company}</p>
          </div>
        </div>
      </div>

      <BottomNavbar />
    </div>
  );
}

function Pagination({ currentPage, totalPages, onPageChange, primaryColor }) {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-1">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800 border border-slate-700 disabled:opacity-40 hover:bg-slate-700 transition-colors"
      >
        <Icon icon="mdi:chevron-left" className="w-5 h-5 text-slate-400" />
      </button>

      {getPageNumbers().map((pageNum, idx) => (
        pageNum === '...' ? (
          <span key={`ellipsis-${idx}`} className="w-10 h-10 flex items-center justify-center text-slate-500">...</span>
        ) : (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${currentPage === pageNum
              ? 'text-white shadow-lg shadow-blue-600/30'
              : 'bg-slate-800 border border-slate-700 text-slate-400 hover:bg-slate-700'
              }`}
            style={currentPage === pageNum ? { backgroundColor: primaryColor } : {}}
          >
            {pageNum}
          </button>
        )
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800 border border-slate-700 disabled:opacity-40 hover:bg-slate-700 transition-colors"
      >
        <Icon icon="mdi:chevron-right" className="w-5 h-5 text-slate-400" />
      </button>
    </div>
  );
}
