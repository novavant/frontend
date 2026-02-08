/**
 * Android App Links Testing Utility
 * Helper functions untuk testing dan debugging Android App Links
 */

/**
 * Test if assetlinks.json is accessible
 * @param {string} domain - Domain to test (optional, defaults to current domain)
 * @returns {Promise<boolean>} True if accessible
 */
export const testAssetLinksAccessibility = async (domain = null) => {
  try {
    const testDomain = domain || window.location.origin;
    const url = `${testDomain}/.well-known/assetlinks.json`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ assetlinks.json accessible:', data);
      return true;
    } else {
      console.error('❌ assetlinks.json not accessible:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ Error testing assetlinks.json:', error);
    return false;
  }
};

/**
 * Validate assetlinks.json structure
 * @param {Object} data - Parsed JSON data
 * @returns {Object} Validation result
 */
export const validateAssetLinksStructure = (data) => {
  const errors = [];
  const warnings = [];

  if (!Array.isArray(data)) {
    errors.push('Root must be an array');
    return { valid: false, errors, warnings };
  }

  if (data.length === 0) {
    errors.push('Array cannot be empty');
    return { valid: false, errors, warnings };
  }

  data.forEach((item, index) => {
    // Check required fields
    if (!item.relation) {
      errors.push(`Item ${index}: Missing 'relation' field`);
    } else if (!Array.isArray(item.relation)) {
      errors.push(`Item ${index}: 'relation' must be an array`);
    } else if (!item.relation.includes('delegate_permission/common.handle_all_urls')) {
      warnings.push(`Item ${index}: Missing 'delegate_permission/common.handle_all_urls' relation`);
    }

    if (!item.target) {
      errors.push(`Item ${index}: Missing 'target' field`);
    } else {
      if (!item.target.namespace) {
        errors.push(`Item ${index}: Missing 'target.namespace' field`);
      } else if (item.target.namespace !== 'android_app') {
        errors.push(`Item ${index}: 'target.namespace' must be 'android_app'`);
      }

      if (!item.target.package_name) {
        errors.push(`Item ${index}: Missing 'target.package_name' field`);
      } else if (typeof item.target.package_name !== 'string') {
        errors.push(`Item ${index}: 'target.package_name' must be a string`);
      }

      if (!item.target.sha256_cert_fingerprints) {
        errors.push(`Item ${index}: Missing 'target.sha256_cert_fingerprints' field`);
      } else if (!Array.isArray(item.target.sha256_cert_fingerprints)) {
        errors.push(`Item ${index}: 'target.sha256_cert_fingerprints' must be an array`);
      } else if (item.target.sha256_cert_fingerprints.length === 0) {
        errors.push(`Item ${index}: 'target.sha256_cert_fingerprints' cannot be empty`);
      } else {
        // Validate fingerprint format
        item.target.sha256_cert_fingerprints.forEach((fingerprint, fpIndex) => {
          if (typeof fingerprint !== 'string') {
            errors.push(`Item ${index}: Fingerprint ${fpIndex} must be a string`);
          } else if (!/^[0-9A-F:]{95}$/.test(fingerprint)) {
            warnings.push(`Item ${index}: Fingerprint ${fpIndex} format may be incorrect (should be 95 characters with colons)`);
          }
        });
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Get Android App Links info for debugging
 * @returns {Object} Debug information
 */
export const getAndroidAppLinksDebugInfo = () => {
  const info = {
    currentDomain: window.location.origin,
    userAgent: navigator.userAgent,
    isAndroid: /Android/.test(navigator.userAgent),
    isMobileApp: false,
    assetLinksUrl: `${window.location.origin}/.well-known/assetlinks.json`,
    timestamp: new Date().toISOString()
  };

  // Check if running in mobile app
  const userAgent = navigator.userAgent.toLowerCase();
  info.isMobileApp = userAgent.includes('wv') ||
    userAgent.includes('version/') && userAgent.includes('chrome/') && !userAgent.includes('edg/') ||
    window.navigator.standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches;

  return info;
};

/**
 * Test Android App Links functionality
 * @returns {Promise<Object>} Test results
 */
export const testAndroidAppLinks = async () => {
  const results = {
    accessibility: false,
    structure: { valid: false, errors: [], warnings: [] },
    debugInfo: getAndroidAppLinksDebugInfo(),
    timestamp: new Date().toISOString()
  };

  try {
    // Test accessibility
    results.accessibility = await testAssetLinksAccessibility();

    if (results.accessibility) {
      // Test structure
      const response = await fetch('/.well-known/assetlinks.json');
      const data = await response.json();
      results.structure = validateAssetLinksStructure(data);
    }

  } catch (error) {
    console.error('Error testing Android App Links:', error);
    results.error = error.message;
  }

  return results;
};

/**
 * Generate test URL for Android App Links
 * @param {string} packageName - Android package name
 * @param {string} domain - Domain to test
 * @returns {string} Test URL
 */
export const generateTestUrl = (packageName = 'com.novavant.app', domain = null) => {
  const testDomain = domain || window.location.origin;
  return `https://yourdomain.com?test_app_links=true&package=${packageName}&domain=${testDomain}`;
};

/**
 * Log Android App Links status for debugging
 */
export const logAndroidAppLinksStatus = async () => {
  console.group('🔗 Android App Links Debug Info');

  const debugInfo = getAndroidAppLinksDebugInfo();
  console.log('📱 Device Info:', debugInfo);

  const testResults = await testAndroidAppLinks();
  console.log('🧪 Test Results:', testResults);

  if (testResults.accessibility) {
    console.log('✅ assetlinks.json is accessible');
  } else {
    console.log('❌ assetlinks.json is not accessible');
  }

  if (testResults.structure.valid) {
    console.log('✅ assetlinks.json structure is valid');
  } else {
    console.log('❌ assetlinks.json structure has errors:', testResults.structure.errors);
  }

  if (testResults.structure.warnings.length > 0) {
    console.log('⚠️ Warnings:', testResults.structure.warnings);
  }

  console.groupEnd();

  return testResults;
};
