"use client";

import { BuildingLibraryIcon, CreditCardIcon } from "@heroicons/react/24/outline";

interface BankCardProps {
  onClick: () => void;
}

export function BankCard({ onClick }: BankCardProps) {
  return (
    <button
      onClick={onClick}
      className="group relative mx-auto max-w-md w-full bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 rounded-3xl shadow-xl border-2 border-gray-200 dark:border-slate-700 p-8 hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 blur-xl opacity-0 group-hover:opacity-50 transition-opacity"></div>

      <div className="relative space-y-6">
        {/* Logo section */}
        <div className="flex items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
            <div className="relative bg-gradient-to-br from-green-600 to-emerald-600 p-6 rounded-2xl shadow-lg">
              <BuildingLibraryIcon className="w-16 h-16 text-white" />
            </div>
          </div>
        </div>

        {/* Bank info */}
        <div className="text-center space-y-3">
          <h3 className="text-gray-900 dark:text-gray-100 flex items-center justify-center gap-2">
            Ngân hàng ACB
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Ngân Hàng TMCP Á Châu
          </p>
          
          {/* Status badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-full border-2 border-green-300 dark:border-green-700">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-700 dark:text-green-300 font-bold text-sm">
              Hoạt động bình thường
            </span>
          </div>
        </div>

        {/* Action hint */}
        <div className="pt-4 border-t-2 border-dashed border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            <CreditCardIcon className="w-5 h-5" />
            <span className="font-medium">Nhấn để tạo hóa đơn nạp tiền</span>
          </div>
        </div>

        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      </div>
    </button>
  );
}
