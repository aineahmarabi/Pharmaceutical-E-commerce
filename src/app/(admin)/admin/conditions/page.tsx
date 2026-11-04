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

export default function AdminConditionsPage() {
  const { toast } = useAdminToast();
  const confirm = useConfirm();
  const items = useQuery(api.taxonomy.listConditions);
  const createItem = useAdminMutation(api.taxonomy.createCondition);
  const deleteItem = useAdminMutation(api.taxonomy.deleteCondition);

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
      toast('Enter a condition name');
      return;
    }
    setSaving(true);
    try {
      await createItem(formData);
      closeModal();
      toast('Condition created');
    } catch (error) {
      toast('Failed to create condition');
    } finally {
      setSaving(false);
    }
  };

  type Row = NonNullable<typeof items>[number] & { id: string };
  const columns: DataTableColumn<Row>[] = [
    {
      key: 'name',
      label: 'Condition',
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
              title: 'Delete condition',
              message: `Delete "${row.name}"? ${row.productCount || 0} product(s) will lose this condition. This can't be undone.`,
              confirmLabel: 'Delete',
              destructive: true,
            });
            if (!ok) return;
            await deleteItem({ id: row._id });
            toast('Condition deleted');
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
        title="Health conditions"
        secondaryActions={[{ label: 'Full form', href: '/admin/conditions/new' }]}
        primaryAction={{ label: 'Add condition', onClick: () => setIsModalOpen(true) }}
      />

      <Card>
        <FilterBar searchPlaceholder="Search conditions..." searchValue={search} onSearch={setSearch} />

        {!filtered ? (
          <SkeletonLoader type="text" count={6} />
        ) : (
          <DataTable
            columns={columns}
            rows={filtered.map((i) => ({ ...i, id: i._id }))}
            emptyState={
              <EmptyState
                heading={search ? 'No conditions match' : 'No conditions yet'}
                body={search ? 'Try a different search term.' : 'Add health conditions so customers can shop by what they need.'}
                action={search ? undefined : { label: 'Add condition', onClick: () => setIsModalOpen(true) }}
              />
            }
          />
        )}
      </Card>

      <Modal
        open={isModalOpen}
        onClose={closeModal}
        title="Add condition"
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
          <Input label="Name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Hypertension" />
          <Textarea label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="min-h-[80px]" placeholder="Short description (optional)" />
          <button type="submit" className="hidden" aria-hidden="true" tabIndex={-1} />
        </form>
      </Modal>
    </div>
  );
}
