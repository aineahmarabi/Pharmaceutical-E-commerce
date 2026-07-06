import React from 'react';
import Link from 'next/link';
import { Globe, MessageCircle, Share2 } from 'lucide-react';
import { branding } from '@/lib/config/branding';
import { categories } from '@/lib/fixtures/categories';

export function Footer() {
  return (
    <footer className="bg-ink text-porcelain">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Col 1 — Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
                <rect x="8" y="18" width="32" height="12" rx="6" fill="#5FA89C" />
                <rect x="8" y="18" width="16" height="12" rx="6" fill="#0E4D45" />
                <line x1="24" y1="18" x2="24" y2="30" stroke="white" strokeWidth="1.5" />
              </svg>
              <span className="font-display font-bold text-xl">{branding.name}</span>
            </div>
            <p className="text-sm text-porcelain/60 leading-relaxed max-w-xs">{branding.tagline}. Your trusted online pharmacy in Kenya.</p>
            <div className="flex items-center gap-3 mt-5">
              {[
                { icon: Globe, href: branding.socialLinks.twitter, label: 'Twitter/X' },
                { icon: Share2, href: branding.socialLinks.instagram, label: 'Instagram' },
                { icon: MessageCircle, href: branding.socialLinks.facebook, label: 'Facebook' },
              ].map(({ icon: Icon, href, label }) => (
                <a key={label} href={href} aria-label={label} className="w-9 h-9 rounded-full border border-porcelain/20 flex items-center justify-center text-porcelain/60 hover:bg-porcelain/10 hover:text-porcelain transition-colors">
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Col 2 — Quick links */}
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-petrol-300 mb-4">Quick Links</p>
            <ul className="space-y-2.5">
              {[
                { label: 'About Us', href: '/about' },
                { label: 'Contact', href: '/contact' },
                { label: 'FAQ', href: '/faq' },
                { label: 'Blog', href: '/blog' },
                { label: 'Track Order', href: '/account/orders' },
                { label: 'Store Locator', href: '/store-locator' },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-porcelain/60 hover:text-porcelain transition-colors">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Categories */}
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-petrol-300 mb-4">Categories</p>
            <ul className="space-y-2.5">
              {categories.slice(0, 6).map((cat) => (
                <li key={cat.slug}>
                  <Link href={`/category/${cat.slug}`} className="text-sm text-porcelain/60 hover:text-porcelain transition-colors">{cat.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Contact */}
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-petrol-300 mb-4">Contact</p>
            <address className="not-italic space-y-2.5 text-sm text-porcelain/60">
              <p>{branding.address}</p>
              <a href={`tel:${branding.phone}`} className="block hover:text-porcelain transition-colors">{branding.phone}</a>

              <a href={`https://wa.me/${branding.whatsapp}`} target="_blank" rel="noopener noreferrer" className="block text-whatsapp hover:opacity-80 transition-opacity">
                WhatsApp Chat →
              </a>
            </address>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-12 pt-6 border-t border-porcelain/10 text-xs text-porcelain/40">
          <p>© 2026 {branding.name}. All rights reserved.</p>
          <div className="flex items-center gap-4">
            {['Shipping Policy', 'Returns', 'Terms', 'Privacy'].map((label) => (
              <a key={label} href="#" className="hover:text-porcelain/70 transition-colors">{label}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
