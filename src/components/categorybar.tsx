"use client";

import { Button } from "@/components/ui/button";
import { ChevronRight, Menu, X } from "lucide-react";

interface Category {
  name: string;
  slug: string;
  icon: string;
  count: string;
  description: string;
}

interface CategoryBarProps {
  categories: Category[];
  selectedCategory: string | null;
  onCategorySelect: (slug: string | null) => void;
  isSidebarOpen: boolean;
  onSidebarToggle: (open: boolean) => void;
}

export function CategoryBar({
  categories,
  selectedCategory,
  onCategorySelect,
  isSidebarOpen,
  onSidebarToggle,
}: CategoryBarProps) {
  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden md:mb-4 sm:px-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSidebarToggle(true)}
          className="flex items-center gap-2"
        >
          <Menu className="w-4 h-4" />
          Categories
        </Button>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block w-72 flex-shrink-0">
        <div className="fixed top-16 h-full w-72 space-y-6 overflow-y-auto border-r bg-white">
          <div className="border-0 py-0">
            <div className="p-0">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xl text-gray-900">Categories</h3>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-1">
                  {categories.map((cat) => {
                    const isActive = selectedCategory === cat.slug;
                    return (
                      <button
                        key={cat.slug}
                        onClick={() => onCategorySelect(cat.slug)}
                        className={`group w-full text-left p-3 rounded-xl transition-all duration-200 cursor-pointer border ${
                          isActive
                            ? "bg-gradient-to-r border-blue-500 bg-blue-50 text-blue-600"
                            : "text-gray-700 hover:bg-gray-50 hover:border-gray-300 border-transparent"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                isActive
                                  ? "bg-white/20"
                                  : "bg-gray-100 group-hover:bg-gray-200"
                              }`}
                            >
                              <span className="text-lg">{cat.icon}</span>
                            </div>
                            <div>
                              <div className="font-semibold text-sm">{cat.name}</div>
                              <div
                                className={`text-xs ${
                                  isActive ? "text-blue-600" : "text-gray-500"
                                }`}
                              >
                                {cat.count}
                              </div>
                            </div>
                          </div>
                          <ChevronRight
                            className={`w-4 h-4 transition-transform ${
                              isActive
                                ? "text-blue-600"
                                : "text-gray-400 group-hover:text-gray-600"
                            } ${isActive ? "" : "rotate-90"}`}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <div
        className={`xl:hidden fixed inset-0 z-50 flex transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div
          className={`fixed inset-0 bg-black/20 bg-opacity-50 transition-opacity duration-300 ${
            isSidebarOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => onSidebarToggle(false)}
        />
        <div
          className={`relative w-66 bg-white shadow-xl h-full transform transition-transform duration-300 ease-in-out ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-bold text-xl text-gray-900">Categories</h3>
            <Button variant="ghost" size="sm" onClick={() => onSidebarToggle(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="h-full overflow-y-auto pb-20">
            <div className="p-4">
              <div className="space-y-1">
                {categories.map((cat) => {
                  const isActive = selectedCategory === cat.slug;
                  return (
                    <button
                      key={cat.slug}
                      onClick={() => {
                        onCategorySelect(cat.slug);
                        onSidebarToggle(false);
                      }}
                      className={`group w-full text-left p-3 rounded-xl transition-all duration-200 cursor-pointer border ${
                        isActive
                          ? "bg-gradient-to-r border-blue-500 bg-blue-50 text-blue-600"
                          : "text-gray-700 hover:bg-gray-50 hover:border-gray-300 border-transparent"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              isActive
                                ? "bg-white/20"
                                : "bg-gray-100 group-hover:bg-gray-200"
                            }`}
                          >
                            <span className="text-lg">{cat.icon}</span>
                          </div>
                          <div>
                            <div className="font-semibold text-sm">{cat.name}</div>
                            <div
                              className={`text-xs ${
                                isActive ? "text-blue-600" : "text-gray-500"
                              }`}
                            >
                              {cat.count}
                            </div>
                          </div>
                        </div>
                        <ChevronRight
                          className={`w-4 h-4 transition-transform ${
                            isActive
                              ? "text-blue-600"
                              : "text-gray-400 group-hover:text-gray-600"
                          } ${isActive ? "" : "rotate-90"}`}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}