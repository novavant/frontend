/**
 * Utility functions for detecting mobile app environment and device types
 */

/**
 * Detect if the current environment is a mobile app (TWA/WebView)
 * @returns {boolean} True if running in mobile app
 */
export const isMobileApp = () => {
  if (typeof window === 'undefined') return false;

  const userAgent = navigator.userAgent.toLowerCase();

  // Check for TWA (Trusted Web Activity) indicators
  const isTWA = userAgent.includes('wv') || // WebView
    userAgent.includes('version/') && userAgent.includes('chrome/') && !userAgent.includes('edg/') || // Chrome WebView
    window.navigator.standalone === true || // iOS standalone
    window.matchMedia('(display-mode: standalone)').matches; // PWA standalone

  // Check for specific app indicators
  const isInApp = userAgent.includes('novavant') || // Custom app user agent
    userAgent.includes('mobile app') ||
    document.referrer.includes('android-app://') ||
    document.referrer.includes('ios-app://');

  return isTWA || isInApp;
};

/**
 * Detect if the device is iOS
 * @returns {boolean} True if iOS device
 */
export const isIOS = () => {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

/**
 * Detect if the device is Android
 * @returns {boolean} True if Android device
 */
export const isAndroid = () => {
  if (typeof window === 'undefined') return false;
  return /Android/.test(navigator.userAgent);
};

/**
 * Detect if the device is desktop
 * @returns {boolean} True if desktop device
 */
export const isDesktop = () => {
  if (typeof window === 'undefined') return false;
  return !isIOS() && !isAndroid();
};

/**
 * Detect if app is installed (Android)
 * @returns {Promise<boolean>} True if app is installed
 */
export const isAndroidAppInstalled = async () => {
  if (typeof window === 'undefined') return false;
  if (!isAndroid()) return false;

  try {
    // Try to create intent for the app
    // Fixed package name untuk Nova Vant TWA
    //const intent = `intent://${window.location.host}${window.location.pathname}#Intent;scheme=https;package=com.novavant.app;end`;

    // Create a temporary link to test if app can handle the intent
    const testLink = document.createElement('a');
    testLink.href = intent;
    testLink.style.display = 'none';
    document.body.appendChild(testLink);

    // Try to trigger the intent
    testLink.click();

    // Clean up
    document.body.removeChild(testLink);

    // If we get here, the app might be installed
    // We'll use a timeout to detect if the page becomes hidden (app opened)
    return new Promise((resolve) => {
      let resolved = false;

      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          resolve(false); // Assume not installed if no response
        }
      }, 1000);

      // Listen for page visibility change (app might have opened)
      const handleVisibilityChange = () => {
        if (document.hidden && !resolved) {
          resolved = true;
          clearTimeout(timeout);
          document.removeEventListener('visibilitychange', handleVisibilityChange);
          resolve(true);
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);

      // Also listen for blur event
      const handleBlur = () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          window.removeEventListener('blur', handleBlur);
          document.removeEventListener('visibilitychange', handleVisibilityChange);
          resolve(true);
        }
      };

      window.addEventListener('blur', handleBlur);
    });
  } catch (error) {
    console.log('Error checking Android app installation:', error);
    return false;
  }
};

/**
 * Detect if PWA is installed (iOS)
 * @returns {boolean} True if PWA is installed
 */
export const isIOSAppInstalled = () => {
  if (typeof window === 'undefined') return false;
  if (!isIOS()) return false;

  // Check if running in standalone mode
  return window.navigator.standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches;
};

/**
 * Check if app is installed (cross-platform)
 * @returns {Promise<boolean>} True if app is installed
 */
export const isAppInstalled = async () => {
  if (isMobileApp()) return true; // Already in app

  if (isAndroid()) {
    return await isAndroidAppInstalled();
  } else if (isIOS()) {
    return isIOSAppInstalled();
  }

  return false;
};

/**
 * Get mobile app detection info
 * @returns {object} Detection information
 */
export const getMobileAppInfo = () => {
  if (typeof window === 'undefined') {
    return {
      isMobileApp: false,
      isIOS: false,
      isAndroid: false,
      isDesktop: false,
      userAgent: '',
      referrer: '',
      displayMode: 'browser'
    };
  }

  const userAgent = navigator.userAgent;
  const referrer = document.referrer;
  const displayMode = window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser';

  return {
    isMobileApp: isMobileApp(),
    isIOS: isIOS(),
    isAndroid: isAndroid(),
    isDesktop: isDesktop(),
    userAgent,
    referrer,
    displayMode,
    isStandalone: window.navigator.standalone === true
  };
};

/**
 * Check if PWA is installable
 * @returns {boolean} True if PWA can be installed
 */
export const isPWAInstallable = () => {
  if (typeof window === 'undefined') return false;

  // Skip if already in mobile app
  if (isMobileApp()) return false;

  // Check if already installed
  if (window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true) {
    return false;
  }

  return true;
};
