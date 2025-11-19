"use client";

import { useState, useEffect } from "react";
import { StatCard } from "../components/StatCard";
import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ClockIcon,
  CheckCircleIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { Transaction } from "../data/mockData";

interface APITransaction {
  id: string;
  transactionId: string;
  userName: string;
  userEmail: string;
  type: string;
  amount: number;
  bonus: number;
  totalAmount: number;
  status: 'pending' | 'completed' | 'failed';
  time: string;
  date: string;
  description: string;
  orderCode: string;
  uuid: string;
}

interface PaymentsPageProps {
  onOpenTransactionModal?: (transaction: Transaction) => void;
}

interface PaymentsData {
  transactions: APITransaction[];
  stats: {
    totalDeposit: number;
    totalBonus: number;
    totalWithdraw: number;
    pendingCount: number;
    completedCount: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export function PaymentsPage({ onOpenTransactionModal }: PaymentsPageProps) {
  const [paymentsData, setPaymentsData] = useState<PaymentsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);

  const fetchPayments = async (selectedPage: number, status?: string) => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      query.append('page', selectedPage.toString());
      query.append('limit', '20');
      if (status) {
        query.append('status', status);
      }

      const response = await fetch(`/api/admin/payments?${query}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch payments data');
      }

      const result = await response.json();
      setPaymentsData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Payments fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments(1);
  }, []);

  const handleStatusChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    setPage(1);
    fetchPayments(1, newStatus || undefined);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchPayments(newPage, statusFilter || undefined);
  };

  const handleStatusUpdate = async (transactionId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/admin/payments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          invoiceId: transactionId,
          status: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      // Refresh data
      fetchPayments(page, statusFilter || undefined);
    } catch (err) {
      console.error('Update error:', err);
    }
  };

  const getTypeBadge = (type: string) => {
    return type === "deposit"
      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
      : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
      completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      failed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    };
    return badges[status as keyof typeof badges] || "bg-gray-100 text-gray-700";
  };

  const getStatusText = (status: string) => {
    const texts = {
      pending: "Đang xử lý",
      completed: "Đã duyệt",
      failed: "Từ chối",
    };
    return texts[status as keyof typeof texts] || status;
  };

  if (loading && !paymentsData) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-200 dark:bg-slate-700 rounded-2xl h-32 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-600 dark:text-red-400">Error: {error}</p>
      </div>
    );
  }

  const stats = paymentsData?.stats || {
    totalDeposit: 0,
    totalBonus: 0,
    totalWithdraw: 0,
    pendingCount: 0,
    completedCount: 0,
  };
  const transactions = paymentsData?.transactions || [];
  const pagination = paymentsData?.pagination || { page: 1, pages: 1, total: 0 };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<ArrowDownTrayIcon className="w-7 h-7 text-blue-600" />}
          title="Tổng nạp"
          value={`${(stats.totalDeposit / 1000000).toFixed(1)}M`}
          subtitle="Đã được duyệt"
          color="text-blue-600"
          bgColor="bg-blue-50 dark:bg-blue-900/20"
        />
        <StatCard
          icon={<ArrowUpTrayIcon className="w-7 h-7 text-orange-600" />}
          title="Tổng rút"
          value={`${(stats.totalWithdraw / 1000000).toFixed(1)}M`}
          subtitle="Đã được duyệt"
          color="text-orange-600"
          bgColor="bg-orange-50 dark:bg-orange-900/20"
        />
        <StatCard
          icon={<ClockIcon className="w-7 h-7 text-yellow-600" />}
          title="Đang xử lý"
          value={stats.pendingCount.toString()}
          subtitle="Giao dịch chờ duyệt"
          color="text-yellow-600"
          bgColor="bg-yellow-50 dark:bg-yellow-900/20"
        />
        <StatCard
          icon={<CheckCircleIcon className="w-7 h-7 text-green-600" />}
          title="Đã hoàn thành"
          value={stats.completedCount.toString()}
          subtitle="Giao dịch thành công"
          color="text-green-600"
          bgColor="bg-green-50 dark:bg-green-900/20"
        />
      </div>

      {/* Filter Section */}
      <div className="flex gap-2">
        <button
          onClick={() => handleStatusChange('')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            statusFilter === ''
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-gray-300 hover:bg-gray-200'
          }`}
        >
          Tất cả ({pagination.total})
        </button>
        <button
          onClick={() => handleStatusChange('pending')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            statusFilter === 'pending'
              ? 'bg-yellow-600 text-white'
              : 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-gray-300 hover:bg-gray-200'
          }`}
        >
          Đang xử lý
        </button>
        <button
          onClick={() => handleStatusChange('completed')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            statusFilter === 'completed'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-gray-300 hover:bg-gray-200'
          }`}
        >
          Đã duyệt
        </button>
        <button
          onClick={() => handleStatusChange('failed')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            statusFilter === 'failed'
              ? 'bg-red-600 text-white'
              : 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-gray-300 hover:bg-gray-200'
          }`}
        >
          Từ chối
        </button>
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <h3 className="text-gray-900 dark:text-white">Danh sách giao dịch</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Tổng số {pagination.total} giao dịch
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                  ID Giao dịch
                </th>
                <th className="px-6 py-4 text-left text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                  User
                </th>
                <th className="px-6 py-4 text-center text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                  Loại giao dịch
                </th>
                <th className="px-6 py-4 text-center text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                  Số tiền
                </th>
                <th className="px-6 py-4 text-center text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                  Trạng thái
                </th>
                <th className="px-6 py-4 text-left text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                  Thời gian
                </th>
                <th className="px-6 py-4 text-center text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {transactions.map((transaction: APITransaction, index: number) => (
                <tr
                  key={transaction.id}
                  className={`hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors ${
                    index % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-gray-50/50 dark:bg-slate-800/50"
                  }`}
                >
                  <td className="px-6 py-4">
                    <span className="text-gray-900 dark:text-white font-mono font-medium">
                      {transaction.transactionId}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-gray-900 dark:text-white font-medium">{transaction.userName}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{transaction.userEmail}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeBadge(transaction.type)}`}>
                      {transaction.type === "deposit" ? "Nạp tiền" : "Rút tiền"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col">
                      <span className="text-gray-900 dark:text-white font-bold">
                        {transaction.amount.toLocaleString("vi-VN")} đ
                      </span>
                      {transaction.bonus > 0 && (
                        <span className="text-xs text-green-600">+{transaction.bonus.toLocaleString("vi-VN")} bonus</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <select
                      value={transaction.status}
                      onChange={(e) => handleStatusUpdate(transaction.id, e.target.value)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${getStatusBadge(transaction.status)}`}
                    >
                      <option value="pending">Đang xử lý</option>
                      <option value="completed">Đã duyệt</option>
                      <option value="failed">Từ chối</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{transaction.time}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center">
                      <button
                        onClick={() => onOpenTransactionModal?.({
                          id: transaction.id,
                          transactionId: transaction.transactionId,
                          userName: transaction.userName,
                          type: transaction.type as "deposit" | "withdraw",
                          amount: transaction.amount,
                          status: transaction.status === 'completed' ? 'approved' : transaction.status === 'failed' ? 'rejected' : 'pending',
                          time: transaction.time,
                          note: transaction.bonus > 0 ? `Bonus: ${transaction.bonus.toLocaleString("vi-VN")} đ` : undefined,
                        })}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Xem chi tiết"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
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
    </div>
  );
}
