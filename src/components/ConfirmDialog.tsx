import React, { createContext, useCallback, useContext, useEffect, useId, useRef, useState } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

export const useConfirm = (): ConfirmFn => {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used inside <ConfirmProvider>');
  return ctx;
};

const Dialog: React.FC<{ options: ConfirmOptions; onClose: (result: boolean) => void }> = ({
  options,
  onClose,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descId = useId();
  const danger = options.variant === 'danger';

  // فوكس على "إلغاء" (الخيار الآمن) + قفل الاسكرول + إرجاع الفوكس لما يقفل
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    cancelRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      previous?.focus?.();
    };
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onClose(false);
      return;
    }
    if (e.key !== 'Tab') return;
    const nodes = panelRef.current?.querySelectorAll<HTMLElement>('button:not([disabled])');
    if (!nodes || nodes.length === 0) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose(false);
      }}
    >
      <div
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={options.message ? descId : undefined}
        onKeyDown={onKeyDown}
        className="o4u-dialog w-full max-w-md bg-white text-[#171717] rounded-2xl shadow-2xl p-6"
      >
        <div className="flex items-start gap-4">
          {danger && (
            <span className="w-11 h-11 rounded-full bg-red-100 text-[#C8202F] flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={22} aria-hidden="true" />
            </span>
          )}
          <div>
            <h2 id={titleId} className="text-lg font-bold">
              {options.title}
            </h2>
            {options.message && (
              <p id={descId} className="mt-1 text-sm text-gray-700 leading-relaxed">
                {options.message}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <button
            ref={cancelRef}
            type="button"
            onClick={() => onClose(false)}
            className="px-5 py-3 rounded-xl border border-gray-300 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors min-h-[44px]"
          >
            {options.cancelLabel ?? 'Cancel'}
          </button>
          <button
            type="button"
            onClick={() => onClose(true)}
            className={`px-5 py-3 rounded-xl text-sm font-bold text-white transition-colors min-h-[44px] ${
              danger ? 'bg-[#C8202F] hover:bg-red-700' : 'bg-[#171717] hover:bg-black'
            }`}
          >
            {options.confirmLabel ?? 'Confirm'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes o4u-dialog-in {
          from { opacity: 0; transform: translateY(8px) scale(.97); }
          to   { opacity: 1; transform: none; }
        }
        .o4u-dialog { animation: o4u-dialog-in .2s ease-out both; }
        @media (prefers-reduced-motion: reduce) { .o4u-dialog { animation: none; } }
      `}</style>
    </div>
  );
};

export const ConfirmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<{
    options: ConfirmOptions;
    resolve: (v: boolean) => void;
  } | null>(null);

  const confirm = useCallback<ConfirmFn>(
    (options) =>
      new Promise<boolean>((resolve) => {
        setState((prev) => {
          prev?.resolve(false);
          return { options, resolve };
        });
      }),
    []
  );

  const close = (result: boolean) => {
    state?.resolve(result);
    setState(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state && <Dialog options={state.options} onClose={close} />}
    </ConfirmContext.Provider>
  );
};

export default ConfirmProvider;