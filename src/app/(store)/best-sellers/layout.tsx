import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Best Sellers',
};

export default function BestSellersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
