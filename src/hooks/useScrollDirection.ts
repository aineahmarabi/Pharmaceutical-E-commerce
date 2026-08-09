import { useEffect, useRef, useState } from 'react';

/** 'up' | 'down' based on recent scroll delta. Stays 'up' near the top of the page. */
export function useScrollDirection(threshold = 8) {
  const [direction, setDirection] = useState<'up' | 'down'>('up');
  const lastY = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;

    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastY.current;

      if (y < 80) {
        setDirection('up');
      } else if (Math.abs(delta) > threshold) {
        setDirection(delta > 0 ? 'down' : 'up');
      }
      lastY.current = y;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return direction;
}
