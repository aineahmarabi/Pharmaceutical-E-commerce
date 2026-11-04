'use client';

import React, { useState } from 'react';
import { Navigation } from 'lucide-react';
import { useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useToast } from '@/components/ui/Toast';
import { useBranding } from '@/hooks/useBranding';
import { PageHeader } from '@/components/layout/LegalPage';

const inputCls =
  'w-full bg-paper border border-line rounded-lg px-3.5 py-2.5 text-sm text-ink placeholder:text-muted-fg focus:outline-none focus:border-petrol focus:ring-2 focus:ring-petrol/40 transition-colors';

export default function ContactPage() {
  const branding = useBranding();
  const { toast } = useToast();
  const submitMessage = useMutation(api.messages.submitContactMessage);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSubmitting(true);
    try {
      await submitMessage(form);
      toast('Message sent! We\'ll get back to you within 24 hours.', 'success');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      const m = String((err as { message?: string })?.message ?? '');
      const hit = m.match(/Uncaught Error: ([^\n]+)/);
      toast(hit ? hit[1].trim() : 'Failed to send message. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const waDigits = branding.whatsapp.replace(/[^0-9]/g, '');
  const email = branding.email || 'info@pharmacare.co.ke';
  const channels = [
    { label: 'Phone', value: branding.phone, sub: 'Mon–Sat 7am–9pm', href: `tel:${branding.phone.replace(/\s+/g, '')}` },
    { label: 'WhatsApp', value: branding.whatsapp, sub: 'Quick replies during business hours', href: `https://wa.me/${waDigits}` },
    { label: 'Email', value: email, sub: 'Reply within 24 hours', href: `mailto:${email}` },
  ];
  // Google's unauthenticated embed trick: appending output=embed to a maps.google.com
  // URL (share link, place link, or plain ?q= search) makes it iframe-able with no API key.
  const mapEmbedSrc = branding.mapLink
    ? `${branding.mapLink}${branding.mapLink.includes('?') ? '&' : '?'}output=embed`
    : `https://maps.google.com/?q=${encodeURIComponent(branding.address)}&output=embed`;
  // No origin param — Google Maps resolves it to the visitor's current location
  // and starts turn-by-turn directions straight to the store.
  const directionsFromMeHref = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(branding.address)}`;

  return (
    <div className="min-h-screen bg-porcelain py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <PageHeader crumb="Contact us" title="Contact us" />

        <div className="lg:grid lg:grid-cols-[2fr_3fr] lg:gap-4 lg:items-start space-y-4 lg:space-y-0">
          <div className="space-y-4">
            <section className="bg-paper border border-line rounded-xl divide-y divide-line">
              {channels.map((c) => (
                <a
                  key={c.label}
                  href={c.href}
                  className="block p-4 sm:px-6 hover:bg-porcelain transition-colors first:rounded-t-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-petrol/40"
                >
                  <p className="text-xs text-muted-fg">{c.label}</p>
                  <p className="text-base font-semibold text-ink break-all">{c.value}</p>
                  <p className="text-xs text-muted-fg mt-0.5">{c.sub}</p>
                </a>
              ))}
              <div className="p-4 sm:px-6">
                <p className="text-xs text-muted-fg">Address</p>
                <p className="text-base font-semibold text-ink">{branding.address}</p>
              </div>
            </section>

            {/* Tap to start turn-by-turn directions from wherever the visitor is */}
            <a
              href={directionsFromMeHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Get directions to our store at ${branding.address}`}
              className="relative block aspect-[4/3] rounded-xl border border-line overflow-hidden hover:border-petrol/50 transition-colors"
            >
              <iframe
                src={mapEmbedSrc}
                className="w-full h-full border-0 pointer-events-none"
                loading="lazy"
                tabIndex={-1}
                title="Store location preview"
              />
              <div className="absolute bottom-3 left-3 right-3 flex items-center gap-1.5 bg-paper text-ink text-xs font-semibold px-3 py-2 rounded-lg border border-line">
                <Navigation size={13} aria-hidden="true" className="flex-shrink-0" />
                Get directions from here
              </div>
            </a>
          </div>

          <form onSubmit={handleSubmit} className="bg-paper rounded-xl border border-line p-4 sm:p-6 space-y-4">
            <h2 className="text-lg font-semibold tracking-tight text-ink">Message us</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { key: 'name', label: 'Name', type: 'text', span: 1, required: true },
                { key: 'email', label: 'Email', type: 'email', span: 1, required: true },
                { key: 'subject', label: 'Subject', type: 'text', span: 2, required: false },
              ].map(({ key, label, type, span, required }) => (
                <div key={key} className={span === 2 ? 'sm:col-span-2' : ''}>
                  <label htmlFor={`c-${key}`} className="block text-sm font-medium text-ink mb-1.5">
                    {label}
                    {!required && <span className="text-muted-fg font-normal"> (optional)</span>}
                  </label>
                  <input
                    id={`c-${key}`}
                    type={type}
                    required={required}
                    value={form[key as keyof typeof form]}
                    onChange={update(key as keyof typeof form)}
                    className={inputCls}
                  />
                </div>
              ))}
              <div className="sm:col-span-2">
                <label htmlFor="c-message" className="block text-sm font-medium text-ink mb-1.5">Message</label>
                <textarea
                  id="c-message"
                  rows={6}
                  required
                  value={form.message}
                  onChange={update('message')}
                  className={`${inputCls} resize-none`}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto sm:px-8 bg-petrol hover:bg-petrol-700 text-white text-sm font-semibold py-3 rounded-lg transition-transform duration-100 active:scale-[0.97] disabled:opacity-60"
            >
              {submitting ? 'Sending...' : 'Send message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
