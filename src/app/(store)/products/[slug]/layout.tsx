import type { Metadata } from 'next';
import { convexServer } from '@/lib/convexServer';
import { api } from '../../../../../convex/_generated/api';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await convexServer.query(api.products.getBySlug, { slug });
  return { title: product?.name ?? 'Product' };
}

export default function ProductDetailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
