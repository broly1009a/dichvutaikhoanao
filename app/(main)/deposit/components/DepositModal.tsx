"use client";

import { useState, useEffect, useRef } from "react";
import { XMarkIcon, BanknotesIcon, GiftIcon, ReceiptPercentIcon, CheckCircleIcon, ClockIcon } from "@heroicons/react/24/outline";
import QRCodeBox from "../../../components/QRCodeBox";
import { useAuth } from "@/lib/hooks/useAuth";

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateInvoice: (amount: number) => void;
  prefilledAmount?: number; // For retry from invoices
}

interface PayOSInfo {
  orderCode?: number;
  description?: string;
  accountNumber?: string;
  accountName?: string;
  qrCode?: string;
}

export function DepositModal({ isOpen, onClose, onCreateInvoice, prefilledAmount }: DepositModalProps) {
  const { user } = useAuth();
  const [amount, setAmount] = useState<string>("");
  const [numericAmount, setNumericAmount] = useState<number>(0);
  const [payosQr, setPayosQr] = useState<string>("");
  const [payosInfo, setPayosInfo] = useState<PayOSInfo | null>(null);
  const [isCheckingPayment, setIsCheckingPayment] = useState<boolean>(false);
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "success" | "failed" | null>(null);
  const [orderCode, setOrderCode] = useState<string | null>(null);
  const [uuid, setUuid] = useState<string>("");
  
  const eventSourceRef = useRef<EventSource | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Generate UUID for description
  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    }).replace(/-/g, '');
  };

  // Check payment status via SSE
  const startPaymentCheckingSSE = (orderCodeParam: string, uuidParam: string) => {
    setIsCheckingPayment(true);
    setPaymentStatus("pending");
    console.log('Starting SSE payment checking for UUID:', uuidParam);

    // Setup SSE connection - use UUID as primary key
    const eventSource = new EventSource(`/api/webhooks/stream?uuid=${uuidParam}`);
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Payment status update:', data);

        if (data.status === "done") {
          setPaymentStatus("success");
          setIsCheckingPayment(false);
          eventSource.close();
          eventSourceRef.current = null;

          // Call onCreateInvoice after successful payment
          setTimeout(() => {
            onCreateInvoice(numericAmount);
            handleClose();
          }, 2000);
        }
      } catch (error) {
        console.error('Error parsing SSE message:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      
      // Fallback to polling if SSE fails
      console.log('SSE connection error, falling back to polling...');
      eventSource.close();
      eventSourceRef.current = null;
      
      // Retry with 5-second polling interval using UUID
      startPaymentCheckingPolling(uuidParam);
    };

    // Set timeout for 10 minutes
    timeoutRef.current = setTimeout(() => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      
      if (!paymentStatus || paymentStatus === "pending") {
        setIsCheckingPayment(false);
        setPaymentStatus("failed");
      }
    }, 600000); // 10 minutes
  };

  // Fallback polling method
  const startPaymentCheckingPolling = (uuidParam: string) => {
    console.log('Using polling fallback with 5-second interval for UUID:', uuidParam);
    
    let pollCount = 0;
    const maxPolls = 120; // 120 * 5s = 10 minutes
    
    const pollInterval = setInterval(async () => {
      pollCount++;
      
      if (pollCount > maxPolls) {
        clearInterval(pollInterval);
        setIsCheckingPayment(false);
        setPaymentStatus("failed");
        return;
      }

      try {
        // Search by UUID (unique for each deposit session)
        const response = await fetch(`/api/webhooks?uuid=${uuidParam}`);
        const result = await response.json();

        if (result.success && result.data === "done") {
          clearInterval(pollInterval);
          setPaymentStatus("success");
          setIsCheckingPayment(false);

          setTimeout(() => {
            onCreateInvoice(numericAmount);
            handleClose();
          }, 2000);
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 5000); // Poll every 5 seconds instead of 3
  };

  // Generate PayOS QR code
  const generateQR = async () => {
    if (numericAmount < 10000) return;

    const newUuid = generateUUID();
    
    // Check if UUID already has a pending payment
    try {
      const limitCheck = await fetch(`/api/webhooks/check-session-limit?uuid=${newUuid}`);
      const limitData = await limitCheck.json();
      
      if (limitData.exists) {
        console.log('Session already exists, continuing payment...');
        // Session exists, continue with same UUID
        setUuid(newUuid);
        const newOrderCode = Math.floor(Math.random() * 1000000);
        setOrderCode(newOrderCode.toString());
        
        try {
          const response = await fetch("/api/payos-link", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderCode: newOrderCode,
              amount: numericAmount,
              description: `dat coc ${newUuid}`.substring(0, 25),
              cancelUrl: window.location.origin + "/thanh-toan-that-bai",
              returnUrl: window.location.origin + "/thanh-toan-thanh-cong"
            })
          });
          
          const data = await response.json();
          const payosData = data.data || data;
          
          setPayosInfo(payosData);
          setPayosQr(payosData.qrCode || "");
          
          // Start checking with same UUID
          startPaymentCheckingSSE(newOrderCode.toString(), newUuid);
        } catch (error) {
          console.error("Error generating PayOS QR:", error);
          setPayosQr("");
          setPayosInfo(null);
        }
        return;
      }
    } catch (error) {
      console.warn('Could not check session limit, continuing anyway:', error);
    }

    setUuid(newUuid);
    
    const content = `dat coc ${newUuid}`;
    const newOrderCode = Math.floor(Math.random() * 1000000);
    setOrderCode(newOrderCode.toString());
    console.log('Set orderCode to:', newOrderCode, 'UUID:', newUuid);
    
    let safeContent = content;
    if (safeContent.length > 25) safeContent = safeContent.slice(0, 25);
    
    try {
      const response = await fetch("/api/payos-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderCode: newOrderCode,
          amount: numericAmount,
          description: safeContent,
          cancelUrl: window.location.origin + "/thanh-toan-that-bai",
          returnUrl: window.location.origin + "/thanh-toan-thanh-cong"
        })
      });
      
      const data = await response.json();
      const payosData = data.data || data;
      
      setPayosInfo(payosData);
      setPayosQr(payosData.qrCode || "");

      // Create invoice record
      if (user?._id) {
        try {
          await fetch('/api/invoices/create-from-deposit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user._id,
              uuid: newUuid,
              orderCode: newOrderCode,
              amount: numericAmount,
              bonus: bonusAmount,
              description: safeContent
            })
          });
          console.log('Invoice created for UUID:', newUuid);
        } catch (error) {
          console.warn('Could not create invoice record:', error);
        }
      }
    } catch (error) {
      console.error("Error generating PayOS QR:", error);
      setPayosQr("");
      setPayosInfo(null);
    }

    // Start checking payment status using UUID (persistent across QR recreations)
    startPaymentCheckingSSE(newOrderCode.toString(), newUuid);
  };

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

  // Handle create invoice (generate QR)
  const handleSubmit = () => {
    if (numericAmount >= 10000) {
      generateQR();
    }
  };

  // Handle close modal
  const handleClose = () => {
    // Stop all timers
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // Reset states
    setAmount("");
    setNumericAmount(0);
    setPayosQr("");
    setPayosInfo(null);
    setIsCheckingPayment(false);
    setPaymentStatus(null);
    setOrderCode(null);
    setUuid("");
    
    onClose();
  };

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Prevent scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      // If prefilled amount, set it
      if (prefilledAmount) {
        setAmount(prefilledAmount.toString());
        setNumericAmount(prefilledAmount);
      }
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, prefilledAmount]);

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
          {/* Payment Method Info */}
          <div className="flex items-center justify-center p-3 bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-700 rounded-xl">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="text-purple-700 dark:text-purple-300 font-medium">
                Thanh toán qua PayOS
              </span>
            </div>
          </div>

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
                className="w-full px-5 py-4 border-2 border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-600 focus:border-purple-500 text-lg font-medium"
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
                className="px-3 py-2 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-slate-800 dark:to-slate-700 border-2 border-gray-200 dark:border-slate-600 rounded-lg hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-md transition-all text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {formatNumber(quickAmount)}
              </button>
            ))}
          </div>

          {/* QR Code Display */}
          {payosQr && (
            <div className="space-y-3 p-4 bg-gray-50 dark:bg-slate-800 rounded-xl border-2 border-gray-200 dark:border-slate-700">
              <div className="text-center">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Quét mã QR để thanh toán
                </h4>
                
                {/* PayOS QR */}
                <div className="flex justify-center">
               <QRCodeBox value={payosQr} />
                </div>

                {/* Payment Status */}
                <div className="mt-4 space-y-2">
                  {isCheckingPayment && paymentStatus === "pending" && (
                    <div className="flex items-center justify-center gap-2 text-purple-600 dark:text-purple-400">
                      <ClockIcon className="w-5 h-5 animate-spin" />
                      <span className="text-sm font-medium">Đang kiểm tra thanh toán...</span>
                    </div>
                  )}
                  
                  {paymentStatus === "success" && (
                    <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                      <CheckCircleIcon className="w-5 h-5" />
                      <span className="text-sm font-medium">Thanh toán thành công! Đang xử lý...</span>
                    </div>
                  )}
                  
                  {paymentStatus === "failed" && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-700 rounded-lg">
                      <p className="text-sm text-red-700 dark:text-red-300 text-center">
                        ⏰ Hết thời gian chờ thanh toán. Vui lòng thử lại.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

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
            onClick={handleClose}
            className="flex-1 px-6 py-3 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors font-medium"
          >
            Đóng
          </button>
          <button
            onClick={handleSubmit}
            disabled={numericAmount < 10000 || isCheckingPayment}
            className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
              numericAmount >= 10000 && !isCheckingPayment
                ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl hover:scale-105"
                : "bg-gray-300 dark:bg-slate-800 text-gray-500 dark:text-gray-600 cursor-not-allowed"
            }`}
          >
            {isCheckingPayment ? "Đang xử lý..." : payosQr ? "Tạo lại QR" : "Tạo mã QR"}
          </button>
        </div>
      </div>
    </div>
  );
}
