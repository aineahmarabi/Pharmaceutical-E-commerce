'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2 } from 'lucide-react';
import { ProductImagePlaceholder } from '@/components/ui/ProductImagePlaceholder';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { useCartStore } from '@/store/cart';
import { useSelectedZone } from '@/components/cart/DeliveryArea';
import { useToast } from '@/components/ui/Toast';
import { useBranding } from '@/hooks/useBranding';
import { formatPrice } from '@/lib/utils';

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity } = useCartStore();
  const { toast } = useToast();
  const branding = useBranding();
  const { zone } = useSelectedZone();
  const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const hasRx = items.some((i) => i.product.classification === 'POM');

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-deep/50"
            onClick={closeCart}
            aria-hidden="true"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
            className="fixed inset-y-0 right-0 z-[70] flex w-full flex-col border-l border-line bg-paper shadow-xl sm:w-[420px]"
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
          >
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-5">
              <h2 className="text-lg font-semibold tracking-tight text-ink">
                Your cart{items.length > 0 && <span className="ml-2 text-sm font-normal tabular-nums text-muted-fg">{items.length} {items.length === 1 ? 'item' : 'items'}</span>}
              </h2>
              <button
                onClick={closeCart}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-ink transition-transform duration-100 hover:bg-porcelain active:scale-[0.97]"
                aria-label="Close cart"
              >
                <X size={20} />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                <p className="text-base font-semibold text-ink">Your cart is empty</p>
                <p className="mb-5 mt-1 max-w-64 text-sm text-muted-fg">Add medicines or health products and they will show up here.</p>
                <button
                  onClick={closeCart}
                  className="inline-flex h-11 items-center rounded-lg bg-petrol px-5 text-sm font-medium text-white transition-transform duration-100 hover:bg-petrol-700 active:scale-[0.97]"
                >
                  Continue shopping
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-2">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.div
                        key={item.product.id}
                        layout
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex gap-3 overflow-hidden border-b border-line py-4 last:border-b-0"
                      >
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-line bg-paper">
                          <ProductImagePlaceholder className="h-16 w-16" aspectRatio="" size="sm" name={item.product.name} categorySlug={item.product.categorySlug} imageUrl={item.product.imageUrl} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-muted-fg">{item.product.brand}</p>
                          <p className="line-clamp-2 text-sm font-medium leading-snug text-ink">{item.product.name}</p>
                          {item.product.classification === 'POM' && (
                            <p className="mt-0.5 text-xs text-muted-fg">Prescription required</p>
                          )}
                          <div className="mt-2 flex items-center justify-between">
                            <QuantityStepper value={item.quantity} onChange={(v) => updateQuantity(item.product.id, v)} className="origin-left scale-90" />
                            <span className="text-sm font-semibold tabular-nums text-ink">{formatPrice(item.product.price * item.quantity)}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => { removeItem(item.product.id); toast('Item removed', 'info'); }}
                          className="self-start rounded-lg p-1.5 text-muted-fg transition-colors hover:text-signal"
                          aria-label={`Remove ${item.product.name}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <div className="shrink-0 space-y-3 border-t border-line px-5 py-4">
                  {hasRx && (
                    <p className="rounded-lg border border-line bg-porcelain px-3 py-2 text-xs leading-relaxed text-ink">
                      Your cart has prescription-only medicine. Our pharmacist will ask you to upload a valid prescription before we dispatch your order.
                    </p>
                  )}
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-muted-fg">Subtotal</span>
                    <span className="text-xl font-semibold tabular-nums text-ink">{formatPrice(subtotal)}</span>
                  </div>
                  {zone ? (
                    <p className="text-xs text-muted-fg">
                      Delivery to {zone.name}: <span className="tabular-nums">{formatPrice(zone.price)}</span>, added at checkout.
                    </p>
                  ) : (
                    <p className="text-xs text-muted-fg">
                      Delivery is added at checkout.{' '}
                      <Link href="/cart" onClick={closeCart} className="font-medium text-petrol hover:underline">Choose area</Link>
                    </p>
                  )}
                  <Link
                    href="/checkout"
                    onClick={closeCart}
                    className="flex h-12 w-full items-center justify-center rounded-lg bg-petrol text-sm font-semibold text-white transition-transform duration-100 hover:bg-petrol-700 active:scale-[0.97]"
                  >
                    Checkout
                  </Link>
                  <Link
                    href="/cart"
                    onClick={closeCart}
                    className="block w-full text-center text-sm font-medium text-petrol underline-offset-4 hover:underline"
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
