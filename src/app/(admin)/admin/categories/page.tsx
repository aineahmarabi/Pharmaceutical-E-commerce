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

export default function AdminCategoriesPage() {
  const { toast } = useAdminToast();
  const confirm = useConfirm();
  const items = useQuery(api.taxonomy.listCategories);
  const createItem = useAdminMutation(api.taxonomy.createCategory);
  const deleteItem = useAdminMutation(api.taxonomy.deleteCategory);

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const filtered = useMemo(() => {
    if (!items) return undefined;
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => i.name.toLowerCase().includes(q) || (i.description ?? '').toLowerCase().includes(q));
  }, [items, search]);

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ name: '', description: '' });
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast('Enter a category name');
      return;
    }
    setSaving(true);
    try {
      await createItem(formData);
      closeModal();
      toast('Category created');
    } catch (error) {
      toast('Failed to create category');
    } finally {
      setSaving(false);
    }
  };

  type Row = NonNullable<typeof items>[number] & { id: string };
  const columns: DataTableColumn<Row>[] = [
    {
      key: 'name',
      label: 'Category',
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
              title: 'Delete category',
              message: `Delete "${row.name}"? ${row.productCount || 0} product(s) will lose this category. This can't be undone.`,
              confirmLabel: 'Delete',
              destructive: true,
            });
            if (!ok) return;
            await deleteItem({ id: row._id });
            toast('Category deleted');
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
        title="Categories"
        secondaryActions={[{ label: 'Full form', href: '/admin/categories/new' }]}
        primaryAction={{ label: 'Add category', onClick: () => setIsModalOpen(true) }}
      />

      <Card>
        <FilterBar searchPlaceholder="Search categories..." searchValue={search} onSearch={setSearch} />

        {!filtered ? (
          <SkeletonLoader type="text" count={6} />
        ) : (
          <DataTable
            columns={columns}
            rows={filtered.map((i) => ({ ...i, id: i._id }))}
            emptyState={
              <EmptyState
                heading={search ? 'No categories match' : 'No categories yet'}
                body={search ? 'Try a different search term.' : 'Add categories so customers can browse your products.'}
                action={search ? undefined : { label: 'Add category', onClick: () => setIsModalOpen(true) }}
              />
            }
          />
        )}
      </Card>

      <Modal
        open={isModalOpen}
        onClose={closeModal}
        title="Add category"
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
          <Input label="Name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Pain Relief" />
          <Textarea label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="min-h-[80px]" placeholder="Short description (optional)" />
          <button type="submit" className="hidden" aria-hidden="true" tabIndex={-1} />
        </form>
      </Modal>
    </div>
  );
}
