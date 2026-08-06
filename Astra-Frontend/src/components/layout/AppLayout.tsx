import { Bell, Globe, LayoutDashboard, Menu, Radar, Star, Github, Crosshair } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import StarfieldBackground from '@/components/ui/StarfieldBackground';
import NotificationBell from '@/components/ui/NotificationBell';
import { motion, AnimatePresence } from 'framer-motion';

const nav = [
  { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/feed', label: 'Asteroid Feed', Icon: Radar },
  { to: '/watchlist', label: 'Watchlist', Icon: Star },
  { to: '/alerts', label: 'Alerts', Icon: Bell },
  { to: '/orbit', label: '3D View', Icon: Globe },
  { to: '/close-approaches', label: 'Close Approaches', Icon: Crosshair },
];

export default function AppLayout() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="h-screen flex" style={{ background: 'var(--bg-void)' }}>
      <StarfieldBackground />

      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/60 md:hidden"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ── */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-[220px] transition-transform duration-200 md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          background: 'var(--bg-deep)',
          borderRight: '1px solid #ffffff08',
        }}
      >
        {/* Logo */}
        <div className="px-5 pt-6 pb-4">
          <div
            className="text-lg font-bold tracking-wider"
            style={{ color: 'var(--cyan)', textShadow: '0 0 12px rgba(0,212,255,0.3)' }}
          >
            ☄ COSMIC WATCH
          </div>
        </div>

        {/* Nav items */}
        <nav className="px-2 space-y-0.5">
          {nav.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 transition-all duration-150 ${
                  isActive
                    ? 'border-l-2 pl-[10px]'
                    : 'border-l-2 border-l-transparent pl-3'
                }`
              }
              style={({ isActive }) =>
                isActive
                  ? {
                      background: 'var(--cyan-dim)',
                      color: 'var(--cyan)',
                      borderLeftColor: 'var(--cyan)',
                    }
                  : {
                      color: 'var(--text-secondary)',
                    }
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={16} />
                  <span
                    className="text-[14px]"
                    style={{
                      letterSpacing: '0.02em',
                      fontWeight: isActive ? 500 : 400,
                    }}
                  >
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2" style={{ borderTop: '1px solid #ffffff08' }}>
          <div
            className="rounded-md px-3 py-2 text-sm truncate"
            style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)' }}
          >
            {user?.name || 'User'}
          </div>
          <a
            href="https://github.com/Ashutosh-DashAI/Asteroid-Tracker"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm transition-colors duration-150"
            style={{ color: 'var(--text-secondary)', background: 'var(--bg-surface)' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-raised)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--bg-surface)')}
          >
            <Github size={14} />
            <span>View on GitHub</span>
          </a>
          <button
            onClick={handleLogout}
            className="w-full rounded-md px-3 py-2 text-sm transition-colors duration-150"
            style={{
              border: '1px solid var(--hazard-dim)',
              color: 'var(--hazard)',
              background: 'transparent',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--hazard-dim)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* ── Main content area ── */}
      <div
        className="flex flex-col flex-1 md:ml-[220px] h-screen"
        style={{ background: 'var(--bg-void)' }}
      >
        {/* Top header bar */}
        <header
          className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 flex-shrink-0"
          style={{
            background: 'rgba(2,4,8,0.95)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid #ffffff08',
          }}
        >
          <button
            onClick={() => setOpen((v) => !v)}
            className="rounded p-2 md:hidden transition-colors duration-150"
            style={{ color: 'var(--text-secondary)' }}
          >
            <Menu size={20} />
          </button>
          <div className="flex-1" />
          <NotificationBell />
        </header>

        {/* Scrollable content */}
        <main
          className="flex-1 overflow-y-auto p-4 md:p-6"
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--bg-raised) transparent' }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}