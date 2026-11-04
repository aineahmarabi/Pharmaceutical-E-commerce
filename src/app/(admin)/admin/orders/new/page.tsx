'use client';

import React, { useState } from 'react';
import { useAdminQuery, useAdminMutation } from '@/hooks/useAdminApi';
import { api } from '../../../../../../convex/_generated/api';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { PageHeader } from '@/components/admin/shared/PageHeader';
import { Card } from '@/components/admin/ui/Card';
import { Input, Textarea } from '@/components/admin/ui/Input';
import { Select } from '@/components/admin/ui/Select';
import { Button } from '@/components/admin/ui/Button';

export default function AddOrderPage() {
  const router = useRouter();
  const products = useAdminQuery(api.adminProducts.adminListProducts, { limit: 1000 });
  const createOrder = useAdminMutation(api.orders.createOrder);

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'cod'>('mpesa');
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid'>('pending');

  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<Array<{ id: string; name: string; price: number; qty: number; stock: number }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredProducts =
    products?.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) && p.inStock) || [];

  const addToCart = (product: NonNullable<typeof products>[number]) => {
    const existing = cart.find((c) => c.id === product._id);
    if (existing) {
      if (existing.qty < product.stockQty) {
        setCart(cart.map((c) => (c.id === product._id ? { ...c, qty: c.qty + 1 } : c)));
      }
    } else {
      setCart([...cart, { id: product._id, name: product.name, price: product.price, qty: 1, stock: product.stockQty }]);
    }
  };

  const updateQty = (id: string, delta: number) => {
    setCart(
      cart.map((c) => {
        if (c.id === id) {
          const newQty = Math.max(1, Math.min(c.qty + delta, c.stock));
          return { ...c, qty: newQty };
        }
        return c;
      })
    );
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter((c) => c.id !== id));
  };

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const deliveryFee = 250;
  const total = subtotal + (cart.length > 0 ? deliveryFee : 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0 || !customerName) return;

    setIsSubmitting(true);
    try {
      await createOrder({
        customerName,
        customerEmail,
        customerPhone,
        deliveryAddress: deliveryAddress || 'In-Store',
        paymentMethod,
        paymentStatus,
        items: cart.map((c) => ({
          productId: c.id,
          name: c.name,
          qty: c.qty,
          price: c.price,
        })),
        status: paymentStatus === 'paid' ? 'confirmed' : 'placed',
      });
      router.push('/admin/orders');
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  const qtyBtn =
    'w-8 h-8 rounded-lg flex items-center justify-center border border-p-border-input text-p-text hover:bg-p-bg active:scale-[0.97] transition';

  return (
    <div className="pb-16 max-w-6xl mx-auto">
      <PageHeader title="Create order" backUrl="/admin/orders" />

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-[2fr_1fr] gap-4 items-start">
        <div className="space-y-4 min-w-0">
          <Card title="Products">
            <div className="relative mb-3">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-p-text-disabled" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products to add"
                aria-label="Search products to add"
                className="h-9 w-full rounded-lg pl-9 pr-3 text-sm text-p-text bg-p-bg-surface border border-p-border-input focus:outline-none focus:border-p-focus focus:shadow-[0_0_0_1px_var(--color-p-focus)]"
              />
            </div>

            {search && (
              <ul className="mb-4 max-h-64 overflow-y-auto rounded-lg border border-p-border-subdued divide-y divide-p-border-subdued">
                {filteredProducts.length === 0 ? (
                  <li className="px-3 py-3 text-sm text-p-text-subdued">No in-stock products match.</li>
                ) : (
                  filteredProducts.map((p) => (
                    <li key={p._id}>
                      <button
                        type="button"
                        onClick={() => {
                          addToCart(p);
                          setSearch('');
                        }}
                        className="w-full text-left px-3 py-2.5 hover:bg-p-bg-surface-hover flex justify-between items-center gap-3"
                      >
                        <span className="text-sm font-medium text-p-text">{p.name}</span>
                        <span className="text-xs text-p-text-subdued tabular-nums whitespace-nowrap">
                          KES {p.price.toLocaleString()} · {p.stockQty} in stock
                        </span>
                      </button>
                    </li>
                  ))
                )}
              </ul>
            )}

            {cart.length === 0 ? (
              <p className="text-sm text-p-text-subdued py-6 text-center">No products added. Search above to add items.</p>
            ) : (
              <ul className="divide-y divide-p-border-subdued">
                {cart.map((item) => (
                  <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div className="min-w-0 flex-1 basis-40">
                      <p className="text-sm font-medium text-p-text">{item.name}</p>
                      <p className="text-xs text-p-text-subdued tabular-nums">KES {item.price.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" aria-label={`Decrease ${item.name}`} onClick={() => updateQty(item.id, -1)} className={qtyBtn}>
                        −
                      </button>
                      <span className="text-sm font-medium w-6 text-center tabular-nums">{item.qty}</span>
                      <button type="button" aria-label={`Increase ${item.name}`} onClick={() => updateQty(item.id, 1)} className={qtyBtn}>
                        +
                      </button>
                    </div>
                    <p className="text-sm font-medium tabular-nums text-p-text w-24 text-right">
                      KES {(item.price * item.qty).toLocaleString()}
                    </p>
                    <button type="button" onClick={() => removeFromCart(item.id)} className="text-xs text-p-critical hover:underline px-1 py-2">
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Summary">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-p-text-subdued">Subtotal</span>
                <span className="tabular-nums text-p-text">KES {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-p-text-subdued">Delivery</span>
                <span className="tabular-nums text-p-text">KES {(cart.length > 0 ? deliveryFee : 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-p-border-subdued pt-2 text-base font-semibold text-p-text">
                <span>Total</span>
                <span className="tabular-nums">KES {total.toLocaleString()}</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-4 min-w-0">
          <Card title="Customer">
            <div className="space-y-3">
              <Input label="Name" required value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Jane Wanjiku" />
              <Input label="Phone" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="0712 345 678" />
              <Input label="Email" type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="jane@example.com" />
              <Textarea
                label="Address or notes"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Delivery address or walk-in notes"
                rows={3}
              />
            </div>
          </Card>

          <Card title="Payment">
            <div className="space-y-3">
              <Select
                label="Method"
                value={paymentMethod}
                onChange={(v) => setPaymentMethod(v as 'mpesa' | 'cod')}
                options={[
                  { label: 'M-Pesa', value: 'mpesa' },
                  { label: 'Cash on delivery', value: 'cod' },
                ]}
              />
              <Select
                label="Status"
                value={paymentStatus}
                onChange={(v) => setPaymentStatus(v as 'pending' | 'paid')}
                options={[
                  { label: 'Pending', value: 'pending' },
                  { label: 'Paid', value: 'paid' },
                ]}
              />
            </div>
          </Card>

          <Button type="submit" variant="primary" className="w-full h-11" disabled={cart.length === 0 || !customerName} loading={isSubmitting}>
            Create order
          </Button>
        </div>
      </form>
    </div>
  );
}
