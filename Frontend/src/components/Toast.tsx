import React, { createContext, useCallback, useContext, useState } from 'react';

interface ToastMessage {
  id: string;
  text: string;
}

const ToastContext = createContext<{ show: (text: string) => void } | undefined>(undefined);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const show = useCallback((text: string) => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts(t => [...t, { id, text }]);
    // remove after 3.5s
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div style={{ position: 'fixed', right: 16, bottom: 16, zIndex: 9999 }}>
        {toasts.map(t => (
          <div key={t.id} className="mb-2 px-3 py-2 bg-gray-800 text-white rounded shadow-lg max-w-xs">
            {t.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;
