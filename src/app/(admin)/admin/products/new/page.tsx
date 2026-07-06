'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from 'convex/react';
import { api } from '../../../../../../convex/_generated/api';
import { useRouter } from 'next/navigation';
import { ArrowLeft, UploadCloud, X, Save } from 'lucide-react';
import Link from 'next/link';

const ease = [0.16, 1, 0.3, 1] as const;

export default function AddProductPage() {
  const router = useRouter();
  const generateUploadUrl = useMutation(api.products.generateUploadUrl);
  const createProduct = useMutation(api.adminProducts.createProduct);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    genericName: '',
    category: '',
    classification: 'OTC' as 'OTC' | 'P' | 'POM',
    form: 'Tablet',
    strength: '',
    packSize: '',
    price: '',
    compareAtPrice: '',
    description: '',
    directions: '',
    warnings: '',
    ingredients: '',
    stockQty: '0',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped && dropped.type.startsWith('image/')) {
      setFile(dropped);
      setPreview(URL.createObjectURL(dropped));
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let imageStorageId = undefined;
      
      // Upload image to Convex Storage
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

      const categorySlug = slugify(formData.category);
      const brandSlug = slugify(formData.brand);
      const slug = slugify(formData.name);

      await createProduct({
        ...formData,
        slug,
        categorySlug,
        brandSlug,
        price: Number(formData.price),
        compareAtPrice: formData.compareAtPrice ? Number(formData.compareAtPrice) : undefined,
        stockQty: Number(formData.stockQty),
        inStock: Number(formData.stockQty) > 0,
        conditions: [], // default empty, could add UI for this later
        imageStorageId,
      });

      router.push('/admin/products');
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1000px] mx-auto pb-24">
      <div className="flex items-center justify-between">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease }} className="flex items-center gap-4">
          <Link href="/admin/products" className="p-2 bg-paper border border-line rounded-xl hover:bg-porcelain transition-colors text-ink">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <p className="text-petrol-300 text-sm">Products</p>
            <h2 className="font-display font-bold text-2xl text-ink">Add Product</h2>
          </div>
        </motion.div>
        
        <button 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex items-center gap-2 bg-petrol text-paper font-semibold px-5 py-2.5 rounded-xl hover:bg-petrol/90 transition-colors disabled:opacity-50 shadow-sm"
        >
          {isSubmitting ? 'Saving...' : <><Save size={16} /> Save Product</>}
        </button>
      </div>

      <div className="grid lg:grid-cols-[2fr_1fr] gap-6 items-start">
        {/* Left Column */}
        <div className="space-y-6">
          
          {/* Basic Info */}
          <div className="bg-paper rounded-2xl border border-line shadow-sm p-6 space-y-5">
            <h3 className="font-semibold text-ink text-lg">General Information</h3>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Product Title <span className="text-red-500">*</span></label>
              <input required name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2.5 bg-white border border-line rounded-xl focus:outline-none focus:border-petrol focus:ring-1 focus:ring-petrol transition-shadow" placeholder="e.g. Panadol Extra Advance" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Description <span className="text-red-500">*</span></label>
              <textarea required name="description" value={formData.description} onChange={handleChange} rows={5} className="w-full px-4 py-2.5 bg-white border border-line rounded-xl focus:outline-none focus:border-petrol focus:ring-1 focus:ring-petrol transition-shadow" placeholder="Detailed product description..." />
            </div>
          </div>

          {/* Media (Dropzone) */}
          <div className="bg-paper rounded-2xl border border-line shadow-sm p-6 space-y-5">
            <h3 className="font-semibold text-ink text-lg">Media</h3>
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-colors cursor-pointer ${preview ? 'border-line bg-porcelain/30' : 'border-petrol/30 bg-petrol/5 hover:bg-petrol/10'}`}
              onClick={() => !preview && fileInputRef.current?.click()}
            >
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
              
              {preview ? (
                <div className="relative w-full max-w-[200px] aspect-square rounded-xl overflow-hidden border border-line shadow-sm">
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
                  <p className="text-sm font-medium text-ink">Click or drag image here</p>
                  <p className="text-xs text-petrol-300 mt-1">SVG, PNG, JPG or GIF (max. 5MB)</p>
                </>
              )}
            </div>
          </div>

          {/* Clinical Info */}
          <div className="bg-paper rounded-2xl border border-line shadow-sm p-6 space-y-5">
            <h3 className="font-semibold text-ink text-lg">Clinical Information</h3>
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Generic Name</label>
                <input name="genericName" value={formData.genericName} onChange={handleChange} className="w-full px-4 py-2 bg-white border border-line rounded-xl focus:outline-none focus:border-petrol" placeholder="e.g. Paracetamol" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Classification</label>
                <select name="classification" value={formData.classification} onChange={handleChange} className="w-full px-4 py-2 bg-white border border-line rounded-xl focus:outline-none focus:border-petrol">
                  <option value="OTC">Over the Counter (OTC)</option>
                  <option value="P">Pharmacy (P)</option>
                  <option value="POM">Prescription Only (POM)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Dosage Form</label>
                <select name="form" value={formData.form} onChange={handleChange} className="w-full px-4 py-2 bg-white border border-line rounded-xl focus:outline-none focus:border-petrol">
                  <option value="Tablet">Tablet</option>
                  <option value="Capsule">Capsule</option>
                  <option value="Syrup">Syrup</option>
                  <option value="Cream">Cream</option>
                  <option value="Drops">Drops</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Strength</label>
                <input name="strength" value={formData.strength} onChange={handleChange} className="w-full px-4 py-2 bg-white border border-line rounded-xl focus:outline-none focus:border-petrol" placeholder="e.g. 500mg" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Active Ingredients</label>
              <textarea name="ingredients" value={formData.ingredients} onChange={handleChange} rows={2} className="w-full px-4 py-2 bg-white border border-line rounded-xl focus:outline-none focus:border-petrol" placeholder="List active ingredients..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Directions for use</label>
              <textarea name="directions" value={formData.directions} onChange={handleChange} rows={2} className="w-full px-4 py-2 bg-white border border-line rounded-xl focus:outline-none focus:border-petrol" placeholder="How to use this product..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Warnings & Precautions</label>
              <textarea name="warnings" value={formData.warnings} onChange={handleChange} rows={2} className="w-full px-4 py-2 bg-white border border-line rounded-xl focus:outline-none focus:border-petrol" placeholder="Any side effects or warnings..." />
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          
          {/* Pricing */}
          <div className="bg-paper rounded-2xl border border-line shadow-sm p-6 space-y-5">
            <h3 className="font-semibold text-ink text-lg">Pricing</h3>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Price (KES) <span className="text-red-500">*</span></label>
              <input required type="number" name="price" value={formData.price} onChange={handleChange} className="w-full px-4 py-2 bg-white border border-line rounded-xl focus:outline-none focus:border-petrol" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Compare at price</label>
              <input type="number" name="compareAtPrice" value={formData.compareAtPrice} onChange={handleChange} className="w-full px-4 py-2 bg-white border border-line rounded-xl focus:outline-none focus:border-petrol" placeholder="0.00" />
              <p className="text-xs text-petrol-300 mt-1">To show a reduced price, move the original price here.</p>
            </div>
          </div>

          {/* Inventory */}
          <div className="bg-paper rounded-2xl border border-line shadow-sm p-6 space-y-5">
            <h3 className="font-semibold text-ink text-lg">Inventory</h3>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Stock Quantity</label>
              <input required type="number" name="stockQty" value={formData.stockQty} onChange={handleChange} className="w-full px-4 py-2 bg-white border border-line rounded-xl focus:outline-none focus:border-petrol" placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Pack Size</label>
              <input name="packSize" value={formData.packSize} onChange={handleChange} className="w-full px-4 py-2 bg-white border border-line rounded-xl focus:outline-none focus:border-petrol" placeholder="e.g. 2x10 tablets" />
            </div>
          </div>

          {/* Organization */}
          <div className="bg-paper rounded-2xl border border-line shadow-sm p-6 space-y-5">
            <h3 className="font-semibold text-ink text-lg">Organization</h3>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Category <span className="text-red-500">*</span></label>
              <input required name="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-2 bg-white border border-line rounded-xl focus:outline-none focus:border-petrol" placeholder="e.g. Pain Relief" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Brand <span className="text-red-500">*</span></label>
              <input required name="brand" value={formData.brand} onChange={handleChange} className="w-full px-4 py-2 bg-white border border-line rounded-xl focus:outline-none focus:border-petrol" placeholder="e.g. GSK" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
