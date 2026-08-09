'use client';

import React, { useMemo, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { Monitor, ShoppingCart, Search, Plus, Minus, Trash2, Package } from 'lucide-react';
import { api } from '../../../../../convex/_generated/api';
import type { Id } from '../../../../../convex/_generated/dataModel';
import { Input } from '@/components/admin/ui/Input';
import { Button } from '@/components/admin/ui/Button';
import { EmptyState } from '@/components/admin/ui/EmptyState';
import { useAdminToast } from '@/components/admin/ui/Toast';

interface CartLine {
  productId: string;
  name: string;
  price: number;
  qty: number;
  stockQty: number;
}

const DELIVERY_FEE = 0; // walk-in / in-store sale, no delivery

export default function AdminPOSPage() {
  const { toast } = useAdminToast();
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartLine[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'mpesa' | 'card'>('cod');
  const [customerName, setCustomerName] = useState('Walk-in customer');
  const [submitting, setSubmitting] = useState(false);

  const products = useQuery(api.adminProducts.adminListProducts, { limit: 200, search: search || undefined });
  const createOrder = useMutation(api.orders.createOrder);

  const inStockProducts = useMemo(() => products?.filter((p) => p.inStock && p.stockQty > 0), [products]);

  const addToCart = (p: NonNullable<typeof products>[number]) => {
    setCart((prev) => {
      const existing = prev.find((l) => l.productId === p._id);
      if (existing) {
        if (existing.qty >= p.stockQty) {
          toast(`Only ${p.stockQty} in stock`);
          return prev;
        }
        return prev.map((l) => (l.productId === p._id ? { ...l, qty: l.qty + 1 } : l));
      }
      return [...prev, { productId: p._id, name: p.name, price: p.price, qty: 1, stockQty: p.stockQty }];
    });
  };

  const updateQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((l) => (l.productId === productId ? { ...l, qty: Math.min(l.stockQty, Math.max(0, l.qty + delta)) } : l))
        .filter((l) => l.qty > 0)
    );
  };

  const removeLine = (productId: string) => setCart((prev) => prev.filter((l) => l.productId !== productId));

  const subtotal = cart.reduce((sum, l) => sum + l.price * l.qty, 0);
  const total = subtotal + DELIVERY_FEE;

  const handleCharge = async () => {
    if (cart.length === 0) return;
    setSubmitting(true);
    try {
      const orderId = await createOrder({
        customerName: customerName || 'Walk-in customer',
        customerPhone: '',
        customerEmail: '',
        items: cart.map((l) => ({ productId: l.productId, name: l.name, qty: l.qty, price: l.price })),
        deliveryAddress: 'In-Store',
        paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'collected' : 'paid',
        status: 'completed',
        deliveryFee: DELIVERY_FEE,
        channel: 'Admin POS',
      });
      toast('Sale completed', { actionLabel: 'View order', onAction: () => window.open(`/admin/orders/${orderId}`, '_blank') });
      setCart([]);
      setCustomerName('Walk-in customer');
    } catch (err: any) {
      toast(err?.message ?? 'Failed to complete sale');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pb-16 lg:h-[calc(100vh-56px)] flex flex-col">
      <div className="py-5 flex items-center gap-2 flex-shrink-0">
        <Monitor size={20} className="text-p-primary" />
        <h1 className="text-xl font-semibold text-p-text">POS Terminal</h1>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-[1fr_360px] gap-5 lg:flex-1 lg:min-h-0">
        {/* Product grid — scrolls independently on desktop */}
        <div className="bg-p-bg-surface rounded-xl border border-p-border-subdued p-4 lg:overflow-y-auto admin-scroll">
          <div className="relative mb-4">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-p-text-disabled" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products to sell..."
              className="h-9 w-full rounded-lg pl-8 pr-3 text-sm bg-p-bg-surface border border-p-border-input focus:outline-none focus:shadow-[0_0_0_1px_var(--color-p-focus)]"
            />
          </div>

          {inStockProducts === undefined ? (
            <p className="text-sm text-p-text-subdued text-center py-10">Loading products...</p>
          ) : inStockProducts.length === 0 ? (
            <EmptyState icon={Package} heading="No products available" body="No in-stock products match your search." />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {inStockProducts.map((p) => (
                <button
                  key={p._id}
                  onClick={() => addToCart(p)}
                  className="text-left bg-p-bg-surface border border-p-border-subdued rounded-lg p-3 hover:border-p-primary hover:shadow-p-card transition-all"
                >
                  <div className="w-full aspect-square rounded bg-p-bg flex items-center justify-center mb-2 overflow-hidden">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Package size={22} className="text-p-icon-subdued" />
                    )}
                  </div>
                  <p className="text-xs font-medium text-p-text line-clamp-2 leading-snug">{p.name}</p>
                  <p className="text-sm font-semibold text-p-text mt-1">KES {p.price.toLocaleString()}</p>
                  <p className="text-[11px] text-p-text-subdued">{p.stockQty} in stock</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Cart panel — sticky + fills height on desktop; static, natural height on mobile */}
        <div className="bg-p-bg-surface rounded-xl border border-p-border-subdued p-4 flex flex-col lg:sticky lg:top-0 lg:self-start lg:h-full">
          <div className="flex items-center gap-2 mb-3 flex-shrink-0">
            <ShoppingCart size={16} className="text-p-primary" />
            <p className="font-semibold text-sm text-p-text">Current Sale</p>
          </div>

          <Input
            containerClassName="mb-3 flex-shrink-0"
            label="Customer"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />

          <div className="flex-1 overflow-y-auto admin-scroll min-h-0 space-y-2">
            {cart.length === 0 ? (
              <p className="text-sm text-p-text-subdued text-center py-8">No items yet — tap a product to add it.</p>
            ) : (
              cart.map((line) => (
                <div key={line.productId} className="flex items-center gap-2 py-2 border-b border-p-border-subdued last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-p-text truncate">{line.name}</p>
                    <p className="text-[12px] text-p-text-subdued">KES {line.price.toLocaleString()} each</p>
                  </div>
                  <button onClick={() => updateQty(line.productId, -1)} className="w-6 h-6 rounded flex items-center justify-center border border-p-border-input hover:bg-p-bg">
                    <Minus size={12} />
                  </button>
                  <span className="text-sm font-medium w-5 text-center">{line.qty}</span>
                  <button onClick={() => updateQty(line.productId, 1)} className="w-6 h-6 rounded flex items-center justify-center border border-p-border-input hover:bg-p-bg">
                    <Plus size={12} />
                  </button>
                  <button onClick={() => removeLine(line.productId)} className="w-6 h-6 rounded flex items-center justify-center text-p-critical hover:bg-p-critical-subdued">
                    <Trash2 size={12} />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="flex-shrink-0 border-t border-p-border-subdued mt-3 pt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-p-text-subdued">Subtotal</span>
              <span className="text-p-text">KES {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-base font-semibold">
              <span>Total</span>
              <span>KES {total.toLocaleString()}</span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 pt-1">
              {(['cod', 'mpesa', 'card'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setPaymentMethod(m)}
                  className={`h-8 rounded text-xs font-medium border transition-colors ${
                    paymentMethod === m ? 'bg-p-primary text-white border-p-primary' : 'border-p-border-input text-p-text hover:bg-p-bg'
                  }`}
                >
                  {m === 'cod' ? 'Cash' : m === 'mpesa' ? 'M-Pesa' : 'Card'}
                </button>
              ))}
            </div>

            <Button variant="primary" className="w-full mt-2" disabled={cart.length === 0} loading={submitting} onClick={handleCharge}>
              Complete sale
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
