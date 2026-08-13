import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQs',
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children;
}
