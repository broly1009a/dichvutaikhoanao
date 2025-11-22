"use client";

import { useState, useEffect } from "react";
import { Search, Download, Eye, Trash2, Filter } from "lucide-react";
import Link from "next/link";

interface Order {
  _id: string;
  userId: string | {
    _id: string;
    email: string;
    username?: string;
    phone?: string;
    fullName?: string;
    balance?: number;
    totalSpent?: number;
    status?: string;
  };
  productId: {
    _id: string;
    title: string;
    price: number;
    platform: string;
  };
  quantity: number;
  totalPrice: number;
  status: "pending" | "completed" | "cancelled" | "refunded";
  paymentStatus: "paid" | "failed";
  createdAt: string;
  updatedAt: string;
  accounts?: Array<{
    username: string;
    password: string;
    email?: string;
    emailPassword?: string;
    phone?: string;
  }>;
}

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const totalPages = Math.ceil(filteredOrders.length / pageSize);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Fetch orders
  useEffect(() => {
    fetchOrders();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = orders;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((order) => {
        // Tìm theo orderId đầy đủ hoặc 8 ký tự cuối
        const orderIdMatch =
          order._id?.toLowerCase().includes(query) ||
          order._id?.slice(-8).toLowerCase().includes(query);

        // Tìm theo email và username
        let userEmail = "";
        let userUsername = "";
        if (typeof order.userId !== "string" && order.userId) {
          userEmail = order.userId.email?.toLowerCase() || "";
          userUsername = order.userId.username?.toLowerCase() || "";
        } else if (typeof order.userId === "string") {
          userEmail = order.userId.toLowerCase();
        }

        const userMatch =
          userEmail.includes(query) || userUsername.includes(query);

        const productMatch = order.productId.title?.toLowerCase().includes(query);

        return orderIdMatch || userMatch || productMatch;
      });
    }

    // Status filter
    if (filterStatus !== "all") {
      result = result.filter((order) => order.status === filterStatus);
    }

    // Payment status filter
    if (filterPaymentStatus !== "all") {
      result = result.filter((order) => order.paymentStatus === filterPaymentStatus);
    }

    setFilteredOrders(result);
    setCurrentPage(1); // Reset to first page
  }, [orders, searchQuery, filterStatus, filterPaymentStatus]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/orders?limit=1000");
      const data = await response.json();
      if (data.data) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (orderId: string) => {
    if (!confirm("Bạn chắc chắn muốn xóa order này?")) return;

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setOrders(orders.filter((o) => o._id !== orderId));
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const downloadExcel = () => {
    const headers = [
      "Order ID",
      "User Email",
      "Product",
      "Quantity",
      "Total Price",
      "Status",
      "Payment Status",
      "Created At",
    ];

    const rows = filteredOrders.map((order) => [
      order._id,
      typeof order.userId === "string" ? order.userId : order.userId.email,
      order.productId.title,
      order.quantity,
      order.totalPrice,
      order.status,
      order.paymentStatus,
      new Date(order.createdAt).toLocaleString("vi-VN"),
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const element = document.createElement("a");
    element.setAttribute("href", "data:text/csv;charset=utf-8," + encodeURIComponent(csv));
    element.setAttribute("download", `orders-${new Date().getTime()}.csv`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400";
      case "pending":
        return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400";
      case "cancelled":
        return "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400";
      case "refunded":
        return "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400";
      case "failed":
        return "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quản lý Orders</h1>
        <button
          onClick={downloadExcel}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          <Download size={20} />
          Xuất Excel
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Tìm Order ID, Email, Product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </select>

          {/* Payment Status Filter */}
          <select
            value={filterPaymentStatus}
            onChange={(e) => setFilterPaymentStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả Payment Status</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
          </select>

          {/* Page Size */}
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(parseInt(e.target.value));
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={10}>10 dòng</option>
            <option value={20}>20 dòng</option>
            <option value={50}>50 dòng</option>
            <option value={100}>100 dòng</option>
          </select>
        </div>

        {/* Results count */}
        <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          Tìm thấy <span className="font-semibold">{filteredOrders.length}</span> orders
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Đang tải dữ liệu...</p>
        </div>
      ) : paginatedOrders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Không có order nào</p>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="bg-white dark:bg-slate-900 rounded-lg overflow-hidden border border-gray-200 dark:border-slate-700">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Product
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">
                      Qty
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                      Giá
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">
                      Status
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Ngày
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                  {paginatedOrders.map((order) => (
                    <tr
                      key={order._id}
                      className="hover:bg-gray-50 dark:hover:bg-slate-800 transition"
                    >
                      <td className="px-6 py-4">
                        <span className="text-xs font-mono bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded">
                          {order._id.slice(-8).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {typeof order.userId === "string" ? "N/A" : order.userId.fullName || "N/A"}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {typeof order.userId === "string" ? order.userId : order.userId.email}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {order.productId.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {order.productId.platform}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {order.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {order.totalPrice.toLocaleString("vi-VN")} đ
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(order.createdAt).toLocaleString("vi-VN", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit"
                        })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/admin/orders/${order._id}`}
                            className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-slate-800 rounded transition"
                            title="Xem chi tiết"
                          >
                            <Eye size={18} />
                          </Link>
                          <button
                            onClick={() => handleDelete(order._id)}
                            className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-slate-800 rounded transition"
                            title="Xóa"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Trang <span className="font-semibold">{currentPage}</span> / 
                <span className="font-semibold"> {totalPages}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
                >
                  Trước
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
