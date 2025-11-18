"use client";

import {
  HomeIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  CreditCardIcon,
  CubeIcon,
  GiftIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  SparklesIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";

interface MenuItem {
  icon: any;
  label: string;
  page: string;
}

const menuItems: MenuItem[] = [
  { icon: HomeIcon, label: "Dashboard", page: "dashboard" },
  { icon: UsersIcon, label: "Users", page: "users" },
  { icon: ShoppingBagIcon, label: "Products", page: "products" },
  { icon: ClipboardDocumentListIcon, label: "Bookings", page: "bookings" },
  { icon: CreditCardIcon, label: "Payments", page: "payments" },
  { icon: CubeIcon, label: "Providers", page: "providers" },
  { icon: GiftIcon, label: "Categories", page: "categories" },
  { icon: ChartBarIcon, label: "Reports", page: "reports" },
  { icon: Cog6ToothIcon, label: "Settings", page: "settings" },
];

interface AdminSidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

export function AdminSidebar({ activePage, onNavigate }: AdminSidebarProps) {
  return (
    <aside className="fixed top-0 left-0 h-full w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 shadow-lg z-40 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <SparklesIcon className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-gray-900 dark:text-white tracking-wide">ADMIN PANEL</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">HH-SHOPEE</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activePage === item.page;

            return (
              <li key={index}>
                <button
                  onClick={() => onNavigate(item.page)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl
                    transition-all duration-300 group relative overflow-hidden
                    ${
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                    }
                  `}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-600/20 animate-pulse"></div>
                  )}
                  <Icon className={`w-5 h-5 flex-shrink-0 relative z-10`} />
                  <span className="font-medium relative z-10">{item.label}</span>
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
      <div className="p-4 border-t border-gray-200 dark:border-slate-700">
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center space-y-1">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-600 dark:text-green-400 font-medium">System Online</span>
          </div>
          <p>© 2024 HH-SHOPEE Admin</p>
        </div>
      </div>
    </aside>
  );
}
