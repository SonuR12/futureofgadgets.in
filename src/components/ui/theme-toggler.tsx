"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="w-10 h-10">
        <div className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="relative cursor-pointer w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-transparent 
                 light:sm:bg-white/830 dark:sm:bg-neutral-800/80 
                 sm:backdrop-blur-sm sm:border sm:border-violet-200 dark:sm:border-violet-700 
                 sm:hover:bg-violet-50 dark:sm:hover:bg-violet-900/50 
                 transition-all duration-300"
    >
      {/* Sun icon (light mode) */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
          theme === "light" ? "scale-100 rotate-0" : "scale-0 rotate-180"
        }`}
      >
        <Sun className="h-4 w-4 text-violet-600" />
      </div>

      {/* Moon icon (dark mode) */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
          theme === "dark" ? "scale-100 rotate-0" : "scale-0 -rotate-180"
        }`}
      >
        <Moon className="h-4 w-4 text-violet-400" />
      </div>

      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
