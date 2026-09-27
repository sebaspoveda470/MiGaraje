import { useEffect } from 'react';

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * Elements marked with `data-reveal` fade and rise into place the first time they scroll into view.
 * Siblings are staggered so grids appear one card after another. New elements (another tab,
 * listings arriving from Firestore) are picked up automatically. Content stays visible
 * when motion is reduced or IntersectionObserver is missing (the CSS only hides with `reveal-ready`).
 */
export function useScrollReveal(): void {
  useEffect(() => {
    if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') return;

    const root = document.documentElement;
    root.classList.add('reveal-ready');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          // An attribute, not a class: React rewrites className on re-render
          entry.target.setAttribute('data-revealed', '');
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.06 }
    );

    // Per run (not a DOM mark), so a remount starts watching again
    const watched = new WeakSet<Element>();
    const watchNew = () => {
      document.querySelectorAll<HTMLElement>('[data-reveal]:not([data-revealed])').forEach((el) => {
        if (watched.has(el)) return;
        watched.add(el);
        if (!el.style.getPropertyValue('--reveal-delay')) {
          const siblings = el.parentElement ? Array.from(el.parentElement.children).filter((c) => c.hasAttribute('data-reveal')) : [];
          const index = Math.max(0, siblings.indexOf(el));
          el.style.setProperty('--reveal-delay', `${(index % 6) * 70}ms`);
        }
        observer.observe(el);
      });
    };

    let frame = 0;
    const mutations = new MutationObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(watchNew);
    });
    watchNew();
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(frame);
      mutations.disconnect();
      observer.disconnect();
      root.classList.remove('reveal-ready');
    };
  }, []);
}
