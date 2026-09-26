import React, { useState } from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  Mail, 
  Phone, 
  MessageCircle, 
  Store, 
  Wrench, 
  Car, 
  Sparkles, 
  Heart,
  ChevronRight,
  Shield,
  Clock,
  Award
} from 'lucide-react';
import { Logo } from './Logo';
import { SITE } from '../config/site';

interface WebFooterProps {
  salesWhatsApp?: string;
  onOpenLegal: (doc: 'privacidad' | 'terminos') => void;
  onNavigateTab: (tab: string) => void;
  onOpenStoreModal?: () => void;
}

export const WebFooter: React.FC<WebFooterProps> = ({
  salesWhatsApp,
  onOpenLegal,
  onNavigateTab,
  onOpenStoreModal,
}) => {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white text-slate-600 text-xs">
      
      {/* Upper Callout: Clean White/Slate Banner for Commercial Partner Inscription */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-8 sm:py-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="inline-flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
              <Store className="w-4 h-4 text-blue-600" />
              <span>¿Quieres distribuir productos oficiales o vender tu vehículo?</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
              Únete a MiGaraje y conecta con la comunidad automotriz de Colombia
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl font-normal leading-relaxed">
              Publica tu vehículo en Compra & Venta, adquiere nuestra línea exclusiva de estética y detailing MiGaraje con venta por WhatsApp, y forma parte de los clubes de tu marca.
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('vehiculos')}
            className="bg-slate-950 hover:bg-slate-800 active:scale-98 text-white font-black px-6 py-3.5 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Car className="w-4 h-4 text-blue-400" />
            <span>Publicar Vehículo en Venta</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Footer Links & Directory */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Logo size="md" onClick={() => onNavigateTab('garaje')} />
            <p className="text-slate-600 text-xs leading-relaxed max-w-sm">
              Plataforma automotriz colombiana para comprar y vender vehículos directamente entre propietarios, comprar los productos de cuidado MiGaraje por WhatsApp y hacer parte de comunidades por marca.
            </p>
            <div className="flex items-center gap-3 pt-2 text-slate-600">
              <div className="flex items-center gap-1.5 text-xs">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Trato Directo</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5 text-xs">
                <Award className="w-4 h-4 text-slate-800" />
                <span>Marca Oficial MiGaraje</span>
              </div>
            </div>
          </div>

          {/* Navigation Column 1 */}
          <div>
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs mb-3">Módulos</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigateTab('garaje')} className="hover:text-slate-950 transition-colors cursor-pointer">
                  Mi Garaje
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('vehiculos')} className="hover:text-slate-950 transition-colors cursor-pointer">
                  Compra & Venta de Vehículos
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('productos')} className="hover:text-slate-950 transition-colors cursor-pointer">
                  Nuestros Productos MiGaraje
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('comunidades')} className="hover:text-slate-950 transition-colors cursor-pointer">
                  Mi Comunidad (Clubes)
                </button>
              </li>
            </ul>
          </div>

          {/* Services & Guarantees */}
          <div>
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs mb-3">Cómo Funciona</h4>
            <ul className="space-y-2 text-slate-600">
              <li className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-blue-600" />
                <span>Contacto directo con el vendedor</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Productos con garantía legal</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Envíos coordinados por WhatsApp</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-blue-600" />
                <span>Venta Directa por WhatsApp</span>
              </li>
            </ul>
          </div>

          {/* Contact info */}
          <div>
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs mb-3">Contacto</h4>
            <ul className="space-y-2.5 text-slate-600">
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-800 shrink-0" />
                <span>{SITE.city}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-800 shrink-0" />
                <a href={`mailto:${SITE.contactEmail}`} className="hover:text-slate-900 hover:underline break-all">
                  {SITE.contactEmail}
                </a>
              </li>
              {salesWhatsApp && (
                <li className="flex items-center gap-2">
                  <MessageCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <a
                    href={`https://wa.me/${salesWhatsApp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-slate-900 hover:underline"
                  >
                    WhatsApp: +{salesWhatsApp}
                  </a>
                </li>
              )}
            </ul>
          </div>

        </div>

        {/* Bottom copyright row */}
        <div className="pt-8 mt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-600 text-[11px]">
          <div>
            © {new Date().getFullYear()} MiGaraje Colombia. Todos los derechos reservados.
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => onOpenLegal('terminos')} className="hover:text-slate-900 hover:underline transition-colors cursor-pointer">
              Términos y Condiciones
            </button>
            <span>•</span>
            <button onClick={() => onOpenLegal('privacidad')} className="hover:text-slate-900 hover:underline transition-colors cursor-pointer">
              Política de Privacidad
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
