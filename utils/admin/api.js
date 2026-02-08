const BASE_URL = process.env.NEXT_PUBLIC_API_URL + '/admin';

const setAdminToken = (token) => {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem('admin_token', token);
  try {
    window.dispatchEvent(new Event('admin-token-changed'));
  } catch (e) {}
};

const getAdminToken = () => {
  if (typeof window === 'undefined') return '';
  return sessionStorage.getItem('admin_token') || '';
};

const removeAdminToken = () => {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem('admin_token');
  try {
    window.dispatchEvent(new Event('admin-token-changed'));
  } catch (e) {}
};

// Admin info polling state
let adminInfoInterval = null;
const ADMIN_INFO_INTERVAL = 10000; // 10 seconds

export async function adminLogin({ username, password }) {
  const url = `${BASE_URL}/login`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if (data && data.success) {
    if (data.data && data.data.token) {
      setAdminToken(data.data.token);
    }
    if (data.data && data.data.admin) {
      try { localStorage.setItem('admin', JSON.stringify(data.data.admin)); } catch {}
    }
  }
  return data;
}

export async function adminRequest(path, options = {}) {
  const token = getAdminToken();
  const headers = options.headers || {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!headers['Content-Type'] && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  // Try to parse JSON safely
  let data = null;
  try { data = await res.json(); } catch (e) { data = null; }
  if (res.status === 401) {
    // unauthorized: remove token
    removeAdminToken();
  }
  return data;
}

export function logoutAdmin() {
  removeAdminToken();
  try { localStorage.removeItem('admin'); } catch {}
}

export { getAdminToken };

// Fetch admin info from /info endpoint
export async function adminGetInfo() {
  try {
    const data = await adminRequest('/info', { method: 'GET' });
    if (data && data.success && data.data) {
      try { localStorage.setItem('admin_servers', JSON.stringify(data.data.servers || null)); } catch {}
      try { localStorage.setItem('admin_applications', JSON.stringify(data.data.applications || null)); } catch {}
      try { localStorage.setItem('admin_notifications', JSON.stringify(data.data.notifications || null)); } catch {}
        try { window.dispatchEvent(new Event('admin-info-updated')); } catch (e) {}
    }
    return data;
  } catch (err) {
    return { success: false, message: err.message || 'Failed to fetch admin info' };
  }
}

// Start polling admin info every 10 seconds if admin_token exists
export function startAdminInfoPolling() {
  if (typeof window === 'undefined') return;
  if (adminInfoInterval) return; // already running
  const token = getAdminToken();
  if (!token) return;

  // run immediately then set interval
  adminGetInfo().catch(() => {});
  adminInfoInterval = setInterval(() => {
    const t = getAdminToken();
    if (!t) {
      stopAdminInfoPolling();
      try { localStorage.removeItem('admin_servers'); } catch {}
      try { localStorage.removeItem('admin_applications'); } catch {}
      try { localStorage.removeItem('admin_notifications'); } catch {}
      return;
    }
    adminGetInfo().catch(() => {});
  }, ADMIN_INFO_INTERVAL);
}

export function stopAdminInfoPolling() {
  if (adminInfoInterval) {
    clearInterval(adminInfoInterval);
    adminInfoInterval = null;
  }
}
