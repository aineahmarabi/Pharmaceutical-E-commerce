import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppButton } from '@/components/layout/WhatsAppButton';
import { ScrollToTop } from '@/components/layout/ScrollToTop';
import { MedicalGlossary } from '@/components/layout/MedicalGlossary';
import { MobileTabBar } from '@/components/layout/MobileTabBar';
import { CartDrawer } from '@/components/cart/CartDrawer';

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-theme="storefront" className="flex flex-1 flex-col min-h-full bg-porcelain text-ink">
      <Header />
      <main id="main-content" tabIndex={-1} className="flex-1 pb-16 focus:outline-none md:pb-0">{children}</main>
      <Footer />
      <WhatsAppButton />
      <ScrollToTop />
      <MedicalGlossary />
      <MobileTabBar />
      <CartDrawer />
    </div>
  );
}
