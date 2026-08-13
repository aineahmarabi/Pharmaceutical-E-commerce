import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Trending Now',
};

export default function TrendingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
