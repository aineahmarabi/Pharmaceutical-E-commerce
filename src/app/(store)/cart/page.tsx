'use client';

import React from 'react';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { ProductImagePlaceholder } from '@/components/ui/ProductImagePlaceholder';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { ClassBadge } from '@/components/ui/ClassBadge';
import { useCartStore } from '@/store/cart';
import { DeliveryArea, useSelectedZone } from '@/components/cart/DeliveryArea';
import { useToast } from '@/components/ui/Toast';
import { branding } from '@/lib/config/branding';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const { items, removeItem, updateQuantity } = useCartStore();
  const { toast } = useToast();
  const { zone } = useSelectedZone();
  const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const deliveryFee = zone?.price;
  const total = subtotal + (deliveryFee ?? 0);
  const count = items.reduce((s, i) => s + i.quantity, 0);

  const rxItems = items.filter((i) => i.product.classification === 'POM');

  return (
    <div className="min-h-screen bg-porcelain">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-ink">Your cart</h1>
          {items.length > 0 && <p className="text-sm text-muted-fg">{count} {count === 1 ? 'item' : 'items'}</p>}
        </div>

        {items.length === 0 ? (
          <div className="bg-paper rounded-xl border border-line p-8 sm:p-12 text-center">
            <p className="text-lg font-semibold text-ink">Your cart is empty</p>
            <p className="mt-1.5 mb-6 text-sm text-muted-fg">Find what you need, or send us your prescription.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/products" className="bg-petrol hover:bg-petrol-700 text-white text-sm font-semibold px-6 py-3 rounded-lg transition-colors active:scale-[0.97] duration-100">
                Shop now
              </Link>
              <Link href="/account/orders" className="border border-line bg-paper hover:bg-porcelain text-ink text-sm font-semibold px-6 py-3 rounded-lg transition-colors">
                Track order
              </Link>
            </div>
          </div>
        ) : (
          <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-4 lg:items-start space-y-4 lg:space-y-0">
            {/* Items */}
            <div className="space-y-4 min-w-0">
              {rxItems.length > 0 && (
                <div className="bg-paper rounded-xl border border-line p-4 text-sm" role="note">
                  <p className="text-ink"><span className="font-semibold">Prescription required</span> for {rxItems.map((i) => i.product.name).join(', ')}.</p>
                </div>
              )}
              
              <ul className="bg-paper rounded-xl border border-line divide-y divide-line">
                {items.map((item) => (
                  <li key={item.product.id} className="p-4 sm:p-6 flex gap-4">
                    <Link href={`/products/${item.product.slug}`} className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg border border-line bg-white overflow-hidden flex-shrink-0">
                      <ProductImagePlaceholder className="w-full h-full" aspectRatio="aspect-square" size="sm" name={item.product.name} categorySlug={item.product.categorySlug} imageUrl={item.product.imageUrl} />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs text-muted-fg">{item.product.brand}</p>
                          <Link href={`/products/${item.product.slug}`} className="text-sm font-semibold text-ink leading-snug line-clamp-2 hover:underline">
                            {item.product.name}
                          </Link>
                          <p className="text-xs text-muted-fg mt-1">{[item.product.strength, item.product.packSize].filter(Boolean).join(' · ')}</p>
                        </div>
                        <ClassBadge classification={item.product.classification} className="flex-shrink-0" />
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
                        <QuantityStepper value={item.quantity} onChange={(v) => updateQuantity(item.product.id, v)} />
                        <div className="flex items-center gap-4">
                          <span className="text-base font-semibold tabular-nums text-ink">{formatPrice(item.product.price * item.quantity)}</span>
                          <button
                            onClick={() => { removeItem(item.product.id); toast('Item removed', 'info'); }}
                            className="text-muted-fg hover:text-signal transition-colors p-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-petrol/40"
                            aria-label={`Remove ${item.product.name}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <Link href="/products" className="inline-block text-sm text-petrol font-medium hover:underline">
                Continue shopping
              </Link>
            </div>

            {/* Summary */}
            <aside className="lg:sticky lg:top-24 space-y-4">
              <div className="bg-paper rounded-xl border border-line p-4 sm:p-6">
                <h2 className="text-lg font-semibold tracking-tight text-ink mb-4">Summary</h2>

                <DeliveryArea className="border-t border-line pt-4 pb-4" />

                <dl className="space-y-2 text-sm border-t border-line pt-4">
                  <div className="flex justify-between">
                    <dt className="text-muted-fg">Subtotal ({count})</dt>
                    <dd className="font-medium tabular-nums text-ink">{formatPrice(subtotal)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-fg">Delivery</dt>
                    <dd className={deliveryFee === undefined ? 'text-muted-fg' : 'font-medium tabular-nums text-ink'}>
                      {deliveryFee === undefined ? 'Choose area' : formatPrice(deliveryFee)}
                    </dd>
                  </div>
                </dl>

                <div className="flex justify-between items-baseline border-t border-line mt-4 pt-4 mb-5">
                  <span className="font-semibold text-ink">Total</span>
                  <span className="text-2xl font-semibold tracking-tight tabular-nums text-ink">{formatPrice(total)}</span>
                </div>

                <Link href="/checkout" className="block w-full text-center bg-petrol hover:bg-petrol-700 text-white text-sm font-semibold py-3.5 rounded-lg transition-colors active:scale-[0.97] duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-petrol/40 focus-visible:ring-offset-2">
                  Checkout
                </Link>
              </div>

              <p className="px-1 text-center text-xs text-muted-fg">Pay by M-PESA, card or cash on delivery. Genuine products from a licensed pharmacy.</p>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
