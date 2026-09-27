import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  writeBatch,
  arrayUnion,
  arrayRemove,
  increment,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { CommunityClub, CommunityMember, CommunityPost, PostComment } from '../types';
import { INITIAL_COMMUNITIES } from '../data/initialData';

const communitiesRef = collection(db, 'communities');
const postsRef = collection(db, 'communityPosts');

// ---------- Communities ----------

/**
 * Streams every community. Bigger communities first, then newest.
 */
export function subscribeToCommunities(
  onChange: (communities: CommunityClub[]) => void,
  onError?: (err: Error) => void
): () => void {
  return onSnapshot(
    communitiesRef,
    (snapshot) => {
      const communities = snapshot.docs.map((d) => {
        const data = d.data({ serverTimestamps: 'estimate' });
        return {
          ...(data as CommunityClub),
          id: d.id,
          memberIds: (data.memberIds as string[]) || [],
          createdAt: (data.createdAt as Timestamp | undefined)?.toMillis(),
        };
      });
      communities.sort(
        (a, b) => b.memberIds.length - a.memberIds.length || (b.createdAt || 0) - (a.createdAt || 0)
      );
      onChange(communities);
    },
    onError
  );
}

/** Who is joining: shown publicly in the community's member list */
export interface MemberCard {
  name: string;
  car?: string;
}

const memberRef = (communityId: string, uid: string) => doc(communitiesRef, communityId, 'members', uid);

/**
 * Creates a community owned by `uid`; the creator joins automatically. Returns its id.
 */
export async function createCommunity(
  uid: string,
  community: Omit<CommunityClub, 'id' | 'memberIds' | 'createdBy' | 'createdAt'>,
  card: MemberCard
): Promise<string> {
  const ref = doc(communitiesRef);
  const batch = writeBatch(db);
  batch.set(ref, {
    ...community,
    memberIds: [uid],
    createdBy: uid,
    createdAt: serverTimestamp(),
  });
  batch.set(memberRef(ref.id, uid), { ...card, joinedAt: serverTimestamp() });
  await batch.commit();
  return ref.id;
}

export async function deleteCommunity(communityId: string): Promise<void> {
  await deleteDoc(doc(communitiesRef, communityId));
}

/**
 * Joins or leaves a community. Joining also publishes the member's card (name and vehicle)
 * so others can see who is in it; leaving removes it.
 */
export async function setCommunityMembership(
  communityId: string,
  uid: string,
  isMember: boolean,
  card?: MemberCard
): Promise<void> {
  const batch = writeBatch(db);
  batch.update(doc(communitiesRef, communityId), {
    memberIds: isMember ? arrayUnion(uid) : arrayRemove(uid),
  });
  if (isMember && card) batch.set(memberRef(communityId, uid), { ...card, joinedAt: serverTimestamp() });
  if (!isMember) batch.delete(memberRef(communityId, uid));
  await batch.commit();
}

/** Publishes the card of someone who joined before member cards existed. */
export async function saveMemberCard(communityId: string, uid: string, card: MemberCard): Promise<void> {
  await setDoc(memberRef(communityId, uid), { ...card, joinedAt: serverTimestamp() });
}

/** Streams a community's member cards, newest first. */
export function subscribeToMembers(
  communityId: string,
  onChange: (members: CommunityMember[]) => void,
  onError?: (err: Error) => void
): () => void {
  return onSnapshot(
    collection(communitiesRef, communityId, 'members'),
    (snapshot) => {
      const members = snapshot.docs.map((d) => {
        const data = d.data({ serverTimestamps: 'estimate' });
        return {
          id: d.id,
          name: data.name as string,
          car: data.car as string | undefined,
          joinedAt: (data.joinedAt as Timestamp | undefined)?.toMillis() || Date.now(),
        };
      });
      members.sort((a, b) => b.joinedAt - a.joinedAt);
      onChange(members);
    },
    onError
  );
}

/**
 * Loads the starter brand clubs from initialData. Admin only.
 * Keeps their original ids so existing posts stay attached.
 */
