import { CategorySection } from '@/components/sections/CategorySection';
import { Hero } from '@/components/sections/Hero';
import { BuyAgain } from '@/components/sections/BuyAgain';
import { RefillDueCard } from '@/components/account/RefillReminder';
import { NeedTiles } from '@/components/sections/NeedTiles';
import { NeedShelf } from '@/components/sections/NeedShelf';
import { Faq } from '@/components/sections/Faq';

export default function HomePage() {
  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <CategorySection />
      </div>

      {/* Full-width opening banner: fills the first screen and scrolls away with the page. */}
      <Hero />

      <div className="mx-auto max-w-7xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
        <RefillDueCard />
        <BuyAgain />
        <NeedTiles />
        <NeedShelf title="Pain relief" slug="pain-relief" />
        <NeedShelf title="Cold & flu" slug="cough-cold" />
        <NeedShelf title="Vitamins" slug="vitamins-supplements" />
        <Faq />
      </div>
    </>
  );
}
