import React from 'react';
import { X, ShieldCheck, FileText } from 'lucide-react';
import { SITE } from '../config/site';

export type LegalDoc = 'privacidad' | 'terminos';

interface LegalModalProps {
  doc: LegalDoc | null;
  onClose: () => void;
  onSwitch: (doc: LegalDoc) => void;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="space-y-2">
    <h3 className="text-sm font-black text-slate-950">{title}</h3>
    <div className="space-y-2 text-xs text-slate-700 leading-relaxed">{children}</div>
  </section>
);

const PrivacyPolicy: React.FC = () => (
  <>
    <p className="text-xs text-slate-700 leading-relaxed">
      En cumplimiento de la Ley 1581 de 2012, el Decreto 1377 de 2013 (compilado en el Decreto 1074 de 2015) y demás normas
      de protección de datos personales en Colombia, {SITE.name} informa cómo recolecta, usa y protege tu información.
    </p>

    <Section title="1. Responsable del tratamiento">
      <p>
        <strong>{SITE.responsible}</strong>, con domicilio en {SITE.city}. Correo de contacto:{' '}
        <a href={`mailto:${SITE.contactEmail}`} className="text-blue-600 underline">{SITE.contactEmail}</a>.
      </p>
    </Section>

    <Section title="2. Datos que recolectamos">
      <ul className="list-disc pl-5 space-y-1">
        <li>Datos de cuenta: nombre, correo electrónico y, si inicias sesión con Google, tu identificador de Google.</li>
        <li>Datos de perfil que decides compartir: teléfono / WhatsApp, ciudad y tipo de perfil.</li>
        <li>Datos de tus vehículos: marca, modelo, año, kilometraje, placa, fotos y fechas de SOAT y revisión técnico-mecánica.</li>
        <li>Publicaciones: anuncios de venta (incluido el teléfono de contacto que publiques), publicaciones y comentarios en comunidades y reseñas de productos.</li>
        <li>Pedidos: nombre, teléfono, ciudad y dirección de entrega.</li>
      </ul>
    </Section>

    <Section title="3. Finalidades">
      <ul className="list-disc pl-5 space-y-1">
        <li>Crear y administrar tu cuenta y tu garaje digital.</li>
        <li>Mostrar recordatorios de mantenimiento y de vencimiento de documentos de tus vehículos.</li>
        <li>Publicar tus anuncios, publicaciones, comentarios y reseñas.</li>
        <li>Gestionar y entregar los pedidos de productos y contactarte sobre ellos.</li>
        <li>Atender solicitudes, quejas y reclamos, y mejorar el servicio.</li>
      </ul>
    </Section>

    <Section title="4. Información pública">
      <p>
        Lo que publicas en Compra & Venta (incluido el teléfono de contacto), en Mi Comunidad y en las reseñas es visible para
        cualquier visitante. Tu correo, tu teléfono de perfil, tus vehículos y tus pedidos no son públicos.
      </p>
    </Section>

    <Section title="5. Tus derechos">
      <p>Como titular puedes, en cualquier momento y de forma gratuita:</p>
      <ul className="list-disc pl-5 space-y-1">
        <li>Conocer, actualizar y rectificar tus datos.</li>
        <li>Solicitar prueba de la autorización que otorgaste.</li>
        <li>Ser informado sobre el uso que se ha dado a tus datos.</li>
        <li>Revocar la autorización y/o pedir la eliminación de tus datos, cuando no exista un deber legal de conservarlos.</li>
        <li>Presentar quejas ante la Superintendencia de Industria y Comercio (SIC).</li>
      </ul>
    </Section>

    <Section title="6. Cómo ejercer tus derechos">
      <p>
        Escribe a <a href={`mailto:${SITE.contactEmail}`} className="text-blue-600 underline">{SITE.contactEmail}</a> indicando
        tu nombre, el correo de tu cuenta y tu solicitud. Las consultas se responden en máximo 10 días hábiles y los reclamos en
        máximo 15 días hábiles, según la ley.
      </p>
    </Section>

    <Section title="7. Seguridad y proveedores">
      <p>
        Los datos se almacenan en servicios de Google Firebase y la página se aloja en Vercel, proveedores que pueden guardar la
        información fuera de Colombia con medidas de seguridad adecuadas. Aplicamos reglas de acceso para que cada usuario solo
        pueda modificar su propia información.
      </p>
    </Section>

    <Section title="8. Vigencia">
      <p>
        Esta política rige desde el {SITE.legalLastUpdated}. Los datos se conservarán mientras tengas una cuenta activa o sea
        necesario para las finalidades descritas. Cualquier cambio se publicará en esta misma página.
      </p>
    </Section>
  </>
);

