'use client';

import React, { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { AlertTriangle, Boxes } from 'lucide-react';
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

  const products = useQuery(api.inventory.listInventory, {
    search: search || undefined,
    stockStatus: tab === 'all' ? undefined : (tab as 'inStock' | 'lowStock' | 'outOfStock'),
    limit: 300,
  });
  const adjustStock = useMutation(api.inventory.adjustStock);

  const handleAdjust = async (productId: Id<'products'>, delta: number, name: string) => {
    await adjustStock({ productId, changeAmount: delta, reason: 'Manual adjustment' });
    toast(`${name} stock ${delta > 0 ? 'increased' : 'decreased'} by ${Math.abs(delta)}`);
  };

  const columns: DataTableColumn<any>[] = [
    { key: 'name', label: 'Product', render: (r) => <span className="font-medium text-p-text">{r.name}</span> },
    { key: 'sku', label: 'SKU', hideOnMobile: true, render: (r) => r.sku || '—' },
    { key: 'classification', label: 'Class', hideOnMobile: true },
    {
      key: 'stockQty',
      label: 'Stock',
      align: 'right',
      render: (r) => <span className={r.stockQty === 0 ? 'text-p-critical font-semibold' : r.stockQty <= 10 ? 'text-[#92400E] font-semibold' : ''}>{r.stockQty}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) =>
        r.stockQty === 0 ? (
          <Badge status="critical">Out of stock</Badge>
        ) : r.stockQty <= 10 ? (
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
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => handleAdjust(r._id, -1, r.name)} disabled={r.stockQty === 0} className="w-6 h-6 rounded border border-p-border-input hover:bg-p-bg disabled:opacity-40">−</button>
          <button onClick={() => handleAdjust(r._id, 1, r.name)} className="w-6 h-6 rounded border border-p-border-input hover:bg-p-bg">+</button>
        </div>
      ),
    },
  ];

  return (
    <div className="pb-16">
      <PageHeader title="Products" />
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
                icon={AlertTriangle}
                heading="No products found"
                body="Try changing the filters or search term."
              />
            }
          />
        )}
      </Card>
    </div>
  );
}
