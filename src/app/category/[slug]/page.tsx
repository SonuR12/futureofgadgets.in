"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function CategorySlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");

  useEffect(() => {
    params.then((p) => {
      setSlug(p.slug);
      
      // Handle specific laptop categories
      if (p.slug === "refurbished-laptops") {
        setCategories([
          { name: "Gaming Laptops", slug: "refurbished-gaming-laptops", image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&h=300&fit=crop" },
          { name: "Business Laptops", slug: "refurbished-business-laptops", image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop" },
          { name: "Ultrabooks", slug: "refurbished-ultrabooks", image: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=400&h=300&fit=crop" },
          { name: "Budget Laptops", slug: "refurbished-budget-laptops", image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=300&fit=crop" },
          { name: "Workstations", slug: "refurbished-workstations", image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&h=300&fit=crop" },
          { name: "2-in-1 Laptops", slug: "refurbished-2in1-laptops", image: "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=400&h=300&fit=crop" }
        ]);
        setTitle("Refurbished Laptops");
        setLoading(false);
        return;
      }
      
      if (p.slug === "open-box-laptops") {
        setCategories([
          { name: "Gaming Laptops", slug: "open-box-gaming-laptops", image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&h=300&fit=crop" },
          { name: "Business Laptops", slug: "open-box-business-laptops", image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop" },
          { name: "Ultrabooks", slug: "open-box-ultrabooks", image: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=400&h=300&fit=crop" },
          { name: "Budget Laptops", slug: "open-box-budget-laptops", image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=300&fit=crop" },
          { name: "Workstations", slug: "open-box-workstations", image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&h=300&fit=crop" },
          { name: "2-in-1 Laptops", slug: "open-box-2in1-laptops", image: "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=400&h=300&fit=crop" }
        ]);
        setTitle("Open Box Laptops");
        setLoading(false);
        return;
      }
      
      // Fetch from API for other categories
      fetch("/api/settings")
        .then((res) => res.json())
        .then((data) => {
          if (p.slug === "laptop" && data.laptopCategories) {
            setCategories(data.laptopCategories);
            setTitle("Laptop Categories");
          } else if (p.slug === "accessories" && data.accessories) {
            setCategories(data.accessories);
            setTitle("Accessories");
          } else if (data.categorySections) {
            const section = data.categorySections.find(
              (s: any) => s.title.toLowerCase().replace(/\s+/g, "-") === p.slug
            );
            if (section) {
              setCategories(section.categories);
              setTitle(section.title);
            }
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    });
  }, [params]);

  if (loading)
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-9 w-64 bg-gray-200 rounded-lg animate-pulse mb-8" />
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex justify-center">
                <div className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 -ml-8 md:-ml-12 lg:-ml-8 xl:-ml-12 rounded-full bg-gray-200/60 border border-gray-200 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );

  if (!title && categories.length === 0) {
    return (
      <div className="min-h-[90vh] flex flex-row items-center justify-center bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4">
            Category Not Available
          </h1>
          <p className="text-gray-600 mb-6">
            The category you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link href="/" className="text-blue-600 hover:underline">
            Go back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-2xl sm:text-3xl font-bold mb-8">{title}</h1>

        {categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No items found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map((item, index) => (
              <Link
                key={`${item.slug}-${index}`}
                href={`/search?q=${item.slug}`}
                className="group flex justify-center"
              >
                <div className="relative w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-34 lg:h-34 -ml-8 md:-ml-12 lg:-ml-8 xl:-ml-12 rounded-full bg-gray-200/40 border border-gray-200/50 overflow-hidden transition-all duration-300">
                  <div className="absolute inset-0 flex items-center justify-center p-2 sm:p-3">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      width={90}
                      height={90}
                      className="object-contain group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                   <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-black/70 text-white text-center py-1 sm:py-1.5 px-1 text-[9px] sm:text-[10px] font-semibold">
                      <span className="block mx-auto leading-tight break-words w-[62px]">
                        {item.name}
                      </span>
                    </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
