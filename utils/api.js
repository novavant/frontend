// utils/api.js
import { handleApiResponse } from './apiHandler';
import { isMobileApp } from './mobileAppDetection';
import { storeTokenToAndroid, clearTokenFromAndroid } from './androidInterface';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Cookie helpers (simple, not HttpOnly — server should set HttpOnly cookie if possible)
function setCookie(name, value, days = 30) {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

function getCookie(name) {
  if (typeof document === 'undefined') return null;
  return document.cookie.split('; ').reduce((r, v) => {
    const parts = v.split('=');
    return parts[0] === name ? decodeURIComponent(parts[1]) : r;
  }, null);
}

function deleteCookie(name) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

let isRefreshing = false;
let refreshQueue = [];

// Refresh tokens using refresh_token from cookie and store access token in sessionStorage
export const refreshTokens = async () => {
  const refresh_token = getCookie('refresh_token');
  if (!refresh_token) {
    throw new Error('No refresh token available');
  }

  const is_app = typeof window !== 'undefined' ? isMobileApp() : false;

  const res = await fetch(`${BASE_URL}/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token, is_app })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) {
    // clear storage on failure
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('access_expire');
    deleteCookie('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('application');
    // Clear token from Android WebView
    clearTokenFromAndroid();
    throw new Error(data.message || 'Token refresh failed');
  }

  // store new tokens safely
  sessionStorage.setItem('token', data.data.access_token);
  sessionStorage.setItem('access_expire', data.data.access_expire);
  // Store token to Android WebView
  if (data.data.access_token) {
    storeTokenToAndroid(data.data.access_token);
  }
  // update refresh token cookie
  if (data.data.refresh_token) {
    setCookie('refresh_token', data.data.refresh_token, 30);
  }
  return true;
};

// Ensure access token is valid — refresh using queue to avoid concurrent refreshes
async function ensureTokenValid() {
  if (typeof window === 'undefined') return '';
  const token = sessionStorage.getItem('token');
  const expire = sessionStorage.getItem('access_expire');

  // if no token but refresh token exists, try refresh
  const refresh_token = getCookie('refresh_token');
  if (!token && refresh_token) {
    // no token -> refresh
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        await refreshTokens();
        isRefreshing = false;
        refreshQueue.forEach(cb => cb(null));
        refreshQueue = [];
      } catch (err) {
        isRefreshing = false;
        refreshQueue.forEach(cb => cb(err));
        refreshQueue = [];
        // Clear token from Android WebView on refresh failure
        clearTokenFromAndroid();
        throw err;
      }
    } else {
      // wait for ongoing refresh
      await new Promise((resolve, reject) => refreshQueue.push(err => err ? reject(err) : resolve()));
    }
    return sessionStorage.getItem('token') || '';
  }

  if (token && expire) {
    const expireTime = new Date(expire).getTime();
    // 5 second buffer
    if (expireTime - 5000 <= Date.now()) {
      // token expired -> refresh if refresh token exists
      if (!refresh_token) {
        // no way to refresh
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('access_expire');
        // Clear token from Android WebView
        clearTokenFromAndroid();
        throw new Error('Token expired and no refresh token');
      }

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          await refreshTokens();
          isRefreshing = false;
          refreshQueue.forEach(cb => cb(null));
          refreshQueue = [];
        } catch (err) {
          isRefreshing = false;
          refreshQueue.forEach(cb => cb(err));
          refreshQueue = [];
          // Clear token from Android WebView on refresh failure
          clearTokenFromAndroid();
          throw err;
        }
      } else {
        await new Promise((resolve, reject) => refreshQueue.push(err => err ? reject(err) : resolve()));
      }
    }
  }

  return sessionStorage.getItem('token') || '';
}

// Async getter for token (ensures validity)
async function getToken() {
  try {
    return await ensureTokenValid();
  } catch (err) {
    return '';
  }
}

// Helper function to make authenticated API requests
async function apiRequest(url, options = {}) {
  const token = await getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(`${BASE_URL}${url}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      // if token invalid, try refreshing once
      if (data && /invalid token/i.test(data.message || '') || data.message === 'Invalid token') {
        try {
          await refreshTokens();
          const newToken = sessionStorage.getItem('token');
          if (newToken) {
            return apiRequest(url, options);
          }
        } catch (e) {
          throw new Error(data.message || 'Request failed due to invalid token');
        }
      }
      throw new Error(data.message || 'Request failed');
    }

    return data;
  } catch (error) {
    throw error;
  }
}

// Get user information
export const getUserInfo = async () => {
  return apiRequest('/users/info', { method: 'GET' });
};

// Get application info / settings (server endpoint: GET /api/info)
export const getInfo = async () => {
  try {
    return await apiRequest('/info', { method: 'GET' });
  } catch (err) {
    console.error('getInfo error:', err);
    return { success: false, message: err?.message || 'Network error' };
  }
};

