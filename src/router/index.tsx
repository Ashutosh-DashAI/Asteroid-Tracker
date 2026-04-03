import React, { Suspense } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import AppLayout from '@/components/layout/AppLayout';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import OrbitalSpinner from '@/components/ui/OrbitalSpinner';

const Dashboard = React.lazy(() => import('@/pages/Dashboard'));
const NEOFeed = React.lazy(() => import('@/pages/NEOFeed'));
const AsteroidDetail = React.lazy(() => import('@/pages/AsteroidDetail'));
const Watchlist = React.lazy(() => import('@/pages/Watchlist'));
const Alerts = React.lazy(() => import('@/pages/Alerts'));
const OrbitViewer = React.lazy(() => import('@/pages/OrbitViewer'));
const Community = React.lazy(() => import('@/pages/Community'));

/**
 * ProtectedRoute - Only allow access if authenticated
 * Shows loading screen during auth initialization
 */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, initializingAuth } = useAuthStore();

  console.log('[ProtectedRoute] Checking auth:', { isAuthenticated, initializingAuth });

  // Still initializing - show loading
  if (initializingAuth) {
    console.log('[ProtectedRoute] Auth initializing, showing loading screen');
    return <OrbitalSpinner fullScreen />;
  }

  // Initialization complete - check authentication
  if (!isAuthenticated) {
    console.log('[ProtectedRoute] Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('[ProtectedRoute] Authenticated, rendering protected content');
  return <>{children}</>;
};

/**
 * AuthRoute - Only allow access if NOT authenticated
 * Prevents authenticated users from accessing login/signup
 */
const AuthRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, initializingAuth } = useAuthStore();

  console.log('[AuthRoute] Checking auth:', { isAuthenticated, initializingAuth });

  // Still initializing - show loading
  if (initializingAuth) {
    console.log('[AuthRoute] Auth initializing, showing loading screen');
    return <OrbitalSpinner fullScreen />;
  }

  // Already authenticated - redirect to dashboard
  if (isAuthenticated) {
    console.log('[AuthRoute] Already authenticated, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  console.log('[AuthRoute] Not authenticated, rendering auth page');
  return <>{children}</>;
};

const transition = { duration: 0.35, ease: 'easeOut' } as const;

/**
 * AnimatedPage - Wraps page components with animations
 */
const AnimatedPage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={transition}
  >
    <Suspense fallback={<OrbitalSpinner fullScreen />}>{children}</Suspense>
  </motion.div>
);

/**
 * AppRouter - Main routing component
 * Handles all route definitions and animations
 */
export default function AppRouter() {
  const location = useLocation();
  const { isAuthenticated, initializingAuth } = useAuthStore();

  console.log('[AppRouter] Render with location:', location.pathname, { isAuthenticated, initializingAuth });

  // Show loading during auth initialization on any page
  if (initializingAuth) {
    console.log('[AppRouter] App initializing, showing loading');
    return <OrbitalSpinner fullScreen />;
  }

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Auth Routes */}
        <Route path="/login" element={<AuthRoute><LoginPage /></AuthRoute>} />
        <Route path="/signup" element={<AuthRoute><SignupPage /></AuthRoute>} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<AnimatedPage><Dashboard /></AnimatedPage>} />
          <Route path="/feed" element={<AnimatedPage><NEOFeed /></AnimatedPage>} />
          <Route path="/asteroid/:id" element={<AnimatedPage><AsteroidDetail /></AnimatedPage>} />
          <Route path="/watchlist" element={<AnimatedPage><Watchlist /></AnimatedPage>} />
          <Route path="/alerts" element={<AnimatedPage><Alerts /></AnimatedPage>} />
          <Route path="/orbit" element={<AnimatedPage><OrbitViewer /></AnimatedPage>} />
          <Route path="/community" element={<AnimatedPage><Community /></AnimatedPage>} />
        </Route>

        {/* Default Routes */}
        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />}
        />
        <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </AnimatePresence>
  );
}
