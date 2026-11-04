'use client';

import React, { useState, useRef } from 'react';
import { useAdminMutation } from '@/hooks/useAdminApi';
import { api } from '../../../../../../convex/_generated/api';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { PageHeader } from '@/components/admin/shared/PageHeader';
import { Card } from '@/components/admin/ui/Card';
import { Input, Textarea } from '@/components/admin/ui/Input';
import { Button } from '@/components/admin/ui/Button';

export default function AddBrandPage() {
  const router = useRouter();
  const generateUploadUrl = useAdminMutation(api.files.generateUploadUrl);
  const createItem = useAdminMutation(api.taxonomy.createBrand);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [formData, setFormData] = useState({ name: '', description: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let imageStorageId = undefined;
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

      await createItem({
        ...formData,
        imageStorageId,
      });

      router.push('/admin/brands');
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pb-16 max-w-4xl mx-auto">
      <PageHeader
        title="Create brand"
        backUrl="/admin/brands"
        primaryAction={{ label: isSubmitting ? 'Saving...' : 'Save', onClick: () => formRef.current?.requestSubmit() }}
      />

      <form ref={formRef} onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-4 items-start">
          <Card title="Details">
            <div className="space-y-4">
              <Input label="Name" required name="name" value={formData.name} onChange={handleChange} placeholder="e.g. GlaxoSmithKline (GSK)" />
              <Textarea label="Description" name="description" value={formData.description} onChange={handleChange} className="min-h-[120px]" />
            </div>
          </Card>

          <Card title="Brand logo">
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            {preview ? (
              <div className="space-y-3">
                <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-p-border-subdued bg-p-bg">
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={removeFile}
                    aria-label="Remove image"
                    className="absolute top-2 right-2 p-1 bg-p-bg-surface text-p-critical rounded border border-p-border-subdued"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const dropped = e.dataTransfer.files?.[0];
                  if (dropped && dropped.type.startsWith('image/')) {
                    setFile(dropped);
                    setPreview(URL.createObjectURL(dropped));
                  }
                }}
                className="w-full h-32 rounded-lg border border-dashed border-p-border-input text-sm text-p-text-subdued hover:border-p-primary hover:text-p-text transition-colors"
              >
                Add image
                <span className="block text-xs mt-0.5">or drop a file here</span>
              </button>
            )}
          </Card>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button type="button" variant="secondary" onClick={() => router.push('/admin/brands')}>Cancel</Button>
          <Button type="submit" variant="primary" loading={isSubmitting}>Save brand</Button>
        </div>
      </form>
    </div>
  );
}
