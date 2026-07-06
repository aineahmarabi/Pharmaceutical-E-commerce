'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/Toast';
import { Store, CreditCard, Truck, Bell, Users, FileText, Globe, Check, Save, Plus, Trash2, Upload } from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { useBranding } from '@/hooks/useBranding';
import { branding as defaultBranding } from '@/lib/config/branding';

const tabs = [
  { id: 'general', label: 'Store Details', icon: Store },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'shipping', label: 'Shipping & Delivery', icon: Truck },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'users', label: 'Users & Roles', icon: Users },
  { id: 'policies', label: 'Legal Policies', icon: FileText },
] as const;

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<typeof tabs[number]['id']>('general');
  const [saving, setSaving] = useState(false);

  const branding = useBranding();
  
  // Settings Form State
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    phone: string;
    whatsapp: string;
  }>({
    name: branding.name,
    email: branding.email,
    phone: branding.phone,
    whatsapp: branding.whatsapp,
  });
  
  // Delivery Zones
  const zones = useQuery(api.delivery.adminListZones);
  const createZone = useMutation(api.delivery.createZone);
  const deleteZone = useMutation(api.delivery.deleteZone);

  const updateSetting = useMutation(api.settings.updateStoreSetting);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const [newZoneName, setNewZoneName] = useState('');
  const [newZonePrice, setNewZonePrice] = useState('');
  
  const [selectedLogo, setSelectedLogo] = useState<File | null>(null);

  // Update local state when convex data arrives
  useEffect(() => {
    setFormData({
      name: branding.name,
      email: branding.email,
      phone: branding.phone,
      whatsapp: branding.whatsapp,
    });
  }, [branding.name, branding.email, branding.phone, branding.whatsapp]);

  const handleAddZone = async () => {
    if (!newZoneName || !newZonePrice) return;
    await createZone({ name: newZoneName, price: Number(newZonePrice), isActive: true });
    setNewZoneName('');
    setNewZonePrice('');
    toast('Delivery zone added', 'success');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (activeTab === 'general') {
        let logoUrl = branding.logo;
        if (selectedLogo) {
          const postUrl = await generateUploadUrl();
          const result = await fetch(postUrl, {
            method: "POST",
            headers: { "Content-Type": selectedLogo.type },
            body: selectedLogo,
          });
          const { storageId } = await result.json();
          // We assume a simple endpoint or string interpolation for the logo URL in frontend
          logoUrl = `/api/image?storageId=${storageId}` as any;
          await updateSetting({ key: 'logo', value: logoUrl });
        }
        await updateSetting({ key: 'name', value: formData.name });
        await updateSetting({ key: 'email', value: formData.email });
        await updateSetting({ key: 'phone', value: formData.phone });
        await updateSetting({ key: 'whatsapp', value: formData.whatsapp });
      }
      toast('Settings successfully updated', 'success');
      setSelectedLogo(null);
    } catch (err) {
      toast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] max-w-[1400px] mx-auto">
      {/* Sidebar Navigation for Settings */}
      <div className="w-64 border-r border-line bg-porcelain/30 p-6 hidden md:block overflow-y-auto">
        <h2 className="font-display font-bold text-xl text-ink mb-6">Settings</h2>
        <nav className="space-y-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                activeTab === t.id ? 'bg-white text-petrol shadow-sm border border-line' : 'text-petrol-300 hover:bg-white/50 hover:text-ink'
              }`}
            >
              <t.icon size={16} />
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Settings Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#fdfdfd]">
        
        {/* Mobile Tab Scroller */}
        <div className="md:hidden flex gap-2 overflow-x-auto pb-4 mb-4 border-b border-line">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === t.id ? 'bg-petrol text-white shadow-sm' : 'bg-paper border border-line text-petrol-300'
              }`}
            >
              <t.icon size={14} />
              {t.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSave} className="max-w-3xl space-y-8 pb-24">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {activeTab === 'general' && (
                <>
                  <div>
                    <h3 className="font-semibold text-lg text-ink">Store Profile</h3>
                    <p className="text-sm text-petrol-300 mt-1">Manage your store's basic information and contact details.</p>
                  </div>
                  
                  <div className="bg-white rounded-2xl border border-line shadow-sm overflow-hidden">
                    <div className="p-6 space-y-5">
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-ink mb-1.5">Store Logo</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition cursor-pointer">
                          <input type="file" accept="image/*" onChange={(e) => setSelectedLogo(e.target.files?.[0] || null)} className="hidden" id="store-logo" />
                          <label htmlFor="store-logo" className="cursor-pointer flex flex-col items-center">
                            {branding.logo && !selectedLogo ? (
                              <img src={branding.logo} alt="Current Logo" className="h-16 object-contain mb-2" />
                            ) : (
                              <Upload size={24} className="text-gray-400 mb-2" />
                            )}
                            <span className="text-sm text-gray-600">{selectedLogo ? selectedLogo.name : 'Click to upload a new logo'}</span>
                          </label>
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-medium text-ink mb-1.5">Store Name</label>
                          <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-white border border-line rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-petrol shadow-sm" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-ink mb-1.5">Support Email</label>
                          <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-white border border-line rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-petrol shadow-sm" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-ink mb-1.5">Phone Number</label>
                          <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-white border border-line rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-petrol shadow-sm" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-ink mb-1.5">WhatsApp Number</label>
                          <input value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} className="w-full bg-white border border-line rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-petrol shadow-sm" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-line shadow-sm overflow-hidden">
                    <div className="p-6 space-y-5">
                      <h4 className="font-medium text-ink">Store Address</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-ink mb-1.5">Street Address</label>
                          <input defaultValue="123 Pharma Street, Westlands" className="w-full bg-white border border-line rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-petrol shadow-sm" />
                        </div>
                        <div className="grid sm:grid-cols-2 gap-5">
                          <div>
                            <label className="block text-sm font-medium text-ink mb-1.5">City</label>
                            <input defaultValue="Nairobi" className="w-full bg-white border border-line rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-petrol shadow-sm" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-ink mb-1.5">Country</label>
                            <select className="w-full bg-white border border-line rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-petrol shadow-sm">
                              <option>Kenya</option>
                              <option>Uganda</option>
                              <option>Tanzania</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-line shadow-sm overflow-hidden">
                    <div className="p-6 space-y-5">
                      <h4 className="font-medium text-ink">Standards & Formats</h4>
                      <div className="grid sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-medium text-ink mb-1.5">Store Currency</label>
                          <select className="w-full bg-white border border-line rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-petrol shadow-sm">
                            <option>KES (Kenyan Shilling)</option>
                            <option>USD (US Dollar)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-ink mb-1.5">Timezone</label>
                          <select className="w-full bg-white border border-line rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-petrol shadow-sm">
                            <option>(GMT+03:00) Nairobi</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'payments' && (
                <>
                  <div>
                    <h3 className="font-semibold text-lg text-ink">Payment Providers</h3>
                    <p className="text-sm text-petrol-300 mt-1">Accept payments through M-PESA, cards, or on delivery.</p>
                  </div>
                  
                  {/* M-PESA */}
                  <div className="bg-white rounded-2xl border border-line shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-line flex items-center justify-between bg-[#f4fbf7]">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-white font-bold tracking-tight">M</div>
                        <div>
                          <h4 className="font-semibold text-ink">M-PESA Daraja API</h4>
                          <p className="text-xs text-petrol-300">Accept mobile money payments</p>
                        </div>
                      </div>
                      <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">Active</span>
                    </div>
                    <div className="p-6 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-ink mb-1.5">Paybill / Till Number</label>
                        <input defaultValue="123456" className="w-full bg-white border border-line rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-petrol shadow-sm font-mono" />
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-ink mb-1.5">Consumer Key</label>
                          <input type="password" defaultValue="xxxxxxxxxxxx" className="w-full bg-white border border-line rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-petrol shadow-sm font-mono" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-ink mb-1.5">Consumer Secret</label>
                          <input type="password" defaultValue="xxxxxxxxxxxx" className="w-full bg-white border border-line rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-petrol shadow-sm font-mono" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stripe */}
                  <div className="bg-white rounded-2xl border border-line shadow-sm overflow-hidden opacity-75">
                    <div className="p-6 border-b border-line flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center text-white font-bold"><CreditCard size={24}/></div>
                        <div>
                          <h4 className="font-semibold text-ink">Stripe (Cards)</h4>
                          <p className="text-xs text-petrol-300">Accept Visa, Mastercard, AMEX</p>
                        </div>
                      </div>
                      <span className="bg-porcelain text-petrol-300 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">Inactive</span>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'shipping' && (
                <>
                  <div>
                    <h3 className="font-semibold text-lg text-ink">Shipping & Delivery</h3>
                    <p className="text-sm text-petrol-300 mt-1">Manage delivery zones, rates, and fulfillment rules.</p>
                  </div>
                  
                  <div className="bg-white rounded-2xl border border-line shadow-sm overflow-hidden">
                    <div className="p-6 space-y-6">
                      <div className="flex items-center justify-between border-b border-line pb-4">
                        <h4 className="font-semibold text-ink">Delivery Zones</h4>
                      </div>

                      <div className="space-y-4">
                        {zones === undefined ? (
                          <div className="text-sm text-petrol-300">Loading zones...</div>
                        ) : zones.length === 0 ? (
                          <div className="text-sm text-petrol-300">No delivery zones configured.</div>
                        ) : (
                          zones.map((zone) => (
                            <div key={zone._id} className="bg-porcelain/30 rounded-xl border border-line p-5 space-y-4">
                              <div className="flex items-center justify-between">
                                <h5 className="font-medium text-ink flex items-center gap-2"><Globe size={16} className="text-petrol-300"/> {zone.name}</h5>
                                <button type="button" onClick={() => deleteZone({ id: zone._id })} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                  <Trash2 size={16} />
                                </button>
                              </div>
                              <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-ink">Delivery Fee</span>
                                  <span className="font-semibold">KES {zone.price.toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Add new zone form */}
                      <div className="pt-4 border-t border-line grid sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
                        <div>
                          <label className="block text-xs font-medium text-ink mb-1.5">Zone Name (e.g. Kiambu)</label>
                          <input value={newZoneName} onChange={e => setNewZoneName(e.target.value)} className="w-full bg-white border border-line rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-petrol shadow-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-ink mb-1.5">Price (KES)</label>
                          <input type="number" value={newZonePrice} onChange={e => setNewZonePrice(e.target.value)} className="w-full bg-white border border-line rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-petrol shadow-sm" />
                        </div>
                        <button type="button" onClick={handleAddZone} className="h-10 bg-petrol text-white px-4 rounded-xl text-sm font-medium hover:bg-petrol/90 flex items-center justify-center">
                          <Plus size={16} />
                        </button>
                      </div>

                      <div className="pt-4 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-ink mb-1.5">Free Delivery Threshold (KES)</label>
                          <input type="number" defaultValue={defaultBranding.deliveryThreshold} className="w-full bg-white border border-line rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-petrol shadow-sm" />
                          <p className="text-xs text-petrol-300 mt-1.5">Orders above this amount will automatically qualify for free standard delivery.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'notifications' && (
                <>
                  <div>
                    <h3 className="font-semibold text-lg text-ink">Notifications</h3>
                    <p className="text-sm text-petrol-300 mt-1">Manage automated alerts sent to customers and staff.</p>
                  </div>

                  <div className="bg-white rounded-2xl border border-line shadow-sm overflow-hidden divide-y divide-line">
                    <div className="p-6">
                      <h4 className="font-medium text-ink mb-4">Customer Order Notifications</h4>
                      <div className="space-y-4">
                        {[
                          { title: 'Order Confirmation', desc: 'Sent automatically when an order is placed' },
                          { title: 'Shipping Confirmation', desc: 'Sent when an order is marked as delivering' },
                          { title: 'Out for Delivery', desc: 'Sent when the rider is approaching' },
                          { title: 'Abandoned Checkout', desc: 'Sent 24 hours after a customer abandons their cart' },
                        ].map((n, i) => (
                          <label key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-porcelain/50 transition-colors cursor-pointer border border-transparent hover:border-line">
                            <input type="checkbox" defaultChecked className="mt-1 w-4 h-4 rounded text-petrol focus:ring-petrol border-line" />
                            <div>
                              <p className="text-sm font-medium text-ink">{n.title}</p>
                              <p className="text-xs text-petrol-300">{n.desc}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="p-6">
                      <h4 className="font-medium text-ink mb-4">Staff Alerts</h4>
                      <div className="space-y-4">
                        {[
                          { title: 'New Order Alert', desc: 'Notify admins when a new order is received' },
                          { title: 'Low Stock Warning', desc: 'Alert when a product falls below 5 items' },
                        ].map((n, i) => (
                          <label key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-porcelain/50 transition-colors cursor-pointer border border-transparent hover:border-line">
                            <input type="checkbox" defaultChecked className="mt-1 w-4 h-4 rounded text-petrol focus:ring-petrol border-line" />
                            <div>
                              <p className="text-sm font-medium text-ink">{n.title}</p>
                              <p className="text-xs text-petrol-300">{n.desc}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'policies' && (
                <>
                  <div>
                    <h3 className="font-semibold text-lg text-ink">Legal & Policies</h3>
                    <p className="text-sm text-petrol-300 mt-1">Manage the legal agreements that appear at checkout and in your footer.</p>
                  </div>

                  {['Refund Policy', 'Privacy Policy', 'Terms of Service', 'Shipping Policy'].map((policy) => (
                    <div key={policy} className="bg-white rounded-2xl border border-line shadow-sm overflow-hidden">
                      <div className="p-6 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-ink">{policy}</h4>
                          <button type="button" className="text-sm font-medium text-petrol hover:underline">Generate from template</button>
                        </div>
                        <textarea rows={4} className="w-full bg-porcelain border border-line rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-petrol shadow-inner" placeholder={`Enter your ${policy.toLowerCase()} here...`} />
                      </div>
                    </div>
                  ))}
                </>
              )}

            </motion.div>
          </AnimatePresence>

          {/* Floating Save Bar */}
          <div className="fixed bottom-0 left-0 md:left-64 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-line flex items-center justify-end z-20">
            <button 
              type="submit" 
              disabled={saving} 
              className="flex items-center gap-2 bg-petrol text-paper font-semibold px-6 py-2.5 rounded-xl hover:bg-petrol/90 transition-all shadow-md disabled:opacity-50"
            >
              {saving ? <span className="w-4 h-4 border-2 border-paper/30 border-t-paper rounded-full animate-spin" /> : <Save size={16} />}
              Save Changes
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
