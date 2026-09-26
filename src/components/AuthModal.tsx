import React, { useState } from 'react';
import { Mail, Lock, User, X, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { Logo } from './Logo';
import {
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  resetPassword,
  authErrorMessage,
} from '../services/authService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLegal: (doc: 'privacidad' | 'terminos') => void;
}

type Mode = 'login' | 'signup' | 'reset';

const inputClass =
  'w-full bg-white border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-all shadow-xs';

const GoogleIcon = () => (
  <svg viewBox="0 0 48 48" className="w-5 h-5" aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
  </svg>
);

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onOpenLegal }) => {
  const [mode, setMode] = useState<Mode>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  if (!isOpen) return null;

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
    setInfo(null);
  };

  const run = async (action: () => Promise<void>) => {
    setIsBusy(true);
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setIsBusy(false);
    }
  };

  const handleGoogle = () => run(signInWithGoogle);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      run(() => signInWithEmail(email, password));
    } else if (mode === 'signup') {
      run(() => signUpWithEmail(fullName, email, password));
    } else {
      run(async () => {
        await resetPassword(email);
        setInfo('Te enviamos un correo con el enlace para crear una nueva contraseña. Revisa también la carpeta de spam.');
      });
    }
  };

  const title =
    mode === 'login' ? 'Inicia sesión en MiGaraje' : mode === 'signup' ? 'Crea tu cuenta' : 'Recupera tu contraseña';
  const subtitle =
    mode === 'reset'
      ? 'Ingresa el correo de tu cuenta y te enviaremos un enlace.'
      : 'Guarda tus vehículos, publica en Compra & Venta y participa en Mi Comunidad.';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/80 backdrop-blur-2xl overflow-hidden animate-fade-in">
      <div className="relative w-full max-w-md max-h-[92dvh] bg-white text-slate-900 rounded-3xl shadow-2xl shadow-black/80 border border-slate-200 flex flex-col overflow-hidden my-auto">
        <div className="shrink-0 bg-slate-950 text-white p-5 sm:p-6 text-center relative overflow-hidden border-b border-slate-800">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-600/30 rounded-full blur-2xl pointer-events-none" />
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute top-4 right-4 z-20 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="relative z-10">
            <div className="flex justify-center mb-2">
              <Logo size="md" variant="icon-only" />
            </div>
            <h2 className="text-lg sm:text-2xl font-black tracking-tight">{title}</h2>
            <p className="text-[11px] sm:text-sm text-slate-300 mt-1 max-w-sm mx-auto leading-relaxed">{subtitle}</p>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-7 bg-slate-50/70 space-y-4">
          {mode !== 'reset' && (
            <>
              <button
                type="button"
                onClick={handleGoogle}
                disabled={isBusy}
                className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-900 font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <GoogleIcon />
                <span>Continuar con Google</span>
              </button>

              <div className="flex items-center gap-3 text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                <div className="flex-1 h-px bg-slate-200" />
                <span>o con tu correo</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Nombre completo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={inputClass}
                />
              </div>
            )}

            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="tu.correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            </div>

            {mode !== 'reset' && (
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={6}
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  placeholder={mode === 'signup' ? 'Contraseña (mínimo 6 caracteres)' : 'Contraseña'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                />
              </div>
            )}

            {error && (
              <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2 font-semibold">{error}</p>
            )}
            {info && (
              <p className="text-xs text-blue-900 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2 font-semibold flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-px" />
                <span>{info}</span>
              </p>
            )}

            <button
              type="submit"
              disabled={isBusy}
              className="w-full py-3 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-black text-sm shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isBusy && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>
                {mode === 'login' ? 'Iniciar sesión' : mode === 'signup' ? 'Crear cuenta' : 'Enviar enlace'}
              </span>
            </button>
          </form>

          <div className="text-xs text-center text-slate-600 space-y-2 pt-1">
            {mode === 'login' && (
              <>
                <button type="button" onClick={() => switchMode('reset')} className="text-blue-600 font-bold hover:underline cursor-pointer">
                  ¿Olvidaste tu contraseña?
                </button>
                <p>
                  ¿No tienes cuenta?{' '}
                  <button type="button" onClick={() => switchMode('signup')} className="text-blue-600 font-bold hover:underline cursor-pointer">
                    Regístrate
                  </button>
                </p>
              </>
            )}
            {mode === 'signup' && (
              <p>
                ¿Ya tienes cuenta?{' '}
                <button type="button" onClick={() => switchMode('login')} className="text-blue-600 font-bold hover:underline cursor-pointer">
                  Inicia sesión
                </button>
              </p>
            )}
            {mode === 'reset' && (
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="text-slate-700 font-bold hover:underline cursor-pointer inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Volver a iniciar sesión
              </button>
            )}
          </div>

          <p className="text-[10px] text-slate-400 text-center leading-relaxed">
            Consulta nuestros{' '}
            <button type="button" onClick={() => onOpenLegal('terminos')} className="underline hover:text-slate-600 cursor-pointer">
              Términos y Condiciones
            </button>{' '}
            y la{' '}
            <button type="button" onClick={() => onOpenLegal('privacidad')} className="underline hover:text-slate-600 cursor-pointer">
              Política de Privacidad
            </button>
            .
          </p>
        </div>
      </div>
    </div>
  );
};
