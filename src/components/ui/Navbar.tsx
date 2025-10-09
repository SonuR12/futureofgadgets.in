"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { getCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ShoppingCart, Search, User } from "lucide-react";
import { ThemeToggle } from "./theme-toggler";
import { AuthDialog } from "@/components/auth-dialog";

export function Navbar() {
  const { data: session, status } = useSession();
  const [count, setCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showCategories, setShowCategories] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  const navLinks = [
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  useEffect(() => {
    const sync = () => {
      const items = getCart();
      setCount(items.reduce((n, i) => n + (i.qty || 1), 0));
    };
    sync();
    const onStorage = () => sync();
    const onCartUpdated = () => sync();
    window.addEventListener("storage", onStorage);
    window.addEventListener("v0-cart-updated", onCartUpdated as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(
        "v0-cart-updated",
        onCartUpdated as EventListener
      );
    };
  }, []);

  const fetchSuggestions = async (query: string) => {
    if (query.length < 1) {
      setSuggestions([]);
      return;
    }
    try {
      const response = await fetch("/api/products");
      const products = await response.json();
      const queryLower = query.toLowerCase();
      
      // Filter products by name, category, and brand
      const productMatches = products.filter(
        (product: any) =>
          product.name.toLowerCase().includes(queryLower) ||
          product.category.toLowerCase().includes(queryLower) ||
          product.brand?.toLowerCase().includes(queryLower)
      ).slice(0, 6);
      
      setSuggestions(productMatches);
    } catch (error) {
      setSuggestions([]);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSuggestions(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset selected index when suggestions change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [suggestions]);

  // Scroll detection for navbar visibility
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const currentScrollPos = window.scrollY;
          const isScrollingDown = currentScrollPos > prevScrollPos;

          setIsVisible(currentScrollPos < 100 ? true : !isScrollingDown);
          setPrevScrollPos(currentScrollPos);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [prevScrollPos]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur-lg transition-transform duration-300 md:shadow-sm ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-2 md:py-3">
        <div className="flex items-center gap-1 md:gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 w-10 h-10"
            aria-label="Go to homepage"
          >
            <img
              src="/logo.png"
              alt="Store logo"
              className="h-10 w-full rounded bg-transparent"
            />
            {/* <span className="font-semibold text-foreground">Electronic</span> */}
          </Link>

          {/* Mobile Categories Dropdown */}
          <div
            className="md:hidden relative"
            onMouseEnter={() => setShowCategories(true)}
            onMouseLeave={() => setShowCategories(false)}
          >
              <Button
                variant="ghost"
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium hover:bg-gray-100"
              >
                Categories
                <svg
                  className={`w-4 h-4 transition-transform ${
                    showCategories ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </Button>

              {showCategories && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50">
                  <div className="p-2">
                    <Link
                      href="/category/laptops"
                      onClick={() => setShowCategories(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-blue-600 dark:text-blue-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-sm">Laptops</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Gaming & Business
                        </p>
                      </div>
                    </Link>
                    <Link
                      href="/category/desktops"
                      onClick={() => setShowCategories(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-green-600 dark:text-green-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-sm">Desktops</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Workstations & PCs
                        </p>
                      </div>
                    </Link>
                    <Link
                      href="/category/monitors"
                      onClick={() => setShowCategories(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-purple-600 dark:text-purple-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-sm">Monitors</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          4K & Gaming Displays
                        </p>
                      </div>
                    </Link>
                    <Link
                      href="/category/keyboards"
                      onClick={() => setShowCategories(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-orange-600 dark:text-orange-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-sm">Keyboards</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Mechanical & Wireless
                        </p>
                      </div>
                    </Link>
                    <Link
                      href="/category/headphones"
                      onClick={() => setShowCategories(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-red-600 dark:text-red-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-sm">Headphones</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Wireless & Gaming
                        </p>
                      </div>
                    </Link>
                    <div className="border-t border-gray-200 dark:border-gray-600 mt-2 pt-2">
                      <Link
                        href="/category"
                        onClick={() => setShowCategories(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors"
                      >
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-blue-600 dark:text-blue-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-sm text-blue-600 dark:text-blue-400">
                            All Categories
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Browse everything
                          </p>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
          </div>
          <div className="hidden md:flex items-center gap-1">
            <div
              className="relative"
              onMouseEnter={() => setShowCategories(true)}
              onMouseLeave={() => setShowCategories(false)}
            >
              <Button
                variant="ghost"
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium hover:bg-gray-100"
              >
                Categories
                <svg
                  className={`w-4 h-4 transition-transform ${
                    showCategories ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </Button>

              {showCategories && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50">
                  <div className="p-2">
                    <Link
                      href="/category/laptops"
                      onClick={() => setShowCategories(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-blue-600 dark:text-blue-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-sm">Laptops</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Gaming & Business
                        </p>
                      </div>
                    </Link>
                    <Link
                      href="/category/desktops"
                      onClick={() => setShowCategories(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-green-600 dark:text-green-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-sm">Desktops</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Workstations & PCs
                        </p>
                      </div>
                    </Link>
                    <Link
                      href="/category/monitors"
                      onClick={() => setShowCategories(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-purple-600 dark:text-purple-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-sm">Monitors</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          4K & Gaming Displays
                        </p>
                      </div>
                    </Link>
                    <Link
                      href="/category/keyboards"
                      onClick={() => setShowCategories(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-orange-600 dark:text-orange-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-sm">Keyboards</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Mechanical & Wireless
                        </p>
                      </div>
                    </Link>
                    <Link
                      href="/category/headphones"
                      onClick={() => setShowCategories(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-red-600 dark:text-red-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-sm">Headphones</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Wireless & Gaming
                        </p>
                      </div>
                    </Link>
                    <div className="border-t border-gray-200 dark:border-gray-600 mt-2 pt-2">
                      <Link
                        href="/category"
                        onClick={() => setShowCategories(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors"
                      >
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-blue-600 dark:text-blue-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-sm text-blue-600 dark:text-blue-400">
                            All Categories
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Browse everything
                          </p>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 text-sm font-medium transition-colors relative ${
                  pathname === link.href
                    ? "text-blue-600 after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:bg-blue-600"
                    : "text-gray-700 hover:text-blue-600"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1 md:gap-3">
          <div className="hidden md:flex items-center relative">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  setShowSuggestions(false);
                  const query = searchQuery.trim().toLowerCase();
                  const categories = ['laptops', 'desktops', 'monitors', 'keyboards', 'headphones'];
                  const matchedCategory = categories.find(cat => cat.includes(query) || query.includes(cat));
                  
                  if (matchedCategory) {
                    router.push(`/category/${matchedCategory}`);
                  } else {
                    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                  }
                }
              }}
              className="flex items-center relative"
            >
              <Input
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                  setSelectedIndex(-1);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                onKeyDown={(e) => {
                  if (!showSuggestions || suggestions.length === 0) return;

                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setSelectedIndex((prev) =>
                      prev < suggestions.length - 1 ? prev + 1 : 0
                    );
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setSelectedIndex((prev) =>
                      prev > 0 ? prev - 1 : suggestions.length - 1
                    );
                  } else if (e.key === "Enter" && selectedIndex >= 0) {
                    e.preventDefault();
                    setShowSuggestions(false);
                    router.push(`/products/${suggestions[selectedIndex].slug}`);
                  } else if (e.key === "Escape") {
                    setShowSuggestions(false);
                    setSelectedIndex(-1);
                  }
                }}
                placeholder="Search laptops, keyboards, monitors..."
                className="w-80 pr-10"
              />
              <Button
                type="submit"
                size="sm"
                className="absolute right-1 h-7 w-7 p-0 z-20"
                disabled={!searchQuery.trim()}
                onClick={(e) => e.stopPropagation()}
              >
                <Search className="h-4 w-4" />
              </Button>

              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-50 mt-1">
                  {suggestions.map((product, index) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowSuggestions(false);
                        router.push(`/products/${product.slug}`);
                      }}
                      className={`w-full px-4 py-3 text-left flex items-center gap-3 border-b dark:border-gray-600 last:border-b-0 cursor-pointer transition-colors ${
                        index === selectedIndex
                          ? "bg-blue-50 dark:bg-blue-900/50"
                          : "hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      <img
                        src={
                          product.frontImage ||
                          product.image ||
                          "/placeholder.svg"
                        }
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-900 dark:text-gray-100">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {product.category} • ₹{product.price}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </form>
          </div>
          <Link href="/cart" aria-label="Open cart" className="relative">
            <Button
              variant="outline"
              size="sm"
              className="relative p-2 md:px-3 md:py-2"
            >
              <ShoppingCart className="h-4 w-4 md:h-5 md:w-5" />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 md:h-5 md:w-5 rounded-full bg-blue-600 text-xs font-semibold text-white flex items-center justify-center">
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild className="cursor-pointer">
              <Button
                variant="ghost"
                className="relative p-0 h-8 w-8 md:h-10 md:w-10 rounded-full border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-200"
              >
                {status === "loading" ? (
                  <div className="h-9 w-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center animate-pulse">
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                ) : session?.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 md:h-9 md:w-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-xs md:text-sm font-semibold text-white">
                      {session?.user?.name?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                )}
                {session && (
                  <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-background"></div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72 p-0" align="end" forceMount>
              {status === "loading" ? (
                <div className="p-4 flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </div>
              ) : session ? (
                <>
                  <div className="relative p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        {session.user?.image ? (
                          <Image
                            src={session.user.image}
                            alt={session.user.name || "User"}
                            width={48}
                            height={48}
                            className="h-12 w-12 rounded-full object-cover ring-3 ring-white dark:ring-gray-800 shadow-lg"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ring-3 ring-white dark:ring-gray-800 shadow-lg">
                            <span className="text-lg font-semibold text-white">
                              {session?.user?.name?.charAt(0).toUpperCase() ||
                                "U"}
                            </span>
                          </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-white dark:border-gray-800"></div>
                      </div>
                      <div className="flex flex-col space-y-1 leading-none min-w-0 flex-1">
                        <p className="font-semibold text-base text-gray-900 dark:text-white">
                          {session.user?.name || "User"}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                          {session.user?.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  <DropdownMenuSeparator className="my-0" />
                  <div className="p-2">
                    {session.user?.role === "admin" && (
                      <DropdownMenuItem
                        asChild
                        className="cursor-pointer rounded-lg mb-1"
                      >
                        <Link
                          href="/admin"
                          className="flex items-center gap-3 px-3 py-2.5 hover:bg-orange-50 dark:hover:bg-orange-950 transition-colors"
                        >
                          <div className="h-8 w-8 rounded-lg bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                            <svg
                              className="h-4 w-4 text-orange-600 dark:text-orange-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium text-sm">Admin Panel</p>
                            <p className="text-xs text-muted-foreground">
                              Manage your store
                            </p>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      asChild
                      className="cursor-pointer rounded-lg mb-1"
                    >
                      <Link
                        href="/orders"
                        className="flex items-center gap-3 px-3 py-2.5 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
                      >
                        <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <svg
                            className="h-4 w-4 text-blue-600 dark:text-blue-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-sm">My Orders</p>
                          <p className="text-xs text-muted-foreground">
                            Track your purchases
                          </p>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      asChild
                      className="cursor-pointer rounded-lg mb-1"
                    >
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <svg
                            className="h-4 w-4 text-gray-600 dark:text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-sm">Profile</p>
                          <p className="text-xs text-muted-foreground">
                            Manage your account
                          </p>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-2" />
                    <DropdownMenuItem
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="cursor-pointer rounded-lg flex items-center gap-3 px-3 py-2.5 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                    >
                      <div className="h-8 w-8 rounded-lg bg-red-100 dark:bg-red-900 flex items-center justify-center">
                        <svg
                          className="h-4 w-4 text-red-600 dark:text-red-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-sm">Sign Out</p>
                        <p className="text-xs text-muted-foreground">
                          End your session
                        </p>
                      </div>
                    </DropdownMenuItem>
                  </div>
                </>
              ) : (
                <div className="px-2 pb-2 pt-4">
                  <div className="text-center mb-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-3">
                      <User className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-semibold text-lg">Welcome!</h3>
                    <p className="text-sm text-muted-foreground">
                      Sign in to access your account
                    </p>
                  </div>
                  <div className="space-y-2">
                    <DropdownMenuItem
                      onClick={() => {
                        setAuthMode("signin");
                        setShowAuthDialog(true);
                      }}
                      className="cursor-pointer rounded-lg"
                    >
                      <div className="flex items-center gap-3 px-2 py-2 w-full">
                        <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <svg
                            className="h-4 w-4 text-blue-600 dark:text-blue-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-sm">Sign In</p>
                          <p className="text-xs text-muted-foreground">
                            Access your account
                          </p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setAuthMode("signup");
                        setShowAuthDialog(true);
                      }}
                      className="cursor-pointer rounded-lg"
                    >
                      <div className="flex items-center gap-3 px-2 py-2 w-full">
                        <div className="h-8 w-8 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
                          <svg
                            className="h-4 w-4 text-green-600 dark:text-green-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-sm">Sign Up</p>
                          <p className="text-xs text-muted-foreground">
                            Create new account
                          </p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  </div>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* <ThemeToggle /> */}
        </div>
      </nav>

      {/* Mobile Search Bar */}
      <div className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 pb-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (searchQuery.trim()) {
              setShowSuggestions(false);
              const query = searchQuery.trim().toLowerCase();
              const categories = ['laptops', 'desktops', 'monitors', 'keyboards', 'headphones'];
              const matchedCategory = categories.find(cat => cat.includes(query) || query.includes(cat));
              
              if (matchedCategory) {
                router.push(`/category/${matchedCategory}`);
              } else {
                router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
              }
            }
          }}
          className="relative"
        >
          <Input
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
              setSelectedIndex(-1);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            onKeyDown={(e) => {
              if (!showSuggestions || suggestions.length === 0) return;

              if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIndex((prev) =>
                  prev < suggestions.length - 1 ? prev + 1 : 0
                );
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedIndex((prev) =>
                  prev > 0 ? prev - 1 : suggestions.length - 1
                );
              } else if (e.key === "Enter" && selectedIndex >= 0) {
                e.preventDefault();
                setShowSuggestions(false);
                router.push(`/products/${suggestions[selectedIndex].slug}`);
              } else if (e.key === "Escape") {
                setShowSuggestions(false);
                setSelectedIndex(-1);
              }
            }}
            placeholder="Search laptops, keyboards, monitors.."
            className="w-full h-12 pl-10 pr-12 text-base rounded-lg border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 bg-gray-50 dark:bg-gray-800"
          />

          <Search className="h-6 w-6 absolute left-2 top-1/2 -translate-y-1/2  rounded-lg text-gray-400" />

          {/* Mobile Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-xl z-50 mt-2 max-h-80 overflow-y-auto">
              {suggestions.map((product, index) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowSuggestions(false);
                    router.push(`/products/${product.slug}`);
                  }}
                  className={`w-full px-4 py-4 text-left flex items-center gap-3 border-b dark:border-gray-600 last:border-b-0 cursor-pointer transition-colors ${
                    index === selectedIndex
                      ? "bg-blue-50 dark:bg-blue-900/50"
                      : "hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <img
                    src={
                      product.frontImage || product.image || "/placeholder.svg"
                    }
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {product.category} • ₹{product.price.toLocaleString()}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </form>
      </div>



      <AuthDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        mode={authMode}
      />
    </header>
  );
}