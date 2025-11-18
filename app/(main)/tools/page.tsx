"use client";

import { AlertCircle } from "lucide-react";

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <AlertCircle size={64} className="mx-auto text-yellow-500" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
          Sắp ra mắt
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Tính năng này đang được phát triển. Vui lòng quay lại sau.
        </p>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
        >
          Quay lại trang chủ
        </a>
      </div>
    </div>
  );
}
