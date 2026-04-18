// src/components/ui/Toast.tsx
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface ToastItem {
  id:      number;
  message: string;
  type:    'success' | 'error' | 'info';
  dying:   boolean;
}

interface ToastCtx {
  success: (msg: string) => void;
  error:   (msg: string) => void;
  info:    (msg: string) => void;
}

const Ctx = createContext<ToastCtx>({ success: () => {}, error: () => {}, info: () => {} });

let _id = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const add = useCallback((message: string, type: ToastItem['type']) => {
    const id = ++_id;
    setToasts(prev => [...prev, { id, message, type, dying: false }]);

    // Mark dying after 2.8s, remove at 3s
    setTimeout(() => setToasts(prev => prev.map(t => t.id === id ? { ...t, dying: true } : t)), 2800);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3050);
  }, []);

  const icons = { success: '✓', error: '✕', info: 'i' };

  return (
    <Ctx.Provider value={{
      success: (m) => add(m, 'success'),
      error:   (m) => add(m, 'error'),
      info:    (m) => add(m, 'info'),
    }}>
      {children}

      {/* Toast container */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`toast toast-${t.type} ${t.dying ? 'toast-out' : ''} pointer-events-auto`}
          >
            <span className="w-5 h-5 rounded-full bg-white/25 flex items-center justify-center text-xs font-bold flex-shrink-0">
              {icons[t.type]}
            </span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useToast() {
  return useContext(Ctx);
}
