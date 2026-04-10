import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type TType = 'success' | 'warning' | 'error' | 'info';

interface ToastItem {
  id: string;
  type: TType;
  message: string;
}

interface ToastContextValue {
  show: (message: string, type?: TType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

const ToastItem: React.FC<{ item: ToastItem; onClose: () => void }> = ({ item, onClose }) => {
  const icons = {
    success: <CheckCircle size={18} style={{ color: 'var(--safe)' }} />,
    error: <AlertCircle size={18} style={{ color: 'var(--hazard)' }} />,
    warning: <AlertTriangle size={18} style={{ color: 'var(--warn)' }} />,
    info: <Info size={18} style={{ color: 'var(--cyan)' }} />,
  };

  const borderColors = {
    success: 'var(--safe)',
    error: 'var(--hazard)',
    warning: 'var(--warn)',
    info: 'var(--cyan)',
  };

  const bgColors = {
    success: 'var(--safe-dim)',
    error: 'var(--hazard-dim)',
    warning: 'rgba(255,170,0,0.1)',
    info: 'var(--cyan-dim)',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="flex gap-3 items-start w-80 rounded-lg p-4 shadow-2xl backdrop-blur-xl"
      style={{
        background: bgColors[item.type],
        border: `1px solid ${borderColors[item.type]}`,
      }}
    >
      {icons[item.type]}
      <p className="flex-1 text-sm" style={{ color: 'var(--text-primary)' }}>{item.message}</p>
      <button
        onClick={onClose}
        className="transition-colors duration-150"
        style={{ color: 'var(--text-dim)' }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-dim)')}
      >
        <X size={14} />
      </button>
    </motion.div>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<ToastItem[]>([]);

  const show = useCallback((message: string, type: TType = 'info') => {
    const id = crypto.randomUUID();
    setItems((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setItems((prev) => prev.filter((i) => i.id !== id));
    }, 3000);
  }, []);

  const remove = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed right-4 top-4 z-[80] flex flex-col gap-2">
        <AnimatePresence>
          {items.map((item) => (
            <ToastItem key={item.id} item={item} onClose={() => remove(item.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};