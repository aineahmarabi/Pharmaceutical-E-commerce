'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const SHOW_AFTER_PX = 240; // appears once the shopper has scrolled a little
const SIZE = 48;
const STROKE = 3;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * "Back to top" button with a circular progress ring that fills as the page is scrolled.
 * It fades in after a short scroll, sits above the floating help button, and scrolls
 * smoothly (instantly for people who prefer reduced motion).
 */
export function ScrollToTop() {
  const [progress, setProgress] = useState(0); // 0 to 1
  const [visible, setVisible] = useState(false);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    const update = () => {
      frame.current = null;
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      const y = window.scrollY;
      setProgress(scrollable > 0 ? Math.min(1, Math.max(0, y / scrollable)) : 0);
      setVisible(y > SHOW_AFTER_PX);
    };
    // One update per frame, however fast the scroll events arrive.
    const onScroll = () => {
      if (frame.current === null) frame.current = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, []);

  const goTop = () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  };

  return (
    <button
      type="button"
      onClick={goTop}
      aria-label="Scroll to top"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={cn(
        // Stacked above the "Ask a pharmacist" button: phones clear the tab bar, wider screens sit just over the help button.
        'fixed bottom-36 right-4 z-30 flex items-center justify-center rounded-full bg-paper text-ink shadow-md md:bottom-31 md:right-6',
        'transition-[opacity,transform,color] duration-300 ease-out motion-reduce:transition-none',
        'hover:text-petrol active:scale-[0.94] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-petrol/40',
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0',
      )}
      style={{ width: SIZE, height: SIZE }}
    >
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="absolute inset-0 -rotate-90" aria-hidden="true">
        <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" strokeWidth={STROKE} className="stroke-line" />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
          strokeLinecap="round"
          className="stroke-petrol"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
        />
      </svg>
      <ArrowUp size={18} aria-hidden="true" className="relative" />
    </button>
  );
}
