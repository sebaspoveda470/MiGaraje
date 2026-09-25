import React, { useEffect, useState } from 'react';
import {
  Users,
  MessageSquare,
  ThumbsUp,
  Send,
  PlusCircle,
  Search,
  X,
  Lightbulb,
  ScrollText,
  Car,
  Trash2,
  Loader2,
} from 'lucide-react';
import { BrandCommunity, CommunityPost, PostComment, PostCategory, UserProfile, Vehicle } from '../types';
import {
  subscribeToClubPosts,
  createPost,
  deletePost,
  setPostLiked,
  subscribeToComments,
  addComment,
} from '../services/communityService';
import { timeAgo } from '../utils/media';

interface CommunityHubProps {
  communities: BrandCommunity[];
  activeVehicle: Vehicle | null;
  currentUserId: string | null;
  currentUser: UserProfile | null;
  isAdmin: boolean;
  requireAuth: () => boolean;
  onError: (message: string, err: unknown) => void;
}

const CATEGORY_LABELS: Record<PostCategory, string> = {
  fallas: 'Diagnóstico de Fallas',
  mantenimiento: 'Mantenimiento',
  modificaciones: 'Modificaciones',
  rutas: 'Rutas & Salidas',
  general: 'General',
};

const describeVehicle = (v: Vehicle | null) => (v ? `${v.brand} ${v.model} ${v.year}` : undefined);

const Avatar: React.FC<{ name: string; size?: 'sm' | 'md' }> = ({ name, size = 'md' }) => (
  <div
    className={`${size === 'md' ? 'w-10 h-10 text-sm rounded-xl' : 'w-7 h-7 text-[11px] rounded-lg'} bg-slate-950 text-white font-black flex items-center justify-center shrink-0`}
  >
    {(name || '?').charAt(0).toUpperCase()}
  </div>
);

/**
 * Comment thread for one post; subscribes only while expanded.
 */
