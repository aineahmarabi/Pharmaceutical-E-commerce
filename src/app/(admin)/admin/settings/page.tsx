'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/Toast';
import { branding } from '@/lib/config/branding';

const tabs = ['General', 'Notifications', 'Delivery', 'Payments'] as const;

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<typeof tabs[number]>('General');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    toast('Settings saved', 'success');
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${activeTab === t ? 'bg-petrol text-paper' : 'bg-paper border border-line text-petrol-300 hover:text-ink'}`}
          >
            {t}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave} className="max-w-xl">
        {activeTab === 'General' && (
          <div className="bg-paper rounded-2xl border border-line p-6 space-y-4">
            <h2 className="font-semibold text-ink">General settings</h2>
            {[
              { key: 'name', label: 'Store name', value: branding.name },
              { key: 'phone', label: 'Contact phone', value: branding.phone },
              { key: 'whatsapp', label: 'WhatsApp number', value: branding.whatsapp },
            ].map(({ key, label, value }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-petrol-300 mb-1.5">{label}</label>
                <input defaultValue={value} className="w-full bg-porcelain border border-line rounded-xl px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-petrol" />
              </div>
            ))}
          </div>
        )}

        {activeTab === 'Delivery' && (
          <div className="bg-paper rounded-2xl border border-line p-6 space-y-4">
            <h2 className="font-semibold text-ink">Delivery settings</h2>
            <div>
              <label className="block text-xs font-medium text-petrol-300 mb-1.5">Free delivery threshold (KES)</label>
              <input type="number" defaultValue={branding.deliveryThreshold} className="w-full bg-porcelain border border-line rounded-xl px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-petrol font-mono" />
            </div>
            <div>
              <label className="block text-xs font-medium text-petrol-300 mb-1.5">Standard delivery fee (KES)</label>
              <input type="number" defaultValue="200" className="w-full bg-porcelain border border-line rounded-xl px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-petrol font-mono" />
            </div>
          </div>
        )}

        {activeTab === 'Notifications' && (
          <div className="bg-paper rounded-2xl border border-line p-6 space-y-4">
            <h2 className="font-semibold text-ink">Notification settings</h2>
            {['Order placed', 'Order delivered', 'Low stock alert', 'New customer signup'].map((item) => (
              <label key={item} className="flex items-center justify-between">
                <span className="text-sm text-ink">{item}</span>
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-petrol" />
              </label>
            ))}
          </div>
        )}

        {activeTab === 'Payments' && (
          <div className="bg-paper rounded-2xl border border-line p-6 space-y-4">
            <h2 className="font-semibold text-ink">Payment methods</h2>
            {['M-PESA', 'Card (Stripe)', 'Cash on delivery'].map((method) => (
              <label key={method} className="flex items-center justify-between">
                <span className="text-sm text-ink">{method}</span>
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-petrol" />
              </label>
            ))}
          </div>
        )}

        <button type="submit" disabled={saving} className="mt-5 bg-petrol hover:bg-petrol-700 disabled:opacity-60 text-paper font-semibold px-6 py-2.5 rounded-xl transition-all flex items-center gap-2">
          {saving ? <span className="w-4 h-4 border-2 border-paper/30 border-t-paper rounded-full animate-spin" /> : null}
          Save settings
        </button>
      </form>
    </div>
  );
}
