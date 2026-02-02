"use client";

import { useState, useEffect } from "react";
import { Squares2X2Icon, FireIcon } from "@heroicons/react/24/outline";
import * as HeroIcons from "@heroicons/react/24/outline";

interface Category {
  id: string;
  label: string;
  icon: any;
  iconName?: string;
  gradient: string;
}

// Get icon component from Heroicons by name
const getIconComponent = (iconName: string | undefined) => {
  if (!iconName) return Squares2X2Icon;
  return (HeroIcons as any)[iconName] || Squares2X2Icon;
};

const gradients = [
  "from-blue-500 to-purple-500",
  "from-green-500 to-teal-500",
  "from-red-500 to-pink-500",
  "from-yellow-500 to-orange-500",
  "from-indigo-500 to-cyan-500",
];

interface CategoryTabsProps {
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
  categories?: Array<{ _id: string; name: string; platform: string; icon?: string }>;
}

export function CategoryTabs({ 
  activeCategory, 
  onCategoryChange, 
  categories: apiCategories = [] 
}: CategoryTabsProps) {
  const [categories, setCategories] = useState<Category[]>([
    { id: "all", label: "Tất cả sản phẩm", icon: Squares2X2Icon, iconName: "Squares2X2Icon", gradient: gradients[0] },
  ]);

  useEffect(() => {
    if (apiCategories && apiCategories.length > 0) {
      // Build categories from API data
      const builtCategories: Category[] = [
        { id: "all", label: "Tất cả sản phẩm", icon: Squares2X2Icon, iconName: "Squares2X2Icon", gradient: gradients[0] },
      ];

      apiCategories.forEach((cat, index) => {
        const IconComponent = getIconComponent(cat.icon);
        builtCategories.push({
          id: cat.name, // Use category name as ID for filtering
          label: cat.name,
          icon: IconComponent,
          iconName: cat.icon,
          gradient: gradients[(index + 1) % gradients.length],
        });
      });

      setCategories(builtCategories);
    }
  }, [apiCategories]);
  return (
   <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-slate-700 shadow-sm">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-wrap justify-center gap-3 p-4">
        {categories.map((category) => {
          const Icon = category.icon;
          const isActive = activeCategory === category.id;

          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`
                group relative flex items-center gap-2.5 px-5 py-3 rounded-xl
                transition-all duration-300 whitespace-nowrap overflow-hidden
                ${
                  isActive
                    ? "bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-600/40 scale-105 border-2 border-blue-400"
                    : "bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg hover:scale-105"
                }
              `}
            >
              {/* Gradient background on hover */}
              {!isActive && (
                <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
              )}

              {/* Icon with gradient background */}
              <div className="relative">
                {isActive && (
                  <div className="absolute inset-0 bg-white/20 rounded-lg blur"></div>
                )}
                <div className={`relative ${isActive ? '' : `bg-gradient-to-br ${category.gradient} bg-clip-text text-transparent group-hover:scale-110 transition-transform`}`}>
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : ''}`} style={isActive ? {} : { WebkitTextFillColor: 'transparent' }} />
                </div>
              </div>

              <span className={`text-sm font-medium relative z-10 ${isActive ? '' : 'group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent'}`}>
                {category.label}
              </span>

              {/* Active indicator */}
              {isActive && (
                <div className="ml-auto">
                  <FireIcon className="w-4 h-4 text-yellow-300 animate-pulse" />
                </div>
              )}

              {/* Shine effect */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
              )}
            </button>
          );
        })}
        </div>
      </div>
    </div>
  );
}
