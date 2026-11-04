import Link from 'next/link';
import { Logo } from '@/components/layout/Logo';
import { CheckoutFooter } from '@/components/layout/CheckoutFooter';

/**
 * Checkout shell: just the logo, a way back to the cart, and policy links. No store
 * navigation, search, mega menu or tab bar, so nothing competes with finishing the order.
 */
export default function CheckoutGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-theme="storefront" className="flex min-h-full flex-col bg-porcelain text-ink">
      <header className="border-b border-line bg-paper">
        <div className="mx-auto grid h-16 max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 sm:px-6 lg:px-8">
          <Logo size="md" />
          <p className="hidden text-sm font-semibold tracking-tight text-ink sm:block">Secure checkout</p>
          <Link
            href="/cart"
            className="col-start-3 justify-self-end text-sm font-medium text-petrol underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-petrol/40"
          >
            Back to cart
          </Link>
        </div>
      </header>

      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        {children}
      </main>

      <CheckoutFooter />

    </div>
  );
}
