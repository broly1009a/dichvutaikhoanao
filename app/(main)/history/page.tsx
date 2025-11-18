"use client";

import { useState, useEffect } from "react";
import { ExclamationTriangleIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { HistoryTable } from "./components/HistoryTable";
import { toast } from "sonner";
// import Link from "next/link";
import { useAuthContext } from "@/lib/context/AuthContext";
import { useRouter } from "next/navigation";
interface HistoryItem {
  _id: string;
  transactionId: string;
  product: string;
  quantity: number;
  totalPrice: number;
  status: string;
  createdAt: string;
  account?: {
    username: string;
    password: string;
    email?: string;
  };
  accounts?: Array<{
    username: string;
    password: string;
    email?: string;
    emailPassword?: string;
    phone?: string;
  }>;
  productId?: {
    title: string;
    price: number;
    platform: string;
  };
}

export default function HistoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  // const [selectedOrder, setSelectedOrder] = useState<HistoryItem | null>(null);
  const { user } = useAuthContext();

  const router = useRouter();

  // Fetch orders từ API
  useEffect(() => {
    if (!user) {
      // Nếu chưa đăng nhập điều hướng về trang đăng nhập
      router.push("/auth/login");
      return;
    }
    fetchOrders();
  }, [page, user]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/orders?page=${page}&limit=10`);
      const result = await response.json();

      if (!response.ok) {
        toast.error("Lỗi", {
          description: result.error || "Không thể tải lịch sử mua hàng",
        });
        return;
      }

      // Transform API data để match HistoryTable structure
      const transformedData = result.data.map((order: any) => ({
        _id: order._id,
        transactionId: `ORD-${order._id.toString().slice(-8).toUpperCase()}`,
        product: order.productId?.title || "Không rõ",
        quantity: order.quantity,
        totalPrice: order.totalPrice,
        status: order.status,
        createdAt: order.createdAt,
        account: order.account,
        productId: order.productId,
      }));

      setData(transformedData);
      setTotalPages(result.pagination.totalPages);
    } catch (error: any) {
      toast.error("Lỗi", {
        description: error.message || "Không thể tải lịch sử mua hàng",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter data based on search query
  const filteredData = data.filter(
    (item) =>
      item.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.product.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDownloadTxt = (id: string) => {
    const item = data.find((item) => item._id === id);
    if (item) {
      // Tạo nội dung file TXT
      const content = `
Mã Giao Dịch: ${item.transactionId}
Sản Phẩm: ${item.product}
Số Lượng: ${item.quantity}
Tổng Tiền: ${item.totalPrice.toLocaleString("vi-VN")} đ
Trạng Thái: ${item.status}
Ngày Mua: ${new Date(item.createdAt).toLocaleString("vi-VN")}

Thông Tin Tài Khoản:
Username: ${item.account?.username || "N/A"}
Password: ${item.account?.password || "N/A"}
Email: ${item.account?.email || "N/A"}
      `.trim();

      // Download file
      const element = document.createElement("a");
      element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(content));
      element.setAttribute("download", `${item.transactionId}.txt`);
      element.style.display = "none";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      toast.success("Đã tải file TXT", {
        description: `${item.transactionId}.txt`,
      });
    }
  };

  const handleDownloadExcel = (id: string) => {
    const item = data.find((item) => item._id === id);
    if (item) {
      // Tạo CSV (Excel compatible)
      const headers = ["Mã GD", "Sản Phẩm", "SL", "Giá", "Trạng Thái", "Ngày Mua", "Username", "Email"];
      const values = [
        item.transactionId,
        item.product,
        item.quantity,
        item.totalPrice,
        item.status,
        new Date(item.createdAt).toLocaleString("vi-VN"),
        item.account?.username || "N/A",
        item.account?.email || "N/A",
      ];

      const csv = [headers, values].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");

      const element = document.createElement("a");
      element.setAttribute("href", "data:text/csv;charset=utf-8," + encodeURIComponent(csv));
      element.setAttribute("download", `${item.transactionId}.csv`);
      element.style.display = "none";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      toast.success("Đã tải file Excel", {
        description: `${item.transactionId}.csv`,
      });
    }
  };

  const handleDelete = async (id: string) => {
    const item = data.find((item) => item._id === id);
    if (item) {
      if (window.confirm(`Bạn có chắc chắn muốn xoá đơn hàng ${item.transactionId}?`)) {
        try {
          // API delete chưa có, nên chỉ xoá client-side
          setData(data.filter((item) => item._id !== id));
          toast.success("Đã xoá đơn hàng", {
            description: `Mã: ${item.transactionId}`,
          });
        } catch (error: any) {
          toast.error("Lỗi", {
            description: error.message,
          });
        }
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

      {/* Loading State */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Đang tải lịch sử mua hàng...</p>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Chưa có đơn hàng nào</p>
        </div>
      ) : (
        <>
          {/* Data Table */}
          <HistoryTable
            data={filteredData}
            onDownloadTxt={handleDownloadTxt}
            onDownloadExcel={handleDownloadExcel}
            onDelete={handleDelete}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg disabled:opacity-50"
              >
                Trước
              </button>
              <span className="text-gray-700 dark:text-gray-300">
                Trang {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          )}
        </>
      )}

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
