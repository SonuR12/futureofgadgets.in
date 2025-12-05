import HeaderSlider from "@/components/home/HomeSlider";
import { Footer } from "@/components/Footer";
import ShopByBrands from "@/components/home/ShopByBrands";
import PopularCategories from "@/components/home/PopularCategories";
import PromotionalBanner from "@/components/home/PromotionalBanner";
import BestSeller from "@/components/home/BestSeller";
import TrendingNow from "@/components/home/TrendingNow";
import DealoftheDay from "@/components/home/DealoftheDay";
import NewArrivals from "@/components/home/NewArrivals";
import FeaturedSection from "@/components/home/FeaturedSection";
import Laptopcarousal from "@/components/home/laptop-carousal";
import CustomerReview from "@/components/home/CustomerReview";
import AlwaysWithYou from "@/components/home/AlwaysWithYou";
import YoutubeSection from "@/components/home/YoutubeSection";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50/5">
      {/* Hero Slider */}
      <section className="bg-white">
        <div className="mx-auto max-w-[1400px] sm:px-6 sm:pb-6">
          <HeaderSlider />
        </div>
      </section>
      <div className="space-t-4 sm:space-t-8">
        <Laptopcarousal />
        <DealoftheDay />
        <NewArrivals />
        <FeaturedSection/>
        <PopularCategories />
        <PromotionalBanner />
        <BestSeller />
        <ShopByBrands />
        <TrendingNow />
        <AlwaysWithYou />
        <YoutubeSection />
        <CustomerReview/>
      </div>
      <Footer />
    </main>
  );
}
