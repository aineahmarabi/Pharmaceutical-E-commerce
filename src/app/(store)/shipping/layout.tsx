import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shipping Info',
};

export default function ShippingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
