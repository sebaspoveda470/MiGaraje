import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmOptions {
  title?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Red confirm button for destructive actions */
  danger?: boolean;
}

type ConfirmFn = (message: string, options?: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

/**
 * In-page replacement for window.confirm(), which some embedded browsers block silently.
 * Usage: const confirm = useConfirm(); if (await confirm('¿Seguro?')) { ... }
 */
export function useConfirm(): ConfirmFn {
  const fn = useContext(ConfirmContext);
  if (!fn) throw new Error('useConfirm must be used inside <ConfirmProvider>');
  return fn;
}

export const ConfirmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [request, setRequest] = useState<{ message: string; options: ConfirmOptions } | null>(null);
  const resolver = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback<ConfirmFn>((message, options = {}) => {
    resolver.current?.(false);
    setRequest({ message, options });
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const close = (value: boolean) => {
    resolver.current?.(value);
    resolver.current = null;
    setRequest(null);
  };

  const { options } = request || { options: {} as ConfirmOptions };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {request && (
        <div
          className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => close(false)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${options.danger ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-950">{options.title || '¿Estás seguro?'}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{request.message}</p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => close(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                {options.cancelLabel || 'Cancelar'}
              </button>
              <button
                autoFocus
                onClick={() => close(true)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold text-white cursor-pointer ${
                  options.danger ? 'bg-red-600 hover:bg-red-700' : 'bg-slate-950 hover:bg-slate-800'
                }`}
              >
                {options.confirmLabel || 'Sí, continuar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};
