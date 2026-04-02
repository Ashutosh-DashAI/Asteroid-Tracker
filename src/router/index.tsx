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

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const AuthRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>;
};

const transition = { duration: 0.35, ease: 'easeOut' } as const;
const AnimatedPage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={transition}>
    <Suspense fallback={<OrbitalSpinner fullScreen />}>{children}</Suspense>
  </motion.div>
);

export default function AppRouter() {
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<AuthRoute><LoginPage /></AuthRoute>} />
        <Route path="/signup" element={<AuthRoute><SignupPage /></AuthRoute>} />
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<AnimatedPage><Dashboard /></AnimatedPage>} />
          <Route path="/neo" element={<AnimatedPage><NEOFeed /></AnimatedPage>} />
          <Route path="/neo/:nasaId" element={<AnimatedPage><AsteroidDetail /></AnimatedPage>} />
          <Route path="/watchlist" element={<AnimatedPage><Watchlist /></AnimatedPage>} />
          <Route path="/alerts" element={<AnimatedPage><Alerts /></AnimatedPage>} />
          <Route path="/orbit" element={<AnimatedPage><OrbitViewer /></AnimatedPage>} />
          <Route path="/community" element={<AnimatedPage><Community /></AnimatedPage>} />
        </Route>
        <Route path="/" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AnimatePresence>
  );
}
