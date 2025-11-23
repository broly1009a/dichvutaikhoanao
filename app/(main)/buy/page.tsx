"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Filter, ShoppingCart, Heart } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";

interface Product {
  _id: string;
  id: string;
  platform: string;
  category: string;
  title: string;
  description: string;
  price: number;
  accountCount: number;
  availableCount: number;
  status: "available" | "soldout";
  image?: string;
}

interface Category {
  _id: string;
  id: string;
  name: string;
  platform: string;
}

interface CartItem extends Product {
  quantity: number;
}

export default function BuyPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000000);
  const [sortBy, setSortBy] = useState("newest");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [showCartModal, setShowCartModal] = useState(false);

  const platforms = ["tiktok", "shopee", "lazada", "gmail", "hotmail"];

  // Get category name by ID
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c._id === categoryId);
    return category?.name || categoryId;
  };

  // Fetch products and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsRes, categoriesRes] = await Promise.all([
          apiClient.getProducts(),
          apiClient.getCategories(),
        ]);

        if (productsRes.success) {
          setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
        }

        if (categoriesRes.success) {
          setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error("Lỗi khi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        // Convert back to CartItem format
        const cartItems: CartItem[] = parsedCart.map((item: any) => ({
          ...products.find(p => p._id === item.productId)!, // Find the full product
          quantity: item.quantity
        })).filter((item: CartItem) => item._id); // Filter out invalid items
        setCart(cartItems);
      } catch (error) {
        console.error("Failed to load cart:", error);
      }
    }
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Search
    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Platform filter
    if (selectedPlatform) {
      filtered = filtered.filter((p) => p.platform === selectedPlatform);
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    // Price filter
    filtered = filtered.filter(
      (p) => p.price >= minPrice && p.price <= maxPrice
    );

    // Status filter - only available
    filtered = filtered.filter((p) => p.status === "available");

    // Sort
    switch (sortBy) {
      case "price-asc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "popular":
        filtered.sort((a, b) => b.availableCount - a.availableCount);
        break;
      case "newest":
      default:
        // Keep default order from API
        break;
    }

    return filtered;
  }, [products, searchTerm, selectedPlatform, selectedCategory, minPrice, maxPrice, sortBy]);

  // Get categories for selected platform
  const availableCategories = useMemo(() => {
    if (!selectedPlatform) return [];
    return categories.filter((c) => c.platform === selectedPlatform);
  }, [categories, selectedPlatform]);

  const handleAddToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(item => item._id === product._id);
      let newCart;
      if (existingItem) {
        newCart = prevCart.map(item =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newCart = [...prevCart, { ...product, quantity: 1 }];
      }
      // Save to localStorage
      localStorage.setItem("cart", JSON.stringify(newCart.map(item => ({
        id: item._id,
        productId: item._id,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        platform: item.platform
      }))));
      return newCart;
    });
    toast.success("Đã thêm vào giỏ hàng", {
      description: `${product.title} - ₫${product.price.toLocaleString("vi-VN")}`,
    });
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedPlatform("");
    setSelectedCategory("");
    setMinPrice(0);
    setMaxPrice(1000000);
    setSortBy("newest");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6 shadow-lg"></div>
          <p className="text-gray-600 dark:text-gray-400 text-xl font-medium">Đang tải sản phẩm...</p>
          <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-slate-700/50 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Cửa hàng
            </h1>
            <button
              onClick={() => setShowCartModal(true)}
              className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl relative group"
            >
              <ShoppingCart size={22} className="group-hover:scale-110 transition-transform" />
              Giỏ hàng
              {cart.length > 0 && (
                <span className="absolute -top-3 -right-3 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-bold rounded-full w-7 h-7 flex items-center justify-center shadow-lg animate-pulse">
                  {cart.reduce((total, item) => total + item.quantity, 0)}
                </span>
              )}
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search
              size={22}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
            />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-4 border-2 border-gray-200 dark:border-slate-600 rounded-2xl dark:bg-slate-800 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200 text-lg placeholder-gray-400 dark:placeholder-gray-500 shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm rounded-2xl shadow-xl p-6 space-y-6 border border-gray-200/50 dark:border-slate-700/50">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3 text-xl">
                  <Filter size={20} className="text-blue-600" />
                  Bộ lọc
                </h3>
              </div>

              {/* Platform Filter */}
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-3">
                  Nền tảng
                </label>
                <select
                  value={selectedPlatform}
                  onChange={(e) => {
                    setSelectedPlatform(e.target.value);
                    setSelectedCategory(""); // Reset category
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-600 rounded-xl dark:bg-slate-800 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200 text-sm"
                >
                  <option value="">Tất cả</option>
                  {platforms.map((p) => (
                    <option key={p} value={p}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              {selectedPlatform && (
                <div>
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-3">
                    Danh mục
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-600 rounded-xl dark:bg-slate-800 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200 text-sm"
                  >
                    <option value="">Tất cả</option>
                    {availableCategories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Price Range */}
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-4">
                  Khoảng giá
                </label>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 block">
                      Giá tối thiểu
                    </label>
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border-2 border-gray-200 dark:border-slate-600 rounded-lg dark:bg-slate-800 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 block">
                      Giá tối đa
                    </label>
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(parseInt(e.target.value) || 1000000)}
                      className="w-full px-3 py-2 border-2 border-gray-200 dark:border-slate-600 rounded-lg dark:bg-slate-800 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Sort */}
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-3">
                  Sắp xếp
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-600 rounded-xl dark:bg-slate-800 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-200 text-sm"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="price-asc">Giá thấp đến cao</option>
                  <option value="price-desc">Giá cao đến thấp</option>
                  <option value="popular">Phổ biến nhất</option>
                </select>
              </div>

              {/* Reset */}
              <button
                onClick={resetFilters}
                className="w-full px-4 py-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-slate-700 dark:to-slate-600 text-gray-900 dark:text-white rounded-xl hover:from-gray-300 hover:to-gray-400 dark:hover:from-slate-600 dark:hover:to-slate-500 transition-all duration-200 text-sm font-semibold shadow-lg hover:shadow-xl"
              >
                Xóa bộ lọc
              </button>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-slate-700/50">
                <div className="text-6xl mb-4">🛒</div>
                <p className="text-gray-500 dark:text-gray-400 text-xl font-medium">
                  Không tìm thấy sản phẩm nào
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                  Hãy thử điều chỉnh bộ lọc hoặc tìm kiếm khác
                </p>
              </div>
            ) : (
              <>
                <div className="mb-6 text-sm text-gray-600 dark:text-gray-400 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-xl px-4 py-3 border border-gray-200/50 dark:border-slate-700/50">
                  Hiển thị <span className="font-bold text-blue-600 dark:text-blue-400">{filteredProducts.length}</span> sản phẩm
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <div
                      key={product._id}
                      className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200/50 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-600 group"
                    >
                      {/* Image */}
                      <div className="relative w-full h-48 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center overflow-hidden">
                        <span className="text-5xl group-hover:scale-110 transition-transform duration-300">
                          {product.platform === "tiktok" && "🎵"}
                          {product.platform === "shopee" && "🛒"}
                          {product.platform === "lazada" && "🛍️"}
                          {product.platform === "gmail" && "📧"}
                          {product.platform === "hotmail" && "📨"}
                        </span>
                        <button
                          onClick={() => toggleWishlist(product.id)}
                          className={`absolute top-3 right-3 p-3 rounded-full shadow-lg hover:scale-110 transition-all duration-200 ${
                            wishlist.includes(product.id)
                              ? "bg-red-500 text-white shadow-red-500/30"
                              : "bg-white/90 dark:bg-slate-800/90 text-gray-400 hover:text-red-500"
                          }`}
                        >
                          <Heart
                            size={20}
                            fill={wishlist.includes(product.id) ? "currentColor" : "none"}
                          />
                        </button>
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {product.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
                          {product.description}
                        </p>

                        {/* Platform & Category Badges */}
                        <div className="flex gap-2 mb-4">
                          <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-full font-medium">
                            {product.platform}
                          </span>
                          <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-full font-medium">
                            {getCategoryName(product.category)}
                          </span>
                        </div>

                        {/* Stock Info */}
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          <span className="text-green-600 dark:text-green-400 font-bold">
                            {product.availableCount}
                          </span>
                          <span> / {product.accountCount} có sẵn</span>
                        </div>

                        {/* Price & Button */}
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-gray-900 dark:text-white">
                            ₫{product.price.toLocaleString("vi-VN")}
                          </span>
                          <button
                            onClick={() => handleAddToCart(product)}
                            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center gap-2 text-sm font-semibold shadow-lg hover:shadow-xl hover:scale-105"
                          >
                            <ShoppingCart size={18} />
                            Thêm vào giỏ
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Cart Modal */}
      {showCartModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Giỏ hàng của bạn</h2>
                <button
                  onClick={() => setShowCartModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 max-h-96 overflow-y-auto">
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🛒</div>
                  <p className="text-gray-500 dark:text-gray-400 text-lg">Giỏ hàng trống</p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Hãy thêm sản phẩm vào giỏ hàng</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item._id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-slate-800 rounded-xl">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-slate-700 dark:to-slate-600 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">
                          {item.platform === "tiktok" && "🎵"}
                          {item.platform === "shopee" && "🛒"}
                          {item.platform === "lazada" && "🛍️"}
                          {item.platform === "gmail" && "📧"}
                          {item.platform === "hotmail" && "📨"}
                        </span>
                      </div>

                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{getCategoryName(item.category)}</p>
                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          ₫{item.price.toLocaleString("vi-VN")}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setCart(prev => {
                              const newCart = prev.map(cartItem =>
                                cartItem._id === item._id
                                  ? { ...cartItem, quantity: Math.max(1, cartItem.quantity - 1) }
                                  : cartItem
                              );
                              localStorage.setItem("cart", JSON.stringify(newCart.map(item => ({
                                id: item._id,
                                productId: item._id,
                                title: item.title,
                                price: item.price,
                                quantity: item.quantity,
                                platform: item.platform
                              }))));
                              return newCart;
                            });
                          }}
                          className="w-8 h-8 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => {
                            setCart(prev => {
                              const newCart = prev.map(cartItem =>
                                cartItem._id === item._id
                                  ? { ...cartItem, quantity: cartItem.quantity + 1 }
                                  : cartItem
                              );
                              localStorage.setItem("cart", JSON.stringify(newCart.map(item => ({
                                id: item._id,
                                productId: item._id,
                                title: item.title,
                                price: item.price,
                                quantity: item.quantity,
                                platform: item.platform
                              }))));
                              return newCart;
                            });
                          }}
                          className="w-8 h-8 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          setCart(prev => {
                            const newCart = prev.filter(cartItem => cartItem._id !== item._id);
                            localStorage.setItem("cart", JSON.stringify(newCart.map(item => ({
                              id: item._id,
                              productId: item._id,
                              title: item.title,
                              price: item.price,
                              quantity: item.quantity,
                              platform: item.platform
                            }))));
                            return newCart;
                          });
                        }}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 border-t border-gray-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">Tổng cộng:</span>
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    ₫{cart.reduce((total, item) => total + item.price * item.quantity, 0).toLocaleString("vi-VN")}
                  </span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setCart([]);
                      localStorage.setItem("cart", JSON.stringify([]));
                    }}
                    className="flex-1 px-4 py-3 bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-white rounded-xl hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors font-semibold"
                  >
                    Xóa tất cả
                  </button>
                  <Link
                    href="/cart"
                    onClick={() => setShowCartModal(false)}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl text-center"
                  >
                    Xem giỏ hàng
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
