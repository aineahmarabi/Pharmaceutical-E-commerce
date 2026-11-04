'use client';

import { usePharmacyDetails } from '@/components/layout/PharmacyDetails';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ProductImagePlaceholder } from '@/components/ui/ProductImagePlaceholder';
import { ClassBadge } from '@/components/ui/ClassBadge';
import { Select } from '@/components/ui/Select';
import { useCartStore } from '@/store/cart';
import { useDeliveryZoneStore } from '@/store/delivery';
import { useToast } from '@/components/ui/Toast';
import { useBranding } from '@/hooks/useBranding';
import { useCustomerAuth } from '@/lib/auth/customerAuth';
import { useQuery, useMutation, useAction } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { cn, formatPrice } from '@/lib/utils';
import { PayOnlineMarks } from '@/components/ui/PaymentMarks';
import { CopyOrderNumber } from '@/components/ui/CopyOrderNumber';
import { rememberDeviceOrder } from '@/lib/deviceOrders';

type Fulfillment = 'delivery' | 'pickup';
type PaymentMethod = 'paystack' | 'mpesa' | 'cod';
type FormKey = 'name' | 'phone' | 'email' | 'address' | 'city' | 'notes';

const EMAIL_RE = /^\S+@\S+\.\S+$/;
const PHONE_RE = /^[0-9+()\s-]{7,}$/;

/**
 * Payment options. The wording here is a placeholder until the client decides how
 * payment is collected (M-PESA STK push, paybill/till, or confirmed by phone). Change
 * the text here and nowhere else; the page and the order itself do not need to change.
 */
const PAYMENT_METHODS: Record<PaymentMethod, { label: (f: Fulfillment) => string; sub: (f: Fulfillment) => string; note: (f: Fulfillment) => string }> = {
  paystack: {
    label: () => 'Pay online',
    sub: () => 'M-PESA, Airtel Money or card, secured by Paystack',
    note: () => 'You will be taken to Paystack to pay securely. We hold your items for 30 minutes while you pay.',
  },
  mpesa: {
    label: () => 'M-PESA',
    sub: () => 'Pay with M-PESA',
    note: () => 'Payment details are confirmed with you after you place the order. Nothing is charged on this page.',
  },
  cod: {
    label: () => 'Pay on delivery',
    sub: (f) => (f === 'pickup' ? 'Pay when you collect' : 'Pay when your order arrives'),
    note: (f) => (f === 'pickup' ? 'Pay in cash or M-PESA at the store when you collect your order.' : 'Please have the amount ready.'),
  },
};

const inputBase =
  'w-full bg-paper border rounded-lg px-3.5 py-3 text-sm text-ink placeholder:text-muted-fg focus:outline-none focus:ring-2 focus:ring-petrol/40 transition-colors';

function Section({ step, title, done, children }: { step: number; title: string; done: boolean; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-line bg-paper" aria-labelledby={`co-sec-${step}`}>
      <header className="flex items-center gap-3 border-b border-line px-5 py-4 sm:px-6">
        <span
          aria-hidden="true"
          className={cn(
            'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm font-semibold tabular-nums transition-colors',
            done ? 'border-petrol bg-petrol text-white' : 'border-line text-muted-fg',
          )}
        >
          {done ? '✓' : step}
        </span>
        <h2 id={`co-sec-${step}`} className="text-base font-semibold tracking-tight text-ink sm:text-lg">{title}</h2>
      </header>
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

function ChoiceCard({
  checked, onSelect, name, label, sub, value, extra,
}: { checked: boolean; onSelect: () => void; name: string; label: string; sub: string; value: string; extra?: React.ReactNode }) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-petrol/40',
        checked ? 'border-petrol bg-petrol-50' : 'border-line hover:border-ink/40',
      )}
    >
      <input type="radio" name={name} value={value} checked={checked} onChange={onSelect} className="mt-1 accent-petrol" />
      <span>
        <span className="block text-sm font-semibold text-ink">{label}</span>
        {sub && <span className="mt-0.5 block text-sm text-muted-fg">{sub}</span>}
        {extra}
      </span>
    </label>
  );
}

