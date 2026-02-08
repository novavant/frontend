import { clearTokenFromAndroid } from './androidInterface';

export const checkAuth = () => {
  if (typeof window === 'undefined') return false;

  const token = sessionStorage.getItem('token');
  const accessExpire = sessionStorage.getItem('access_expire');

  if (!token || !accessExpire) return false;

  const currentDate = new Date();
  const expiryDate = new Date(accessExpire);

  return currentDate < expiryDate;
};

const deleteCookie = (name) => {
  if (typeof document === 'undefined') return;
  document.cookie = name + '=; Max-Age=0; path=/;';
};

export const redirectToLogin = () => {
  if (typeof window !== 'undefined') {
    // Check if already on login page to prevent unnecessary refresh
    const isOnLoginPage = window.location.pathname === '/login' || 
                          window.location.pathname === '/register' ||
                          sessionStorage.getItem('is_on_login_page') === 'true';
    
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('access_expire');
    deleteCookie('refresh_token');
    // Clear token from Android WebView
    clearTokenFromAndroid();
    
    // Only redirect if not already on login page
    if (!isOnLoginPage) {
      window.location.href = '/login';
    }
  }
};

export const isAuthRoute = (pathname) => {
  const authRoutes = ['/login', '/register'];
  return authRoutes.includes(pathname);
};