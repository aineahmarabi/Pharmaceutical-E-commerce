'use client';

import React, { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from 'convex/react';
import { Package, Upload, Download, Plus } from 'lucide-react';
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
  imageUrl?: string;
};

export default function AdminProductsPage() {
  const router = useRouter();
  const { toast } = useAdminToast();
  const confirm = useConfirm();
  const [searchTerm, setSearchTerm] = useState('');
  const [tab, setTab] = useState('all');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleStock = useMutation(api.adminProducts.adminToggleStock);
  const deleteProduct = useMutation(api.adminProducts.adminDeleteProduct);

  const products = useQuery(api.adminProducts.adminListProducts, {
    limit: 500,
    search: searchTerm || undefined,
  }) as Product[] | undefined;

  const filtered = useMemo(() => {
    if (!products) return undefined;
    if (tab === 'active') return products.filter((p) => p.inStock);
    if (tab === 'out') return products.filter((p) => !p.inStock);
    if (tab === 'low') return products.filter((p) => p.inStock && p.stockQty < 10);
    return products;
  }, [products, tab]);

  const pageRows = filtered?.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) ?? [];

  const handleExport = () => {
    if (!products || products.length === 0) return;
    const headers = ['ID', 'Name', 'Brand', 'Category', 'Price', 'Stock', 'Classification'];
    const csvContent = [
      headers.join(','),
      ...products.map((p) => `"${p._id}","${p.name}","${p.brand}","${p.category}",${p.price},${p.stockQty},"${p.classification}"`),
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
        <Link href={`/admin/products/${row._id}/edit`} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-p-bg border border-p-border-subdued flex-shrink-0 overflow-hidden flex items-center justify-center">
            {row.imageUrl ? (
              <img src={row.imageUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <Package size={18} className="text-p-icon-subdued" />
            )}
          </div>
          <span className="font-medium text-p-focus line-clamp-1">{row.name}</span>
        </Link>
      ),
    },
    {
      key: 'inStock',
      label: 'Status',
      render: (row) => (
        <Badge status={row.inStock ? 'success' : 'default'}>{row.inStock ? 'Active' : 'Out of stock'}</Badge>
      ),
    },
    {
      key: 'stockQty',
      label: 'Inventory',
      align: 'right',
      sortable: true,
      render: (row) => (
        <span className={row.stockQty === 0 ? 'text-p-critical font-medium' : ''}>{row.stockQty}</span>
      ),
    },
    { key: 'category', label: 'Type', hideOnMobile: true, render: (row) => <span className="text-p-text-subdued">{row.category}</span> },
    { key: 'brand', label: 'Vendor', hideOnMobile: true },
    {
      key: 'price',
      label: 'Price',
      align: 'right',
      sortable: true,
      render: (row) => `KES ${row.price.toLocaleString()}`,
    },
  ];

  return (
    <div className="pb-16">
      <PageHeader
        title="Products"
        secondaryActions={[
          { label: 'Import', icon: Upload, onClick: () => fileInputRef.current?.click() },
          { label: 'Export', icon: Download, onClick: handleExport },
        ]}
        primaryAction={{ label: 'Add product', icon: Plus, href: '/admin/products/new' }}
      />
      <ProductsSubNav />
      <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleImportChange} />

      <Card>
        <div className="-mx-5 -mt-5 mb-4">
          <Tabs
            tabs={[
              { id: 'all', label: 'All', badge: products?.length },
              { id: 'active', label: 'Active' },
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
                icon={Package}
                heading={searchTerm || tab !== 'all' ? 'No products found' : 'Add your products'}
                body={searchTerm || tab !== 'all' ? 'Try changing the filters or search term.' : 'Start by stocking your store with products your customers will love.'}
                action={searchTerm || tab !== 'all' ? undefined : { label: 'Add product', onClick: () => router.push('/admin/products/new') }}
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
              toast(`${selected.size} product(s) set as active`);
              setSelected(new Set());
            },
          },
          {
            label: 'Set as out of stock',
            onClick: async () => {
              for (const id of selected) await toggleStock({ id: id as Id<'products'>, inStock: false });
              toast(`${selected.size} product(s) set as out of stock`);
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
