import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import AppRouter from '@/router';
import { ToastProvider } from '@/context/ToastContext';

/**
 * Main App Component
 * Handles routing and global providers
 */
function App() {
  const { hydrateUser } = useAuthStore();

  // Hydrate user from localStorage on mount
  React.useEffect(() => {
    hydrateUser();
  }, [hydrateUser]);

  return (
    <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <ToastProvider>
        <AppRouter />
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
