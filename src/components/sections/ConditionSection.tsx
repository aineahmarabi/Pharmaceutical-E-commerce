'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Brain, Wind, Shield, Sparkles, AlertCircle, Activity, Heart, Zap, Moon, User } from 'lucide-react';
import { conditions } from '@/lib/fixtures/conditions';

const ease = [0.16, 1, 0.3, 1] as const;

const condMeta: Record<string, { icon: React.ElementType; bg: string; fg: string }> = {
  'headaches-migraines':  { icon: Brain,        bg: 'bg-signal/10',   fg: 'text-signal' },
  'cough-sore-throat':    { icon: Wind,          bg: 'bg-info/10',     fg: 'text-info' },
  'immune-support':       { icon: Shield,        bg: 'bg-success/10',  fg: 'text-success' },
  'acne-skin-issues':     { icon: Sparkles,      bg: 'bg-amber/10',    fg: 'text-warning' },
  'allergies-hayfever':   { icon: AlertCircle,   bg: 'bg-danger/10',   fg: 'text-danger' },
  'blood-sugar':          { icon: Activity,      bg: 'bg-petrol-50',   fg: 'text-petrol' },
  'heart-health':         { icon: Heart,         bg: 'bg-danger/10',   fg: 'text-danger' },
  'joint-muscle-pain':    { icon: Zap,           bg: 'bg-amber/10',    fg: 'text-warning' },
  'sleep-relaxation':     { icon: Moon,          bg: 'bg-info/10',     fg: 'text-info' },
  'womens-health':        { icon: User,          bg: 'bg-success/10',  fg: 'text-success' },
};

export function ConditionSection() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-porcelain">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease }}
          className="mb-8"
        >
          <p className="font-mono text-xs uppercase tracking-widest text-petrol-300 mb-1">Shop by Condition</p>
          <h2 className="font-display font-bold text-2xl md:text-3xl text-ink tracking-tight">What are you looking for?</h2>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {conditions.map((cond, i) => {
            const meta = condMeta[cond.slug] ?? { icon: Shield, bg: 'bg-petrol-50', fg: 'text-petrol' };
            const Icon = meta.icon;
            return (
              <motion.div
                key={cond.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.4, ease }}
              >
                <Link
                  href={`/condition/${cond.slug}`}
                  className="group flex items-center gap-3 p-4 rounded-2xl border border-line/50 bg-paper hover:bg-petrol/5 hover:border-petrol/30 transition-all"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.bg} transition-transform group-hover:scale-110`}>
                    <Icon size={18} className={meta.fg} />
                  </div>
                  <span className="font-medium text-xs text-ink leading-snug">{cond.name}</span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
