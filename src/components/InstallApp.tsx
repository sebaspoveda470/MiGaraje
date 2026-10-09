import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Download, Share, PlusSquare, MoreVertical, X } from 'lucide-react';
import { LogoMark } from './Logo';

/** Chrome's install event (not in the standard TypeScript DOM types) */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISSED_KEY = 'migaraje_install_dismissed';

const isStandalone = () =>
  typeof window !== 'undefined' &&
  (window.matchMedia?.('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true);

const isIos = () => typeof navigator !== 'undefined' && /iphone|ipad|ipod/i.test(navigator.userAgent);

interface InstallContextValue {
  /** False once the app is already installed / opened from the home screen */
  canInstall: boolean;
  install: () => void;
}

const InstallContext = createContext<InstallContextValue>({ canInstall: false, install: () => {} });
export const useInstallApp = () => useContext(InstallContext);

/**
 * "Instalar MiGaraje": adds the site to the phone's home screen like an app.
 * Android/Chrome shows its own install dialog; iPhone and other browsers get short instructions.
 * A small banner invites phone users once; `useInstallApp()` lets any button trigger it.
 */
export const InstallAppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(isStandalone);
  const [showHelp, setShowHelp] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setShowBanner(false);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  // Invite phone users once, after they've had a moment to look around
  useEffect(() => {
    if (installed || window.innerWidth >= 640) return;
    let dismissed = false;
    try {
      dismissed = localStorage.getItem(DISMISSED_KEY) === '1';
    } catch {
      // storage unavailable: just show it
    }
    if (dismissed) return;
    const timer = setTimeout(() => setShowBanner(true), 15000);
    return () => clearTimeout(timer);
  }, [installed]);

  const dismissBanner = () => {
    setShowBanner(false);
    try {
      localStorage.setItem(DISMISSED_KEY, '1');
    } catch {
      // convenience only
    }
  };

  const install = async () => {
    dismissBanner();
    if (!promptEvent) {
      setShowHelp(true);
      return;
    }
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    if (choice.outcome === 'accepted') setInstalled(true);
    setPromptEvent(null);
  };

  const value = useMemo(() => ({ canInstall: !installed, install }), [installed, promptEvent]);

  return (
    <InstallContext.Provider value={value}>
      {children}

      {showBanner && !installed && (
        <div className="sm:hidden fixed left-3 right-3 bottom-[5.5rem] z-40 animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-white/90 backdrop-blur-2xl border border-slate-200 shadow-xl rounded-3xl p-3 flex items-center gap-3">
            <LogoMark className="w-11 h-11 shrink-0" glow={false} />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-slate-950">Instala MiGaraje</div>
              <div className="text-[0.6875rem] text-slate-500 leading-snug">Ábrela como una app desde tu pantalla de inicio.</div>
            </div>
            <button onClick={install} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-full cursor-pointer shrink-0">
              Instalar
            </button>
            <button onClick={dismissBanner} aria-label="Cerrar" className="w-7 h-7 rounded-full text-slate-400 hover:bg-slate-100 flex items-center justify-center cursor-pointer shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {showHelp && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 animate-in fade-in duration-200" onClick={() => setShowHelp(false)}>
          <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <LogoMark className="w-12 h-12 shrink-0" glow={false} />
              <div>
                <h3 className="text-lg font-semibold text-slate-950">Instala MiGaraje</h3>
                <p className="text-xs text-slate-500">Queda en tu pantalla de inicio, como una app.</p>
              </div>
            </div>

            {isIos() ? (
              <ol className="space-y-3 text-sm text-slate-700">
                <li className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><Share className="w-4 h-4" /></span>
                  <span>Abre esta página en <strong>Safari</strong> y toca el botón <strong>Compartir</strong> (el cuadro con la flecha hacia arriba).</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><PlusSquare className="w-4 h-4" /></span>
                  <span>Elige <strong>“Agregar a inicio”</strong> y confirma con <strong>Agregar</strong>.</span>
                </li>
              </ol>
            ) : (
              <ol className="space-y-3 text-sm text-slate-700">
                <li className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><MoreVertical className="w-4 h-4" /></span>
                  <span>Abre el <strong>menú de tu navegador</strong> (los tres puntos ⋮, arriba a la derecha).</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><Download className="w-4 h-4" /></span>
                  <span>Elige <strong>“Instalar app”</strong> o <strong>“Agregar a pantalla de inicio”</strong>.</span>
                </li>
              </ol>
            )}

            <button onClick={() => setShowHelp(false)} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold text-sm py-2.5 rounded-full cursor-pointer">
              Entendido
            </button>
          </div>
        </div>
      )}
    </InstallContext.Provider>
  );
};

/** Small "Instalar MiGaraje" button for menus and the footer; hides itself once installed. */
export const InstallAppButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { canInstall, install } = useInstallApp();
  if (!canInstall) return null;
  return (
    <button onClick={install} className={`inline-flex items-center gap-1.5 cursor-pointer ${className}`}>
      <Download className="w-3.5 h-3.5" /> Instalar MiGaraje en tu celular
    </button>
  );
};
