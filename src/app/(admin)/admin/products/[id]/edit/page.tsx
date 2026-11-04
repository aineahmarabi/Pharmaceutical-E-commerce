'use client';

import React, { useState, useRef, useEffect, use } from 'react';
import { useAdminQuery, useAdminMutation } from '@/hooks/useAdminApi';
import { api } from '../../../../../../../convex/_generated/api';
import type { Id } from '../../../../../../../convex/_generated/dataModel';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { PageHeader } from '@/components/admin/shared/PageHeader';
import { Card } from '@/components/admin/ui/Card';
import { Input, Textarea } from '@/components/admin/ui/Input';
import { Select } from '@/components/admin/ui/Select';
import { Badge } from '@/components/admin/ui/Badge';
import { ContextualSaveBar } from '@/components/admin/ui/ContextualSaveBar';
import { SkeletonLoader } from '@/components/admin/ui/SkeletonLoader';
import { useAdminToast } from '@/components/admin/ui/Toast';

const emptyForm = {
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
  isNew: false,
  isTrending: false,
  isBestSeller: false,
  isOffer: false,
  offerEndsAt: '',
};

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const productId = id as Id<'products'>;
  const router = useRouter();
  const { toast } = useAdminToast();
  const product = useAdminQuery(api.adminProducts.adminGetProduct, { id: productId });
  const generateUploadUrl = useAdminMutation(api.files.generateUploadUrl);
  const updateProduct = useAdminMutation(api.adminProducts.updateProduct);
  const duplicateProduct = useAdminMutation(api.adminProducts.duplicateProduct);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState(emptyForm);
  const [initialData, setInitialData] = useState(emptyForm);

  useEffect(() => {
    if (product) {
      const next = {
        name: product.name ?? '',
        brand: product.brand ?? '',
        genericName: product.genericName ?? '',
        category: product.category ?? '',
        classification: product.classification ?? 'OTC',
        form: product.form ?? 'Tablet',
        strength: product.strength ?? '',
        packSize: product.packSize ?? '',
        price: product.price?.toString() ?? '',
        compareAtPrice: product.compareAtPrice?.toString() ?? '',
        description: product.description ?? '',
        directions: product.directions ?? '',
        warnings: product.warnings ?? '',
        ingredients: product.ingredients ?? '',
        stockQty: product.stockQty?.toString() ?? '0',
        sku: product.sku ?? '',
        barcode: product.barcode ?? '',
        isNew: product.isNew ?? false,
        isTrending: product.isTrending ?? false,
        isBestSeller: product.isBestSeller ?? false,
        isOffer: product.isOffer ?? false,
        offerEndsAt: product.offerEndsAt ? new Date(product.offerEndsAt - new Date(product.offerEndsAt).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '',
      };
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initialise form once product loads
      setFormData(next);
      setInitialData(next);
      if (product.imageUrl) setPreview(product.imageUrl);
    }
  }, [product]);

  const isDirty = JSON.stringify(formData) !== JSON.stringify(initialData) || file !== null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckbox = (name: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [name]: e.target.checked });
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
    setPreview(product?.imageUrl ?? null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      let imageStorageId: string | undefined;
      if (file) {
        const postUrl = await generateUploadUrl({});
        const result = await fetch(postUrl, { method: 'POST', headers: { 'Content-Type': file.type }, body: file });
        const { storageId } = await result.json();
        imageStorageId = storageId;
      }

      await updateProduct({
        id: productId,
        updates: {
          ...formData,
          slug: slugify(formData.name),
          categorySlug: slugify(formData.category),
          brandSlug: slugify(formData.brand),
          price: Number(formData.price),
          compareAtPrice: formData.compareAtPrice ? Number(formData.compareAtPrice) : undefined,
          sku: formData.sku.trim() || undefined,
          barcode: formData.barcode.trim() || undefined,
          stockQty: Number(formData.stockQty),
          inStock: Number(formData.stockQty) > 0,
          isNew: formData.isNew,
          isTrending: formData.isTrending,
          isBestSeller: formData.isBestSeller,
          isOffer: formData.isOffer,
          offerEndsAt: formData.isOffer && formData.offerEndsAt ? new Date(formData.offerEndsAt).getTime() : undefined,
          ...(imageStorageId ? { imageStorageId: imageStorageId as Id<'_storage'> } : {}),
        },
      });

      setInitialData(formData);
      setFile(null);
      toast('Product saved');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDiscard = () => {
    setFormData(initialData);
    setFile(null);
    setPreview(product?.imageUrl ?? null);
  };

  if (product === undefined) {
    return (
      <div className="pb-16 max-w-5xl mx-auto">
        <PageHeader title="Loading..." backUrl="/admin/products" />
        <SkeletonLoader type="card" />
      </div>
    );
  }

  if (product === null) {
    return (
      <div className="pb-16 max-w-5xl mx-auto">
        <PageHeader title="Product not found" backUrl="/admin/products" />
      </div>
    );
  }

  const qty = Number(formData.stockQty) || 0;
  const checkClass = 'h-4 w-4 rounded accent-p-primary';

  return (
    <div className="pb-16">
      <ContextualSaveBar isDirty={isDirty} onSave={handleSave} onDiscard={handleDiscard} saving={isSubmitting} />
      <div className="max-w-5xl mx-auto">
        <PageHeader
          title={product.name}
          backUrl="/admin/products"
          secondaryActions={[
            {
              label: 'Duplicate',
              onClick: async () => {
                const newId = await duplicateProduct({ id: productId });
                toast('Product duplicated');
                router.push(`/admin/products/${newId}/edit`);
              },
            },
          ]}
        />

        <div className="grid lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-4 items-start">
          <div className="space-y-4 min-w-0">
            <Card title="Title and description">
              <div className="space-y-4">
                <Input label="Title" name="name" value={formData.name} onChange={handleChange} required />
                <Textarea
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="min-h-[160px]"
                  required
                />
              </div>
            </Card>

            <Card title="Media">
              <div onDragOver={(e) => e.preventDefault()} onDrop={handleDrop} className="flex flex-wrap items-center gap-4">
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                {preview && (
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-p-border-subdued flex-shrink-0 bg-p-bg">
                    <img src={preview} alt="Product" className="w-full h-full object-cover" />
                    {file && (
                      <button
                        type="button"
                        onClick={removeFile}
                        aria-label="Remove new image"
                        className="absolute top-1 right-1 p-1 bg-p-bg-surface text-p-critical rounded border border-p-border-subdued"
                      >
                        <X size={12} />
                      </button>
                    )}
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
                <Input label="Price (KES)" type="number" name="price" value={formData.price} onChange={handleChange} required />
                <Input
                  label="Compare-at price (KES)"
                  type="number"
                  name="compareAtPrice"
                  value={formData.compareAtPrice}
                  onChange={handleChange}
                  helpText="To show a reduced price, move the original price here."
                />
              </div>
            </Card>

            <Card title="Inventory">
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Stock quantity" type="number" name="stockQty" value={formData.stockQty} onChange={handleChange} required />
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
                  options={['Tablet', 'Capsule', 'Syrup', 'Cream', 'Gel', 'Spray', 'Drops', 'Lozenge', 'Bar', 'Powder', 'Other'].map((f) => ({ value: f, label: f }))}
                />
                <Input label="Strength" name="strength" value={formData.strength} onChange={handleChange} placeholder="e.g. 500mg" />
              </div>
            </Card>

            <Card title="Clinical information">
              <div className="space-y-4">
                <Textarea label="Active ingredients" name="ingredients" value={formData.ingredients} onChange={handleChange} className="min-h-[70px]" />
                <Textarea label="Directions for use" name="directions" value={formData.directions} onChange={handleChange} className="min-h-[70px]" />
                <Textarea label="Warnings and precautions" name="warnings" value={formData.warnings} onChange={handleChange} className="min-h-[70px]" />
              </div>
            </Card>
          </div>

          <div className="space-y-4 min-w-0">
            <Card title="Status">
              <div className="space-y-2">
                {qty === 0 ? (
                  <Badge status="critical">Out of stock</Badge>
                ) : qty < 10 ? (
                  <Badge status="warning">Low stock</Badge>
                ) : (
                  <Badge status="success">Active</Badge>
                )}
                <p className="text-sm text-p-text-subdued">
                  Status follows the stock quantity. {qty} unit{qty === 1 ? '' : 's'} available.
                </p>
              </div>
            </Card>

            <Card title="Organisation">
              <div className="space-y-4">
                <Input label="Category" name="category" value={formData.category} onChange={handleChange} required />
                <Input label="Brand" name="brand" value={formData.brand} onChange={handleChange} required />
              </div>
            </Card>

            <Card title="Merchandising">
              <div className="space-y-3">
                {([
                  ['isNew', 'New arrival'],
                  ['isTrending', 'Trending'],
                  ['isBestSeller', 'Best seller'],
                  ['isOffer', 'Special offer'],
                ] as const).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 text-sm text-p-text">
                    <input type="checkbox" checked={formData[key]} onChange={handleCheckbox(key)} className={checkClass} />
                    {label}
                  </label>
                ))}
                {formData.isOffer && (
                  <Input
                    label="Offer ends"
                    type="datetime-local"
                    name="offerEndsAt"
                    value={formData.offerEndsAt}
                    onChange={handleChange}
                    helpText="The Special Offers countdown on the storefront ends at this time."
                  />
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
