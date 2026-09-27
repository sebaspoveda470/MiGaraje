import React, { useEffect, useMemo, useState } from 'react';
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
  Check,
  UserPlus,
  LogOut,
  Flag,
  Sparkles,
  ArrowRight,
  HandHelping,
  MessagesSquare,
  Clock,
  Flame,
} from 'lucide-react';
import { CommunityClub, CommunityMember, CommunityPost, PostComment, PostCategory, UserProfile, Vehicle } from '../types';
import {
  subscribeToCommunities,
  createCommunity,
  deleteCommunity,
  setCommunityMembership,
  seedInitialCommunities,
  subscribeToClubPosts,
  subscribeToRecentPosts,
  subscribeToMembers,
  saveMemberCard,
  createPost,
  deletePost,
  setPostLiked,
  subscribeToComments,
  addComment,
  MemberCard,
} from '../services/communityService';
import { timeAgo } from '../utils/media';
import { CreateCommunityModal } from './CreateCommunityModal';
import { ShareButtons } from './ShareButtons';
import { useConfirm } from './ConfirmDialog';
import { useReport } from './ReportDialog';
import { syncDeepLink } from '../utils/shareLinks';
import { SectionGlow, SectionHero, heroGlassClass } from './SectionArt';

interface CommunityHubProps {
  activeVehicle: Vehicle | null;
  currentUserId: string | null;
  currentUser: UserProfile | null;
  isAdmin: boolean;
  requireAuth: () => boolean;
  onError: (message: string, err: unknown) => void;
  onNotify: (message: string) => void;
  initialCommunityId?: string | null;
}

const CATEGORY_LABELS: Record<PostCategory, string> = {
  fallas: 'Diagnóstico de Fallas',
  mantenimiento: 'Mantenimiento',
  modificaciones: 'Modificaciones',
  rutas: 'Rutas & Salidas',
  general: 'General',
};

// Latest posts of all communities: the public feed and the per-community counters
const RECENT_POSTS = 200;
const DAY = 24 * 60 * 60 * 1000;

