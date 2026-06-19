'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { branding } from '@/lib/config/branding';

const ease = [0.16, 1, 0.3, 1] as const;

export default function ContactPage() {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast('Message sent! We\'ll get back to you within 24 hours.', 'success');
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-porcelain py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }}>
          <p className="font-mono text-xs uppercase tracking-widest text-petrol-300 mb-1">Get in touch</p>
          <h1 className="font-display font-bold text-2xl text-ink tracking-tight">Contact us</h1>
        </motion.div>

        <div className="mt-8 lg:grid lg:grid-cols-[2fr_3fr] lg:gap-10">
          {/* Contact info */}
          <div className="space-y-4 mb-8 lg:mb-0">
            {[
              { icon: Phone, label: 'Phone', value: branding.phone, sub: 'Mon–Sat 7am–9pm' },
              { icon: MessageCircle, label: 'WhatsApp', value: branding.whatsapp, sub: 'Quick replies during business hours' },
              { icon: Mail, label: 'Email', value: 'info@pharmacare.co.ke', sub: 'Reply within 24 hours' },
              { icon: MapPin, label: 'Head office', value: '14 Waiyaki Way, Westlands', sub: 'Nairobi, Kenya' },
            ].map(({ icon: Icon, label, value, sub }) => (
              <div key={label} className="flex items-start gap-3 bg-paper rounded-2xl border border-line p-4">
                <div className="w-10 h-10 rounded-xl bg-petrol flex items-center justify-center flex-shrink-0">
                  <Icon size={16} className="text-paper" />
                </div>
                <div>
                  <p className="text-xs text-petrol-300 font-medium">{label}</p>
                  <p className="font-semibold text-sm text-ink">{value}</p>
                  <p className="text-xs text-petrol-300">{sub}</p>
                </div>
              </div>
            ))}
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
            <button type="submit" className="w-full bg-petrol hover:bg-petrol-700 text-paper font-semibold py-3 rounded-xl transition-all hover:-translate-y-0.5">
              Send message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
