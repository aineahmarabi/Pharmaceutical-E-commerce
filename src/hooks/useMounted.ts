import { useEffect, useState } from 'react';

/** True only after the client has hydrated. Use to gate rendering of
 *  client-only/query-driven content whose item count can't be known
 *  during SSR, so the loading render is identical on server and client. */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
