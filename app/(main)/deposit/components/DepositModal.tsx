"use client";

import { useState, useEffect } from "react";
import { XMarkIcon, BanknotesIcon, GiftIcon, ReceiptPercentIcon } from "@heroicons/react/24/outline";

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateInvoice: (amount: number) => void;
}

export function DepositModal({ isOpen, onClose, onCreateInvoice }: DepositModalProps) {
  const [amount, setAmount] = useState<string>("");
  const [numericAmount, setNumericAmount] = useState<number>(0);

  // Calculate bonus percentage based on amount
  const calculateBonus = (amount: number): number => {
    if (amount >= 10000000) return 5;
    if (amount >= 5000000) return 3;
    if (amount >= 1000000) return 2;
    if (amount >= 500000) return 1.5;
    if (amount >= 100000) return 1;
    return 0;
  };

  const bonusPercent = calculateBonus(numericAmount);
  const bonusAmount = (numericAmount * bonusPercent) / 100;
  const totalReceived = numericAmount + bonusAmount;

  // Handle amount input
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // Remove non-digits
    setAmount(value);
    setNumericAmount(parseInt(value) || 0);
  };

  // Format number with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString("vi-VN");
  };

  // Handle create invoice
  const handleSubmit = () => {
    if (numericAmount >= 10000) {
      onCreateInvoice(numericAmount);
      setAmount("");
      setNumericAmount(0);
    }
  };

  // Prevent scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border-2 border-gray-200 dark:border-slate-700 w-full max-w-lg animate-in zoom-in-95 duration-300 overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-6 py-5 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 animate-shimmer"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                <BanknotesIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white">Nhập Số Tiền Cần Nạp</h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors"
            >
              <XMarkIcon className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Amount input */}
          <div className="space-y-3">
            <label className="block text-sm text-gray-700 dark:text-gray-300 font-medium">
              Số tiền muốn nạp <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={amount}
                onChange={handleAmountChange}
                placeholder="Nhập số tiền (VND)"
                className="w-full px-5 py-4 border-2 border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-blue-500 text-lg font-medium"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">
                VNĐ
              </div>
            </div>
            {amount && (
              <p className="text-sm text-gray-600 dark:text-gray-400 pl-2">
                = {formatNumber(numericAmount)} đồng
              </p>
            )}
          </div>

          {/* Quick amount buttons */}
          <div className="grid grid-cols-3 gap-2">
            {[50000, 100000, 200000, 500000, 1000000, 2000000].map((quickAmount) => (
              <button
                key={quickAmount}
                onClick={() => {
                  setAmount(quickAmount.toString());
                  setNumericAmount(quickAmount);
                }}
                className="px-3 py-2 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-slate-800 dark:to-slate-700 border-2 border-gray-200 dark:border-slate-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {formatNumber(quickAmount)}
              </button>
            ))}
          </div>

          {/* Payment info */}
          <div className="space-y-3 pt-4 border-t-2 border-dashed border-gray-200 dark:border-slate-700">
            {/* Amount to pay */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-700">
              <div className="flex items-center gap-2">
                <ReceiptPercentIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  Số tiền cần thanh toán:
                </span>
              </div>
              <span className="text-blue-700 dark:text-blue-400 font-bold">
                {formatNumber(numericAmount)} đ
              </span>
            </div>

            {/* Bonus info */}
            {bonusPercent > 0 && (
              <div className="flex items-center justify-between p-4 bg-gradient-to-br from-orange-50 to-pink-50 dark:from-orange-900/20 dark:to-pink-900/20 rounded-xl border-2 border-orange-200 dark:border-orange-700">
                <div className="flex items-center gap-2">
                  <GiftIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    Khuyến mãi (+{bonusPercent}%):
                  </span>
                </div>
                <span className="text-orange-700 dark:text-orange-400 font-bold">
                  +{formatNumber(bonusAmount)} đ
                </span>
              </div>
            )}

            {/* Total received */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border-2 border-green-300 dark:border-green-700 shadow-lg">
              <div className="flex items-center gap-2">
                <BanknotesIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  Số tiền nhận được:
                </span>
              </div>
              <span className="text-green-700 dark:text-green-400 font-bold text-lg">
                {formatNumber(totalReceived)} đ
              </span>
            </div>
          </div>

          {/* Minimum amount note */}
          {numericAmount > 0 && numericAmount < 10000 && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-700 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300">
                ⚠️ Số tiền nạp tối thiểu là 10.000 VNĐ
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors font-medium"
          >
            Đóng
          </button>
          <button
            onClick={handleSubmit}
            disabled={numericAmount < 10000}
            className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
              numericAmount >= 10000
                ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl hover:scale-105"
                : "bg-gray-300 dark:bg-slate-800 text-gray-500 dark:text-gray-600 cursor-not-allowed"
            }`}
          >
            Tạo Hóa Đơn
          </button>
        </div>
      </div>
    </div>
  );
}
