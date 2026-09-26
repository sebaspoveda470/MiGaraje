import React, { useEffect, useState } from 'react';
import { X, Check, ShoppingCart, BadgeCheck, Loader2, Pencil, Trash2, MessageSquare } from 'lucide-react';
import { CareProduct, ProductReview, UserProfile } from '../types';
import { StarRating } from './StarRating';
import { PhotoGallery } from './PhotoPicker';
import { ShareButtons } from './ShareButtons';
import { useConfirm } from './ConfirmDialog';
import { saveReview, deleteReview, findOrderWithProduct, summarizeRatings } from '../services/reviewService';
import { timeAgo } from '../utils/media';

interface ProductDetailModalProps {
  product: CareProduct;
  reviews: ProductReview[];
  currentUserId: string | null;
  currentUser: UserProfile | null;
  isAdmin: boolean;
  requireAuth: () => boolean;
  whatsAppButton: React.ReactNode;
  onAddToCart: () => void;
  onClose: () => void;
  onError: (message: string, err: unknown) => void;
}

export function getProductImages(product: CareProduct): string[] {
  return product.images && product.images.length > 0 ? product.images : [product.image];
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  reviews,
  currentUserId,
  currentUser,
  isAdmin,
  requireAuth,
  whatsAppButton,
  onAddToCart,
  onClose,
  onError,
}) => {
  const images = getProductImages(product);
  const confirmAction = useConfirm();
const summary = summarizeRatings(reviews);
  const myReview = currentUserId ? reviews.find((r) => r.userId === currentUserId) : undefined;

  // Review form
  const [isEditing, setIsEditing] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    setIsEditing(false);
  }, [product.id]);

  const startReview = () => {
    if (!requireAuth()) return;
    setRating(myReview?.rating || 0);
    setComment(myReview?.comment || '');
    setFormError(null);
    setIsEditing(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId || !currentUser) return;
    if (rating < 1) {
      setFormError('Elige de 1 a 5 estrellas.');
      return;
    }
    setIsSaving(true);
    setFormError(null);
    try {
      let orderId = myReview?.orderId;
      if (!orderId) {
        orderId = await findOrderWithProduct(currentUserId, product.id).catch(() => undefined);
      }
      await saveReview(
        {
          productId: product.id,
          userId: currentUserId,
          userName: currentUser.fullName,
          rating,
          comment: comment.trim(),
          orderId,
        },
        !myReview
      );
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      setFormError('No se pudo guardar tu reseña. Inténtalo de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (review: ProductReview) => {
    const own = review.userId === currentUserId;
    const ok = await confirmAction(own ? 'Tu reseña dejará de aparecer en este producto.' : `Se eliminará la reseña de ${review.userName}.`, {
      title: '¿Eliminar reseña?',
      confirmLabel: 'Eliminar',
      danger: true,
    });
    if (!ok) return;
    deleteReview(review.id).catch((err) => onError('No se pudo eliminar la reseña.', err));
  };

  const distribution = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((r) => r.rating === stars).length,
  }));

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full shadow-2xl p-6 sm:p-8 relative max-h-[92dvh] overflow-y-auto">
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-4 right-4 z-10 text-slate-400 hover:text-slate-800 cursor-pointer p-1 rounded-full hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Gallery */}
          <div className="space-y-3">
            <PhotoGallery
              key={product.id}
              images={images}
              alt={product.name}
              overlay={
                <div className="absolute top-3 left-3 bg-slate-950 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                  MiGaraje
                </div>
              }
            />

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
              <div className="font-bold text-slate-900">Presentación</div>
              <div className="text-slate-600">{product.volume || 'Consultar presentación'}</div>
            </div>
          </div>

          {/* Info */}
          <div className="space-y-4 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">{product.subcategory}</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight mt-1 pr-6">{product.name}</h2>
              <div className="mt-2">
                <ShareButtons
                  type="producto"
                  id={product.id}
                  text={`Mira ${product.name} de MiGaraje:`}
                  compact
                />
              </div>

              {summary.count > 0 ? (
                <a href="#resenas" className="flex items-center gap-2 mt-2 text-xs text-slate-600 hover:underline">
                  <StarRating value={summary.average} size="sm" />
                  <span className="font-bold text-slate-900">{summary.average.toFixed(1)}</span>
                  <span>({summary.count} {summary.count === 1 ? 'reseña' : 'reseñas'})</span>
                </a>
              ) : (
                <p className="mt-2 text-xs text-slate-500">Aún sin reseñas</p>
              )}

              <div className="text-2xl font-black text-slate-950 mt-2 flex items-center gap-2 flex-wrap">
                <span>
                  ${product.price.toLocaleString('es-CO')} <span className="text-sm font-normal text-slate-500">COP</span>
                </span>
                {product.inStock === false && (
                  <span className="text-[10px] font-black bg-slate-900 text-white px-2 py-0.5 rounded-full tracking-wider">AGOTADO</span>
                )}
              </div>

              {product.description && <p className="text-xs text-slate-600 mt-3 leading-relaxed whitespace-pre-line">{product.description}</p>}

              {product.benefits && product.benefits.length > 0 && (
                <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3">
                  <div className="text-xs font-bold text-slate-900">Beneficios Clave:</div>
                  {product.benefits.map((b, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                      <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              )}

              {product.applicationGuide && product.applicationGuide.length > 0 && (
                <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3">
                  <div className="text-xs font-bold text-slate-900">Modo de Uso:</div>
                  {product.applicationGuide.map((step, idx) => (
                    <div key={idx} className="text-[11px] text-slate-500">
                      {idx + 1}. {step}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-200 space-y-2">
              {whatsAppButton}
              <button
                onClick={onAddToCart}
                disabled={product.inStock === false}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 border border-slate-200 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>{product.inStock === false ? 'Producto agotado' : 'Agregar al carrito'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <section id="resenas" className="mt-8 pt-6 border-t border-slate-200 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-base font-black text-slate-950 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              Reseñas de compradores
            </h3>
            {!isEditing && (
              <button
                onClick={startReview}
                className="bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Pencil className="w-3.5 h-3.5 text-blue-400" />
                {myReview ? 'Editar mi reseña' : 'Escribir una reseña'}
              </button>
            )}
          </div>

          {summary.count > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-center sm:border-r sm:border-slate-200">
                <div className="text-4xl font-black text-slate-950">{summary.average.toFixed(1)}</div>
                <div className="flex justify-center mt-1">
                  <StarRating value={summary.average} />
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {summary.count} {summary.count === 1 ? 'reseña' : 'reseñas'}
                </div>
              </div>
              <div className="sm:col-span-2 space-y-1">
                {distribution.map((row) => (
                  <div key={row.stars} className="flex items-center gap-2 text-[11px] text-slate-600">
                    <span className="w-8 shrink-0 whitespace-nowrap">{row.stars} ★</span>
                    <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(row.count / summary.count) * 100}%` }} />
                    </div>
                    <span className="w-6 text-right shrink-0">{row.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isEditing && (
            <form onSubmit={handleSubmit} className="p-4 rounded-2xl border border-blue-200 bg-blue-50/50 space-y-3 text-xs">
              <div>
                <div className="font-bold text-slate-900 mb-1">Tu calificación *</div>
                <StarRating value={rating} size="lg" onChange={setRating} />
              </div>
              <div>
                <label className="block font-bold text-slate-900 mb-1">Tu opinión (opcional)</label>
                <textarea
                  rows={3}
                  maxLength={1000}
                  placeholder="¿Cómo te fue con el producto? ¿Lo recomendarías?"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-slate-400 resize-none"
                />
              </div>
              {formError && <p className="text-red-700 font-semibold">{formError}</p>}
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 font-bold text-slate-600 hover:text-slate-900 cursor-pointer">
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {myReview ? 'Guardar cambios' : 'Publicar reseña'}
                </button>
              </div>
            </form>
          )}

          {reviews.length === 0 && !isEditing && (
            <p className="text-xs text-slate-500">Nadie ha opinado todavía. ¿Ya lo probaste? ¡Sé el primero en dejar tu reseña!</p>
          )}

          <div className="space-y-3">
            {reviews.map((review) => {
              const canDelete = isAdmin || review.userId === currentUserId;
              return (
                <div key={review.id} className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2 text-xs">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-slate-950 text-white font-black flex items-center justify-center shrink-0">
                        {review.userName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-950 truncate flex items-center gap-1.5">
                          {review.userName}
                          {review.userId === currentUserId && <span className="text-[10px] text-slate-400 font-normal">(tú)</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          <StarRating value={review.rating} size="sm" />
                          <span className="text-[10px] text-slate-400">{timeAgo(review.updatedAt || review.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {review.orderId && (
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <BadgeCheck className="w-3 h-3" /> Compra por MiGaraje
                        </span>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(review)}
                          title="Eliminar reseña"
                          className="w-7 h-7 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  {review.comment && <p className="text-slate-700 leading-relaxed whitespace-pre-line">{review.comment}</p>}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};
