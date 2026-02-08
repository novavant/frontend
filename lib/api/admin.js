// lib/api/admin.js
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.yourdomain.com';

import { getAdminToken } from '../../utils/admin/api';

// Generic API call function
const apiCall = async (endpoint, options = {}) => {
  const token = typeof getAdminToken === 'function' ? getAdminToken() : (typeof window !== 'undefined' ? sessionStorage.getItem('admin_token') : '');

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
};

// Dashboard
export const getDashboardStats = () => apiCall('/admin/dashboard/stats');

// Users
export const getUsers = (params = {}) => apiCall(`/admin/users?${new URLSearchParams(params)}`);
export const getUser = (id) => apiCall(`/admin/users/${id}`);
export const updateUser = (id, data) => apiCall(`/admin/users/${id}`, {
  method: 'PUT',
  body: JSON.stringify(data),
});
export const blockUser = (id) => apiCall(`/admin/users/${id}/block`, { method: 'POST' });
export const unblockUser = (id) => apiCall(`/admin/users/${id}/unblock`, { method: 'POST' });

// Investments
export const getInvestments = (params = {}) => apiCall(`/admin/investments?${new URLSearchParams(params)}`);
export const updateInvestment = (id, data) => apiCall(`/admin/investments/${id}`, {
  method: 'PUT',
  body: JSON.stringify(data),
});

// Withdrawals
export const getWithdrawals = (params = {}) => apiCall(`/admin/withdrawals?${new URLSearchParams(params)}`);
export const approveWithdrawal = (id) => apiCall(`/admin/withdrawals/${id}/approve`, { method: 'POST' });
export const rejectWithdrawal = (id) => apiCall(`/admin/withdrawals/${id}/reject`, { method: 'POST' });

// Products
export const getProducts = () => apiCall('/admin/products');
export const updateProduct = (id, data) => apiCall(`/admin/products/${id}`, {
  method: 'PUT',
  body: JSON.stringify(data),
});

// Banks
export const getBanks = () => apiCall('/admin/banks');
export const updateBank = (id, data) => apiCall(`/admin/banks/${id}`, {
  method: 'PUT',
  body: JSON.stringify(data),
});

// Bank Accounts
export const getBankAccounts = (params = {}) => apiCall(`/admin/bank-accounts?${new URLSearchParams(params)}`);
export const verifyBankAccount = (id) => apiCall(`/admin/bank-accounts/${id}/verify`, { method: 'POST' });

// Transactions
export const getTransactions = (params = {}) => apiCall(`/admin/transactions?${new URLSearchParams(params)}`);
export const exportTransactions = (params = {}) => apiCall(`/admin/transactions/export?${new URLSearchParams(params)}`);

// Payments
export const getPayments = (params = {}) => apiCall(`/admin/payments?${new URLSearchParams(params)}`);
export const verifyPayment = (id) => apiCall(`/admin/payments/${id}/verify`, { method: 'POST' });

// Spin Prizes
export const getSpinPrizes = () => apiCall('/admin/spin-prizes');
export const createSpinPrize = (data) => apiCall('/admin/spin-prizes', {
  method: 'POST',
  body: JSON.stringify(data),
});
export const updateSpinPrize = (id, data) => apiCall(`/admin/spin-prizes/${id}`, {
  method: 'PUT',
  body: JSON.stringify(data),
});
export const deleteSpinPrize = (id) => apiCall(`/admin/spin-prizes/${id}`, { method: 'DELETE' });

// User Spins
export const getUserSpins = (params = {}) => apiCall(`/admin/user-spins?${new URLSearchParams(params)}`);

// Tasks
export const getTasks = () => apiCall('/admin/tasks');
export const updateTask = (id, data) => apiCall(`/admin/tasks/${id}`, {
  method: 'PUT',
  body: JSON.stringify(data),
});

// User Tasks
export const getUserTasks = (params = {}) => apiCall(`/admin/user-tasks?${new URLSearchParams(params)}`);
export const deleteUserTask = (id) => apiCall(`/admin/user-tasks/${id}`, { method: 'DELETE' });

// Forums
export const getForums = (params = {}) => apiCall(`/admin/forums?${new URLSearchParams(params)}`);
export const approveForum = (id) => apiCall(`/admin/forums/${id}/approve`, { method: 'POST' });
export const rejectForum = (id) => apiCall(`/admin/forums/${id}/reject`, { method: 'POST' });
export const deleteForum = (id) => apiCall(`/admin/forums/${id}`, { method: 'DELETE' });

// Settings
export const getSettings = () => apiCall('/admin/settings');
export const updateSettings = (data) => apiCall('/admin/settings', {
  method: 'PUT',
  body: JSON.stringify(data),
});