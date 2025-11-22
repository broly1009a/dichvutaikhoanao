"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { ReceiptPercentIcon, XMarkIcon, CheckCircleIcon, ClockIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { DepositModal } from "../deposit/components/DepositModal";

interface Invoice {
  _id: string;
  orderCode: number;
  amount: number;
  bonus: number;
  totalAmount: number;
  status: 'pending' | 'completed' | 'failed' | 'expired';
  description: string;
  paymentMethod: string;
  paymentDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function InvoicesPage() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>(""); // "" = all, "pending", "completed"
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Load invoices
  useEffect(() => {
    if (user?._id) {
      fetchInvoices();
    }
  }, [user?._id, currentPage, statusFilter]);

  const fetchInvoices = async () => {
    if (!user?._id) return;

    setLoading(true);
    try {
      let url = `/api/invoices?userId=${user._id}&page=${currentPage}&limit=10`;
      if (statusFilter) {
        url += `&status=${statusFilter}`;
      }

      const response = await fetch(url);
      const result = await response.json();

      if (result.success) {
        setInvoices(result.data);
        setPagination(result.pagination);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            <CheckCircleIcon className="w-4 h-4" />
            Đã thanh toán
          </div>
        );
      case 'pending':
        return (
          <div className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
            <ClockIcon className="w-4 h-4" />
            Chờ thanh toán
          </div>
        );
      case 'failed':
        return (
          <div className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
            <XCircleIcon className="w-4 h-4" />
            Thanh toán thất bại
          </div>
        );
      case 'expired':
        return (
          <div className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
            <XMarkIcon className="w-4 h-4" />
            Hết hạn
          </div>
        );
      default:
        return null;
    }
  };

  const handlePayAgain = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsDepositModalOpen(true);
  };

  const handleCreateInvoice = async (amount: number) => {
    if (selectedInvoice) {
      // Update invoice status to completed
      try {
        await fetch('/api/invoices', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderCode: selectedInvoice.orderCode,
            status: 'completed',
            paymentDate: new Date()
          })
        });

        // Refresh invoices
        fetchInvoices();
      } catch (error) {
        console.error('Error updating invoice:', error);
      }
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Vui lòng đăng nhập để xem hóa đơn</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-3 rounded-xl">
              <ReceiptPercentIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Hóa Đơn</h1>
              <p className="text-gray-600 dark:text-gray-400">Quản lý và thanh toán lại hóa đơn nạp tiền của bạn</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-3 flex-wrap">
          <button
            onClick={() => {
              setStatusFilter("");
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              statusFilter === ""
                ? "bg-purple-600 text-white shadow-lg"
                : "bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-700 hover:border-purple-500"
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => {
              setStatusFilter("pending");
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              statusFilter === "pending"
                ? "bg-yellow-100 text-yellow-800 shadow-lg"
                : "bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-700 hover:border-yellow-500"
            }`}
          >
            <ClockIcon className="w-4 h-4" />
            Chờ thanh toán
          </button>
          <button
            onClick={() => {
              setStatusFilter("completed");
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              statusFilter === "completed"
                ? "bg-green-100 text-green-800 shadow-lg"
                : "bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-700 hover:border-green-500"
            }`}
          >
            <CheckCircleIcon className="w-4 h-4" />
            Đã thanh toán
          </button>
        </div>

        {/* Invoices Table */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-slate-700">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block animate-spin">
                  <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full"></div>
                </div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Đang tải hóa đơn...</p>
              </div>
            </div>
          ) : invoices.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <ReceiptPercentIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 text-lg">Không có hóa đơn nào</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Mã hóa đơn
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Số tiền
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Khuyến mãi
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Tổng cộng
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Trạng thái
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Ngày tạo
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                  {invoices.map((invoice) => (
                    <tr
                      key={invoice._id}
                      className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <code className="bg-gray-100 dark:bg-slate-900 px-3 py-1 rounded text-sm text-gray-900 dark:text-gray-100 font-mono">
                          {invoice.orderCode}
                        </code>
                      </td>
                      <td className="px-6 py-4 text-gray-900 dark:text-gray-100 font-medium">
                        {formatCurrency(invoice.amount)} đ
                      </td>
                      <td className="px-6 py-4 text-orange-600 dark:text-orange-400 font-medium">
                        +{formatCurrency(invoice.bonus)} đ
                      </td>
                      <td className="px-6 py-4 text-gray-900 dark:text-gray-100 font-bold text-lg">
                        {formatCurrency(invoice.totalAmount)} đ
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(invoice.status)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(invoice.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        {invoice.status === 'pending' ? (
                          <button
                            onClick={() => handlePayAgain(invoice)}
                            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg transition-all hover:scale-105 text-sm"
                          >
                            Thanh toán
                          </button>
                        ) : invoice.status === 'failed' ? (
                          <button
                            onClick={() => handlePayAgain(invoice)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:shadow-lg transition-all hover:scale-105 text-sm"
                          >
                            Thử lại
                          </button>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400 text-sm">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Hiển thị {(currentPage - 1) * pagination.limit + 1} đến{" "}
              {Math.min(currentPage * pagination.limit, pagination.total)} trong{" "}
              {pagination.total} hóa đơn
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-slate-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:border-purple-500 transition-colors"
              >
                Trước
              </button>
              <div className="flex items-center gap-2">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 rounded-lg font-medium transition-all ${
                      page === currentPage
                        ? "bg-purple-600 text-white shadow-lg"
                        : "bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-700 hover:border-purple-500"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentPage(Math.min(pagination.pages, currentPage + 1))}
                disabled={currentPage === pagination.pages}
                className="px-4 py-2 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-slate-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:border-purple-500 transition-colors"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Deposit Modal */}
      <DepositModal
        isOpen={isDepositModalOpen}
        onClose={() => {
          setIsDepositModalOpen(false);
          setSelectedInvoice(null);
        }}
        onCreateInvoice={handleCreateInvoice}
        prefilledAmount={selectedInvoice?.amount}
      />
    </div>
  );
}
