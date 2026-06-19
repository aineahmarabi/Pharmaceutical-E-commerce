'use client';

import React, { use } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { cdnImages } from '@/lib/images';

const ease = [0.16, 1, 0.3, 1] as const;

const posts: Record<string, { title: string; date: string; image: string; readTime: string; tag: string; content: string }> = {
  'understanding-your-medication': {
    title: 'Understanding your medication labels',
    date: '2026-05-10',
    image: cdnImages.about.pharmacist,
    readTime: '4 min read',
    tag: 'Safety',
    content: `Every medicine package contains important information that can protect your health. Learning to read these labels is one of the best things you can do for yourself and your family.\n\n**Drug name and strength** — The generic name (e.g. paracetamol) is usually in smaller text below the brand name. The strength tells you how many milligrams are in each tablet or dose.\n\n**Dosage instructions** — Follow these exactly. "Take 1–2 tablets every 4–6 hours as needed" does not mean you can take 2 every hour. Never exceed the stated maximum daily dose.\n\n**Expiry date** — Never take medicine after its expiry date. Efficacy drops and some medicines can become harmful.\n\n**Storage** — "Store below 25°C" means a cool cupboard, not your car dashboard. "Keep refrigerated" means the fridge, not the freezer.\n\n**Warnings and interactions** — The small print matters. If it says "do not operate heavy machinery," that includes driving. If it says "avoid with alcohol," be strict about it.\n\nIf you are ever unsure, ask your pharmacist. That is what we are here for.`,
  },
  'managing-diabetes': {
    title: 'Managing diabetes day-to-day',
    date: '2026-04-22',
    image: cdnImages.about.store,
    readTime: '6 min read',
    tag: 'Conditions',
    content: `Living with diabetes requires daily attention, but it does not have to dominate your life. With the right habits, most people with type 2 diabetes can lead full, active lives.\n\n**Monitor your blood sugar** — Check your blood glucose at least twice a day — before breakfast and two hours after your largest meal. Write down the readings. This data is invaluable for your doctor.\n\n**Eating well** — No food is completely off-limits, but portion size matters. Fill half your plate with non-starchy vegetables, a quarter with lean protein, and a quarter with complex carbohydrates like brown rice or sweet potato.\n\n**Medication storage** — Insulin must be stored in the refrigerator (2–8°C). Do not freeze it. Once opened, most insulin vials are good for 28 days at room temperature.\n\n**Exercise** — 30 minutes of moderate exercise five days a week can significantly improve insulin sensitivity. Walking counts.\n\n**Foot care** — Check your feet daily for cuts or sores. Nerve damage from diabetes can reduce sensation, meaning small wounds can go unnoticed and become serious.\n\nIf you have questions about your diabetes medication or supplies, speak to our pharmacist.`,
  },
  'cold-vs-flu': {
    title: 'Cold vs Flu: how to tell the difference',
    date: '2026-04-05',
    image: cdnImages.hero.main,
    readTime: '3 min read',
    tag: 'General Health',
    content: `Both a cold and influenza are respiratory illnesses, but they feel different and require different management.\n\n**Onset** — A cold develops gradually over a day or two. Flu hits suddenly — you can feel fine in the morning and terrible by afternoon.\n\n**Fever** — Colds rarely cause a significant fever in adults. Flu almost always causes one, typically 38–40°C, often with chills.\n\n**Body aches** — Mild achiness is common with a cold. With flu, the muscle aches can be severe and debilitating.\n\n**Fatigue** — Mild tiredness with a cold; extreme exhaustion with flu that can last weeks.\n\n**Treatment** — Neither responds to antibiotics, which only work on bacteria. For colds, rest, fluids, and OTC symptom relief (decongestants, paracetamol) are the best approach. For flu, antiviral medications like oseltamivir (Tamiflu) can shorten illness if taken within 48 hours — see a doctor quickly if you suspect flu.\n\n**When to see a doctor** — If you have difficulty breathing, chest pain, confusion, or symptoms that improve then return worse, seek medical attention.`,
  },
};

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const post = posts[slug];
  if (!post) notFound();

  return (
    <div className="min-h-screen bg-porcelain py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }}>
          <nav className="text-xs text-petrol-300 mb-4 flex gap-2">
            <Link href="/blog" className="hover:text-petrol">Blog</Link><span>/</span><span className="text-ink/70 truncate">{post.title}</span>
          </nav>
          <span className="bg-petrol text-paper text-xs font-medium px-2.5 py-1 rounded-full">{post.tag}</span>
          <h1 className="font-display font-bold text-2xl text-ink tracking-tight mt-3 leading-snug">{post.title}</h1>
          <p className="font-mono text-xs text-petrol-300 mt-2">{new Date(post.date).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })} · {post.readTime}</p>
        </motion.div>

        <div className="relative h-56 rounded-2xl overflow-hidden mt-6">
          <Image src={post.image} alt={post.title} fill className="object-cover" sizes="(max-width: 672px) 100vw, 672px" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4, ease }}
          className="mt-8 bg-paper rounded-2xl border border-line p-6"
        >
          {post.content.split('\n\n').map((para, i) => (
            <p key={i} className="text-ink/80 leading-relaxed mb-4 last:mb-0" dangerouslySetInnerHTML={{ __html: para.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }} />
          ))}
        </motion.div>

        <div className="mt-8 text-center">
          <Link href="/blog" className="text-sm text-petrol hover:underline">← Back to blog</Link>
        </div>
      </div>
    </div>
  );
}
