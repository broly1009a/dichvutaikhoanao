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
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
      >
        <ChevronLeftIcon className="w-4 h-4" />
        Quay lại danh sách
      </Link>

      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Chi tiết đơn dịch vụ
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              ID: {orderId}
            </p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-semibold ${statusConfig[order.status].color}`}>
            {statusConfig[order.status].label}
          </span>
        </div>
      </div>

      {/* Order Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* General Info */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Thông tin chung
          </h2>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Nền tảng:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {platformLabels[order.platform] || order.platform}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Loại dịch vụ:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {order.serviceType}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Máy chủ:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {order.serverName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Chất lượng:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {order.quality}
              </span>
            </div>
            {order.region && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Khu vực:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {order.region}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Thời gian xử lý:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {order.estimatedTime}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Thông tin thanh toán
          </h2>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Tổng số lượng:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {totalQuantity.toLocaleString("vi-VN")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Số lượng link:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {order.productLinks.length}
              </span>
            </div>
            <div className="pt-3 border-t border-gray-200 dark:border-slate-700">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900 dark:text-white">Tổng tiền:</span>
                <span className="text-2xl font-bold text-red-600 dark:text-red-500">
                  {order.totalPrice.toLocaleString("vi-VN")}đ
                </span>
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Ngày tạo:</span>
              <span className="text-gray-900 dark:text-white">
                {formatDate(order.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Links */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Danh sách link sản phẩm
        </h2>
        
        <div className="space-y-3">
          {order.productLinks.map((link, index) => (
            <div 
              key={index}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-lg"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  Link {index + 1}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {link.url}
                </p>
              </div>
              <div className="flex items-center gap-3 ml-4">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {link.quantity.toLocaleString("vi-VN")} đơn vị
                </span>
                <button
                  onClick={() => copyToClipboard(link.url)}
                  className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded transition"
                  title="Sao chép link"
                >
                  <ClipboardIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shipping Info - Only for buff orders */}
      {order.shippingInfo && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Thông tin giao hàng
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Họ và tên</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {order.shippingInfo.fullName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Số điện thoại</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {order.shippingInfo.phoneNumber}
              </p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">Địa chỉ</p>
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
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">Ghi chú:</p>
          <p className="text-sm text-blue-800 dark:text-blue-400">{order.note}</p>
        </div>
      )}

      {/* Failure Reason */}
      {order.status === 'failed' && order.failureReason && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm font-semibold text-red-900 dark:text-red-300 mb-1">Lý do thất bại:</p>
          <p className="text-sm text-red-800 dark:text-red-400">{order.failureReason}</p>
        </div>
      )}
    </div>
  );
}
