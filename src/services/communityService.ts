import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  updateDoc,
  writeBatch,
  arrayUnion,
  arrayRemove,
  increment,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { CommunityPost, PostComment } from '../types';

const postsRef = collection(db, 'communityPosts');

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
