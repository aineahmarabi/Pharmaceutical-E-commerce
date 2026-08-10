'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useBranding } from '@/hooks/useBranding';
import { categories as fixtureCategories } from '@/lib/fixtures/categories';
import { BrandName } from '@/components/ui/BrandName';

function XIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function InstagramIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M13.5 21v-7.6h2.55l.38-2.96h-2.93V8.55c0-.86.24-1.44 1.47-1.44h1.57V4.46A21 21 0 0 0 14.3 4.3c-2.24 0-3.78 1.37-3.78 3.87v2.27H8v2.96h2.52V21h2.98Z" />
    </svg>
  );
}

export function Footer() {
  const branding = useBranding();
  const liveCategories = useQuery(api.taxonomy.listCategories, {});
  const categories = liveCategories && liveCategories.length > 0 ? liveCategories : fixtureCategories;

  const socialLinks = [
    { icon: XIcon, href: branding.socialLinks?.twitter, label: 'X (Twitter)' },
    { icon: InstagramIcon, href: branding.socialLinks?.instagram, label: 'Instagram' },
    { icon: FacebookIcon, href: branding.socialLinks?.facebook, label: 'Facebook' },
  ].filter((s): s is typeof s & { href: string } => Boolean(s.href));

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
              {branding.logo ? (
                <img src={branding.logo} alt={branding.name} className="h-8 object-contain" />
              ) : (
                <BrandName name={branding.name} className="font-display font-bold text-xl" accentClassName="text-petrol-300" />
              )}
            </div>
            <p className="text-sm text-porcelain/60 leading-relaxed max-w-xs">{branding.tagline}. Your trusted online pharmacy in Kenya.</p>
            {socialLinks.length > 0 && (
              <div className="flex items-center gap-3 mt-5">
                {socialLinks.map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-9 h-9 rounded-full border border-porcelain/20 flex items-center justify-center text-porcelain/60 hover:bg-porcelain/10 hover:text-porcelain transition-colors"
                  >
                    <Icon size={15} />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Col 2 — Quick links */}
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-petrol-300 mb-4">Quick Links</p>
            <ul className="space-y-2.5">
              {[
                { label: 'About Us', href: '/about' },
                { label: 'Contact', href: '/contact' },
                { label: 'FAQ', href: '/faq' },
                { label: 'Track Order', href: '/account/orders' },
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
            {[
              { label: 'Shipping Policy', href: '/shipping' },
              { label: 'Returns', href: '/returns' },
              { label: 'Terms', href: '/terms' },
              { label: 'Privacy', href: '/privacy' },
            ].map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-porcelain/70 transition-colors">{item.label}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
