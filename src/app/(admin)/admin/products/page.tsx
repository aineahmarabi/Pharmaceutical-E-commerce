'use client';

import React, { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import { Pagination } from '@/components/admin/ui/Pagination';
import { BulkActionBar } from '@/components/admin/ui/BulkActionBar';
import { EmptyState } from '@/components/admin/ui/EmptyState';
import { SkeletonLoader } from '@/components/admin/ui/SkeletonLoader';
import { useAdminToast } from '@/components/admin/ui/Toast';
import { useConfirm } from '@/components/admin/ui/ConfirmDialog';

const PAGE_SIZE = 20;

type Product = {
  _id: Id<'products'>;
  name: string;
  brand: string;
  category: string;
  classification: 'OTC' | 'P' | 'POM';
  price: number;
  compareAtPrice?: number;
  stockQty: number;
  inStock: boolean;
  unlisted?: boolean;
  imageUrl?: string;
};

export default function AdminProductsPage() {
  const router = useRouter();
  const { toast } = useAdminToast();
  const confirm = useConfirm();
  const [searchTerm, setSearchTerm] = useState('');
  const [tab, setTab] = useState('all');
  const [page, setPage] = useState(1);
  const [classFilter, setClassFilter] = useState('All classes');
  const [sortBy, setSortBy] = useState('Newest first');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleStock = useAdminMutation(api.adminProducts.adminToggleStock);
  const deleteProduct = useAdminMutation(api.adminProducts.adminDeleteProduct);

  const products = useAdminQuery(api.adminProducts.adminListProducts, {
    limit: 500,
    search: searchTerm || undefined,
  }) as Product[] | undefined;

  const filtered = useMemo(() => {
    if (!products) return undefined;
    let list = products;
    if (tab === 'active') list = list.filter((p) => p.inStock);
    else if (tab === 'out') list = list.filter((p) => !p.inStock);
    else if (tab === 'low') list = list.filter((p) => p.inStock && p.stockQty <= 5);
    if (classFilter !== 'All classes') list = list.filter((p) => p.classification === classFilter);
    if (sortBy === 'Name A-Z') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === 'Price: low to high') list = [...list].sort((a, b) => a.price - b.price);
    else if (sortBy === 'Price: high to low') list = [...list].sort((a, b) => b.price - a.price);
    else if (sortBy === 'Stock: low to high') list = [...list].sort((a, b) => a.stockQty - b.stockQty);
    return list;
  }, [products, tab, classFilter, sortBy]);

  const filtersActive = !!searchTerm || tab !== 'all' || classFilter !== 'All classes';

  const pageRows = filtered?.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) ?? [];

  const q = (v: string) => v.replace(/"/g, '""');

  const handleExport = () => {
    if (!products || products.length === 0) return;
    const headers = ['ID', 'Name', 'Brand', 'Category', 'Price', 'Stock', 'Classification'];
    const csvContent = [
      headers.join(','),
      ...products.map((p) => `"${p._id}","${q(p.name)}","${q(p.brand)}","${q(p.category)}",${p.price},${p.stockQty},"${p.classification}"`),
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast('Products exported');
  };

  const handleImportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    toast(`Importing ${file.name}...`);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const columns: DataTableColumn<Product & { id: string }>[] = [
    {
      key: 'name',
      label: 'Product',
      render: (row) => (
        <Link href={`/admin/products/${row._id}/edit`} className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-p-bg border border-p-border-subdued flex-shrink-0 overflow-hidden">
            {row.imageUrl && <img src={row.imageUrl} alt="" className="w-full h-full object-cover" />}
          </div>
          <span className="min-w-0">
            <span className="block font-medium text-p-text line-clamp-1">{row.name}</span>
            <span className="block text-xs text-p-text-subdued line-clamp-1">{row.brand}</span>
          </span>
        </Link>
      ),
    },
    {
      key: 'inStock',
      label: 'Status',
      render: (row) =>
        row.unlisted ? (
          <Badge status="warning">Hidden</Badge>
        ) : !row.inStock || row.stockQty === 0 ? (
          <Badge status="critical">Out of stock</Badge>
        ) : row.stockQty <= 5 ? (
          <Badge status="warning">Low stock</Badge>
        ) : (
          <Badge status="success">Active</Badge>
        ),
    },
    {
      key: 'stockQty',
      label: 'Inventory',
      align: 'right',
      sortable: true,
      render: (row) => (
        <span className="tabular-nums">{row.stockQty} in stock</span>
      ),
    },
    {
      key: 'classification',
      label: 'Class',
      hideOnMobile: true,
      render: (row) => <Badge>{row.classification}</Badge>,
    },
    { key: 'category', label: 'Category', hideOnMobile: true, render: (row) => <span className="text-p-text-subdued">{row.category}</span> },
    {
      key: 'price',
      label: 'Price',
      align: 'right',
      sortable: true,
      render: (row) => <span className="tabular-nums">KES {row.price.toLocaleString()}</span>,
    },
  ];

  return (
    <div className="pb-16">
      <PageHeader
        title="Products"
        secondaryActions={[
          { label: 'Import', onClick: () => fileInputRef.current?.click() },
          { label: 'Export', onClick: handleExport },
        ]}
        primaryAction={{ label: 'Add product', href: '/admin/products/new' }}
      />
      <ProductsSubNav />
      <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleImportChange} />

      <Card>
        <div className="-mx-5 -mt-5 mb-4">
          <Tabs
            tabs={[
              { id: 'all', label: 'All', badge: products?.length },
              { id: 'active', label: 'In stock' },
              { id: 'out', label: 'Out of stock' },
              { id: 'low', label: 'Low stock' },
            ]}
            activeTab={tab}
            onChange={(id) => { setTab(id); setPage(1); }}
          />
        </div>

        <FilterBar
          searchPlaceholder="Search products..."
          searchValue={searchTerm}
          onSearch={(v) => { setSearchTerm(v); setPage(1); }}
          filters={[
            {
              label: 'Class',
              options: ['All classes', 'OTC', 'P', 'POM'],
              value: classFilter,
              onChange: (v) => { setClassFilter(v); setPage(1); },
            },
            {
              label: 'Sort',
              options: ['Newest first', 'Name A-Z', 'Price: low to high', 'Price: high to low', 'Stock: low to high'],
              value: sortBy,
              onChange: (v) => { setSortBy(v); setPage(1); },
            },
          ]}
        />

        {!filtered ? (
          <SkeletonLoader type="text" count={8} />
        ) : (
          <DataTable
            columns={columns}
            rows={pageRows.map((p) => ({ ...p, id: p._id }))}
            selectable
            selectedIds={selected}
            onSelectionChange={setSelected}
            onRowClick={(row) => router.push(`/admin/products/${row._id}/edit`)}
            emptyState={
              <EmptyState
                heading={filtersActive ? 'No products match' : 'No products yet'}
                body={filtersActive ? 'Try a different search term or clear the filters.' : 'Add your first product to start selling.'}
                action={filtersActive ? undefined : { label: 'Add product', onClick: () => router.push('/admin/products/new') }}
              />
            }
          />
        )}

        {filtered && filtered.length > 0 && (
          <Pagination currentPage={page} totalItems={filtered.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
        )}
      </Card>

      <BulkActionBar
        selectedCount={selected.size}
        onDeselect={() => setSelected(new Set())}
        actions={[
          {
            label: 'Set as active',
            onClick: async () => {
              for (const id of selected) await toggleStock({ id: id as Id<'products'>, inStock: true });
              toast(`${selected.size} product(s) marked in stock`);
              setSelected(new Set());
            },
          },
          {
            label: 'Mark out of stock',
            onClick: async () => {
              for (const id of selected) await toggleStock({ id: id as Id<'products'>, inStock: false });
              toast(`${selected.size} product(s) marked out of stock`);
              setSelected(new Set());
            },
          },
          {
            label: 'Delete',
            onClick: async () => {
              const ok = await confirm({
                title: 'Delete products',
                message: `This will permanently delete ${selected.size} product(s). This can't be undone.`,
                confirmLabel: 'Delete',
                destructive: true,
              });
              if (!ok) return;
              for (const id of selected) await deleteProduct({ id: id as Id<'products'> });
              toast(`${selected.size} product(s) deleted`);
              setSelected(new Set());
            },
          },
        ]}
      />
    </div>
  );
}
