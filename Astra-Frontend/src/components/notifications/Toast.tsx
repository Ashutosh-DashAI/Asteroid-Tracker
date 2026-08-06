import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import type { ToastNotification, NotificationType } from '@/types';

interface NotificationProps {
  notification: ToastNotification;
  onClose: (id: string) => void;
}

/**
 * Individual Toast Notification Component
 */
const Toast: React.FC<NotificationProps> = ({ notification, onClose }) => {
  React.useEffect(() => {
    const duration = notification.duration || 3000;
    if (duration > 0) {
      const timer = setTimeout(() => onClose(notification.id), duration);
      return () => clearTimeout(timer);
    }
  }, [notification.id, notification.duration, onClose]);

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} className="text-green-400" />;
      case 'error':
        return <AlertCircle size={20} className="text-red-400" />;
      case 'warning':
        return <AlertCircle size={20} className="text-yellow-400" />;
      default:
        return <Info size={20} className="text-blue-400" />;
    }
  };

  const getBgColor = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return 'bg-green-500/20 border-green-500/50';
      case 'error':
        return 'bg-red-500/20 border-red-500/50';
      case 'warning':
        return 'bg-yellow-500/20 border-yellow-500/50';
      default:
        return 'bg-blue-500/20 border-blue-500/50';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, x: 100 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, y: -20, x: 100 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className={`backdrop-blur-2xl border rounded-lg p-4 flex gap-3 items-start ${getBgColor(
        notification.type
      )} max-w-md shadow-2xl`}
    >
      {getIcon(notification.type)}
      <div className="flex-1 min-w-0">
        {notification.title && (
          <p className="font-semibold text-white text-sm">{notification.title}</p>
        )}
        <p className="text-white/80 text-sm break-words">{notification.message}</p>
      </div>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onClose(notification.id)}
        className="flex-shrink-0 text-white/60 hover:text-white transition-colors p-1"
      >
        <X size={16} />
      </motion.button>
    </motion.div>
  );
};

interface ToastContainerProps {
  notifications: ToastNotification[];
  onRemove: (id: string) => void;
}

/**
 * Toast Notification Container Component
 * Displays multiple toasts with smooth animations
 */
export const ToastContainer: React.FC<ToastContainerProps> = ({
  notifications,
  onRemove,
}) => {
  return (
    <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <div key={notification.id} className="pointer-events-auto">
            <Toast notification={notification} onClose={onRemove} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};

/**
 * Notification Store Hook
 * Manages toast notifications globally
 */
export const useToast = () => {
  const [notifications, setNotifications] = React.useState<ToastNotification[]>([]);

  const addNotification = (
    type: NotificationType = 'info',
    message: string,
    title?: string,
    duration = 3000
  ): string => {
    const id = Math.random().toString(36).substr(2, 9);
    const notification: ToastNotification = {
      id,
      type,
      message,
      title,
      duration,
    };

    setNotifications((prev) => [...prev, notification]);
    return id;
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const success = (message: string, title?: string, duration = 3000) => {
    return addNotification('success', message, title, duration);
  };

  const error = (message: string, title = 'Error', duration = 4000) => {
    return addNotification('error', message, title, duration);
  };

  const warning = (message: string, title = 'Warning', duration = 3500) => {
    return addNotification('warning', message, title, duration);
  };

  const info = (message: string, title?: string, duration = 3000) => {
    return addNotification('info', message, title, duration);
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    success,
    error,
    warning,
    info,
  };
};

/**
 * Context for Toast Notifications
 */
export const ToastContext = React.createContext<ReturnType<typeof useToast> | null>(null);

export const useNotifications = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useNotifications must be used within a ToastProvider');
  }
  return context;
};

/**
 * Toast Provider Component
 */
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const toast = useToast();

  return (
    <ToastContext.Provider value={toast}>
      <ToastContainer
        notifications={toast.notifications}
        onRemove={toast.removeNotification}
      />
      {children}
    </ToastContext.Provider>
  );
};

export default Toast;
