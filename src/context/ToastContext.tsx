import React, { createContext, useContext, useMemo, useState } from 'react';
import Toast from '@/components/ui/Toast';

type TType = 'success' | 'warning' | 'error' | 'info';
type Item = { id: string; type: TType; message: string; actionLabel?: string; onAction?: () => void };
const Ctx = createContext({ show: (_m: string, _t: TType = 'info', _a?: Item['actionLabel'], _o?: Item['onAction']) => {} });

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<Item[]>([]);
  const show = (message: string, type: TType = 'info', actionLabel?: string, onAction?: () => void) =>
    setItems((s) => [...s, { id: crypto.randomUUID(), type, message, actionLabel, onAction }]);
  const remove = (id: string) => setItems((s) => s.filter((i) => i.id !== id));
  const value = useMemo(() => ({ show }), []);
  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-[80] flex w-80 flex-col gap-2">
        {items.map((i) => <Toast key={i.id} {...i} onClose={() => remove(i.id)} />)}
      </div>
    </Ctx.Provider>
  );
};

export const useToast = () => useContext(Ctx);
