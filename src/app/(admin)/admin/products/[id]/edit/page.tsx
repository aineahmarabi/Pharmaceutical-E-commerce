'use client';

import React, { useState, useRef, useEffect, use } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../../../../../convex/_generated/api';
import type { Id } from '../../../../../../../convex/_generated/dataModel';
import { useRouter } from 'next/navigation';
import { UploadCloud, X } from 'lucide-react';
import { PageHeader } from '@/components/admin/shared/PageHeader';
import { Card } from '@/components/admin/ui/Card';
import { Input, Textarea } from '@/components/admin/ui/Input';
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
  const product = useQuery(api.adminProducts.adminGetProduct, { id: productId });
  const generateUploadUrl = useMutation(api.products.generateUploadUrl);
  const updateProduct = useMutation(api.adminProducts.updateProduct);
  const duplicateProduct = useMutation(api.adminProducts.duplicateProduct);

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
        isNew: product.isNew ?? false,
        isTrending: product.isTrending ?? false,
        isBestSeller: product.isBestSeller ?? false,
        isOffer: product.isOffer ?? false,
        offerEndsAt: product.offerEndsAt ? new Date(product.offerEndsAt - new Date(product.offerEndsAt).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '',
      };
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
        const postUrl = await generateUploadUrl();
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
      <div className="pb-16 max-w-[998px] mx-auto">
        <PageHeader title="Loading..." backUrl="/admin/products" />
        <SkeletonLoader type="card" />
      </div>
    );
  }

  if (product === null) {
    return (
      <div className="pb-16 max-w-[998px] mx-auto">
        <PageHeader title="Product not found" backUrl="/admin/products" />
      </div>
    );
  }

  return (
    <div className="pb-16">
      <ContextualSaveBar isDirty={isDirty} onSave={handleSave} onDiscard={handleDiscard} saving={isSubmitting} />
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
        primaryAction={{ label: 'Save', onClick: handleSave }}
      />

      <div className="grid lg:grid-cols-[2fr_1fr] gap-5 items-start max-w-[998px] mx-auto">
        <div className="space-y-5 min-w-0">
          <Card title="Title & description">
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
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-p-border rounded-lg p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:border-p-primary hover:bg-p-success-subdued transition-colors"
            >
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
              <UploadCloud size={24} className="text-p-text-subdued mb-2" />
              <p className="text-sm text-p-text-subdued">Add files or drop image to upload</p>
            </div>
            {preview && (
              <div className="mt-4 flex gap-3">
                <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-p-border-subdued flex-shrink-0">
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  {file && (
                    <button
                      type="button"
                      onClick={removeFile}
                      className="absolute top-1 right-1 p-1 bg-white/90 text-p-critical rounded shadow-sm"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>
            )}
          </Card>

          <Card title="Clinical information">
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Generic name" name="genericName" value={formData.genericName} onChange={handleChange} placeholder="e.g. Paracetamol" />
                <div>
                  <label className="block text-sm font-medium text-p-text mb-1">Classification</label>
                  <select
                    name="classification"
                    value={formData.classification}
                    onChange={handleChange}
                    className="h-9 w-full rounded px-3 text-sm bg-p-bg-surface border border-p-border-input focus:outline-none focus:border-p-focus"
                  >
                    <option value="OTC">Over the Counter (OTC)</option>
                    <option value="P">Pharmacy (P)</option>
                    <option value="POM">Prescription Only (POM)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-p-text mb-1">Dosage form</label>
                  <select
                    name="form"
                    value={formData.form}
                    onChange={handleChange}
                    className="h-9 w-full rounded px-3 text-sm bg-p-bg-surface border border-p-border-input focus:outline-none focus:border-p-focus"
                  >
                    {['Tablet', 'Capsule', 'Syrup', 'Cream', 'Gel', 'Spray', 'Drops', 'Lozenge', 'Bar', 'Powder', 'Other'].map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
                <Input label="Strength" name="strength" value={formData.strength} onChange={handleChange} placeholder="e.g. 500mg" />
              </div>
              <Textarea label="Active ingredients" name="ingredients" value={formData.ingredients} onChange={handleChange} className="min-h-[70px]" />
              <Textarea label="Directions for use" name="directions" value={formData.directions} onChange={handleChange} className="min-h-[70px]" />
              <Textarea label="Warnings & precautions" name="warnings" value={formData.warnings} onChange={handleChange} className="min-h-[70px]" />
            </div>
          </Card>
        </div>

        <div className="space-y-5 min-w-0">
          <Card title="Pricing">
            <div className="space-y-4">
              <Input label="Price (KES)" type="number" name="price" value={formData.price} onChange={handleChange} required />
              <Input
                label="Compare-at price"
                type="number"
                name="compareAtPrice"
                value={formData.compareAtPrice}
                onChange={handleChange}
                helpText="To show a reduced price, move the original price here."
              />
            </div>
          </Card>

          <Card title="Inventory">
            <div className="space-y-4">
              <Input label="Stock quantity" type="number" name="stockQty" value={formData.stockQty} onChange={handleChange} required />
              <Input label="Pack size" name="packSize" value={formData.packSize} onChange={handleChange} placeholder="e.g. 2x10 tablets" />
            </div>
          </Card>

          <Card title="Organization">
            <div className="space-y-4">
              <Input label="Category" name="category" value={formData.category} onChange={handleChange} required />
              <Input label="Vendor" name="brand" value={formData.brand} onChange={handleChange} required />
            </div>
          </Card>

          <Card title="Merchandising">
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm text-p-text">
                <input type="checkbox" checked={formData.isNew} onChange={handleCheckbox('isNew')} className="accent-[#0D9488]" />
                Feature as New Arrival
              </label>
              <label className="flex items-center gap-2 text-sm text-p-text">
                <input type="checkbox" checked={formData.isTrending} onChange={handleCheckbox('isTrending')} className="accent-[#0D9488]" />
                Feature as Trending
              </label>
              <label className="flex items-center gap-2 text-sm text-p-text">
                <input type="checkbox" checked={formData.isBestSeller} onChange={handleCheckbox('isBestSeller')} className="accent-[#0D9488]" />
                Feature as Best Seller
              </label>
              <label className="flex items-center gap-2 text-sm text-p-text">
                <input type="checkbox" checked={formData.isOffer} onChange={handleCheckbox('isOffer')} className="accent-[#0D9488]" />
                Feature as Special Offer
              </label>
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
  );
}
