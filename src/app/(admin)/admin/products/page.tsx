'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Package, ChevronRight, Download, Upload } from 'lucide-react';
import { TableRowSkeleton } from '@/components/ui/Skeleton';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import Link from 'next/link';

const ease = [0.16, 1, 0.3, 1] as const;

export default function AdminProductsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const toggleStock = useMutation(api.adminProducts.adminToggleStock);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const products = useQuery(api.adminProducts.adminListProducts, { 
    limit: 100,
    search: searchTerm || undefined
  });

  const handleExport = () => {
    if (!products || products.length === 0) return;
    const headers = ['ID', 'Name', 'Brand', 'Category', 'Price', 'Stock', 'Classification'];
    const csvContent = [
      headers.join(','),
      ...products.map(p => `"${p._id}","${p.name}","${p.brand}","${p.category}",${p.price},${p.stockQty},"${p.classification}"`)
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
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleImportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Basic stub for import logic (would parse CSV and call createProduct in a loop)
    alert(`Importing ${file.name}... (Parsing logic to be connected to Convex)`);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1200px] mx-auto">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease }} className="flex items-center justify-between">
        <div>
          <p className="text-petrol-300 text-sm">Manage</p>
          <h2 className="font-display font-bold text-2xl text-ink">Products</h2>
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
            href="/admin/products/new" 
            className="flex items-center gap-1.5 bg-petrol text-paper text-sm font-semibold px-4 py-2 rounded-xl hover:bg-petrol/90 transition-colors shadow-sm ml-2"
          >
            <Plus size={16} /> Add Product
          </Link>
        </div>
      </motion.div>

      <div className="bg-paper rounded-2xl border border-line shadow-sm overflow-hidden">
        <div className="p-4 border-b border-line bg-porcelain/30">
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-petrol-300" />
            <input 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-line rounded-xl focus:outline-none focus:border-petrol shadow-sm" 
              placeholder="Search by name, brand, or SKU..." 
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-porcelain/30">
                <th className="text-left px-4 py-3 text-xs font-mono text-petrol-300 uppercase tracking-wider">Product</th>
                <th className="text-left px-4 py-3 text-xs font-mono text-petrol-300 uppercase tracking-wider hidden sm:table-cell">Brand & Category</th>
                <th className="text-left px-4 py-3 text-xs font-mono text-petrol-300 uppercase tracking-wider hidden md:table-cell">Class</th>
                <th className="text-right px-4 py-3 text-xs font-mono text-petrol-300 uppercase tracking-wider">Price</th>
                <th className="text-right px-4 py-3 text-xs font-mono text-petrol-300 uppercase tracking-wider hidden lg:table-cell">Stock</th>
                <th className="px-4 py-3 text-center text-xs font-mono text-petrol-300 uppercase tracking-wider">Active</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {products === undefined ? (
                Array.from({ length: 8 }).map((_, i) => <TableRowSkeleton key={i} cols={7} />)
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <Package size={40} className="text-petrol-300/50 mx-auto mb-4" />
                    <p className="font-semibold text-ink">No products found</p>
                    <p className="text-sm text-petrol-300">Try adjusting your search or add a new product</p>
                  </td>
                </tr>
              ) : (
                products.map(product => (
                  <tr key={product._id} className="hover:bg-porcelain/30 transition-colors group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-porcelain border border-line flex-shrink-0 overflow-hidden flex items-center justify-center relative">
                          {product.imageUrl ? (
                            <img 
                              src={product.imageUrl} 
                              alt={product.name} 
                              className="w-full h-full object-cover" 
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <Package size={20} className={`text-petrol-300 ${product.imageUrl ? 'hidden absolute' : ''}`} />
                        </div>
                        <div>
                          <Link href={`/admin/products/${product._id}`} className="font-semibold text-ink group-hover:text-petrol transition-colors line-clamp-1">
                            {product.name}
                          </Link>
                          <p className="text-xs text-petrol-300 sm:hidden mt-0.5 line-clamp-1">{product.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <p className="font-medium text-ink">{product.brand}</p>
                      <p className="text-xs text-petrol-300">{product.category}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        product.classification === 'POM' ? 'bg-red-100 text-red-700' :
                        product.classification === 'P' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {product.classification}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="font-semibold text-ink">KES {product.price.toLocaleString()}</p>
                      {product.compareAtPrice && <p className="text-[10px] text-petrol-300 line-through">KES {product.compareAtPrice.toLocaleString()}</p>}
                    </td>
                    <td className="px-4 py-3 text-right hidden lg:table-cell">
                      <span className={`font-semibold ${product.stockQty <= 10 ? 'text-red-500' : 'text-ink'}`}>
                        {product.stockQty}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button 
                        onClick={() => toggleStock({ id: product._id, inStock: !product.inStock })}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${product.inStock ? 'bg-petrol' : 'bg-line'}`}
                      >
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${product.inStock ? 'translate-x-4.5' : 'translate-x-1'}`} />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/products/${product._id}`} className="p-1.5 inline-flex text-petrol-300 hover:text-ink hover:bg-porcelain rounded-lg transition-colors">
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
