import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { ProductReview } from '../types';

const reviewsRef = collection(db, 'productReviews');

export interface RatingSummary {
  average: number;
  count: number;
}

/**
 * Streams every product review, newest first. The catalog is small, so loading
 * them all at once lets the cards show averages without extra queries.
 */
export function subscribeToReviews(
  onChange: (reviews: ProductReview[]) => void,
  onError?: (err: Error) => void
): () => void {
  return onSnapshot(
    reviewsRef,
    (snapshot) => {
      const reviews = snapshot.docs.map((d) => {
        const data = d.data({ serverTimestamps: 'estimate' });
        return {
          ...(data as ProductReview),
          id: d.id,
          createdAt: (data.createdAt as Timestamp | undefined)?.toMillis() || Date.now(),
          updatedAt: (data.updatedAt as Timestamp | undefined)?.toMillis(),
        };
      });
      reviews.sort((a, b) => b.createdAt - a.createdAt);
      onChange(reviews);
    },
    onError
  );
}

export function summarizeRatings(reviews: ProductReview[]): RatingSummary {
  if (reviews.length === 0) return { average: 0, count: 0 };
  const total = reviews.reduce((acc, r) => acc + r.rating, 0);
  return { average: total / reviews.length, count: reviews.length };
}

/**
 * Creates or updates the signed-in user's review of a product.
 */
export async function saveReview(
  review: Omit<ProductReview, 'id' | 'createdAt' | 'updatedAt'>,
  isNew: boolean
): Promise<void> {
  const ref = doc(reviewsRef, `${review.productId}_${review.userId}`);
  const data = { ...review, rating: Math.round(review.rating) };
  if (isNew) {
    await setDoc(ref, { ...data, createdAt: serverTimestamp() });
  } else {
    await setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true });
  }
}

export async function deleteReview(reviewId: string): Promise<void> {
  await deleteDoc(doc(reviewsRef, reviewId));
}

/**
 * Returns the id of one of the user's cart orders that includes this product, if any.
 */
export async function findOrderWithProduct(uid: string, productId: string): Promise<string | undefined> {
  const snapshot = await getDocs(query(collection(db, 'orders'), where('userId', '==', uid)));
  const match = snapshot.docs.find((d) => {
    const ids = d.data().productIds as string[] | undefined;
    return Array.isArray(ids) && ids.includes(productId);
  });
  return match?.id;
}
