"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Filter, ShoppingCart, Heart } from "lucide-react";
import { toast } from "sonner";

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
  const [cartCount, setCartCount] = useState(0);
  const [wishlist, setWishlist] = useState<string[]>([]);

  const platforms = ["tiktok", "shopee", "lazada", "gmail", "hotmail"];

  // Fetch products and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsRes, categoriesRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/categories"),
        ]);

        if (productsRes.ok) {
          const data = await productsRes.json();
          setProducts(data.data || []);
        }

        if (categoriesRes.ok) {
          const data = await categoriesRes.json();
          setCategories(data.data || []);
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
    setCartCount((prev) => prev + 1);
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Cửa hàng
            </h1>
            <a
              href="#"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 relative"
            >
              <ShoppingCart size={20} />
              Giỏ hàng
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </a>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search
              size={20}
              className="absolute left-3 top-3 text-gray-400"
            />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow p-4 space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Filter size={18} />
                  Bộ lọc
                </h3>
              </div>

              {/* Platform Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                  Nền tảng
                </label>
                <select
                  value={selectedPlatform}
                  onChange={(e) => {
                    setSelectedPlatform(e.target.value);
                    setSelectedCategory(""); // Reset category
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-800 dark:text-white"
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
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                    Danh mục
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-800 dark:text-white"
                  >
                    <option value="">Tất cả</option>
                    {availableCategories.map((cat) => (
                      <option key={cat._id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Price Range */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-3">
                  Khoảng giá
                </label>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-gray-600 dark:text-gray-400">
                      Giá tối thiểu
                    </label>
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1 border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-800 dark:text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 dark:text-gray-400">
                      Giá tối đa
                    </label>
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(parseInt(e.target.value) || 1000000)}
                      className="w-full px-2 py-1 border border-gray-300 dark:border-slate-600 rounded dark:bg-slate-800 dark:text-white text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Sort */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                  Sắp xếp
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-800 dark:text-white text-sm"
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
                className="w-full px-3 py-2 bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 text-sm font-medium"
              >
                Xóa bộ lọc
              </button>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  Không tìm thấy sản phẩm nào
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                  Hiển thị <span className="font-semibold">{filteredProducts.length}</span> sản phẩm
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProducts.map((product) => (
                    <div
                      key={product._id}
                      className="bg-white dark:bg-slate-900 rounded-lg shadow hover:shadow-lg transition overflow-hidden"
                    >
                      {/* Image */}
                      <div className="relative w-full h-40 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
                        <span className="text-3xl">
                          {product.platform === "tiktok" && "🎵"}
                          {product.platform === "shopee" && "🛒"}
                          {product.platform === "lazada" && "🛍️"}
                          {product.platform === "gmail" && "📧"}
                          {product.platform === "hotmail" && "📨"}
                        </span>
                        <button
                          onClick={() => toggleWishlist(product.id)}
                          className={`absolute top-2 right-2 p-2 rounded-full ${
                            wishlist.includes(product.id)
                              ? "bg-red-500 text-white"
                              : "bg-white dark:bg-slate-800 text-gray-400"
                          } hover:scale-110 transition`}
                        >
                          <Heart
                            size={18}
                            fill={wishlist.includes(product.id) ? "currentColor" : "none"}
                          />
                        </button>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2 text-sm">
                          {product.title}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">
                          {product.description}
                        </p>

                        {/* Platform & Category Badges */}
                        <div className="flex gap-1 mb-3">
                          <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                            {product.platform}
                          </span>
                          <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                            {product.category}
                          </span>
                        </div>

                        {/* Stock Info */}
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                          <span className="text-green-600 dark:text-green-400 font-medium">
                            {product.availableCount}
                          </span>
                          <span> / {product.accountCount} có sẵn</span>
                        </div>

                        {/* Price & Button */}
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-gray-900 dark:text-white">
                            ₫{product.price.toLocaleString("vi-VN")}
                          </span>
                          <button
                            onClick={() => handleAddToCart(product)}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1 text-sm font-medium transition"
                          >
                            <ShoppingCart size={16} />
                            Mua
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
    </div>
  );
}
