// Android WebView Interface helpers
// These functions handle communication with Android WebView JavaScript Interface

/**
 * Store JWT token to Android WebView persistent storage
 * @param {string} token - JWT access token to store
 */
export const storeTokenToAndroid = (token) => {
  if (typeof window !== 'undefined' && window.Android && typeof window.Android.storeToken === 'function') {
    try {
      window.Android.storeToken(token);
    } catch (error) {
      console.error('Error storing token to Android:', error);
    }
  }
};

/**
 * Clear JWT token from Android WebView persistent storage
 */
export const clearTokenFromAndroid = () => {
  if (typeof window !== 'undefined' && window.Android && typeof window.Android.clearToken === 'function') {
    try {
      window.Android.clearToken();
    } catch (error) {
      console.error('Error clearing token from Android:', error);
    }
  }
};

