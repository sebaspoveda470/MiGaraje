import React, { useEffect, useState } from 'react';
import { ArrowUpRight, Edit, Globe2, Loader2, MapPin, Newspaper, PlusCircle, Trash2, X } from 'lucide-react';
import { NewsItem } from '../types';
import { NewsDraft, deleteNews, publishNews, subscribeToNews, updateNews } from '../services/newsService';
import { timeAgo } from '../utils/media';
import { PhotoPicker } from './PhotoPicker';
import { SwipeRow } from './SwipeRow';
import { useConfirm } from './ConfirmDialog';

interface NewsSectionProps {
  isAdmin: boolean;
  onError: (message: string, err: unknown) => void;
  onNotify: (message: string) => void;
}

type ScopeFilter = 'todas' | NewsItem['scope'];

const SCOPE_LABEL: Record<NewsItem['scope'], string> = { colombia: 'Colombia', internacional: 'Internacional' };
// Cards shown before "Ver todas"
const PREVIEW = 6;

const ScopeBadge: React.FC<{ scope: NewsItem['scope']; className?: string }> = ({ scope, className = '' }) => (
  <span className={`inline-flex items-center gap-1 text-[0.625rem] font-semibold px-2 py-0.5 rounded-full ${className} ${scope === 'colombia' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
    {scope === 'colombia' ? <MapPin className="w-3 h-3" /> : <Globe2 className="w-3 h-3" />}
    {SCOPE_LABEL[scope]}
  </span>
);

const NewsImage: React.FC<{ item: NewsItem; className: string }> = ({ item, className }) =>
  item.image ? (
    <img src={item.image} alt="" loading="lazy" className={`${className} object-cover`} />
  ) : (
    <div className={`${className} bg-gradient-to-br from-blue-600 to-blue-950 flex items-center justify-center`}>
      <Newspaper className="w-10 h-10 text-white/70" />
    </div>
  );

/** Short dates on cards: "hace 3 días"; the detail shows the full date */
const fullDate = (millis?: number) =>
  millis ? new Date(millis).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

/**
 * "Novedades": automotive news from Colombia and abroad, written by the admin in MiGaraje's own words,
 * always with a link to the original source.
 */
export const NewsSection: React.FC<NewsSectionProps> = ({ isAdmin, onError, onNotify }) => {
  const confirm = useConfirm();
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ScopeFilter>('todas');
  const [showAll, setShowAll] = useState(false);
  const [openItem, setOpenItem] = useState<NewsItem | null>(null);
  // null: closed; 'new': blank form; an item: editing it
  const [editing, setEditing] = useState<NewsItem | 'new' | null>(null);

  useEffect(
    () =>
      subscribeToNews(
        (next) => {
          setItems(next);
          setLoading(false);
        },
        (err) => {
          // Visitors just don't see the section (e.g. before the database rules for news are published)
          setLoading(false);
          if (isAdmin) onError('No se pudieron cargar las novedades.', err);
          else console.warn('Novedades no disponibles', err);
        }
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Visitors only see the section once there is something to read
  if (loading || (items.length === 0 && !isAdmin)) return null;

  const filtered = filter === 'todas' ? items : items.filter((n) => n.scope === filter);
  const visible = showAll ? filtered : filtered.slice(0, PREVIEW);

  const handleDelete = async (item: NewsItem) => {
    if (!(await confirm(`¿Eliminar la novedad "${item.title}"?`))) return;
    try {
      await deleteNews(item.id);
      setOpenItem(null);
      onNotify('Novedad eliminada.');
    } catch (err) {
      onError('No se pudo eliminar la novedad.', err);
    }
  };

  // In the phone swipe row a card takes 80% of the width; in the full grid, its column
  const card = (item: NewsItem, inGrid = false) => (
    <button
      key={item.id}
      data-reveal
      onClick={() => setOpenItem(item)}
      className={`${inGrid ? 'w-full' : 'w-[80%] sm:w-auto'} text-left bg-white rounded-3xl overflow-hidden border border-slate-200/70 shadow-xs hover:shadow-md transition-shadow cursor-pointer flex flex-col`}
    >
      <div className="relative w-full">
        <NewsImage item={item} className="w-full h-40" />
        <ScopeBadge scope={item.scope} className="absolute top-3 left-3" />
      </div>
      <div className="w-full p-4 sm:p-5 flex-1 flex flex-col gap-1.5">
        <h3 className="text-base font-semibold text-slate-950 leading-snug line-clamp-2">{item.title}</h3>
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">{item.summary}</p>
        <div className="mt-auto pt-2 text-[0.6875rem] text-slate-400 font-medium">
          {item.sourceName}
          {item.createdAt ? ` · ${timeAgo(item.createdAt).toLowerCase()}` : ''}
        </div>
      </div>
    </button>
  );

  return (
    <section className="space-y-4" aria-label="Novedades del mundo automotriz">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-semibold text-slate-950 tracking-tight">Novedades</h2>
          <p className="text-sm text-slate-500 mt-1">Lo que pasa en el mundo automotriz, en Colombia y afuera.</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setEditing('new')}
            className="bg-slate-950 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-full cursor-pointer flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" /> Publicar novedad
          </button>
        )}
      </div>

      {items.length > 0 && (
        <div className="inline-flex bg-slate-100 rounded-full p-1">
          {(['todas', 'colombia', 'internacional'] as ScopeFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => {
                setFilter(f);
                setShowAll(false);
              }}
              className={`px-4 py-1.5 rounded-full text-xs whitespace-nowrap cursor-pointer transition-all ${
                filter === f ? 'bg-white text-slate-950 font-semibold shadow-sm' : 'text-slate-600 font-medium hover:text-slate-950'
              }`}
            >
              {f === 'todas' ? 'Todas' : SCOPE_LABEL[f]}
            </button>
          ))}
        </div>
      )}

      {items.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-6 text-center text-sm text-slate-500">
          Aún no hay novedades. Publica la primera: los visitantes verán esta sección cuando tenga al menos una.
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-slate-500">Aún no hay novedades de {filter === 'colombia' ? 'Colombia' : 'afuera'}.</p>
      ) : showAll ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">{visible.map((n) => card(n, true))}</div>
      ) : (
        <SwipeRow className="gap-3 sm:gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3">{visible.map((n) => card(n))}</SwipeRow>
      )}

      {filtered.length > PREVIEW && (
        <button onClick={() => setShowAll((v) => !v)} className="text-sm font-semibold text-blue-700 hover:text-blue-900 cursor-pointer">
          {showAll ? 'Ver menos' : `Ver todas (${filtered.length})`}
        </button>
      )}

      {openItem && (
        <NewsDetail
          item={items.find((n) => n.id === openItem.id) || openItem}
          isAdmin={isAdmin}
          onClose={() => setOpenItem(null)}
          onEdit={(item) => {
            setOpenItem(null);
            setEditing(item);
          }}
          onDelete={handleDelete}
        />
      )}

      {editing && (
        <NewsForm
          item={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={(isNew) => {
            setEditing(null);
            onNotify(isNew ? '¡Novedad publicada!' : 'Novedad actualizada.');
          }}
          onError={onError}
        />
      )}
    </section>
  );
};

// ---------- Detail ----------

const NewsDetail: React.FC<{
  item: NewsItem;
  isAdmin: boolean;
  onClose: () => void;
  onEdit: (item: NewsItem) => void;
  onDelete: (item: NewsItem) => void;
}> = ({ item, isAdmin, onClose, onEdit, onDelete }) => (
  <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center sm:p-4 animate-in fade-in duration-200" onClick={onClose}>
    <article
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      className="bg-white w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="relative">
        <NewsImage item={item} className="w-full h-56 sm:h-72" />
        <button onClick={onClose} aria-label="Cerrar" className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center cursor-pointer">
          <X className="w-5 h-5" />
        </button>
      </div>
      {item.imageCredit && <p className="px-6 pt-2 text-[0.625rem] text-slate-400">{item.imageCredit}</p>}
      <div className="p-6 space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <ScopeBadge scope={item.scope} />
          <span>{fullDate(item.createdAt)}</span>
        </div>
        <h2 className="text-2xl font-semibold text-slate-950 leading-tight">{item.title}</h2>
        <p className="text-base text-slate-700 leading-relaxed font-medium">{item.summary}</p>
        {item.body && <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{item.body}</p>}
        <a
          href={item.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-900 text-sm font-semibold px-4 py-2.5 rounded-full"
        >
          Leer la noticia completa en {item.sourceName} <ArrowUpRight className="w-4 h-4" />
        </a>
        {isAdmin && (
          <div className="flex gap-2 pt-2 border-t border-slate-100">
            <button onClick={() => onEdit(item)} className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-950 px-3 py-2 rounded-full bg-slate-50 hover:bg-slate-100 cursor-pointer">
              <Edit className="w-3.5 h-3.5" /> Editar
            </button>
            <button onClick={() => onDelete(item)} className="flex items-center gap-1.5 text-xs font-semibold text-red-700 hover:text-red-900 px-3 py-2 rounded-full bg-red-50 hover:bg-red-100 cursor-pointer">
              <Trash2 className="w-3.5 h-3.5" /> Eliminar
            </button>
          </div>
        )}
      </div>
    </article>
  </div>
);

// ---------- Publish / edit (admin) ----------

const inputClass =
  'w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white';

const NewsForm: React.FC<{
  item: NewsItem | null;
  onClose: () => void;
  onSaved: (isNew: boolean) => void;
  onError: (message: string, err: unknown) => void;
}> = ({ item, onClose, onSaved, onError }) => {
  const [scope, setScope] = useState<NewsItem['scope']>(item?.scope || 'colombia');
  const [title, setTitle] = useState(item?.title || '');
  const [summary, setSummary] = useState(item?.summary || '');
  const [body, setBody] = useState(item?.body || '');
  const [images, setImages] = useState<string[]>(item?.image ? [item.image] : []);
  const [imageCredit, setImageCredit] = useState(item?.imageCredit || '');
  const [sourceName, setSourceName] = useState(item?.sourceName || '');
  const [sourceUrl, setSourceUrl] = useState(item?.sourceUrl || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = sourceUrl.trim();
    if (!/^https?:\/\/\S+\.\S+/.test(url)) {
      setFormError('Pega el enlace completo de la fuente (empieza por https://).');
      return;
    }
    const draft: NewsDraft = {
      scope,
      title: title.trim(),
      summary: summary.trim(),
      body: body.trim() || undefined,
      image: images[0],
      imageCredit: images[0] ? imageCredit.trim() || undefined : undefined,
      sourceName: sourceName.trim(),
      sourceUrl: url,
    };
    setIsSaving(true);
    setFormError(null);
    try {
      if (item) await updateNews(item.id, draft);
      else await publishNews(draft);
      onSaved(!item);
    } catch (err) {
      onError('No se pudo guardar la novedad. Si la foto es muy pesada, prueba con otra.', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <form onSubmit={submit} className="bg-white rounded-3xl max-w-lg w-full shadow-2xl p-6 space-y-4 my-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-950">{item ? 'Editar novedad' : 'Publicar novedad'}</h2>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="inline-flex bg-slate-100 rounded-full p-1">
          {(['colombia', 'internacional'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setScope(s)}
              className={`px-4 py-1.5 rounded-full text-xs cursor-pointer ${scope === s ? 'bg-white text-slate-950 font-semibold shadow-sm' : 'text-slate-600 font-medium'}`}
            >
              {SCOPE_LABEL[s]}
            </button>
          ))}
        </div>

        <label className="block space-y-1">
          <span className="text-xs font-bold text-slate-800">Título *</span>
          <input required maxLength={140} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Así quedará el pico y placa en Bogotá en noviembre" className={inputClass} />
        </label>

        <label className="block space-y-1">
          <span className="text-xs font-bold text-slate-800">Resumen * <span className="font-normal text-slate-500">(se ve en la tarjeta)</span></span>
          <textarea required maxLength={300} rows={3} value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Una o dos frases con lo más importante." className={inputClass} />
        </label>

        <label className="block space-y-1">
          <span className="text-xs font-bold text-slate-800">Texto completo <span className="font-normal text-slate-500">(opcional, con tus palabras)</span></span>
          <textarea maxLength={4000} rows={5} value={body} onChange={(e) => setBody(e.target.value)} className={inputClass} />
        </label>

        <PhotoPicker label="Foto (opcional)" images={images} onChange={setImages} max={1} onProcessingChange={setIsProcessing} />
        {images.length > 0 && (
          <label className="block space-y-1">
            <span className="text-xs font-bold text-slate-800">Crédito de la foto <span className="font-normal text-slate-500">(opcional)</span></span>
            <input maxLength={120} value={imageCredit} onChange={(e) => setImageCredit(e.target.value)} placeholder="Ej: Foto: Juan Pérez / Unsplash" className={inputClass} />
          </label>
        )}

        <div className="grid sm:grid-cols-2 gap-3">
          <label className="block space-y-1">
            <span className="text-xs font-bold text-slate-800">Fuente *</span>
            <input required maxLength={80} value={sourceName} onChange={(e) => setSourceName(e.target.value)} placeholder="Ej: Ministerio de Transporte" className={inputClass} />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-bold text-slate-800">Enlace de la fuente *</span>
            <input required type="url" maxLength={500} value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder="https://..." className={inputClass} />
          </label>
        </div>

        {formError && <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2 font-semibold">{formError}</p>}

        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-full text-sm font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSaving || isProcessing}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5 rounded-full cursor-pointer flex items-center gap-1.5"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            {item ? 'Guardar cambios' : 'Publicar'}
          </button>
        </div>
      </form>
    </div>
  );
};