export async function seedInitialCommunities(adminUid: string): Promise<void> {
  const batch = writeBatch(db);
  INITIAL_COMMUNITIES.forEach((community, index) => {
    const { id, ...data } = community;
    batch.set(doc(communitiesRef, id), {
      ...data,
      memberIds: [],
      createdBy: adminUid,
      createdAt: Timestamp.fromMillis(Date.now() - index * 1000),
    });
  });
  await batch.commit();
}

// ---------- Posts ----------

/**
 * Streams the posts of one club, newest first.
 * Sorted client-side so the query doesn't need a composite index.
 */
export function subscribeToClubPosts(
  clubId: string,
  onChange: (posts: CommunityPost[]) => void,
  onError?: (err: Error) => void
): () => void {
  return onSnapshot(
    query(postsRef, where('clubId', '==', clubId)),
    (snapshot) => {
      const posts = snapshot.docs.map((d) => {
        const data = d.data({ serverTimestamps: 'estimate' });
        return {
          ...(data as CommunityPost),
          id: d.id,
          likedBy: (data.likedBy as string[]) || [],
          createdAt: (data.createdAt as Timestamp | undefined)?.toMillis() || Date.now(),
        };
      });
      posts.sort((a, b) => b.createdAt - a.createdAt);
      onChange(posts);
    },
    onError
  );
}

/**
 * Streams the latest posts of every community (the public "Lo último" feed), newest first.
 */
export function subscribeToRecentPosts(
  max: number,
  onChange: (posts: CommunityPost[]) => void,
  onError?: (err: Error) => void
): () => void {
  return onSnapshot(
    query(postsRef, orderBy('createdAt', 'desc'), limit(max)),
    (snapshot) => {
      onChange(
        snapshot.docs.map((d) => {
          const data = d.data({ serverTimestamps: 'estimate' });
          return {
            ...(data as CommunityPost),
            id: d.id,
            likedBy: (data.likedBy as string[]) || [],
            createdAt: (data.createdAt as Timestamp | undefined)?.toMillis() || Date.now(),
          };
        })
      );
    },
    onError
  );
}

export async function createPost(
  post: Omit<CommunityPost, 'id' | 'likedBy' | 'commentsCount' | 'createdAt'>
): Promise<void> {
  await setDoc(doc(postsRef), {
    ...post,
    likedBy: [],
    commentsCount: 0,
    createdAt: serverTimestamp(),
  });
}

export async function deletePost(postId: string): Promise<void> {
  await deleteDoc(doc(postsRef, postId));
}

export async function setPostLiked(postId: string, uid: string, liked: boolean): Promise<void> {
  await updateDoc(doc(postsRef, postId), {
    likedBy: liked ? arrayUnion(uid) : arrayRemove(uid),
  });
}

export function subscribeToComments(
  postId: string,
  onChange: (comments: PostComment[]) => void,
  onError?: (err: Error) => void
): () => void {
  return onSnapshot(
    query(collection(postsRef, postId, 'comments'), orderBy('createdAt', 'asc')),
    (snapshot) => {
      onChange(
        snapshot.docs.map((d) => {
          const data = d.data({ serverTimestamps: 'estimate' });
          return {
            ...(data as PostComment),
            id: d.id,
            createdAt: (data.createdAt as Timestamp | undefined)?.toMillis() || Date.now(),
          };
        })
      );
    },
    onError
  );
}

/**
 * Adds a comment and bumps the post's counter in one atomic write.
 */
export async function addComment(
  postId: string,
  comment: Omit<PostComment, 'id' | 'createdAt'>
): Promise<void> {
  const batch = writeBatch(db);
  batch.set(doc(collection(postsRef, postId, 'comments')), {
    ...comment,
    createdAt: serverTimestamp(),
  });
  batch.update(doc(postsRef, postId), { commentsCount: increment(1) });
  await batch.commit();
}

/** Deletes one comment (author or admin). The post's counter is left as is. */
export async function deleteComment(postId: string, commentId: string): Promise<void> {
  await deleteDoc(doc(collection(postsRef, postId, 'comments'), commentId));
}
