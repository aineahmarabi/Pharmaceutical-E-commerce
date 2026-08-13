import type { Metadata } from 'next';
import { convexServer } from '@/lib/convexServer';
import { api } from '../../../../../convex/_generated/api';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const brand = await convexServer.query(api.brands.getBySlug, { slug });
  return { title: brand?.name ?? 'Brand' };
}

export default function BrandDetailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