// Get investment history (riwayat investasi)
export const getInvestmentHistory = async ({ limit = 10, page = 1, search = '' } = {}) => {
  let query = `?limit=${encodeURIComponent(limit)}&page=${encodeURIComponent(page)}`;
  if (search && search.trim()) {
    query += `&search=${encodeURIComponent(search.trim())}`;
  }
  return apiRequest(`/users/investments${query}`, { method: 'GET' });
};

// Withdraw user balance
export const withdrawUser = async ({ amount, bank_account_id }) => {
  return apiRequest('/users/withdrawal', {
    method: 'POST',
    body: JSON.stringify({ amount, bank_account_id }),
  });
};

// Get withdrawal history
export const getWithdrawalHistory = async ({ limit = 10, page = 1, search = '' } = {}) => {
  let query = `?limit=${encodeURIComponent(limit)}&page=${encodeURIComponent(page)}`;
  if (search && search.trim()) {
    query += `&search=${encodeURIComponent(search.trim())}`;
  }
  return apiRequest(`/users/withdrawal${query}`, { method: 'GET' });
};

export const getUserTransactions = async ({ limit = 20, page = 1, type, search = '' } = {}) => {
  let query = `?limit=${encodeURIComponent(limit)}&page=${encodeURIComponent(page)}`;
  if (type && type !== 'all' && type.trim() !== '') {
    query += `&type=${encodeURIComponent(type)}`;
  }
  if (search && search.trim()) {
    query += `&search=${encodeURIComponent(search.trim())}`;
  }
  return apiRequest(`/users/transaction${query}`, { method: 'GET' });
};

// kept above

// Get active investments (grouped by category)
export const getActiveInvestments = async () => {
  return apiRequest('/users/investments/active', { method: 'GET' });
};

// Change user password
export const changePassword = async ({ current_password, password, confirmation_password }) => {
  return apiRequest('/users/change-password', {
    method: 'POST',
    body: JSON.stringify({ current_password, password, confirmation_password }),
  });
};

// Get team invited/active stats
export const getTeamInvited = async () => {
  return apiRequest('/users/team-invited', { method: 'GET' });
};

// Get team invited/active stats for a specific level
export const getTeamInvitedByLevel = async (level) => {
  return apiRequest(`/users/team-invited/${level}`, { method: 'GET' });
};

// Get team member data for a specific level
export const getTeamDataByLevel = async (level, { limit = 10, page = 1, search = '', status } = {}) => {
  let query = `?limit=${encodeURIComponent(limit)}&page=${encodeURIComponent(page)}`;
  if (search && search.trim()) {
    query += `&search=${encodeURIComponent(search.trim())}`;
  }
  if (status && status.trim()) {
    query += `&status=${encodeURIComponent(status.trim())}`;
  }
  return apiRequest(`/users/team-data/${level}${query}`, { method: 'GET' });
};

// Get bonus tasks
export const getBonusTasks = async () => {
  return apiRequest('/users/task', { method: 'GET' });
};

// Submit/claim bonus task
export const submitBonusTask = async (taskId) => {
  return apiRequest('/users/task/submit', {
    method: 'POST',
    body: JSON.stringify({ task_id: taskId }),
  });
};

// Get products with Bearer token from localStorage
export const getProducts = async () => {
  return apiRequest('/products', { method: 'GET' });
};

export async function checkForumStatus() {
  return apiRequest('/users/check-forum', { method: 'GET' });
}

export async function submitForumTestimonial({ image, description }) {
  const token = await getToken();
  const formData = new FormData();
  formData.append('image', image);
  formData.append('description', description);
  const res = await fetch(`${BASE_URL}/users/forum/submit`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      // Do NOT set 'Content-Type' here, let browser set it for FormData
    },
    body: formData,
  });
  if (!res.ok) {
    let msg = 'Gagal submit forum';
    try { msg = (await res.json()).message; } catch { }
    return { success: false, message: msg };
  }
  return await res.json();
}

// Get forum testimonials (testimoni penarikan)
export const getForumTestimonials = async ({ limit = 20, page = 1 } = {}) => {
  let query = `?limit=${encodeURIComponent(limit)}&page=${encodeURIComponent(page)}`;
  return apiRequest(`/users/forum${query}`, { method: 'GET' });
};

// Get spin prize list
export const getSpinPrizeList = async () => {
  return apiRequest('/spin-prize-list', { method: 'GET' });
};

// Spin wheel (POST) - Updated to accept prize code parameter
export const spinWheel = async (prizeCode) => {
  return apiRequest('/users/spin', {
    method: 'POST',
    body: JSON.stringify({ code: prizeCode }),
  });
};

// Get payment by order_id
export const getPaymentByOrderId = async (orderId) => {
  return apiRequest(`/users/payments/${orderId}`, { method: 'GET' });
};

