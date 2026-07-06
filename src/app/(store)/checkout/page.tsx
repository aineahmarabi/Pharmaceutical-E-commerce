'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Shield, CheckCircle } from 'lucide-react';
import { ProductImagePlaceholder } from '@/components/ui/ProductImagePlaceholder';
import { useCartStore } from '@/store/cart';
import { useToast } from '@/components/ui/Toast';
import { branding } from '@/lib/config/branding';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';

const ease = [0.16, 1, 0.3, 1] as const;

const steps = ['Delivery', 'Payment', 'Review'] as const;
type Step = typeof steps[number];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCartStore();
  const { toast } = useToast();
  const zones = useQuery(api.delivery.listZones);
  const createOrder = useMutation(api.orders.createOrder);

  const [step, setStep] = useState<Step>('Delivery');
  const [placing, setPlacing] = useState(false);
  const [selectedZoneId, setSelectedZoneId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'card' | 'cod'>('mpesa');

  const selectedZone = zones?.find(z => z._id === selectedZoneId);
  const baseDeliveryFee = selectedZone ? selectedZone.price : 0;
  const deliveryFee = subtotal >= branding.deliveryThreshold ? 0 : baseDeliveryFee;
  const total = subtotal + deliveryFee;

  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', notes: '' });
  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm(prev => ({ ...prev, [k]: e.target.value }));

  const handlePlace = async () => {
    if (!selectedZone) {
      toast('Please select a delivery zone', 'error');
      setStep('Delivery');
      return;
    }

    setPlacing(true);
    try {
      await createOrder({
        customerName: form.name,
        customerPhone: form.phone,
        customerEmail: form.email,
        items: items.map(i => ({
          productId: i.product.id,
          name: i.product.name,
          qty: i.quantity,
          price: i.product.price
        })),
        deliveryFee,
        paymentMethod,
        deliveryAddress: `${form.address}, ${selectedZone.name}`,
        channel: 'storefront'
      });
      
      clearCart();
      toast('Order placed successfully!', 'success');
      router.push('/account/orders');
    } catch (err) {
      console.error(err);
      toast('Failed to place order', 'error');
      setPlacing(false);
    }
  };

  const stepIdx = steps.indexOf(step);

  if (items.length === 0) return (
    <div className="min-h-screen bg-porcelain flex items-center justify-center flex-col gap-4">
      <p className="text-ink font-semibold">Your cart is empty.</p>
      <Link href="/products" className="text-petrol text-sm hover:underline">Continue shopping</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-porcelain py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="font-display font-bold text-2xl text-ink mb-6 tracking-tight">Checkout</h1>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <React.Fragment key={s}>
              <button
                onClick={() => i < stepIdx && setStep(s)}
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${i <= stepIdx ? 'text-petrol' : 'text-petrol-300'}`}
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold border-2 transition-colors ${i < stepIdx ? 'bg-petrol border-petrol text-paper' : i === stepIdx ? 'border-petrol text-petrol' : 'border-line text-petrol-300'}`}>
                  {i < stepIdx ? <CheckCircle size={12} className="text-paper" /> : i + 1}
                </span>
                {s}
              </button>
              {i < steps.length - 1 && <ChevronRight size={14} className="text-line" />}
            </React.Fragment>
          ))}
        </div>

        <div className="lg:grid lg:grid-cols-[3fr_2fr] lg:gap-8">
          {/* Main form area */}
          <div>
            <AnimatePresence mode="wait">
              {step === 'Delivery' && (
                <motion.div
                  key="delivery"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25, ease }}
                  className="bg-paper rounded-2xl border border-line p-6"
                >
                  <h2 className="font-display font-bold text-lg text-ink mb-5">Delivery details</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      { key: 'name', label: 'Full name', type: 'text', placeholder: 'Jane Mwangi', span: 2 },
                      { key: 'phone', label: 'Phone number', type: 'tel', placeholder: '0712 345 678', span: 1 },
                      { key: 'email', label: 'Email address', type: 'email', placeholder: 'jane@example.com', span: 1 },
                      { key: 'address', label: 'Street address', type: 'text', placeholder: '14 Ngong Road', span: 2 },
                      { key: 'city', label: 'City / Town', type: 'text', placeholder: 'Nairobi', span: 1 },
                    ].map(({ key, label, type, placeholder, span }) => (
                      <div key={key} className={span === 2 ? 'sm:col-span-2' : ''}>
                        <label className="block text-xs font-medium text-petrol-300 mb-1.5">{label}</label>
                        <input
                          type={type}
                          value={form[key as keyof typeof form]}
                          onChange={update(key as keyof typeof form)}
                          placeholder={placeholder}
                          className="w-full bg-porcelain border border-line rounded-xl px-3.5 py-2.5 text-sm text-ink placeholder:text-petrol-300/50 focus:outline-none focus:border-petrol transition-colors"
                        />
                      </div>
                    ))}

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-petrol-300 mb-1.5">Delivery Area / Zone <span className="text-red-500">*</span></label>
                      <select
                        value={selectedZoneId}
                        onChange={(e) => setSelectedZoneId(e.target.value)}
                        className="w-full bg-porcelain border border-line rounded-xl px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-petrol transition-colors"
                      >
                        <option value="" disabled>Select your delivery area</option>
                        {zones?.map(z => (
                          <option key={z._id} value={z._id}>{z.name} (KES {z.price})</option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-petrol-300 mb-1.5">Order notes (optional)</label>
                      <textarea
                        value={form.notes}
                        onChange={update('notes')}
                        rows={2}
                        placeholder="Special delivery instructions..."
                        className="w-full bg-porcelain border border-line rounded-xl px-3.5 py-2.5 text-sm text-ink placeholder:text-petrol-300/50 focus:outline-none focus:border-petrol transition-colors resize-none"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => setStep('Payment')}
                    className="mt-5 w-full bg-petrol hover:bg-petrol-700 text-paper font-semibold py-3.5 rounded-xl transition-all hover:-translate-y-0.5"
                  >
                    Continue to payment
                  </button>
                </motion.div>
              )}

              {step === 'Payment' && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25, ease }}
                  className="bg-paper rounded-2xl border border-line p-6"
                >
                  <h2 className="font-display font-bold text-lg text-ink mb-5">Payment method</h2>
                  <div className="space-y-3">
                    {[
                      { id: 'mpesa', label: 'M-PESA', sub: 'Pay via STK push to your Safaricom number' },
                      { id: 'card', label: 'Card', sub: 'Visa, Mastercard — secured by Stripe' },
                      { id: 'cod', label: 'Cash on delivery', sub: 'Pay when your order arrives' },
                    ].map(({ id, label, sub }) => (
                      <label key={id} className="flex items-start gap-3 p-4 rounded-xl border-2 border-line hover:border-petrol cursor-pointer transition-colors has-[:checked]:border-petrol has-[:checked]:bg-petrol-50">
                        <input type="radio" name="payment" value={id} checked={paymentMethod === id} onChange={() => setPaymentMethod(id as any)} className="mt-0.5 accent-petrol" />
                        <div>
                          <p className="font-semibold text-sm text-ink">{label}</p>
                          <p className="text-xs text-petrol-300 mt-0.5">{sub}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                  <button
                    onClick={() => setStep('Review')}
                    className="mt-5 w-full bg-petrol hover:bg-petrol-700 text-paper font-semibold py-3.5 rounded-xl transition-all hover:-translate-y-0.5"
                  >
                    Review order
                  </button>
                </motion.div>
              )}

              {step === 'Review' && (
                <motion.div
                  key="review"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25, ease }}
                  className="bg-paper rounded-2xl border border-line p-6"
                >
                  <h2 className="font-display font-bold text-lg text-ink mb-5">Review your order</h2>
                  <div className="space-y-3 mb-5">
                    {items.map((item) => (
                      <div key={item.product.id} className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                          <ProductImagePlaceholder className="w-14 h-14" size="sm" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-ink line-clamp-1">{item.product.name}</p>
                          <p className="text-xs text-petrol-300">Qty: {item.quantity}</p>
                        </div>
                        <span className="font-mono text-sm text-ink font-semibold">KES {(item.product.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 bg-petrol-50 rounded-xl text-sm space-y-1 mb-5">
                    <p className="font-medium text-ink">{form.name || 'No name'}</p>
                    <p className="text-petrol-300">{form.address}{selectedZone ? `, ${selectedZone.name}` : ''}</p>
                    <p className="text-petrol-300">{form.phone}</p>
                  </div>
                  <button
                    onClick={handlePlace}
                    disabled={placing}
                    className="w-full bg-signal hover:bg-signal/90 disabled:opacity-70 text-paper font-semibold py-3.5 rounded-xl transition-all hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    {placing ? (
                      <span className="w-5 h-5 border-2 border-paper/30 border-t-paper rounded-full animate-spin" />
                    ) : (
                      <>Place order · <span className="font-mono">KES {total.toLocaleString()}</span></>
                    )}
                  </button>
                  <div className="flex items-center justify-center gap-2 mt-3 text-xs text-petrol-300">
                    <Shield size={11} />
                    <span>256-bit SSL encrypted</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Summary sidebar */}
          <div className="mt-6 lg:mt-0">
            <div className="bg-paper rounded-2xl border border-line p-5 sticky top-24">
              <h3 className="font-semibold text-ink mb-4">Order summary</h3>
              <div className="space-y-2 text-sm mb-3">
                {items.map((item) => (
                  <div key={item.product.id} className="flex justify-between">
                    <span className="text-petrol-300 truncate mr-2">{item.product.name} ×{item.quantity}</span>
                    <span className="font-mono font-medium text-ink flex-shrink-0">KES {(item.product.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <hr className="border-line my-3" />
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-petrol-300">Subtotal</span>
                  <span className="font-mono font-medium text-ink">KES {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-petrol-300">Delivery</span>
                  <span className={`font-mono font-medium ${deliveryFee === 0 ? 'text-success' : 'text-ink'}`}>{deliveryFee === 0 ? 'FREE' : `KES ${deliveryFee}`}</span>
                </div>
              </div>
              <hr className="border-line my-3" />
              <div className="flex justify-between items-baseline">
                <span className="font-semibold text-ink">Total</span>
                <span className="font-mono font-bold text-xl text-ink">KES {total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
