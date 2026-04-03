import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import AppRouter from '@/router';
import { ToastProvider } from '@/context/ToastContext';
import OrbitalSpinner from '@/components/ui/OrbitalSpinner';

/**
 * Main App Component
 * - Initializes auth state on startup
 * - Shows loading screen during initialization
 * - Passes rendered router only after auth check completes
 */
function App() {
  const { hydrateUser, initializingAuth } = useAuthStore();

  // Initialize auth state on component mount
  useEffect(() => {
    console.log('[App] Mounting - starting auth hydration');
    hydrateUser();
  }, [hydrateUser]);

  return (
    <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <ToastProvider>
        {/* Show loading screen during auth initialization */}
        {initializingAuth ? (
          <OrbitalSpinner fullScreen />
        ) : (
          <AppRouter />
        )}
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
