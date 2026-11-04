'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAdminSession } from '@/hooks/useAdminSession';
import { useAdminQuery } from '@/hooks/useAdminApi';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../../../../convex/_generated/api';
import { Card } from '@/components/admin/ui/Card';
import { Badge } from '@/components/admin/ui/Badge';
import { DataTable } from '@/components/admin/ui/DataTable';
import { SkeletonLoader } from '@/components/admin/ui/SkeletonLoader';
import { EmptyState } from '@/components/admin/ui/EmptyState';
import { Sparkline } from '@/components/admin/ui/Sparkline';
import { useAdminName } from '@/hooks/useAdminName';

function formatKES(n: number) {
  return `KES ${Math.round(n).toLocaleString()}`;
}

function getGreeting(hour: number) {
  if (hour < 5) return 'Good night';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 21) return 'Good evening';
  return 'Good night';
}

function GreetingHeader() {
  const { name } = useAdminName();
  const now = new Date();
  return (
    <div className="py-5 mb-1">
      <h1 className="text-xl font-semibold tracking-tight text-p-text">
        {getGreeting(now.getHours())}, {name}
      </h1>
      <p className="text-sm text-p-text-subdued mt-1">
        {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
      </p>
    </div>
  );
}

function KpiCard({
  label,
  value,
  delta,
  trend,
  href,
}: {
  label: string;
  value: string;
  delta?: number;
  trend?: number[];
  href?: string;
}) {
  const hasDelta = delta !== undefined && Number.isFinite(delta);
  const positive = (delta ?? 0) >= 0;
  const body = (
    <Card padding="compact" className="h-full">
      <p className="text-xs text-p-text-subdued">{label}</p>
      <div className="flex items-baseline gap-2 mt-1">
        <p className="text-xl font-semibold tracking-tight tabular-nums text-p-text">{value}</p>
        {hasDelta && (
          <span className={`text-xs font-medium tabular-nums ${positive ? 'text-p-primary' : 'text-p-critical'}`}>
            {positive ? '+' : '-'}
            {Math.abs(delta!).toFixed(1)}%
          </span>
        )}
      </div>
      {trend && <Sparkline data={trend} positive={positive} />}
    </Card>
  );
  return href ? (
    <Link href={href} className="block">
      {body}
    </Link>
  ) : (
    body
  );
}

function paymentBadge(status: string | undefined) {
  if (status === 'paid' || status === 'collected') return <Badge status="success">Paid</Badge>;
  if (status === 'pending') return <Badge status="warning">Pending</Badge>;
  if (status === 'refunded' || status === 'partially_refunded') return <Badge>Refunded</Badge>;
  return <Badge>{status}</Badge>;
}

function statusBadge(status: string) {
  if (status === 'completed') return <Badge status="success">Fulfilled</Badge>;
  if (status === 'cancelled') return <Badge status="critical">Cancelled</Badge>;
  if (status === 'packed' || status === 'delivering') return <Badge status="info">In progress</Badge>;
  return <Badge status="warning">Unfulfilled</Badge>;
}

export default function AdminDashboard() {
  const router = useRouter();
  const revenueSummary = useAdminQuery(api.analytics.getRevenueSummary, {});
  const salesTrend = useAdminQuery(api.analytics.getSalesTrend, { days: 7 });
  const topProducts = useAdminQuery(api.analytics.getTopProducts, { by: 'revenue', limit: 5 });
  const recentOrders = useAdminQuery(api.orders.listOrders, { limit: 200 });
  const products = useAdminQuery(api.adminProducts.adminListProducts, { limit: 100 });
  const { role } = useAdminSession();
  const customers = useAdminQuery(api.customers.listCustomers, role === 'super_admin' || role === 'admin' ? {} : 'skip');

  const ordersToday = useMemo(() => {
    if (!recentOrders) return undefined;
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return recentOrders.filter((o) => o._creationTime >= start.getTime()).length;
  }, [recentOrders]);

  const fulfillmentCounts = useMemo(() => {
    if (!recentOrders) return undefined;
    return {
      toFulfill: recentOrders.filter((o) => o.status === 'placed' || o.status === 'confirmed').length,
      awaitingPayment: recentOrders.filter((o) => o.paymentStatus === 'pending').length,
      awaitingShipment: recentOrders.filter((o) => o.status === 'packed' || o.status === 'delivering').length,
    };
  }, [recentOrders]);

  const lowStockProducts = products?.filter((p) => p.stockQty <= 5).slice(0, 6);

  const chartData = salesTrend?.map((d) => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    sales: d.revenue,
  }));

  const kpisLoading = !revenueSummary || ordersToday === undefined || !customers;
  const trend = salesTrend?.map((d) => d.revenue);

  return (
    <div className="pb-16">
      <GreetingHeader />

      <div className="space-y-4 max-w-6xl mx-auto">
        {/* KPI row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpisLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} padding="compact">
                <SkeletonLoader type="text" count={2} />
              </Card>
            ))
          ) : (
            <>
              <KpiCard label="Revenue today" value={formatKES(revenueSummary.today.revenue)} delta={revenueSummary.today.change} trend={trend} />
              <KpiCard label="Revenue, 7 days" value={formatKES(revenueSummary.sevenDay.revenue)} delta={revenueSummary.sevenDay.change} trend={trend} />
              <KpiCard label="Orders today" value={String(ordersToday)} href="/admin/orders" />
              <KpiCard label="Customers" value={String(customers.length)} href="/admin/customers" />
            </>
          )}
        </div>

        <div className="grid lg:grid-cols-[2fr_1fr] gap-4 items-start">
          {/* Sales chart */}
          <Card title="Sales, last 7 days" headerAction={<Link href="/admin/analytics" className="hover:underline">View report</Link>}>
            {!chartData ? (
              <SkeletonLoader type="card" />
            ) : chartData.length === 0 ? (
              <EmptyState heading="No sales yet" body="Sales data will appear here once orders come in." />
            ) : (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                    <CartesianGrid stroke="var(--color-p-border-subdued)" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'var(--color-p-text-subdued)' }} axisLine={false} tickLine={false} />
                    <YAxis
                      tick={{ fontSize: 12, fill: 'var(--color-p-text-subdued)' }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : String(v))}
                      width={44}
                    />
                    <Tooltip
                      formatter={(value) => [formatKES(Number(value)), 'Sales']}
                      contentStyle={{ borderRadius: 8, border: '1px solid var(--color-p-border-subdued)', fontSize: 13 }}
                    />
                    <Area type="monotone" dataKey="sales" stroke="var(--color-p-primary)" strokeWidth={2} fill="var(--color-p-primary)" fillOpacity={0.06} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          {/* Order queue */}
          <Card title="Order queue">
            {!fulfillmentCounts ? (
              <SkeletonLoader type="text" count={3} />
            ) : (
              <div className="-my-1">
                {[
                  { label: 'To fulfill', value: fulfillmentCounts.toFulfill, tab: 'to-fulfill' },
                  { label: 'Awaiting payment', value: fulfillmentCounts.awaitingPayment, tab: 'awaiting-payment' },
                  { label: 'Packed or delivering', value: fulfillmentCounts.awaitingShipment, tab: 'packed-delivering' },
                ].map((row, i, arr) => (
                  <Link
                    key={row.label}
                    href={`/admin/orders?tab=${row.tab}`}
                    className={`flex items-center justify-between py-3 hover:bg-p-bg-surface-hover rounded ${i < arr.length - 1 ? 'border-b border-p-border-subdued' : ''}`}
                  >
                    <span className="text-sm text-p-text">{row.label}</span>
                    <span className="text-sm font-semibold tabular-nums text-p-text">{row.value}</span>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Recent orders */}
        <Card title="Recent orders" headerAction={<Link href="/admin/orders" className="hover:underline">View all</Link>}>
          {!recentOrders ? (
            <SkeletonLoader type="text" count={5} />
          ) : (
            <DataTable
              columns={[
                { key: 'orderNumber', label: 'Order', render: (r) => <span className="font-medium text-p-text">{r.orderNumber}</span> },
                {
                  key: '_creationTime',
                  label: 'Date',
                  hideOnMobile: true,
                  render: (r) => new Date(r._creationTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                },
                { key: 'customerName', label: 'Customer' },
                { key: 'total', label: 'Total', align: 'right', render: (r) => <span className="tabular-nums">{formatKES(r.total)}</span> },
                { key: 'paymentStatus', label: 'Payment', render: (r) => paymentBadge(r.paymentStatus) },
                { key: 'status', label: 'Fulfillment', render: (r) => statusBadge(r.status) },
              ]}
              rows={recentOrders.slice(0, 8).map((o) => ({ ...o, id: o._id }))}
              onRowClick={(r) => router.push(`/admin/orders/${r._id}`)}
              emptyState={<EmptyState heading="No orders yet" body="New orders will show up here." />}
            />
          )}
        </Card>

        <div className="grid lg:grid-cols-2 gap-4 items-start">
          <Card title="Top products" headerAction={<Link href="/admin/analytics" className="hover:underline">View report</Link>}>
            {!topProducts ? (
              <SkeletonLoader type="text" count={5} />
            ) : (
              <DataTable
                columns={[
                  { key: 'name', label: 'Product', render: (row) => <span className="font-medium text-p-text">{row.name}</span> },
                  { key: 'units', label: 'Units', align: 'right' },
                  { key: 'revenue', label: 'Net sales', align: 'right', render: (row) => <span className="tabular-nums">{formatKES(row.revenue)}</span> },
                ]}
                rows={topProducts.map((p, i) => ({ id: String(i), ...p }))}
                emptyState={<EmptyState heading="No sales data yet" body="Top-selling products will show up here." />}
              />
            )}
          </Card>

          <Card title="Low stock" headerAction={<Link href="/admin/inventory" className="hover:underline">View inventory</Link>}>
            {lowStockProducts === undefined ? (
              <SkeletonLoader type="text" count={3} />
            ) : (
              <DataTable
                columns={[
                  { key: 'name', label: 'Product', render: (row) => <span className="font-medium text-p-text">{row.name}</span> },
                  { key: 'brand', label: 'Brand', hideOnMobile: true },
                  {
                    key: 'stockQty',
                    label: 'Stock',
                    align: 'right',
                    render: (row) => (
                      <Badge status={row.stockQty === 0 ? 'critical' : 'warning'}>
                        {row.stockQty === 0 ? 'Out of stock' : `${row.stockQty} left`}
                      </Badge>
                    ),
                  },
                ]}
                rows={lowStockProducts.map((p) => ({ id: p._id, ...p }))}
                emptyState={<EmptyState heading="All products are well stocked" />}
              />
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
