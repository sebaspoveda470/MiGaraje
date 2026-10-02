import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, MapPin, Gauge, Star, MessageSquare, ThumbsUp, Clock } from 'lucide-react';
import { CareProduct, CommunityClub, CommunityPost, VehicleListing } from '../types';
import { subscribeToCommunities, subscribeToRecentPosts } from '../services/communityService';
import { timeAgo } from '../utils/media';

interface HomeShowcaseProps {
  listings: VehicleListing[];
  products: CareProduct[];
  onOpenListing: (id: string) => void;
  onOpenProduct: (id: string) => void;
  onOpenCommunity: (id: string) => void;
  onNavigate: (tab: string) => void;
}

const money = (n: number) => `$${n.toLocaleString('es-CO')}`;

const SectionTitle: React.FC<{ title: string; subtitle: string; action: string; onAction: () => void }> = ({ title, subtitle, action, onAction }) => (
  <div data-reveal className="flex items-end justify-between gap-3">
    <div>
      <h2 className="text-2xl sm:text-3xl font-semibold text-slate-950 tracking-tight">{title}</h2>
      <p className="text-xs sm:text-sm text-slate-500 mt-1">{subtitle}</p>
    </div>
    <button
      onClick={onAction}
      className="shrink-0 text-xs sm:text-sm font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-1 cursor-pointer whitespace-nowrap"
    >
      {action} <ArrowRight className="w-4 h-4" />
    </button>
  </div>
);

// Phones swipe sideways; larger screens show a grid
const rowClass =
  'flex sm:grid gap-3 sm:gap-4 overflow-x-auto sm:overflow-visible snap-x snap-mandatory scrollbar-none -mx-4 px-4 pb-1 sm:mx-0 sm:px-0 sm:pb-0';
const cardClass =
  'w-[78%] shrink-0 snap-start sm:w-auto text-left bg-white rounded-3xl overflow-hidden border border-slate-200/70 shadow-xs hover:shadow-md transition-shadow cursor-pointer group';

/**
 * Home page preview of what the site has right now: latest vehicles for sale,
 * MiGaraje products and the newest community posts. Each block hides itself while empty.
 */
