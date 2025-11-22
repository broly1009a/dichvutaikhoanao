"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, ChevronDown } from "lucide-react";
import * as HeroIcons from "@heroicons/react/24/outline";

interface Category {
  _id: string;
  name: string;
  slug: string;
  platform: string;
  description?: string;
  icon?: string;
  productCount: number;
  displayOrder: number;
  status: "active" | "inactive";
}

// Available icons from Heroicons
const AVAILABLE_ICONS = [
  "MusicalNoteIcon",
  "StarIcon",
  "TrophyIcon",
  "CurrencyDollarIcon",
  "ShoppingBagIcon",
  "DevicePhoneMobileIcon",
  "ArrowTrendingUpIcon",
  "ShoppingCartIcon",
  "EnvelopeIcon",
  "AtSymbolIcon",
  "GiftIcon",
  "LightBulbIcon",
  "HeartIcon",
  "SparklesIcon",
  "CheckCircleIcon",
  "FireIcon",
  "BoltIcon",
  "CloudIcon",
];

const getIconComponent = (iconName: string) => {
  return (HeroIcons as any)[iconName] || null;
};

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    platform: "",
    description: "",
    icon: "",
    displayOrder: 0,
  });

  const platforms = ["tiktok", "shopee", "lazada", "gmail", "hotmail"];

  useEffect(() => {
    fetchCategories();
  }, [selectedPlatform]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const url = selectedPlatform
        ? `/api/admin/categories?platform=${selectedPlatform}`
        : "/api/admin/categories";
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingCategory
        ? `/api/admin/categories/${editingCategory._id}`
        : "/api/admin/categories";
      const method = editingCategory ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setEditingCategory(null);
        setFormData({
          name: "",
          slug: "",
          platform: "",
          description: "",
          icon: "",
          displayOrder: 0,
        });
        await fetchCategories();
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to save category");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn chắc chắn muốn xóa category này?")) return;

    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        await fetchCategories();
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete category");
    }
  };

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({
      name: "",
      slug: "",
      platform: "",
      description: "",
      icon: "",
      displayOrder: 0,
    });
    setShowModal(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      platform: category.platform,
      description: category.description || "",
      icon: category.icon || "",
      displayOrder: category.displayOrder,
    });
    setShowModal(true);
  };

  if (loading) {
    return <div className="p-6 text-center">Đang tải...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Quản lý Categories
        </h1>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Thêm Category
        </button>
      </div>

      {/* Platform Filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedPlatform("")}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            selectedPlatform === ""
              ? "bg-blue-600 text-white"
              : "bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-white"
          }`}
        >
          Tất cả
        </button>
        {platforms.map((platform) => (
          <button
            key={platform}
            onClick={() => setSelectedPlatform(platform)}
            className={`px-4 py-2 rounded-lg font-medium transition capitalize ${
              selectedPlatform === platform
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-white"
            }`}
          >
            {platform}
          </button>
        ))}
      </div>

      {/* Categories Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Tên
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Slug
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Platform
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Products
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Status
              </th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
            {categories.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  Chưa có category nào
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr
                  key={category._id}
                  className="hover:bg-gray-50 dark:hover:bg-slate-800 transition"
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    {category.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {category.slug}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-xs capitalize">
                      {category.platform}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {category.productCount}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={
                        category.status === "active"
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }
                    >
                      {category.status === "active" ? "Hoạt động" : "Không hoạt động"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEditModal(category)}
                        className="p-2 text-yellow-600 hover:bg-yellow-100 dark:hover:bg-slate-800 rounded"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(category._id)}
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
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              {editingCategory ? "Cập nhật Category" : "Thêm Category Mới"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tên
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Slug
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                    })
                  }
                  disabled={!!editingCategory}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-800 disabled:bg-gray-100 dark:disabled:bg-slate-700"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Platform
                </label>
                <select
                  value={formData.platform}
                  onChange={(e) =>
                    setFormData({ ...formData, platform: e.target.value })
                  }
                  disabled={!!editingCategory}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-800 disabled:bg-gray-100 dark:disabled:bg-slate-700"
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

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Icon
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowIconPicker(!showIconPicker)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-800 text-left flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      {formData.icon ? (
                        <>
                          {(() => {
                            const IconComponent = getIconComponent(formData.icon);
                            return IconComponent ? <IconComponent size={18} /> : null;
                          })()}
                          <span className="text-sm">{formData.icon}</span>
                        </>
                      ) : (
                        <span className="text-gray-500">Chọn icon</span>
                      )}
                    </span>
                    <ChevronDown size={18} />
                  </button>

                  {showIconPicker && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg p-2 grid grid-cols-4 gap-2 z-50 max-h-64 overflow-y-auto shadow-lg">
                      {AVAILABLE_ICONS.map((iconName) => {
                        const IconComponent = getIconComponent(iconName);
                        return IconComponent ? (
                          <button
                            key={iconName}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, icon: iconName });
                              setShowIconPicker(false);
                            }}
                            className={`p-2 flex flex-col items-center justify-center rounded hover:bg-blue-100 dark:hover:bg-slate-700 transition ${
                              formData.icon === iconName
                                ? "bg-blue-500 text-white"
                                : "text-gray-700 dark:text-gray-300"
                            }`}
                            title={iconName}
                          >
                            <IconComponent size={20} />
                            <span className="text-xs mt-1 text-center truncate">
                              {iconName.replace("Icon", "")}
                            </span>
                          </button>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mô tả
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-800"
                  rows={2}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingCategory ? "Cập nhật" : "Tạo"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingCategory(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg"
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
