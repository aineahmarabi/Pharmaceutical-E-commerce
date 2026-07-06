'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { useToast } from '@/components/ui/Toast';

const ease = [0.16, 1, 0.3, 1] as const;

export default function AdminConditionsPage() {
  const { toast } = useToast();
  const conditions = useQuery(api.taxonomy.listConditions);
  const createCondition = useMutation(api.taxonomy.createCondition);
  const deleteCondition = useMutation(api.taxonomy.deleteCondition);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCondition(formData);
      setIsModalOpen(false);
      setFormData({ name: '', description: '' });
      toast('Condition created successfully', 'success');
    } catch (error) {
      toast('Failed to create condition', 'error');
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-petrol-300 text-sm">Taxonomy</p>
          <h2 className="font-display font-bold text-2xl text-ink">Health Conditions</h2>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 bg-petrol text-paper text-sm font-semibold px-4 py-2 rounded-xl hover:bg-petrol/90 transition-colors shadow-sm"
        >
          <Plus size={16} /> Add Condition
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {conditions === undefined ? (
          <p className="text-sm text-petrol-300 animate-pulse">Loading conditions...</p>
        ) : conditions.length === 0 ? (
          <p className="text-sm text-petrol-300 col-span-full">No conditions found. Create one to get started.</p>
        ) : conditions.map((cond, i) => (
          <motion.div
            key={cond._id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, ease }}
            className="bg-paper rounded-2xl border border-line p-5 shadow-sm hover:border-petrol/50 transition-colors group"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-lg text-ink">{cond.name}</p>
                <p className="font-mono text-xs text-petrol-300 mt-1">{cond.productCount} products</p>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => {
                    deleteCondition({ id: cond._id });
                    toast('Condition deleted', 'info');
                  }} 
                  className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            {cond.description && <p className="text-sm text-ink/70 mt-3 line-clamp-2">{cond.description}</p>}
          </motion.div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/20 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-line"
          >
            <div className="flex items-center justify-between p-4 border-b border-line bg-porcelain/30">
              <h3 className="font-semibold text-ink text-lg">Add Health Condition</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-petrol-300 hover:text-ink"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Condition Name <span className="text-red-500">*</span></label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 text-sm bg-white border border-line rounded-xl focus:outline-none focus:border-petrol" placeholder="e.g. Headache" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Description</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} className="w-full px-4 py-2 text-sm bg-white border border-line rounded-xl focus:outline-none focus:border-petrol" placeholder="Brief description of the condition..." />
              </div>
              <div className="pt-2">
                <button type="submit" className="w-full bg-petrol text-white font-semibold py-2.5 rounded-xl hover:bg-petrol/90 transition-colors">
                  Save Condition
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