function PlacedOrderNumber({ orderId, phone }: { orderId: string; phone: string }) {
  const found = useQuery(api.orders.trackOnDevice, { refs: [{ orderId, phone }] });
  const number = found?.[0]?.orderNumber;
  if (!number) return null;
  return (
    <p className="mt-3 text-sm text-muted-fg">
      Order number <CopyOrderNumber value={number} className="text-base" />
    </p>
  );
}

function SaveDetailsPanel({ name, email, phone }: { name: string; email: string; phone: string }) {
  const { signup, token, isAuthenticated } = useCustomerAuth();
  const updateProfile = useMutation(api.customerAuth.updateProfile);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState(false);
  const phoneSaved = React.useRef(false);

  // The phone isn't part of signup, so save it to the new profile once the session token is in place.
  useEffect(() => {
    if (!created || !token || phoneSaved.current) return;
    phoneSaved.current = true;
    updateProfile({ token, name, phone }).catch(() => {});
  }, [created, token, name, phone, updateProfile]);

  if (created || isAuthenticated) {
    return (
      <div className="rounded-xl border border-line bg-paper p-5 text-left sm:p-6">
        <p className="font-semibold text-ink">Details saved</p>
        <Link href="/account" className="mt-2 inline-block text-sm font-medium text-petrol hover:underline">Go to my account</Link>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const res = await signup(name, email, password);
      if (res.success) setCreated(true);
      else setError(res.error ?? 'Could not create your account.');
    } catch {
      setError('Could not create your account. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3 rounded-xl border border-line bg-paper p-5 text-left sm:p-6">
      <div>
        <h2 className="font-semibold tracking-tight text-ink">Save your details for next time</h2>
        <p className="mt-0.5 text-sm text-muted-fg">{name} · {email}</p>
      </div>
      <div>
        <label htmlFor="save-pw" className="mb-1.5 block text-sm font-medium text-ink">Choose a password</label>
        <input
          id="save-pw"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          required
          autoComplete="new-password"
          placeholder="At least 8 characters"
          aria-invalid={!!error}
          className={cn(inputBase, error ? 'border-signal' : 'border-line focus:border-petrol')}
        />
        {error && <p className="mt-1 text-xs text-signal" role="alert">{error}</p>}
      </div>
      <button
        type="submit"
        disabled={busy || password.length < 8}
        className="w-full rounded-lg bg-petrol py-3 text-sm font-semibold text-white transition-colors duration-100 hover:bg-petrol-700 active:scale-[0.97] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-petrol/40 focus-visible:ring-offset-2"
      >
        {busy ? 'Saving…' : 'Create account'}
      </button>
    </form>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const { toast } = useToast();
  const { customer, token: customerToken } = useCustomerAuth();
  const storeBranding = useBranding();
  const { licence } = usePharmacyDetails();
  const zones = useQuery(api.delivery.listZones);
  const createOrder = useMutation(api.orders.placeOrder);
  const paystackReady = useQuery(api.paystack.isConfigured) ?? false;
  const startPayment = useAction(api.paystack.startPayment);
  const { zoneId: rememberedZoneId, setZone: rememberZone } = useDeliveryZoneStore();

  const [placing, setPlacing] = useState(false);
  const [fulfillment, setFulfillment] = useState<Fulfillment>('delivery');
  const [selectedZoneId, setSelectedZoneId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('paystack');
  const [touched, setTouched] = useState<Partial<Record<FormKey | 'zone', boolean>>>({});
  const [attempted, setAttempted] = useState(false);
  const [urgent, setUrgent] = useState(false);
  const [placedGuest, setPlacedGuest] = useState<{ name: string; email: string; phone: string; orderId: string } | null>(null);
  // Online payment appears once Paystack is set up; until then the manual M-PESA option stays.
  const methods: PaymentMethod[] = paystackReady ? ['paystack', 'cod'] : ['mpesa', 'cod'];
  const method: PaymentMethod = methods.includes(paymentMethod) ? paymentMethod : methods[0];

  // Pick up whatever delivery area the customer already chose, re-validated against the
  // live zone list so a deleted or renamed zone can't stick.
  useEffect(() => {
    if (!zones || selectedZoneId || !rememberedZoneId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncs remembered zone from external store once zones load
    if (zones.some((z) => z._id === rememberedZoneId)) setSelectedZoneId(rememberedZoneId);
  }, [zones, rememberedZoneId, selectedZoneId]);

  const handleZoneChange = (id: string) => {
    setSelectedZoneId(id);
    setTouched((t) => ({ ...t, zone: true }));
    const zone = zones?.find((z) => z._id === id);
    if (zone) rememberZone(zone._id, zone.name);
  };

  const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const selectedZone = zones?.find((z) => z._id === selectedZoneId);
  // The delivery cost is only known once an area is picked; showing a fee before that
  // would imply a quote that doesn't exist yet.
  const deliveryFee = fulfillment === 'pickup' ? 0 : selectedZone ? selectedZone.price : undefined;
  const total = subtotal + (deliveryFee ?? 0);

  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', city: '', notes: '' });
  const update = (k: FormKey) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((prev) => ({ ...prev, [k]: e.target.value }));
  const blur = (k: FormKey) => () => setTouched((t) => ({ ...t, [k]: true }));

  // Prefill from a signed-in customer's saved profile. Accounts are optional, so guests just leave this blank.
  useEffect(() => {
    if (!customer) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- prefill form from signed-in customer profile
    setForm((prev) => ({
      ...prev,
      name: prev.name || customer.name,
      email: prev.email || customer.email,
      phone: prev.phone || customer.phone,
    }));
  }, [customer]);

  const errors: Partial<Record<FormKey | 'zone', string>> = {};
  if (!form.name.trim()) errors.name = 'Full name is required.';
  if (!form.phone.trim()) errors.phone = 'Phone number is required.';
  else if (!PHONE_RE.test(form.phone.trim())) errors.phone = 'Enter a valid phone number.';
  if (!form.email.trim()) errors.email = 'Email address is required.';
  else if (!EMAIL_RE.test(form.email.trim())) errors.email = 'Enter a valid email address.';
  if (fulfillment === 'delivery') {
    if (!form.address.trim()) errors.address = 'Street address is required.';
    if (!form.city.trim()) errors.city = 'City / town is required.';
    if (!selectedZoneId) errors.zone = 'Select a delivery area.';
  }
  const errorKeys = Object.keys(errors) as (FormKey | 'zone')[];
  const isValid = errorKeys.length === 0;
  const showErr = (k: FormKey | 'zone') => (touched[k] || attempted ? errors[k] : undefined);

  const contactDone = !errors.name && !errors.phone && !errors.email;
  const deliveryDone = fulfillment === 'pickup' || (!errors.address && !errors.city && !errors.zone);

  const handlePlace = async () => {
    setAttempted(true);
    if (!isValid || (fulfillment === 'delivery' && !selectedZone)) {
      toast(errors[errorKeys[0]] ?? 'Please complete your details', 'error');
      // Bring the first problem into view; the area picker is a custom control, so focus its wrapper's button.
      const first = errorKeys[0] ?? 'zone';
      const el = document.getElementById(first === 'zone' ? 'co-zone' : `co-${first}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      (el?.querySelector('button') ?? el)?.focus({ preventScroll: true });
      return;
    }
    if (items.length === 0) {
      toast('Your cart is empty', 'error');
      return;
    }

    setPlacing(true);
    try {
      const orderId = await createOrder({
        customerToken: customerToken ?? undefined,
        customerName: form.name.trim(),
        customerPhone: form.phone.trim(),
        customerEmail: form.email.trim(),
        items: items.map((i) => ({ productId: i.product.id, qty: i.quantity })),
        ...(fulfillment === 'delivery' ? { deliveryZoneId: selectedZone!._id } : { pickup: true }),
        paymentMethod: method,
        deliveryAddress: fulfillment === 'delivery'
          ? `${form.address.trim()}, ${form.city.trim()}, ${selectedZone!.name}`
          : `Pickup from store — ${storeBranding.address}`,
        notes: form.notes.trim() || undefined,
        urgent: urgent || undefined,
      });

      rememberDeviceOrder(orderId, form.phone.trim());

      if (method === 'paystack') {
        // The order exists and its stock is held. The cart is kept until the payment is confirmed, so nothing
        // disappears while the customer is handed over to Paystack (or if they come back without paying).
        try {
          sessionStorage.setItem('pc-pending-payment', JSON.stringify({ orderId, phone: form.phone.trim() }));
        } catch {
          // Private browsing: the return page still verifies by reference; only the retry button is lost.
        }
        try {
          const { url } = await startPayment({
            orderId,
            phone: form.phone.trim(),
            callbackUrl: `${window.location.origin}/checkout/complete`,
          });
          window.location.assign(url); // leave the button busy while the browser changes page
          return;
        } catch (err) {
          toast(err instanceof Error ? err.message : 'Could not start the payment.', 'error');
          router.push('/checkout/complete');
          return;
        }
      }

      clearCart();
      toast('Order placed successfully!', 'success');
      if (customer) {
        router.push('/account/orders');
      } else {
        setPlacedGuest({ name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), orderId });
        setPlacing(false);
      }
    } catch (err) {
      console.error(err);
      toast(err instanceof Error ? err.message : 'Failed to place order', 'error');
      setPlacing(false);
    }
  };

  if (placedGuest) return (
    <div className="px-4 py-12">
      <div className="mx-auto max-w-md space-y-4">
        <div className="rounded-xl border border-line bg-paper p-6 text-center sm:p-8">
          <p className="text-lg font-semibold text-ink">Order placed</p>
          <PlacedOrderNumber orderId={placedGuest.orderId} phone={placedGuest.phone} />
          <p className="mt-1 text-sm text-muted-fg">We will contact you on {placedGuest.phone || placedGuest.email} to confirm.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link href="/products" className="rounded-lg bg-petrol px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-petrol-700">Continue shopping</Link>
            <Link href="/account/orders" className="rounded-lg border border-line bg-paper px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-porcelain">Track order</Link>
          </div>
        </div>
        <SaveDetailsPanel name={placedGuest.name} email={placedGuest.email} phone={placedGuest.phone} />
      </div>
    </div>
  );

  if (items.length === 0) return (
    <div className="px-4 py-12">
      <div className="mx-auto max-w-md rounded-xl border border-line bg-paper p-8 text-center">
        <p className="text-lg font-semibold text-ink">Your cart is empty</p>
        <Link href="/products" className="mt-5 inline-block rounded-lg bg-petrol px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-petrol-700">Continue shopping</Link>
      </div>
    </div>
  );

  const rxItems = items.filter((i) => i.product.classification === 'POM');
  const payment = PAYMENT_METHODS[method];

  const textField = (k: FormKey, label: string, type: string, placeholder: string, autoComplete: string, wide = false) => {
    const err = showErr(k);
    return (
      <div className={wide ? 'sm:col-span-2' : ''}>
        <label htmlFor={`co-${k}`} className="mb-1.5 block text-sm font-medium text-ink">{label}</label>
        <input
          id={`co-${k}`}
          type={type}
          value={form[k]}
          onChange={update(k)}
          onBlur={blur(k)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={!!err}
          aria-describedby={err ? `co-${k}-err` : undefined}
          className={cn(inputBase, err ? 'border-signal' : 'border-line focus:border-petrol')}
        />
        {err && <p id={`co-${k}-err`} className="mt-1 text-xs text-signal">{err}</p>}
      </div>
    );
  };

  const placeLabel = placing ? 'Placing order…' : `Place order · ${formatPrice(total)}`;
  const placeBtn =
    'w-full rounded-lg bg-petrol py-3.5 text-sm font-semibold text-white transition-colors duration-100 hover:bg-petrol-700 active:scale-[0.97] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-petrol/40 focus-visible:ring-offset-2';

  return (
    <div className="mx-auto max-w-6xl px-4 pb-32 pt-6 sm:px-6 lg:px-8 lg:pb-12 lg:pt-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Checkout</h1>
        <ol className="flex items-center gap-2 text-sm text-muted-fg" aria-label="Checkout progress">
          {[
            { label: 'Contact', done: contactDone },
            { label: 'Delivery', done: deliveryDone },
            { label: 'Payment', done: true },
          ].map((s, i, arr) => (
            <li key={s.label} className="flex items-center gap-2">
              <span className={cn('tabular-nums', s.done ? 'font-medium text-ink' : '')}>{s.done ? '✓' : i + 1} {s.label}</span>
              {i < arr.length - 1 && <span aria-hidden className="text-line">/</span>}
            </li>
          ))}
        </ol>
      </div>

      <div className="space-y-6 lg:grid lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start lg:gap-8 lg:space-y-0">
        <div className="min-w-0 space-y-5">
          <Section step={1} title="Contact" done={contactDone}>
            <div className="grid gap-4 sm:grid-cols-2">
              {textField('name', 'Full name', 'text', 'First name Last name', 'name', true)}
              {textField('phone', 'Phone number', 'tel', '0712 345 678', 'tel')}
              {textField('email', 'Email address', 'email', 'name@example.com', 'email')}
            </div>
            {!customer && (
              <p className="mt-4 text-sm text-muted-fg">
                Have an account? <Link href="/account/login" className="font-medium text-petrol hover:underline underline-offset-2">Log in</Link> to fill this in for you.
              </p>
            )}
          </Section>

          <Section step={2} title="Delivery" done={deliveryDone}>
            <fieldset className="mb-5">
              <legend className="sr-only">How would you like to receive your order?</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                <ChoiceCard name="fulfillment" value="delivery" checked={fulfillment === 'delivery'} onSelect={() => setFulfillment('delivery')} label="Delivery" sub="To your address" />
                <ChoiceCard name="fulfillment" value="pickup" checked={fulfillment === 'pickup'} onSelect={() => setFulfillment('pickup')} label="Pickup" sub="Collect from the store, free" />
              </div>
            </fieldset>

            {fulfillment === 'delivery' ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {textField('address', 'Street address', 'text', '14 Ngong Road', 'street-address', true)}
                {textField('city', 'City / town', 'text', 'Nairobi', 'address-level2')}
                <div id="co-zone">
                  <label className="mb-1.5 block text-sm font-medium text-ink">Area</label>
                  <Select
                    value={selectedZoneId}
                    onChange={handleZoneChange}
                    placeholder="Select your area"
                    options={(zones ?? []).map((z) => ({ value: z._id, label: `${z.name} (KES ${z.price})` }))}
                    buttonClassName={cn('bg-paper', showErr('zone') && 'border-signal')}
                  />
                  {showErr('zone') && <p className="mt-1 text-xs text-signal">{errors.zone}</p>}
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-line bg-porcelain p-4 text-sm">
                <p className="font-semibold text-ink">Pickup address</p>
                <p className="mt-0.5 text-muted-fg">{storeBranding.address}</p>
                {storeBranding.mapLink && (
                  <a href={storeBranding.mapLink} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block font-medium text-petrol hover:underline">
                    Directions
                  </a>
                )}
              </div>
            )}

            <div className="mt-4">
              <label htmlFor="co-notes" className="mb-1.5 block text-sm font-medium text-ink">Notes <span className="font-normal text-muted-fg">(optional)</span></label>
              <textarea
                id="co-notes"
                value={form.notes}
                onChange={update('notes')}
                rows={2}
                placeholder="Landmark, gate code…"
                className={cn(inputBase, 'resize-none border-line focus:border-petrol')}
              />
            </div>

            <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-lg border border-line p-3 has-[:checked]:border-signal has-[:checked]:bg-signal/5">
              <input type="checkbox" checked={urgent} onChange={(e) => setUrgent(e.target.checked)} className="mt-1 accent-signal" />
              <span>
                <span className="block text-sm font-semibold text-signal">Needed urgently</span>
                <span className="block text-sm text-muted-fg">We will flag your order so the pharmacy handles it first.</span>
              </span>
            </label>
          </Section>

          <Section step={3} title="Payment" done>
            <fieldset>
              <legend className="sr-only">Payment method</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {methods.map((id) => (
                  <ChoiceCard
                    key={id}
                    name="payment"
                    value={id}
                    checked={method === id}
                    onSelect={() => setPaymentMethod(id)}
                    label={PAYMENT_METHODS[id].label(fulfillment)}
                    sub={PAYMENT_METHODS[id].sub(fulfillment)}
                    extra={id === 'paystack' ? <PayOnlineMarks /> : undefined}
                  />
                ))}
              </div>
            </fieldset>
            <p className="mt-4 rounded-lg border border-line bg-porcelain px-4 py-3 text-sm text-muted-fg" aria-live="polite">
              {payment.note(fulfillment)}
            </p>
          </Section>

          {rxItems.length > 0 && (
            <div className="rounded-xl border border-line bg-paper p-4 text-sm" role="note">
              <p className="text-ink">
                <span className="font-semibold">Prescription required</span> for {rxItems.map((i) => i.product.name).join(', ')}.
                {' '}A pharmacist checks it before your order is dispatched.
              </p>
            </div>
          )}
        </div>

        {/* Summary: stays put while the form scrolls on larger screens. */}
        <aside className="lg:sticky lg:top-6 lg:self-start" aria-label="Order summary">
          <div className="rounded-xl border border-line bg-paper">
            <div className="flex items-baseline justify-between border-b border-line px-5 py-4 sm:px-6">
              <h2 className="text-base font-semibold tracking-tight text-ink sm:text-lg">Order summary</h2>
              <Link href="/cart" className="text-sm font-medium text-petrol hover:underline">Edit</Link>
            </div>

            <ul className="max-h-64 divide-y divide-line overflow-y-auto px-5 sm:px-6">
              {items.map((item) => (
                <li key={item.product.id} className="flex items-center gap-3 py-3">
                  <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-line bg-white">
                    <ProductImagePlaceholder className="h-full w-full" aspectRatio="aspect-square" size="sm" name={item.product.name} categorySlug={item.product.categorySlug} imageUrl={item.product.imageUrl} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm font-medium text-ink">{item.product.name}</p>
                    <p className="flex items-center gap-2 text-xs text-muted-fg">
                      Qty {item.quantity}
                      {item.product.classification !== 'OTC' && <ClassBadge classification={item.product.classification} />}
                    </p>
                  </div>
                  <span className="text-sm font-medium tabular-nums text-ink">{formatPrice(item.product.price * item.quantity)}</span>
                </li>
              ))}
            </ul>

            <div className="border-t border-line px-5 py-4 sm:px-6">
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-fg">Subtotal</dt>
                  <dd className="font-medium tabular-nums text-ink">{formatPrice(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-fg">{fulfillment === 'pickup' ? 'Pickup' : 'Delivery'}</dt>
                  <dd className="font-medium tabular-nums text-ink">
                    {deliveryFee === undefined
                      ? <span className="font-normal text-muted-fg">Select an area</span>
                      : fulfillment === 'pickup' ? 'Free' : formatPrice(deliveryFee)}
                  </dd>
                </div>
              </dl>
              <div className="mt-4 flex items-baseline justify-between border-t border-line pt-4">
                <span className="font-semibold text-ink">Total</span>
                <span className="text-2xl font-semibold tracking-tight tabular-nums text-ink">{formatPrice(total)}</span>
              </div>

              {attempted && !isValid && (
                <p className="mt-4 text-sm text-signal" role="alert">Fix the highlighted fields.</p>
              )}

              <button onClick={handlePlace} disabled={placing} className={cn(placeBtn, 'mt-5 hidden lg:block')}>
                {placeLabel}
              </button>
              <p className="mt-3 hidden text-center text-xs text-muted-fg lg:block">
                PPB-licensed pharmacy{licence ? `, No. ${licence}` : ''}. Genuine products. No hidden fees.
              </p>
            </div>
          </div>
        </aside>
      </div>

      {/* Phones and tablets: the total and the main action stay in reach at the bottom. */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center gap-4">
          <div className="min-w-0">
            <p className="text-xs text-muted-fg">Total</p>
            <p className="text-lg font-semibold tabular-nums leading-tight text-ink">{formatPrice(total)}</p>
          </div>
          <button onClick={handlePlace} disabled={placing} className={cn(placeBtn, 'flex-1')}>
            {placing ? 'Placing order…' : 'Place order'}
          </button>
        </div>
      </div>
    </div>
  );
}