const describeVehicle = (v: Vehicle | null) => (v ? `${v.brand} ${v.model} ${v.year}` : undefined);
const exactDate = (ms: number) =>
  new Date(ms).toLocaleString('es-CO', { day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit' });
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

// A stable color per person so avatars are easy to tell apart
const AVATAR_COLORS = ['bg-blue-600', 'bg-emerald-600', 'bg-amber-500', 'bg-rose-500', 'bg-violet-600', 'bg-sky-600', 'bg-slate-900'];
const colorFor = (seed: string) => AVATAR_COLORS[[...seed].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % AVATAR_COLORS.length];

const Avatar: React.FC<{ name: string; seed?: string; size?: 'xs' | 'sm' | 'md' }> = ({ name, seed, size = 'md' }) => (
  <div
    className={`${
      size === 'md' ? 'w-10 h-10 text-sm' : size === 'sm' ? 'w-7 h-7 text-[11px]' : 'w-6 h-6 text-[10px] ring-2 ring-white'
    } ${colorFor(seed || name)} rounded-full text-white font-bold flex items-center justify-center shrink-0`}
    title={name}
  >
    {(name || '?').charAt(0).toUpperCase()}
  </div>
);

/** Community logo; falls back to its initial when the image is missing or broken. */
const CommunityLogo: React.FC<{ club: CommunityClub; className: string }> = ({ club, className }) => {
  const [broken, setBroken] = useState(false);
  if (!club.logo || broken) {
    return (
      <div className={`${className} ${colorFor(club.id)} text-white font-bold flex items-center justify-center`} aria-hidden="true">
        {club.name.charAt(0).toUpperCase()}
      </div>
    );
  }
  return <img src={club.logo} alt={club.name} onError={() => setBroken(true)} className={`${className} object-cover`} />;
};

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
  const report = useReport();
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
      {comments === null ? (
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Cargando respuestas...
        </div>
      ) : comments.length === 0 ? (
        <p className="text-xs text-slate-500">Aún no hay respuestas. ¡Sé el primero en ayudar!</p>
      ) : (
        <div className="space-y-2.5">
          {comments.map((comment) => (
            <div key={comment.id} className="flex items-start gap-2.5 text-xs">
              <Avatar name={comment.authorName} seed={comment.authorId} size="sm" />
              <div className="flex-1 min-w-0 rounded-2xl bg-slate-100 px-3.5 py-2.5 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="font-bold text-slate-900">{comment.authorName}</span>
                    {comment.authorCar && <span className="text-[10px] text-slate-500"> · {comment.authorCar}</span>}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[10px] text-slate-400" title={exactDate(comment.createdAt)}>
                      {timeAgo(comment.createdAt)}
                    </span>
                    {comment.authorId !== currentUserId && (
                      <button
                        onClick={() => report({ type: 'comment', id: comment.id, parentId: post.id, title: comment.content.slice(0, 120), ownerId: comment.authorId })}
                        title="Reportar"
                        aria-label="Reportar"
                        className="w-6 h-6 rounded-full text-slate-300 hover:text-red-600 hover:bg-red-50 flex items-center justify-center cursor-pointer"
                      >
                        <Flag className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="leading-relaxed text-slate-700 whitespace-pre-line">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 pt-1">
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
          className="flex-1 bg-slate-100 border border-transparent rounded-full px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-300 focus:bg-white"
        />
        <button
          onClick={handleSend}
          disabled={isSending}
          aria-label="Enviar respuesta"
          className="w-9 h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center cursor-pointer disabled:opacity-60 shrink-0"
        >
          {isSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
};

/**
 * One post: who wrote it (name and vehicle), when, in which community, and the conversation.
 */
const PostCard: React.FC<{
  post: CommunityPost;
  community?: CommunityClub;
  showCommunity: boolean;
  currentUserId: string | null;
  currentUser: UserProfile | null;
  activeVehicle: Vehicle | null;
  isAdmin: boolean;
  requireAuth: () => boolean;
  onError: (message: string, err: unknown) => void;
  onOpenCommunity: (id: string) => void;
  onToggleLike: (post: CommunityPost) => void;
  onDelete: (post: CommunityPost) => void;
}> = ({ post, community, showCommunity, currentUserId, currentUser, activeVehicle, isAdmin, requireAuth, onError, onOpenCommunity, onToggleLike, onDelete }) => {
  const report = useReport();
  const [showComments, setShowComments] = useState(false);
  const liked = !!currentUserId && post.likedBy.includes(currentUserId);
  const canDelete = isAdmin || (!!currentUserId && post.authorId === currentUserId);
  const isNew = Date.now() - post.createdAt < DAY;

  return (
    <article data-reveal className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-200/70 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar name={post.authorName} seed={post.authorId} />
          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-900 truncate">{post.authorName}</div>
            <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-x-1.5">
              {post.authorCar && (
                <span className="inline-flex items-center gap-1">
                  <Car className="w-3 h-3" /> {post.authorCar}
                </span>
              )}
              {post.authorCar && <span>·</span>}
              <span title={exactDate(post.createdAt)} className="inline-flex items-center gap-1">
                <Clock className="w-3 h-3" /> {timeAgo(post.createdAt)}
              </span>
              {isNew && <span className="text-[9px] font-bold uppercase tracking-wider bg-blue-600 text-white px-1.5 py-0.5 rounded-full">Nuevo</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {canDelete ? (
            <button
              onClick={() => onDelete(post)}
              title="Eliminar publicación"
              className="w-8 h-8 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => report({ type: 'post', id: post.id, parentId: post.clubId, title: post.title, ownerId: post.authorId })}
              title="Reportar"
              aria-label="Reportar"
              className="w-8 h-8 rounded-full text-slate-300 hover:text-red-600 hover:bg-red-50 flex items-center justify-center cursor-pointer"
            >
              <Flag className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {showCommunity && community && (
          <button
            onClick={() => onOpenCommunity(community.id)}
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-100 hover:bg-blue-100 pl-1 pr-2.5 py-0.5 rounded-full cursor-pointer"
          >
            <CommunityLogo club={community} className="w-4 h-4 rounded-full text-[8px]" />
            {community.name}
          </button>
        )}
        <span className="text-[11px] font-semibold bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full">
          {CATEGORY_LABELS[post.category] || 'General'}
        </span>
        {post.modelTag && <span className="text-[11px] font-semibold bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full">{post.modelTag}</span>}
      </div>

      <div className="space-y-1.5">
        <h3 className="text-base sm:text-lg font-semibold text-slate-950 leading-snug">{post.title}</h3>
        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{post.content}</p>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-600">
        <button
          onClick={() => onToggleLike(post)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold transition-colors cursor-pointer ${
            liked ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-100'
          }`}
        >
          <ThumbsUp className={`w-4 h-4 ${liked ? 'fill-blue-600 text-blue-600' : ''}`} />
          <span>{post.likedBy.length > 0 ? post.likedBy.length : ''} Me gusta</span>
        </button>
        <button
          onClick={() => setShowComments((v) => !v)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold transition-colors cursor-pointer ${showComments ? 'bg-slate-100 text-slate-900' : 'hover:bg-slate-100'}`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>{post.commentsCount > 0 ? plural(post.commentsCount, 'respuesta', 'respuestas') : 'Responder'}</span>
        </button>
      </div>

      {showComments && (
        <PostComments
          post={post}
          currentUserId={currentUserId}
          currentUser={currentUser}
          activeVehicle={activeVehicle}
          requireAuth={requireAuth}
          onError={onError}
        />
      )}
    </article>
  );
};

export const CommunityHub: React.FC<CommunityHubProps> = ({
  activeVehicle,
  currentUserId,
  currentUser,
  isAdmin,
  requireAuth,
  onError,
  onNotify,
  initialCommunityId,
}) => {
  const confirmAction = useConfirm();
  const [communities, setCommunities] = useState<CommunityClub[]>([]);
  const [communitiesLoading, setCommunitiesLoading] = useState(true);
  // "todas" = feed of every community; "comunidad" = one community's page
  const [view, setView] = useState<'todas' | 'comunidad'>(initialCommunityId ? 'comunidad' : 'todas');
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);
  const [clubFilter, setClubFilter] = useState<'todas' | 'mias'>('todas');
  const [selectedCategory, setSelectedCategory] = useState<PostCategory | 'todos'>('todos');
  const [searchPost, setSearchPost] = useState<string>('');
  const [showNewPostModal, setShowNewPostModal] = useState<boolean>(false);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);

  // New Post Form State
  const [postClubId, setPostClubId] = useState<string>('');
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postCategory, setPostCategory] = useState<PostCategory>('fallas');
  const [postModel, setPostModel] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);

  const [recentPosts, setRecentPosts] = useState<CommunityPost[]>([]);
  const [recentLoading, setRecentLoading] = useState(true);
  const [clubPosts, setClubPosts] = useState<CommunityPost[]>([]);
  const [clubPostsLoading, setClubPostsLoading] = useState(true);
  const [members, setMembers] = useState<CommunityMember[] | null>(null);

  useEffect(() => {
    return subscribeToCommunities(
      (list) => {
        setCommunities(list);
        setCommunitiesLoading(false);
      },
      (err) => {
        setCommunitiesLoading(false);
        onError('No se pudieron cargar las comunidades.', err);
      }
    );
  }, []);

  useEffect(() => {
    return subscribeToRecentPosts(
      RECENT_POSTS,
      (list) => {
        setRecentPosts(list);
        setRecentLoading(false);
      },
      (err) => {
        setRecentLoading(false);
        onError('No se pudieron cargar las publicaciones.', err);
      }
    );
  }, []);

  // Pick a default community: a shared link, else the one matching the active vehicle's brand, else the first one
  useEffect(() => {
    if (communities.length === 0) return;
    if (selectedClubId && communities.some((c) => c.id === selectedClubId)) return;
    if (!selectedClubId && initialCommunityId) {
      if (communities.some((c) => c.id === initialCommunityId)) {
        setSelectedClubId(initialCommunityId);
        return;
      }
      syncDeepLink(null);
      setView('todas');
    }
    const brandMatch = activeVehicle
      ? communities.find((c) => c.brand.toLowerCase() === activeVehicle.brand.toLowerCase())
      : undefined;
    setSelectedClubId((brandMatch || communities[0]).id);
  }, [communities, activeVehicle, selectedClubId, initialCommunityId]);

  const openCommunity = (id: string) => {
    setSelectedClubId(id);
    setView('comunidad');
    setSelectedCategory('todos');
    setSearchPost('');
    syncDeepLink({ type: 'comunidad', id });
    document.getElementById('comunidad-contenido')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const showAllFeed = () => {
    setView('todas');
    syncDeepLink(null);
  };

  useEffect(() => {
    if (!selectedClubId) return;
    setClubPostsLoading(true);
    setClubPosts([]);
    setMembers(null);
    const stopPosts = subscribeToClubPosts(
      selectedClubId,
      (list) => {
        setClubPosts(list);
        setClubPostsLoading(false);
      },
      (err) => {
        setClubPostsLoading(false);
        onError('No se pudieron cargar las publicaciones de la comunidad.', err);
      }
    );
    const stopMembers = subscribeToMembers(selectedClubId, setMembers, (err) => {
      setMembers([]);
      console.error('No se pudieron cargar los miembros', err);
    });
    return () => {
      stopPosts();
      stopMembers();
    };
  }, [selectedClubId]);

  const byId = useMemo(() => new Map(communities.map((c) => [c.id, c])), [communities]);
  const currentCommunity = (selectedClubId && byId.get(selectedClubId)) || null;
  const isMemberOf = (club: CommunityClub | null | undefined) => !!club && !!currentUserId && club.memberIds.includes(currentUserId);
  const isMember = isMemberOf(currentCommunity);
  const canManageClub = !!currentCommunity && (isAdmin || (!!currentUserId && currentCommunity.createdBy === currentUserId));
  const myCard: MemberCard | null = currentUser ? { name: currentUser.fullName, car: describeVehicle(activeVehicle) } : null;

  // Members who joined before member cards existed publish theirs the next time they visit
  useEffect(() => {
    if (!currentCommunity || !currentUserId || !myCard || members === null || !isMember) return;
    if (members.some((m) => m.id === currentUserId)) return;
    saveMemberCard(currentCommunity.id, currentUserId, myCard).catch((err) => console.error('No se pudo publicar la tarjeta de miembro', err));
  }, [currentCommunity?.id, currentUserId, members, isMember]);

  // Activity per community (from the latest posts)
  const activity = useMemo(() => {
    const map = new Map<string, { posts: number; last: number }>();
    recentPosts.forEach((p) => {
      const a = map.get(p.clubId) || { posts: 0, last: 0 };
      a.posts += 1;
      a.last = Math.max(a.last, p.createdAt);
      map.set(p.clubId, a);
    });
    return map;
  }, [recentPosts]);

  // People who help the most: posts plus likes received, from the latest activity
  const topHelpers = useMemo(() => {
    const map = new Map<string, { id: string; name: string; car?: string; posts: number; likes: number }>();
    recentPosts.forEach((p) => {
      const h = map.get(p.authorId) || { id: p.authorId, name: p.authorName, car: p.authorCar, posts: 0, likes: 0 };
      h.posts += 1;
      h.likes += p.likedBy.length;
      map.set(p.authorId, h);
    });
    return [...map.values()].sort((a, b) => b.posts * 2 + b.likes - (a.posts * 2 + a.likes)).slice(0, 5);
  }, [recentPosts]);

  const mostActive = useMemo(
    () =>
      communities
        .filter((c) => activity.get(c.id))
        .sort((a, b) => (activity.get(b.id)?.last || 0) - (activity.get(a.id)?.last || 0))
        .slice(0, 4),
    [communities, activity]
  );

  const visibleClubs = clubFilter === 'mias' ? communities.filter(isMemberOf) : communities;
  const myCommunitiesCount = communities.filter(isMemberOf).length;

  const handleToggleMembership = async (club: CommunityClub) => {
    if (!requireAuth() || !currentUserId || !myCard) return;
    const joining = !isMemberOf(club);
    if (!joining && !(await confirmAction(`Dejarás de ser miembro de ${club.name}.`, { title: '¿Salir de la comunidad?', confirmLabel: 'Salir' }))) return;
    setTogglingId(club.id);
    try {
      await setCommunityMembership(club.id, currentUserId, joining, myCard);
      onNotify(joining ? `¡Te uniste a ${club.name}! Ahora apareces en su lista de miembros.` : `Saliste de ${club.name}`);
    } catch (err) {
      onError(joining ? 'No se pudo unir a la comunidad.' : 'No se pudo salir de la comunidad.', err);
    } finally {
      setTogglingId(null);
    }
  };

  const handleOpenCreate = () => {
    if (!requireAuth()) return;
    setShowCreateModal(true);
  };

  const handleCreateCommunity = async (data: Omit<CommunityClub, 'id' | 'memberIds' | 'createdBy' | 'createdAt'>) => {
    if (!currentUserId || !myCard) return;
    const id = await createCommunity(currentUserId, data, myCard);
    openCommunity(id);
    onNotify(`¡Comunidad "${data.name}" creada! Invita a otros propietarios a unirse.`);
  };

  const handleDeleteCommunity = async () => {
    if (!currentCommunity) return;
    const ok = await confirmAction(`Se eliminará "${currentCommunity.name}". Esta acción no se puede deshacer.`, {
      title: '¿Eliminar comunidad?',
      confirmLabel: 'Eliminar',
      danger: true,
    });
    if (!ok) return;
    deleteCommunity(currentCommunity.id)
      .then(() => {
        setSelectedClubId(null);
        showAllFeed();
        onNotify('Comunidad eliminada');
      })
      .catch((err) => onError('No se pudo eliminar la comunidad.', err));
  };

  const handleSeedCommunities = async () => {
    if (!currentUserId) return;
    setIsSeeding(true);
    try {
      await seedInitialCommunities(currentUserId);
      onNotify('Comunidades iniciales cargadas.');
    } catch (err) {
      onError('No se pudieron cargar las comunidades iniciales.', err);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleToggleLike = (post: CommunityPost) => {
    if (!requireAuth() || !currentUserId) return;
    const liked = post.likedBy.includes(currentUserId);
    setPostLiked(post.id, currentUserId, !liked).catch((err) => onError('No se pudo registrar tu "Me gusta".', err));
  };

  const handleDeletePost = async (post: CommunityPost) => {
    const ok = await confirmAction(`Se eliminará "${post.title}".`, { title: '¿Eliminar publicación?', confirmLabel: 'Eliminar', danger: true });
    if (!ok) return;
    deletePost(post.id).catch((err) => onError('No se pudo eliminar la publicación.', err));
  };

  const openNewPostModal = (clubId?: string) => {
    if (!requireAuth()) return;
    const fallback = clubId || (view === 'comunidad' && currentCommunity?.id) || communities.find(isMemberOf)?.id || currentCommunity?.id || '';
    setPostClubId(fallback);
    setPostError(null);
    setShowNewPostModal(true);
  };

  const postClub = byId.get(postClubId) || null;
  const isMemberOfPostClub = isMemberOf(postClub);

  const handleCreatePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postClub || !postTitle.trim() || !postContent.trim()) return;
    if (!requireAuth() || !currentUserId || !currentUser || !myCard) return;

    setIsPosting(true);
    setPostError(null);
    try {
      // Only members can post: join first when needed
      if (!isMemberOfPostClub) {
        await setCommunityMembership(postClub.id, currentUserId, true, myCard);
      }
      await createPost({
        clubId: postClub.id,
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
      onNotify(`¡Publicado en ${postClub.name}!`);
    } catch (err) {
      console.error(err);
      setPostError('No se pudo publicar. Revisa tu conexión e inténtalo de nuevo.');
    } finally {
      setIsPosting(false);
    }
  };

  const feedPosts = (view === 'todas' ? recentPosts : clubPosts).filter((p) => {
    if (selectedCategory !== 'todos' && p.category !== selectedCategory) return false;
    if (searchPost) {
      const q = searchPost.toLowerCase();
      return p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q) || p.authorName.toLowerCase().includes(q);
    }
    return true;
  });
  const feedLoading = view === 'todas' ? recentLoading : clubPostsLoading;

  const memberLabel = (count: number) => plural(count, 'miembro', 'miembros');

  const joinButton = (club: CommunityClub, className = '') => {
    const joined = isMemberOf(club);
    return (
      <button
        onClick={() => handleToggleMembership(club)}
        disabled={togglingId === club.id}
        className={`font-semibold text-xs py-2 px-4 rounded-full flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-60 ${
          joined ? 'bg-white text-slate-700 border border-slate-300 hover:border-red-300 hover:text-red-700' : 'bg-blue-600 hover:bg-blue-700 text-white'
        } ${className}`}
      >
        {togglingId === club.id ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : joined ? (
          <LogOut className="w-3.5 h-3.5" />
        ) : (
          <UserPlus className="w-3.5 h-3.5" />
        )}
        {joined ? 'Salir' : 'Unirme'}
      </button>
    );
  };

  return (
    <div className="relative isolate space-y-8 animate-in fade-in duration-300">
      <SectionGlow tone="comunidad" />

      <SectionHero image="/section-comunidad.jpg" alt="Encuentro de vehículos con personas reunidas" focus="50% 55%">
        <div className="space-y-2 sm:space-y-3 max-w-2xl">
          <h1 className="text-[28px] leading-[1.1] sm:text-4xl lg:text-5xl font-semibold text-white tracking-[-0.025em] drop-shadow-sm">
            Comunidades de propietarios y apasionados.
          </h1>
          <p className="hidden sm:block text-sm text-white/80 leading-relaxed font-normal">
            Mira lo que otros propietarios están preguntando y compartiendo, únete a la comunidad de tu marca y resuelve dudas con gente que tiene tu mismo vehículo.
          </p>
        </div>

        <div className={`${heroGlassClass} flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto shrink-0`}>
          <button
            onClick={() => openNewPostModal()}
            disabled={communities.length === 0}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-semibold text-sm px-6 py-3 rounded-full transition-all cursor-pointer min-h-[46px] disabled:opacity-60"
          >
            <MessageSquare className="w-4 h-4 text-white/90" />
            <span>Hacer una pregunta</span>
          </button>
          <button
            onClick={handleOpenCreate}
            className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-900 font-semibold text-sm px-6 py-3 rounded-full border border-slate-200 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-blue-600" />
            <span>Crear comunidad</span>
          </button>
        </div>
      </SectionHero>

      {communitiesLoading && (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500 font-semibold">
          <Loader2 className="w-5 h-5 animate-spin" /> Cargando comunidades...
        </div>
      )}

      {!communitiesLoading && communities.length === 0 && (
        <div className="text-center py-14 bg-white border border-slate-200 rounded-3xl p-8 max-w-md mx-auto">
          <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-950">Aún no hay comunidades</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            {isAdmin
              ? 'Carga las 5 comunidades iniciales de MiGaraje (Mazda, Toyota, BMW, Chevrolet y Clásicos) o crea una nueva.'
              : 'Crea la primera comunidad para tu marca, modelo o ciudad.'}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
            {isAdmin && (
              <button
                onClick={handleSeedCommunities}
                disabled={isSeeding}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-full cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
              >
                {isSeeding && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Cargar comunidades iniciales
              </button>
            )}
            <button onClick={handleOpenCreate} className="bg-slate-950 text-white font-bold text-xs px-4 py-2.5 rounded-full cursor-pointer">
              + Crear una comunidad
            </button>
          </div>
        </div>
      )}

      {communities.length > 0 && (
        <>
          {/* How it works (for newcomers) */}
          {myCommunitiesCount === 0 && (
            <div className="flex sm:grid sm:grid-cols-3 gap-3 overflow-x-auto sm:overflow-visible snap-x snap-mandatory scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
              {[
                { icon: Search, title: 'Explora sin registrarte', text: 'Lee lo que otros propietarios preguntan y responden en todas las comunidades.' },
                { icon: UserPlus, title: 'Únete a tu marca', text: 'Aparece en la lista de miembros y conoce a quienes tienen tu mismo vehículo.' },
                { icon: HandHelping, title: 'Pregunta y ayuda', text: 'Publica tus dudas, comparte experiencias y recomienda talleres de confianza.' },
              ].map(({ icon: Icon, title, text }) => (
                <div key={title} data-reveal className="w-[78%] shrink-0 snap-start sm:w-auto bg-white/80 rounded-3xl p-4 sm:p-5 border border-slate-200/70 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{title}</div>
                    <p className="text-xs text-slate-500 leading-relaxed mt-0.5">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Communities */}
          <section className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-2xl sm:text-3xl font-semibold text-slate-950 tracking-tight">Explora las comunidades</h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Toca una para ver sus publicaciones y quiénes son sus miembros.<span className="sm:hidden"> Desliza para ver más →</span>
                </p>
              </div>
              <div className="flex items-center gap-1 p-1 rounded-full bg-slate-200/60">
                {(['todas', 'mias'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => {
                      if (f === 'mias' && !requireAuth()) return;
                      setClubFilter(f);
                    }}
                    className={`px-3.5 py-1.5 rounded-full text-xs transition-all cursor-pointer ${
                      clubFilter === f ? 'bg-white text-slate-950 font-semibold shadow-sm' : 'text-slate-600 font-medium hover:text-slate-950'
                    }`}
                  >
                    {f === 'todas' ? `Todas (${communities.length})` : `Mis comunidades (${myCommunitiesCount})`}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 overflow-x-auto sm:overflow-visible snap-x snap-mandatory scrollbar-none -mx-4 px-4 pb-1 sm:mx-0 sm:px-0 sm:pb-0">
              {visibleClubs.map((comm) => {
                const isMatch = !!activeVehicle && comm.brand.toLowerCase() === activeVehicle.brand.toLowerCase();
                const isSelected = view === 'comunidad' && comm.id === selectedClubId;
                const stats = activity.get(comm.id);
                return (
                  <div
                    key={comm.id}
                    data-reveal
                    className={`w-[82%] shrink-0 snap-start sm:w-auto bg-white rounded-3xl overflow-hidden border transition-all flex flex-col ${
                      isSelected ? 'border-blue-500 ring-2 ring-blue-500/30 shadow-md' : 'border-slate-200/70 shadow-xs hover:shadow-md'
                    }`}
                  >
                    <button onClick={() => openCommunity(comm.id)} className="text-left cursor-pointer flex-1 flex flex-col">
                      <div className="relative h-20 bg-gradient-to-br from-blue-600 to-blue-900 overflow-hidden">
                        {comm.coverImage && <img src={comm.coverImage} alt="" loading="lazy" className="w-full h-full object-cover opacity-80" />}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        {isMatch && (
                          <span className="absolute top-2.5 right-2.5 text-[10px] font-semibold bg-white/90 text-blue-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Car className="w-3 h-3" /> Tu vehículo
                          </span>
                        )}
                        {isMemberOf(comm) && (
                          <span className="absolute top-2.5 left-2.5 text-[10px] font-semibold bg-blue-600 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Check className="w-3 h-3" /> Miembro
                          </span>
                        )}
                      </div>
                      <div className="px-4 sm:px-5 pb-4 -mt-7 relative flex-1 flex flex-col">
                        <CommunityLogo club={comm} className="w-14 h-14 rounded-2xl border-4 border-white shadow-sm text-lg" />
                        <h3 className="mt-2 text-base font-semibold text-slate-950 leading-snug">{comm.name}</h3>
                        {comm.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{comm.description}</p>}
                        <div className="mt-auto pt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 font-medium">
                          <span className="inline-flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {memberLabel(comm.memberIds.length)}</span>
                          <span className="inline-flex items-center gap-1"><MessagesSquare className="w-3.5 h-3.5" /> {plural(stats?.posts || 0, 'publicación', 'publicaciones')}</span>
                          {stats?.last ? (
                            <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Activa {timeAgo(stats.last).toLowerCase()}</span>
                          ) : null}
                        </div>
                      </div>
                    </button>
                    <div className="px-4 sm:px-5 pb-4 flex items-center gap-2">
                      <button
                        onClick={() => openCommunity(comm.id)}
                        className="flex-1 text-xs font-semibold py-2 px-4 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-900 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span className="sm:hidden">Ver</span>
                        <span className="hidden sm:inline">Ver publicaciones</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      {joinButton(comm)}
                    </div>
                  </div>
                );
              })}

              <button
                onClick={handleOpenCreate}
                className="w-[60%] shrink-0 snap-start sm:w-auto rounded-3xl border-2 border-dashed border-slate-300 bg-white/50 hover:bg-white hover:border-blue-400 text-slate-500 hover:text-blue-700 flex flex-col items-center justify-center gap-2 text-sm font-semibold cursor-pointer transition-all min-h-[200px] p-6 text-center"
              >
                <PlusCircle className="w-7 h-7" />
                Crear una comunidad
                <span className="text-xs font-normal text-slate-500">Para tu marca, modelo o ciudad</span>
              </button>
            </div>

            {clubFilter === 'mias' && visibleClubs.length === 0 && (
              <p className="text-xs text-slate-500">Todavía no te has unido a ninguna comunidad. Elige una en "Todas" y toca "Unirme".</p>
            )}
          </section>

          {/* Feed */}
          <div id="comunidad-contenido" className="scroll-mt-28 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            <div className="lg:col-span-8 space-y-4">
              {/* View switch */}
              <div className="flex items-center gap-1 p-1 rounded-full bg-slate-200/60 w-fit max-w-full overflow-x-auto scrollbar-none">
                <button
                  onClick={showAllFeed}
                  className={`px-4 py-2 rounded-full text-xs whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    view === 'todas' ? 'bg-white text-slate-950 font-semibold shadow-sm' : 'text-slate-600 font-medium hover:text-slate-950'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5 text-amber-500" /> Lo último en todas
                </button>
                {currentCommunity && (
                  <button
                    onClick={() => openCommunity(currentCommunity.id)}
                    className={`px-4 py-2 rounded-full text-xs whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                      view === 'comunidad' ? 'bg-white text-slate-950 font-semibold shadow-sm' : 'text-slate-600 font-medium hover:text-slate-950'
                    }`}
                  >
                    <CommunityLogo club={currentCommunity} className="w-4 h-4 rounded-full text-[8px]" />
                    {currentCommunity.name}
                  </button>
                )}
              </div>

              {/* Selected community banner */}
              {view === 'comunidad' && currentCommunity && (
                <div data-reveal className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-200/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <CommunityLogo club={currentCommunity} className="w-14 h-14 rounded-2xl border border-slate-200 shrink-0 text-lg" />
                    <div className="min-w-0">
                      <h2 className="text-lg sm:text-xl font-semibold text-slate-950">{currentCommunity.name}</h2>
                      {currentCommunity.description && <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{currentCommunity.description}</p>}
                      <div className="text-[11px] text-slate-500 font-medium mt-1 flex flex-wrap items-center gap-x-2">
                        <span>{memberLabel(currentCommunity.memberIds.length)}</span>
                        <span>·</span>
                        <span>{clubPostsLoading ? 'Cargando…' : plural(clubPosts.length, 'publicación', 'publicaciones')}</span>
                        {currentCommunity.createdAt && (
                          <>
                            <span>·</span>
                            <span>Creada {timeAgo(currentCommunity.createdAt).toLowerCase()}</span>
                          </>
                        )}
                      </div>
                      <div className="mt-2.5">
                        <ShareButtons type="comunidad" id={currentCommunity.id} text={`Únete a ${currentCommunity.name} en MiGaraje:`} compact />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                    {joinButton(currentCommunity, 'flex-1 sm:flex-none py-2.5')}
                    {canManageClub && (
                      <button
                        onClick={handleDeleteCommunity}
                        title="Eliminar comunidad"
                        className="w-10 h-10 rounded-full border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Composer */}
              <button
                onClick={() => openNewPostModal(view === 'comunidad' ? currentCommunity?.id : undefined)}
                className="w-full bg-white rounded-3xl p-3 sm:p-4 shadow-xs border border-slate-200/70 flex items-center gap-3 text-left cursor-pointer hover:shadow-md transition-shadow"
              >
                {currentUser ? <Avatar name={currentUser.fullName} seed={currentUserId || ''} /> : <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0"><Users className="w-4 h-4 text-slate-400" /></div>}
                <span className="flex-1 bg-slate-100 rounded-full px-4 py-2.5 text-sm text-slate-500 truncate">
                  {currentUser ? `¿Qué quieres preguntar o compartir, ${currentUser.fullName.split(' ')[0]}?` : '¿Tienes una duda sobre tu vehículo? Pregúntale a la comunidad'}
                </span>
                <span className="hidden sm:flex w-10 h-10 rounded-full bg-blue-600 text-white items-center justify-center shrink-0">
                  <Send className="w-4 h-4" />
                </span>
              </button>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder={view === 'comunidad' && currentCommunity ? `Buscar en ${currentCommunity.name}...` : 'Buscar en todas las publicaciones...'}
                    value={searchPost}
                    onChange={(e) => setSearchPost(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-full pl-10 pr-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400"
                  />
                </div>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {(['todos', ...Object.keys(CATEGORY_LABELS)] as Array<PostCategory | 'todos'>).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors cursor-pointer border ${
                      selectedCategory === cat ? 'bg-slate-900 text-white font-semibold border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {cat === 'todos' ? 'Todos los temas' : CATEGORY_LABELS[cat]}
                  </button>
                ))}
              </div>

              {/* Posts */}
              <div className="space-y-4">
                {feedLoading && (
                  <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500 font-semibold">
                    <Loader2 className="w-5 h-5 animate-spin" /> Cargando publicaciones...
                  </div>
                )}

                {!feedLoading && (view === 'todas' ? recentPosts : clubPosts).length === 0 && (
                  <div className="text-center py-12 bg-white rounded-3xl p-8 border border-slate-200/70">
                    <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-base font-semibold text-slate-950">
                      {view === 'comunidad' && currentCommunity ? `${currentCommunity.name} aún no tiene publicaciones` : 'Aún no hay publicaciones'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 mb-4">Haz la primera pregunta o comparte tu experiencia con otros propietarios.</p>
                    <button
                      onClick={() => openNewPostModal(view === 'comunidad' ? currentCommunity?.id : undefined)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-5 py-2.5 rounded-full cursor-pointer"
                    >
                      Hacer la primera pregunta
                    </button>
                  </div>
                )}

                {!feedLoading && (view === 'todas' ? recentPosts : clubPosts).length > 0 && feedPosts.length === 0 && (
                  <p className="text-center text-xs text-slate-500 py-8">No hay publicaciones con estos filtros.</p>
                )}

                {feedPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    community={byId.get(post.clubId)}
                    showCommunity={view === 'todas'}
                    currentUserId={currentUserId}
                    currentUser={currentUser}
                    activeVehicle={activeVehicle}
                    isAdmin={isAdmin}
                    requireAuth={requireAuth}
                    onError={onError}
                    onOpenCommunity={openCommunity}
                    onToggleLike={handleToggleLike}
                    onDelete={handleDeletePost}
                  />
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-4 space-y-4">
              {view === 'comunidad' && currentCommunity ? (
                <>
                  <div data-reveal className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200/70 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-base font-semibold text-slate-950 flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-600" /> Miembros
                      </h3>
                      <span className="text-xs text-slate-500">{currentCommunity.memberIds.length}</span>
                    </div>
                    {members === null ? (
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Cargando…
                      </div>
                    ) : members.length === 0 ? (
                      <p className="text-xs text-slate-500">
                        {currentCommunity.memberIds.length > 0
                          ? 'Los miembros aparecerán aquí la próxima vez que visiten la comunidad.'
                          : 'Aún no hay miembros. ¡Sé el primero en unirte!'}
                      </p>
                    ) : (
                      <ul className="space-y-2.5">
                        {members.slice(0, 12).map((m) => (
                          <li key={m.id} className="flex items-center gap-2.5">
                            <Avatar name={m.name} seed={m.id} size="sm" />
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-semibold text-slate-900 truncate">
                                {m.name}
                                {m.id === currentCommunity.createdBy && <span className="ml-1.5 text-[9px] font-bold uppercase text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-full">Fundador</span>}
                                {m.id === currentUserId && <span className="ml-1.5 text-[9px] font-bold uppercase text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-full">Tú</span>}
                              </div>
                              <div className="text-[10px] text-slate-500 truncate">
                                {m.car ? `${m.car} · ` : ''}se unió {timeAgo(m.joinedAt).toLowerCase()}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                    {members && currentCommunity.memberIds.length > Math.min(12, members.length) && (
                      <p className="text-[11px] text-slate-500">y {currentCommunity.memberIds.length - Math.min(12, members.length)} más</p>
                    )}
                    {!isMember && joinButton(currentCommunity, 'w-full py-2.5')}
                  </div>

                  {currentCommunity.recommendedTips && currentCommunity.recommendedTips.length > 0 && (
                    <div data-reveal className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200/70 space-y-3">
                      <h3 className="text-base font-semibold text-slate-950 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-amber-500" /> Consejos para {currentCommunity.brand}
                      </h3>
                      <div className="space-y-2">
                        {currentCommunity.recommendedTips.map((tip, idx) => (
                          <div key={idx} className="p-3 rounded-2xl bg-slate-50 text-xs text-slate-700 leading-relaxed">{tip}</div>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentCommunity.rules.length > 0 && (
                    <div data-reveal className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200/70 space-y-3">
                      <h3 className="text-base font-semibold text-slate-950 flex items-center gap-2">
                        <ScrollText className="w-4 h-4 text-blue-600" /> Normas
                      </h3>
                      <ul className="space-y-2 text-xs text-slate-600 list-disc pl-4">
                        {currentCommunity.rules.map((rule, idx) => (
                          <li key={idx}>{rule}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {currentCommunity.models.length > 0 && (
                    <div data-reveal className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200/70 space-y-3">
                      <h3 className="text-base font-semibold text-slate-950 flex items-center gap-2">
                        <Car className="w-4 h-4 text-blue-600" /> Modelos
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {currentCommunity.models.map((m) => (
                          <span key={m} className="text-[11px] bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full font-medium">{m}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div data-reveal className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200/70 space-y-3">
                    <h3 className="text-base font-semibold text-slate-950 flex items-center gap-2">
                      <Flame className="w-4 h-4 text-amber-500" /> Comunidades más activas
                    </h3>
                    {mostActive.length === 0 ? (
                      <p className="text-xs text-slate-500">Todavía no hay actividad. ¡Haz la primera pregunta!</p>
                    ) : (
                      <ul className="space-y-2">
                        {mostActive.map((c) => (
                          <li key={c.id}>
                            <button onClick={() => openCommunity(c.id)} className="w-full flex items-center gap-3 p-2 -mx-2 rounded-2xl hover:bg-slate-50 text-left cursor-pointer">
                              <CommunityLogo club={c} className="w-9 h-9 rounded-xl border border-slate-200 text-sm" />
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-semibold text-slate-900 truncate">{c.name}</div>
                                <div className="text-[10px] text-slate-500">
                                  {plural(activity.get(c.id)?.posts || 0, 'publicación', 'publicaciones')} · activa {timeAgo(activity.get(c.id)?.last).toLowerCase()}
                                </div>
                              </div>
                              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {topHelpers.length > 0 && (
                    <div data-reveal className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200/70 space-y-3">
                      <h3 className="text-base font-semibold text-slate-950 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-blue-600" /> Propietarios más activos
                      </h3>
                      <ul className="space-y-2.5">
                        {topHelpers.map((h) => (
                          <li key={h.id} className="flex items-center gap-2.5">
                            <Avatar name={h.name} seed={h.id} size="sm" />
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-semibold text-slate-900 truncate">{h.name}</div>
                              <div className="text-[10px] text-slate-500 truncate">
                                {h.car ? `${h.car} · ` : ''}
                                {plural(h.posts, 'publicación', 'publicaciones')}
                                {h.likes > 0 ? ` · ${plural(h.likes, 'me gusta', 'me gusta')}` : ''}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div data-reveal className="bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-3xl p-5 space-y-2">
                    <h3 className="text-base font-semibold">¿No encuentras tu marca?</h3>
                    <p className="text-xs text-white/80 leading-relaxed">Crea una comunidad para tu marca, tu modelo o tu ciudad e invita a otros propietarios por WhatsApp.</p>
                    <button onClick={handleOpenCreate} className="mt-1 bg-white text-blue-700 font-semibold text-xs px-4 py-2 rounded-full cursor-pointer hover:bg-blue-50">
                      Crear comunidad
                    </button>
                  </div>
                </>
              )}
            </aside>
          </div>
        </>
      )}

      <CreateCommunityModal
        isOpen={showCreateModal}
        defaultBrand={activeVehicle?.brand}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateCommunity}
      />

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
              <div className="w-11 h-11 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-950">Hacer una pregunta</h3>
                <p className="text-xs text-slate-500">Recibe respuestas de propietarios y mecánicos en Colombia</p>
              </div>
            </div>

            <form onSubmit={handleCreatePostSubmit} className="space-y-4 text-xs text-slate-700">
              <div>
                <label className="block font-semibold text-slate-900 mb-1">Comunidad *</label>
                <select
                  required
                  value={postClubId}
                  onChange={(e) => setPostClubId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
                >
                  <option value="" disabled>Elige dónde publicar</option>
                  {communities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                      {isMemberOf(c) ? ' (miembro)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {postClub && !isMemberOfPostClub && (
                <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-xl p-3 text-[11px] text-blue-900">
                  <UserPlus className="w-4 h-4 text-blue-600 shrink-0 mt-px" />
                  <span>Para publicar debes ser miembro. Al publicar te unirás automáticamente a {postClub.name}.</span>
                </div>
              )}

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
                  <label className="block font-semibold text-slate-900 mb-1">Tema</label>
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
                  <label className="block font-semibold text-slate-900 mb-1">Modelo específico</label>
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
                  disabled={isPosting || !postClub}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-full shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
                >
                  {isPosting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {!postClub || isMemberOfPostClub ? 'Publicar' : 'Unirme y publicar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
