import React, { useEffect, useRef, useState } from 'react';

interface SwipeRowProps {
  /** Layout from tablets up (e.g. "sm:grid sm:grid-cols-3") plus the gap; phones always get the swipeable row */
  className?: string;
  children: React.ReactNode;
}

// More cards than this and the dots turn into a single progress bar
const MAX_DOTS = 8;

/**
 * A row of cards that swipes sideways on phones and is a normal grid on larger screens.
 * On phones it shows which card you are on, so it is clear there is more to the side.
 */
export const SwipeRow: React.FC<SwipeRowProps> = ({ className = '', children }) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState({ count: 0, active: 0, progress: 0, scrollable: false });

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;

    let frame = 0;
    const measure = () => {
      const cards = Array.from(row.children) as HTMLElement[];
      const max = row.scrollWidth - row.clientWidth;
      const scrollable = max > 4;
      let active = 0;
      if (scrollable && row.scrollLeft >= max - 4) {
        // The last cards can't reach the left edge: the end of the row counts as the last one
        active = cards.length - 1;
      } else if (scrollable) {
        const start = row.getBoundingClientRect().left;
        let best = Infinity;
        cards.forEach((card, i) => {
          const distance = Math.abs(card.getBoundingClientRect().left - start);
          if (distance < best) {
            best = distance;
            active = i;
          }
        });
      }
      const progress = scrollable ? Math.min(1, Math.max(0, row.scrollLeft / max)) : 0;
      setState((prev) =>
        prev.count === cards.length && prev.active === active && prev.scrollable === scrollable && Math.abs(prev.progress - progress) < 0.01
          ? prev
          : { count: cards.length, active, progress, scrollable }
      );
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };

    measure();
    row.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    // Cards arrive later (Firestore) or change with a filter
    const mutations = new MutationObserver(schedule);
    mutations.observe(row, { childList: true });
    return () => {
      cancelAnimationFrame(frame);
      row.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      mutations.disconnect();
    };
  }, []);

  return (
    <div>
      <div ref={rowRef} className={`swipe-row ${className}`}>
        {children}
      </div>
      {state.scrollable && state.count > 1 && (
        <div aria-hidden="true" className="sm:hidden flex justify-center items-center gap-1.5 pt-3">
          {state.count <= MAX_DOTS ? (
            Array.from({ length: state.count }, (_, i) => (
              <span key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === state.active ? 'w-5 bg-blue-600' : 'w-1.5 bg-slate-300'}`} />
            ))
          ) : (
            <span className="relative h-1.5 w-24 rounded-full bg-slate-200 overflow-hidden">
              <span className="absolute top-0 h-full w-8 rounded-full bg-blue-600" style={{ left: `calc(${state.progress} * (100% - 2rem))` }} />
            </span>
          )}
        </div>
      )}
    </div>
  );
};
