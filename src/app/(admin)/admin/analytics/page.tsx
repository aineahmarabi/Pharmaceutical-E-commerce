'use client';

import React, { useMemo, useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Users, RotateCcw, CheckCircle2, ShoppingCart, DollarSign, Percent } from 'lucide-react';
import { PageHeader } from '@/components/admin/shared/PageHeader';
import { Card } from '@/components/admin/ui/Card';
import { Badge } from '@/components/admin/ui/Badge';
import { Tabs } from '@/components/admin/ui/Tabs';
import { SkeletonLoader } from '@/components/admin/ui/SkeletonLoader';
import { DataTable } from '@/components/admin/ui/DataTable';
import { ExportButton } from '@/components/admin/ui/ExportButton';
import { cn } from '@/lib/utils';

const PIE_COLORS = ['#0D9488', '#0F766E', '#FDE68A'];
const STATUS_COLORS: Record<string, string> = {
  placed: '#FDE68A',
  confirmed: '#BAE6FD',
  packed: '#0F766E',
  delivering: '#0D9488',
  completed: '#166534',
  cancelled: '#EF4444',
};
const CLASS_COLORS: Record<string, string> = { OTC: '#0D9488', P: '#0F766E', POM: '#EF4444' };
const RANGE_OPTIONS = [7, 30, 90] as const;

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'sales', label: 'Sales' },
  { id: 'orders', label: 'Orders' },
  { id: 'customers', label: 'Customers' },
  { id: 'products', label: 'Products' },
  { id: 'discounts', label: 'Discounts' },
];

function formatKES(val: number) {
  return `KES ${val.toLocaleString()}`;
}