const TermsOfService: React.FC = () => (
  <>
    <p className="text-xs text-slate-700 leading-relaxed">
      Al usar {SITE.name} aceptas estos términos. Si no estás de acuerdo, por favor no uses la plataforma.
    </p>

    <Section title="1. Qué es MiGaraje">
      <p>
        {SITE.name} es una plataforma que permite: (a) llevar un garaje digital de tus vehículos, (b) publicar y encontrar
        vehículos en venta, (c) comprar productos de la marca {SITE.name} y (d) participar en comunidades de propietarios.
      </p>
    </Section>

    <Section title="2. Compra & Venta de vehículos">
      <ul className="list-disc pl-5 space-y-1">
        <li>
          {SITE.name} <strong>no es parte</strong> de la compraventa: solo publica los anuncios. El negocio se hace directamente
          entre comprador y vendedor.
        </li>
        <li>
          La información de cada anuncio (estado, SOAT, revisión técnico-mecánica, único dueño, etc.) es <strong>declarada por
          el vendedor</strong> y {SITE.name} no la verifica.
        </li>
        <li>
          Antes de pagar, te recomendamos consultar el RUNT, hacer un peritaje con un taller de tu confianza y realizar el
          traspaso ante el organismo de tránsito. Nunca envíes dinero sin haber visto el vehículo.
        </li>
        <li>El vendedor es responsable de que su anuncio sea veraz y de tener derecho a vender el vehículo.</li>
      </ul>
    </Section>

    <Section title="3. Productos MiGaraje">
      <ul className="list-disc pl-5 space-y-1">
        <li>Los precios se muestran en pesos colombianos (COP) e incluyen los impuestos aplicables, salvo que se indique lo contrario.</li>
        <li>El costo de envío, la disponibilidad y la forma de pago se confirman por WhatsApp antes de despachar.</li>
        <li>
          Aplican los derechos del Estatuto del Consumidor (Ley 1480 de 2011), incluida la garantía legal. Para compras a
          distancia puedes ejercer el derecho de retracto dentro de los 5 días hábiles siguientes a la entrega, si el producto
          no ha sido usado.
        </li>
      </ul>
    </Section>

    <Section title="4. Contenido de los usuarios">
      <ul className="list-disc pl-5 space-y-1">
        <li>No está permitido publicar contenido falso, ofensivo, ilegal, estafas ni datos personales de terceros sin autorización.</li>
        <li>{SITE.name} puede retirar publicaciones, comentarios, reseñas o comunidades que incumplan estas reglas y suspender cuentas.</li>
        <li>Al publicar fotos o textos, nos autorizas a mostrarlos dentro de la plataforma.</li>
      </ul>
    </Section>

    <Section title="5. Tu cuenta">
      <p>
        Eres responsable de mantener segura tu cuenta. Puedes pedir la eliminación de tu cuenta y tus datos escribiendo a{' '}
        <a href={`mailto:${SITE.contactEmail}`} className="text-blue-600 underline">{SITE.contactEmail}</a>.
      </p>
    </Section>

    <Section title="6. Recordatorios y recomendaciones">
      <p>
        Los planes de mantenimiento y los recordatorios de SOAT y revisión técnico-mecánica son orientativos y dependen de los
        datos que ingreses. Verifica siempre las fechas oficiales en el RUNT y con el fabricante de tu vehículo.
      </p>
    </Section>

    <Section title="7. Cambios y contacto">
      <p>
        Podemos actualizar estos términos; la versión vigente es la publicada aquí (última actualización:{' '}
        {SITE.legalLastUpdated}). Dudas o reclamos:{' '}
        <a href={`mailto:${SITE.contactEmail}`} className="text-blue-600 underline">{SITE.contactEmail}</a>.
      </p>
    </Section>
  </>
);

export const LegalModal: React.FC<LegalModalProps> = ({ doc, onClose, onSwitch }) => {
  if (!doc) return null;
  const isPrivacy = doc === 'privacidad';

  return (
    <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full shadow-2xl relative max-h-[92dvh] flex flex-col overflow-hidden">
        <div className="shrink-0 p-5 sm:p-6 border-b border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {isPrivacy ? <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" /> : <FileText className="w-5 h-5 text-blue-600 shrink-0" />}
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-black text-slate-950 truncate">
                {isPrivacy ? 'Política de Tratamiento de Datos Personales' : 'Términos y Condiciones de Uso'}
              </h2>
              <p className="text-[11px] text-slate-500">Última actualización: {SITE.legalLastUpdated}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-950 cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-6 space-y-5">
          {isPrivacy ? <PrivacyPolicy /> : <TermsOfService />}
        </div>

        <div className="shrink-0 p-4 border-t border-slate-200 flex items-center justify-between gap-2 text-xs">
          <button
            onClick={() => onSwitch(isPrivacy ? 'terminos' : 'privacidad')}
            className="font-bold text-blue-600 hover:underline cursor-pointer"
          >
            {isPrivacy ? 'Ver Términos y Condiciones' : 'Ver Política de Privacidad'}
          </button>
          <button onClick={onClose} className="bg-slate-950 hover:bg-slate-800 text-white font-bold px-5 py-2 rounded-xl cursor-pointer">
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
