'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { ProductImagePlaceholder } from '@/components/ui/ProductImagePlaceholder';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { useCartStore } from '@/store/cart';
import { useToast } from '@/components/ui/Toast';
import { formatPrice } from '@/lib/utils';

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity } = useCartStore();
  const { toast } = useToast();
  const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-ink/40 backdrop-blur-sm"
            onClick={closeCart}
            aria-hidden="true"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 340, damping: 34 }}
            className="fixed inset-y-0 right-0 z-[70] w-full sm:w-[400px] bg-paper shadow-2xl flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 h-16 border-b border-line flex-shrink-0">
              <h2 className="font-display font-bold text-lg text-ink">
                Your cart {items.length > 0 && <span className="text-petrol-300 font-normal text-sm">({items.length})</span>}
              </h2>
              <button onClick={closeCart} className="w-9 h-9 rounded-xl hover:bg-petrol-50 flex items-center justify-center transition-colors" aria-label="Close cart">
                <X size={18} className="text-ink" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
                <div className="w-20 h-20 rounded-full bg-petrol-50 flex items-center justify-center mb-4">
                  <ShoppingBag size={30} className="text-petrol-300" />
                </div>
                <p className="font-semibold text-ink mb-1.5">Your cart is empty</p>
                <p className="text-petrol-300 text-sm mb-5">Add some products to get started.</p>
                <button
                  onClick={closeCart}
                  className="inline-flex items-center gap-2 bg-petrol text-paper font-semibold px-5 py-2.5 rounded-xl hover:bg-petrol-700 transition-colors text-sm"
                >
                  Continue shopping
                </button>
              </div>
            ) : (
              <>
                {/* Items */}
                <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4 space-y-3">
                  <AnimatePresence>
                    {items.map((item) => (
                      <motion.div
                        key={item.product.id}
                        layout
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex gap-3 border-b border-line/50 pb-3"
                      >
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          <ProductImagePlaceholder className="w-16 h-16" aspectRatio="" size="sm" name={item.product.name} categorySlug={item.product.categorySlug} imageUrl={item.product.imageUrl} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] text-petrol-300 font-medium">{item.product.brand}</p>
                          <p className="font-medium text-sm text-ink leading-snug line-clamp-1">{item.product.name}</p>
                          <div className="flex items-center justify-between mt-2">
                            <QuantityStepper value={item.quantity} onChange={(v) => updateQuantity(item.product.id, v)} className="scale-90 origin-left" />
                            <span className="font-mono font-semibold text-sm text-ink">{formatPrice(item.product.price * item.quantity)}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => { removeItem(item.product.id); toast('Item removed', 'info'); }}
                          className="text-danger/40 hover:text-danger transition-colors flex-shrink-0 self-start"
                          aria-label="Remove item"
                        >
                          <Trash2 size={15} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="border-t border-line p-5 flex-shrink-0 space-y-3">
                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold text-ink text-sm">Subtotal</span>
                    <span className="font-mono font-bold text-xl text-ink">{formatPrice(subtotal)}</span>
                  </div>

                  <Link
                    href="/checkout"
                    onClick={closeCart}
                    className="block w-full text-center bg-signal hover:bg-signal/90 text-paper font-semibold py-3 rounded-xl transition-all active:scale-[0.98]"
                  >
                    Checkout <ArrowRight size={16} className="inline ml-1" />
                  </Link>
                  <Link
                    href="/cart"
                    onClick={closeCart}
                    className="block w-full text-center text-petrol text-sm font-medium hover:underline"
                  >
                    View full cart
                  </Link>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
