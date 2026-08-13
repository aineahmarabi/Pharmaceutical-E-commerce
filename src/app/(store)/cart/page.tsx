'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ShoppingBag, ArrowRight, Shield, CheckCircle, Truck } from 'lucide-react';
import { ProductImagePlaceholder } from '@/components/ui/ProductImagePlaceholder';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { useCartStore } from '@/store/cart';
import { useToast } from '@/components/ui/Toast';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const { items, removeItem, updateQuantity } = useCartStore();
  const { toast } = useToast();
  const [coupon, setCoupon] = useState('');
  const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0);

  return (
    <div className="min-h-screen bg-porcelain py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="font-display font-bold text-2xl text-ink mb-1 tracking-tight">Your cart</h1>
        <p className="font-mono text-sm text-petrol-300 mb-8">{items.length} {items.length === 1 ? 'item' : 'items'}</p>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-24 h-24 rounded-full bg-petrol-50 flex items-center justify-center mb-5">
              <ShoppingBag size={36} className="text-petrol-300" />
            </div>
            <p className="font-semibold text-ink text-lg mb-2">Your cart is empty</p>
            <p className="text-petrol-300 text-sm mb-6">Add some products to get started.</p>
            <Link href="/products" className="inline-flex items-center gap-2 bg-petrol text-paper font-semibold px-6 py-3 rounded-xl hover:bg-petrol-700 transition-colors">
              Start shopping <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="lg:grid lg:grid-cols-[65fr_35fr] lg:gap-8">
            {/* Items */}
            <div className="space-y-3 mb-6 lg:mb-0">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.product.id}
                    layout
                    initial={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.25 }}
                    className="bg-paper rounded-2xl border border-line border-l-4 border-l-petrol p-4 flex gap-4"
                  >
                    <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                      <ProductImagePlaceholder className="w-20 h-20" size="sm" name={item.product.name} categorySlug={item.product.categorySlug} imageUrl={item.product.imageUrl} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-petrol-300 font-medium">{item.product.brand}</p>
                      <p className="font-semibold text-sm text-ink leading-snug mt-0.5 line-clamp-2">{item.product.name}</p>
                      <p className="font-mono text-xs text-petrol-300 mt-1">{item.product.strength} · {item.product.packSize}</p>
                      <div className="flex items-center justify-between mt-3">
                        <QuantityStepper value={item.quantity} onChange={(v) => updateQuantity(item.product.id, v)} />
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-semibold text-base text-ink">{formatPrice(item.product.price * item.quantity)}</span>
                          <button
                            onClick={() => { removeItem(item.product.id); toast('Item removed', 'info'); }}
                            className="text-danger/40 hover:text-danger transition-colors"
                            aria-label="Remove item"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Coupon */}
              <div className="bg-paper rounded-2xl border border-line p-4 flex gap-3">
                <input
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  placeholder="Coupon code"
                  className="flex-1 text-sm bg-transparent text-ink placeholder:text-petrol-300 focus:outline-none"
                />
                <button
                  onClick={() => { if (coupon) toast('Coupon applied!', 'success'); }}
                  className="px-4 py-2 bg-petrol-50 text-petrol text-sm font-semibold rounded-xl hover:bg-petrol hover:text-paper transition-colors"
                >
                  Apply
                </button>
              </div>

              <Link href="/products" className="inline-flex items-center gap-1.5 text-sm text-petrol font-medium hover:underline mt-2">
                ← Continue shopping
              </Link>
            </div>

            {/* Summary */}
            <div className="bg-petrol-50 rounded-2xl p-6 h-fit sticky top-24">
              <h2 className="font-display font-bold text-lg text-ink mb-4">Order summary</h2>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-petrol-300">Subtotal</span>
                  <span className="font-mono font-semibold text-ink">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-petrol-300">Delivery</span>
                  <span className="font-mono text-petrol-300">Calculated at checkout</span>
                </div>
              </div>

              <hr className="border-line my-3" />
              <div className="flex justify-between items-baseline mb-5">
                <span className="font-semibold text-ink">Subtotal</span>
                <span className="font-mono font-bold text-2xl text-ink">{formatPrice(subtotal)}</span>
              </div>

              <Link href="/checkout" className="block w-full text-center bg-signal hover:bg-signal/90 text-paper font-semibold py-3.5 rounded-xl transition-all hover:-translate-y-0.5 active:scale-[0.98]">
                Proceed to checkout <ArrowRight size={16} className="inline ml-1" />
              </Link>

              <div className="flex items-center justify-center gap-4 mt-4 text-xs text-petrol-300">
                <span className="flex items-center gap-1"><Shield size={11} />Secure</span>
                <span className="flex items-center gap-1"><CheckCircle size={11} />Genuine</span>
                <span className="flex items-center gap-1"><Truck size={11} />Fast delivery</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
