import {
  addDoc,
  collection,
  deleteDoc,
  deleteField,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { NewsItem } from '../types';

const newsRef = collection(db, 'news');

/** Streams every news item, newest first. */
export function subscribeToNews(onChange: (items: NewsItem[]) => void, onError?: (err: Error) => void): () => void {
  return onSnapshot(
    query(newsRef, orderBy('createdAt', 'desc')),
    (snapshot) => {
      onChange(
        snapshot.docs.map((d) => {
          const data = d.data({ serverTimestamps: 'estimate' });
          return { ...(data as NewsItem), id: d.id, createdAt: (data.createdAt as Timestamp | undefined)?.toMillis() };
        })
      );
    },
    onError
  );
}

export type NewsDraft = Omit<NewsItem, 'id' | 'createdAt'>;

// Firestore rejects `undefined`: empty optional fields are left out
const clean = (draft: NewsDraft) =>
  Object.fromEntries(Object.entries(draft).filter(([, value]) => value !== undefined && value !== '')) as NewsDraft;

/** Publishes a new item (admin only). */
export async function publishNews(draft: NewsDraft): Promise<void> {
  await addDoc(newsRef, { ...clean(draft), createdAt: serverTimestamp() });
}

/** Edits an item; the publication date stays. Cleared optional fields are removed. */
export async function updateNews(id: string, draft: NewsDraft): Promise<void> {
  const cleaned = clean(draft);
  const removed = (['body', 'image', 'imageCredit'] as const).filter((k) => !(k in cleaned));
  await updateDoc(doc(db, 'news', id), { ...cleaned, ...Object.fromEntries(removed.map((k) => [k, deleteField()])) });
}

export async function deleteNews(id: string): Promise<void> {
  await deleteDoc(doc(db, 'news', id));
}