// Create investment
export const createInvestment = async (payload) => {
  return apiRequest('/users/investments', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const registerUser = async (userData) => {
  try {
    const is_app = typeof window !== 'undefined' ? isMobileApp() : false;

    const response = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...userData, is_app })
    });

    const data = await response.json().catch(() => ({}));

    if (response.ok && data.success) {
      // Store tokens and user info
      sessionStorage.setItem('token', data.data.access_token);
      sessionStorage.setItem('access_expire', data.data.access_expire);
      // Store token to Android WebView
      if (data.data.access_token) {
        storeTokenToAndroid(data.data.access_token);
      }
      // store refresh token in cookie
      setCookie('refresh_token', data.data.refresh_token, 30);
      localStorage.setItem('application', JSON.stringify(data.data.application));
      localStorage.setItem('user', JSON.stringify(data.data.user));
      try { window.dispatchEvent(new Event('user-token-changed')); } catch { }
      return { ...data, status: response.status };
    }
    // Return error with status code and data for rate limiting handling
    return {
      success: false,
      message: data.message || 'Registration failed',
      status: response.status,
      data: data.data || null
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Terjadi kesalahan',
      status: 0,
      data: null
    };
  }
};

export const loginUser = async (credentials) => {
  try {
    const is_app = typeof window !== 'undefined' ? isMobileApp() : false;

    const response = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...credentials, is_app })
    });

    const data = await response.json().catch(() => ({}));

    if (response.ok && data.success) {
      // Store tokens and user info
      sessionStorage.setItem('token', data.data.access_token);
      sessionStorage.setItem('access_expire', data.data.access_expire);
      // Store token to Android WebView
      if (data.data.access_token) {
        storeTokenToAndroid(data.data.access_token);
      }
      setCookie('refresh_token', data.data.refresh_token, 30);
      localStorage.setItem('application', JSON.stringify(data.data.application));
      localStorage.setItem('user', JSON.stringify(data.data.user));
      try { window.dispatchEvent(new Event('user-token-changed')); } catch { }
      return { ...data, status: response.status };
    }
    // Return error with status code and data for rate limiting handling
    return {
      success: false,
      message: data.message || 'Login failed',
      status: response.status,
      data: data.data || null
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Terjadi kesalahan',
      status: 0,
      data: null
    };
  }
};

// Logout: send refresh_token from cookie to server to invalidate
export const logoutUser = async () => {
  const refresh_token = getCookie('refresh_token');
  if (!refresh_token) {
    // Clear token from Android WebView even if no refresh token
    clearTokenFromAndroid();
    return { success: false, message: 'No refresh token' };
  }

  try {
    const result = await apiRequest('/logout', {
      method: 'POST',
      body: JSON.stringify({ refresh_token }),
    });
    // Clear token from Android WebView after successful logout
    clearTokenFromAndroid();
    return result;
  } catch (error) {
    // Clear token from Android WebView even if logout fails
    clearTokenFromAndroid();
    throw error;
  }
};

// BANK ACCOUNT MANAGEMENT
// Get all bank accounts for user
export const getBankAccounts = async () => {
  return apiRequest('/users/bank', { method: 'GET' });
};

// Get detail bank account by id
export const getBankAccountById = async (id) => {
  return apiRequest(`/users/bank/${id}`, { method: 'GET' });
};

// Add new bank account
export const addBankAccount = async ({ bank_id, account_number, account_name }) => {
  return apiRequest('/users/bank', {
    method: 'POST',
    body: JSON.stringify({ bank_id, account_number, account_name }),
  });
};

// Edit bank account
export const editBankAccount = async ({ id, bank_id, account_number, account_name }) => {
  return apiRequest('/users/bank', {
    method: 'PUT',
    body: JSON.stringify({ id, bank_id, account_number, account_name }),
  });
};

// Delete bank account
export const deleteBankAccount = async (id) => {
  return apiRequest('/users/bank', {
    method: 'DELETE',
    body: JSON.stringify({ id }),
  });
};

// Get bank list
export const getBankList = async () => {
  return apiRequest('/bank', { method: 'GET' });
};

// Spin wheel v2 (server-driven) - no body, server chooses prize based on auth
export const spinV2 = async () => {
  try {
    return await apiRequest('/users/spin', { method: 'POST' });
  } catch (error) {
    console.error('Error spinning wheel:', error);
    return { success: false, message: error.message || 'Network error' };
  }
};

// Update user profile (name and/or profile image)
export const updateUserProfile = async ({ name, profile }) => {
  const token = await getToken();
  const formData = new FormData();
  if (name) {
    formData.append('name', name);
  }
  if (profile) {
    formData.append('profile', profile);
  }
  const res = await fetch(`${BASE_URL}/users/profile`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      // Do NOT set 'Content-Type' here, let browser set it for FormData
    },
    body: formData,
  });
  if (!res.ok) {
    let msg = 'Gagal memperbarui profile';
    try { msg = (await res.json()).message; } catch { }
    return { success: false, message: msg };
  }
  return await res.json();
};

