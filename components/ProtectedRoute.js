// components/ProtectedRoute.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated using sessionStorage
    if (typeof window === 'undefined') return;
    const token = sessionStorage.getItem('token');
    const accessExpire = sessionStorage.getItem('access_expire');
    const user = localStorage.getItem('user');

    if (!token || !accessExpire || !user) {
      router.push('/login');
      return;
    }

    const now = new Date();
    const expiry = new Date(accessExpire);
    if (now >= expiry) {
      router.push('/login');
      return;
    }

    setIsAuthenticated(true);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return isAuthenticated ? children : null;
}