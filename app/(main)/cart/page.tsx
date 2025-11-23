"use client";

import { useState, useEffect } from "react";
import { Trash2, Plus, Minus, ShoppingCart, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ProtectedRoute } from "@/lib/components/ProtectedRoute";

interface CartItem {
  id: string;
  productId: string;
  title: string;
  price: number;
  quantity: number;
  platform: string;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error("Failed to load cart:", error);
      }
    }
    setLoading(false);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!loading) {
      localStorage.setItem("cart", JSON.stringify(cartItems));
    }
  }, [cartItems, loading]);

  const handleRemoveItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleQuantityChange = (id: string, quantity: number) => {
    if (quantity < 1) {
      handleRemoveItem(id);
    } else {
      setCartItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, quantity } : item))
      );
    }
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = subtotal > 0 ? 20000 : 0;
  const discount = 0;
  const total = subtotal + shipping - discount;

  const platformEmojis: { [key: string]: string } = {
    tiktok: "🎵",
    shopee: "🛒",
    lazada: "🛍️",
    gmail: "📧",
    hotmail: "📨",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Đang tải giỏ hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Link href="/buy" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400">
                <ArrowLeft size={20} />
                <span>Tiếp tục mua sắm</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          {cartItems.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow p-8 text-center">
              <ShoppingCart size={48} className="mx-auto text-gray-400 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Giỏ hàng trống
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Bạn chưa thêm sản phẩm nào vào giỏ hàng
              </p>
              <Link
                href="/buy"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
              >
                Tiếp tục mua sắm
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white dark:bg-slate-900 rounded-lg shadow overflow-hidden">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="border-b border-gray-200 dark:border-slate-700 p-4 flex gap-4 items-center hover:bg-gray-50 dark:hover:bg-slate-800 transition"
                    >
                      {/* Platform Icon */}
                      <div className="text-3xl">
                        {platformEmojis[item.platform] || "📦"}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {item.title}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                              {item.platform}
                            </p>
                          </div>
                          <span className="text-lg font-bold text-gray-900 dark:text-white">
                            ₫{(item.price * item.quantity).toLocaleString("vi-VN")}
                          </span>
                        </div>

                        {/* Quantity Control */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() =>
                              handleQuantityChange(item.id, item.quantity - 1)
                            }
                            className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded"
                          >
                            <Minus size={16} className="text-gray-600 dark:text-gray-400" />
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              handleQuantityChange(
                                item.id,
                                parseInt(e.target.value) || 1
                              )
                            }
                            className="w-12 text-center border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-800 dark:text-white"
                            min="1"
                          />
                          <button
                            onClick={() =>
                              handleQuantityChange(item.id, item.quantity + 1)
                            }
                            className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded"
                          >
                            <Plus size={16} className="text-gray-600 dark:text-gray-400" />
                          </button>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="ml-auto p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white dark:bg-slate-900 rounded-lg shadow p-6 space-y-4 sticky top-20">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Tóm tắt đơn hàng
                  </h3>

                  {/* Summary Items */}
                  <div className="space-y-2 border-b border-gray-200 dark:border-slate-700 pb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Tạm tính
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        ₫{subtotal.toLocaleString("vi-VN")}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Phí vận chuyển
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        ₫{shipping.toLocaleString("vi-VN")}
                      </span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          Giảm giá
                        </span>
                        <span className="font-medium text-green-600 dark:text-green-400">
                          -₫{discount.toLocaleString("vi-VN")}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">
                      Tổng cộng
                    </span>
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      ₫{total.toLocaleString("vi-VN")}
                    </span>
                  </div>

                  {/* Checkout Button */}
                  <Link
                    href="/checkout"
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-center transition block"
                  >
                    Tiến hành thanh toán
                  </Link>

                  {/* Continue Shopping */}
                  <Link
                    href="/buy"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 font-medium text-center transition"
                  >
                    Tiếp tục mua sắm
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