// Delete user profile image
export const deleteUserProfile = async () => {
  return apiRequest('/users/profile', { method: 'DELETE' });
};

// Forgot Password - Request OTP
export const requestForgotPasswordOTP = async (number) => {
  try {
    const response = await fetch(`${BASE_URL}/auth/forgot-password/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ number })
    });
    const data = await response.json().catch(() => ({}));
    return data;
  } catch (error) {
    return { success: false, message: error.message || 'Gagal meminta OTP' };
  }
};

// Forgot Password - Resend OTP
export const resendForgotPasswordOTP = async (number) => {
  try {
    const response = await fetch(`${BASE_URL}/auth/forgot-password/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ number })
    });
    const data = await response.json().catch(() => ({}));
    return data;
  } catch (error) {
    return { success: false, message: error.message || 'Gagal mengirim ulang OTP' };
  }
};

// Forgot Password - Verify OTP
export const verifyForgotPasswordOTP = async (otp, requestId) => {
  try {
    const response = await fetch(`${BASE_URL}/auth/forgot-password/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ otp, request_id: requestId })
    });
    const data = await response.json().catch(() => ({}));
    return data;
  } catch (error) {
    return { success: false, message: error.message || 'Gagal memverifikasi OTP' };
  }
};

// Forgot Password - Reset Password
export const resetPassword = async (password, confirmPassword, token) => {
  try {
    const response = await fetch(`${BASE_URL}/auth/forgot-password/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, confirm_password: confirmPassword, token })
    });
    const data = await response.json().catch(() => ({}));
    return data;
  } catch (error) {
    return { success: false, message: error.message || 'Gagal mengubah password' };
  }
};

// TRANSFER FUNCTIONS
// Transfer inquiry - check recipient number before transfer
export const transferInquiry = async (number) => {
  try {
    return await apiRequest('/transfer/inquiry', {
      method: 'POST',
      body: JSON.stringify({ number }),
    });
  } catch (error) {
    return { success: false, message: error.message || 'Terjadi kesalahan' };
  }
};

// Execute transfer
export const executeTransfer = async ({ number, amount }) => {
  try {
    return await apiRequest('/transfer', {
      method: 'POST',
      body: JSON.stringify({ number, amount }),
    });
  } catch (error) {
    return { success: false, message: error.message || 'Terjadi kesalahan' };
  }
};

// Get transfer contacts (recent recipients)
export const getTransferContacts = async () => {
  try {
    return await apiRequest('/transfer/contact', { method: 'GET' });
  } catch (error) {
    return { success: false, message: error.message || 'Terjadi kesalahan' };
  }
};

// GIFT FUNCTIONS
// Create gift
export const createGift = async ({ amount, winner_count, distribution_type, recipient_type }) => {
  try {
    return await apiRequest('/gift', {
      method: 'POST',
      body: JSON.stringify({ amount, winner_count, distribution_type, recipient_type }),
    });
  } catch (error) {
    return { success: false, message: error.message || 'Terjadi kesalahan' };
  }
};

// Redeem gift
export const redeemGift = async (code) => {
  try {
    return await apiRequest('/gift/redeem', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  } catch (error) {
    return { success: false, message: error.message || 'Terjadi kesalahan' };
  }
};

// Gift inquiry (no auth required, but we still use apiRequest for consistency)
export const giftInquiry = async (code) => {
  try {
    return await apiRequest(`/gift/inquiry?code=${encodeURIComponent(code)}`, { method: 'GET' });
  } catch (error) {
    return { success: false, message: error.message || 'Terjadi kesalahan' };
  }
};

// Get gift history (gifts created by user)
export const getGiftHistory = async ({ page = 1, limit = 20 } = {}) => {
  try {
    return await apiRequest(`/gift/history?page=${page}&limit=${limit}`, { method: 'GET' });
  } catch (error) {
    return { success: false, message: error.message || 'Terjadi kesalahan' };
  }
};

// Get gift wins (gifts claimed by user)
export const getGiftWins = async ({ page = 1, limit = 20 } = {}) => {
  try {
    return await apiRequest(`/gift/wins?page=${page}&limit=${limit}`, { method: 'GET' });
  } catch (error) {
    return { success: false, message: error.message || 'Terjadi kesalahan' };
  }
};

// Get gift winners
export const getGiftWinners = async (giftId) => {
  try {
    return await apiRequest(`/gift/${giftId}/winners`, { method: 'GET' });
  } catch (error) {
    return { success: false, message: error.message || 'Terjadi kesalahan' };
  }
};