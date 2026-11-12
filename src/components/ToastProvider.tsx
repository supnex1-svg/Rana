import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastItem {
  id: number;
  type: ToastType;
  title: string;
  message?: string;
  action?: ToastAction;
}

interface ToastApi {
  success: (title: string, message?: string) => number;
  error: (title: string, message?: string, action?: ToastAction) => number;
  info: (title: string, message?: string) => number;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

export const useToast = (): ToastApi => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
};

const STYLES = {
  success: { icon: CheckCircle2, border: 'border-l-green-600', color: 'text-green-700' },
  error: { icon: AlertCircle, border: 'border-l-[#C8202F]', color: 'text-[#C8202F]' },
  info: { icon: Info, border: 'border-l-gray-700', color: 'text-gray-700' },
} as const;

const ToastCard: React.FC<{ item: ToastItem; onDismiss: (id: number) => void }> = ({
  item,
  onDismiss,
}) => {
  const [paused, setPaused] = useState(false);
  const duration = item.type === 'error' ? 8000 : 5000;
  const remaining = useRef(duration);
  const startedAt = useRef(0);
  const close = useCallback(() => onDismiss(item.id), [onDismiss, item.id]);

  // التايمر بيقف لما المستخدم يحط الماوس أو الفوكس على الإشعار
  useEffect(() => {
    if (paused) return;
    startedAt.current = Date.now();
    const id = setTimeout(close, Math.max(remaining.current, 0));
    return () => {
      clearTimeout(id);
      remaining.current -= Date.now() - startedAt.current;
    };
  }, [paused, close]);

  const s = STYLES[item.type];
  const Icon = s.icon;

  return (
    <div
      role={item.type === 'error' ? 'alert' : 'status'}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className={`o4u-toast pointer-events-auto w-full sm:w-[380px] bg-white text-gray-900 rounded-xl border border-gray-200 border-l-4 ${s.border} shadow-xl p-4 flex items-start gap-3`}
    >
      <Icon size={22} className={`${s.color} flex-shrink-0 mt-0.5`} aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold">{item.title}</p>
        {item.message && <p className="text-sm text-gray-700 mt-0.5">{item.message}</p>}
        {item.action && (
          <button
            type="button"
            onClick={() => {
              item.action?.onClick();
              close();
            }}
            className="mt-2 text-sm font-bold text-[#C8202F] underline underline-offset-2 hover:text-red-800"
          >
            {item.action.label}
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={close}
        aria-label="Dismiss notification"
        className="flex-shrink-0 p-1.5 -m-1 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
      >
        <X size={18} aria-hidden="true" />
      </button>
    </div>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((item: Omit<ToastItem, 'id'>) => {
    const id = nextId.current++;
    setToasts((list) => [...list.slice(-3), { ...item, id }]); // أقصى 4 إشعارات
    return id;
  }, []);

  const api = useMemo<ToastApi>(
    () => ({
      success: (title, message) => push({ type: 'success', title, message }),
      error: (title, message, action) => push({ type: 'error', title, message, action }),
      info: (title, message) => push({ type: 'info', title, message }),
      dismiss,
    }),
    [push, dismiss]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-label="Notifications"
        className="fixed z-[1000] bottom-4 left-4 right-4 sm:left-auto sm:right-4 flex flex-col items-stretch sm:items-end gap-3 pointer-events-none"
      >
        {toasts.map((t) => (
          <ToastCard key={t.id} item={t} onDismiss={dismiss} />
        ))}
      </div>
      <style>{`
        @keyframes o4u-toast-in {
          from { opacity: 0; transform: translateY(12px) scale(.98); }
          to   { opacity: 1; transform: none; }
        }
        .o4u-toast { animation: o4u-toast-in .25s ease-out both; }
        @media (prefers-reduced-motion: reduce) { .o4u-toast { animation: none; } }
      `}</style>
    </ToastContext.Provider>
  );
};

export default ToastProvider;