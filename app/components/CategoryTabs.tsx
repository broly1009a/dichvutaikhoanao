"use client";

import { useState } from "react";
import {
  Squares2X2Icon,
  MusicalNoteIcon,
  StarIcon,
  TrophyIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  DevicePhoneMobileIcon,
  ArrowTrendingUpIcon,
  ShoppingCartIcon,
  EnvelopeIcon,
  AtSymbolIcon,
} from "@heroicons/react/24/outline";

interface Category {
  id: string;
  label: string;
  icon: any;
}

const categories: Category[] = [
  { id: "all", label: "Tất cả sản phẩm", icon: Squares2X2Icon },
  { id: "tiktok", label: "Tài khoản TikTok", icon: MusicalNoteIcon },
  { id: "shopee-silver", label: "Nick Shopee hạng Bạc", icon: StarIcon },
  { id: "shopee-gold", label: "Nick Shopee hạng Vàng", icon: TrophyIcon },
  { id: "shopee-coin", label: "Nick Shopee có xu", icon: CurrencyDollarIcon },
  { id: "shopee-orders", label: "Nick Shopee có đơn giao thành công", icon: ShoppingBagIcon },
  { id: "shopee-phone", label: "Nick reg phone login qua điện thoại", icon: DevicePhoneMobileIcon },
  { id: "shopee-buff", label: "Nick Shopee buff web", icon: ArrowTrendingUpIcon },
  { id: "lazada", label: "Nick Lazada", icon: ShoppingCartIcon },
  { id: "gmail", label: "Gmail có", icon: EnvelopeIcon },
  { id: "hotmail", label: "Mua Hotmail trusted/new", icon: AtSymbolIcon },
];

interface CategoryTabsProps {
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export function CategoryTabs({ activeCategory, onCategoryChange }: CategoryTabsProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 sticky top-[65px] z-20">
      <div className="flex flex-wrap justify-center gap-3 p-4">
        {categories.map((category) => {
          const Icon = category.icon;
          const isActive = activeCategory === category.id;

          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl border-2 text-base font-medium transition-all duration-200 whitespace-nowrap ${
                isActive
                  ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/30"
                  : "bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-slate-700"
              }`}
            >
              <Icon className="w-6 h-6 flex-shrink-0" />
              <span>{category.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
