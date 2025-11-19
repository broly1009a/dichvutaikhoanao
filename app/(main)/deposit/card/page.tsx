'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { CreditCardIcon, ClockIcon, CheckCircleIcon, XCircleIcon, CogIcon } from '@heroicons/react/24/outline';

interface CardDeposit {
  _id: string;
  cardType: string;
  serial: string;
  pin: string;
  amount: number;
  actualAmount: number;
  status: 'pending' | 'completed' | 'failed' | 'processing';
  reason?: string;
  createdAt: string;
  processedAt?: string;
}

interface CardDepositResponse {
  success: boolean;
  data?: CardDeposit[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  error?: string;
}

const CARD_TYPES = [
  { value: 'viettel', label: 'Viettel', fee: 0.3 },
  { value: 'mobifone', label: 'Mobifone', fee: 0.3 },
  { value: 'vinaphone', label: 'Vinaphone', fee: 0.3 },
  { value: 'vietnamobile', label: 'Vietnamobile', fee: 0.3 },
  { value: 'gmobile', label: 'Gmobile', fee: 0.3 },
  { value: 'zing', label: 'Zing', fee: 0.2 },
  { value: 'gate', label: 'Gate', fee: 0.2 },
  { value: 'garena', label: 'Garena', fee: 0.2 },
  { value: 'vcoin', label: 'Vcoin', fee: 0.2 },
];

const DENOMINATIONS = [10000, 20000, 30000, 50000, 100000, 200000, 300000, 500000];

export default function CardDepositPage() {
  const { user } = useAuth();
  const [cardDeposits, setCardDeposits] = useState<CardDeposit[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [cardType, setCardType] = useState('');
  const [serial, setSerial] = useState('');
  const [pin, setPin] = useState('');
  const [amount, setAmount] = useState('');

  // Filter state
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const calculateActualAmount = () => {
    if (!cardType || !amount) return 0;
    const config = CARD_TYPES.find(c => c.value === cardType);
    if (!config) return 0;
    const fee = parseInt(amount) * config.fee;
    return Math.floor(parseInt(amount) - fee);
  };

  const fetchCardDeposits = async (selectedPage: number = 1, status?: string) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: selectedPage.toString(),
        limit: '10',
      });

      if (status) {
        params.append('status', status);
      }

