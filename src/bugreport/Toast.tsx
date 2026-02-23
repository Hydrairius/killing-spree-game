import { useEffect, useState } from 'react';
import './Toast.css';

interface ToastProps {
  message: string;
  variant?: 'success' | 'error' | 'info';
  duration?: number;
  onClose?: () => void;
}

export function Toast({ message, variant = 'success', duration = 5000, onClose }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, duration);
    return () => clearTimeout(t);
  }, [duration, onClose]);

  if (!visible) return null;

  return (
    <div className={`bugreport-toast bugreport-toast-${variant}`} role="alert">
      {message}
    </div>
  );
}
