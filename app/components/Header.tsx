"use client";

import { useState } from "react";
import {
  Bars3Icon,
  BellIcon,
  MoonIcon,
  SunIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  CogIcon,
} from "@heroicons/react/24/outline";
import { Badge } from "./ui/badge";
import Link from "next/link";
import { useAuthContext } from "@/lib/context/AuthContext";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const [isDark, setIsDark] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, isLoading, logout } = useAuthContext();
  const balance = user?.balance || 0;

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  const handleLogout = async () => {
    try {
      await logout();
      setShowUserMenu(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 dark:bg-slate-900 dark:border-slate-700">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left side - Menu button (mobile) */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Bars3Icon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>

          {/* Balance */}
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Số dư tài khoản</p>
              <p className="text-green-600 dark:text-green-400">
                {balance.toLocaleString("vi-VN")} đ
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2">
          {/* Balance mobile */}
          <div className="sm:hidden flex items-center gap-1 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-xs text-green-600 dark:text-green-400">
              {balance.toLocaleString("vi-VN")} đ
            </p>
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <SunIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            ) : (
              <MoonIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            )}
          </button>

          {/* Notifications */}
          <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <BellIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User profile */}
          {!isLoading && (
            <>
              {user ? (
                <div className="hidden md:flex items-center gap-2 pl-2 ml-2 border-l border-gray-200 dark:border-slate-700 relative">
                  <div className="text-right">
                    <p className="text-sm text-gray-900 dark:text-gray-100">{user.fullName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role}</p>
                  </div>
                  <button 
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <UserCircleIcon className="w-8 h-8 text-gray-700 dark:text-gray-300" />
                  </button>

                  {/* User Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 py-1 z-50">
                      <Link
                        href="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="block px-4 py-2 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                      >
                        👤 Hồ sơ
                      </Link>
                      <Link
                        href="/settings"
                        onClick={() => setShowUserMenu(false)}
                        className="block px-4 py-2 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                      >
                        <CogIcon className="w-4 h-4 inline mr-2" />
                        Cài đặt
                      </Link>
                      <hr className="my-1 border-gray-200 dark:border-slate-700" />
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 transition"
                      >
                        <ArrowRightOnRectangleIcon className="w-4 h-4 inline mr-2" />
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="hidden md:flex items-center gap-2 pl-2 ml-2 border-l border-gray-200 dark:border-slate-700 px-4 py-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition"
                >
                  <UserCircleIcon className="w-6 h-6" />
                  Đăng nhập
                </Link>
              )}
            </>
          )}

          {/* User icon mobile */}
          {!isLoading && (
            <>
              {user ? (
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors relative"
                >
                  <UserCircleIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                </button>
              ) : (
                <Link
                  href="/auth/login"
                  className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <UserCircleIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
