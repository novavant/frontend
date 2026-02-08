// pages/admin/index.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { getAdminToken } from '../../utils/admin/api';

export default function AdminIndex() {
  const router = useRouter();

  useEffect(() => {
    // Check if admin is authenticated
    const adminToken = getAdminToken ? getAdminToken() : (typeof window !== 'undefined' ? sessionStorage.getItem('admin_token') : null);
    
    if (adminToken) {
      // Redirect to dashboard if authenticated
      router.push('/panel-admin/dashboard');
    } else {
      // Redirect to login if not authenticated
      router.push('/panel-admin/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
      <Head>
        <title>Vla Devs | Admin Portal</title>
        <link rel="icon" type="image/x-icon" href="/vla-logo.png" />
      </Head>

      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400">Redirecting to admin portal...</p>
      </div>
    </div>
  );
}