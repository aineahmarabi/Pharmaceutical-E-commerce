'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, ShoppingCart, ChevronRight, Download, Upload } from 'lucide-react';
import { TableRowSkeleton } from '@/components/ui/Skeleton';
import { useQuery } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import Link from 'next/link';

const ease = [0.16, 1, 0.3, 1] as const;

export default function AdminOrdersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all'|'placed'|'confirmed'|'delivering'|'completed'>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const orders = useQuery(api.orders.listOrders, { 
    limit: 100,
    search: searchTerm || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter
  });

  const handleExport = () => {
    if (!orders || orders.length === 0) return;
    const headers = ['OrderNumber', 'CustomerName', 'CustomerEmail', 'Status', 'PaymentStatus', 'Total'];
    const csvContent = [
      headers.join(','),
      ...orders.map(o => `"${o.orderNumber}","${o.customerName}","${o.customerEmail}","${o.status}","${o.paymentStatus}",${o.total}`)
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
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleImportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    alert(`Importing ${file.name}... (Parsing logic to be connected to Convex bulkImport)`);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1200px] mx-auto">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease }} className="flex items-center justify-between">
        <div>
          <p className="text-petrol-300 text-sm">Manage</p>
          <h2 className="font-display font-bold text-2xl text-ink">Orders</h2>
        </div>
        <div className="flex items-center gap-2">
          <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleImportChange} />
          <button onClick={handleImportClick} className="flex items-center gap-1.5 bg-paper border border-line text-ink text-sm font-semibold px-4 py-2 rounded-xl hover:bg-porcelain transition-colors shadow-sm">
            <Upload size={16} /> Import
          </button>
          <button onClick={handleExport} className="flex items-center gap-1.5 bg-paper border border-line text-ink text-sm font-semibold px-4 py-2 rounded-xl hover:bg-porcelain transition-colors shadow-sm">
            <Download size={16} /> Export
          </button>
          <Link 
            href="/admin/orders/new" 
            className="flex items-center gap-1.5 bg-petrol text-paper text-sm font-semibold px-4 py-2 rounded-xl hover:bg-petrol/90 transition-colors shadow-sm ml-2"
          >
            <Plus size={16} /> Create Order
          </Link>
        </div>
      </motion.div>

      <div className="bg-paper rounded-2xl border border-line shadow-sm overflow-hidden">
        <div className="p-4 border-b border-line bg-porcelain/30 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex bg-white border border-line rounded-xl p-1 shadow-sm w-full sm:w-auto overflow-x-auto">
            {['All', 'Placed', 'Confirmed', 'Delivering', 'Completed'].map(tab => (
              <button 
                key={tab}
                onClick={() => setStatusFilter(tab.toLowerCase() as any)}
                className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${statusFilter === tab.toLowerCase() ? 'bg-porcelain text-ink' : 'text-petrol-300 hover:text-ink'}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-petrol-300" />
            <input 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-line rounded-xl focus:outline-none focus:border-petrol shadow-sm" 
              placeholder="Search orders, customers..." 
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-porcelain/30">
                <th className="text-left px-4 py-3 text-xs font-mono text-petrol-300 uppercase tracking-wider">Order ID</th>
                <th className="text-left px-4 py-3 text-xs font-mono text-petrol-300 uppercase tracking-wider hidden sm:table-cell">Customer</th>
                <th className="text-left px-4 py-3 text-xs font-mono text-petrol-300 uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3 text-xs font-mono text-petrol-300 uppercase tracking-wider hidden md:table-cell">Total</th>
                <th className="text-left px-4 py-3 text-xs font-mono text-petrol-300 uppercase tracking-wider hidden lg:table-cell">Date</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {orders === undefined ? (
                Array.from({ length: 8 }).map((_, i) => <TableRowSkeleton key={i} cols={6} />)
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
                    <ShoppingCart size={40} className="text-petrol-300/50 mx-auto mb-4" />
                    <p className="font-semibold text-ink">No orders found</p>
                    <p className="text-sm text-petrol-300">Create a new order to get started</p>
                  </td>
                </tr>
              ) : (
                orders.map(order => (
                  <tr key={order._id} className="hover:bg-porcelain/30 transition-colors group">
                    <td className="px-4 py-4">
                      <Link href={`/admin/orders/${order._id}`} className="font-semibold text-ink group-hover:text-petrol transition-colors">
                        {order.orderNumber}
                      </Link>
                      <p className="text-xs text-petrol-300 sm:hidden mt-1">{order.customerName}</p>
                    </td>
                    <td className="px-4 py-4 hidden sm:table-cell">
                      <p className="font-medium text-ink">{order.customerName}</p>
                      <p className="text-xs text-petrol-300">{order.customerEmail || order.customerPhone}</p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider w-fit ${
                          order.status === 'completed' ? 'bg-green-100 text-green-700' :
                          order.status === 'delivering' ? 'bg-blue-100 text-blue-700' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {order.status}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider w-fit ${
                          order.paymentStatus === 'paid' || order.paymentStatus === 'collected' ? 'bg-petrol/10 text-petrol' : 'bg-porcelain text-petrol-300'
                        }`}>
                          {order.paymentStatus}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right font-semibold text-ink hidden md:table-cell">
                      KES {order.total.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-xs font-medium text-petrol-300 hidden lg:table-cell">
                      {new Date(order._creationTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Link href={`/admin/orders/${order._id}`} className="p-1.5 inline-flex text-petrol-300 hover:text-ink hover:bg-porcelain rounded-lg transition-colors">
                        <ChevronRight size={18} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
