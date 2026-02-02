"use client";

import { useState, useEffect } from "react";
import { ChevronLeftIcon, ClipboardIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";

interface ServiceOrderDetail {
  _id: string;
  userId: any;
  serviceType: string;
  platform: string;
  serverName: string;
  quality: string;
  region?: string;
  productLinks: Array<{
    url: string;
    quantity: number;
  }>;
  shippingInfo?: {
    fullName: string;
    phoneNumber: string;
    address: string;
    province: string;
    district?: string;
    ward?: string;
  };
  totalPrice: number;
  status: string;
  estimatedTime: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
  processStartedAt?: string;
  processCompletedAt?: string;
  failureReason?: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { 
    label: "Chờ xử lý", 
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
  },
  processing: { 
    label: "Đang xử lý", 
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
  },
  completed: { 
    label: "Hoàn thành", 
    color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
  },
  cancelled: { 
    label: "Đã hủy", 
    color: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
  },
  failed: { 
    label: "Thất bại", 
    color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
  },
  refunded: { 
    label: "Đã hoàn tiền", 
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
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

export default function ServiceOrderDetailPage() {
  const params = useParams();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<ServiceOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/service-orders/${orderId}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Không thể tải dữ liệu");
        }

        const result = await response.json();
        setOrder(result.data);
      } catch (error) {
        console.error("Error fetching order:", error);
        toast.error("Lỗi", {
          description: error instanceof Error ? error.message : "Không thể tải thông tin đơn hàng",
        });
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetail();
    }
  }, [orderId]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Đã sao chép!", {
      description: "Dữ liệu đã được sao chép vào clipboard",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <p className="text-red-600 dark:text-red-400">Không tìm thấy đơn hàng</p>
        </div>
      </div>
    );
  }

  const totalQuantity = order.productLinks.reduce((sum, link) => sum + link.quantity, 0);

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <Link
        href="/order"
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
      >
        <ChevronLeftIcon className="w-4 h-4" />
        Quay lại
      </Link>

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 rounded-xl border border-blue-200 dark:border-slate-700 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Chi tiết đơn dịch vụ
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
              #{orderId.slice(-8).toUpperCase()}
            </p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-semibold shadow-sm ${statusConfig[order.status].color}`}>
            {statusConfig[order.status].label}
          </span>
        </div>
      </div>

      {/* Order Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* General Info */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
            <div className="w-1 h-5 bg-blue-600 rounded-full"></div>
            Thông tin dịch vụ
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Nền tảng</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {platformLabels[order.platform] || order.platform}
              </p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Loại dịch vụ</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {order.serviceType}
              </p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Máy chủ</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {order.serverName}
              </p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Chất lượng</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {order.quality}
              </p>
            </div>
            {order.region && (
              <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Khu vực</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {order.region}
                </p>
              </div>
            )}
            <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Thời gian xử lý</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {order.estimatedTime}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
            <div className="w-1 h-5 bg-green-600 rounded-full"></div>
            Thanh toán
          </h2>
          
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Tổng số lượng</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {totalQuantity.toLocaleString("vi-VN")}
              </p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Số lượng link</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {order.productLinks.length} link
              </p>
            </div>
            <div className="p-4 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-xs text-red-600 dark:text-red-400 mb-2">Tổng thanh toán</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-500">
                {order.totalPrice.toLocaleString("vi-VN")}đ
              </p>
            </div>
            <div className="pt-3 border-t border-gray-200 dark:border-slate-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Ngày tạo</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {formatDate(order.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Product Links */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
          <div className="w-1 h-5 bg-purple-600 rounded-full"></div>
          Danh sách link sản phẩm
          <span className="ml-auto text-sm font-normal text-gray-500 dark:text-gray-400">
            ({order.productLinks.length} link)
          </span>
        </h2>
        
        <div className="space-y-3">
          {order.productLinks.map((link, index) => (
            <div 
              key={index}
              className="group flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 rounded-lg border border-gray-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-700 transition-all"
            >
              <div className="flex-1 min-w-0 mr-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded">
                    #{index + 1}
                  </span>
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full">
                    {link.quantity.toLocaleString("vi-VN")} đơn vị
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 truncate font-mono">
                  {link.url}
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(link.url)}
                className="flex-shrink-0 p-2.5 text-blue-600 hover:text-white hover:bg-blue-600 dark:text-blue-400 dark:hover:bg-blue-600 rounded-lg transition-all shadow-sm hover:shadow-md"
                title="Sao chép link"
              >
                <ClipboardIcon className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Shipping Info - Only for buff orders */}
        {order.shippingInfo && (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
              <div className="w-1 h-5 bg-orange-600 rounded-full"></div>
              Thông tin giao hàng
            </h2>
            
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Họ và tên</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {order.shippingInfo.fullName}
                </p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Số điện thoại</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {order.shippingInfo.phoneNumber}
                </p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Địa chỉ</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {order.shippingInfo.address}
                  {order.shippingInfo.ward && `, ${order.shippingInfo.ward}`}
                  {order.shippingInfo.district && `, ${order.shippingInfo.district}`}
                  , {order.shippingInfo.province}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Note */}
        {order.note && (
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-2">
              <div className="w-1 h-5 bg-cyan-600 rounded-full"></div>
              Ghi chú
            </h2>
            <p className="text-sm text-blue-800 dark:text-blue-400 leading-relaxed">
              {order.note}
            </p>
          </div>
        )}
      </div>

      {/* Failure Reason - Full width alert */}
      {order.status === 'failed' && order.failureReason && (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-l-4 border-red-500 rounded-lg p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">!</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-red-900 dark:text-red-300 mb-1">Lý do thất bại</p>
              <p className="text-sm text-red-800 dark:text-red-400 leading-relaxed">
                {order.failureReason}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
