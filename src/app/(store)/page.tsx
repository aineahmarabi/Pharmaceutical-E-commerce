import { Hero } from '@/components/sections/Hero';
import { CategorySection } from '@/components/sections/CategorySection';
import { TrendingSection } from '@/components/sections/TrendingSection';
import { ConditionSection } from '@/components/sections/ConditionSection';
import { SpecialOffers } from '@/components/sections/SpecialOffers';
import { TrustBar } from '@/components/sections/TrustBar';
import { BrandsRail } from '@/components/sections/BrandsRail';
import { HowItWorks } from '@/components/sections/HowItWorks';

export default function HomePage() {
  return (
    <>
      <Hero />
      <CategorySection />
      <TrendingSection />
      <ConditionSection />
      <SpecialOffers />
      <TrustBar />
      <BrandsRail />
      <HowItWorks />
    </>
  );
}
