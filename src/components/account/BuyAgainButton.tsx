'use client';

import React, { useState } from 'react';
import { useConvex } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import { toProduct } from '@/lib/adapters/product';
import { useCartStore } from '@/store/cart';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';

interface OrderLine {
  productId: string;
  name: string;
  qty: number;
}

/** Re-adds the in-stock items from a past order to the cart at today's price. */
export function BuyAgainButton({ items, className, onAdded }: { items: OrderLine[]; className?: string; onAdded?: () => void }) {
  const convex = useConvex();
  const { toast } = useToast();
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const [busy, setBusy] = useState(false);

  const handle = async () => {
    setBusy(true);
    try {
      const docs = await convex.query(api.products.listByIds, {
        ids: items.map((i) => i.productId as Id<'products'>),
      });
      const byId = new Map(docs.map((d) => [d._id as string, d]));
      const skipped: string[] = [];
      let added = 0;
      for (const line of items) {
        const doc = byId.get(line.productId);
        if (!doc || !doc.inStock || doc.stockQty <= 0) {
          skipped.push(line.name);
          continue;
        }
        const qty = Math.min(line.qty, doc.stockQty);
        addItem(toProduct(doc), qty);
        added += 1;
        if (qty < line.qty) skipped.push(`${line.name} (only ${qty} available)`);
      }
      if (added === 0) {
        toast(`Not in stock: ${skipped.join(', ')}`, 'error');
      } else {
        toast(skipped.length ? `Added to cart. Skipped: ${skipped.join(', ')}` : 'Added to cart', skipped.length ? 'info' : 'success');
        openCart();
        onAdded?.();
      }
    } catch {
      toast('Could not add these items. Please try again.', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handle}
      disabled={busy}
      className={cn(
        'rounded-lg border border-line bg-paper px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-porcelain active:scale-[0.97] duration-100 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-petrol/40',
        className
      )}
    >
      {busy ? 'Adding…' : 'Buy again'}
    </button>
  );
}
