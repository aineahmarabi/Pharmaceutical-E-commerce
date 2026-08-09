import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/components/ui/Toast';
import { ConvexClientProvider } from '@/lib/convex';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jbmono', display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'PharmaCare — Your health, delivered', template: '%s | PharmaCare' },
  description: 'Genuine medicines and wellness products, delivered across Kenya.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`h-full antialiased ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-full flex flex-col">
        <ConvexClientProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
