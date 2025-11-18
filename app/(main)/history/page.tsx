"use client";

import { useState } from "react";
import { ExclamationTriangleIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { HistoryTable } from "./components/HistoryTable";
import { historyData } from "./data";
import { toast } from "sonner";

export default function HistoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState(historyData);

  // Filter data based on search query
  const filteredData = data.filter(
    (item) =>
      item.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.product.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewDetail = (id: number) => {
    const item = data.find((item) => item.id === id);
    if (item) {
      toast.info("Xem chi tiết", {
        description: `Mã giao dịch: ${item.transactionId}`,
      });
    }
  };

  const handleDownloadTxt = (id: number) => {
    const item = data.find((item) => item.id === id);
    if (item) {
      toast.success("Đang tải file TXT", {
        description: `${item.transactionId}.txt`,
      });
    }
  };

  const handleDownloadExcel = (id: number) => {
    const item = data.find((item) => item.id === id);
    if (item) {
      toast.success("Đang tải file Excel", {
        description: `${item.transactionId}.xlsx`,
      });
    }
  };

  const handleDelete = (id: number) => {
    const item = data.find((item) => item.id === id);
    if (item) {
      if (window.confirm(`Bạn có chắc chắn muốn xoá giao dịch ${item.transactionId}?`)) {
        setData(data.filter((item) => item.id !== id));
        toast.success("Đã xoá giao dịch", {
          description: `Mã: ${item.transactionId}`,
        });
      }
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Alert Bar */}
      <div className="bg-yellow-100 dark:bg-yellow-900/20 border-2 border-yellow-400 dark:border-yellow-600 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-yellow-900 dark:text-yellow-200 mb-1">
              Quan trọng từ ngày 25/3/2024
            </h4>
            <p className="text-sm text-yellow-800 dark:text-yellow-300">
              Web chỉ lưu đơn hàng đã mua trong 7 ngày gần nhất. Vui lòng tải về và lưu trữ 
              thông tin đơn hàng của bạn để tránh mất dữ liệu. Sau 7 ngày, đơn hàng sẽ tự động 
              bị xóa khỏi hệ thống và không thể khôi phục.
            </p>
          </div>
        </div>
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-gray-900 dark:text-gray-100">
            Lịch Sử Mua Hàng
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Quản lý và theo dõi các giao dịch của bạn
          </p>
        </div>

        {/* Search Box */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm mã GD hoặc sản phẩm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 w-full sm:w-80"
          />
        </div>
      </div>

      {/* Data Table */}
      <HistoryTable
        data={filteredData}
        onViewDetail={handleViewDetail}
        onDownloadTxt={handleDownloadTxt}
        onDownloadExcel={handleDownloadExcel}
        onDelete={handleDelete}
      />

      {/* Info Footer */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          💡 <strong>Mẹo:</strong> Bạn có thể tải xuống thông tin đơn hàng dưới định dạng TXT 
          hoặc Excel để lưu trữ lâu dài. Hãy thực hiện ngay để không bị mất dữ liệu sau 7 ngày.
        </p>
      </div>
    </div>
  );
}
