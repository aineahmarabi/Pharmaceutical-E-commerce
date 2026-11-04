'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAdminQuery, useAdminMutation } from '@/hooks/useAdminApi';
import { api } from '../../../../../convex/_generated/api';
import type { Id } from '../../../../../convex/_generated/dataModel';
import { PageHeader } from '@/components/admin/shared/PageHeader';
import { Card } from '@/components/admin/ui/Card';
import { Tabs } from '@/components/admin/ui/Tabs';
import { FilterBar } from '@/components/admin/shared/FilterBar';
import { DataTable, type DataTableColumn } from '@/components/admin/ui/DataTable';
import { Badge } from '@/components/admin/ui/Badge';
import { BulkActionBar } from '@/components/admin/ui/BulkActionBar';
import { EmptyState } from '@/components/admin/ui/EmptyState';
import { SkeletonLoader } from '@/components/admin/ui/SkeletonLoader';
import { useAdminToast } from '@/components/admin/ui/Toast';
import { Select } from '@/components/admin/ui/Select';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'total-desc', label: 'Total: high to low' },
  { value: 'total-asc', label: 'Total: low to high' },
];

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'to-fulfill', label: 'To fulfill' },
  { id: 'awaiting-payment', label: 'Awaiting payment' },
  { id: 'packed-delivering', label: 'Packed & delivering' },
  { id: 'completed', label: 'Completed' },
];

function matchesTab(order: { status: string; paymentStatus?: string }, tab: string): boolean {
  if (tab === 'all') return true;
  if (tab === 'to-fulfill') return order.status === 'placed' || order.status === 'confirmed';
  if (tab === 'awaiting-payment') return order.paymentStatus === 'pending';
  if (tab === 'packed-delivering') return order.status === 'packed' || order.status === 'delivering';
  if (tab === 'completed') return order.status === 'completed';
  return true;
}

function paymentBadge(status: string | undefined) {
  if (status === 'paid' || status === 'collected') return <Badge status="success">Paid</Badge>;
  if (status === 'pending') return <Badge status="warning">Pending</Badge>;
  if (status === 'refunded' || status === 'partially_refunded') return <Badge status="default">Refunded</Badge>;
  return <Badge status="default">{status}</Badge>;
}

