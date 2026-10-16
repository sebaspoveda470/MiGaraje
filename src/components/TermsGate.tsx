import React, { useEffect, useState } from 'react';
import { FileCheck2, Loader2 } from 'lucide-react';
import { UserProfile } from '../types';
import { SITE } from '../config/site';
import { LegalDoc } from './LegalModal';

// Visitors who already tapped "Aceptar" in this browser (per terms version)
const NOTICE_KEY = 'migaraje_terms_notice';

/** Whether this profile accepted the terms in force: the same version, or (older profiles) a date on or after it. */
export const hasAcceptedCurrentTerms = (user: UserProfile) =>
  user.acceptedTermsVersion
    ? user.acceptedTermsVersion === SITE.legalVersion
    : !!user.acceptedTermsAt && user.acceptedTermsAt.slice(0, 10) >= SITE.legalVersion;

interface TermsGateProps {
  /** Signed in (even if the profile is still being created) */
  isSignedIn: boolean;
  user: UserProfile | null;
  onAccept: () => Promise<void>;
  onLogout: () => void;
  onOpenLegal: (doc: LegalDoc) => void;
}

/**
 * Terms and conditions acceptance:
 * - visitors get a small notice with an "Aceptar" button, once per browser;
 * - signed-in people who haven't accepted the current version (older accounts, or after the terms change)
 *   must accept them before going on.
 * New accounts accept them in the sign-up form, so they never see either.
 */
export const TermsGate: React.FC<TermsGateProps> = ({ isSignedIn, user, onAccept, onLogout, onOpenLegal }) => {
  const [noticeAccepted, setNoticeAccepted] = useState(true);
  const [checked, setChecked] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    try {
      setNoticeAccepted(localStorage.getItem(NOTICE_KEY) === SITE.legalVersion);
    } catch {
      setNoticeAccepted(false);
    }
  }, []);

  const acceptNotice = () => {
    setNoticeAccepted(true);
    try {
      localStorage.setItem(NOTICE_KEY, SITE.legalVersion);
    } catch {
      // the notice just shows again next time
    }
  };

  const legalLinks = (linkClass: string) => (
    <>
      <button type="button" onClick={() => onOpenLegal('terminos')} className={linkClass}>
        Términos y Condiciones
      </button>{' '}
      y la{' '}
      <button type="button" onClick={() => onOpenLegal('privacidad')} className={linkClass}>
        Política de Privacidad
      </button>
    </>
  );

  // Signed in with a profile that hasn't accepted the current terms
  if (user && !hasAcceptedCurrentTerms(user)) {
    const isUpdate = !!user.acceptedTermsAt;
    const accept = async () => {
      setIsSaving(true);
      try {
        await onAccept();
        acceptNotice();
      } finally {
        setIsSaving(false);
      }
    };
    return (
      <div className="fixed inset-0 z-[66] flex items-end sm:items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
        <div role="dialog" aria-modal="true" aria-labelledby="terms-gate-title" className="bg-white rounded-3xl max-w-md w-full shadow-2xl p-6 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h2 id="terms-gate-title" className="text-xl font-semibold text-slate-950">
              {isUpdate ? 'Actualizamos nuestros términos' : 'Términos y condiciones'}
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {isUpdate
                ? `Los actualizamos el ${SITE.legalLastUpdated}. Para seguir usando MiGaraje, revísalos y acéptalos.`
                : 'Para seguir usando MiGaraje, revisa y acepta nuestros términos y la forma en que cuidamos tus datos.'}
            </p>
          </div>

          <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer bg-slate-50 border border-slate-200 rounded-xl p-3">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-blue-600 shrink-0 cursor-pointer"
            />
            <span>
              Acepto los {legalLinks('text-blue-600 font-bold underline cursor-pointer')} y autorizo el tratamiento de mis datos personales.
            </span>
          </label>

          <button
            type="button"
            onClick={accept}
            disabled={!checked || isSaving}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-semibold py-3 rounded-full cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            Aceptar y continuar
          </button>
          <button type="button" onClick={onLogout} className="w-full text-xs text-slate-500 hover:text-slate-900 font-medium cursor-pointer">
            No acepto, cerrar sesión
          </button>
        </div>
      </div>
    );
  }

  // Visitors: a short notice, once per browser
  if (isSignedIn || noticeAccepted) return null;
  return (
    <div
      data-terms-notice
      className="fixed left-3 right-3 bottom-[5.5rem] sm:left-auto sm:right-5 sm:bottom-5 sm:max-w-sm z-40 animate-in slide-in-from-bottom-4 duration-300"
    >
      <div className="bg-white/95 backdrop-blur-2xl border border-slate-200 shadow-xl rounded-3xl p-4 space-y-3">
        <p className="text-xs text-slate-600 leading-relaxed">
          Al usar MiGaraje aceptas nuestros {legalLinks('text-slate-950 font-semibold underline cursor-pointer')}.
        </p>
        <button
          type="button"
          onClick={acceptNotice}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2.5 rounded-full cursor-pointer"
        >
          Aceptar
        </button>
      </div>
    </div>
  );
};
