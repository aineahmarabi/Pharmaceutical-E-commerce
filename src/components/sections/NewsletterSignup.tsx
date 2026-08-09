'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

const ease = [0.16, 1, 0.3, 1] as const;

export function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    toast("You're subscribed — watch your inbox for deals.", 'success');
    setEmail('');
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-petrol">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease }}
        >
          <div className="w-12 h-12 rounded-2xl bg-paper/10 flex items-center justify-center mx-auto mb-4">
            <Mail size={20} className="text-paper" />
          </div>
          <h2 className="font-display font-bold text-2xl md:text-3xl text-paper tracking-tight">Get deals in your inbox</h2>
          <p className="text-paper/60 text-sm mt-2 max-w-md mx-auto">
            Restock alerts, seasonal offers, and health tips — no spam, unsubscribe anytime.
          </p>
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="flex-1 bg-paper/10 border border-paper/20 rounded-xl px-4 py-3 text-sm text-paper placeholder:text-paper/40 focus:outline-none focus:border-paper/50 transition-colors"
            />
            <button
              type="submit"
              className="bg-signal hover:bg-signal/90 text-paper text-sm font-semibold px-6 py-3 rounded-xl transition-all active:scale-[0.98]"
            >
              Subscribe
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
