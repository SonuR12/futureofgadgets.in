"use client";

import { useState, useEffect } from "react";
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
import { GitCompareArrows, Headset, ShieldCheck, Truck } from "lucide-react";
import Laptopcarousal from "@/components/home/laptop-carousal";
import CustomerReview from "@/components/home/CustomerReview";
import Loading from "./loading";
import AlwaysWithYou from "@/components/home/AlwaysWithYou";
import YoutubeSection from "@/components/home/YoutubeSection";

export default function HomePage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <Loading/>
      // <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50 gap-4">
      //   <img src="/logo.png" alt="Logo" className="w-20 h-20 animate-pulse rounded-full" />
      //   <p className="text-xl font-semibold text-gray-700 animate-pulse">Future of Gadgets is loading...</p>
      // </div>
    );
  }


  const extraData = [
    {
      title: "Free Delivery",
      description: "Free shipping on orders over $100",
      icon: <Truck className="w-8 h-8 sm:w-10 sm:h-10" />,
    },
    {
      title: "Free Returns",
      description: "7-day return policy",
      icon: <GitCompareArrows className="w-8 h-8 sm:w-10 sm:h-10" />,
    },
    {
      title: "Customer Support",
      description: "Friendly 24/7 customer support",
      icon: <Headset className="w-8 h-8 sm:w-10 sm:h-10" />,
    },
    {
      title: "Money Back Guarantee",
      description: "Quality checked by our team",
      icon: <ShieldCheck className="w-8 h-8 sm:w-10 sm:h-10" />,
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50/5">
      {/* Hero Slider */}
      <section className="bg-white dark:bg-gray-800">
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
          {/* <section className="py-6 sm:py-10">
      <div className="mx-auto max-w-[1400px] px-3 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {extraData?.map((item, index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3 bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center sm:text-left"
            >
              <div className="text-blue-600 dark:text-blue-400 flex-shrink-0">
                {item?.icon}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-xs sm:text-base">
                  {item?.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-[10px] sm:text-xs mt-0.5 sm:mt-1">
                  {item?.description}
                </p>
              </div>
            </div>
          ))}
        </div>
        </div>
        </section>  */}
      <Footer />
    </main>
  );
}
