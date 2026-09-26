import React, { useState } from 'react';
import { Share2, Link as LinkIcon, Check, MessageCircle } from 'lucide-react';
import { DeepLinkType, buildShareUrl } from '../utils/shareLinks';

interface ShareButtonsProps {
  type: DeepLinkType;
  id: string;
  /** Message that goes before the link when sharing */
  text: string;
  compact?: boolean;
  /** Round icon buttons only (for tight layouts) */
  iconsOnly?: boolean;
}

/**
 * "Share on WhatsApp" + "Copy link" (or the phone's native share sheet when available).
 */
export const ShareButtons: React.FC<ShareButtonsProps> = ({ type, id, text, compact, iconsOnly }) => {
  const [copied, setCopied] = useState(false);
  const url = buildShareUrl(type, id);
  const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt('Copia este enlace:', url);
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const nativeShare = () => {
    navigator.share({ title: 'MiGaraje', text, url }).catch(() => {
      // User closed the share sheet
    });
  };

  if (iconsOnly) {
    const iconClass =
      'w-9 h-9 rounded-full border border-slate-200 bg-white hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors';
    return (
      <div className="flex items-center gap-1.5">
        <a
          href={`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Compartir por WhatsApp"
          title="Compartir por WhatsApp"
          className={iconClass}
        >
          <MessageCircle className="w-4 h-4 text-emerald-600" />
        </a>
        <button type="button" onClick={copyLink} aria-label="Copiar enlace" title={copied ? '¡Copiado!' : 'Copiar enlace'} className={iconClass}>
          {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <LinkIcon className="w-4 h-4 text-blue-600" />}
        </button>
        {canNativeShare && (
          <button type="button" onClick={nativeShare} aria-label="Más opciones para compartir" title="Compartir" className={iconClass}>
            <Share2 className="w-4 h-4 text-slate-600" />
          </button>
        )}
      </div>
    );
  }

  const buttonClass =
    'flex items-center justify-center gap-1.5 text-xs font-bold rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-800 cursor-pointer transition-colors';
  const size = compact ? 'px-2.5 py-1.5' : 'px-3.5 py-2';

  return (
    <div className="flex flex-wrap items-center gap-2">
      <a
        href={`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className={`${buttonClass} ${size}`}
      >
        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
        Compartir
      </a>
      <button type="button" onClick={copyLink} className={`${buttonClass} ${size}`}>
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <LinkIcon className="w-3.5 h-3.5 text-blue-600" />}
        {copied ? '¡Copiado!' : 'Copiar enlace'}
      </button>
      {canNativeShare && (
        <button type="button" onClick={nativeShare} aria-label="Más opciones para compartir" className={`${buttonClass} ${size}`}>
          <Share2 className="w-3.5 h-3.5 text-slate-600" />
        </button>
      )}
    </div>
  );
};
