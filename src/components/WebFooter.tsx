import React from 'react';
import { Mail, MessageCircle, MapPin, Car, ChevronRight, Store } from 'lucide-react';
import { Logo } from './Logo';
import { SITE } from '../config/site';

interface WebFooterProps {
  salesWhatsApp?: string;
  onOpenLegal: (doc: 'privacidad' | 'terminos') => void;
  onNavigateTab: (tab: string) => void;
  onOpenStoreModal?: () => void;
}

const SECTIONS = [
  { tab: 'garaje', label: 'Mi Garaje' },
  { tab: 'vehiculos', label: 'Compra & Venta' },
  { tab: 'productos', label: 'Nuestros Productos' },
  { tab: 'comunidades', label: 'Mi Comunidad' },
];

export const WebFooter: React.FC<WebFooterProps> = ({ salesWhatsApp, onOpenLegal, onNavigateTab, onOpenStoreModal }) => {
  return (
    // Extra bottom space on phones so the fixed bottom menu doesn't cover the footer
    <footer className="mt-12 border-t border-slate-200 bg-white text-slate-600 text-xs pb-24 sm:pb-0">
      {/* Slim call to action */}
      <div className="bg-blue-50 border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm font-bold text-slate-900 text-center sm:text-left">¿Vas a vender tu carro? Publícalo gratis en MiGaraje.</p>
          <button
            onClick={() => onNavigateTab('vehiculos')}
            className="bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Car className="w-4 h-4" />
            Publicar mi vehículo
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {/* Brand */}
          <div className="col-span-2 space-y-2">
            <Logo size="sm" onClick={() => onNavigateTab('garaje')} />
            <p className="text-slate-600 leading-relaxed max-w-sm">
              Compra y venta de vehículos entre propietarios, productos de cuidado MiGaraje y comunidades por marca en Colombia.
            </p>
          </div>

          {/* Sections */}
          <nav aria-label="Secciones" className="space-y-2">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Secciones</h4>
            <ul className="space-y-1.5">
              {SECTIONS.map((s) => (
                <li key={s.tab}>
                  <button onClick={() => onNavigateTab(s.tab)} className="hover:text-blue-700 transition-colors cursor-pointer">
                    {s.label}
                  </button>
                </li>
              ))}
              {onOpenStoreModal && (
                <li>
                  <button onClick={onOpenStoreModal} className="hover:text-blue-700 transition-colors cursor-pointer inline-flex items-center gap-1 text-left">
                    <Store className="w-3.5 h-3.5" /> ¿Tienes una tienda o taller?
                  </button>
                </li>
              )}
            </ul>
          </nav>

          {/* Contact */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Contacto</h4>
            <ul className="space-y-1.5">
              {salesWhatsApp && (
                <li>
                  <a
                    href={`https://wa.me/${salesWhatsApp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 hover:text-emerald-700"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> WhatsApp
                  </a>
                </li>
              )}
              <li>
                <a href={`mailto:${SITE.contactEmail}`} className="inline-flex items-center gap-1.5 hover:text-blue-700 text-[11px] sm:text-xs">
                  <Mail className="w-3.5 h-3.5 shrink-0" /> {SITE.contactEmail}
                </a>
              </li>
              <li className="inline-flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 shrink-0" /> {SITE.city}
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-5 mt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
          <span>© {new Date().getFullYear()} MiGaraje Colombia</span>
          <div className="flex items-center gap-3">
            <button onClick={() => onOpenLegal('terminos')} className="hover:text-slate-900 hover:underline cursor-pointer">
              Términos y Condiciones
            </button>
            <span aria-hidden="true">•</span>
            <button onClick={() => onOpenLegal('privacidad')} className="hover:text-slate-900 hover:underline cursor-pointer">
              Política de Privacidad
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
