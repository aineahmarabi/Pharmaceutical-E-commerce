import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Special Offers',
};

export default function OffersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
