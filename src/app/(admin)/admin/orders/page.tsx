'use client';

import React, { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from 'convex/react';
import { ShoppingCart } from 'lucide-react';
import { api } from '../../../../../convex/_generated/api';
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
import { useMutation } from 'convex/react';

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'to-fulfill', label: 'To fulfill' },
  { id: 'awaiting-payment', label: 'Awaiting payment' },
  { id: 'packed-delivering', label: 'Packed & delivering' },
  { id: 'completed', label: 'Completed' },
];

function matchesTab(order: any, tab: string): boolean {
  if (tab === 'all') return true;
  if (tab === 'to-fulfill') return order.status === 'placed' || order.status === 'confirmed';
  if (tab === 'awaiting-payment') return order.paymentStatus === 'pending';
  if (tab === 'packed-delivering') return order.status === 'packed' || order.status === 'delivering';
  if (tab === 'completed') return order.status === 'completed';
  return true;
}

function paymentBadge(status: string) {
  if (status === 'paid' || status === 'collected') return <Badge status="success" dot>Paid</Badge>;
  if (status === 'pending') return <Badge status="warning" dot>Pending</Badge>;
  if (status === 'refunded' || status === 'partially_refunded') return <Badge status="default" dot>Refunded</Badge>;
  return <Badge status="default">{status}</Badge>;
}

function fulfillmentBadge(status: string) {
  if (status === 'completed') return <Badge status="success" dot>Fulfilled</Badge>;
  if (status === 'cancelled') return <Badge status="critical">Cancelled</Badge>;
  if (status === 'packed' || status === 'delivering') return <Badge status="info" dot>Partially fulfilled</Badge>;
  return <Badge status="warning" dot>Unfulfilled</Badge>;
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useAdminToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [tab, setTab] = useState(() => searchParams.get('tab') ?? 'all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bulkFulfill = useMutation(api.orders.bulkFulfill);

  const allOrders = useQuery(api.orders.listOrders, {
    limit: 200,
    search: searchTerm || undefined,
  });

  const orders = useMemo(() => allOrders?.filter((o) => matchesTab(o, tab)), [allOrders, tab]);

  const handleExport = () => {
    if (!orders || orders.length === 0) return;
    const headers = ['OrderNumber', 'CustomerName', 'CustomerEmail', 'Status', 'PaymentStatus', 'Total'];
    const csvContent = [
      headers.join(','),
      ...orders.map((o) => `"${o.orderNumber}","${o.customerName}","${o.customerEmail}","${o.status}","${o.paymentStatus}",${o.total}`),
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

  const columns: DataTableColumn<any>[] = [
    {
      key: 'orderNumber',
      label: 'Order',
      render: (row) => (
        <Link href={`/admin/orders/${row._id}`} className="font-medium text-p-focus">
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
        <Link href={`/admin/customers/${encodeURIComponent(row.customerEmail || row.customerPhone)}`} className="text-p-focus">
          {row.customerName}
        </Link>
      ),
    },
    { key: 'channel', label: 'Channel', hideOnMobile: true, render: (row) => row.channel ?? 'Online Store' },
    { key: 'total', label: 'Total', align: 'right', render: (row) => `KES ${row.total.toLocaleString()}` },
    { key: 'paymentStatus', label: 'Payment', render: (row) => paymentBadge(row.paymentStatus) },
    { key: 'status', label: 'Fulfillment', render: (row) => fulfillmentBadge(row.status) },
    { key: 'items', label: 'Items', align: 'right', hideOnMobile: true, render: (row) => row.items.length },
  ];

  return (
    <div className="pb-16">
      <PageHeader
        title="Orders"
        secondaryActions={[{ label: 'Export', onClick: handleExport }]}
        primaryAction={{ label: 'Create order', href: '/admin/orders/new' }}
      />

      <Card>
        <div className="-mx-5 -mt-5 mb-4">
          <Tabs tabs={TABS} activeTab={tab} onChange={setTab} />
        </div>

        <FilterBar
          searchPlaceholder="Filter orders..."
          searchValue={searchTerm}
          onSearch={setSearchTerm}
        />

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
                icon={ShoppingCart}
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
            label: 'Fulfill orders',
            onClick: async () => {
              await bulkFulfill({ orderIds: Array.from(selected) as any });
              toast(`${selected.size} order(s) fulfilled`);
              setSelected(new Set());
            },
          },
        ]}
      />
    </div>
  );
}
