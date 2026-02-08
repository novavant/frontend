import { redirectToLogin } from './auth';

export const handleApiResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  
  if (response.status === 401 || 
      (data.message && data.message.toLowerCase().includes('sesi anda telah habis'))) {
    redirectToLogin();
    throw new Error('Session expired');
  }
  
  return data;
};