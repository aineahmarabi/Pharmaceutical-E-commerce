import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'New Arrivals',
};

export default function NewArrivalsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
