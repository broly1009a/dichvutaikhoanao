"use client";

import { useEffect, useState } from "react";
import { serviceOrderAPI, ServiceOrder } from "@/lib/service-order-client";
import { 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ArrowPathIcon,
  EyeIcon,
  FunnelIcon,
  ShoppingBagIcon,
  CalendarIcon,
  CurrencyDollarIcon
} from "@heroicons/react/24/outline";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/app/components/ui/select";

const statusConfig = {
  pending: { 
    label: "Chờ xử lý", 
    color: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400 dark:border-yellow-800",
    icon: ClockIcon,
    dotColor: "bg-yellow-500"
  },
  processing: { 
    label: "Đang xử lý", 
    color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800",
    icon: ArrowPathIcon,
    dotColor: "bg-blue-500 animate-pulse"
  },
  completed: { 
    label: "Hoàn thành", 
    color: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800",
    icon: CheckCircleIcon,
    dotColor: "bg-green-500"
  },
  cancelled: { 
    label: "Đã hủy", 
    color: "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-400 dark:border-gray-800",
    icon: XCircleIcon,
    dotColor: "bg-gray-500"
  },
  failed: { 
    label: "Thất bại", 
    color: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800",
    icon: XCircleIcon,
    dotColor: "bg-red-500"
  },
  refunded: { 
    label: "Đã hoàn tiền", 
    color: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-400 dark:border-purple-800",
    icon: ArrowPathIcon,
    dotColor: "bg-purple-500"
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
        status: filterStatus && filterStatus !== "all" ? filterStatus : undefined,
        platform: filterPlatform && filterPlatform !== "all" ? filterPlatform : undefined,
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
      <div className="flex items-center justify-center py-16">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
              <ArrowPathIcon className="relative w-16 h-16 text-blue-600 dark:text-blue-400 animate-spin" />
            </div>
            <p className="mt-6 text-lg font-medium text-gray-700 dark:text-gray-300">Đang tải đơn hàng...</p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Vui lòng đợi trong giây lát</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30">
        <CardContent className="py-8">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <XCircleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-400 mb-2">
                Không thể tải đơn hàng
              </h3>
              <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
              <Button 
                onClick={fetchOrders} 
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <ArrowPathIcon className="w-4 h-4 mr-2" />
                Thử lại
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full blur-xl opacity-30"></div>
            <div className="relative w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center">
              <ShoppingBagIcon className="w-10 h-10 text-gray-400 dark:text-gray-500" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            Chưa có đơn hàng nào
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-6">
            Danh sách đơn hàng của bạn đang trống. Hãy tạo đơn hàng đầu tiên để bắt đầu sử dụng dịch vụ!
          </p>
          <Button 
            onClick={() => window.location.href = "/order"}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <ShoppingBagIcon className="w-4 h-4 mr-2" />
            Tạo đơn hàng mới
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <Card className="border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-white dark:from-slate-900 dark:to-slate-800">
        <CardContent className="py-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
              <FunnelIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Bộ lọc đơn hàng</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Tìm kiếm và lọc đơn hàng theo tiêu chí</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Trạng thái
              </label>
              <Select 
                value={filterStatus} 
                onValueChange={(value) => {
                  setFilterStatus(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Tất cả trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="pending">Chờ xử lý</SelectItem>
                  <SelectItem value="processing">Đang xử lý</SelectItem>
                  <SelectItem value="completed">Hoàn thành</SelectItem>
                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                  <SelectItem value="failed">Thất bại</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nền tảng
              </label>
              <Select 
                value={filterPlatform} 
                onValueChange={(value) => {
                  setFilterPlatform(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Tất cả nền tảng" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả nền tảng</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="shopee">Shopee</SelectItem>
                  <SelectItem value="lazada">Lazada</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {(filterStatus && filterStatus !== "all") || (filterPlatform && filterPlatform !== "all") ? (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Đang lọc:</span>
              {filterStatus && filterStatus !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  {statusConfig[filterStatus as keyof typeof statusConfig]?.label}
                  <button 
                    onClick={() => setFilterStatus("all")}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {filterPlatform && filterPlatform !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  {platformLabels[filterPlatform]}
                  <button 
                    onClick={() => setFilterPlatform("all")}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Tìm thấy <span className="font-semibold text-gray-900 dark:text-gray-100">{orders.length}</span> đơn hàng
        </p>
      </div>

      {/* Orders List */}
      <div className="grid gap-4">
        {orders.map((order, index) => {
          const StatusIcon = statusConfig[order.status].icon;
          const totalQuantity = order.productLinks.reduce((sum, link) => sum + Number(link.quantity), 0);

          return (
            <Card 
              key={order._id}
              className="group hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 overflow-hidden"
              style={{
                animation: `fadeIn 0.3s ease-out ${index * 0.05}s both`
              }}
            >
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Left Section - Main Info */}
                  <div className="flex-1 space-y-4">
                    {/* Header with Badges */}
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge 
                          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 px-3 py-1"
                        >
                          {platformLabels[order.platform] || order.platform}
                        </Badge>
                        <Badge 
                          className={`${statusConfig[order.status].color} border px-3 py-1 flex items-center gap-1.5`}
                        >
                          <span className={`w-2 h-2 rounded-full ${statusConfig[order.status].dotColor}`}></span>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {statusConfig[order.status].label}
                        </Badge>
                      </div>
                    </div>

                    {/* Server Name */}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {order.serverName}
                      </h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <ShoppingBagIcon className="w-4 h-4" />
                          <strong className="text-gray-900 dark:text-gray-100">{totalQuantity.toLocaleString("vi-VN")}</strong> đơn vị
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="flex items-center gap-1">
                          <strong className="text-gray-900 dark:text-gray-100">{order.productLinks.length}</strong> link
                        </span>
                      </div>
                    </div>

                    {/* Timeline Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                          <ClockIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-500">Thời gian xử lý</p>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{order.estimatedTime}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/30">
                          <CalendarIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-500">Ngày tạo</p>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{formatDate(order.createdAt)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Note */}
                    {order.note && (
                      <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                        <p className="text-sm text-amber-800 dark:text-amber-400">
                          <span className="font-semibold">💬 Ghi chú:</span> {order.note}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right Section - Price & Actions */}
                  <div className="lg:border-l lg:pl-6 lg:w-64 flex flex-col gap-4">
                    <div className="flex-1">
                      <div className="text-center lg:text-right">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Tổng thanh toán</p>
                        <div className="flex items-center justify-center lg:justify-end gap-2">
                          <CurrencyDollarIcon className="w-5 h-5 text-red-500" />
                          <p className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 dark:from-red-500 dark:to-orange-500 bg-clip-text text-transparent">
                            {order.totalPrice.toLocaleString("vi-VN")}đ
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="default"
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all"
                      onClick={() => {
                        window.location.href = `/order/${order._id}`;
                      }}
                    >
                      <EyeIcon className="w-4 h-4 mr-2" />
                      Xem chi tiết
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card className="bg-gradient-to-r from-gray-50 to-white dark:from-slate-900 dark:to-slate-800">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Trang <span className="font-semibold text-gray-900 dark:text-gray-100">{currentPage}</span> / {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Sau
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

<style jsx global>{`
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`}</style>
