"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HiArrowLeft } from "react-icons/hi2";

export default function NotFound() {
  return (
    <div className="relative flex h-screen flex-col items-center justify-center text-center overflow-hidden px-4 bg-gradient-to-br from-white via-violet-50/50 to-neutral-50/80 dark:from-neutral-950 dark:via-violet-950/30 dark:to-neutral-900/50">
      
      {/* Floating stars */}
      <div
        className="absolute top-16 left-12 w-6 h-6 bg-yellow-400 rounded-full shadow-lg"
      />
      <div
        className="absolute bottom-32 right-20 w-4 h-4 bg-yellow-300 rounded-full shadow-md"
      />

      {/* Floating plus sign */}
      <div
        className="absolute top-1/3 left-1/4 w-8 h-8 before:content-['+'] before:block before:text-purple-500 before:text-3xl"
      />

      {/* Floating blob */}
      <div
        className="absolute bottom-20 left-1/3 w-20 h-20 bg-purple-400/30 rounded-full blur-xl"
      />

      {/* Diagonal line */}
      <div
        className="absolute top-1/4 right-1/3 w-32 h-1 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
      />

      {/* Main content */}
      <div
        className="z-10 space-y-6"
      >
        <h1 className="text-7xl font-extrabold text-gray-800 dark:text-gray-100">404</h1>
        <h2 className="text-3xl font-semibold text-gray-700 dark:text-gray-300">
          Page Not Found
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Oops! The page you are looking for doesn't exist.
        </p>

        <Link href="/" passHref className="flex justify-center">
          <Button className="group mt-4 flex items-center gap-2 rounded-2xl !px-6 !py-4 text-neutral-100 cursor-pointer bg-primary hover:scale-105 transition-transform duration-300">
            <HiArrowLeft className="transition-transform duration-300 group-hover:-translate-x-1" />
            Return Home
          </Button>
        </Link>
      </div>

      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(139,92,246,0.15),transparent)] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(139,92,246,0.3),transparent)]" />
    </div>
  );
}
