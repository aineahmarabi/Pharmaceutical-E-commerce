import { Hero } from '@/components/sections/Hero';
import { CategorySection } from '@/components/sections/CategorySection';
import { TrendingSection } from '@/components/sections/TrendingSection';
import { ConditionSection } from '@/components/sections/ConditionSection';
import { SpecialOffers } from '@/components/sections/SpecialOffers';
import { BrandsRail } from '@/components/sections/BrandsRail';

export default function HomePage() {
  return (
    <>
      <Hero />
      <CategorySection />
      <TrendingSection />
      <ConditionSection />
      <SpecialOffers />
      <BrandsRail />
    </>
  );
}
