'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
import { categories, brands } from '@/lib/fixtures/categories';

export default function AdminNewProductPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', brand: '', category: '', classification: 'OTC', price: '', compareAtPrice: '', strength: '', form: '', packSize: '', description: '', directions: '', warnings: '', ingredients: '', stockQty: '', inStock: true });

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    toast('Product created', 'success');
    router.push('/admin/products');
  };

  return (
    <div className="p-4 sm:p-6">
      <nav className="text-xs text-petrol-300 mb-3 flex gap-2">
        <Link href="/admin/products" className="hover:text-petrol">Products</Link><span>/</span><span className="text-ink">New Product</span>
      </nav>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
        <div className="bg-paper rounded-2xl border border-line p-6 space-y-4">
          <h2 className="font-semibold text-ink">Basic information</h2>
          {[
            { key: 'name', label: 'Product name', type: 'text' },
            { key: 'description', label: 'Description', type: 'textarea' },
          ].map(({ key, label, type }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-petrol-300 mb-1.5">{label}</label>
              {type === 'textarea' ? (
                <textarea rows={3} value={form[key as keyof typeof form] as string} onChange={update(key as keyof typeof form)} className="w-full bg-porcelain border border-line rounded-xl px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-petrol resize-none" />
              ) : (
                <input type={type} value={form[key as keyof typeof form] as string} onChange={update(key as keyof typeof form)} className="w-full bg-porcelain border border-line rounded-xl px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-petrol" />
              )}
            </div>
          ))}

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-petrol-300 mb-1.5">Brand</label>
              <select value={form.brand} onChange={update('brand')} className="w-full bg-porcelain border border-line rounded-xl px-3 py-2.5 text-sm text-ink focus:outline-none focus:border-petrol">
                <option value="">Select brand</option>
                {brands.map((b) => <option key={b.slug} value={b.slug}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-petrol-300 mb-1.5">Category</label>
              <select value={form.category} onChange={update('category')} className="w-full bg-porcelain border border-line rounded-xl px-3 py-2.5 text-sm text-ink focus:outline-none focus:border-petrol">
                <option value="">Select category</option>
                {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-petrol-300 mb-1.5">Classification</label>
              <select value={form.classification} onChange={update('classification')} className="w-full bg-porcelain border border-line rounded-xl px-3 py-2.5 text-sm text-ink focus:outline-none focus:border-petrol">
                <option value="OTC">OTC</option>
                <option value="P">P</option>
                <option value="POM">POM</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-paper rounded-2xl border border-line p-6 space-y-4">
          <h2 className="font-semibold text-ink">Pricing &amp; Inventory</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { key: 'price', label: 'Price (KES)' },
              { key: 'compareAtPrice', label: 'Compare-at price' },
              { key: 'stockQty', label: 'Stock quantity' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-petrol-300 mb-1.5">{label}</label>
                <input type="number" value={form[key as keyof typeof form] as string} onChange={update(key as keyof typeof form)} className="w-full bg-porcelain border border-line rounded-xl px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-petrol font-mono" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className="bg-petrol hover:bg-petrol-700 disabled:opacity-60 text-paper font-semibold px-6 py-2.5 rounded-xl transition-all hover:-translate-y-0.5 flex items-center gap-2">
            {saving ? <span className="w-4 h-4 border-2 border-paper/30 border-t-paper rounded-full animate-spin" /> : null}
            Create product
          </button>
          <Link href="/admin/products" className="text-sm text-petrol-300 hover:text-ink">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
