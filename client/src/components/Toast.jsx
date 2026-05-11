import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const ToastContext = createContext(null);
let _id = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((message, type = 'info', duration = 3500) => {
    const id = ++_id;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);

  const dismiss = useCallback(id => setToasts(prev => prev.filter(t => t.id !== id)), []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="fixed top-20 right-4 z-[999] flex flex-col gap-2 w-80 pointer-events-none">
        {toasts.map(t => <ToastItem key={t.id} toast={t} onDismiss={dismiss} />)}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);

  const cfg = {
    success: { border: 'border-green-500/30', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>, cls: 'text-green-400' },
    error:   { border: 'border-red-500/30',   icon: <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>, cls: 'text-red-400' },
    info:    { border: 'border-blue-500/30',   icon: <><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></>, cls: 'text-blue-400' },
  };
  const { border, icon, cls } = cfg[toast.type] || cfg.info;

  return (
    <div className={`pointer-events-auto flex items-start gap-3 bg-cinema-card border ${border}
      rounded-xl px-4 py-3 shadow-xl transition-all duration-300
      ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
           className={`w-4 h-4 mt-0.5 flex-shrink-0 ${cls}`}>{icon}</svg>
      <p className="flex-1 text-cinema-text text-sm leading-snug">{toast.message}</p>
      <button onClick={() => onDismiss(toast.id)}
              className="flex-shrink-0 text-cinema-muted hover:text-cinema-text transition-colors mt-0.5">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be inside ToastProvider');
  return ctx;
}
