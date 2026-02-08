import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { testAndroidAppLinks, logAndroidAppLinksStatus } from '../utils/androidAppLinksTesting';

/**
 * AndroidAppLinksTester Component
 * Development tool untuk testing Android App Links
 * Hanya muncul di development mode
 */
export default function AndroidAppLinksTester() {
  const [testResults, setTestResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Hanya tampilkan di development
  useEffect(() => {
    setIsVisible(process.env.NODE_ENV === 'development');
  }, []);

  const runTests = async () => {
    setIsLoading(true);
    try {
      const results = await testAndroidAppLinks();
      setTestResults(results);
      await logAndroidAppLinksStatus();
    } catch (error) {
      console.error('Error running tests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] rounded-2xl p-4 border border-white/10 shadow-lg max-w-sm">
        <div className="flex items-center gap-2 mb-3">
          <Icon icon="mdi:android" className="w-5 h-5 text-green-400" />
          <h3 className="text-white font-bold text-sm">Android App Links Tester</h3>
        </div>

        <button
          onClick={runTests}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-[#F45D16] to-[#FF6B35] hover:from-[#d74e0f] hover:to-[#F45D16] disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-300 text-sm"
        >
          {isLoading ? 'Testing...' : 'Test App Links'}
        </button>

        {testResults && (
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2">
              <Icon
                icon={testResults.accessibility ? "mdi:check-circle" : "mdi:close-circle"}
                className={`w-4 h-4 ${testResults.accessibility ? 'text-green-400' : 'text-red-400'}`}
              />
              <span className="text-white text-xs">
                assetlinks.json {testResults.accessibility ? 'accessible' : 'not accessible'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Icon
                icon={testResults.structure.valid ? "mdi:check-circle" : "mdi:close-circle"}
                className={`w-4 h-4 ${testResults.structure.valid ? 'text-green-400' : 'text-red-400'}`}
              />
              <span className="text-white text-xs">
                Structure {testResults.structure.valid ? 'valid' : 'invalid'}
              </span>
            </div>

            {testResults.structure.errors.length > 0 && (
              <div className="text-red-400 text-xs">
                Errors: {testResults.structure.errors.length}
              </div>
            )}

            {testResults.structure.warnings.length > 0 && (
              <div className="text-yellow-400 text-xs">
                Warnings: {testResults.structure.warnings.length}
              </div>
            )}

            <div className="text-white/60 text-xs">
              Domain: {testResults.debugInfo.currentDomain}
            </div>

            <div className="text-white/60 text-xs">
              Package: com.novavant.app
            </div>
          </div>
        )}

        <div className="mt-3 text-white/40 text-xs">
          <Icon icon="mdi:information" className="w-3 h-3 inline mr-1" />
          Development only
        </div>
      </div>
    </div>
  );
}
