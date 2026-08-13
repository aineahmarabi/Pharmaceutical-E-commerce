import type { Metadata } from 'next';
import { convexServer } from '@/lib/convexServer';
import { api } from '../../../../../convex/_generated/api';

function titleize(slug: string) {
  return slug.split('-').map((w) => w[0]?.toUpperCase() + w.slice(1)).join(' ');
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const categories = await convexServer.query(api.taxonomy.listCategories, {});
  const category = categories.find((c) => c.slug === slug);
  return { title: category?.name ?? titleize(slug) };
}

export default function CategoryDetailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
