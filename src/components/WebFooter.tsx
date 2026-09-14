import React from 'react';
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
  ChevronRight
} from 'lucide-react';
import { Logo } from './Logo';

interface WebFooterProps {
  onNavigateTab: (tab: string) => void;
  onOpenStoreModal?: () => void;
  onOpenAiMechanic?: () => void;
}

export const WebFooter: React.FC<WebFooterProps> = ({
  onNavigateTab,
  onOpenStoreModal,
  onOpenAiMechanic
}) => {
  return (
    <footer className="mt-16 border-t border-white/10 bg-slate-950/80 backdrop-blur-2xl text-slate-400 text-xs">
      {/* Upper Callout: Commercial Partner Inscription */}
      <div className="bg-gradient-to-r from-blue-900/40 via-blue-950/60 to-slate-950 border-b border-white/10 px-4 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <Store className="w-4 h-4" />
              <span>¿Tienes un almacén o distribuidora de autopartes?</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white">
              Vende en MiGaraje y llega a miles de conductores en todo el país
            </h3>
            <p className="text-xs text-slate-300 max-w-xl">
              Publica tu inventario, recibe pedidos con pago asegurado en custodia y forma parte de la red oficial de tiendas aliadas.
            </p>
          </div>

          <button
            onClick={() => {
              if (onOpenStoreModal) {
                onOpenStoreModal();
              } else {
                onNavigateTab('repuestos');
              }
            }}
            className="bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-black px-6 py-3 rounded-2xl shadow-xl shadow-emerald-600/25 border border-emerald-400/40 transition-all flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Store className="w-4 h-4" />
            <span>Inscribir mi Almacén Gratis</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
        
        {/* Col 1: Brand & Slogan */}
        <div className="lg:col-span-2 space-y-4">
          <Logo size="lg" showTagline={true} showBadge={false} />
          <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
            MiGaraje es la plataforma web líder del ecosistema automotriz: marketplace de repuestos certificados, compra y venta garantizada, comunidad de clásicos y diagnóstico inteligente asistido por IA.
          </p>
          <div className="flex items-center gap-3 pt-2 text-white">
            <span className="text-[11px] text-slate-400">Protección de pagos con custodia y garantía legal.</span>
          </div>
        </div>

        {/* Col 2: Secciones Web */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Módulos Web</h4>
          <ul className="space-y-2">
            <li>
              <button 
                onClick={() => onNavigateTab('repuestos')}
                className="hover:text-blue-400 transition-colors text-left cursor-pointer"
              >
                Catálogo de Repuestos
              </button>
            </li>
            <li>
              <button 
                onClick={() => onNavigateTab('repuestos')}
                className="hover:text-blue-400 transition-colors text-left cursor-pointer"
              >
                Tiendas y Almacenes Aliados
              </button>
            </li>
            <li>
              <button 
                onClick={() => onNavigateTab('vehiculos')}
                className="hover:text-blue-400 transition-colors text-left cursor-pointer"
              >
                Compra & Venta Verificada
              </button>
            </li>
            <li>
              <button 
                onClick={() => onNavigateTab('clasicos')}
                className="hover:text-blue-400 transition-colors text-left cursor-pointer"
              >
                Clásicos & Placas de Antiguo
              </button>
            </li>
            <li>
              <button 
                onClick={() => onNavigateTab('cuidado')}
                className="hover:text-blue-400 transition-colors text-left cursor-pointer"
              >
                Cuidado Estético & Motor
              </button>
            </li>
            <li>
              <button 
                onClick={() => onNavigateTab('comunidades')}
                className="hover:text-blue-400 transition-colors text-left cursor-pointer"
              >
                Clubes & Comunidades
              </button>
            </li>
          </ul>
        </div>

        {/* Col 3: Soluciones para Propietarios y Tiendas */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Servicios</h4>
          <ul className="space-y-2">
            <li>
              <button 
                onClick={onOpenAiMechanic}
                className="hover:text-blue-400 transition-colors text-left cursor-pointer flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-sky-400" />
                <span>Mecánico IA 24/7</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => onNavigateTab('repuestos')}
                className="hover:text-blue-400 transition-colors text-left cursor-pointer"
              >
                Cotización Express de Repuestos
              </button>
            </li>
            <li>
              <button 
                onClick={() => onNavigateTab('vehiculos')}
                className="hover:text-blue-400 transition-colors text-left cursor-pointer"
              >
                Publicar Vehículo en Venta
              </button>
            </li>
            <li>
              <span className="text-slate-500 cursor-not-allowed">
                Custodia de Pagos Segura
              </span>
            </li>
            <li>
              <span className="text-slate-500 cursor-not-allowed">
                Garantía de Compatibilidad
              </span>
            </li>
          </ul>
        </div>

        {/* Col 4: Contacto & Legal */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Contacto & Soporte</h4>
          <ul className="space-y-2.5 text-xs">
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-400 shrink-0" />
              <span>contacto@migaraje.co</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>+57 310 987 6543</span>
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Bogotá, Colombia</span>
            </li>
            <li className="pt-2">
              <a 
                href="https://wa.me/573109876543?text=Hola%20MiGaraje,%20deseo%20m%C3%A1s%20informaci%C3%B3n"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 px-3 py-1.5 rounded-xl transition-all font-semibold"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Atención por WhatsApp</span>
              </a>
            </li>
          </ul>
        </div>

      </div>

      {/* Copyright Bar */}
      <div className="border-t border-white/10 px-4 py-6 bg-slate-950/90 text-center text-[11px] text-slate-300">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} MiGaraje. Todos los derechos reservados. Plataforma Web del Ecosistema Automotriz.</p>
          <div className="flex items-center gap-4 text-slate-300">
            <span className="hover:text-white transition-colors cursor-pointer">Términos de Servicio</span>
            <span>•</span>
            <span className="hover:text-white transition-colors cursor-pointer">Política de Privacidad</span>
            <span>•</span>
            <span className="hover:text-white transition-colors cursor-pointer">Garantía de Repuestos</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
