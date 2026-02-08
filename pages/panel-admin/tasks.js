// pages/admin/tasks.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Icon } from '@iconify/react';
import AdminLayout from '../../components/admin/Layout';
import useAdminAuth from '../../lib/auth/useAdminAuth';
import { adminRequest } from '../../utils/admin/api';

export default function TasksManagement() {
  const { loading: authLoading } = useAdminAuth();
  const [activeTab, setActiveTab] = useState('tasks');
  
  // Tasks state
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({
    name: '',
    reward: '',
    levelRequired: '',
    requiredActiveMembers: '',
    status: 'active'
  });
  const [taskSaving, setTaskSaving] = useState(false);
  const [taskError, setTaskError] = useState('');

  // User Tasks state
  const [userTasks, setUserTasks] = useState([]);
  const [userTasksLoading, setUserTasksLoading] = useState(false);
  const [userTasksFilters, setUserTasksFilters] = useState({
    status: 'all',
    search: '',
    page: 1,
    limit: 25
  });
  const [searchInput, setSearchInput] = useState('');
  const [totalUserTasks, setTotalUserTasks] = useState(0);
  const [totalUserTasksPages, setTotalUserTasksPages] = useState(1);

  // Stats
  const [taskStats, setTaskStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    totalCompletions: 0,
    totalRewards: 0
  });

  const [userTaskStats, setUserTaskStats] = useState({
    totalClaims: 0,
    claimedToday: 0,
    totalRewardsPaid: 0,
    uniqueUsers: 0
  });

  useEffect(() => {
    if (authLoading) return;
    loadTasks();
  }, [authLoading]);

  useEffect(() => {
    if (authLoading || activeTab !== 'user-tasks') return;
    loadUserTasks();
  }, [authLoading, activeTab, userTasksFilters]);

  const loadTasks = async () => {
    setTasksLoading(true);
    try {
      const res = await adminRequest('/tasks');
      // New API shape: { success, message, data: { total_claimed, total_paid, tasks: [...] } }
      const tasksData = res && res.data && (Array.isArray(res.data) ? res.data : res.data.tasks);
      if (res && tasksData && Array.isArray(tasksData)) {
        const mappedTasks = tasksData.map(t => ({
          id: t.id,
          name: t.name,
          reward: t.reward ?? 0,
          levelRequired: t.required_level ?? t.levelRequired ?? 0,
          requiredActiveMembers: t.required_active_members ?? 0,
          status: (t.status || 'active').toLowerCase(),
          completionCount: t.total_claimed ?? t.completion_count ?? t.completionCount ?? 0,
          createdAt: t.created_at || t.createdAt
        }));

        setTasks(mappedTasks);

        // Calculate stats. Prefer API-provided totals when available.
        const totalClaimsFromApi = res.data && (res.data.total_claimed ?? res.data.totalClaims ?? null);
        const totalPaidFromApi = res.data && (res.data.total_paid ?? res.data.totalPaid ?? null);

        const stats = mappedTasks.reduce((acc, task) => {
          acc.total++;
          if (task.status === 'active') acc.active++;
          else acc.inactive++;
          acc.totalCompletions += task.completionCount;
          acc.totalRewards += task.reward * task.completionCount;
          return acc;
        }, { total: 0, active: 0, inactive: 0, totalCompletions: 0, totalRewards: 0 });

        if (typeof totalClaimsFromApi === 'number') stats.totalCompletions = totalClaimsFromApi;
        if (typeof totalPaidFromApi === 'number') stats.totalRewards = totalPaidFromApi;

        setTaskStats(stats);
      } else {
        setTasks([]);
        setTaskStats({ total: 0, active: 0, inactive: 0, totalCompletions: 0, totalRewards: 0 });
      }
    } catch (err) {
      console.error('Failed to load tasks:', err);
      setTasks([]);
      setTaskStats({ total: 0, active: 0, inactive: 0, totalCompletions: 0, totalRewards: 0 });
    } finally {
      setTasksLoading(false);
    }
  };

  const loadUserTasks = async () => {
    setUserTasksLoading(true);
    try {
      const params = [];
      if (userTasksFilters.page) params.push(`page=${userTasksFilters.page}`);
      if (userTasksFilters.limit) params.push(`limit=${userTasksFilters.limit}`);
      if (userTasksFilters.search) params.push(`search=${encodeURIComponent(userTasksFilters.search)}`);
      
      const query = params.length ? `?${params.join('&')}` : '';
      const res = await adminRequest(`/user-tasks${query}`);
      
      if (res && Array.isArray(res.data)) {
        const mappedUserTasks = res.data.map(t => ({
          id: t.id,
          userId: t.user_id,
          userName: t.user_name || `User ${t.user_id}`,
          phone: t.phone || 'N/A',
          taskId: t.task_id,
          taskName: t.task_name || `Task ${t.task_id}`,
          reward: t.reward ?? 0,
          claimedAt: t.claimed_at || null,
          status: 'claimed'
        }));
        
        setUserTasks(mappedUserTasks);
        setTotalUserTasks(res.total || mappedUserTasks.length);
        setTotalUserTasksPages(Math.ceil((res.total || mappedUserTasks.length) / userTasksFilters.limit));
        
        // Calculate user task stats
        const today = new Date().toDateString();
        const userTaskStatsCalc = mappedUserTasks.reduce((acc, task) => {
          acc.totalClaims++;
          acc.totalRewardsPaid += task.reward;
          if (new Date(task.claimedAt).toDateString() === today) {
            acc.claimedToday++;
          }
          return acc;
        }, { totalClaims: 0, claimedToday: 0, totalRewardsPaid: 0 });
        
        userTaskStatsCalc.uniqueUsers = new Set(mappedUserTasks.map(t => t.userId)).size;
        setUserTaskStats(userTaskStatsCalc);
      } else {
        setUserTasks([]);
        setTotalUserTasks(0);
        setTotalUserTasksPages(1);
        setUserTaskStats({ totalClaims: 0, claimedToday: 0, totalRewardsPaid: 0, uniqueUsers: 0 });
      }
    } catch (err) {
      console.error('Failed to load user tasks:', err);
      setUserTasks([]);
      setTotalUserTasks(0);
      setUserTaskStats({ totalClaims: 0, claimedToday: 0, totalRewardsPaid: 0, uniqueUsers: 0 });
    } finally {
      setUserTasksLoading(false);
    }
  };

  const handleUserTasksFilterChange = (field, value) => {
    setUserTasksFilters(prev => ({ ...prev, [field]: value, page: field === 'page' ? value : 1 }));
  };

  const handleUserTasksSearch = () => {
    setUserTasksFilters(prev => ({ ...prev, search: searchInput, page: 1 }));
  };

  const handleAddTask = () => {
    setEditingTask(null);
    setTaskForm({
      name: '',
      reward: '',
      levelRequired: '',
      requiredActiveMembers: '',
      status: 'active'
    });
    setTaskError('');
    setShowTaskModal(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setTaskForm({
      name: task.name,
      reward: task.reward,
      levelRequired: task.levelRequired,
      requiredActiveMembers: task.requiredActiveMembers,
      status: task.status
    });
    setTaskError('');
    setShowTaskModal(true);
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    setTaskSaving(true);
    setTaskError('');
    
    try {
      const payload = {
        name: taskForm.name.trim(),
        reward: Number(taskForm.reward),
        required_level: Number(taskForm.levelRequired),
        required_active_members: Number(taskForm.requiredActiveMembers),
        status: taskForm.status.charAt(0).toUpperCase() + taskForm.status.slice(1)
      };
      
      let res;
      if (editingTask) {
        res = await adminRequest(`/tasks/${editingTask.id}`, { 
          method: 'PUT', 
          body: JSON.stringify(payload) 
        });
      } else {
        res = await adminRequest('/tasks', { 
          method: 'POST', 
          body: JSON.stringify(payload) 
        });
      }
      
      if (res && res.success) {
        loadTasks(); // Reload tasks
        setShowTaskModal(false);
        setTaskForm({
          name: '',
          reward: '',
          levelRequired: '',
          requiredActiveMembers: '',
          status: 'active'
        });
        setEditingTask(null);
      } else {
        setTaskError(res?.message || `Gagal ${editingTask ? 'memperbarui' : 'menambahkan'} task`);
      }
    } catch (err) {
      console.error('Task submit failed:', err);
      setTaskError(err?.message || `Gagal ${editingTask ? 'memperbarui' : 'menambahkan'} task`);
    } finally {
      setTaskSaving(false);
    }
  };

  const handleToggleTaskStatus = async (task) => {
    const newStatus = task.status === 'active' ? 'inactive' : 'active';
    try {
      const payload = {
        name: task.name,
        reward: task.reward,
        required_level: task.levelRequired,
        required_active_members: task.requiredActiveMembers,
        status: newStatus.charAt(0).toUpperCase() + newStatus.slice(1)
      };
      
      const res = await adminRequest(`/tasks/${task.id}`, { 
        method: 'PUT', 
        body: JSON.stringify(payload) 
      });
      
      if (res && res.success) {
        loadTasks(); // Reload tasks
      } else {
        setTaskError(res?.message || 'Gagal mengubah status task');
      }
    } catch (err) {
      console.error('Failed to toggle task status:', err);
      setTaskError('Gagal mengubah status task');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30', label: 'Aktif' },
      inactive: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', label: 'Tidak Aktif' },
      claimed: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', label: 'Diklaim' }
    };
    
    const config = statusConfig[status] || statusConfig.active;
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
        {config.label}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredUserTasks = userTasks.filter(task => {
    if (userTasksFilters.status !== 'all' && task.status !== userTasksFilters.status) return false;
    return true;
  });

  if (authLoading || (activeTab === 'tasks' && tasksLoading)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-400/30 border-t-purple-400 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-pink-400 rounded-full animate-spin animation-delay-150"></div>
          </div>
          <div className="mt-6 text-center">
            <p className="text-white font-medium text-lg">Memuat Data Tugas...</p>
            <p className="text-gray-400 text-sm mt-1">Harap tunggu sebentar</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout title="Kelola Tugas">
      <Head>
        <title>Vla Devs | Kelola Tugas</title>
        <link rel="icon" type="image/x-icon" href="/vla-logo.png" />
      </Head>

      {/* Tabs */}
      <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-2 border border-white/10 mb-8">
        <div className="flex">
          <button
            className={`flex-1 px-6 py-4 font-medium text-sm rounded-2xl transition-all duration-300 ${
              activeTab === 'tasks'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
            onClick={() => setActiveTab('tasks')}
          >
            <Icon icon="mdi:clipboard-text" className="inline mr-2 w-5 h-5" />
            Kelola Tugas
          </button>
          <button
            className={`flex-1 px-6 py-4 font-medium text-sm rounded-2xl transition-all duration-300 ${
              activeTab === 'user-tasks'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
            onClick={() => setActiveTab('user-tasks')}
          >
            <Icon icon="mdi:account-check" className="inline mr-2 w-5 h-5" />
            Klaim Pengguna
          </button>
        </div>
      </div>

      {/* Stats Cards - Tasks */}
      {activeTab === 'tasks' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard title="Total Tugas" value={taskStats.total} icon="mdi:clipboard-text" color="blue" />
          <StatCard title="Tugas Aktif" value={taskStats.active} icon="mdi:clipboard-check" color="green" />
          <StatCard title="Tugas Tidak Aktif" value={taskStats.inactive} icon="mdi:clipboard-remove" color="red" />
          <StatCard title="Total Penyelesaian" value={taskStats.totalCompletions} icon="mdi:trophy" color="orange" />
          <StatCard title="Total Reward Dibayar" value={formatCurrency(taskStats.totalRewards)} icon="mdi:cash" color="purple" isAmount />
        </div>
      )}

      {/* Stats Cards - User Tasks */}
      {activeTab === 'user-tasks' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Klaim" value={userTaskStats.totalClaims} icon="mdi:account-check" color="blue" />
          <StatCard title="Klaim Hari Ini" value={userTaskStats.claimedToday} icon="mdi:calendar-today" color="green" />
          <StatCard title="Total Reward Dibayar" value={formatCurrency(userTaskStats.totalRewardsPaid)} icon="mdi:cash-multiple" color="purple" isAmount />
          <StatCard title="Pengguna Unik" value={userTaskStats.uniqueUsers} icon="mdi:account-group" color="orange" />
        </div>
      )}

      {/* Tasks Management Section */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                    <Icon icon="mdi:clipboard-text" className="text-white w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-white font-semibold text-lg">Daftar Tugas</h2>
                    <p className="text-gray-400 text-sm">{tasks.length} tugas terdaftar</p>
                  </div>
                </div>
                <button
                  onClick={handleAddTask}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 transition-all duration-300 hover:scale-105"
                >
                  <Icon icon="mdi:plus" className="w-5 h-5" />
                  Tambah Tugas
                </button>
              </div>
            </div>

            {taskError && (
              <div className="p-4 bg-red-500/10 border-b border-red-500/20">
                <div className="flex items-center gap-2 text-red-400">
                  <Icon icon="mdi:alert-circle" className="w-4 h-4" />
                  {taskError}
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="py-4 px-6 text-left text-gray-300 font-medium">Nama Tugas</th>
                    <th className="py-4 px-6 text-left text-gray-300 font-medium">Reward</th>
                    <th className="py-4 px-6 text-left text-gray-300 font-medium">Level</th>
                    <th className="py-4 px-6 text-left text-gray-300 font-medium">Member</th>
                    <th className="py-4 px-6 text-left text-gray-300 font-medium">Status</th>
                    <th className="py-4 px-6 text-left text-gray-300 font-medium">Penyelesaian</th>
                    <th className="py-4 px-6 text-center text-gray-300 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task, index) => (
                    <tr key={task.id} className={`border-b border-white/5 hover:bg-white/5 transition-all duration-300 ${index % 2 === 0 ? 'bg-white/2' : ''}`}>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
                            <Icon icon="mdi:clipboard-text" className="text-white w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-medium text-white">{task.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-green-400 font-semibold">{formatCurrency(task.reward)}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="bg-black/20 px-3 py-1 rounded-lg font-mono text-white text-sm">
                          Level {task.levelRequired}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-white">{task.requiredActiveMembers} orang</span>
                      </td>
                      <td className="py-4 px-6">
                        {getStatusBadge(task.status)}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Icon icon="mdi:trophy" className="text-yellow-400 w-4 h-4" />
                          <span className="text-white font-medium">{task.completionCount.toLocaleString('id-ID')}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditTask(task)}
                            className="p-2 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 rounded-xl transition-all duration-300 hover:scale-110"
                            title="Edit Tugas"
                          >
                            <Icon icon="mdi:pencil" className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleTaskStatus(task)}
                            className={`p-2 rounded-xl transition-all duration-300 hover:scale-110 ${
                              task.status === 'active' 
                                ? 'bg-red-600/20 hover:bg-red-600/30 text-red-400' 
                                : 'bg-green-600/20 hover:bg-green-600/30 text-green-400'
                            }`}
                            title={task.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                          >
                            <Icon 
                              icon={task.status === 'active' ? 'mdi:close-circle' : 'mdi:check-circle'} 
                              className="w-4 h-4" 
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* User Tasks Section */}
      {activeTab === 'user-tasks' && (
        <div className="space-y-6">
          {/* Filter Section */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Icon icon="mdi:filter-variant" className="text-white w-5 h-5" />
              </div>
              <div>
                <h2 className="text-white font-semibold text-lg">Filter & Pencarian</h2>
                <p className="text-gray-400 text-sm">Cari klaim tugas pengguna</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div className="lg:col-span-1">
                <label className="block text-sm text-gray-400 mb-2">Pencarian</label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleUserTasksSearch()}
                    placeholder="Cari berdasarkan nama atau nomor telepon pengguna..."
                    className="w-full bg-white/10 border border-white/20 text-white rounded-2xl px-4 py-3 pl-12 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                  <Icon icon="mdi:magnify" className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Filter Status</label>
                <select 
                  value={userTasksFilters.status}
                  onChange={(e) => handleUserTasksFilterChange('status', e.target.value)}
                  className="w-full bg-white/10 border border-white/20 text-white rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all dark-select"
                >
                  <option value="all">Semua Status</option>
                  <option value="claimed">Diklaim</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <button
                onClick={handleUserTasksSearch}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <Icon icon="mdi:magnify" className="w-5 h-5" />
                Cari Klaim
              </button>
              <button
                onClick={() => {
                  setUserTasksFilters({ status: 'all', search: '', page: 1, limit: 25 });
                  setSearchInput('');
                }}
                className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-2xl flex items-center gap-2 transition-all"
              >
                <Icon icon="mdi:refresh" className="w-5 h-5" />
                Reset Filter
              </button>
            </div>
          </div>

          {/* User Tasks Table */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
                    <Icon icon="mdi:account-check" className="text-white w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-white font-semibold text-lg">Klaim Tugas Pengguna</h2>
                    <p className="text-gray-400 text-sm">{totalUserTasks} klaim ditemukan</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm">Tampilkan:</span>
                  <select
                    value={userTasksFilters.limit}
                    onChange={(e) => handleUserTasksFilterChange('limit', Number(e.target.value))}
                    className="bg-white/10 border border-white/20 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all dark-select"
                  >
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={75}>75</option>
                    <option value={100}>100</option>
                  </select>
                  <span className="text-gray-400 text-sm">per halaman</span>
                </div>
              </div>
            </div>

            {userTasksLoading ? (
              <div className="p-12 text-center">
                <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400">Memuat data klaim...</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5">
                        <th className="py-4 px-6 text-left text-gray-300 font-medium">Pengguna</th>
                        <th className="py-4 px-6 text-left text-gray-300 font-medium">Tugas</th>
                        <th className="py-4 px-6 text-left text-gray-300 font-medium">Reward</th>
                        <th className="py-4 px-6 text-left text-gray-300 font-medium">Status</th>
                        <th className="py-4 px-6 text-left text-gray-300 font-medium">Tanggal Klaim</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUserTasks.map((task, index) => (
                        <tr key={task.id} className={`border-b border-white/5 hover:bg-white/5 transition-all duration-300 ${index % 2 === 0 ? 'bg-white/2' : ''}`}>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                                <Icon icon="mdi:account-circle" className="text-white w-5 h-5" />
                              </div>
                              <div>
                                <p className="font-medium text-white">{task.userName}</p>
                                <p className="text-gray-400 text-sm">+62{task.phone}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
                                <Icon icon="mdi:clipboard-text" className="text-white w-4 h-4" />
                              </div>
                              <span className="text-white font-medium">{task.taskName}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-green-400 font-semibold">{formatCurrency(task.reward)}</span>
                          </td>
                          <td className="py-4 px-6">
                            {getStatusBadge(task.status)}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <Icon icon="mdi:calendar-clock" className="text-gray-400 w-4 h-4" />
                              <span className="text-gray-400 text-sm">{formatDate(task.claimedAt)}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="p-6 border-t border-white/10 bg-white/2">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-gray-400 text-sm">
                      Menampilkan {filteredUserTasks.length ? ((userTasksFilters.page - 1) * userTasksFilters.limit + 1) : 0} sampai{' '}
                      {filteredUserTasks.length ? ((userTasksFilters.page - 1) * userTasksFilters.limit + filteredUserTasks.length) : 0} dari{' '}
                      {totalUserTasks} klaim
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUserTasksFilterChange('page', Math.max(1, userTasksFilters.page - 1))}
                        disabled={userTasksFilters.page === 1}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:text-gray-600 text-white rounded-xl transition-all duration-300 disabled:cursor-not-allowed"
                      >
                        <Icon icon="mdi:chevron-left" className="w-4 h-4" />
                      </button>
                      
                      <div className="flex items-center gap-1">
                        <button
                          className={`w-10 h-10 rounded-xl transition-all duration-300 bg-gradient-to-r from-purple-600 to-pink-600 text-white`}
                          disabled
                        >
                          {userTasksFilters.page}
                        </button>
                      </div>
                      
                      <button
                        onClick={() => handleUserTasksFilterChange('page', userTasksFilters.page + 1)}
                        disabled={filteredUserTasks.length < userTasksFilters.limit}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:text-gray-600 text-white rounded-xl transition-all duration-300 disabled:cursor-not-allowed"
                      >
                        <Icon icon="mdi:chevron-right" className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {filteredUserTasks.length === 0 && !userTasksLoading && (
              <div className="text-center py-12">
                <Icon icon="mdi:clipboard-remove" className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-gray-400 text-lg font-medium mb-2">Tidak ada klaim ditemukan</h3>
                <p className="text-gray-500 text-sm">
                  {userTasksFilters.status === 'all' && !userTasksFilters.search
                    ? 'Belum ada klaim task dari pengguna.'
                    : 'Coba ubah filter atau kata kunci pencarian.'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900/95 backdrop-blur-xl rounded-3xl w-full max-w-md border border-white/20 shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                    <Icon icon={editingTask ? "mdi:pencil" : "mdi:plus"} className="text-white w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">
                      {editingTask ? 'Edit Tugas' : 'Tambah Tugas Baru'}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {editingTask ? 'Perbarui informasi tugas' : 'Buat tugas baru untuk pengguna'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowTaskModal(false)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <Icon icon="mdi:close" className="text-gray-400 hover:text-white w-5 h-5" />
                </button>
              </div>

              {taskError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-2xl text-sm mb-6">
                  <div className="flex items-center gap-2">
                    <Icon icon="mdi:alert-circle" className="w-4 h-4" />
                    {taskError}
                  </div>
                </div>
              )}

              <form onSubmit={handleTaskSubmit} className="space-y-6">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Nama Tugas</label>
                  <input
                    type="text"
                    value={taskForm.name}
                    onChange={(e) => setTaskForm({ ...taskForm, name: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 text-white rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Contoh: Tugas Perekrutan Member"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Reward (IDR)</label>
                  <input
                    type="number"
                    value={taskForm.reward}
                    onChange={(e) => setTaskForm({ ...taskForm, reward: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 text-white rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="5000"
                    min="0"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Level Minimum</label>
                    <input
                      type="number"
                      value={taskForm.levelRequired}
                      onChange={(e) => setTaskForm({ ...taskForm, levelRequired: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 text-white rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="1"
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Member Minimum</label>
                    <input
                      type="number"
                      value={taskForm.requiredActiveMembers}
                      onChange={(e) => setTaskForm({ ...taskForm, requiredActiveMembers: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 text-white rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="1"
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Status</label>
                  <select
                    value={taskForm.status}
                    onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 text-white rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all dark-select"
                  >
                    <option value="active">Aktif</option>
                    <option value="inactive">Tidak Aktif</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={taskSaving}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white py-3 rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95 disabled:scale-100"
                  >
                    {taskSaving ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <Icon icon={editingTask ? "mdi:content-save" : "mdi:plus"} className="w-5 h-5" />
                    )}
                    {taskSaving ? 'Menyimpan...' : editingTask ? 'Perbarui Task' : 'Tambah Task'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowTaskModal(false)}
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

// Stats Card Component
function StatCard({ title, value, icon, color, isAmount = false }) {
  const colorClasses = {
    blue: { bg: 'from-blue-600 to-cyan-600', text: 'text-blue-400' },
    green: { bg: 'from-green-600 to-emerald-600', text: 'text-green-400' },
    red: { bg: 'from-red-600 to-pink-600', text: 'text-red-400' },
    orange: { bg: 'from-orange-600 to-amber-600', text: 'text-orange-400' },
    purple: { bg: 'from-purple-600 to-pink-600', text: 'text-purple-400' }
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 hover:bg-white/10 hover:scale-105 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-r ${colorClasses[color].bg} rounded-xl flex items-center justify-center`}>
          <Icon icon={icon} className="w-6 h-6 text-white" />
        </div>
      </div>
      <div>
        <h3 className="text-gray-400 text-sm font-medium mb-2">{title}</h3>
        <div className="text-2xl font-bold text-white">
          {isAmount ? value : (typeof value === 'number' ? value.toLocaleString('id-ID') : value)}
        </div>
      </div>
    </div>
  );
}