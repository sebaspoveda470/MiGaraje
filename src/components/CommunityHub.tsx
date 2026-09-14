import React, { useState } from 'react';
import { 
  Users, 
  MessageSquare, 
  ThumbsUp, 
  CheckCircle, 
  Search, 
  PlusCircle, 
  Wrench, 
  MapPin, 
  Star, 
  X, 
  Sparkles,
  Send,
  ShieldCheck
} from 'lucide-react';
import { CommunityPost, BrandCommunity, Vehicle } from '../types';
import { initialPosts } from '../data/initialData';

interface CommunityHubProps {
  communities: BrandCommunity[];
  activeVehicle: Vehicle | null;
  onSelectCommunity: (communityId: string) => void;
  onNavigateToTab: (tab: string) => void;
}

export const CommunityHub: React.FC<CommunityHubProps> = ({
  communities,
  activeVehicle,
  onNavigateToTab,
}) => {
  const [selectedClubId, setSelectedClubId] = useState<string>(() => {
    if (activeVehicle) {
      const match = communities.find(
        (c) => c.brand.toLowerCase() === activeVehicle.brand.toLowerCase()
      );
      if (match) return match.id;
    }
    return communities[0]?.id || 'club-mazda';
  });

  const [posts, setPosts] = useState<CommunityPost[]>(initialPosts);
  const [searchPost, setSearchPost] = useState('');
  const [postCategoryFilter, setPostCategoryFilter] = useState<string>('todos');
  const [showNewPostModal, setShowNewPostModal] = useState<boolean>(false);
  const [likedPosts, setLikedPosts] = useState<{ [key: string]: boolean }>({});
  const [expandedComments, setExpandedComments] = useState<{ [key: string]: boolean }>({});
  const [newCommentText, setNewCommentText] = useState<{ [key: string]: string }>({});

  // New post form state
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postModel, setPostModel] = useState(activeVehicle ? activeVehicle.model : '');
  const [postCategory, setPostCategory] = useState<string>('brico_diy');

  // Find active selected community
  const currentCommunity = communities.find((c) => c.id === selectedClubId) || communities[0];

  // Filter posts
  const filteredPosts = posts.filter((p) => {
    if (p.clubId && p.clubId !== currentCommunity.id) {
      return false;
    }
    if (postCategoryFilter !== 'todos' && p.category !== postCategoryFilter) {
      return false;
    }
    if (searchPost) {
      const q = searchPost.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchContent = p.content.toLowerCase().includes(q);
      const matchAuthor = p.authorName.toLowerCase().includes(q);
      const matchTag = p.specificModelTag?.toLowerCase().includes(q);
      if (!matchTitle && !matchContent && !matchAuthor && !matchTag) {
        return false;
      }
    }
    return true;
  });

  const handleToggleLike = (postId: string) => {
    setLikedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const handleToggleComments = (postId: string) => {
    setExpandedComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const handleAddComment = (postId: string) => {
    const text = newCommentText[postId];
    if (!text || !text.trim()) return;

    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id !== postId) return post;
        return {
          ...post,
          commentsCount: post.commentsCount + 1,
          comments: [
            ...post.comments,
            {
              id: `comm-resp-${Date.now()}`,
              authorName: 'Tú (Propietario)',
              authorCar: activeVehicle
                ? `${activeVehicle.brand} ${activeVehicle.model} ${activeVehicle.year}`
                : 'Miembro del Club',
              content: text.trim(),
              createdAt: 'Hace un momento',
              isExpertAnswer: false,
            },
          ],
        };
      })
    );

    setNewCommentText((prev) => ({ ...prev, [postId]: '' }));
  };

  const handleCreatePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) return;

    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      clubId: currentCommunity.id,
      clubName: currentCommunity.name,
      authorName: 'Tú (Propietario Verificado)',
      authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      authorCar: activeVehicle
        ? `${activeVehicle.brand} ${activeVehicle.model} ${activeVehicle.year}`
        : `${currentCommunity.brand} ${postModel || 'General'}`,
      authorBadge: 'Miembro Activo',
      title: postTitle.trim(),
      content: postContent.trim(),
      category: postCategory,
      likes: 1,
      commentsCount: 0,
      createdAt: 'Hace un momento',
      specificModelTag: postModel || currentCommunity.brand,
      comments: [],
    };

    setPosts((prev) => [newPost, ...prev]);
    setShowNewPostModal(false);
    setPostTitle('');
    setPostContent('');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Community Hero with Frosted Glass */}
      <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/15 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="absolute -top-16 -right-16 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="space-y-2 max-w-2xl relative z-10">
          <div className="flex items-center gap-2">
            <span className="bg-white/10 text-white border border-white/20 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-md">
              <Users className="w-4 h-4 text-emerald-400" /> Clubes & Comunidades por Marca y Modelo
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            La Experiencia Colectiva de Propietarios de tu Mismo Vehículo
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Descubre soluciones a fallas comunes, recomendaciones de repuestos exactos, talleres avalados y salidas grupales.
          </p>
        </div>

        <button
          onClick={() => setShowNewPostModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-3 rounded-2xl shadow-lg shadow-blue-600/30 border border-blue-500/30 transition-all shrink-0 cursor-pointer relative z-10"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Publicar / Consultar en el Club</span>
        </button>

      </div>

      {/* Brand Community Selector Pills with Frosted Glass */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
          <span>Selecciona un Club Automotriz:</span>
          {activeVehicle && (
            <span className="text-slate-300">Tu garaje activo: <strong className="text-white">{activeVehicle.brand} {activeVehicle.model}</strong></span>
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
                className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer backdrop-blur-md ${
                  isSelected
                    ? 'bg-blue-600/20 border-blue-400/40 shadow-xl ring-1 ring-blue-400/30'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                {isMatch && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                )}
                <div>
                  <img
                    src={comm.logo}
                    alt={comm.name}
                    className="w-8 h-8 rounded-xl object-cover mb-2 border border-white/15"
                  />
                  <h4 className="text-xs font-bold text-white line-clamp-1">{comm.name}</h4>
                  <p className="text-[10px] text-slate-400">{comm.membersCount.toLocaleString()} Miembros</p>
                </div>
                {isMatch && (
                  <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md mt-2 inline-block">
                    Tu Vehículo
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Community View: Feed + Recommendations & Verified Workshops */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Feed & Discussions */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Feed Filter Bar with Frosted Glass */}
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-3xl p-4 shadow-xl space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={`Buscar en discusiones de ${currentCommunity.name}...`}
                value={searchPost}
                onChange={(e) => setSearchPost(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder-slate-400 backdrop-blur-md focus:outline-none focus:border-blue-400/40"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
              {[
                { id: 'todos', label: 'Todo el Club' },
                { id: 'brico_diy', label: '🔧 Bricos & Reparación' },
                { id: 'recomendacion', label: '💡 Recomendaciones' },
                { id: 'falla_solucionada', label: '✅ Fallas Solucionadas' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setPostCategoryFilter(tab.id)}
                  className={`px-3.5 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    postCategoryFilter === tab.id
                      ? 'bg-blue-600 text-white font-bold backdrop-blur-md border border-blue-400/30 shadow'
                      : 'bg-white/5 text-slate-300 hover:text-white border border-white/5'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Posts Stream */}
          <div className="space-y-4">
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white/[0.04] hover:bg-white/[0.07] backdrop-blur-xl border border-white/10 hover:border-blue-400/30 rounded-3xl p-6 shadow-xl space-y-4 transition-all"
                >
                  {/* Post Author Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={post.authorAvatar}
                        alt={post.authorName}
                        className="w-10 h-10 rounded-full object-cover border border-white/15"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white">{post.authorName}</h4>
                          {post.authorBadge && (
                            <span className="text-[9px] bg-white/10 text-white border border-white/20 px-2 py-0.5 rounded-md font-bold backdrop-blur-md">
                              {post.authorBadge}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400">
                          {post.authorCar} • <span className="text-slate-500">{post.createdAt}</span>
                        </p>
                      </div>
                    </div>

                    {post.specificModelTag && (
                      <span className="bg-white/5 text-slate-300 text-[10px] font-bold px-3 py-1 rounded-full border border-white/10 shrink-0 backdrop-blur-md">
                        {post.specificModelTag}
                      </span>
                    )}
                  </div>

                  {/* Post Content */}
                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-white">{post.title}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{post.content}</p>
                  </div>

                  {/* Actions & Comment Trigger */}
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleToggleLike(post.id)}
                        className={`flex items-center gap-1.5 font-semibold transition-colors cursor-pointer ${
                          likedPosts[post.id] ? 'text-amber-400' : 'hover:text-white'
                        }`}
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span>{post.likes + (likedPosts[post.id] ? 1 : 0)} Me gusta</span>
                      </button>

                      <button
                        onClick={() => handleToggleComments(post.id)}
                        className="flex items-center gap-1.5 font-semibold hover:text-white transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>{post.comments.length} Respuestas</span>
                      </button>
                    </div>

                    <button
                      onClick={() => onNavigateToTab('repuestos')}
                      className="text-white hover:text-blue-300 font-semibold flex items-center gap-1 text-[11px] cursor-pointer"
                    >
                      <Wrench className="w-3 h-3 text-blue-400" />
                      <span>Buscar Repuesto en Marketplace</span>
                    </button>
                  </div>

                  {/* Expanded Comments Thread */}
                  {expandedComments[post.id] && (
                    <div className="mt-4 pt-4 border-t border-white/10 space-y-3 animate-in fade-in duration-200">
                      <h5 className="text-xs font-bold text-white">Respuestas de la Comunidad:</h5>
                      
                      <div className="space-y-2.5">
                        {post.comments.map((comment) => (
                          <div
                            key={comment.id}
                            className={`p-3.5 rounded-2xl border space-y-1.5 text-xs backdrop-blur-md ${
                              comment.isExpertAnswer
                                ? 'bg-amber-500/10 border-amber-500/30'
                                : 'bg-white/5 border-white/10 text-slate-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-white">{comment.authorName}</span>
                                {comment.isExpertAnswer && (
                                  <span className="text-[9px] bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded font-black">
                                    Respuesta de Experto
                                  </span>
                                )}
                                {comment.authorCar && (
                                  <span className="text-slate-400 text-[10px]">({comment.authorCar})</span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-500">{comment.createdAt}</span>
                            </div>
                            <p className="text-slate-200 text-xs leading-relaxed">{comment.content}</p>
                          </div>
                        ))}
                      </div>

                      {/* Add comment input */}
                      <div className="flex items-center gap-2 pt-2">
                        <input
                          type="text"
                          placeholder="Escribe tu aporte o experiencia con este modelo..."
                          value={newCommentText[post.id] || ''}
                          onChange={(e) => setNewCommentText({ ...newCommentText, [post.id]: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddComment(post.id);
                          }}
                          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-400 backdrop-blur-md focus:outline-none focus:border-blue-400/40"
                        />
                        <button
                          onClick={() => handleAddComment(post.id)}
                          className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow cursor-pointer"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              ))
            ) : (
              <div className="py-12 text-center bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl p-8 space-y-3">
                <Users className="w-10 h-10 text-slate-500 mx-auto" />
                <h4 className="text-base font-bold text-white">No hay publicaciones con estos filtros</h4>
                <p className="text-xs text-slate-400">Sé el primero en abrir un hilo de discusión en este club.</p>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Community Recommendations & Verified Workshops */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Community Vehicle Wisdom Card */}
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Recomendaciones del Club</h3>
            </div>

            <p className="text-xs text-slate-400">
              Consejos verificados por miembros y especialistas de <strong>{currentCommunity.name}</strong>:
            </p>

            <div className="space-y-2.5 text-xs text-slate-300">
              {(currentCommunity.recommendedTips || []).map((tip, idx) => (
                <div key={idx} className="p-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{tip}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Verified Workshops by Community */}
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-bold text-white">Talleres Avalados por el Club</h3>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Certificados
              </span>
            </div>

            <div className="space-y-3">
              {(currentCommunity.recommendedWorkshops || []).map((workshop) => (
                <div
                  key={workshop.id}
                  className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white">{workshop.name}</h4>
                    <span className="flex items-center gap-1 text-amber-400 font-bold">
                      <Star className="w-3 h-3 fill-amber-400" /> {workshop.rating}
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" /> {workshop.location} • {workshop.phone}
                  </p>
                  <div className="pt-1 flex items-center justify-between text-[10px]">
                    <span className="text-blue-300 font-medium">{workshop.specialty}</span>
                    <span className="text-slate-400">({workshop.reviewsCount} opiniones)</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigateToTab('repuestos')}
              className="w-full text-center text-xs font-semibold text-slate-300 hover:text-white py-1 cursor-pointer transition-colors"
            >
              Ver red completa de talleres y tiendas aliadas →
            </button>
          </div>

        </div>

      </div>

      {/* Create New Post Modal with Frosted Glass */}
      {showNewPostModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-slate-950/85 backdrop-blur-2xl border border-white/15 rounded-3xl max-w-lg w-full shadow-2xl p-6 relative my-8">
            <button
              onClick={() => setShowNewPostModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-2xl bg-white/10 text-white border border-white/15 backdrop-blur-md">
                <MessageSquare className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Publicar en {currentCommunity.name}</h3>
                <p className="text-xs text-slate-300">Comparte una duda, diagnóstico, brico o consulta de repuestos</p>
              </div>
            </div>

            <form onSubmit={handleCreatePostSubmit} className="space-y-4 text-xs text-slate-300">
              <div>
                <label className="block font-semibold text-slate-200 mb-1">Título de la Publicación *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Cambio de bujías o vibración en frío a 2000 RPM"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white backdrop-blur-md focus:outline-none focus:border-blue-400/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-200 mb-1">Modelo / Generación</label>
                  <input
                    type="text"
                    placeholder="Ej: Skyactiv 2.0 / V8 289"
                    value={postModel}
                    onChange={(e) => setPostModel(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white backdrop-blur-md focus:outline-none focus:border-blue-400/40"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-200 mb-1">Categoría</label>
                  <select
                    value={postCategory}
                    onChange={(e) => setPostCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-400/40"
                  >
                    <option value="brico_diy">Mantenimiento & Brico</option>
                    <option value="falla_solucionada">Falla Solucionada</option>
                    <option value="recomendacion">Recomendación de Repuesto</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-200 mb-1">Detalle o Explicación *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe los síntomas, kilometraje, qué pruebas has hecho o qué repuesto buscas..."
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white backdrop-blur-md focus:outline-none focus:border-blue-400/40"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewPostModal(false)}
                  className="px-4 py-2 text-slate-300 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-blue-600/30 border border-blue-500/30 cursor-pointer"
                >
                  Publicar en el Club
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
