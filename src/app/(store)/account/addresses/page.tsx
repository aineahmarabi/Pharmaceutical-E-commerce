'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, Plus, Trash2 } from 'lucide-react';

const ease = [0.16, 1, 0.3, 1] as const;

export default function AddressesPage() {
  const [addresses, setAddresses] = useState([
    { id: '1', label: 'Home', address: '14 Ngong Road, Westlands', city: 'Nairobi', phone: '0712 345 678', default: true },
  ]);

  return (
    <div className="min-h-screen bg-porcelain py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }}>
          <nav className="text-xs text-petrol-300 mb-3 flex gap-2">
            <Link href="/account" className="hover:text-petrol">Account</Link><span>/</span><span className="text-ink/70">Addresses</span>
          </nav>
          <h1 className="font-display font-bold text-2xl text-ink tracking-tight">Delivery Addresses</h1>
        </motion.div>

        <div className="mt-6 space-y-3">
          {addresses.map((addr) => (
            <div key={addr.id} className="bg-paper rounded-2xl border border-line p-5 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-petrol-50 flex items-center justify-center flex-shrink-0">
                  <MapPin size={16} className="text-petrol" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-ink">{addr.label}</p>
                    {addr.default && <span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded-full font-medium">Default</span>}
                  </div>
                  <p className="text-sm text-petrol-300 mt-0.5">{addr.address}</p>
                  <p className="text-xs text-petrol-300">{addr.city} · {addr.phone}</p>
                </div>
              </div>
              <button onClick={() => setAddresses((a) => a.filter((x) => x.id !== addr.id))} className="text-danger/40 hover:text-danger transition-colors flex-shrink-0">
                <Trash2 size={15} />
              </button>
            </div>
          ))}

          <button className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-line text-sm text-petrol hover:border-petrol hover:bg-petrol-50 transition-colors">
            <Plus size={16} />Add new address
          </button>
        </div>
      </div>
    </div>
  );
}
