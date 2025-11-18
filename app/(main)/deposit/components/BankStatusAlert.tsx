"use client";

import { CheckCircleIcon, PhoneIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export function BankStatusAlert() {
  return (
    <div className="relative bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/20 dark:via-emerald-900/20 dark:to-teal-900/20 border-2 border-green-400 dark:border-green-600 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 via-emerald-400/10 to-teal-400/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      
      <div className="relative flex items-start gap-4">
        {/* Icon */}
        <div className="relative flex-shrink-0">
          <div className="absolute inset-0 bg-green-500 rounded-full blur opacity-50 animate-pulse"></div>
          <div className="relative bg-gradient-to-br from-green-500 to-emerald-500 p-4 rounded-2xl shadow-lg">
            <CheckCircleIcon className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-4">
          {/* Header */}
          <div className="flex items-center gap-3">
            <h2 className="text-green-700 dark:text-green-300">
              ACB ĐÃ HOẠT ĐỘNG BÌNH THƯỜNG
            </h2>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-600 dark:text-green-400 font-bold">ONLINE</span>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <p className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
              <span>Quý khách vui lòng chuyển khoản <strong className="text-green-700 dark:text-green-300">CHÍNH XÁC SỐ TIỀN</strong> và <strong className="text-green-700 dark:text-green-300">NỘI DUNG</strong> trong hóa đơn</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
              <span>Hệ thống tự động cộng tiền sau <strong className="text-green-700 dark:text-green-300">5-30 giây</strong> kể từ khi chuyển khoản thành công</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
              <span>Nếu sau 5 phút chưa được cộng tiền, vui lòng liên hệ bộ phận hỗ trợ</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
              <span>Không chuyển khoản qua trung gian hoặc ví điện tử để tránh bị ghi sai nội dung</span>
            </p>
          </div>

          {/* Support Link */}
          <div className="flex items-center gap-3 pt-2">
            <a
              href="https://zalo.me"
              target="_blank"
              rel="noopener noreferrer"
              className="group/link inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <PhoneIcon className="w-5 h-5 group-hover/link:rotate-12 transition-transform" />
              <span className="font-medium">Liên hệ hỗ trợ qua Zalo</span>
            </a>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 rounded-xl">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-700 dark:text-red-300">
              <strong>Lưu ý quan trọng:</strong> Hiện tại chúng tôi <strong>KHÔNG HỖ TRỢ</strong> nạp tiền qua MOMO, Viettel Pay, ZaloPay hoặc các ngân hàng khác ngoài ACB.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
