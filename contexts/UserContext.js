"use client"; // aman buat Next.js 13+, kalau Next.js 12 ga masalah juga

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { redirectToLogin } from "../utils/auth";
import { getUserInfo, refreshTokens } from "../utils/api";

const UserContext = createContext();
const REFRESH_INTERVAL = 10000; // 10 seconds

export function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchUserInfo = useCallback(async () => {
        // prevent concurrent fetches
        if (fetchUserInfo.isFetching) return;
        fetchUserInfo.isFetching = true;
        
        const isAuthPage = window.location.pathname === '/login' || window.location.pathname === '/register' || window.location.pathname === '/' || window.location.pathname === '/panel-admin-rj';
        const token = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;
        const accessExpire = typeof window !== 'undefined' ? sessionStorage.getItem('access_expire') : null;
        const refreshToken = typeof document !== 'undefined' ? (document.cookie.split('; ').find(c => c.startsWith('refresh_token=')) || '').split('=')[1] : null;

        // Don't show error on auth pages
        // If access token or expiry missing, we cannot proceed
        if (!token || !accessExpire) {
            if (!isAuthPage) {
                setError("No authentication token found");
                redirectToLogin();
            }
            setLoading(false);
            return;
        }

        // Check if token is expired and try to refresh if needed
        let expiryDate;
        try {
            expiryDate = new Date(accessExpire);
        } catch {
            expiryDate = null;
        }
        
        const currentDate = new Date();
        if (!expiryDate || currentDate > expiryDate) {
            // Token expired — attempt refresh only if refresh token exists
            if (!refreshToken) {
                // No refresh token available -> force logout
                if (!isAuthPage) {
                    sessionStorage.removeItem("token");
                    sessionStorage.removeItem("access_expire");
                    try { document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'; } catch {}
                    localStorage.removeItem("user");
                    localStorage.removeItem("application");
                    setUser(null);
                    setApplication(null);
                    redirectToLogin();
                }
                setLoading(false);
                fetchUserInfo.isFetching = false;
                return;
            }
            try {
                // Try to refresh the token first (will update sessionStorage and cookie)
                await refreshTokens();
            } catch (error) {
                // If refresh fails, clear everything and redirect
                if (!isAuthPage) {
                    sessionStorage.removeItem("token");
                    sessionStorage.removeItem("access_expire");
                    try { document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'; } catch {}
                    localStorage.removeItem("user");
                    localStorage.removeItem("application");
                    setUser(null);
                    setApplication(null);
                    redirectToLogin();
                }
                setLoading(false);
                fetchUserInfo.isFetching = false;
                return;
            }
        }

        try {
            const data = await getUserInfo();
            if (data.success) {
                if (data.data.user) {
                    localStorage.setItem("user", JSON.stringify(data.data.user));
                    setUser(data.data.user);
                }
                if (data.data.application) {
                    localStorage.setItem("application", JSON.stringify(data.data.application));
                    setApplication(data.data.application);
                }
                setError(null);
            } else {
                setError(data.message || "Failed to fetch user info");
                if (data.message === 'Invalid token') {
                    sessionStorage.removeItem("token");
                    sessionStorage.removeItem("access_expire");
                    try { document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'; } catch {}
                    localStorage.removeItem("user");
                    localStorage.removeItem("application");
                    setUser(null);
                    setApplication(null);
                    redirectToLogin();
                }
            }
        } catch (err) {
            console.error("Fetch user error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
            fetchUserInfo.isFetching = false;
        }
    }, []);

    // Ensure listeners (storage and custom token event) are active even on auth pages
    useEffect(() => {
        const handleStorage = (e) => {
            if (!e.key) return;
            // react to user/application changes from other tabs
            if (e.key === 'user' || e.key === 'application' || e.key === 'auth') {
                const tokenNow = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;
                const accessExpireNow = typeof window !== 'undefined' ? sessionStorage.getItem('access_expire') : null;
                const refreshTokenNow = typeof document !== 'undefined' ? (document.cookie.split('; ').find(c => c.startsWith('refresh_token=')) || '').split('=')[1] : null;
                let expiryNow;
                try { expiryNow = accessExpireNow ? new Date(accessExpireNow) : null; } catch { expiryNow = null; }
                const now = new Date();

                // Clear everything if any essential auth item is missing or expired
                if (!tokenNow || !accessExpireNow || (expiryNow && now >= expiryNow)) {
                    stopInterval();
                    sessionStorage.removeItem("token");
                    sessionStorage.removeItem("access_expire");
                    try { document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'; } catch {}
                    localStorage.removeItem("user");
                    localStorage.removeItem("application");
                    setUser(null);
                    setApplication(null);
                    redirectToLogin();
                } else {
                    fetchUserInfo();
                    startInterval();
                }
            }
        };

        const handleTokenChanged = () => {
            const tokenNow = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;
            const accessExpireNow = typeof window !== 'undefined' ? sessionStorage.getItem('access_expire') : null;
            const refreshTokenNow = typeof document !== 'undefined' ? (document.cookie.split('; ').find(c => c.startsWith('refresh_token=')) || '').split('=')[1] : null;
            let expiryNow;
            try { expiryNow = accessExpireNow ? new Date(accessExpireNow) : null; } catch { expiryNow = null; }
            const now = new Date();
            if (!tokenNow || !accessExpireNow || (expiryNow && now >= expiryNow)) {
                stopInterval();
                sessionStorage.removeItem("token");
                sessionStorage.removeItem("access_expire");
                try { document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'; } catch {}
                localStorage.removeItem("user");
                localStorage.removeItem("application");
                setUser(null);
                setApplication(null);
                redirectToLogin();
            } else {
                fetchUserInfo();
                startInterval();
            }
        };

        if (typeof window !== 'undefined') {
            window.addEventListener('storage', handleStorage);
            window.addEventListener('user-token-changed', handleTokenChanged);
        }

        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('storage', handleStorage);
                window.removeEventListener('user-token-changed', handleTokenChanged);
            }
        };
    }, [fetchUserInfo]);

    const intervalRef = useRef(null);

    const startInterval = () => {
        if (intervalRef.current) return; // already running
        intervalRef.current = setInterval(async () => {
            // Read from sessionStorage and cookie (refresh_token stored in cookie)
            const tokenNow = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;
            const accessExpireNow = typeof window !== 'undefined' ? sessionStorage.getItem('access_expire') : null;
            const refreshTokenNow = typeof document !== 'undefined' ? (document.cookie.split('; ').find(c => c.startsWith('refresh_token=')) || '').split('=')[1] : null;
            let expiryDateNow;
            try { expiryDateNow = accessExpireNow ? new Date(accessExpireNow) : null; } catch { expiryDateNow = null; }
            const currentDateNow = new Date();

            // If token missing but refresh token exists, try to refresh once
            if ((!tokenNow || !accessExpireNow) && refreshTokenNow) {
                try {
                    await refreshTokens();
                } catch (error) {
                    stopInterval();
                    sessionStorage.removeItem('token');
                    sessionStorage.removeItem('access_expire');
                    try { document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'; } catch {}
                    localStorage.removeItem('user');
                    localStorage.removeItem('application');
                    setUser(null);
                    setApplication(null);
                    redirectToLogin();
                    return;
                }
            }

            // If token present and expired, try refresh
            if (tokenNow && refreshTokenNow && expiryDateNow && currentDateNow >= expiryDateNow) {
                try {
                    await refreshTokens();
                } catch (error) {
                    stopInterval();
                    sessionStorage.removeItem('token');
                    sessionStorage.removeItem('access_expire');
                    try { document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'; } catch {}
                    localStorage.removeItem('user');
                    localStorage.removeItem('application');
                    setUser(null);
                    setApplication(null);
                    redirectToLogin();
                    return;
                }
            }

            // If token and refresh token now available, fetch user info; otherwise logout
            const tokenAfter = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;
            const refreshAfter = typeof document !== 'undefined' ? (document.cookie.split('; ').find(c => c.startsWith('refresh_token=')) || '').split('=')[1] : null;
            if (tokenAfter && refreshAfter) {
                fetchUserInfo();
            } else {
                stopInterval();
                sessionStorage.removeItem('token');
                sessionStorage.removeItem('access_expire');
                try { document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'; } catch {}
                localStorage.removeItem('user');
                localStorage.removeItem('application');
                setUser(null);
                setApplication(null);
                redirectToLogin();
            }
        }, REFRESH_INTERVAL);
    };

    const stopInterval = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    useEffect(() => {
        // Hilangkan pengecekan isAuthPage agar interval tetap berjalan di semua halaman jika token valid
    const storedUser = localStorage.getItem("user");
    const storedApplication = localStorage.getItem("application");
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;
    const accessExpire = typeof window !== 'undefined' ? sessionStorage.getItem('access_expire') : null;
    const refreshToken = typeof document !== 'undefined' ? (document.cookie.split('; ').find(c => c.startsWith('refresh_token=')) || '').split('=')[1] : null;
        let expiryDate;
        try {
            expiryDate = accessExpire ? new Date(accessExpire) : null;
        } catch {
            expiryDate = null;
        }
        const currentDate = new Date();

        // Jika token dan access_expire valid, start fetch + interval walau storedUser kosong
    if (token && accessExpire && refreshToken && expiryDate && currentDate < expiryDate) {
            if (storedUser) {
                try { setUser(JSON.parse(storedUser)); } catch { setUser(null); }
            }
            if (storedApplication) {
                try { setApplication(JSON.parse(storedApplication)); } catch { setApplication(null); }
            }
            setLoading(false);

            // Fetch data dari API untuk sync user info dan refresh token
            const initializeUser = async () => {
                try {
                    await fetchUserInfo();
                } catch (error) {
                    console.error("Failed to initialize user:", error);
                }
            };
            initializeUser();

            // start managed interval
            startInterval();
        } else {
            setUser(null);
            setApplication(null);
            setLoading(false);
        }

        // Listen for storage changes (other tabs or manual edits)
        const handleStorage = (e) => {
            if (!e.key) return;
            
            // Don't do anything if already on login page
            const isAuthPage = typeof window !== 'undefined' && 
                (window.location.pathname === '/login' || 
                 window.location.pathname === '/register' || 
                 window.location.pathname === '/' ||
                 sessionStorage.getItem('is_on_login_page') === 'true');
            
            if (isAuthPage) {
                return; // Don't trigger redirect or fetch if on auth page
            }
            
            if (e.key === 'token' || e.key === 'access_expire' || e.key === 'refresh_token') {
                const tokenNow = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;
                const accessExpireNow = typeof window !== 'undefined' ? sessionStorage.getItem('access_expire') : null;
                let expiryNow;
                try { expiryNow = accessExpireNow ? new Date(accessExpireNow) : null; } catch { expiryNow = null; }
                const now = new Date();
                if (!tokenNow || !accessExpireNow || !expiryNow || now >= expiryNow) {
                    // token removed/expired
                    stopInterval();
                    sessionStorage.removeItem("token");
                    sessionStorage.removeItem("access_expire");
                    try { document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'; } catch {}
                    localStorage.removeItem("user");
                    localStorage.removeItem("application");
                    setUser(null);
                    setApplication(null);
                    // Only redirect if not already on login page
                    if (!isAuthPage) {
                        redirectToLogin();
                    }
                } else {
                    // token set/updated -> trigger immediate fetch and ensure interval running
                    fetchUserInfo();
                    startInterval();
                }
            }
        };

        // Custom event listener for same-tab token updates (storage event doesn't fire in same tab)
        const handleTokenChanged = () => {
            // Don't do anything if already on login page
            const isAuthPage = typeof window !== 'undefined' && 
                (window.location.pathname === '/login' || 
                 window.location.pathname === '/register' || 
                 window.location.pathname === '/' ||
                 sessionStorage.getItem('is_on_login_page') === 'true');
            
            if (isAuthPage) {
                return; // Don't trigger redirect or fetch if on auth page
            }
            
            const tokenNow = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;
            const accessExpireNow = typeof window !== 'undefined' ? sessionStorage.getItem('access_expire') : null;
            let expiryNow;
            try { expiryNow = accessExpireNow ? new Date(accessExpireNow) : null; } catch { expiryNow = null; }
            const now = new Date();
            if (!tokenNow || !accessExpireNow || !expiryNow || now >= expiryNow) {
                stopInterval();
                sessionStorage.removeItem("token");
                sessionStorage.removeItem("access_expire");
                try { document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'; } catch {}
                localStorage.removeItem("user");
                localStorage.removeItem("application");
                setUser(null);
                setApplication(null);
                // Only redirect if not already on login page
                if (!isAuthPage) {
                    redirectToLogin();
                }
            } else {
                fetchUserInfo();
                startInterval();
            }
        };

        if (typeof window !== 'undefined') {
            window.addEventListener('storage', handleStorage);
            window.addEventListener('user-token-changed', handleTokenChanged);
        }

        // Cleanup on unmount
        return () => {
            stopInterval();
            if (typeof window !== 'undefined') {
                window.removeEventListener('storage', handleStorage);
                window.removeEventListener('user-token-changed', handleTokenChanged);
            }
        };
    }, [fetchUserInfo]);

    const refreshUser = useCallback(() => {
        setLoading(true);
        return fetchUserInfo();
    }, [fetchUserInfo]);

    return (
        <UserContext.Provider value={{ 
            user, 
            setUser, 
            application,
            setApplication,
            loading, 
            error, 
            refreshUser 
        }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
}
