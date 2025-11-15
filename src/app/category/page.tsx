"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronDown } from "lucide-react";

export default function CategoryPage() {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<
    Record<number, boolean>
  >({});
  const INITIAL_ITEMS = 12;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/settings");
        const data = await response.json();

        const allSections = [];

        if (data.categorySections) {
          allSections.push(...data.categorySections);
        }

        setSections(allSections);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen bg-transparent py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-2xl sm:text-3xl font-bold mb-8">
          Shop by Category
        </h1>

        {loading ? (
          <div className="space-y-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
                <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {[...Array(6)].map((_, j) => (
                    <div key={j} className="flex justify-center">
                      <div className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 bg-gray-200 rounded-full"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : sections.length > 0 ? (
          <div className="space-y-10">
            {sections.map((section, idx) => (
              <div key={idx} className="pb-2">
                <div className="flex items-center justify-between text-center mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    {section.title}
                  </h2>
                  <Link
                    href={`/category/${section.title
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm group/link flex items-center gap-1"
                  >
                    View All{" "}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
                  </Link>
                </div>
                {section.categories && section.categories.length > 0 ? (
                  <>
                    <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                      {(expandedSections[idx]
                        ? section.categories
                        : section.categories.slice(0, INITIAL_ITEMS)
                      ).map((cat: any, catIdx: number) => (
                        <Link
                          key={`${idx}-${catIdx}-${cat.slug}`}
                          href={`/search?q=${cat.slug}`}
                          className="group flex justify-center"
                        >
                          <div className="relative w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 -ml-8 md:-ml-12 lg:-ml-8 xl:-ml-12 rounded-full bg-gray-200/50 border border-gray-200/50 overflow-hidden transition-all duration-300">
                            <div className="absolute inset-0 flex items-center justify-center p-2 sm:p-3">
                              <Image
                                src={cat.image || "/placeholder.svg"}
                                alt={cat.name}
                                width={90}
                                height={90}
                                className="object-contain group-hover:scale-110 transition-transform duration-300"
                              />
                            </div>
                            <div
                              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-black/70 text-white text-center py-1 sm:py-1.5 px-1 text-[9px] sm:text-[10px] font-semibold"
                            >
                              <span className="block mx-auto leading-tight break-words w-[62px]">
                                {cat.name}
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                    {section.categories.length > INITIAL_ITEMS && (
                      <div className="mt-4">
                        <button
                          onClick={() =>
                            setExpandedSections((prev) => ({
                              ...prev,
                              [idx]: !prev[idx],
                            }))
                          }
                          className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          {expandedSections[idx] ? "View Less" : `View More`}
                          <ChevronDown
                            className={`w-4 h-4 transition-transform ${
                              expandedSections[idx] ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-gray-500 text-left">No items available</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500">No categories found</p>
          </div>
        )}
      </div>
    </div>
  );
}