      const response = await fetch(`/api/card?${params}`);
      const result: CardDepositResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch card deposits');
      }

      setCardDeposits(result.data || []);
      setPagination(result.pagination || { page: 1, limit: 10, total: 0, pages: 0 });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Fetch card deposits error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchCardDeposits(1);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cardType || !serial || !pin || !amount) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      const response = await fetch('/api/card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          cardType,
          serial: serial.trim(),
          pin: pin.trim(),
          amount: parseInt(amount),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit card deposit');
      }

      setSuccess('Thẻ đã được gửi thành công! Vui lòng chờ xử lý.');

      // Reset form
      setCardType('');
      setSerial('');
      setPin('');
      setAmount('');

      // Refresh list
      fetchCardDeposits(1, statusFilter || undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
      console.error('Submit card deposit error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setPage(1);
    fetchCardDeposits(1, status || undefined);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchCardDeposits(newPage, statusFilter || undefined);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    };
    return badges[status as keyof typeof badges] || badges.pending;
  };

  const getStatusText = (status: string) => {
    const texts = {
      pending: 'Chờ xử lý',
      processing: 'Đang xử lý',
      completed: 'Thành công',
      failed: 'Thất bại',
    };
    return texts[status as keyof typeof texts] || status;
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: <ClockIcon className="w-4 h-4" />,
      processing: <CogIcon className="w-4 h-4" />,
      completed: <CheckCircleIcon className="w-4 h-4" />,
      failed: <XCircleIcon className="w-4 h-4" />,
    };
    return icons[status as keyof typeof icons] || icons.pending;
  };

  const getCardTypeName = (cardType: string) => {
    const card = CARD_TYPES.find(c => c.value === cardType);
    return card?.label || cardType;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Nạp Thẻ</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Nạp tiền vào tài khoản bằng thẻ cào điện thoại và game
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Card Deposit Form */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow border border-gray-200 dark:border-slate-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Nạp Thẻ</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-green-600 dark:text-green-400 text-sm">{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Loại thẻ
                </label>
                <select
                  value={cardType}
                  onChange={(e) => setCardType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">-- Chọn loại thẻ --</option>
                  {CARD_TYPES.map((card) => (
                    <option key={card.value} value={card.value}>
                      {card.label} (phí {card.fee * 100}%)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mệnh giá
                </label>
                <select
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">-- Chọn mệnh giá --</option>
                  {DENOMINATIONS.map((denom) => (
                    <option key={denom} value={denom}>
                      {denom.toLocaleString('vi-VN')} đ
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Serial
                </label>
                <input
                  type="text"
                  value={serial}
                  onChange={(e) => setSerial(e.target.value)}
                  placeholder="Nhập serial thẻ"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Pin
                </label>
                <input
                  type="text"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Nhập mã thẻ"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                  required
                />
              </div>

              {cardType && amount && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    <strong>Số tiền thực nhận:</strong> {calculateActualAmount().toLocaleString('vi-VN')} đ
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <CreditCardIcon className="w-4 h-4 mr-2" />
                    Nạp thẻ
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-400 mb-2">Lưu Ý</h3>
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                Nếu sau 15 phút không nhận được tiền thì liên hệ ADM ⇒ ZALO
              </p>
            </div>
          </div>
        </div>

        {/* Card Deposit History */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow border border-gray-200 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Lịch sử nạp thẻ</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Danh sách các thẻ đã nạp
              </p>
            </div>

            {/* Filters */}
            <div className="p-6 border-b border-gray-200 dark:border-slate-700">
              <div className="flex gap-2">
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
                  Chờ xử lý
                </button>
                <button
                  onClick={() => handleStatusFilter('processing')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    statusFilter === 'processing'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-gray-300 hover:bg-gray-200'
                  }`}
                >
                  Đang xử lý
                </button>
                <button
                  onClick={() => handleStatusFilter('completed')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    statusFilter === 'completed'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-gray-300 hover:bg-gray-200'
                  }`}
                >
                  Thành công
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
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                      #
                    </th>
                    <th className="px-6 py-4 text-left text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                      Nhà mạng
                    </th>
                    <th className="px-6 py-4 text-left text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                      Serial
                    </th>
                    <th className="px-6 py-4 text-left text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                      Pin
                    </th>
                    <th className="px-6 py-4 text-left text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                      Mệnh giá
                    </th>
                    <th className="px-6 py-4 text-left text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                      Thực nhận
                    </th>
                    <th className="px-6 py-4 text-center text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                      Trạng thái
                    </th>
                    <th className="px-6 py-4 text-left text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                      Thời gian
                    </th>
                    <th className="px-6 py-4 text-left text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                      Lý do
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i}>
                        <td colSpan={9} className="px-6 py-4">
                          <div className="animate-pulse h-4 bg-gray-200 dark:bg-slate-700 rounded"></div>
                        </td>
                      </tr>
                    ))
                  ) : cardDeposits.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                        No data available in table
                      </td>
                    </tr>
                  ) : (
                    cardDeposits.map((deposit, index) => (
                      <tr
                        key={deposit._id}
                        className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">
                          {(pagination.page - 1) * pagination.limit + index + 1}
                        </td>
                        <td className="px-6 py-4 text-gray-900 dark:text-white">
                          {getCardTypeName(deposit.cardType)}
                        </td>
                        <td className="px-6 py-4 text-gray-900 dark:text-white font-mono">
                          {deposit.serial}
                        </td>
                        <td className="px-6 py-4 text-gray-900 dark:text-white font-mono">
                          {deposit.pin}
                        </td>
                        <td className="px-6 py-4 text-gray-900 dark:text-white">
                          {deposit.amount.toLocaleString('vi-VN')} đ
                        </td>
                        <td className="px-6 py-4 text-green-600 font-medium">
                          {deposit.actualAmount.toLocaleString('vi-VN')} đ
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(deposit.status)}`}>
                            {getStatusIcon(deposit.status)}
                            <span className="ml-1">{getStatusText(deposit.status)}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                          {new Date(deposit.createdAt).toLocaleString('vi-VN')}
                        </td>
                        <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                          {deposit.reason || '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-slate-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-200"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-200"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
