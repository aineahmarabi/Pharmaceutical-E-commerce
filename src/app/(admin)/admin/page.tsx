'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useQuery } from 'convex/react';
import { TrendingUp, TrendingDown, Package, Sun, Sunrise, Sunset, Moon } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../../../../convex/_generated/api';
import { Card } from '@/components/admin/ui/Card';
import { DataTable } from '@/components/admin/ui/DataTable';
import { SkeletonLoader } from '@/components/admin/ui/SkeletonLoader';
import { EmptyState } from '@/components/admin/ui/EmptyState';
import { Sparkline } from '@/components/admin/ui/Sparkline';
import { useAdminName } from '@/hooks/useAdminName';

function formatKES(n: number) {
  return `KES ${Math.round(n).toLocaleString()}`;
}

function getGreeting(hour: number) {
  if (hour < 5) return { text: 'Good night', icon: Moon };
  if (hour < 12) return { text: 'Good morning', icon: Sunrise };
  if (hour < 17) return { text: 'Good afternoon', icon: Sun };
  if (hour < 21) return { text: 'Good evening', icon: Sunset };
  return { text: 'Good night', icon: Moon };
}

function GreetingHeader() {
  const { name } = useAdminName();
  const now = new Date();
  const { text, icon: Icon } = getGreeting(now.getHours());

  return (
    <div className="py-5 mb-1">
      <div className="flex items-center gap-2">
        <Icon size={22} className="text-p-primary" />
        <h1 className="text-xl font-semibold text-p-text">{text}, {name}</h1>
      </div>
      <p className="text-sm text-p-text-subdued mt-1">
        {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} · {now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
      </p>
    </div>
  );
}

function KpiCard({ label, value, delta, deltaFormat = 'percent', trend }: { label: string; value: string; delta?: number; deltaFormat?: 'percent' | 'currency'; trend?: number[] }) {
  const hasDelta = delta !== undefined && Number.isFinite(delta);
  const positive = (delta ?? 0) >= 0;
  return (
    <Card padding="compact">
      <p className="text-[12px] text-p-text-subdued mb-0.5">{label}</p>
      <p className="text-lg font-semibold text-p-text">{value}</p>
      {hasDelta && (
        <p className={`text-[12px] mt-0.5 flex items-center gap-1 ${positive ? 'text-p-primary' : 'text-p-critical'}`}>
          {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {deltaFormat === 'percent'
            ? `${Math.abs(delta!).toFixed(1)}%`
            : formatKES(Math.abs(delta!))}
        </p>
      )}
      {trend && <Sparkline data={trend} positive={positive} />}
    </Card>
  );
}

export default function AdminDashboard() {
  const revenueSummary = useQuery(api.analytics.getRevenueSummary);
  const salesTrend = useQuery(api.analytics.getSalesTrend, { days: 7 });
  const topProducts = useQuery(api.analytics.getTopProducts, { by: 'revenue', limit: 5 });
  const recentOrders = useQuery(api.orders.listOrders, { limit: 200 });
  const products = useQuery(api.adminProducts.adminListProducts, { limit: 100 });
  const customers = useQuery(api.customers.listCustomers, {});

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

  const lowStockProducts = products?.filter((p) => p.stockQty < 10).slice(0, 5);

  const chartData = salesTrend?.map((d) => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    sales: d.revenue,
  }));

  return (
    <div className="pb-16">
      <GreetingHeader />

      <div className="space-y-5 max-w-[998px] mx-auto">
        {/* Today's activity — individual KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {!revenueSummary || ordersToday === undefined || !customers ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <SkeletonLoader type="text" count={2} />
              </Card>
            ))
          ) : (
            <>
              <KpiCard label="Orders today" value={String(ordersToday)} />
              <KpiCard label="Revenue today" value={formatKES(revenueSummary.today.revenue)} delta={revenueSummary.today.change} trend={salesTrend?.map((d) => d.revenue)} />
              <KpiCard label="7-day revenue" value={formatKES(revenueSummary.sevenDay.revenue)} delta={revenueSummary.sevenDay.change} trend={salesTrend?.map((d) => d.revenue)} />
              <KpiCard label="Active customers" value={String(customers.length)} />
            </>
          )}
        </div>

        {/* Sales chart */}
        <Card
          title="Total sales"
          headerAction={<Link href="/admin/analytics" className="hover:underline">View report</Link>}
        >
          {!chartData ? (
            <SkeletonLoader type="card" />
          ) : chartData.length === 0 ? (
            <EmptyState heading="No sales yet" body="Sales data will appear here once orders come in." />
          ) : (
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                  <defs>
                    <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0D9488" stopOpacity={0.08} />
                      <stop offset="100%" stopColor="#0D9488" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#E1E3E5" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6D7175' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#6D7175' }} axisLine={false} tickLine={false} tickFormatter={(v) => `KES ${v}`} width={70} />
                  <Tooltip
                    formatter={(value) => [formatKES(Number(value)), 'Sales']}
                    contentStyle={{ borderRadius: 8, border: '1px solid #E1E3E5', fontSize: 13 }}
                  />
                  <Area type="monotone" dataKey="sales" stroke="#0D9488" strokeWidth={2} fill="url(#salesFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <div className="grid md:grid-cols-[2fr_1fr] gap-5 items-start">
          {/* Top products */}
          <Card
            title="Top products"
            headerAction={<Link href="/admin/analytics" className="hover:underline">View report</Link>}
          >
            {!topProducts ? (
              <SkeletonLoader type="text" count={5} />
            ) : (
              <DataTable
                columns={[
                  {
                    key: 'name',
                    label: 'Product',
                    render: (row) => (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-p-bg border border-p-border-subdued flex items-center justify-center flex-shrink-0">
                          <Package size={16} className="text-p-icon-subdued" />
                        </div>
                        <span className="font-medium text-p-focus truncate">{row.name}</span>
                      </div>
                    ),
                  },
                  { key: 'units', label: 'Units sold', align: 'right' },
                  {
                    key: 'revenue',
                    label: 'Net sales',
                    align: 'right',
                    render: (row) => formatKES(row.revenue),
                  },
                ]}
                rows={topProducts.map((p, i) => ({ id: String(i), ...p }))}
                emptyState={<EmptyState heading="No sales data yet" body="Top-selling products will show up here." />}
              />
            )}
          </Card>

          {/* Orders to fulfill */}
          <Card title="Orders">
            {!fulfillmentCounts ? (
              <SkeletonLoader type="text" count={3} />
            ) : (
              <div>
                {[
                  { label: 'To fulfill', value: fulfillmentCounts.toFulfill, tab: 'to-fulfill' },
                  { label: 'Awaiting payment', value: fulfillmentCounts.awaitingPayment, tab: 'awaiting-payment' },
                  { label: 'Packed / delivering', value: fulfillmentCounts.awaitingShipment, tab: 'packed-delivering' },
                ].map((row, i, arr) => (
                  <Link
                    key={row.label}
                    href={`/admin/orders?tab=${row.tab}`}
                    className={`flex items-center justify-between py-3 ${i < arr.length - 1 ? 'border-b border-p-border-subdued' : ''}`}
                  >
                    <span className="text-sm text-p-text">{row.label}</span>
                    <span className="text-sm font-semibold text-p-focus">{row.value}</span>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Low stock alerts */}
        <Card
          title="Low stock alerts"
          headerAction={<Link href="/admin/inventory" className="hover:underline">View inventory</Link>}
        >
          {lowStockProducts === undefined ? (
            <SkeletonLoader type="text" count={3} />
          ) : (
            <DataTable
              columns={[
                { key: 'name', label: 'Product', render: (row) => <span className="font-medium">{row.name}</span> },
                { key: 'brand', label: 'Brand' },
                {
                  key: 'stockQty',
                  label: 'Stock',
                  align: 'right',
                  render: (row) => <span className="font-semibold text-p-critical">{row.stockQty} left</span>,
                },
              ]}
              rows={lowStockProducts.map((p) => ({ id: p._id, ...p }))}
              emptyState={<EmptyState heading="All products are well stocked" />}
            />
          )}
        </Card>
      </div>
    </div>
  );
}
