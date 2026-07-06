'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Upload } from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { useToast } from '@/components/ui/Toast';

const ease = [0.16, 1, 0.3, 1] as const;

export default function AdminBrandsPage() {
  const { toast } = useToast();
  const brands = useQuery(api.brands.list);
  const createBrand = useMutation(api.brands.create);
  const deleteBrand = useMutation(api.brands.remove);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      let imageStorageId = undefined;
      let imageUrl = undefined;
      
      if (selectedImage) {
        const postUrl = await generateUploadUrl();
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": selectedImage.type },
          body: selectedImage,
        });
        const { storageId } = await result.json();
        imageStorageId = storageId;
        
        // Use placeholder for URL since we need another endpoint to get URL, or we can just leave it empty and let frontend fetch
        imageUrl = `/api/image?storageId=${storageId}`;
      }
      
      const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      
      await createBrand({ ...formData, slug, imageStorageId, imageUrl });
      setIsModalOpen(false);
      setFormData({ name: '', description: '' });
      setSelectedImage(null);
      toast('Brand created successfully', 'success');
    } catch (error) {
      toast('Failed to create brand', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-petrol-300 text-sm">Taxonomy</p>
          <h2 className="font-display font-bold text-2xl text-ink">Brands</h2>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 bg-petrol text-paper text-sm font-semibold px-4 py-2 rounded-xl hover:bg-petrol/90 transition-colors shadow-sm"
        >
          <Plus size={16} /> Add Brand
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {brands === undefined ? (
          <p className="text-sm text-petrol-300 animate-pulse">Loading brands...</p>
        ) : brands.length === 0 ? (
          <p className="text-sm text-petrol-300 col-span-full">No brands found. Create one to get started.</p>
        ) : brands.map((brand, i) => (
          <motion.div
            key={brand._id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, ease }}
            className="bg-paper rounded-2xl border border-line p-5 shadow-sm hover:border-petrol/50 transition-colors group"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-lg text-ink">{brand.name}</p>
                <p className="font-mono text-xs text-petrol-300 mt-1">{brand.productCount || 0} products</p>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => {
                    deleteBrand({ id: brand._id });
                    toast('Brand deleted', 'info');
                  }} 
                  className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            {brand.description && <p className="text-sm text-ink/70 mt-3 line-clamp-2">{brand.description}</p>}
          </motion.div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-ink/20 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-line"
          >
            <div className="flex items-center justify-between p-4 border-b border-line bg-porcelain/30">
              <h3 className="font-semibold text-ink text-lg">Add New Brand</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-petrol-300 hover:text-ink"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Brand Logo</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition cursor-pointer">
                  <input type="file" accept="image/*" onChange={(e) => setSelectedImage(e.target.files?.[0] || null)} className="hidden" id="brand-image" />
                  <label htmlFor="brand-image" className="cursor-pointer flex flex-col items-center">
                    <Upload size={24} className="text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">{selectedImage ? selectedImage.name : 'Click to upload logo'}</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Brand Name <span className="text-red-500">*</span></label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 text-sm bg-white border border-line rounded-xl focus:outline-none focus:border-petrol" placeholder="e.g. GSK" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Description</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} className="w-full px-4 py-2 text-sm bg-white border border-line rounded-xl focus:outline-none focus:border-petrol" placeholder="Brief description of the brand..." />
              </div>
              <div className="pt-2">
                <button disabled={isUploading} type="submit" className="w-full bg-petrol text-white font-semibold py-2.5 rounded-xl hover:bg-petrol/90 transition-colors disabled:opacity-50">
                  {isUploading ? 'Uploading...' : 'Save Brand'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