const PostComments: React.FC<{
  post: CommunityPost;
  currentUserId: string | null;
  currentUser: UserProfile | null;
  activeVehicle: Vehicle | null;
  requireAuth: () => boolean;
  onError: (message: string, err: unknown) => void;
}> = ({ post, currentUserId, currentUser, activeVehicle, requireAuth, onError }) => {
  const [comments, setComments] = useState<PostComment[] | null>(null);
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    return subscribeToComments(post.id, setComments, (err) => onError('No se pudieron cargar las respuestas.', err));
  }, [post.id]);

  const handleSend = async () => {
    if (!text.trim() || isSending) return;
    if (!requireAuth() || !currentUserId || !currentUser) return;
    setIsSending(true);
    try {
      await addComment(post.id, {
        authorId: currentUserId,
        authorName: currentUser.fullName,
        authorCar: describeVehicle(activeVehicle),
        content: text.trim(),
      });
      setText('');
    } catch (err) {
      onError('No se pudo publicar tu respuesta.', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-slate-100 space-y-3 animate-in fade-in duration-200">
      <h5 className="text-xs font-bold text-slate-900">Respuestas de la Comunidad:</h5>

      {comments === null ? (
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Cargando respuestas...
        </div>
      ) : comments.length === 0 ? (
        <p className="text-xs text-slate-500">Aún no hay respuestas. ¡Sé el primero en ayudar!</p>
      ) : (
        <div className="space-y-2.5">
          {comments.map((comment) => (
            <div key={comment.id} className="p-3.5 rounded-xl border bg-slate-50 border-slate-200 text-slate-700 space-y-1 text-xs">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar name={comment.authorName} size="sm" />
                  <div className="min-w-0">
                    <span className="font-bold text-slate-900 block truncate">{comment.authorName}</span>
                    {comment.authorCar && <span className="text-[10px] text-slate-500 block truncate">{comment.authorCar}</span>}
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0">{timeAgo(comment.createdAt)}</span>
              </div>
              <p className="leading-relaxed font-normal whitespace-pre-line">{comment.content}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 pt-2">
        <input
          type="text"
          maxLength={2000}
          placeholder={currentUserId ? 'Escribe tu respuesta o recomendación...' : 'Inicia sesión para responder'}
          value={text}
          onFocus={() => {
            if (!currentUserId) requireAuth();
          }}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
        />
        <button
          onClick={handleSend}
          disabled={isSending}
          aria-label="Enviar respuesta"
          className="p-2 bg-slate-950 text-white rounded-xl hover:bg-slate-800 cursor-pointer shadow-xs disabled:opacity-60"
        >
          {isSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
};

export const CommunityHub: React.FC<CommunityHubProps> = ({
  communities,
  activeVehicle,
  currentUserId,
  currentUser,
  isAdmin,
  requireAuth,
  onError,
}) => {
  // Default to the community matching activeVehicle brand or first community
  const initialCommunityId = activeVehicle
    ? communities.find((c) => c.brand.toLowerCase() === activeVehicle.brand.toLowerCase())?.id || communities[0].id
    : communities[0].id;

  const [selectedClubId, setSelectedClubId] = useState<string>(initialCommunityId);
  const [selectedCategory, setSelectedCategory] = useState<PostCategory | 'todos'>('todos');
  const [searchPost, setSearchPost] = useState<string>('');
  const [showNewPostModal, setShowNewPostModal] = useState<boolean>(false);

  // New Post Form State
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postCategory, setPostCategory] = useState<PostCategory>('fallas');
  const [postModel, setPostModel] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);

  const currentCommunity = communities.find((c) => c.id === selectedClubId) || communities[0];
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [expandedComments, setExpandedComments] = useState<{ [postId: string]: boolean }>({});

  useEffect(() => {
    setPostsLoading(true);
    setPosts([]);
    return subscribeToClubPosts(
      selectedClubId,
      (clubPosts) => {
        setPosts(clubPosts);
        setPostsLoading(false);
      },
      (err) => {
        setPostsLoading(false);
        onError('No se pudieron cargar las publicaciones del club.', err);
      }
    );
  }, [selectedClubId]);

  const handleToggleLike = (post: CommunityPost) => {
    if (!requireAuth() || !currentUserId) return;
    const liked = post.likedBy.includes(currentUserId);
    setPostLiked(post.id, currentUserId, !liked).catch((err) => onError('No se pudo registrar tu "Me gusta".', err));
  };

  const handleToggleComments = (postId: string) => {
    setExpandedComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleDeletePost = (post: CommunityPost) => {
    if (!confirm(`¿Eliminar la publicación "${post.title}"?`)) return;
    deletePost(post.id).catch((err) => onError('No se pudo eliminar la publicación.', err));
  };

  const openNewPostModal = () => {
    if (!requireAuth()) return;
    setPostError(null);
    setShowNewPostModal(true);
  };

  const handleCreatePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) return;
    if (!requireAuth() || !currentUserId || !currentUser) return;

    setIsPosting(true);
    setPostError(null);
    try {
      await createPost({
        clubId: currentCommunity.id,
        authorId: currentUserId,
        authorName: currentUser.fullName,
        authorCar: describeVehicle(activeVehicle),
        title: postTitle.trim(),
        content: postContent.trim(),
        category: postCategory,
        modelTag: postModel.trim() || undefined,
      });
      setShowNewPostModal(false);
      setPostTitle('');
      setPostContent('');
      setPostModel('');
    } catch (err) {
      console.error(err);
      setPostError('No se pudo publicar. Revisa tu conexión e inténtalo de nuevo.');
    } finally {
      setIsPosting(false);
    }
  };

  const visiblePosts = posts.filter((p) => {
    if (selectedCategory !== 'todos' && p.category !== selectedCategory) return false;
    if (searchPost) {
      const q = searchPost.toLowerCase();
      return p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">

      {/* Community Hero: Clean Editorial Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs relative overflow-hidden flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="bg-slate-950 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-400" /> Mi Comunidad MiGaraje
            </span>
            <span className="text-xs text-slate-500 font-medium">Clubes de Marca • Colombia</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 tracking-tight">
            Mi Comunidad de Propietarios & Apasionados
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
            El espacio para compartir experiencias, resolver dudas mecánicas, recomendar talleres de confianza y organizar rodadas automotrices en Colombia.
          </p>
        </div>

        <button
          onClick={openNewPostModal}
          className="flex items-center gap-2 bg-slate-950 hover:bg-slate-800 active:scale-98 text-white font-bold text-xs px-6 py-3.5 rounded-xl shadow-xs transition-all shrink-0 cursor-pointer min-h-[46px]"
        >
          <PlusCircle className="w-4 h-4 text-blue-400" />
          <span>+ Publicar en Mi Comunidad</span>
        </button>
      </div>

      {/* Brand Community Selector Pills */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-slate-700 flex items-center justify-between gap-2">
          <span>Selecciona un Club Automotriz:</span>
          {activeVehicle && (
            <span className="text-slate-500 truncate">Tu garaje activo: <strong className="text-slate-900">{activeVehicle.brand} {activeVehicle.model}</strong></span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {communities.map((comm) => {
            const isMatch = activeVehicle && comm.brand.toLowerCase() === activeVehicle.brand.toLowerCase();
            const isSelected = comm.id === selectedClubId;

            return (
              <button
                key={comm.id}
                onClick={() => setSelectedClubId(comm.id)}
                className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-slate-950 text-white border-slate-950 shadow-md'
                    : 'bg-white text-slate-900 border-slate-200 hover:border-slate-300 shadow-xs'
                }`}
              >
                {isMatch && <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-blue-400"></span>}
                <div>
                  <img src={comm.logo} alt={comm.name} className="w-8 h-8 rounded-lg object-cover mb-2 border border-slate-200" />
                  <h4 className="text-xs font-bold line-clamp-2">{comm.name}</h4>
                  <p className={`text-[10px] mt-0.5 ${isSelected ? 'text-slate-400' : 'text-slate-500'}`}>{comm.brand}</p>
                </div>
                {isMatch && <span className="text-[9px] font-bold text-blue-400 mt-2 inline-block">Tu Vehículo</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Community View: Feed + Club Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Column: Feed & Discussions */}
        <div className="lg:col-span-8 space-y-6">

          {/* Active Club Spotlight Banner */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs flex items-center gap-4 min-w-0">
            <img src={currentCommunity.logo} alt={currentCommunity.name} className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0" />
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-black text-slate-950 truncate">{currentCommunity.name}</h2>
              <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{currentCommunity.description}</p>
              <div className="text-[11px] text-slate-500 font-semibold mt-1">
                {postsLoading ? 'Cargando…' : `${posts.length} ${posts.length === 1 ? 'publicación' : 'publicaciones'}`}
              </div>
            </div>
          </div>

          {/* Feed Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={`Buscar en discusiones de ${currentCommunity.name}...`}
                value={searchPost}
                onChange={(e) => setSearchPost(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              {(['todos', ...Object.keys(CATEGORY_LABELS)] as Array<PostCategory | 'todos'>).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-xl text-xs whitespace-nowrap transition-colors cursor-pointer border ${
                    selectedCategory === cat
                      ? 'bg-slate-900 text-white font-bold border-slate-900'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cat === 'todos' ? 'Todos' : CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>

          {/* Posts Feed */}
          <div className="space-y-4">
            {postsLoading && (
              <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500 font-semibold">
                <Loader2 className="w-5 h-5 animate-spin" /> Cargando publicaciones...
              </div>
            )}

            {!postsLoading && posts.length === 0 && (
              <div className="text-center py-12 bg-white border border-slate-200 rounded-2xl p-8">
                <MessageSquare className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-950">Este club aún no tiene publicaciones</h3>
                <p className="text-xs text-slate-500 mt-1 mb-4">Haz la primera pregunta o comparte tu experiencia con otros propietarios.</p>
                <button onClick={openNewPostModal} className="bg-slate-950 text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer">
                  + Publicar en {currentCommunity.name}
                </button>
              </div>
            )}

            {!postsLoading && posts.length > 0 && visiblePosts.length === 0 && (
              <p className="text-center text-xs text-slate-500 py-8">No hay publicaciones con estos filtros.</p>
            )}

            {visiblePosts.map((post) => {
              const liked = !!currentUserId && post.likedBy.includes(currentUserId);
              const canDelete = isAdmin || (!!currentUserId && post.authorId === currentUserId);
              return (
                <div
                  key={post.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all space-y-4"
                >
                  {/* Author Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar name={post.authorName} />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-950 truncate">{post.authorName}</h4>
                        <p className="text-[10px] text-slate-500 truncate">
                          {post.authorCar ? `${post.authorCar} • ` : ''}
                          <span>{timeAgo(post.createdAt)}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-slate-200">
                        {post.modelTag || CATEGORY_LABELS[post.category] || 'General'}
                      </span>
                      {canDelete && (
                        <button
                          onClick={() => handleDeletePost(post)}
                          title="Eliminar publicación"
                          className="w-7 h-7 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-black text-slate-950">{post.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line font-normal">{post.content}</p>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center gap-4 text-xs text-slate-500">
                    <button
                      onClick={() => handleToggleLike(post)}
                      className={`flex items-center gap-1.5 font-semibold transition-colors cursor-pointer ${
                        liked ? 'text-blue-600 font-bold' : 'hover:text-slate-900'
                      }`}
                    >
                      <ThumbsUp className={`w-4 h-4 ${liked ? 'fill-blue-600' : ''}`} />
                      <span>{post.likedBy.length} Me gusta</span>
                    </button>

                    <button
                      onClick={() => handleToggleComments(post.id)}
                      className="flex items-center gap-1.5 font-semibold hover:text-slate-900 transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>{post.commentsCount} {post.commentsCount === 1 ? 'Respuesta' : 'Respuestas'}</span>
                    </button>
                  </div>

                  {expandedComments[post.id] && (
                    <PostComments
                      post={post}
                      currentUserId={currentUserId}
                      currentUser={currentUser}
                      activeVehicle={activeVehicle}
                      requireAuth={requireAuth}
                      onError={onError}
                    />
                  )}
                </div>
              );
            })}
          </div>

        </div>

        {/* Right Column: Club Tips, Rules and Models */}
        <div className="lg:col-span-4 space-y-6">

          {currentCommunity.recommendedTips && currentCommunity.recommendedTips.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-black text-slate-950 uppercase tracking-wider">Consejos para {currentCommunity.brand}</h3>
              </div>
              <div className="space-y-2">
                {currentCommunity.recommendedTips.map((tip, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                    {tip}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <ScrollText className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-black text-slate-950 uppercase tracking-wider">Normas del Club</h3>
            </div>
            <ul className="space-y-2 text-xs text-slate-600 list-disc pl-4">
              {currentCommunity.rules.map((rule, idx) => (
                <li key={idx}>{rule}</li>
              ))}
            </ul>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <Car className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-black text-slate-950 uppercase tracking-wider">Modelos del Club</h3>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {currentCommunity.models.map((m) => (
                <span key={m} className="text-[11px] bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-lg font-semibold">
                  {m}
                </span>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* New Post Modal */}
      {showNewPostModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full shadow-2xl p-6 relative">
            <button
              onClick={() => setShowNewPostModal(false)}
              aria-label="Cerrar"
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4 pr-6">
              <div className="p-2.5 rounded-2xl bg-slate-100 text-slate-900">
                <Users className="w-6 h-6 text-slate-900" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-950">Publicar en {currentCommunity.name}</h3>
                <p className="text-xs text-slate-500">Recibe respuestas de propietarios y mecánicos en Colombia</p>
              </div>
            </div>

            <form onSubmit={handleCreatePostSubmit} className="space-y-4 text-xs text-slate-700">
              <div>
                <label className="block font-semibold text-slate-900 mb-1">Título de la consulta o aporte *</label>
                <input
                  type="text"
                  required
                  maxLength={200}
                  placeholder="Ej: Ruido seco en tren delantero al pasar baches a baja velocidad"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-900 mb-1">Categoría</label>
                  <select
                    value={postCategory}
                    onChange={(e) => setPostCategory(e.target.value as PostCategory)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
                  >
                    {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-900 mb-1">Modelo Específico</label>
                  <input
                    type="text"
                    maxLength={60}
                    placeholder={activeVehicle ? `${activeVehicle.model} ${activeVehicle.year}` : 'Ej: Corolla 2018'}
                    value={postModel}
                    onChange={(e) => setPostModel(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-900 mb-1">Descripción detallada *</label>
                <textarea
                  rows={4}
                  required
                  maxLength={5000}
                  placeholder="Explica qué síntoma notas, kilometraje, qué repuestos has cambiado y qué dudas tienes..."
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
                />
              </div>

              {postError && (
                <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2 font-semibold">{postError}</p>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewPostModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPosting}
                  className="bg-slate-950 hover:bg-slate-800 text-white font-bold px-5 py-2.5 rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
                >
                  {isPosting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Publicar en la Comunidad
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
