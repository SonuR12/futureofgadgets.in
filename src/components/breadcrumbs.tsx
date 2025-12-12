"use client";

import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Generate structured data for breadcrumbs
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      "item": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://futureofgadgets.in'}${item.href}`
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData)
        }}
      />
      <nav 
        className={`text-xs sm:text-sm text-gray-600 items-center gap-1 ${className}`}
        aria-label="Breadcrumb"
      >
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-1">
            {index > 0 && (
              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 text-gray-400" />
            )}
            {index === items.length - 1 ? (
              <span className="text-black font-medium truncate">{item.label}</span>
            ) : (
              <button
                onClick={() => router.push(item.href)}
                className="hover:text-blue-600 cursor-pointer hover:underline transition-colors whitespace-nowrap"
              >
                {item.label}
              </button>
            )}
          </div>
        ))}
      </nav>
    </>
  );
}