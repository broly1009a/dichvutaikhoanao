'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { EyeIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { DepositModal } from '../components/DepositModal';
import { ProtectedRoute } from '@/lib/components/ProtectedRoute';

interface Invoice {
  _id: string;
  orderCode: number;
  amount: number;
  bonus: number;
  totalAmount: number;
  status: 'pending' | 'completed' | 'failed' | 'expired';
  description: string;
  paymentMethod: string;
  createdAt: string;
  paymentDate?: string;
  expiresAt: string;
  qrCode?: string;
  checkoutUrl?: string;
}

interface InvoiceResponse {
  success: boolean;
  data?: Invoice[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  error?: string;
}

export default function InvoicePage() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [payInvoice, setPayInvoice] = useState<Invoice | null>(null);

  const fetchInvoices = async (selectedPage: number = 1, status?: string) => {
    if (!user?._id) return;

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        userId: user._id,
        page: selectedPage.toString(),
        limit: '10',
      });

      if (status) {
        params.append('status', status);
      }

      const response = await fetch(`/api/invoices?${params}`);
      const result: InvoiceResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch invoices');
      }

      setInvoices(result.data || []);
      setPagination(result.pagination || { page: 1, limit: 10, total: 0, pages: 0 });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Fetch invoices error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchInvoices(1);
    }
  }, [user]);

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setPage(1);
    fetchInvoices(1, status || undefined);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchInvoices(newPage, statusFilter || undefined);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      expired: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    };
    return badges[status as keyof typeof badges] || badges.pending;
  };

  const getStatusText = (status: string) => {
    const texts = {
      pending: 'Chờ thanh toán',
      completed: 'Đã thanh toán',
      failed: 'Thanh toán thất bại',
      expired: 'Đã hết hạn',
    };
    return texts[status as keyof typeof texts] || status;
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: <ClockIcon className="w-4 h-4" />,
      completed: <CheckCircleIcon className="w-4 h-4" />,
      failed: <XCircleIcon className="w-4 h-4" />,
      expired: <ClockIcon className="w-4 h-4" />,
    };
    return icons[status as keyof typeof icons] || icons.pending;
  };

  if (loading && invoices.length === 0) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-64 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-96 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-slate-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">Lỗi: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Hoá đơn nạp tiền</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Danh sách và chi tiết các hoá đơn nạp tiền của bạn.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <ClockIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tổng hoá đơn</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{pagination.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <ClockIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Chờ thanh toán</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {invoices.filter(inv => inv.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Đã thanh toán</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {invoices.filter(inv => inv.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <XCircleIcon className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Thất bại</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {invoices.filter(inv => inv.status === 'failed').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => handleStatusFilter('')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              statusFilter === ''
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-gray-300 hover:bg-gray-200'
            }`}
          >
            Tất cả ({pagination.total})
          </button>
          <button
            onClick={() => handleStatusFilter('pending')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              statusFilter === 'pending'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-gray-300 hover:bg-gray-200'
            }`}
          >
            Chờ thanh toán
          </button>
          <button
            onClick={() => handleStatusFilter('completed')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              statusFilter === 'completed'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-gray-300 hover:bg-gray-200'
            }`}
          >
            Đã thanh toán
          </button>
          <button
            onClick={() => handleStatusFilter('failed')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              statusFilter === 'failed'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-gray-300 hover:bg-gray-200'
            }`}
          >
            Thất bại
          </button>
        </div>

        {/* Invoices Table */}
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Danh sách hoá đơn</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Trang {pagination.page} / {pagination.pages} - Tổng {pagination.total} hoá đơn
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                    Mã đơn hàng
                  </th>
                  <th className="px-6 py-4 text-left text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                    Số tiền
                  </th>
                  <th className="px-6 py-4 text-center text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-left text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-4 text-center text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {invoices.map((invoice) => (
                  <tr
                    key={invoice._id}
                    className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-gray-900 dark:text-white font-mono font-medium">
                          #{invoice.orderCode}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-gray-900 dark:text-white font-bold">
                          {invoice.amount.toLocaleString('vi-VN')} đ
                        </span>
                        {invoice.bonus > 0 && (
                          <span className="text-xs text-green-600">
                            +{invoice.bonus.toLocaleString('vi-VN')} bonus
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(invoice.status)}`}>
                        {getStatusIcon(invoice.status)}
                        <span className="ml-1">{getStatusText(invoice.status)}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                      {new Date(invoice.createdAt).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedInvoice(invoice)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Xem chi tiết"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        {invoice.status === 'pending' && (invoice.qrCode || invoice.checkoutUrl) && (
                          <button
                            className="px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg transition-all hover:scale-105 text-xs"
                            onClick={() => {
                              setPayInvoice(invoice);
                              setIsDepositModalOpen(true);
                            }}
                          >
                            Tiếp tục thanh toán
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-slate-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Trang {pagination.page} / {pagination.pages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-200"
                >
                  Trước
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-200"
                >
                  Tiếp
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Invoice Detail Modal */}
        {selectedInvoice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Chi tiết hoá đơn #{selectedInvoice.orderCode}
                  </h3>
                  <button
                    onClick={() => setSelectedInvoice(null)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XCircleIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Mã đơn hàng
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white font-mono">
                      #{selectedInvoice.orderCode}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Số tiền
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white font-bold">
                      {selectedInvoice.amount.toLocaleString('vi-VN')} đ
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Bonus
                    </label>
                    <p className="mt-1 text-sm text-green-600">
                      +{selectedInvoice.bonus.toLocaleString('vi-VN')} đ
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Tổng tiền
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white font-bold">
                      {selectedInvoice.totalAmount.toLocaleString('vi-VN')} đ
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Phương thức
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {selectedInvoice.paymentMethod}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Trạng thái
                    </label>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mt-1 ${getStatusBadge(selectedInvoice.status)}`}>
                      {getStatusIcon(selectedInvoice.status)}
                      <span className="ml-1">{getStatusText(selectedInvoice.status)}</span>
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Ngày tạo
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {new Date(selectedInvoice.createdAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                  {selectedInvoice.paymentDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Ngày thanh toán
                      </label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                        {new Date(selectedInvoice.paymentDate).toLocaleString('vi-VN')}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Hết hạn
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {new Date(selectedInvoice.expiresAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Mô tả
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {selectedInvoice.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Deposit Modal */}
        <DepositModal
          isOpen={isDepositModalOpen}
          onClose={() => {
            setIsDepositModalOpen(false);
            setPayInvoice(null);
          }}
          prefilledAmount={payInvoice?.amount}
          existingInvoice={payInvoice ? {
            orderCode: payInvoice.orderCode,
            qrCode: payInvoice.qrCode,
            checkoutUrl: payInvoice.checkoutUrl
          } : undefined}
          onCreateInvoice={() => {
            setIsDepositModalOpen(false);
            setPayInvoice(null);
            fetchInvoices(page, statusFilter || undefined);
          }}
        />
      </div>
    </ProtectedRoute>
  );
}