function StatTile({ icon: Icon, label, value, delta }: { icon: React.ElementType; label: string; value: string; delta?: number }) {
  const hasDelta = delta !== undefined && Number.isFinite(delta);
  const positive = (delta ?? 0) >= 0;
  return (
    <Card padding="compact">
      <div className="flex items-center gap-2 mb-1">
        <Icon size={14} className="text-p-icon-subdued" />
        <p className="text-[12px] text-p-text-subdued">{label}</p>
      </div>
      <p className="text-lg font-semibold text-p-text">{value}</p>
      {hasDelta && (
        <p className={`text-[12px] mt-0.5 flex items-center gap-1 ${positive ? 'text-p-primary' : 'text-p-critical'}`}>
          {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {Math.abs(delta!).toFixed(1)}%
        </p>
      )}
    </Card>
  );
}

export default function AdminAnalyticsPage() {
  const [tab, setTab] = useState('overview');
  const [rangeDays, setRangeDays] = useState<(typeof RANGE_OPTIONS)[number]>(30);

  const revSummary = useQuery(api.analytics.getRevenueSummary);
  const salesTrend = useQuery(api.analytics.getSalesTrend, { days: rangeDays });
  const topProductsByRevenue = useQuery(api.analytics.getTopProducts, { by: 'revenue', limit: 5 });
  const topProductsByVolume = useQuery(api.analytics.getTopProducts, { by: 'volume', limit: 5 });
  const paymentBreakdown = useQuery(api.analytics.getPaymentMethodBreakdown);
  const allOrders = useQuery(api.orders.listOrders, { limit: 500 });
  const products = useQuery(api.adminProducts.adminListProducts, { limit: 500 });
  const customers = useQuery(api.customers.listCustomers, {});
  const discounts = useQuery(api.discounts.listDiscounts);

  const loading =
    revSummary === undefined || salesTrend === undefined || topProductsByRevenue === undefined ||
    paymentBreakdown === undefined || allOrders === undefined || products === undefined || customers === undefined;

  const rangeRevenue = useMemo(() => (salesTrend ? salesTrend.reduce((s, d) => s + d.revenue, 0) : 0), [salesTrend]);

  const pieData = paymentBreakdown
    ? [
        { name: 'M-PESA', value: paymentBreakdown.revenues.mpesa },
        { name: 'Card', value: paymentBreakdown.revenues.card },
        { name: 'COD', value: paymentBreakdown.revenues.cod },
      ].filter((d) => d.value > 0)
    : [];

  const statusBreakdown = useMemo(() => {
    if (!allOrders) return [];
    const counts: Record<string, number> = {};
    allOrders.forEach((o) => { counts[o.status] = (counts[o.status] ?? 0) + 1; });
    return Object.entries(counts).map(([status, count]) => ({ status, count }));
  }, [allOrders]);

  const fulfillmentRate = useMemo(() => {
    if (!allOrders || allOrders.length === 0) return null;
    const relevant = allOrders.filter((o) => o.status !== 'cancelled');
    if (relevant.length === 0) return null;
    return (relevant.filter((o) => o.status === 'completed').length / relevant.length) * 100;
  }, [allOrders]);

  const ordersToday = useMemo(() => {
    if (!allOrders) return null;
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return allOrders.filter((o) => o._creationTime >= start.getTime()).length;
  }, [allOrders]);

  const classificationRevenue = useMemo(() => {
    if (!allOrders || !products) return [];
    const classMap = new Map(products.map((p) => [p._id, p.classification]));
    const totals: Record<string, number> = { OTC: 0, P: 0, POM: 0 };
    allOrders.forEach((o) => {
      if (o.status === 'cancelled') return;
      o.items.forEach((item: any) => {
        const cls = classMap.get(item.productId) ?? 'OTC';
        totals[cls] = (totals[cls] ?? 0) + item.price * item.qty;
      });
    });
    return Object.entries(totals).map(([classification, revenue]) => ({ classification, revenue })).filter((d) => d.revenue > 0);
  }, [allOrders, products]);

  const customerStats = useMemo(() => {
    if (!customers) return null;
    const repeat = customers.filter((c) => c.totalOrders > 1).length;
    return { total: customers.length, repeat, rate: customers.length > 0 ? (repeat / customers.length) * 100 : 0 };
  }, [customers]);

  const topSpenders = useMemo(() => {
    if (!customers) return [];
    return [...customers].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5);
  }, [customers]);

  const activeDiscountRate = useMemo(() => {
    if (!discounts || discounts.length === 0) return null;
    return (discounts.filter((d) => d.active).length / discounts.length) * 100;
  }, [discounts]);

  const totalRedemptions = useMemo(() => discounts?.reduce((s, d) => s + d.usedCount, 0) ?? 0, [discounts]);

  if (loading) {
    return (
      <div className="pb-16">
        <PageHeader title="Analytics" />
        <div className="space-y-5 max-w-[998px] mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonLoader key={i} type="card" />)}
          </div>
          <SkeletonLoader type="card" />
        </div>
      </div>
    );
  }

  return (
    <div className="pb-16">
      <PageHeader title="Analytics" subtitle="Store performance across sales, orders, products and customers" />

      <div className="max-w-[998px] mx-auto">
        <div className="-mt-2 mb-5">
          <Tabs tabs={TABS} activeTab={tab} onChange={setTab} />
        </div>

        {tab === 'overview' && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatTile icon={DollarSign} label="Revenue today" value={formatKES(revSummary!.today.revenue)} delta={revSummary!.today.change} />
              <StatTile icon={ShoppingCart} label="Orders today" value={String(ordersToday ?? 0)} />
              <StatTile icon={CheckCircle2} label="Fulfillment rate" value={fulfillmentRate === null ? '—' : `${fulfillmentRate.toFixed(1)}%`} />
              <StatTile icon={Users} label="Repeat customer rate" value={`${customerStats?.rate.toFixed(1)}%`} />
            </div>

            <Card title="30-day revenue trend" headerAction={<ExportButton filename="revenue-trend.csv" rows={(salesTrend ?? []).map((d) => ({ date: d.date, revenue: d.revenue }))} />}>
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesTrend}>
                    <defs>
                      <linearGradient id="colorOverview" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0D9488" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#0D9488" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E1E3E5" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6D7175' }} tickFormatter={(v) => new Date(v).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6D7175' }} tickFormatter={(v) => `${v / 1000}k`} width={50} />
                    <RechartsTooltip contentStyle={{ borderRadius: 8, border: '1px solid #E1E3E5' }} formatter={(v: any) => [formatKES(Number(v)), 'Revenue']} />
                    <Area type="monotone" dataKey="revenue" stroke="#0D9488" strokeWidth={2} fill="url(#colorOverview)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <div className="grid sm:grid-cols-2 gap-4">
              <Card title="Top product">
                {topProductsByRevenue && topProductsByRevenue[0] ? (
                  <div>
                    <p className="text-base font-semibold text-p-text">{topProductsByRevenue[0].name}</p>
                    <p className="text-sm text-p-text-subdued mt-0.5">{formatKES(topProductsByRevenue[0].revenue)} in revenue</p>
                  </div>
                ) : (
                  <p className="text-sm text-p-text-subdued">No sales yet.</p>
                )}
              </Card>
              <Card title="Top customer">
                {topSpenders[0] ? (
                  <div>
                    <p className="text-base font-semibold text-p-text">{topSpenders[0].name}</p>
                    <p className="text-sm text-p-text-subdued mt-0.5">{formatKES(topSpenders[0].totalSpent)} lifetime spend</p>
                  </div>
                ) : (
                  <p className="text-sm text-p-text-subdued">No customers yet.</p>
                )}
              </Card>
            </div>
          </div>
        )}

        {tab === 'sales' && (
          <div className="space-y-5">
            <Card
              title="Revenue trend"
              headerAction={
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    {RANGE_OPTIONS.map((d) => (
                      <button
                        key={d}
                        onClick={() => setRangeDays(d)}
                        className={cn('px-2.5 py-1 rounded text-xs font-medium transition-colors', rangeDays === d ? 'bg-p-primary text-white' : 'text-p-text-subdued hover:bg-p-bg')}
                      >
                        {d}d
                      </button>
                    ))}
                  </div>
                  <ExportButton filename={`revenue-trend-${rangeDays}d.csv`} rows={(salesTrend ?? []).map((d) => ({ date: d.date, revenue: d.revenue }))} />
                </div>
              }
            >
              <p className="text-sm text-p-text-subdued -mt-2 mb-3">
                Total for the last {rangeDays} days: <span className="font-semibold text-p-text">{formatKES(rangeRevenue)}</span>
              </p>
              <div style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesTrend}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0D9488" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#0D9488" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E1E3E5" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6D7175' }} tickFormatter={(v) => new Date(v).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6D7175' }} tickFormatter={(v) => `${v / 1000}k`} width={50} />
                    <RechartsTooltip contentStyle={{ borderRadius: 8, border: '1px solid #E1E3E5' }} formatter={(v: any) => [formatKES(Number(v)), 'Revenue']} labelFormatter={(l) => new Date(l).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })} />
                    <Area type="monotone" dataKey="revenue" stroke="#0D9488" strokeWidth={2} fill="url(#colorSales)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <div className="grid lg:grid-cols-2 gap-5 items-start">
              <Card title="Revenue by payment method" headerAction={<ExportButton filename="revenue-by-payment-method.csv" rows={pieData.map((d) => ({ method: d.name, revenue: d.value }))} />}>
                <div style={{ height: 220 }}>
                  {pieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                          {pieData.map((entry, index) => <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                        </Pie>
                        <RechartsTooltip formatter={(v: any) => formatKES(Number(v))} />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-sm text-p-text-subdued">No payment data yet</div>
                  )}
                </div>
              </Card>

              <Card title="Revenue by classification" headerAction={<ExportButton filename="revenue-by-classification.csv" rows={classificationRevenue} />}>
                <div style={{ height: 220 }}>
                  {classificationRevenue.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={classificationRevenue} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="revenue" nameKey="classification">
                          {classificationRevenue.map((d) => <Cell key={d.classification} fill={CLASS_COLORS[d.classification] ?? '#0D9488'} />)}
                        </Pie>
                        <RechartsTooltip formatter={(v: any) => formatKES(Number(v))} />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-sm text-p-text-subdued">No sales data yet</div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}

        {tab === 'orders' && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <StatTile icon={ShoppingCart} label="Orders today" value={String(ordersToday ?? 0)} />
              <StatTile icon={CheckCircle2} label="Fulfillment rate" value={fulfillmentRate === null ? '—' : `${fulfillmentRate.toFixed(1)}%`} />
              <StatTile icon={ShoppingCart} label="Total orders" value={String(allOrders?.length ?? 0)} />
            </div>
            <Card title="Orders by status" headerAction={<ExportButton filename="orders-by-status.csv" rows={statusBreakdown} />}>
              <div style={{ height: 260 }}>
                {statusBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statusBreakdown} margin={{ left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E1E3E5" />
                      <XAxis dataKey="status" tick={{ fontSize: 11, fill: '#6D7175' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: '#6D7175' }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <RechartsTooltip contentStyle={{ borderRadius: 8, border: '1px solid #E1E3E5' }} />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {statusBreakdown.map((d) => <Cell key={d.status} fill={STATUS_COLORS[d.status] ?? '#0D9488'} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-p-text-subdued">No orders yet</div>
                )}
              </div>
            </Card>
          </div>
        )}

        {tab === 'customers' && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <StatTile icon={Users} label="Total customers" value={String(customerStats?.total ?? 0)} />
              <StatTile icon={RotateCcw} label="Repeat customer rate" value={`${customerStats?.rate.toFixed(1)}%`} />
            </div>
            <Card
              title="Top customers by lifetime spend"
              headerAction={<ExportButton filename="top-customers.csv" rows={topSpenders.map((c) => ({ name: c.name || 'Unknown', email: c.email ?? '', phone: c.phone ?? '', orders: c.totalOrders, totalSpent: c.totalSpent }))} />}
            >
              <DataTable
                columns={[
                  { key: 'name', label: 'Customer', render: (r: any) => r.name || 'Unknown' },
                  { key: 'totalOrders', label: 'Orders', align: 'right' },
                  { key: 'totalSpent', label: 'Total spent', align: 'right', render: (r: any) => formatKES(r.totalSpent) },
                ]}
                rows={topSpenders.map((c) => ({ id: c.id, ...c }))}
                emptyState={<p className="text-sm text-p-text-subdued py-6 text-center">No customers yet.</p>}
              />
            </Card>
          </div>
        )}

        {tab === 'products' && (
          <div className="grid lg:grid-cols-2 gap-5 items-start">
            <Card
              title="Top products (by revenue)"
              headerAction={<ExportButton filename="top-products-by-revenue.csv" rows={(topProductsByRevenue ?? []).map((p) => ({ product: p.name, revenue: p.revenue }))} />}
            >
              <DataTable
                columns={[
                  { key: 'name', label: 'Product' },
                  { key: 'revenue', label: 'Revenue', align: 'right', render: (r: any) => formatKES(r.revenue) },
                ]}
                rows={(topProductsByRevenue ?? []).map((p, i) => ({ id: String(i), ...p }))}
                emptyState={<p className="text-sm text-p-text-subdued py-6 text-center">No sales data yet.</p>}
              />
            </Card>
            <Card
              title="Top products (by units sold)"
              headerAction={<ExportButton filename="top-products-by-units.csv" rows={(topProductsByVolume ?? []).map((p) => ({ product: p.name, units: p.units }))} />}
            >
              <DataTable
                columns={[
                  { key: 'name', label: 'Product' },
                  { key: 'units', label: 'Units', align: 'right' },
                ]}
                rows={(topProductsByVolume ?? []).map((p, i) => ({ id: String(i), ...p }))}
                emptyState={<p className="text-sm text-p-text-subdued py-6 text-center">No sales data yet.</p>}
              />
            </Card>
          </div>
        )}

        {tab === 'discounts' && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <StatTile icon={Percent} label="Active discount rate" value={activeDiscountRate === null ? '—' : `${activeDiscountRate.toFixed(0)}%`} />
              <StatTile icon={Percent} label="Total redemptions" value={`${totalRedemptions}×`} />
            </div>
            <Card
              title="Discount performance"
              headerAction={<ExportButton filename="discount-performance.csv" rows={(discounts ?? []).map((d) => ({ code: d.code, status: d.status, type: d.type, redemptions: d.usedCount }))} />}
            >
              {discounts && discounts.length > 0 ? (
                <DataTable
                  columns={[
                    { key: 'code', label: 'Code', render: (r: any) => <span className="font-medium">{r.code}</span> },
                    { key: 'status', label: 'Status', render: (r: any) => <Badge status={r.status === 'active' ? 'success' : 'default'}>{r.status}</Badge> },
                    { key: 'usedCount', label: 'Redemptions', align: 'right', render: (r: any) => `${r.usedCount}×` },
                  ]}
                  rows={discounts.map((d) => ({ id: d._id, ...d }))}
                />
              ) : (
                <p className="text-sm text-p-text-subdued py-6 text-center">No discounts created yet.</p>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
