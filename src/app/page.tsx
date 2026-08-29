import { HeroSection } from '@/components/home/HeroSection';
import { FeaturedVehicles } from '@/components/home/FeaturedVehicles';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { FeaturedCollections } from '@/components/home/FeaturedCollections';
import { TrustSection } from '@/components/home/TrustSection';
import { EditorialSection } from '@/components/home/EditorialSection';
import { SellTradeCTA } from '@/components/home/SellTradeCTA';
import { NewsletterSection } from '@/components/home/NewsletterSection';

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <FeaturedVehicles />
      <CategoryGrid />
      <FeaturedCollections />
      <TrustSection />
      <EditorialSection />
      <SellTradeCTA />
      <NewsletterSection />
    </main>
  );
}