"use client";

import { useEffect, useState } from "react";
import { serviceOrderAPI, ServiceOrder } from "@/lib/service-order-client";
import { 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ArrowPathIcon,
  EyeIcon
} from "@heroicons/react/24/outline";
import { Button } from "@/app/components/ui/button";

const statusConfig = {
  pending: { 
    label: "Chờ xử lý", 
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
    icon: ClockIcon 
  },
  processing: { 
    label: "Đang xử lý", 
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
    icon: ArrowPathIcon 
  },
  completed: { 
    label: "Hoàn thành", 
    color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
    icon: CheckCircleIcon 
  },
  cancelled: { 
    label: "Đã hủy", 
    color: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
    icon: XCircleIcon 
  },
  failed: { 
    label: "Thất bại", 
    color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
    icon: XCircleIcon 
  },
  refunded: { 
    label: "Đã hoàn tiền", 
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
    icon: ArrowPathIcon 
  },
};

const platformLabels: Record<string, string> = {
  tiktok: "TikTok",
  shopee: "Shopee",
  lazada: "Lazada",
  facebook: "Facebook",
  instagram: "Instagram",
  youtube: "YouTube",
};

export default function ServiceOrderList() {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterPlatform, setFilterPlatform] = useState<string>("");

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await serviceOrderAPI.getServiceOrders({
        status: filterStatus || undefined,
        platform: filterPlatform || undefined,
        page: currentPage,
        limit: 10,
      });

      setOrders(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (err: any) {
      setError(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage, filterStatus, filterPlatform]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <ArrowPathIcon className="w-12 h-12 mx-auto text-gray-400 animate-spin" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <p className="text-red-800 dark:text-red-400">{error}</p>
        <Button onClick={fetchOrders} className="mt-4">
          Thử lại
        </Button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <ClockIcon className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Chưa có đơn hàng nào
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Tạo đơn hàng đầu tiên của bạn để bắt đầu!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="pending">Chờ xử lý</option>
          <option value="processing">Đang xử lý</option>
          <option value="completed">Hoàn thành</option>
          <option value="cancelled">Đã hủy</option>
          <option value="failed">Thất bại</option>
        </select>

        <select
          value={filterPlatform}
          onChange={(e) => {
            setFilterPlatform(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
        >
          <option value="">Tất cả nền tảng</option>
          <option value="tiktok">TikTok</option>
          <option value="shopee">Shopee</option>
          <option value="lazada">Lazada</option>
          <option value="facebook">Facebook</option>
          <option value="instagram">Instagram</option>
          <option value="youtube">YouTube</option>
        </select>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => {
          const StatusIcon = statusConfig[order.status].icon;
          const totalQuantity = order.productLinks.reduce((sum, link) => sum + Number(link.quantity), 0);

          return (
            <div
              key={order._id}
              className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400">
                      {platformLabels[order.platform] || order.platform}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${statusConfig[order.status].color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {statusConfig[order.status].label}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {order.serverName}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Tổng số lượng: {totalQuantity.toLocaleString("vi-VN")} • 
                      {order.productLinks.length} link
                    </p>
                  </div>

                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    <p>Thời gian xử lý: {order.estimatedTime}</p>
                    <p>Ngày tạo: {formatDate(order.createdAt)}</p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Tổng tiền</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-500">
                      {order.totalPrice.toLocaleString("vi-VN")}đ
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Navigate to order detail page
                      window.location.href = `/history/${order._id}`;
                    }}
                  >
                    <EyeIcon className="w-4 h-4 mr-2" />
                    Chi tiết
                  </Button>
                </div>
              </div>

              {order.note && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-semibold">Ghi chú:</span> {order.note}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Trước
          </Button>
          <span className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
            Trang {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Sau
          </Button>
        </div>
      )}
    </div>
  );
}
