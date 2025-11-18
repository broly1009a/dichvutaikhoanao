"use client";

import { GiftIcon, SparklesIcon } from "@heroicons/react/24/outline";

interface Promotion {
  id: number;
  minAmount: number;
  bonus: string;
  isHot?: boolean;
}

const promotions: Promotion[] = [
  { id: 1, minAmount: 100000, bonus: "1%", isHot: false },
  { id: 2, minAmount: 500000, bonus: "1.5%", isHot: false },
  { id: 3, minAmount: 1000000, bonus: "2%", isHot: true },
  { id: 4, minAmount: 5000000, bonus: "3%", isHot: true },
  { id: 5, minAmount: 10000000, bonus: "5%", isHot: true },
];

export function PromotionTable() {
  return (
    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden hover:shadow-2xl transition-all duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 px-6 py-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 via-orange-400/10 to-pink-400/10 animate-shimmer"></div>
        <div className="relative flex items-center gap-3">
          <div className="w-1 h-6 bg-gradient-to-b from-yellow-300 to-orange-300 rounded-full"></div>
          <GiftIcon className="w-6 h-6 text-white" />
          <h3 className="text-white flex items-center gap-2">
            Điều Kiện Khuyến Mãi Nạp Tiền
            <SparklesIcon className="w-5 h-5 text-yellow-300 animate-pulse" />
          </h3>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-750">
            <tr className="border-b-2 border-gray-200 dark:border-slate-700">
              <th className="px-6 py-4 text-left text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold w-20">
                #
              </th>
              <th className="px-6 py-4 text-left text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                Số tiền nạp ≥
              </th>
              <th className="px-6 py-4 text-center text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                Khuyến mãi thêm
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
            {promotions.map((promo, index) => (
              <tr
                key={promo.id}
                className="hover:bg-gradient-to-r hover:from-orange-50/50 hover:to-pink-50/50 dark:hover:from-orange-900/10 dark:hover:to-pink-900/10 transition-all duration-300 group"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full group-hover:scale-150 transition-transform"></div>
                    <span className="text-gray-900 dark:text-gray-100 font-medium">
                      {promo.id}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl border-2 border-blue-200 dark:border-blue-700">
                    <span className="text-blue-700 dark:text-blue-300 font-bold">
                      {promo.minAmount.toLocaleString("vi-VN")} đ
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="inline-flex items-center gap-2">
                    <div className={`px-5 py-2 rounded-xl border-2 shadow-lg font-bold ${
                      promo.isHot
                        ? "bg-gradient-to-br from-orange-500 to-pink-500 border-orange-400 text-white animate-pulse"
                        : "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300"
                    }`}>
                      + {promo.bonus}
                    </div>
                    {promo.isHot && (
                      <span className="px-2 py-1 bg-red-500 text-white rounded-full text-xs font-bold animate-bounce">
                        HOT
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer note */}
      <div className="px-6 py-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-t border-gray-200 dark:border-slate-700">
        <p className="text-sm text-orange-800 dark:text-orange-300 flex items-center gap-2">
          <GiftIcon className="w-5 h-5" />
          <span>
            <strong>Ví dụ:</strong> Nạp 1.000.000đ sẽ nhận được thêm 20.000đ khuyến mãi = Tổng cộng 1.020.000đ
          </span>
        </p>
      </div>
    </div>
  );
}
