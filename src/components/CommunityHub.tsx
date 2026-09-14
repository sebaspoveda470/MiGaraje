import React, { useState } from 'react';
import { 
  Users, 
  MessageSquare, 
  ThumbsUp, 
  Wrench, 
  HelpCircle, 
  Sparkles, 
  AlertCircle, 
  Send, 
  ShieldCheck, 
  PlusCircle, 
  Search, 
  ChevronRight, 
  X,
  Star,
  MapPin,
  Calendar,
  Share2
} from 'lucide-react';
import { BrandCommunity, CommunityPost, Vehicle } from '../types';

interface CommunityHubProps {
  communities: BrandCommunity[];
  activeVehicle: Vehicle | null;
  onSelectCommunity: (community: BrandCommunity) => void;
  onNavigateToTab: (tab: string) => void;
}

export const CommunityHub: React.FC<CommunityHubProps> = ({
  communities,
  activeVehicle,
  onSelectCommunity,
  onNavigateToTab,
}) => {
  // Default to the community matching activeVehicle brand or first community
  const initialCommunityId = activeVehicle 
    ? (communities.find((c) => c.brand.toLowerCase() === activeVehicle.brand.toLowerCase())?.id || communities[0].id)
    : communities[0].id;

  const [selectedClubId, setSelectedClubId] = useState<string>(initialCommunityId);
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [searchPost, setSearchPost] = useState<string>('');
  const [showNewPostModal, setShowNewPostModal] = useState<boolean>(false);

  // New Post Form State
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postCategory, setPostCategory] = useState<'mantenimiento' | 'fallas' | 'modificaciones' | 'rutas' | 'general'>('fallas');
  const [postModel, setPostModel] = useState('');

  // Local state for posts & comments interaction
  const currentCommunity = communities.find((c) => c.id === selectedClubId) || communities[0];
  const [posts, setPosts] = useState<CommunityPost[]>(currentCommunity.posts);
  const [likedPosts, setLikedPosts] = useState<{ [postId: string]: boolean }>({});
  const [expandedComments, setExpandedComments] = useState<{ [postId: string]: boolean }>({});
  const [newCommentText, setNewCommentText] = useState<{ [postId: string]: string }>({});

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
      
      {/* Community Hero: Clean Editorial Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs relative overflow-hidden flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="bg-slate-100 text-slate-900 border border-slate-200 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-600" /> Clubes & Comunidades por Marca
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 tracking-tight">
            La experiencia colectiva de propietarios de tu mismo vehículo
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
            Consulta fallas típicas, soluciones mecánicas verificadas, compatibilidad de repuestos y talleres recomendados por otros dueños en Colombia.
          </p>
        </div>

        <button
          onClick={() => setShowNewPostModal(true)}
          className="flex items-center gap-2 bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs px-6 py-3.5 rounded-xl shadow-xs transition-all shrink-0 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 text-lime-400" />
          <span>Publicar Consulta en el Club</span>
        </button>
      </div>

      {/* Brand Community Selector Pills: Clean White Cards */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
          <span>Selecciona un Club Automotriz:</span>
          {activeVehicle && (
            <span className="text-slate-500">Tu garaje activo: <strong className="text-slate-900">{activeVehicle.brand} {activeVehicle.model}</strong></span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {communities.map((comm) => {
            const isMatch = activeVehicle && comm.brand.toLowerCase() === activeVehicle.brand.toLowerCase();
            const isSelected = comm.id === selectedClubId;

            return (
              <button
                key={comm.id}
                onClick={() => {
                  setSelectedClubId(comm.id);
                  setPosts(comm.posts);
                }}
                className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-slate-950 text-white border-slate-950 shadow-md'
                    : 'bg-white text-slate-900 border-slate-200 hover:border-slate-300 shadow-xs'
                }`}
              >
                {isMatch && (
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-lime-400"></span>
                )}
                <div>
                  <img
                    src={comm.logo}
                    alt={comm.name}
                    className="w-8 h-8 rounded-lg object-cover mb-2 border border-slate-200"
                  />
                  <h4 className="text-xs font-bold line-clamp-1">{comm.name}</h4>
                  <p className={`text-[10px] ${isSelected ? 'text-slate-400' : 'text-slate-500'}`}>
                    {comm.membersCount.toLocaleString()} Miembros
                  </p>
                </div>
                {isMatch && (
                  <span className="text-[9px] font-bold text-lime-400 mt-2 inline-block">
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
              {['todos', 'fallas', 'mantenimiento', 'modificaciones', 'rutas'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-xl text-xs capitalize whitespace-nowrap transition-colors cursor-pointer border ${
                    selectedCategory === cat
                      ? 'bg-slate-900 text-white font-bold border-slate-900'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Posts Feed: Clean White Cards */}
          <div className="space-y-4">
            {posts
              .filter((p) => {
                if (selectedCategory !== 'todos' && p.category !== selectedCategory) return false;
                if (searchPost) {
                  const q = searchPost.toLowerCase();
                  return p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q);
                }
                return true;
              })
              .map((post) => (
                <div
                  key={post.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all space-y-4"
                >
                  {/* Author Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={post.authorAvatar}
                        alt={post.authorName}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-950">{post.authorName}</h4>
                          {post.authorBadge && (
                            <span className="text-[9px] bg-slate-100 text-slate-800 border border-slate-200 px-2 py-0.5 rounded-md font-bold">
                              {post.authorBadge}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500">
                          {post.authorCar} • <span>{post.createdAt}</span>
                        </p>
                      </div>
                    </div>

                    {post.specificModelTag && (
                      <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-slate-200 shrink-0">
                        {post.specificModelTag}
                      </span>
                    )}
                  </div>

                  {/* Post Content */}
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-black text-slate-950">{post.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line font-normal">{post.content}</p>
                  </div>

                  {/* Actions & Comment Trigger */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleToggleLike(post.id)}
                        className={`flex items-center gap-1.5 font-semibold transition-colors cursor-pointer ${
                          likedPosts[post.id] ? 'text-amber-600 font-bold' : 'hover:text-slate-900'
                        }`}
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span>{post.likes + (likedPosts[post.id] ? 1 : 0)} Me gusta</span>
                      </button>

                      <button
                        onClick={() => handleToggleComments(post.id)}
                        className="flex items-center gap-1.5 font-semibold hover:text-slate-900 transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>{post.comments.length} Respuestas</span>
                      </button>
                    </div>

                    <button
                      onClick={() => onNavigateToTab('repuestos')}
                      className="text-slate-800 hover:text-blue-600 font-bold flex items-center gap-1 text-[11px] cursor-pointer"
                    >
                      <Wrench className="w-3.5 h-3.5 text-blue-600" />
                      <span>Buscar Repuesto</span>
                    </button>
                  </div>

                  {/* Expanded Comments Thread */}
                  {expandedComments[post.id] && (
                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-3 animate-in fade-in duration-200">
                      <h5 className="text-xs font-bold text-slate-900">Respuestas de la Comunidad:</h5>
                      
                      <div className="space-y-2.5">
                        {post.comments.map((comment) => (
                          <div
                            key={comment.id}
                            className={`p-3.5 rounded-xl border space-y-1 text-xs ${
                              comment.isExpertAnswer
                                ? 'bg-amber-50/80 border-amber-200'
                                : 'bg-slate-50 border-slate-200 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-900">{comment.authorName}</span>
                                {comment.isExpertAnswer && (
                                  <span className="text-[9px] bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded font-black">
                                    Respuesta de Experto
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400">{comment.createdAt}</span>
                            </div>
                            <p className="leading-relaxed font-normal">{comment.content}</p>
                          </div>
                        ))}
                      </div>

                      {/* Add Comment Input */}
                      <div className="flex items-center gap-2 pt-2">
                        <input
                          type="text"
                          placeholder="Escribe tu respuesta o recomendación..."
                          value={newCommentText[post.id] || ''}
                          onChange={(e) =>
                            setNewCommentText((prev) => ({ ...prev, [post.id]: e.target.value }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddComment(post.id);
                          }}
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
                        />
                        <button
                          onClick={() => handleAddComment(post.id)}
                          className="p-2 bg-slate-950 text-white rounded-xl hover:bg-slate-800 cursor-pointer shadow-xs"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              ))}
          </div>

        </div>

        {/* Right Column: Verified Workshops and Common Issues */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Top Common Issues Checklist for this Brand */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-black text-slate-950 uppercase tracking-wider">
                Fallas Reportadas en {currentCommunity.brand}
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Patrones recurrentes validados por mecánicos y miembros del club:
            </p>
            <div className="space-y-2">
              {currentCommunity.commonIssues.map((issue, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="font-bold text-slate-900">{issue.issue}</div>
                  <div className="text-[11px] text-slate-600 mt-0.5">{issue.solution}</div>
                  <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                    <span>Modelo: {issue.affectedModel}</span>
                    <span className="text-blue-600 font-bold hover:underline cursor-pointer" onClick={() => onNavigateToTab('repuestos')}>
                      Ver repuesto →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Workshops */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-black text-slate-950 uppercase tracking-wider">
                Talleres Avalados por el Club
              </h3>
            </div>
            <div className="space-y-2.5">
              {currentCommunity.recommendedWorkshops.map((ws, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>{ws.name}</span>
                    <span className="flex items-center gap-1 text-amber-700">
                      <Star className="w-3 h-3 fill-amber-400" /> {ws.rating}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" /> {ws.location}
                  </div>
                  <div className="text-[11px] text-slate-500">{ws.specialty}</div>
                </div>
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
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
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
                    onChange={(e: any) => setPostCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
                  >
                    <option value="fallas">Diagnóstico de Fallas</option>
                    <option value="mantenimiento">Mantenimiento Preventivo</option>
                    <option value="modificaciones">Modificaciones / Tuning</option>
                    <option value="rutas">Rutas & Salidas</option>
                    <option value="general">General</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-900 mb-1">Modelo Específico</label>
                  <input
                    type="text"
                    placeholder="Ej: Corolla 2018"
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
                  placeholder="Explica qué síntoma notas, kilometraje, qué repuestos has cambiado y qué dudas tienes..."
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
                />
              </div>

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
                  className="bg-slate-950 hover:bg-slate-800 text-white font-bold px-5 py-2.5 rounded-xl shadow-xs cursor-pointer"
                >
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