function fulfillmentBadge(status: string) {
  if (status === 'completed') return <Badge status="success">Fulfilled</Badge>;
  if (status === 'cancelled') return <Badge status="critical">Cancelled</Badge>;
  if (status === 'packed' || status === 'delivering') return <Badge status="info">In progress</Badge>;
  return <Badge status="warning">Unfulfilled</Badge>;
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useAdminToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [tab, setTab] = useState(() => searchParams.get('tab') ?? 'all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState('newest');
  const bulkFulfill = useAdminMutation(api.orders.bulkFulfill);

  const allOrders = useAdminQuery(api.orders.listOrders, {
    limit: 200,
    search: searchTerm || undefined,
  });

  const orders = useMemo(() => {
    const list = allOrders?.filter((o) => matchesTab(o, tab));
    if (!list) return list;
    const sorted = [...list];
    if (sort === 'oldest') sorted.sort((a, b) => a._creationTime - b._creationTime);
    else if (sort === 'total-desc') sorted.sort((a, b) => b.total - a.total);
    else if (sort === 'total-asc') sorted.sort((a, b) => a.total - b.total);
    else sorted.sort((a, b) => b._creationTime - a._creationTime);
    return sorted;
  }, [allOrders, tab, sort]);

  const tabs = useMemo(
    () => TABS.map((t) => ({ ...t, badge: allOrders ? allOrders.filter((o) => matchesTab(o, t.id)).length : undefined })),
    [allOrders]
  );

  const exportRows = (list: typeof orders) => {
    if (!list || list.length === 0) return;
    const headers = ['OrderNumber', 'CustomerName', 'CustomerEmail', 'Status', 'PaymentStatus', 'Total'];
    const csvContent = [
      headers.join(','),
      ...list.map((o) => `"${o.orderNumber}","${o.customerName}","${o.customerEmail}","${o.status}","${o.paymentStatus}",${o.total}`),
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast('Orders exported');
  };

  const handleExport = () => exportRows(orders);

  const columns: DataTableColumn<NonNullable<typeof allOrders>[number] & { id: string }>[] = [
    {
      key: 'orderNumber',
      label: 'Order',
      render: (row) => (
        <Link href={`/admin/orders/${row._id}`} className="font-medium text-p-text hover:underline">
          {row.orderNumber}
        </Link>
      ),
    },
    {
      key: '_creationTime',
      label: 'Date',
      hideOnMobile: true,
      render: (row) => new Date(row._creationTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    },
    {
      key: 'customerName',
      label: 'Customer',
      render: (row) => (
        <Link href={`/admin/customers/${encodeURIComponent(row.customerEmail || row.customerPhone)}`} className="text-p-text hover:underline">
          {row.customerName}
        </Link>
      ),
    },
    { key: 'channel', label: 'Channel', hideOnMobile: true, render: (row) => row.channel ?? 'Online Store' },
    { key: 'total', label: 'Total', align: 'right', render: (row) => <span className="tabular-nums">KES {row.total.toLocaleString()}</span> },
    { key: 'paymentStatus', label: 'Payment', render: (row) => paymentBadge(row.paymentStatus) },
    { key: 'status', label: 'Fulfillment', render: (row) => fulfillmentBadge(row.status) },
    { key: 'items', label: 'Items', align: 'right', hideOnMobile: true, render: (row) => row.items.length },
  ];

  return (
    <div className="pb-24 max-w-6xl mx-auto">
      <PageHeader
        title="Orders"
        secondaryActions={[{ label: 'Export', onClick: handleExport }]}
        primaryAction={{ label: 'Create order', href: '/admin/orders/new' }}
      />

      <Card>
        <div className="-mx-5 -mt-5 mb-4">
          <Tabs tabs={tabs} activeTab={tab} onChange={setTab} />
        </div>

        <div className="flex flex-wrap items-start gap-2 mb-4">
          <div className="flex-1 min-w-[220px]">
            <FilterBar
              searchPlaceholder="Search by order number or customer"
              searchValue={searchTerm}
              onSearch={setSearchTerm}
            />
          </div>
          <Select value={sort} onChange={setSort} options={SORT_OPTIONS} className="w-48" />
        </div>

        {!orders ? (
          <SkeletonLoader type="text" count={8} />
        ) : (
          <DataTable
            columns={columns}
            rows={orders.map((o) => ({ ...o, id: o._id }))}
            selectable
            selectedIds={selected}
            onSelectionChange={setSelected}
            onRowClick={(row) => router.push(`/admin/orders/${row._id}`)}
            emptyState={
              <EmptyState
                heading={searchTerm || tab !== 'all' ? 'No orders found' : 'Your orders will show here'}
                body={searchTerm || tab !== 'all' ? 'Try changing the filters or search term.' : 'Orders will appear here once customers start checking out.'}
                action={searchTerm || tab !== 'all' ? undefined : { label: 'Create order', onClick: () => router.push('/admin/orders/new') }}
              />
            }
          />
        )}
      </Card>

      <BulkActionBar
        selectedCount={selected.size}
        onDeselect={() => setSelected(new Set())}
        actions={[
          {
            label: 'Export selected',
            onClick: () => exportRows(orders?.filter((o) => selected.has(o._id))),
          },
          {
            label: 'Fulfill orders',
            onClick: async () => {
              await bulkFulfill({ orderIds: Array.from(selected) as Id<"orders">[] });
              toast(`${selected.size} order(s) fulfilled`);
              setSelected(new Set());
            },
          },
        ]}
      />
    </div>
  );
}
