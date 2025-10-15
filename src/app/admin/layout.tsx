"use client";
import {
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  LogOut,
  Search,
  User,
  Home,
  Settings,
  UserSquare,
  SettingsIcon,
  Star,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { href: "/admin", icon: Home, label: "Dashboard" },
  { href: "/admin/orders", icon: ShoppingCart, label: "Orders" },
  { href: "/admin/products", icon: Package, label: "Products" },
  { href: "/admin/users", icon: Users, label: "Users" },
  { href: "/admin/reviews", icon: Star, label: "Reviews" },
  { href: "/admin/settings", icon: SettingsIcon, label: "Settings" },
];

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const { setOpenMobile } = useSidebar();

  const handleNavClick = () => {
    setOpenMobile(false);
  };
  return (
    <>
      <Sidebar className="hidden md:flex !overflow-hidden !fixed top-0 left-0 border-r">
        <SidebarHeader>
          <Link href="/" className="flex items-center gap-3 p-2">
            <img
              src="/logo.png"
              alt="Store logo"
              className="h-10 w-10 rounded bg-transparent"
            />
            <div className="flex flex-col leading-[1rem] -space-y-1 ">
              <span className="text-xs md:text-sm font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Future of
              </span>
              <span className="text-sm leading-5 md:text-lg font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Gadgets
              </span>
            </div>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        tooltip={item.label}
                        isActive={isActive}
                      >
                        <Link
                          href={item.href}
                          onClick={handleNavClick}
                          className={
                            isActive
                              ? "!bg-blue-50 border border-blue-300 !text-blue-600 !h-10"
                              : "!h-10"
                          }
                        >
                          <Icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            {/* <SidebarMenuButton> */}
            <div className="py-4 flex items-center gap-2 px-2 bg-blue-50 rounded-sm">
              <DropdownMenu>
                <DropdownMenuTrigger asChild className="cursor-pointer">
                  <Button
                    variant="ghost"
                    className="relative p-0 h-10 w-10 rounded-full border-2 border-transparent hover:border-blue-200 transition-all duration-200"
                  >
                    {status === "loading" ? (
                      <div className="h-9 w-12 rounded-full bg-gray-200 flex items-center justify-center animate-pulse">
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
                      <div className="h-9 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-sm font-semibold text-white">
                          {session?.user?.name?.charAt(0).toUpperCase() || "A"}
                        </span>
                      </div>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  {session && (
                    <>
                      <div className="p-2">
                        <p className="font-medium text-sm">
                          {session.user?.name || "Admin"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {session.user?.email}
                        </p>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/profile">Profile</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/">Main Site</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="text-red-600"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="overflow-hidden">
                <div className="flex-1 min-w-0 ">
                  <div className="text-sm font-medium text-black">
                    {session?.user?.name || "Admin"}
                  </div>
                  <div className="text-xs text-gray-900">
                    {session?.user?.email}
                  </div>
                </div>
              </div>
            </div>

            {/* </SidebarMenuButton> */}
            {/* <SidebarMenuButton tooltip="Sign Out" onClick={() => signOut({ callbackUrl: '/' })}>
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </SidebarMenuButton> */}
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 items-center justify-between gap-2 sm:gap-4 border-b px-2 sm:px-4 min-w-0">
          <div className="flex items-center gap-2 flex-shrink-0">
            <SidebarTrigger className="-ml-1 hidden md:flex" />
            <div className="text-lg font-semibold text-gray-900 truncate">
              Admin Dashboard
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger
                asChild
                className="cursor-pointer flex-shrink-0"
              >
                <Button
                  variant="ghost"
                  className="relative p-0 h-8 w-8 sm:h-10 sm:w-10 rounded-full border-2 border-transparent hover:border-blue-200 transition-all duration-200"
                >
                  {status === "loading" ? (
                    <div className="h-7 w-7 sm:h-9 sm:w-9 rounded-full bg-gray-200 flex items-center justify-center animate-pulse">
                      <User className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                    </div>
                  ) : session?.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      width={32}
                      height={32}
                      className="h-7 w-7 sm:h-8 sm:w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-7 w-7 sm:h-9 sm:w-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-xs sm:text-sm font-semibold text-white">
                        {session?.user?.name?.charAt(0).toUpperCase() || "A"}
                      </span>
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                {session && (
                  <>
                    <div className="p-2">
                      <p className="font-medium text-sm truncate">
                        {session.user?.name || "Admin"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {session.user?.email}
                      </p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/">Main Site</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="text-red-600"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <div className="pb-16 md:pb-0">{children}</div>
      </SidebarInset>

      {/* Bottom Nav for Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t md:hidden">
        <div className="flex justify-around items-center h-14">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 h-full ${
                  isActive ? "text-blue-600" : "text-gray-600"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] mt-0.5">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </SidebarProvider>
  );
}
