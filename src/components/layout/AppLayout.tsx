import { Bell, Globe, LayoutDashboard, Menu, MessageSquare, Radar, Star, Github } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import StarfieldBackground from '@/components/ui/StarfieldBackground';
import DataTicker from '@/components/ui/DataTicker';
import NotificationBell from '@/components/ui/NotificationBell';
import { useQuery } from '@tanstack/react-query';
import { getFeed } from '@/api/neo.api';

const nav = [
  { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/feed', label: 'Asteroid Feed', Icon: Radar },
  { to: '/watchlist', label: 'Watchlist', Icon: Star },
  { to: '/alerts', label: 'Alerts', Icon: Bell },
  { to: '/orbit', label: '3D View', Icon: Globe },
  { to: '/community', label: 'Community', Icon: MessageSquare },
];

export default function AppLayout() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuthStore();
  const { data } = useQuery({ queryKey: ['ticker-feed'], queryFn: () => getFeed({ limit: 15 }) });
  const ticker = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];

  const handleLogout = async () => {
    console.log('[AppLayout] Logging out');
    await logout();
    console.log('[AppLayout] Logout complete, redirecting to login');
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <StarfieldBackground />
      <aside className={`glass-card fixed bottom-0 left-0 top-0 z-40 w-60 p-4 transition ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="mb-6 text-xl font-bold text-cyan-300">☄ COSMIC WATCH</div>
        <div className="space-y-2">
          {nav.map(({ to, label, Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `flex items-center gap-2 rounded-lg px-3 py-2 ${isActive ? 'bg-cyan-400/15 text-cyan-300' : 'hover:bg-white/5'}`}>
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <div className="mb-2 rounded-lg bg-white/5 p-2 text-sm">
            {user?.name || 'Ashutosh Dash'}
          </div>
          <a
            href="https://github.com/Ashutosh-DashAI/Asteroid-Tracker"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm text-slate-300 mb-2"
          >
            <Github size={16} />
            <span>View on GitHub</span>
          </a>
          <button
            onClick={handleLogout}
            className="w-full rounded-lg border border-red-400/30 py-2 text-red-300 hover:bg-red-400/10 transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>
      <div className="flex flex-col flex-1 md:pl-60 min-h-screen">
        <div className="sticky top-0 z-30 border-b border-cyan-400/10 bg-[#0a0a0f]/95 px-3 py-3 backdrop-blur flex-shrink-0">
          <div className="mb-2 flex items-center justify-between">
            <button onClick={() => setOpen((v) => !v)} className="rounded p-2 hover:bg-white/10 md:hidden"><Menu /></button>
            <NotificationBell />
          </div>
          <DataTicker items={ticker} />
        </div>
        <div className="flex-1 p-4 md:p-6 overflow-y-auto"><Outlet /></div>
      </div>
    </div>
  );
}
