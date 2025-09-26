import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/ui/Navbar";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "Storefront",
    template: "%s | Storefront",
  },
  description: "Discover quality products at great prices. Fast shipping and secure checkout.",
  keywords: ["store", "ecommerce", "online shop", "products", "buy online"],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Storefront",
    title: "Storefront",
    description: "Discover quality products at great prices. Fast shipping and secure checkout.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Storefront",
    description: "Discover quality products at great prices. Fast shipping and secure checkout.",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
         <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <Navbar />
        {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
