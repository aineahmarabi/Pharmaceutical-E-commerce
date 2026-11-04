import type { Metadata } from 'next';
import { Jost, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/components/ui/Toast';
import { ConvexClientProvider } from '@/lib/convex';
import { CustomerAuthProvider } from '@/lib/auth/customerAuth';

// Jost is the one typeface for the whole product (storefront and admin).
const jost = Jost({ subsets: ['latin'], variable: '--font-jost', display: 'swap' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jbmono', display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'PharmaCare — Your health, delivered', template: '%s | PharmaCare' },
  description: 'Genuine medicines and wellness products, delivered across Kenya.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`h-full antialiased ${jost.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-full flex flex-col">
        <script dangerouslySetInnerHTML={{ __html: "try{if(localStorage.getItem('pc-theme')==='dark')document.documentElement.classList.add('dark')}catch(e){}" }} />
        <ConvexClientProvider>
          <ToastProvider>
            <CustomerAuthProvider>
              {children}
            </CustomerAuthProvider>
          </ToastProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
