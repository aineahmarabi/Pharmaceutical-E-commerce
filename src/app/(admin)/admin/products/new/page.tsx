'use client';

import React, { useState, useRef } from 'react';
import { useAdminMutation } from '@/hooks/useAdminApi';
import { api } from '../../../../../../convex/_generated/api';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { PageHeader } from '@/components/admin/shared/PageHeader';
import { Card } from '@/components/admin/ui/Card';
import { Input, Textarea } from '@/components/admin/ui/Input';
import { Select } from '@/components/admin/ui/Select';
import { Button } from '@/components/admin/ui/Button';

export default function AddProductPage() {
  const router = useRouter();
  const generateUploadUrl = useAdminMutation(api.files.generateUploadUrl);
  const createProduct = useAdminMutation(api.adminProducts.createProduct);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    genericName: '',
    category: '',
    classification: 'OTC' as 'OTC' | 'P' | 'POM',
    form: 'Tablet',
    strength: '',
    packSize: '',
    price: '',
    compareAtPrice: '',
    description: '',
    directions: '',
    warnings: '',
    ingredients: '',
    stockQty: '0',
    sku: '',
    barcode: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped && dropped.type.startsWith('image/')) {
      setFile(dropped);
      setPreview(URL.createObjectURL(dropped));
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let imageStorageId = undefined;

      // Upload image to Convex Storage
      if (file) {
        const postUrl = await generateUploadUrl({});
        const result = await fetch(postUrl, {
          method: 'POST',
          headers: { 'Content-Type': file.type },
          body: file,
        });
        const { storageId } = await result.json();
        imageStorageId = storageId;
      }

      const categorySlug = slugify(formData.category);
      const brandSlug = slugify(formData.brand);
      const slug = slugify(formData.name);

      await createProduct({
        ...formData,
        slug,
        categorySlug,
        brandSlug,
        price: Number(formData.price),
        compareAtPrice: formData.compareAtPrice ? Number(formData.compareAtPrice) : undefined,
        sku: formData.sku.trim() || undefined,
        barcode: formData.barcode.trim() || undefined,
        stockQty: Number(formData.stockQty),
        inStock: Number(formData.stockQty) > 0,
        conditions: [], // default empty, could add UI for this later
        imageStorageId,
      });

      router.push('/admin/products');
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pb-16 max-w-5xl mx-auto">
      <PageHeader
        title="Add product"
        backUrl="/admin/products"
        primaryAction={{ label: isSubmitting ? 'Saving...' : 'Save', onClick: () => formRef.current?.requestSubmit() }}
      />

      <form ref={formRef} onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-4 items-start">
          <div className="space-y-4 min-w-0">
            <Card title="Title and description">
              <div className="space-y-4">
                <Input label="Title" required name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Panadol Extra Advance" />
                <Textarea
                  label="Description"
                  required
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="min-h-[160px]"
                />
              </div>
            </Card>

            <Card title="Media">
              <div onDragOver={(e) => e.preventDefault()} onDrop={handleDrop} className="flex flex-wrap items-center gap-4">
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                {preview && (
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-p-border-subdued flex-shrink-0 bg-p-bg">
                    <img src={preview} alt="Product preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={removeFile}
                      aria-label="Remove image"
                      className="absolute top-1 right-1 p-1 bg-p-bg-surface text-p-critical rounded border border-p-border-subdued"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 min-w-[200px] h-24 rounded-lg border border-dashed border-p-border-input text-sm text-p-text-subdued hover:border-p-primary hover:text-p-text transition-colors"
                >
                  {preview ? 'Replace image' : 'Add image'}
                  <span className="block text-xs mt-0.5">or drop a file here</span>
                </button>
              </div>
            </Card>

            <Card title="Pricing">
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Price (KES)" required type="number" name="price" value={formData.price} onChange={handleChange} placeholder="0.00" />
                <Input
                  label="Compare-at price (KES)"
                  type="number"
                  name="compareAtPrice"
                  value={formData.compareAtPrice}
                  onChange={handleChange}
                  placeholder="0.00"
                  helpText="To show a reduced price, move the original price here."
                />
              </div>
            </Card>

            <Card title="Inventory">
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Stock quantity" required type="number" name="stockQty" value={formData.stockQty} onChange={handleChange} placeholder="0" />
                <Input label="Pack size" name="packSize" value={formData.packSize} onChange={handleChange} placeholder="e.g. 2x10 tablets" />
                <Input label="SKU" name="sku" value={formData.sku} onChange={handleChange} />
                <Input label="Barcode" name="barcode" value={formData.barcode} onChange={handleChange} helpText="Scan or type. Used at the point of sale." />
              </div>
            </Card>

            <Card title="Classification">
              <div className="grid sm:grid-cols-2 gap-4">
                <Select
                  label="Medicine class"
                  value={formData.classification}
                  onChange={(v) => setFormData({ ...formData, classification: v as 'OTC' | 'P' | 'POM' })}
                  options={[
                    { value: 'OTC', label: 'Over the counter (OTC)' },
                    { value: 'P', label: 'Pharmacy only (P)' },
                    { value: 'POM', label: 'Prescription only (POM)' },
                  ]}
                  helpText={formData.classification === 'POM' ? 'Customers are told a prescription is needed.' : undefined}
                />
                <Input label="Generic name" name="genericName" value={formData.genericName} onChange={handleChange} placeholder="e.g. Paracetamol" />
                <Select
                  label="Dosage form"
                  value={formData.form}
                  onChange={(v) => setFormData({ ...formData, form: v })}
                  options={['Tablet', 'Capsule', 'Syrup', 'Cream', 'Drops'].map((f) => ({ value: f, label: f }))}
                />
                <Input label="Strength" name="strength" value={formData.strength} onChange={handleChange} placeholder="e.g. 500mg" />
              </div>
            </Card>

            <Card title="Clinical information">
              <div className="space-y-4">
                <Textarea label="Active ingredients" name="ingredients" value={formData.ingredients} onChange={handleChange} className="min-h-[70px]" placeholder="List active ingredients" />
                <Textarea label="Directions for use" name="directions" value={formData.directions} onChange={handleChange} className="min-h-[70px]" placeholder="How to use this product" />
                <Textarea label="Warnings and precautions" name="warnings" value={formData.warnings} onChange={handleChange} className="min-h-[70px]" placeholder="Side effects or warnings" />
              </div>
            </Card>
          </div>

          <div className="space-y-4 min-w-0">
            <Card title="Organisation">
              <div className="space-y-4">
                <Input label="Category" required name="category" value={formData.category} onChange={handleChange} placeholder="e.g. Pain Relief" />
                <Input label="Brand" required name="brand" value={formData.brand} onChange={handleChange} placeholder="e.g. GSK" />
              </div>
            </Card>
            <Card title="Status">
              <p className="text-sm text-p-text-subdued">
                New products are marked in stock when the stock quantity is above zero.
              </p>
            </Card>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button type="button" variant="secondary" onClick={() => router.push('/admin/products')}>Cancel</Button>
          <Button type="submit" variant="primary" loading={isSubmitting}>Save product</Button>
        </div>
      </form>
    </div>
  );
}
