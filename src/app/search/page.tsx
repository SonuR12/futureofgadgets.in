import { Metadata } from "next";
import SearchContent from "./search-content";

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ q?: string }> }): Promise<Metadata> {
  const params = await searchParams;
  const query = params.q || '';
  
  if (!query) {
    return {
      title: 'Search Products - Future of Gadgets',
      description: 'Search for electronics, laptops, accessories and more at Future of Gadgets'
    };
  }

  return {
    title: `${query} - Future of Gadgets`,
    description: `Find ${query} and related electronics products at Future of Gadgets. Browse laptops, accessories, and tech gadgets.`,
    keywords: `${query}, electronics, gadgets, laptops, accessories, tech products`
  };
}

export default function SearchPage() {
  return <SearchContent />;
}