import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, MessageSquare, Settings, Menu, X, Bell, Search } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import { useSocket } from '@/hooks/useSocket';

/**
 * Main Layout Component
 * Features:
 * - Responsive sidebar navigation
 * - Real-time notifications header
 * - Glassmorphism design
 * - Smooth animations and transitions
 * - Mobile menu toggle
 */
export const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuthStore();
  const { chats } = useChatStore();
  const { isConnected } = useSocket();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [unreadCount, setUnreadCount] = React.useState(0);

  // Calculate unread messages
  useEffect(() => {
    const count = chats.reduce((sum, chat) => sum + chat.unreadCount, 0);
    setUnreadCount(count);
  }, [chats]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Messages', icon: MessageSquare, path: '/dashboard' },
    { label: 'Settings', icon: Settings, path: '/settings' },
  ];

  const sidebarVariants = {
    hidden: { x: -300, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.3 } },
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900/20 to-slate-950 flex">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 lg:hidden z-40"
          />
        )}
      </AnimatePresence>

      <motion.aside
        variants={sidebarVariants}
        initial={window.innerWidth < 1024 ? 'hidden' : 'visible'}
        animate={window.innerWidth < 1024 ? (sidebarOpen ? 'visible' : 'hidden') : 'visible'}
        className="w-64 border-r border-white/10 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-2xl fixed lg:static h-screen z-50 flex flex-col"
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white">
              A
            </div>
            <h1 className="text-2xl font-bold text-white">ASTRA</h1>
          </motion.div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <motion.button
                key={item.path}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
                className={`w-full px-4 py-3 flex gap-3 items-center rounded-lg transition-all duration-300 ${
                  isActive
                    ? 'bg-indigo-500/20 border border-indigo-500/50 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </motion.button>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-white/10 space-y-3">
          <div className="p-3 rounded-lg bg-white/5">
            <p className="text-xs text-white/60">Logged in as</p>
            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full px-4 py-2 flex gap-2 items-center justify-center rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 hover:bg-red-500/20 transition-all duration-300"
          >
            <LogOut size={18} />
            <span className="font-medium">Logout</span>
          </motion.button>
        </div>

        {/* Close button for mobile */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X size={20} className="text-white/70" />
        </button>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col  overflow-hidden">
        {/* Header */}
        <header className="border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent backdrop-blur-2xl px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Menu size={24} className="text-white" />
            </motion.button>

            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-white/30 text-white placeholder-white/40 outline-none transition-all duration-300 backdrop-blur-xl"
                />
              </div>
            </div>

            {/* Status & Notifications */}
            <div className="flex items-center gap-4">
              {/* Connection Status */}
              <div className="flex items-center gap-2">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    isConnected() ? 'bg-green-500' : 'bg-red-500'
                  } animate-pulse`}
                />
                <span className="text-xs text-white/60">{isConnected() ? 'Online' : 'Offline'}</span>
              </div>

              {/* Notifications Bell */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <Bell size={20} className="text-white/70" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </motion.button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
