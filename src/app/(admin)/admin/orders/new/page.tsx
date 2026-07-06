'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../../../../convex/_generated/api';
import { useRouter } from 'next/navigation';
import { Search, Plus, Trash2, ArrowLeft, Package, ChevronDown, Check } from 'lucide-react';
import Link from 'next/link';

const ease = [0.16, 1, 0.3, 1] as const;

function CustomSelect({ value, onChange, options, label }: { value: string, onChange: (v: any) => void, options: {label: string, value: string}[], label: string }) {
  const [open, setOpen] = useState(false);
  
  return (
    <div className="relative">
      <label className="block text-xs font-medium text-petrol-300 mb-1">{label}</label>
      <button 
        type="button" 
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm bg-white border border-line rounded-xl focus:outline-none focus:border-petrol shadow-sm"
      >
        <span className="text-ink">{options.find(o => o.value === value)?.label}</span>
        <ChevronDown size={14} className={`text-petrol-300 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <motion.div 
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} 
            className="absolute z-20 w-full mt-2 bg-white border border-line rounded-xl shadow-lg overflow-hidden py-1"
          >
            {options.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-porcelain/50 flex items-center justify-between transition-colors"
              >
                <span className={value === opt.value ? 'font-semibold text-petrol' : 'text-ink'}>{opt.label}</span>
                {value === opt.value && <Check size={14} className="text-petrol" />}
              </button>
            ))}
          </motion.div>
        </>
      )}
    </div>
  );
}

export default function AddOrderPage() {
  const router = useRouter();
  const products = useQuery(api.adminProducts.adminListProducts, { limit: 1000 });
  const createOrder = useMutation(api.orders.createOrder);

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'mpesa'|'card'|'cod'>('mpesa');
  const [paymentStatus, setPaymentStatus] = useState<'pending'|'paid'>('pending');
  
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<Array<{ id: string, name: string, price: number, qty: number, stock: number }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredProducts = products?.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) && p.inStock
  ) || [];

  const addToCart = (product: any) => {
    const existing = cart.find(c => c.id === product._id);
    if (existing) {
      if (existing.qty < product.stockQty) {
        setCart(cart.map(c => c.id === product._id ? { ...c, qty: c.qty + 1 } : c));
      }
    } else {
      setCart([...cart, { id: product._id, name: product.name, price: product.price, qty: 1, stock: product.stockQty }]);
    }
  };

  const updateQty = (id: string, delta: number) => {
    setCart(cart.map(c => {
      if (c.id === id) {
        const newQty = Math.max(1, Math.min(c.qty + delta, c.stock));
        return { ...c, qty: newQty };
      }
      return c;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(c => c.id !== id));
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const deliveryFee = 250;
  const total = subtotal + (cart.length > 0 ? deliveryFee : 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0 || !customerName) return;

    setIsSubmitting(true);
    try {
      const orderId = await createOrder({
        customerName,
        customerEmail,
        customerPhone,
        deliveryAddress: deliveryAddress || 'In-Store',
        paymentMethod,
        paymentStatus,
        items: cart.map(c => ({
          productId: c.id,
          name: c.name,
          qty: c.qty,
          price: c.price
        })),
        status: paymentStatus === 'paid' ? 'confirmed' : 'placed'
      });
      router.push('/admin/orders');
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1200px] mx-auto">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease }} className="flex items-center gap-4">
        <Link href="/admin/orders" className="p-2 bg-paper border border-line rounded-xl hover:bg-porcelain transition-colors text-ink">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <p className="text-petrol-300 text-sm">Orders</p>
          <h2 className="font-display font-bold text-2xl text-ink">Create Order</h2>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
        
        {/* Left Column: POS / Cart */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-paper rounded-2xl border border-line shadow-sm overflow-hidden flex flex-col" style={{ height: '600px' }}>
            
            {/* Product Search */}
            <div className="p-4 border-b border-line bg-porcelain/30">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-petrol-300" />
                <input 
                  value={search} 
                  onChange={e => setSearch(e.target.value)} 
                  placeholder="Search products to add..." 
                  className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-line rounded-xl focus:outline-none focus:border-petrol shadow-sm"
                />
              </div>
              {search && (
                <div className="absolute z-10 w-full max-w-md mt-2 bg-white border border-line rounded-xl shadow-lg max-h-64 overflow-y-auto">
                  {filteredProducts.map(p => (
                    <button 
                      key={p._id} 
                      type="button"
                      onClick={() => { addToCart(p); setSearch(''); }}
                      className="w-full text-left px-4 py-3 hover:bg-porcelain flex justify-between items-center border-b border-line last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium text-ink">{p.name}</p>
                        <p className="text-xs text-petrol-300">KES {p.price} • {p.stockQty} in stock</p>
                      </div>
                      <Plus size={16} className="text-petrol" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-petrol-300">
                  <Package size={48} className="mb-4 opacity-50" />
                  <p className="text-sm font-medium">Cart is empty</p>
                  <p className="text-xs mt-1">Search and add products above</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-porcelain/30 border border-line rounded-xl">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-ink">{item.name}</p>
                      <p className="text-xs text-petrol-300">KES {item.price}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center bg-white border border-line rounded-lg overflow-hidden">
                        <button type="button" onClick={() => updateQty(item.id, -1)} className="px-2 py-1 text-ink hover:bg-porcelain">-</button>
                        <span className="px-2 text-sm font-medium w-8 text-center">{item.qty}</span>
                        <button type="button" onClick={() => updateQty(item.id, 1)} className="px-2 py-1 text-ink hover:bg-porcelain">+</button>
                      </div>
                      <p className="text-sm font-semibold text-ink w-20 text-right">KES {(item.price * item.qty).toLocaleString()}</p>
                      <button type="button" onClick={() => removeFromCart(item.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Totals */}
            <div className="p-4 border-t border-line bg-porcelain/50">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-ink/70">
                  <span>Subtotal</span>
                  <span>KES {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-ink/70">
                  <span>Delivery Fee</span>
                  <span>KES {cart.length > 0 ? deliveryFee.toLocaleString() : 0}</span>
                </div>
                <div className="flex justify-between font-bold text-lg text-ink pt-2 border-t border-line">
                  <span>Total</span>
                  <span>KES {total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Customer Details */}
        <div className="space-y-6">
          <div className="bg-paper rounded-2xl border border-line shadow-sm p-5 space-y-4">
            <h3 className="font-semibold text-ink">Customer Details</h3>
            <div>
              <label className="block text-xs font-medium text-petrol-300 mb-1">Name <span className="text-red-500">*</span></label>
              <input required value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full px-3 py-2 text-sm bg-white border border-line rounded-xl focus:outline-none focus:border-petrol shadow-sm" placeholder="Jane Wanjiku" />
            </div>
            <div>
              <label className="block text-xs font-medium text-petrol-300 mb-1">Phone</label>
              <input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full px-3 py-2 text-sm bg-white border border-line rounded-xl focus:outline-none focus:border-petrol shadow-sm" placeholder="0712 345 678" />
            </div>
            <div>
              <label className="block text-xs font-medium text-petrol-300 mb-1">Email</label>
              <input type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} className="w-full px-3 py-2 text-sm bg-white border border-line rounded-xl focus:outline-none focus:border-petrol shadow-sm" placeholder="jane.wanjiku@email.com" />
            </div>
            <div>
              <label className="block text-xs font-medium text-petrol-300 mb-1">Address / Notes</label>
              <textarea value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} className="w-full px-3 py-2 text-sm bg-white border border-line rounded-xl focus:outline-none focus:border-petrol shadow-sm" placeholder="Delivery address or walk-in notes" rows={3} />
            </div>
          </div>

          <div className="bg-paper rounded-2xl border border-line shadow-sm p-5 space-y-4">
            <h3 className="font-semibold text-ink">Payment</h3>
            <CustomSelect 
              label="Method"
              value={paymentMethod}
              onChange={setPaymentMethod}
              options={[
                { label: 'M-PESA', value: 'mpesa' },
                { label: 'Card', value: 'card' },
                { label: 'Cash on Delivery', value: 'cod' },
              ]}
            />
            <CustomSelect 
              label="Status"
              value={paymentStatus}
              onChange={setPaymentStatus}
              options={[
                { label: 'Pending', value: 'pending' },
                { label: 'Paid', value: 'paid' },
              ]}
            />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting || cart.length === 0}
            className="w-full bg-petrol text-paper font-semibold py-3 rounded-xl shadow-sm hover:bg-petrol/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating Order...' : 'Create Order'}
          </button>
        </div>

      </form>
    </div>
  );
}
