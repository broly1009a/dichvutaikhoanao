"use client";

import { useState } from "react";
// import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  HomeIcon,
  ShoppingBagIcon,
  ArrowTrendingUpIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  BanknotesIcon,
  DocumentTextIcon,
  CreditCardIcon,
  NewspaperIcon,
  WrenchScrewdriverIcon,
  QuestionMarkCircleIcon,
  CodeBracketIcon,
  PhoneIcon,
  SparklesIcon,
  ShieldCheckIcon,
  // UserCircleIcon,
  ShoppingCartIcon,
} from "@heroicons/react/24/outline";
import { useAuthContext } from "@/lib/context/AuthContext";
interface MenuItem {
  icon: any;
  label: string;
  href: string;
  isHeader?: boolean;
  adminOnly?: boolean;
}

const menuItems: MenuItem[] = [
  { icon: HomeIcon, label: "Trang chủ", href: "/" },
  { icon: ShoppingBagIcon, label: "Mua tài khoản", href: "/buy" },
  { icon: ShoppingCartIcon, label: "Giỏ hàng", href: "/cart" },
  { icon: ArrowTrendingUpIcon, label: "Up follow Shopee, Lazada", href: "/follow" },
  { icon: ClipboardDocumentListIcon, label: "Đặt đơn Shopee", href: "/order" },
  { icon: ClockIcon, label: "Lịch sử mua hàng", href: "/history" },
  
  { icon: null, label: "Nạp tiền", isHeader: true, href: "" },
  { icon: BanknotesIcon, label: "Ngân hàng", href: "/deposit/bank" },
  { icon: DocumentTextIcon, label: "Hoá đơn", href: "/deposit/invoice" },
  { icon: CreditCardIcon, label: "Nạp thẻ", href: "/deposit/card" },
  
  // { icon: null, label: "Tài khoản", isHeader: true, href: "" },
  // { icon: UserCircleIcon, label: "Đăng nhập / Đăng ký", href: "/auth/login" },
  
  { icon: null, label: "Khác", isHeader: true, href: "" },
  { icon: NewspaperIcon, label: "Bài viết", href: "/posts" },
  { icon: WrenchScrewdriverIcon, label: "Công cụ", href: "/tools" },
  { icon: QuestionMarkCircleIcon, label: "FAQ", href: "/faq" },
  { icon: CodeBracketIcon, label: "Tài liệu API", href: "/api-docs" },
  { icon: PhoneIcon, label: "Liên hệ", href: "/contact" },
  
  { icon: null, label: "Quản trị", isHeader: true, href: "", adminOnly: true },
  { icon: ShieldCheckIcon, label: "Admin Panel", href: "/admin", adminOnly: true },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [activeItem, setActiveItem] = useState("Trang chủ");
  const { user } = useAuthContext();
  const handleItemClick = (item: MenuItem) => {
    setActiveItem(item.label);
    router.push(item.href);
    onClose();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#0f172a] z-50
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static
          flex flex-col shadow-2xl
        `}
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform">
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-white text-lg tracking-wide">HH-SHOPEE</h1>
              <p className="text-xs text-slate-400">Shop tài khoản uy tín #1</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          <ul className="space-y-1">
            {menuItems.map((item, index) => {
              // Skip admin-only items if user is not admin
              if (item.adminOnly && user?.role !== 'admin') {
                return null;
              }

              if (item.isHeader) {
                return (
                  <li key={index} className="pt-6 pb-2 px-3 first:pt-2">
                    <div className="flex items-center gap-2">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-600 to-transparent"></div>
                      <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">
                        {item.label}
                      </span>
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-600 to-transparent"></div>
                    </div>
                  </li>
                );
              }

              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <li key={index}>
                  <button
                    onClick={() => handleItemClick(item)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-xl
                      transition-all duration-300 group relative overflow-hidden
                      ${
                        isActive
                          ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-600/50 scale-105"
                          : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                      }
                    `}
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-blue-600/20 animate-pulse"></div>
                    )}
                    <Icon className={`w-5 h-5 flex-shrink-0 relative z-10 ${isActive ? 'animate-bounce-slow' : 'group-hover:scale-110 transition-transform'}`} />
                    <span className="text-sm font-medium relative z-10">{item.label}</span>
                    {isActive && (
                      <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700/50 bg-slate-900/50">
          <div className="text-xs text-slate-400 text-center space-y-1">
            <p className="flex items-center justify-center gap-1">
              <span className="text-orange-500">♥</span> Made with love
            </p>
            <p className="text-slate-500">© 2024 HH-SHOPEE</p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <span className="px-2 py-1 bg-green-500/10 text-green-400 rounded text-xs">v1.0.0</span>
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-green-400 text-xs">Online</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}