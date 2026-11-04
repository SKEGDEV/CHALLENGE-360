import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import clsx from 'clsx';
import styles from './Toast.module.scss';

interface ToastContextValue {
  showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const showToast = useCallback((next: string) => {
    setMessage(next);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setMessage(null), 2400);
  }, []);

  return (
    <ToastContext value={{ showToast }}>
      {children}
      <div className={clsx(styles.toast, message && styles.show)} role="status" aria-live="polite">
        {message}
      </div>
    </ToastContext>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
