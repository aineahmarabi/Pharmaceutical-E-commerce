'use client';

import React, { useState } from 'react';
import { useAdminQuery, useAdminMutation } from '@/hooks/useAdminApi';
import { api } from '../../../../../convex/_generated/api';
import type { Id } from '../../../../../convex/_generated/dataModel';
import { PageHeader } from '@/components/admin/shared/PageHeader';
import { ProductsSubNav } from '@/components/admin/shared/ProductsSubNav';
import { Card } from '@/components/admin/ui/Card';
import { Tabs } from '@/components/admin/ui/Tabs';
import { FilterBar } from '@/components/admin/shared/FilterBar';
import { DataTable, type DataTableColumn } from '@/components/admin/ui/DataTable';
import { Badge } from '@/components/admin/ui/Badge';
import { EmptyState } from '@/components/admin/ui/EmptyState';
import { SkeletonLoader } from '@/components/admin/ui/SkeletonLoader';
import { useAdminToast } from '@/components/admin/ui/Toast';

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'inStock', label: 'In stock' },
  { id: 'lowStock', label: 'Low stock' },
  { id: 'outOfStock', label: 'Out of stock' },
];

export default function AdminInventoryPage() {
  const { toast } = useAdminToast();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('all');

  const products = useAdminQuery(api.inventory.listInventory, {
    search: search || undefined,
    stockStatus: tab === 'all' ? undefined : (tab as 'inStock' | 'lowStock' | 'outOfStock'),
    limit: 300,
  });
  const adjustStock = useAdminMutation(api.inventory.adjustStock);

  const handleAdjust = async (productId: Id<'products'>, delta: number, name: string) => {
    await adjustStock({ productId, changeAmount: delta, reason: 'Manual adjustment' });
    toast(`${name} stock ${delta > 0 ? 'increased' : 'decreased'} by ${Math.abs(delta)}`);
  };

  const columns: DataTableColumn<NonNullable<typeof products>[number] & { id: string }>[] = [
    { key: 'name', label: 'Product', render: (r) => <span className="font-medium text-p-text line-clamp-1">{r.name}</span> },
    { key: 'sku', label: 'SKU', hideOnMobile: true, render: (r) => r.sku || '—' },
    { key: 'classification', label: 'Class', hideOnMobile: true, render: (r) => <Badge>{r.classification}</Badge> },
    {
      key: 'stockQty',
      label: 'Stock',
      align: 'right',
      render: (r) => <span className="tabular-nums">{r.stockQty}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) =>
        r.stockQty === 0 ? (
          <Badge status="critical">Out of stock</Badge>
        ) : r.stockQty <= 5 ? (
          <Badge status="warning">Low stock</Badge>
        ) : (
          <Badge status="success">In stock</Badge>
        ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (r) => (
        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => handleAdjust(r._id, -1, r.name)} disabled={r.stockQty === 0} aria-label={`Decrease stock for ${r.name}`} className="w-8 h-8 rounded-lg border border-p-border-input text-p-text hover:bg-p-bg disabled:opacity-40 disabled:pointer-events-none">−</button>
          <button onClick={() => handleAdjust(r._id, 1, r.name)} aria-label={`Increase stock for ${r.name}`} className="w-8 h-8 rounded-lg border border-p-border-input text-p-text hover:bg-p-bg">+</button>
        </div>
      ),
    },
  ];

  return (
    <div className="pb-16">
      <PageHeader title="Inventory" />
      <ProductsSubNav />

      <Card>
        <div className="-mx-5 -mt-5 mb-4">
          <Tabs tabs={TABS} activeTab={tab} onChange={setTab} />
        </div>

        <FilterBar searchPlaceholder="Search inventory..." searchValue={search} onSearch={setSearch} />

        {products === undefined ? (
          <SkeletonLoader type="text" count={8} />
        ) : (
          <DataTable
            columns={columns}
            rows={products.map((p) => ({ ...p, id: p._id }))}
            emptyState={
              <EmptyState
                heading={search || tab !== 'all' ? 'No products match' : 'No inventory yet'}
                body={search || tab !== 'all' ? 'Try a different search term or another stock filter.' : 'Products you add will appear here with their stock levels.'}
              />
            }
          />
        )}
      </Card>
    </div>
  );
}
