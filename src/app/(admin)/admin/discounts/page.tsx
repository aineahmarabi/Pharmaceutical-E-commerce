'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from 'convex/react';
import { Percent } from 'lucide-react';
import { api } from '../../../../../convex/_generated/api';
import type { Id } from '../../../../../convex/_generated/dataModel';
import { PageHeader } from '@/components/admin/shared/PageHeader';
import { Card } from '@/components/admin/ui/Card';
import { Tabs } from '@/components/admin/ui/Tabs';
import { DataTable, type DataTableColumn } from '@/components/admin/ui/DataTable';
import { Badge } from '@/components/admin/ui/Badge';
import { EmptyState } from '@/components/admin/ui/EmptyState';
import { SkeletonLoader } from '@/components/admin/ui/SkeletonLoader';
import { useAdminToast } from '@/components/admin/ui/Toast';
import { useConfirm } from '@/components/admin/ui/ConfirmDialog';

function typeLabel(type: string) {
  if (type === 'percentage') return 'Percentage';
  if (type === 'fixed') return 'Fixed amount';
  if (type === 'freeShipping') return 'Free shipping';
  return 'Buy X get Y';
}

function valueLabel(d: any) {
  if (d.type === 'percentage') return `${d.value}%`;
  if (d.type === 'fixed') return `KES ${d.value}`;
  if (d.type === 'freeShipping') return 'Free shipping';
  return `${d.value}`;
}

export default function AdminDiscountsPage() {
  const router = useRouter();
  const { toast } = useAdminToast();
  const confirm = useConfirm();
  const [tab, setTab] = useState('all');
  const discounts = useQuery(api.discounts.listDiscounts);
  const deactivate = useMutation(api.discounts.deactivateDiscount);

  const filtered = useMemo(() => {
    if (!discounts) return undefined;
    if (tab === 'all') return discounts;
    return discounts.filter((d) => d.status === tab);
  }, [discounts, tab]);

  const columns: DataTableColumn<any>[] = [
    { key: 'code', label: 'Discount', render: (row) => <span className="font-semibold text-p-focus">{row.code}</span> },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <Badge status={row.status === 'active' ? 'success' : row.status === 'scheduled' ? 'info' : 'default'}>
          {row.status}
        </Badge>
      ),
    },
    { key: 'type', label: 'Type', render: (row) => typeLabel(row.type) },
    { key: 'value', label: 'Value', render: (row) => valueLabel(row) },
    { key: 'usedCount', label: 'Used', align: 'right', render: (row) => `${row.usedCount}×` },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (row) =>
        row.active ? (
          <button
            onClick={async (e) => {
              e.stopPropagation();
              const ok = await confirm({
                title: 'Deactivate discount',
                message: `${row.code} will stop applying at checkout immediately.`,
                confirmLabel: 'Deactivate',
                destructive: true,
              });
              if (!ok) return;
              await deactivate({ id: row._id as Id<'discounts'> });
              toast('Discount deactivated');
            }}
            className="text-p-critical text-sm hover:underline"
          >
            Deactivate
          </button>
        ) : null,
    },
  ];

  return (
    <div className="pb-16">
      <PageHeader title="Discounts" primaryAction={{ label: 'Create discount', href: '/admin/discounts/new' }} />

      <Card>
        <div className="-mx-5 -mt-5 mb-4">
          <Tabs
            tabs={[
              { id: 'all', label: 'All', badge: discounts?.length },
              { id: 'active', label: 'Active' },
              { id: 'scheduled', label: 'Scheduled' },
              { id: 'expired', label: 'Expired' },
            ]}
            activeTab={tab}
            onChange={setTab}
          />
        </div>

        {!filtered ? (
          <SkeletonLoader type="text" count={6} />
        ) : (
          <DataTable
            columns={columns}
            rows={filtered.map((d) => ({ ...d, id: d._id }))}
            onRowClick={(row) => router.push(`/admin/discounts/${row._id}`)}
            emptyState={
              <EmptyState
                icon={Percent}
                heading="Manage discounts and promotions"
                body="Create discount codes that apply at checkout."
                action={{ label: 'Create discount', onClick: () => router.push('/admin/discounts/new') }}
              />
            }
          />
        )}
      </Card>
    </div>
  );
}
