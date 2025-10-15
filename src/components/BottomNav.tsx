"use client";

import Link from "next/link";
import Image from "next/image";
import { Home, ShoppingCart, Grid, ShoppingBag, User, Settings, LayoutGrid } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getCart } from "@/lib/cart";
import { useSession } from "next-auth/react";

export default function BottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [count, setCount] = useState(0);

  useEffect(() => {
    const updateCart = () => {
      const items = getCart();
      setCount(items.reduce((n, i) => n + (i.qty || 1), 0));
    };

    updateCart();
    window.addEventListener("storage", updateCart);
    window.addEventListener("v0-cart-updated", updateCart as EventListener);

    return () => {
      window.removeEventListener("storage", updateCart);
      window.removeEventListener("v0-cart-updated", updateCart as EventListener);
    };
  }, []);

  const isAdmin = session?.user?.role === "admin";

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-t border-gray-200 md:hidden shadow-lg">
      <div className="flex justify-around items-center px-1 py-1.5 h-14 max-w-full">
        {/* Home */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center px-2 py-1 rounded-lg transition-all min-w-0 ${
            pathname === "/"
              ? "text-blue-600 bg-blue-50"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Home className="w-5 h-5" strokeWidth={pathname === "/" ? 2.5 : 2} />
          <span className="text-[9px] font-medium truncate">Home</span>
        </Link>

        {/* Category */}
        <Link
          href="/category"
          className={`flex flex-col items-center justify-center px-2 py-1 rounded-lg transition-all min-w-0 ${
            pathname.startsWith("/category")
              ? "text-teal-600 bg-teal-50"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <LayoutGrid className="w-5 h-5" strokeWidth={pathname.startsWith("/category") ? 2.5 : 2} />
          <span className="text-[9px] font-medium truncate">Category</span>
        </Link>

        {/* Orders */}
        <Link
          href="/orders"
          className={`flex flex-col items-center justify-center px-2 py-1 rounded-lg transition-all min-w-0 ${
            pathname === "/orders"
              ? "text-purple-600 bg-purple-50"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <ShoppingBag className="w-5 h-5" strokeWidth={pathname === "/orders" ? 2.5 : 2} />
          <span className="text-[9px] font-medium truncate">Orders</span>
        </Link>

        {/* Cart */}
        <Link
          href="/cart"
          className={`relative flex flex-col items-center justify-center px-2 py-1 rounded-lg transition-all min-w-0 ${
            pathname === "/cart"
              ? "text-orange-600 bg-orange-50"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <ShoppingCart className="w-5 h-5" strokeWidth={pathname === "/cart" ? 2.5 : 2} />
          <span className="text-[9px] font-medium truncate">Cart</span>
          {count > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-orange-600 text-white text-[8px] font-bold flex items-center justify-center ring-2 ring-white">
              {count > 9 ? "9+" : count}
            </span>
          )}
        </Link>

        {/* Admin (only for admins) */}
        {isAdmin && (
          <Link
            href="/admin"
            className={`flex flex-col items-center justify-center px-2 py-1 rounded-lg transition-all min-w-0 ${
              pathname.startsWith("/admin")
                ? "text-indigo-600 bg-indigo-50"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Settings className="w-5 h-5" strokeWidth={pathname.startsWith("/admin") ? 2.5 : 2} />
            <span className="text-[9px] font-medium truncate">Admin</span>
          </Link>
        )}

        {/* Profile */}
        <Link
          href="/profile"
          className={`flex flex-col items-center justify-center px-2 py-1 rounded-lg transition-all min-w-0 ${
            pathname === "/profile"
              ? "text-green-600 bg-green-50"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          {session?.user ? (
            <div className="relative">
              {session.user.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  width={20}
                  height={20}
                  className="h-5 w-5 rounded-full object-cover ring-1 ring-white"
                />
              ) : (
                <div className="h-5 w-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ring-1 ring-white">
                  <span className="text-[8px] font-semibold text-white">
                    {session.user.name?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <User className="w-5 h-5" strokeWidth={pathname === "/profile" ? 2.5 : 2} />
          )}
          <span className="text-[9px] font-medium truncate">Profile</span>
        </Link>
      </div>
    </nav>
  );
}
