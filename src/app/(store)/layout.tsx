import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppButton } from '@/components/layout/WhatsAppButton';
import { MobileTabBar } from '@/components/layout/MobileTabBar';
import { CartDrawer } from '@/components/cart/CartDrawer';

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-theme="storefront" className="flex flex-col min-h-full">
      <Header />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <Footer />
      <WhatsAppButton />
      <MobileTabBar />
      <CartDrawer />
    </div>
  );
}
