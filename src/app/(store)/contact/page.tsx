'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MessageCircle, Navigation } from 'lucide-react';
import { useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useToast } from '@/components/ui/Toast';
import { useBranding } from '@/hooks/useBranding';

const ease = [0.16, 1, 0.3, 1] as const;

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
    } catch {
      toast('Failed to send message. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const waDigits = branding.whatsapp.replace(/[^0-9]/g, '');
  const contactHref: Record<string, string> = {
    Phone: `tel:${branding.phone.replace(/\s+/g, '')}`,
    WhatsApp: `https://wa.me/${waDigits}`,
    Email: 'mailto:info@pharmacare.co.ke',
  };
  // Google's unauthenticated embed trick: appending output=embed to a maps.google.com
  // URL (share link, place link, or plain ?q= search) makes it iframe-able with no API key.
  const mapEmbedSrc = branding.mapLink
    ? `${branding.mapLink}${branding.mapLink.includes('?') ? '&' : '?'}output=embed`
    : `https://maps.google.com/?q=${encodeURIComponent(branding.address)}&output=embed`;
  // No origin param — Google Maps resolves it to the visitor's current location
  // and starts turn-by-turn directions straight to the store.
  const directionsFromMeHref = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(branding.address)}`;

  return (
    <div className="min-h-screen bg-porcelain py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }}>
          <p className="font-mono text-xs uppercase tracking-widest text-petrol-300 mb-1">Get in touch</p>
          <h1 className="font-display font-bold text-2xl text-ink tracking-tight">Contact us</h1>
        </motion.div>

        <div className="mt-8 lg:grid lg:grid-cols-[2fr_3fr] lg:gap-10 lg:items-start">
          {/* Contact info */}
          <div className="space-y-4 mb-8 lg:mb-0">
            {[
              { icon: Phone, label: 'Phone', value: branding.phone, sub: 'Mon–Sat 7am–9pm' },
              { icon: MessageCircle, label: 'WhatsApp', value: branding.whatsapp, sub: 'Quick replies during business hours' },
              { icon: Mail, label: 'Email', value: 'info@pharmacare.co.ke', sub: 'Reply within 24 hours' },
            ].map(({ icon: Icon, label, value, sub }) => (
              <a
                key={label}
                href={contactHref[label]}
                className="flex items-start gap-3 bg-paper rounded-2xl border border-line p-4 hover:border-petrol/50 hover:shadow-sm transition-all cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-petrol flex items-center justify-center flex-shrink-0">
                  <Icon size={16} className="text-paper" />
                </div>
                <div>
                  <p className="text-xs text-petrol-300 font-medium">{label}</p>
                  <p className="font-semibold text-sm text-ink">{value}</p>
                  <p className="text-xs text-petrol-300">{sub}</p>
                </div>
              </a>
            ))}

            {/* Tap to start turn-by-turn directions from wherever the visitor is */}
            <a
              href={directionsFromMeHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Get directions to our store at ${branding.address}`}
              className="group relative block aspect-square rounded-2xl border border-line overflow-hidden hover:border-petrol/50 hover:shadow-sm transition-all"
            >
              <iframe
                src={mapEmbedSrc}
                className="w-full h-full border-0 pointer-events-none"
                loading="lazy"
                tabIndex={-1}
                title="Store location preview"
              />
              <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/10 transition-colors" />
              <div className="absolute bottom-3 left-3 right-3 flex items-center gap-1.5 bg-paper/95 text-ink text-xs font-semibold px-2.5 py-2 rounded-xl shadow-sm">
                <Navigation size={13} className="text-petrol flex-shrink-0" />
                Get directions from here
              </div>
            </a>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-paper rounded-2xl border border-line p-6 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { key: 'name', label: 'Name', type: 'text', span: 1 },
                { key: 'email', label: 'Email', type: 'email', span: 1 },
                { key: 'subject', label: 'Subject', type: 'text', span: 2 },
              ].map(({ key, label, type, span }) => (
                <div key={key} className={span === 2 ? 'sm:col-span-2' : ''}>
                  <label className="block text-xs font-medium text-petrol-300 mb-1.5">{label}</label>
                  <input
                    type={type}
                    value={form[key as keyof typeof form]}
                    onChange={update(key as keyof typeof form)}
                    className="w-full bg-porcelain border border-line rounded-xl px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-petrol transition-colors"
                  />
                </div>
              ))}
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-petrol-300 mb-1.5">Message</label>
                <textarea
                  rows={5}
                  value={form.message}
                  onChange={update('message')}
                  className="w-full bg-porcelain border border-line rounded-xl px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-petrol transition-colors resize-none"
                />
              </div>
            </div>
            <button type="submit" disabled={submitting} className="w-full bg-petrol hover:bg-petrol-700 text-paper font-semibold py-3 rounded-xl transition-all hover:-translate-y-0.5 disabled:opacity-60">
              {submitting ? 'Sending...' : 'Send message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
