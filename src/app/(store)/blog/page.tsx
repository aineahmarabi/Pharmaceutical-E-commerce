'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { cdnImages } from '@/lib/images';

const ease = [0.16, 1, 0.3, 1] as const;

const posts = [
  { slug: 'understanding-your-medication', title: 'Understanding your medication labels', excerpt: 'Everything you need to know about reading a medicine label — dosage, warnings, and expiry dates explained simply.', date: '2026-05-10', image: cdnImages.about.pharmacist, readTime: '4 min read', tag: 'Safety' },
  { slug: 'managing-diabetes', title: 'Managing diabetes day-to-day', excerpt: 'Practical tips on monitoring blood sugar, healthy eating habits, and how to store insulin properly.', date: '2026-04-22', image: cdnImages.about.store, readTime: '6 min read', tag: 'Conditions' },
  { slug: 'cold-vs-flu', title: 'Cold vs Flu: how to tell the difference', excerpt: 'Both feel awful, but they require different treatments. Learn the key signs that distinguish a cold from influenza.', date: '2026-04-05', image: cdnImages.hero.main, readTime: '3 min read', tag: 'General Health' },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-porcelain py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }}>
          <p className="font-mono text-xs uppercase tracking-widest text-petrol-300 mb-1">Learn</p>
          <h1 className="font-display font-bold text-2xl text-ink tracking-tight">Health Blog</h1>
          <p className="text-petrol-300 text-sm mt-1">Expert advice from our pharmacists</p>
        </motion.div>

        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post, i) => (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4, ease }}
            >
              <Link href={`/blog/${post.slug}`} className="group block bg-paper rounded-2xl border border-line overflow-hidden hover:shadow-md transition-all hover:-translate-y-1">
                <div className="relative h-44 overflow-hidden">
                  <Image src={post.image} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, 33vw" />
                  <div className="absolute top-3 left-3">
                    <span className="bg-petrol text-paper text-xs font-medium px-2.5 py-1 rounded-full">{post.tag}</span>
                  </div>
                </div>
                <div className="p-5">
                  <p className="font-mono text-xs text-petrol-300 mb-2">{new Date(post.date).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })} · {post.readTime}</p>
                  <h2 className="font-display font-bold text-base text-ink leading-snug group-hover:text-petrol transition-colors">{post.title}</h2>
                  <p className="text-xs text-petrol-300 mt-2 leading-relaxed line-clamp-3">{post.excerpt}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
