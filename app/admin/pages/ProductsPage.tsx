"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Search } from "lucide-react";

interface Product {
  _id: string;
  id: string;
  platform: string;
  category: string;
  title: string;
  description: string;
  price: number;
  status: "available" | "soldout";
  accountCount: number;
  availableCount: number;
  image?: string;
  createdAt: string;
}

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPlatform, setFilterPlatform] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    id: "",
    platform: "",
    category: "",
    title: "",
    description: "",
    price: 0,
    accountCount: 0,
    status: "available" as const,
    image: "",
  });

  const platforms = ["tiktok", "shopee", "lazada", "gmail", "hotmail"];
  const statuses = ["available", "soldout"];

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    // Re-fetch khi filter thay đổi
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(timer);
  }, [filterPlatform, filterCategory, filterStatus, searchTerm]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterPlatform) params.append("platform", filterPlatform);
      if (filterCategory) params.append("category", filterCategory);
      if (filterStatus) params.append("status", filterStatus);
      if (searchTerm) params.append("search", searchTerm);

      const url = `/api/products?${params.toString()}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setProducts(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (data.success) {
        setCategories(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.id || !formData.title || !formData.platform) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : "/api/products";
      const method = editingProduct ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setEditingProduct(null);
        setFormData({
          id: "",
          platform: "",
          category: "",
          title: "",
          description: "",
          price: 0,
          accountCount: 0,
          status: "available",
          image: "",
        });
        await fetchProducts();
      } else {
        alert("Lỗi: " + data.error);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Lỗi khi lưu sản phẩm");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn chắc chắn muốn xóa sản phẩm này?")) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        await fetchProducts();
      } else {
        alert("Lỗi: " + data.error);
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Lỗi khi xóa sản phẩm");
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      id: "",
      platform: "",
      category: "",
      title: "",
      description: "",
      price: 0,
      accountCount: 0,
      status: "available",
      image: "",
    });
    setShowModal(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      id: product.id,
      platform: product.platform,
      category: product.category,
      title: product.title,
      description: product.description,
      price: product.price,
      accountCount: product.accountCount,
      status: product.status,
      image: product.image || "",
    });
    setShowModal(true);
  };

  const getAvailableCategories = () => {
    if (!formData.platform) return [];
    return categories.filter((cat) => cat.platform === formData.platform);
  };

  if (loading && products.length === 0) {
    return <div className="p-6 text-center">Đang tải...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Quản lý Sản phẩm
        </h1>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Thêm Sản phẩm
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow p-4 space-y-4">
        {/* Search */}
        <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-800">
          <Search size={20} className="text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white"
          />
        </div>

        {/* Filter Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <select
            value={filterPlatform}
            onChange={(e) => {
              setFilterPlatform(e.target.value);
              setFilterCategory(""); // Reset category khi đổi platform
            }}
            className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-800 text-gray-900 dark:text-white"
          >
            <option value="">Tất cả Platform</option>
            {platforms.map((p) => (
              <option key={p} value={p}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </option>
            ))}
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-800 text-gray-900 dark:text-white disabled:opacity-50"
            disabled={!filterPlatform}
          >
            <option value="">Tất cả Category</option>
            {getAvailableCategories()
              .filter((cat) => cat.platform === filterPlatform)
              .map((cat) => (
                <option key={cat._id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-800 text-gray-900 dark:text-white"
          >
            <option value="">Tất cả Trạng thái</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s === "available" ? "Còn hàng" : "Hết hàng"}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setSearchTerm("");
              setFilterPlatform("");
              setFilterCategory("");
              setFilterStatus("");
            }}
            className="px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600"
          >
            Xóa Filter
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Tiêu đề
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Platform
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Category
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Giá
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Tồn kho
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
            {products.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  Chưa có sản phẩm nào
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr
                  key={product._id}
                  className="hover:bg-gray-50 dark:hover:bg-slate-800 transition"
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white max-w-xs truncate">
                    {product.title}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-xs capitalize font-medium">
                      {product.platform}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {product.category}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                    ₫{product.price.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    <div className="flex flex-col">
                      <span className="text-green-600 dark:text-green-400">
                        {product.availableCount}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        / {product.accountCount}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={
                        product.status === "available"
                          ? "text-green-600 dark:text-green-400 font-medium"
                          : "text-red-600 dark:text-red-400 font-medium"
                      }
                    >
                      {product.status === "available" ? "Còn hàng" : "Hết hàng"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEditModal(product)}
                        className="p-2 text-yellow-600 hover:bg-yellow-100 dark:hover:bg-slate-800 rounded"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-slate-800 rounded"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              {editingProduct ? "Cập nhật Sản phẩm" : "Thêm Sản phẩm Mới"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    ID *
                  </label>
                  <input
                    type="text"
                    value={formData.id}
                    onChange={(e) =>
                      setFormData({ ...formData, id: e.target.value })
                    }
                    disabled={!!editingProduct}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-800 disabled:bg-gray-100 dark:disabled:bg-slate-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                {/* Platform */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Platform *
                  </label>
                  <select
                    value={formData.platform}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        platform: e.target.value,
                        category: "", // Reset category
                      })
                    }
                    disabled={!!editingProduct}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-800 disabled:bg-gray-100 dark:disabled:bg-slate-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">Chọn Platform</option>
                    {platforms.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-800 text-gray-900 dark:text-white disabled:opacity-50"
                    disabled={!formData.platform}
                    required
                  >
                    <option value="">Chọn Category</option>
                    {getAvailableCategories().map((cat) => (
                      <option key={cat._id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Trạng thái
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as "available" | "soldout",
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-800 text-gray-900 dark:text-white"
                  >
                    <option value="available">Còn hàng</option>
                    <option value="soldout">Hết hàng</option>
                  </select>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Giá (VND)
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-800 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Account Count */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tổng Tài khoản
                  </label>
                  <input
                    type="number"
                    value={formData.accountCount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        accountCount: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tiêu đề *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-800 text-gray-900 dark:text-white"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mô tả
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-800 text-gray-900 dark:text-white"
                  rows={3}
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  {editingProduct ? "Cập nhật" : "Tạo"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingProduct(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg font-medium"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
