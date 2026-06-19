'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Shield, Award, Users, Clock } from 'lucide-react';
import { cdnImages } from '@/lib/images';
import { branding } from '@/lib/config/branding';

const ease = [0.16, 1, 0.3, 1] as const;

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-porcelain">
      {/* Hero */}
      <div className="relative bg-petrol overflow-hidden">
        <Image src={cdnImages.about.team} alt="Team" fill className="object-cover opacity-20" sizes="100vw" />
        <div className="relative py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>
              <h1 className="font-display font-extrabold text-4xl text-paper tracking-tight mb-4">
                Kenya&rsquo;s most trusted pharmacy
              </h1>
              <p className="text-paper/70 leading-relaxed max-w-xl mx-auto">
                {branding.name} has been serving Kenyan families since 2005. We believe everyone deserves convenient access to genuine, affordable healthcare.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        {/* Values */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease }}
            className="text-center mb-10"
          >
            <h2 className="font-display font-bold text-2xl text-ink tracking-tight">What we stand for</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Shield, title: '100% Genuine', sub: 'Every product verified by our pharmacists.' },
              { icon: Award, title: 'PPB Licensed', sub: 'Fully licensed and regulated.' },
              { icon: Users, title: 'Expert team', sub: 'Qualified pharmacists on every shift.' },
              { icon: Clock, title: 'Same-day delivery', sub: 'In Nairobi and major towns.' },
            ].map(({ icon: Icon, title, sub }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4, ease }}
                className="bg-paper border border-line rounded-2xl p-5 text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-petrol mx-auto flex items-center justify-center mb-3">
                  <Icon size={20} className="text-paper" />
                </div>
                <p className="font-semibold text-sm text-ink">{title}</p>
                <p className="text-xs text-petrol-300 mt-1">{sub}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Story */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease }}
          className="bg-paper border border-line rounded-2xl p-8"
        >
          <h2 className="font-display font-bold text-xl text-ink mb-4">Our story</h2>
          <p className="text-ink/70 leading-relaxed mb-4">
            Founded in Nairobi in 2005 with a single branch on Kimathi Street, {branding.name} was built on one conviction: every Kenyan family deserves access to genuine, affordable medication — without the guesswork.
          </p>
          <p className="text-ink/70 leading-relaxed">
            Today, we operate 60+ branches across the country and serve over 200,000 customers through our online platform. Our registered pharmacists are available online and in-store to answer your questions, no appointment needed.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
