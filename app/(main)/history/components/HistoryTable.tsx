"use client";

import { HistoryItem } from "../data";
import { HistoryRow } from "./HistoryRow";

interface HistoryTableProps {
  data: HistoryItem[];
  onViewDetail: (id: number) => void;
  onDownloadTxt: (id: number) => void;
  onDownloadExcel: (id: number) => void;
  onDelete: (id: number) => void;
}

export function HistoryTable({
  data,
  onViewDetail,
  onDownloadTxt,
  onDownloadExcel,
  onDelete,
}: HistoryTableProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-max">
          <thead className="bg-gray-100 dark:bg-slate-800 sticky top-0">
            <tr className="border-b border-gray-200 dark:border-slate-700">
              <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300 text-sm font-semibold">
                #
              </th>
              <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300 text-sm font-semibold">
                Mã giao dịch
              </th>
              <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300 text-sm font-semibold">
                Sản phẩm
              </th>
              <th className="px-4 py-3 text-center text-gray-700 dark:text-gray-300 text-sm font-semibold">
                Số lượng
              </th>
              <th className="px-4 py-3 text-center text-gray-700 dark:text-gray-300 text-sm font-semibold">
                Thanh toán
              </th>
              <th className="px-4 py-3 text-center text-gray-700 dark:text-gray-300 text-sm font-semibold">
                Thời gian
              </th>
              <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300 text-sm font-semibold">
                Ngày tạo
              </th>
              <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300 text-sm font-semibold whitespace-nowrap">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                >
                  Không có dữ liệu lịch sử mua hàng
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <HistoryRow
                  key={item.id}
                  item={item}
                  onViewDetail={onViewDetail}
                  onDownloadTxt={onDownloadTxt}
                  onDownloadExcel={onDownloadExcel}
                  onDelete={onDelete}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination placeholder */}
      {data.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-200 dark:border-slate-700 flex items-center justify-between">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Hiển thị <span className="font-medium">1</span> đến{" "}
            <span className="font-medium">{data.length}</span> của{" "}
            <span className="font-medium">{data.length}</span> kết quả
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors text-sm">
              Trước
            </button>
            <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm">
              1
            </button>
            <button className="px-3 py-1 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors text-sm">
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
