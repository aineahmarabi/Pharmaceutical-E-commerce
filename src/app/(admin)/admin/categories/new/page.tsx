'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from 'convex/react';
import { api } from '../../../../../../convex/_generated/api';
import { useRouter } from 'next/navigation';
import { ArrowLeft, UploadCloud, X, Save } from 'lucide-react';
import Link from 'next/link';

const ease = [0.16, 1, 0.3, 1] as const;

export default function AddCategoryPage() {
  const router = useRouter();
  const generateUploadUrl = useMutation(api.products.generateUploadUrl);
  const createCategory = useMutation(api.taxonomy.createCategory);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({ name: '', description: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let imageStorageId = undefined;
      if (file) {
        const postUrl = await generateUploadUrl();
        const result = await fetch(postUrl, {
          method: 'POST',
          headers: { 'Content-Type': file.type },
          body: file,
        });
        const { storageId } = await result.json();
        imageStorageId = storageId;
      }

      await createCategory({
        ...formData,
        imageStorageId,
      });

      router.push('/admin/categories');
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1000px] mx-auto pb-24">
      <div className="flex items-center justify-between">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease }} className="flex items-center gap-4">
          <Link href="/admin/categories" className="p-2 bg-paper border border-line rounded-xl hover:bg-porcelain transition-colors text-ink">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <p className="text-petrol-300 text-sm">Categories</p>
            <h2 className="font-display font-bold text-2xl text-ink">Create Category</h2>
          </div>
        </motion.div>
        
        <button 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex items-center gap-2 bg-petrol text-paper font-semibold px-5 py-2.5 rounded-xl hover:bg-petrol/90 transition-colors disabled:opacity-50 shadow-sm"
        >
          {isSubmitting ? 'Saving...' : <><Save size={16} /> Save Category</>}
        </button>
      </div>

      <div className="grid lg:grid-cols-[2fr_1fr] gap-6 items-start">
        <div className="space-y-6">
          <div className="bg-paper rounded-2xl border border-line shadow-sm p-6 space-y-5">
            <h3 className="font-semibold text-ink text-lg">General Information</h3>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Category Name <span className="text-red-500">*</span></label>
              <input required name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2.5 bg-white border border-line rounded-xl focus:outline-none focus:border-petrol focus:ring-1 focus:ring-petrol transition-shadow" placeholder="e.g. Pain Relief" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={5} className="w-full px-4 py-2.5 bg-white border border-line rounded-xl focus:outline-none focus:border-petrol focus:ring-1 focus:ring-petrol transition-shadow" placeholder="Detailed category description..." />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-paper rounded-2xl border border-line shadow-sm p-6 space-y-5">
            <h3 className="font-semibold text-ink text-lg">Category Image</h3>
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const dropped = e.dataTransfer.files?.[0];
                if (dropped && dropped.type.startsWith('image/')) {
                  setFile(dropped);
                  setPreview(URL.createObjectURL(dropped));
                }
              }}
              className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center transition-colors cursor-pointer ${preview ? 'border-line bg-porcelain/30' : 'border-petrol/30 bg-petrol/5 hover:bg-petrol/10'}`}
              onClick={() => !preview && fileInputRef.current?.click()}
            >
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
              
              {preview ? (
                <div className="relative w-full aspect-square rounded-xl overflow-hidden border border-line shadow-sm">
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  <button type="button" onClick={(e) => { e.stopPropagation(); removeFile(); }} className="absolute top-2 right-2 p-1 bg-white/90 text-red-500 rounded-lg hover:bg-red-50 shadow-sm transition-colors">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-petrol mb-3">
                    <UploadCloud size={24} />
                  </div>
                  <p className="text-sm font-medium text-ink text-center">Click or drag image here</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