export const HomeShowcase: React.FC<HomeShowcaseProps> = ({ listings, products, onOpenListing, onOpenProduct, onOpenCommunity, onNavigate }) => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [communities, setCommunities] = useState<CommunityClub[]>([]);

  useEffect(() => {
    const stopPosts = subscribeToRecentPosts(3, setPosts, (err) => console.error('No se pudieron cargar las publicaciones', err));
    const stopClubs = subscribeToCommunities(setCommunities, (err) => console.error('No se pudieron cargar las comunidades', err));
    return () => {
      stopPosts();
      stopClubs();
    };
  }, []);

  const latestListings = useMemo(
    () =>
      listings
        .filter((l) => l.status !== 'vendido')
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
        .slice(0, 3),
    [listings]
  );
  const featuredProducts = useMemo(() => products.filter((p) => p.inStock).slice(0, 4), [products]);
  const clubById = useMemo(() => new Map(communities.map((c) => [c.id, c])), [communities]);
  const topCommunities = communities.slice(0, 4);

  return (
    <div className="space-y-10 sm:space-y-14">
      {latestListings.length > 0 && (
        <section className="space-y-4">
          <SectionTitle
            title="Vehículos en venta"
            subtitle="Publicados por sus propietarios. Contacta directo por WhatsApp."
            action="Ver todos"
            onAction={() => onNavigate('vehiculos')}
          />
          <div className={`${rowClass} sm:grid-cols-2 lg:grid-cols-3`}>
            {latestListings.map((car) => (
              <button key={car.id} data-reveal onClick={() => onOpenListing(car.id)} className={cardClass}>
                <div className="aspect-[16/10] overflow-hidden bg-slate-100">
                  <img src={car.images[0]} alt={car.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-4 sm:p-5 space-y-2">
                  <div className="text-base font-semibold text-slate-950 line-clamp-1">{car.title}</div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                    <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {car.city || car.location}</span>
                    <span className="inline-flex items-center gap-1"><Gauge className="w-3.5 h-3.5" /> {car.mileage.toLocaleString('es-CO')} km</span>
                  </div>
                  <div className="text-lg font-semibold text-slate-950 tracking-tight">
                    {money(car.price)} <span className="text-[11px] font-medium text-slate-400">COP</span>
                  </div>
                </div>
              </button>
            ))}
            {latestListings.length < 3 && (
              <button
                onClick={() => onNavigate('vehiculos')}
                className="w-[70%] shrink-0 snap-start sm:w-auto rounded-3xl border-2 border-dashed border-slate-300 bg-white/50 hover:bg-white hover:border-blue-400 text-slate-500 hover:text-blue-700 flex flex-col items-center justify-center gap-1.5 p-6 text-center cursor-pointer transition-all min-h-[220px]"
              >
                <span className="text-sm font-semibold">¿Vendes tu vehículo?</span>
                <span className="text-xs">Publícalo gratis y aparece aquí</span>
              </button>
            )}
          </div>
        </section>
      )}

      {featuredProducts.length > 0 && (
        <section className="space-y-4">
          <SectionTitle
            title="Productos MiGaraje"
            subtitle="Para que tu vehículo luzca como nuevo. Pedidos por WhatsApp."
            action="Ver catálogo"
            onAction={() => onNavigate('productos')}
          />
          <div className={`${rowClass} sm:grid-cols-2 lg:grid-cols-4`}>
            {featuredProducts.map((p) => (
              <button key={p.id} data-reveal onClick={() => onOpenProduct(p.id)} className={`${cardClass} !w-[62%] sm:!w-auto`}>
                <div className="aspect-square overflow-hidden bg-slate-100">
                  <img src={p.images?.[0] || p.image} alt={p.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-4 space-y-1.5">
                  <div className="text-sm font-semibold text-slate-950 line-clamp-1">{p.name}</div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-base font-semibold text-slate-950">{money(p.price)}</span>
                    {p.reviewsCount > 0 && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {p.rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {communities.length > 0 && (
        <section className="space-y-4">
          <SectionTitle
            title="Lo último en la comunidad"
            subtitle="Preguntas y experiencias de otros propietarios."
            action="Ir a Mi Comunidad"
            onAction={() => onNavigate('comunidades')}
          />
          {posts.length > 0 ? (
            <div className={`${rowClass} sm:grid-cols-2 lg:grid-cols-3`}>
              {posts.map((post) => {
                const club = clubById.get(post.clubId);
                return (
                  <button key={post.id} data-reveal onClick={() => onOpenCommunity(post.clubId)} className={`${cardClass} p-4 sm:p-5 space-y-2.5`}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center shrink-0">
                        {(post.authorName || '?').charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-900 truncate">{post.authorName}</div>
                        <div className="text-[11px] text-slate-500 truncate inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {timeAgo(post.createdAt)}
                          {club ? ` · ${club.name}` : ''}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-slate-950 line-clamp-2">{post.title}</div>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{post.content}</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
                      <span className="inline-flex items-center gap-1"><ThumbsUp className="w-3.5 h-3.5" /> {post.likedBy.length}</span>
                      <span className="inline-flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> {post.commentsCount}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            // No posts yet: invite people into the communities instead of showing an empty block
            <div className={`${rowClass} sm:grid-cols-2 lg:grid-cols-4`}>
              {topCommunities.map((c) => (
                <button key={c.id} data-reveal onClick={() => onOpenCommunity(c.id)} className={`${cardClass} !w-[62%] sm:!w-auto`}>
                  <div className="aspect-[16/9] overflow-hidden bg-gradient-to-br from-blue-600 to-blue-900">
                    {c.coverImage && <img src={c.coverImage} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                  </div>
                  <div className="p-4">
                    <div className="text-sm font-semibold text-slate-950 line-clamp-2">{c.name}</div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      {c.memberIds.length} {c.memberIds.length === 1 ? 'miembro' : 'miembros'} · Sé el primero en preguntar
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};
