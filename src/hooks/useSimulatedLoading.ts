'use client';

import { useState, useEffect } from 'react';

export function useSimulatedLoading(minMs = 300, maxMs = 800) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const delay = Math.random() * (maxMs - minMs) + minMs;
    const timer = setTimeout(() => setIsLoading(false), delay);
    return () => clearTimeout(timer);
  }, [minMs, maxMs]);

  return isLoading;
}
