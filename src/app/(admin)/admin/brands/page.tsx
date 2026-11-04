'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from 'convex/react';
import { useAdminMutation } from '@/hooks/useAdminApi';
import { api } from '../../../../../convex/_generated/api';
import { PageHeader } from '@/components/admin/shared/PageHeader';
import { Card } from '@/components/admin/ui/Card';
import { FilterBar } from '@/components/admin/shared/FilterBar';
import { DataTable, type DataTableColumn } from '@/components/admin/ui/DataTable';
import { EmptyState } from '@/components/admin/ui/EmptyState';
import { SkeletonLoader } from '@/components/admin/ui/SkeletonLoader';
import { Modal } from '@/components/admin/ui/Modal';
import { Input, Textarea } from '@/components/admin/ui/Input';
import { useAdminToast } from '@/components/admin/ui/Toast';
import { useConfirm } from '@/components/admin/ui/ConfirmDialog';

export default function AdminBrandsPage() {
  const { toast } = useAdminToast();
  const confirm = useConfirm();
  const items = useQuery(api.brands.list);
  const createItem = useAdminMutation(api.brands.create);
  const deleteItem = useAdminMutation(api.brands.remove);
  const generateUploadUrl = useAdminMutation(api.files.generateUploadUrl);

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const filtered = useMemo(() => {
    if (!items) return undefined;
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => i.name.toLowerCase().includes(q) || (i.description ?? '').toLowerCase().includes(q));
  }, [items, search]);

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ name: '', description: '' });
    setSelectedImage(null);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast('Enter a brand name');
      return;
    }
    setSaving(true);
    try {
      let imageStorageId = undefined;
      let imageUrl = undefined;

      if (selectedImage) {
        const postUrl = await generateUploadUrl({});
        const result = await fetch(postUrl, {
          method: 'POST',
          headers: { 'Content-Type': selectedImage.type },
          body: selectedImage,
        });
        const { storageId } = await result.json();
        imageStorageId = storageId;

        // Placeholder URL: the storage id can be resolved by the frontend later.
        imageUrl = `/api/image?storageId=${storageId}`;
      }

      const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      await createItem({ ...formData, slug, imageStorageId, imageUrl });
      closeModal();
      toast('Brand created');
    } catch (error) {
      toast('Failed to create brand');
    } finally {
      setSaving(false);
    }
  };

  type Row = NonNullable<typeof items>[number] & { id: string };
  const columns: DataTableColumn<Row>[] = [
    {
      key: 'name',
      label: 'Brand',
      render: (row) => (
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-p-bg border border-p-border-subdued flex-shrink-0 overflow-hidden">
            {row.imageUrl && <img src={row.imageUrl} alt="" className="w-full h-full object-cover" />}
          </div>
          <span className="font-medium text-p-text line-clamp-1">{row.name}</span>
        </div>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      hideOnMobile: true,
      render: (row) => <span className="text-p-text-subdued line-clamp-1">{row.description || '—'}</span>,
    },
    {
      key: 'productCount',
      label: 'Products',
      align: 'right',
      sortable: true,
      render: (row) => <span className="tabular-nums">{row.productCount || 0}</span>,
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (row) => (
        <button
          onClick={async (e) => {
            e.stopPropagation();
            const ok = await confirm({
              title: 'Delete brand',
              message: `Delete "${row.name}"? ${row.productCount || 0} product(s) will lose this brand. This can't be undone.`,
              confirmLabel: 'Delete',
              destructive: true,
            });
            if (!ok) return;
            await deleteItem({ id: row._id });
            toast('Brand deleted');
          }}
          className="text-p-critical text-sm font-medium hover:underline"
        >
          Delete
        </button>
      ),
    },
  ];

  return (
    <div className="pb-16">
      <PageHeader
        title="Brands"
        secondaryActions={[{ label: 'Full form', href: '/admin/brands/new' }]}
        primaryAction={{ label: 'Add brand', onClick: () => setIsModalOpen(true) }}
      />

      <Card>
        <FilterBar searchPlaceholder="Search brands..." searchValue={search} onSearch={setSearch} />

        {!filtered ? (
          <SkeletonLoader type="text" count={6} />
        ) : (
          <DataTable
            columns={columns}
            rows={filtered.map((i) => ({ ...i, id: i._id }))}
            emptyState={
              <EmptyState
                heading={search ? 'No brands match' : 'No brands yet'}
                body={search ? 'Try a different search term.' : 'Add the brands you stock so products can be grouped by brand.'}
                action={search ? undefined : { label: 'Add brand', onClick: () => setIsModalOpen(true) }}
              />
            }
          />
        )}
      </Card>

      <Modal
        open={isModalOpen}
        onClose={closeModal}
        title="Add brand"
        primaryAction={{ label: saving ? 'Saving...' : 'Save', onClick: handleSubmit, loading: saving }}
        secondaryAction={{ label: 'Cancel', onClick: closeModal }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="space-y-4"
        >
          <div>
            <label htmlFor="brand-image" className="block text-sm font-medium text-p-text mb-1">Logo</label>
            <input
              id="brand-image"
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
              className="block w-full text-sm text-p-text-subdued file:mr-3 file:h-9 file:px-3 file:rounded file:border file:border-p-border-input file:bg-p-bg-surface file:text-sm file:text-p-text"
            />
          </div>
          <Input label="Name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. GSK" />
          <Textarea label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="min-h-[80px]" placeholder="Short description (optional)" />
          <button type="submit" className="hidden" aria-hidden="true" tabIndex={-1} />
        </form>
      </Modal>
    </div>
  );
}
