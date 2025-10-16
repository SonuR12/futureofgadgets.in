// src/components/Loading.tsx
"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white">
      {/* Minimal rotating ring */}
      <div className="text-center text-gray-700">
        <span className="block text-2xl sm:text-3xl font-semibold text-gray-800 mb-4 tracking-wide -ml-2">
          Future Of Gadgets
        </span>

        <div className="flex items-center justify-center gap-2">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
            className="text-blue-600"
          >
            <Loader2 className="w-6 h-6" />
          </motion.div>

          <span className="text-gray-600 text-sm sm:text-base font-medium">
            Future of Gadgets is loading
            <span className="animate-pulse text-blue-500">...</span>
          </span>
        </div>
      </div>
    </div>
  );
}
