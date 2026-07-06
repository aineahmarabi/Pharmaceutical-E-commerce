'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { StatCardSkeleton, ChartSkeleton } from '@/components/ui/Skeleton';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Package, CreditCard } from 'lucide-react';

const ease = [0.16, 1, 0.3, 1] as const;
const PIE_COLORS = ['#1a2e2b', '#2a4b46', '#87a8a4'];

export default function AdminAnalyticsPage() {
  const revSummary = useQuery(api.analytics.getRevenueSummary);
  const salesTrend = useQuery(api.analytics.getSalesTrend, { days: 30 });
  const topProducts = useQuery(api.analytics.getTopProducts, { by: 'revenue', limit: 5 });
  const paymentBreakdown = useQuery(api.analytics.getPaymentMethodBreakdown);

  if (revSummary === undefined || salesTrend === undefined || topProducts === undefined || paymentBreakdown === undefined) {
    return (
      <div className="p-4 sm:p-6 space-y-6 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
        <div className="grid lg:grid-cols-2 gap-5">
          <ChartSkeleton className="h-80" />
          <ChartSkeleton className="h-80" />
        </div>
      </div>
    );
  }

  const formatKsh = (val: number) => `KES ${val.toLocaleString()}`;

  const pieData = [
    { name: 'M-PESA', value: paymentBreakdown.revenues.mpesa },
    { name: 'Card', value: paymentBreakdown.revenues.card },
    { name: 'COD', value: paymentBreakdown.revenues.cod },
  ].filter(d => d.value > 0);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1400px] mx-auto pb-24">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease }}>
        <p className="text-petrol-300 text-sm">Insights</p>
        <h2 className="font-display font-bold text-2xl text-ink">Analytics Overview</h2>
      </motion.div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Today Revenue', value: formatKsh(revSummary.today.revenue), change: revSummary.today.change, icon: DollarSign },
          { label: '7-Day Revenue', value: formatKsh(revSummary.sevenDay.revenue), change: revSummary.sevenDay.change, icon: TrendingUp },
          { label: '30-Day Revenue', value: formatKsh(revSummary.thirtyDay.revenue), change: revSummary.thirtyDay.change, icon: TrendingUp },
          { label: 'Avg Order Value', value: formatKsh(revSummary.thirtyDay.revenue / (salesTrend.length || 1)), icon: CreditCard },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-paper rounded-2xl border border-line p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-petrol-300">{stat.label}</p>
                <p className="text-2xl font-bold text-ink mt-1">{stat.value}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-porcelain flex items-center justify-center text-petrol">
                <stat.icon size={18} />
              </div>
            </div>
            {stat.change !== undefined && (
              <div className="mt-4 flex items-center gap-1.5">
                <span className={`flex items-center text-xs font-semibold ${stat.change >= 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'} px-1.5 py-0.5 rounded`}>
                  {stat.change >= 0 ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
                  {Math.abs(stat.change).toFixed(1)}%
                </span>
                <span className="text-xs text-petrol-300">vs previous period</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-[2fr_1fr] gap-5">
        
        {/* Sales Trend */}
        <div className="bg-paper rounded-2xl border border-line p-6 shadow-sm">
          <h3 className="font-semibold text-ink text-lg mb-6">30-Day Sales Trend</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrend}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1a2e2b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#1a2e2b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#6b7280' }} 
                  tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#6b7280' }} 
                  tickFormatter={(val) => `Ksh ${val/1000}k`}
                />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`KES ${value.toLocaleString()}`, 'Revenue']}
                  labelFormatter={(label) => new Date(label).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                />
                <Area type="monotone" dataKey="revenue" stroke="#1a2e2b" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Breakdown */}
        <div className="bg-paper rounded-2xl border border-line p-6 shadow-sm flex flex-col">
          <h3 className="font-semibold text-ink text-lg mb-6">Revenue by Payment Method</h3>
          <div className="flex-1 h-64 min-h-[250px]">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value: number) => `KES ${value.toLocaleString()}`} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-petrol-300">No payment data yet</div>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="lg:col-span-2 bg-paper rounded-2xl border border-line p-6 shadow-sm">
          <h3 className="font-semibold text-ink text-lg mb-6">Top Selling Products (by Revenue)</h3>
          <div className="h-80">
            {topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} layout="vertical" margin={{ left: 100 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                  <XAxis type="number" hide />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    width={150}
                    tick={{ fontSize: 12, fill: '#1a2e2b', fontWeight: 500 }} 
                  />
                  <RechartsTooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }}
                    formatter={(value: number) => `KES ${value.toLocaleString()}`}
                  />
                  <Bar dataKey="revenue" fill="#2a4b46" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-petrol-300">No product data yet</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
