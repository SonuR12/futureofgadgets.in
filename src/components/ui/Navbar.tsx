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
import { motion, AnimatePresence } from "framer-motion";
import { Search, User, Heart, ShoppingBag, X, Headset } from "lucide-react";
import { getWishlist } from "@/lib/wishlist";
import { AuthDialog } from "../auth-dialog";

export function Navbar() {
  const { data: session, status } = useSession();
  const [count, setCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const router = useRouter();
  const pathname = usePathname();

  // --- Sync cart count ---
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
    const interval = setInterval(sync, 300);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(
        "v0-cart-updated",
        onCartUpdated as EventListener
      );
      clearInterval(interval);
    };
  }, []);

  // --- Sync wishlist count ---
  useEffect(() => {
    const syncWishlist = () => setWishlistCount(getWishlist().length);
    syncWishlist();
    window.addEventListener("wishlist-updated", syncWishlist);
    return () => window.removeEventListener("wishlist-updated", syncWishlist);
  }, []);

  // --- Fetch search suggestions ---
  const fetchSuggestions = async (query: string) => {
    if (query.length < 2) return setSuggestions([]);
    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(query)}&limit=8`
      );
      const products = await response.json();
      setSuggestions(products);
    } catch {
      setSuggestions([]);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchSuggestions(searchQuery), 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // --- Hide navbar on scroll ---
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

  // --- Search submit ---
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setMobileSearchOpen(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur-lg transition-transform duration-300 ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <nav
          className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3"
          aria-label="Primary"
        >
          {/* Left: brand + desktop category dropdown */}
          <div className="flex items-center gap-2 md:gap-2">
            <Link
              href="/"
              className="flex items-center gap-2"
              aria-label="Go to homepage"
            >
              <>
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                  <img
                    src="/logo.png"
                    alt="Store logo"
                    className="h-8 sm:h-10 w-full rounded bg-transparent"
                  />
                </div>

                

                <div className="flex flex-col leading-[1rem] -space-y-1 ">
      <span className="text-xs md:text-sm font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
        Future of
      </span>
      <span className="text-sm leading-5 md:text-lg font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
        Gadgets
      </span>
    </div>
              </>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1 xl:ml-2">
              {[
                { href: "/products", label: "Products" },
                { href: "/about", label: "About" },
                { href: "/support", label: "Support" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative text-sm font-medium px-3 py-2 pb-1 transition-colors ${
                    pathname === link.href
                      ? "text-blue-600 after:absolute after:left-1/2 after:-translate-x-1/2 after:bottom-0 after:h-[2px] after:w-2/3 after:bg-blue-600 after:rounded-full"
                      : "text-gray-700 hover:text-blue-600 dark:text-gray-300"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile Search Icon */}
{/* Mobile Icons */}
<div className="md:hidden flex items-center gap-1">
  {/* Search Button */}
  <button
    onClick={() => setMobileSearchOpen(true)}
    aria-label="Open search"
    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
  >
    <Search className="w-5 h-5 text-gray-700 dark:text-gray-300" />
  </button>
  {/* Orders Button */}
  <Link
    href="/orders"
    aria-label="View orders"
    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
  >
    <ShoppingBag className="w-5 h-5 text-gray-700 dark:text-gray-300" />
  </Link>

  {/* Support Button */}
  <Link
    href="/support"
    aria-label="Support"
    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
  >
    <Headset className="w-5 h-5 text-gray-700 dark:text-gray-300" />
  </Link>

</div>


          {/* Center: search (desktop) */}
          <div className="hidden md:flex flex-1 max-w-xl gap-2 items-center justify-center">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  setShowSuggestions(false);
                  router.push(
                    `/search?q=${encodeURIComponent(searchQuery.trim())}`
                  );
                }
              }}
              className="relative w-full mr-5"
              role="search"
              aria-label="Site search"
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
                className="w-full h-10 rounded-full pl-10 pr-12"
                aria-autocomplete="list"
                aria-expanded={showSuggestions}
              />
              <Search
                className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Button
                type="submit"
                size="sm"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 px-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={!searchQuery.trim()}
                onClick={(e) => e.stopPropagation()}
                aria-label="Submit search"
              >
                Search
                {/* <Search className="h-4 w-4" /> */}
              </Button>

              {showSuggestions && suggestions.length > 0 && (
                <div
                  className="absolute top-full left-0 right-0 bg-popover border border-border rounded-md shadow-lg z-50 mt-2"
                  role="listbox"
                  aria-label="Search suggestions"
                >
                  {suggestions.map((product, index) => (
                    <button
                      key={product.id}
                      type="button"
                      role="option"
                      aria-selected={index === selectedIndex}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowSuggestions(false);
                        router.push(`/products/${product.slug}`);
                      }}
                      className={`w-full px-4 py-3 text-left flex items-center gap-3 border-b last:border-b-0 transition-colors ${
                        index === selectedIndex ? "bg-accent" : "hover:bg-muted"
                      }`}
                    >
                      <img
                        src={
                          product.frontImage ||
                          product.image ||
                          "/placeholder.svg?height=40&width=40&query=product"
                        }
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {product.category} • ₹{product.price}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </form>
            <div className="flex space-x-3">
              <Link
                href="/wishlist"
                aria-label="Open wishlist"
                className="hidden sm:block relative"
              >
                <Heart
                  className={`h-6 w-6 transition-colors cursor-pointer ${
                    pathname === "/wishlist"
                      ? "fill-pink-500 text-pink-500"
                      : "text-gray-700 dark:text-gray-300 hover:text-pink-600 "
                  }`}
                />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-pink-500 text-xs font-semibold text-white flex items-center justify-center">
                    {wishlistCount > 9 ? "9+" : wishlistCount}
                  </span>
                )}
              </Link>

              <Link href="/cart" aria-label="Open cart" className="relative">
                <ShoppingBag
                  className={`h-6 w-6 transition-colors cursor-pointer ${
                    pathname === "/cart"
                      ? "text-blue-500"
                      : "text-gray-700 dark:text-gray-300 hover:text-blue-600"
                  }`}
                />
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-blue-600 text-xs font-semibold text-white flex items-center justify-center">
                    {count > 9 ? "9+" : count}
                  </span>
                )}
              </Link>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="cursor-pointer">
                <Button
                  variant="ghost"
                  className="relative p-0 h-8 w-9 md:h-10 md:w-10 rounded-full border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-200"
                >
                  {status === "loading" ? (
                    <div className="h-8 w-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center animate-pulse">
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
                    <div className="h-8 w-9 md:h-9 md:w-9 text-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-xs md:text-sm font-semibold text-white w-8 h-8 text-center flex items-center justify-center">
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
                          <a
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
                          </a>
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
                  <div className="pt-4 pb-2 px-2">
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
          </div>
        </nav>
      </header>

      {/* ---- Mobile Search Overlay ---- */}
      <AnimatePresence>
        {mobileSearchOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              onClick={() => setMobileSearchOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -100 }}
              transition={{ type: "tween", duration: 0.2, ease: "easeOut" }}
              className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 shadow-2xl rounded-b-3xl will-change-transform"
            >
              <div className="px-4 pt-4 pb-2">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Search
                  </h2>
                  <button
                    onClick={() => setMobileSearchOpen(false)}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Close search"
                  >
                    <X className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                  </button>
                </div>

                <form onSubmit={handleSearchSubmit} className="relative mb-4">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search laptops, keyboards, monitors..."
                    className="w-full h-12 pl-12 pr-4 text-base rounded-full border-2 focus:border-blue-500 shadow-sm"
                    autoFocus
                  />
                  <Search className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" />
                </form>

                {/* Suggestions */}
                <div className="max-h-[60vh] overflow-y-auto">
                  {suggestions.length > 0 ? (
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      variants={{
                        visible: { transition: { staggerChildren: 0.05 } },
                      }}
                    >
                      {suggestions.map((p, idx) => (
                        <motion.button
                          key={p.id}
                          variants={{
                            hidden: { opacity: 0, x: -20 },
                            visible: { opacity: 1, x: 0 },
                          }}
                          onClick={() => {
                            router.push(`/products/${p.slug}`);
                            setMobileSearchOpen(false);
                          }}
                          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 dark:hover:bg-gray-800 active:scale-98 transition-all"
                        >
                          <img
                            src={p.frontImage || p.image || "/placeholder.svg"}
                            alt={p.name}
                            className="w-14 h-14 rounded-lg object-cover shadow-sm"
                          />
                          <div className="flex-1 text-left min-w-0">
                            <p className="font-semibold text-gray-900 dark:text-white truncate">
                              {p.name}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {p.category}
                            </p>
                            <p className="text-sm font-bold text-blue-600">
                              ₹{p.price.toLocaleString()}
                            </p>
                          </div>
                          <svg
                            className="w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </motion.button>
                      ))}
                    </motion.div>
                  ) : null}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AuthDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        mode={authMode}
      />
    </>
  );
}
