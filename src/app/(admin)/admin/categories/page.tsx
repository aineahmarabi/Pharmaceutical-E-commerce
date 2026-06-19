'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { categories } from '@/lib/fixtures/categories';
import { useToast } from '@/components/ui/Toast';

export default function AdminCategoriesPage() {
  const { toast } = useToast();

  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-5">
        <p className="font-mono text-xs text-petrol-300">{categories.length} categories</p>
        <button className="flex items-center gap-1.5 bg-petrol hover:bg-petrol-700 text-paper font-semibold text-sm px-4 py-2 rounded-xl transition-all">
          <Plus size={14} />Add Category
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.slug}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-paper rounded-2xl border border-line p-4 hover:border-petrol transition-all group"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-sm text-ink">{cat.name}</p>
                <p className="font-mono text-xs text-petrol-300 mt-0.5">{cat.productCount} products</p>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="w-7 h-7 rounded-lg bg-petrol-50 flex items-center justify-center text-petrol hover:bg-petrol hover:text-paper transition-colors">
                  <Pencil size={12} />
                </button>
                <button onClick={() => toast('Category deleted', 'info')} className="w-7 h-7 rounded-lg bg-danger/5 flex items-center justify-center text-danger/50 hover:bg-danger hover:text-paper transition-colors">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
            {cat.description && <p className="text-xs text-petrol-300 mt-2 line-clamp-2">{cat.description}</p>}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
