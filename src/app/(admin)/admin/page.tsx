'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { StatCardSkeleton, RowSkeleton } from '@/components/ui/Skeleton';
import Link from 'next/link';
import { Package, TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart } from 'lucide-react';

const ease = [0.16, 1, 0.3, 1] as const;

export default function AdminDashboard() {
  const revenueSummary = useQuery(api.analytics.getRevenueSummary);
  const topProducts = useQuery(api.analytics.getTopProducts, { by: 'revenue', limit: 5 });
  const recentOrders = useQuery(api.orders.listOrders, { limit: 5 });
  const products = useQuery(api.adminProducts.adminListProducts, { limit: 100 });
  const customers = useQuery(api.customers.listCustomers, {});

  const lowStockProducts = products?.filter(p => p.stockQty < 10).slice(0, 5);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1200px] mx-auto">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease }}>
        <p className="text-petrol-300 text-sm">Overview</p>
        <h2 className="font-display font-bold text-2xl text-ink">Dashboard</h2>
      </motion.div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {!revenueSummary ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <div className="bg-paper rounded-2xl border border-line p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-2 text-petrol-300">
                <DollarSign size={16} />
                <p className="text-sm font-medium">Today's Revenue</p>
              </div>
              <h3 className="text-2xl font-bold text-ink">KES {revenueSummary.today.revenue.toLocaleString()}</h3>
              <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${revenueSummary.today.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {revenueSummary.today.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {Math.abs(revenueSummary.today.change).toFixed(1)}% vs yesterday
              </div>
            </div>

            <div className="bg-paper rounded-2xl border border-line p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-2 text-petrol-300">
                <ShoppingCart size={16} />
                <p className="text-sm font-medium">7-Day Revenue</p>
              </div>
              <h3 className="text-2xl font-bold text-ink">KES {revenueSummary.sevenDay.revenue.toLocaleString()}</h3>
              <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${revenueSummary.sevenDay.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {revenueSummary.sevenDay.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {Math.abs(revenueSummary.sevenDay.change).toFixed(1)}% vs prev 7 days
              </div>
            </div>

            <div className="bg-paper rounded-2xl border border-line p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-2 text-petrol-300">
                <TrendingUp size={16} />
                <p className="text-sm font-medium">30-Day Revenue</p>
              </div>
              <h3 className="text-2xl font-bold text-ink">KES {revenueSummary.thirtyDay.revenue.toLocaleString()}</h3>
              <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${revenueSummary.thirtyDay.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {revenueSummary.thirtyDay.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {Math.abs(revenueSummary.thirtyDay.change).toFixed(1)}% vs prev 30 days
              </div>
            </div>

            <div className="bg-paper rounded-2xl border border-line p-5 shadow-sm flex flex-col justify-center items-center text-center bg-porcelain/30">
              <Users size={24} className="text-petrol-300 mb-2" />
              <p className="text-sm font-medium text-petrol-300">Active Customers</p>
              {customers === undefined ? (
                <div className="w-12 h-6 bg-line/50 rounded mt-1 animate-pulse" />
              ) : (
                <h3 className="text-xl font-bold text-ink mt-1">{customers.length}</h3>
              )}
            </div>
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Recent orders */}
        <div className="bg-paper rounded-2xl border border-line p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-base text-ink">Recent orders</p>
            <Link href="/admin/orders" className="text-sm font-medium text-petrol hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {recentOrders === undefined ? (
              Array.from({ length: 5 }).map((_, i) => <RowSkeleton key={i} />)
            ) : recentOrders.length === 0 ? (
              <p className="text-sm text-ink/50 py-4 text-center">No recent orders.</p>
            ) : (
              recentOrders.map(order => (
                <div key={order._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-porcelain/50 transition-colors border border-transparent hover:border-line">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-porcelain flex items-center justify-center text-petrol font-semibold text-sm">
                      #{order.orderNumber}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-ink">{order.customerName}</p>
                      <p className="text-xs text-ink/60">{new Date(order._creationTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm text-ink">KES {order.total.toLocaleString()}</p>
                    <span className={`inline-flex mt-1 px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider ${
                      order.status === 'delivering' ? 'bg-petrol/10 text-petrol' : 
                      order.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-paper rounded-2xl border border-line p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-base text-ink">Top selling products</p>
            <Link href="/admin/analytics" className="text-sm font-medium text-petrol hover:underline">Full report</Link>
          </div>
          <div className="space-y-3">
            {topProducts === undefined ? (
              Array.from({ length: 5 }).map((_, i) => <RowSkeleton key={i} />)
            ) : topProducts.length === 0 ? (
              <p className="text-sm text-ink/50 py-4 text-center">No sales data yet.</p>
            ) : (
              topProducts.map((prod, idx) => (
                <div key={prod.name} className="flex items-center justify-between p-3 rounded-xl hover:bg-porcelain/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-6 text-center text-petrol-300 font-bold text-sm">{idx + 1}</div>
                    <div className="w-10 h-10 rounded bg-porcelain border border-line flex items-center justify-center">
                      <Package size={16} className="text-petrol-300" />
                    </div>
                    <p className="font-medium text-sm text-ink line-clamp-1">{prod.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm text-ink">KES {prod.revenue.toLocaleString()}</p>
                    <p className="text-xs text-ink/60">{prod.units} units</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      {/* Low stock alerts */}
      <div className="bg-paper rounded-2xl border border-line p-5 shadow-sm max-w-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <p className="font-semibold text-base text-ink">Low stock alerts</p>
          </div>
          <Link href="/admin/inventory" className="text-sm font-medium text-petrol hover:underline">View inventory</Link>
        </div>
        <div className="space-y-3">
          {lowStockProducts === undefined ? (
            Array.from({ length: 3 }).map((_, i) => <RowSkeleton key={i} />)
          ) : lowStockProducts.length === 0 ? (
            <p className="text-sm text-ink/50 py-4 text-center">All products are well stocked.</p>
          ) : (
            lowStockProducts.map(p => (
              <div key={p._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-porcelain/50 transition-colors border border-transparent hover:border-red-100">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-medium text-sm text-ink">{p.name}</p>
                    <p className="text-xs text-ink/60">{p.brand}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex px-2 py-1 rounded bg-red-100 text-red-700 font-bold text-xs">
                    {p.stockQty} left
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
