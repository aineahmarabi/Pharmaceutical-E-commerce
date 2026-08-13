import { ConvexHttpClient } from 'convex/browser';

// A lightweight, fetch-based Convex client safe to use in server components
// (e.g. generateMetadata) — distinct from the React client in lib/convex.tsx.
export const convexServer = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL as string);
