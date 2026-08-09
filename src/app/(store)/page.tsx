import { Hero } from '@/components/sections/Hero';
import { CategorySection } from '@/components/sections/CategorySection';
import { TrustBar } from '@/components/sections/TrustBar';
import { TrendingSection } from '@/components/sections/TrendingSection';
import { SpecialOffers } from '@/components/sections/SpecialOffers';
import { HowItWorks } from '@/components/sections/HowItWorks';
import { BrandsRail } from '@/components/sections/BrandsRail';
import { NewsletterSignup } from '@/components/sections/NewsletterSignup';

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustBar />
      <CategorySection />
      <TrendingSection />
      <SpecialOffers />
      <HowItWorks />
      <BrandsRail />
      <NewsletterSignup />
    </>
  );
}
