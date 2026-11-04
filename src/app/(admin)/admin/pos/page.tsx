'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FunctionReturnType } from 'convex/server';
import { useAdminConvex, useAdminMutation, useAdminQuery } from '@/hooks/useAdminApi';
import { Search } from 'lucide-react';
import { api } from '../../../../../convex/_generated/api';
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

type ProductRow = NonNullable<FunctionReturnType<typeof api.adminProducts.adminListProducts>>[number];

const DELIVERY_FEE = 0; // walk-in / in-store sale, no delivery

const PAYMENT_OPTIONS = [
  { value: 'cod', label: 'Cash' },
  { value: 'mpesa', label: 'M-Pesa' },
] as const;

export default function AdminPOSPage() {
  const { toast } = useAdminToast();
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartLine[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'mpesa'>('cod');
  const [customerName, setCustomerName] = useState('Walk-in customer');
  const [submitting, setSubmitting] = useState(false);

  const convex = useAdminConvex();
  const searchRef = useRef<HTMLInputElement>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [cameraSupported, setCameraSupported] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- feature detection needs window; avoids hydration mismatch
    setCameraSupported(typeof window !== 'undefined' && 'BarcodeDetector' in window && !!navigator.mediaDevices?.getUserMedia);
  }, []);

  const products = useAdminQuery(api.adminProducts.adminListProducts, { limit: 200, search: search || undefined });
  const createOrder = useAdminMutation(api.orders.createOrder);

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

  const showFlash = (msg: string) => {
    setFlash(msg);
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlash(null), 1500);
  };

  // Exact barcode / SKU match -> add straight to the sale. Returns true if handled.
  const addByCode = useCallback(
    async (raw: string): Promise<boolean> => {
      const code = raw.trim().toLowerCase();
      if (!code) return false;
      const matches = (p: ProductRow) => (p.barcode ?? '').toLowerCase() === code || (p.sku ?? '').toLowerCase() === code;
      let hit = products?.find(matches);
      if (!hit) {
        try {
          const rows = await convex.query(api.adminProducts.adminListProducts, { limit: 200, search: raw.trim() });
          hit = rows.find(matches);
        } catch {
          return false;
        }
      }
      if (!hit) return false;
      if (!hit.inStock || hit.stockQty <= 0) {
        toast(`${hit.name} is out of stock`);
      } else {
        addToCart(hit);
        showFlash(`Added ${hit.name}`);
      }
      setSearch('');
      searchRef.current?.focus();
      return true;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [products, convex],
  );

  // Camera scanning via the BarcodeDetector API (feature-detected above).
  useEffect(() => {
    if (!cameraOpen) return;
    let stream: MediaStream | null = null;
    let timer: ReturnType<typeof setInterval> | null = null;
    let stopped = false;
    (async () => {
      try {
        const Detector = (window as unknown as { BarcodeDetector: new () => { detect(v: HTMLVideoElement): Promise<{ rawValue?: string }[]> } }).BarcodeDetector;
        const detector = new Detector();
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (stopped) return stream.getTracks().forEach((t) => t.stop());
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();
        let busy = false;
        timer = setInterval(async () => {
          if (busy || stopped) return;
          busy = true;
          try {
            const found = await detector.detect(video);
            const value: string | undefined = found?.[0]?.rawValue;
            if (value && (await addByCode(value))) setCameraOpen(false);
            else if (value) showFlash('No product with that code');
          } catch {
            /* keep scanning */
          } finally {
            busy = false;
          }
        }, 400);
      } catch {
        toast('Camera not available');
        setCameraOpen(false);
      }
    })();
    return () => {
      stopped = true;
      if (timer) clearInterval(timer);
      stream?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraOpen]);

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
  const itemCount = cart.reduce((sum, l) => sum + l.qty, 0);

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
    } catch (err) {
      toast((err instanceof Error ? err.message : null) ?? 'Failed to complete sale');
    } finally {
      setSubmitting(false);
    }
  };

  const qtyBtn =
    'w-9 h-9 rounded-lg flex items-center justify-center border border-p-border-input text-p-text hover:bg-p-bg active:scale-[0.97] transition';

  return (
    <div className="pb-16 lg:h-[calc(100vh-56px)] flex flex-col">
      <div className="py-5 flex-shrink-0">
        <h1 className="text-xl font-semibold tracking-tight text-p-text">Point of sale</h1>
      </div>

      <div className="flex flex-col md:grid md:grid-cols-[1fr_340px] lg:grid-cols-[1fr_380px] gap-4 md:flex-1 md:min-h-0">
        {/* Product list */}
        <div className="bg-p-bg-surface rounded-xl border border-p-border-subdued p-4 md:overflow-y-auto admin-scroll min-h-0">
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-p-text-disabled" />
              <input
                ref={searchRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && search.trim()) {
                    e.preventDefault();
                    void addByCode(search);
                  }
                }}
                placeholder="Search or scan barcode"
                aria-label="Search products or scan barcode"
                autoFocus
                className="h-10 w-full rounded-lg pl-9 pr-3 text-sm text-p-text bg-p-bg-surface border border-p-border-input focus:outline-none focus:border-p-focus focus:shadow-[0_0_0_1px_var(--color-p-focus)]"
              />
            </div>
            {cameraSupported && (
              <Button variant="secondary" onClick={() => setCameraOpen(true)}>
                Scan with camera
              </Button>
            )}
          </div>
          <p aria-live="polite" className={`text-xs text-p-text-subdued -mt-2 mb-3 h-4 transition-opacity ${flash ? 'opacity-100' : 'opacity-0'}`}>
            {flash}
          </p>

          {inStockProducts === undefined ? (
            <p className="text-sm text-p-text-subdued text-center py-10">Loading products...</p>
          ) : inStockProducts.length === 0 ? (
            <EmptyState heading="No products available" body="No in-stock products match your search." />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {inStockProducts.map((p) => (
                <button
                  key={p._id}
                  onClick={() => addToCart(p)}
                  className="text-left bg-p-bg-surface border border-p-border-subdued rounded-lg p-3 hover:border-p-primary active:scale-[0.98] transition"
                >
                  <div className="w-full aspect-square rounded bg-p-bg mb-2 overflow-hidden">
                    {p.imageUrl && <img src={p.imageUrl} alt="" className="w-full h-full object-contain" />}
                  </div>
                  <p className="text-sm font-medium text-p-text line-clamp-2 leading-snug min-h-10">{p.name}</p>
                  <p className="text-sm font-semibold tabular-nums text-p-text mt-1">KES {p.price.toLocaleString()}</p>
                  <p className="text-xs text-p-text-subdued">{p.stockQty} in stock</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Current sale */}
        <div className="bg-p-bg-surface rounded-xl border border-p-border-subdued p-4 flex flex-col md:h-full min-h-0">
          <div className="flex items-baseline justify-between mb-3 flex-shrink-0">
            <h2 className="text-base font-semibold text-p-text">Current sale</h2>
            <span className="text-xs text-p-text-subdued tabular-nums">{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
          </div>

          <Input
            containerClassName="mb-3 flex-shrink-0"
            label="Customer"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />

          <div className="flex-1 overflow-y-auto admin-scroll min-h-24">
            {cart.length === 0 ? (
              <p className="text-sm text-p-text-subdued text-center py-8">No items yet. Tap a product to add it.</p>
            ) : (
              cart.map((line) => (
                <div key={line.productId} className="py-3 border-b border-p-border-subdued last:border-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-p-text leading-snug">{line.name}</p>
                    <p className="text-sm font-medium tabular-nums text-p-text whitespace-nowrap">KES {(line.price * line.qty).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <button aria-label={`Decrease ${line.name}`} onClick={() => updateQty(line.productId, -1)} className={qtyBtn}>
                        −
                      </button>
                      <span className="text-sm font-medium w-6 text-center tabular-nums">{line.qty}</span>
                      <button aria-label={`Increase ${line.name}`} onClick={() => updateQty(line.productId, 1)} className={qtyBtn}>
                        +
                      </button>
                    </div>
                    <button onClick={() => removeLine(line.productId)} className="text-xs text-p-critical hover:underline px-2 py-2">
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex-shrink-0 border-t border-p-border-subdued mt-3 pt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-p-text-subdued">Subtotal</span>
              <span className="tabular-nums text-p-text">KES {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold text-p-text">
              <span>Total</span>
              <span className="tabular-nums">KES {total.toLocaleString()}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1" role="radiogroup" aria-label="Payment method">
              {PAYMENT_OPTIONS.map((m) => (
                <button
                  key={m.value}
                  role="radio"
                  aria-checked={paymentMethod === m.value}
                  onClick={() => setPaymentMethod(m.value)}
                  className={`h-10 rounded-lg text-sm font-medium border transition active:scale-[0.97] ${
                    paymentMethod === m.value
                      ? 'bg-p-bg-surface-selected text-p-primary border-p-primary'
                      : 'border-p-border-input text-p-text hover:bg-p-bg'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <Button variant="primary" className="w-full h-11 mt-2" disabled={cart.length === 0} loading={submitting} onClick={handleCharge}>
              Complete sale
            </Button>
          </div>
        </div>
      </div>

      {cameraOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Scan barcode">
          <div className="bg-p-bg-surface rounded-xl border border-p-border-subdued p-4 w-full max-w-md space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-p-text">Scan barcode</h2>
              <Button variant="plain" onClick={() => { setCameraOpen(false); searchRef.current?.focus(); }}>Close</Button>
            </div>
            <video ref={videoRef} muted playsInline className="w-full aspect-video rounded-lg bg-p-bg object-cover" />
            <p className="text-xs text-p-text-subdued">Hold the barcode in view. The product is added automatically.</p>
          </div>
        </div>
      )}
    </div>
  );
}
