// lib/auth/useAdminAuth.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function useAdminAuth() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // In a real app, this would check for a valid admin session
    const checkAuth = async () => {
      try {
        // Simulate API call to check authentication
        setTimeout(() => {
          const isAuthenticated = true; // For demo purposes, always authenticated
          
          if (!isAuthenticated && router.pathname !== '/admin/login') {
            router.push('/admin/login');
          } else {
            const demoAdmin = { name: 'Admin User', role: 'superadmin', username: 'admin' };
            setUser(demoAdmin);
            setAdmin(demoAdmin);
            setLoading(false);
          }
        }, 500);
      } catch (error) {
        console.error('Auth check failed:', error);
        if (router.pathname !== '/admin/login') {
          router.push('/admin/login');
        }
      }
    };

    checkAuth();
  }, [router]);

  return { loading, user, admin, setAdmin };
}