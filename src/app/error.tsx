"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { HiArrowPath, HiHome } from "react-icons/hi2";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-violet-50/50 to-neutral-50/80 dark:from-neutral-950 dark:via-violet-950/30 dark:to-neutral-900/50">
      <div className="text-center space-y-6 p-8">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-violet-600 dark:text-violet-400">Oops!</h1>
          <h2 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-200">
            Something went wrong
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 max-w-md">
            We encountered an unexpected error. Don&apos;t worry, it&apos;s not your fault.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={reset}
            className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-full"
          >
            <HiArrowPath className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          
          <Link href="/">
            <Button variant="outline" className="px-6 py-3 rounded-full">
              <HiHome className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}