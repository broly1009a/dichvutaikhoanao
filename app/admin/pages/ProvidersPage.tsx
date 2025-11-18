"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";

interface Provider {
  _id: string;
  name: string;
  type: "internal" | "external_api" | "manual_upload";
  status: "active" | "inactive" | "testing";
  isHealthy: boolean;
  supportedPlatforms: string[];
  totalAccountsFetched: number;
  lastSyncTime?: string;
}

export function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "external_api",
    apiUrl: "",
    apiKey: "",
    apiSecret: "",
    authenticationType: "bearer",
    supportedPlatforms: [] as string[],
    requestsPerMinute: 100,
  });

  const platforms = ["tiktok", "shopee", "lazada", "gmail", "hotmail"];

  // Fetch providers
  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/providers");
      const data = await res.json();
      if (data.success) {
        setProviders(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch providers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingProvider
        ? `/api/providers/${editingProvider._id}`
        : "/api/providers";
      const method = editingProvider ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setEditingProvider(null);
        setFormData({
          name: "",
          type: "external_api",
          apiUrl: "",
          apiKey: "",
          apiSecret: "",
          authenticationType: "bearer",
          supportedPlatforms: [],
          requestsPerMinute: 100,
        });
        await fetchProviders();
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to save provider");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn chắc chắn muốn xóa provider này?")) return;

    try {
      const res = await fetch(`/api/providers/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        await fetchProviders();
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete provider");
    }
  };

  const handleSync = async (providerId: string) => {
    const productId = prompt("Nhập Product ID:");
    if (!productId) return;

    const endpoint = prompt("Nhập endpoint (ví dụ: /accounts):");
    if (!endpoint) return;

    try {
      const res = await fetch("/api/providers/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerId,
          productId,
          endpoint,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert(`✅ ${data.message}`);
        await fetchProviders();
      } else {
        alert("❌ " + data.error);
      }
    } catch (error) {
      console.error("Sync error:", error);
      alert("Sync failed");
    }
  };

  const togglePlatform = (platform: string) => {
    setFormData((prev) => ({
      ...prev,
      supportedPlatforms: prev.supportedPlatforms.includes(platform)
        ? prev.supportedPlatforms.filter((p) => p !== platform)
        : [...prev.supportedPlatforms, platform],
    }));
  };

  if (loading) {
    return <div className="p-6 text-center">Đang tải...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Quản lý Providers
        </h1>
        <button
          onClick={() => {
            setEditingProvider(null);
            setFormData({
              name: "",
              type: "external_api",
              apiUrl: "",
              apiKey: "",
              apiSecret: "",
              authenticationType: "bearer",
              supportedPlatforms: [],
              requestsPerMinute: 100,
            });
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Thêm Provider
        </button>
      </div>

      {/* Providers Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Tên
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Loại
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Status
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Platforms
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Accounts
              </th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
            {providers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  Chưa có provider nào
                </td>
              </tr>
            ) : (
              providers.map((provider) => (
                <tr
                  key={provider._id}
                  className="hover:bg-gray-50 dark:hover:bg-slate-800 transition"
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    {provider.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-xs">
                      {provider.type === "external_api"
                        ? "External API"
                        : provider.type === "manual_upload"
                          ? "Manual Upload"
                          : "Internal"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      {provider.isHealthy ? (
                        <CheckCircle size={16} className="text-green-500" />
                      ) : (
                        <AlertCircle size={16} className="text-red-500" />
                      )}
                      <span
                        className={
                          provider.status === "active"
                            ? "text-green-600 dark:text-green-400"
                            : provider.status === "testing"
                              ? "text-yellow-600 dark:text-yellow-400"
                              : "text-red-600 dark:text-red-400"
                        }
                      >
                        {provider.status === "active"
                          ? "Hoạt động"
                          : provider.status === "testing"
                            ? "Đang test"
                            : "Không hoạt động"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex gap-1 flex-wrap">
                      {provider.supportedPlatforms.map((p) => (
                        <span
                          key={p}
                          className="px-2 py-1 bg-gray-200 dark:bg-slate-700 rounded text-xs"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {provider.totalAccountsFetched}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleSync(provider._id)}
                        className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-slate-800 rounded"
                        title="Sync"
                      >
                        <RefreshCw size={18} />
                      </button>
                      <button
                        onClick={() => {
                          setEditingProvider(provider);
                          setFormData({
                            name: provider.name,
                            type: provider.type,
                            apiUrl: "",
                            apiKey: "",
                            apiSecret: "",
                            authenticationType: "bearer",
                            supportedPlatforms: provider.supportedPlatforms,
                            requestsPerMinute: 100,
                          });
                          setShowModal(true);
                        }}
                        className="p-2 text-yellow-600 hover:bg-yellow-100 dark:hover:bg-slate-800 rounded"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(provider._id)}
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
              {editingProvider ? "Cập nhật Provider" : "Thêm Provider Mới"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tên Provider
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
                  Loại
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-800"
                >
                  <option value="internal">Internal</option>
                  <option value="external_api">External API</option>
                  <option value="manual_upload">Manual Upload</option>
                </select>
              </div>

              {formData.type === "external_api" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      API URL
                    </label>
                    <input
                      type="url"
                      value={formData.apiUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, apiUrl: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-800"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      API Key
                    </label>
                    <input
                      type="password"
                      value={formData.apiKey}
                      onChange={(e) =>
                        setFormData({ ...formData, apiKey: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-800"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Auth Type
                    </label>
                    <select
                      value={formData.authenticationType}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          authenticationType: e.target.value as any,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-800"
                    >
                      <option value="bearer">Bearer</option>
                      <option value="api_key">API Key</option>
                      <option value="basic">Basic</option>
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Hỗ trợ Platforms
                </label>
                <div className="flex flex-wrap gap-2">
                  {platforms.map((platform) => (
                    <button
                      key={platform}
                      type="button"
                      onClick={() => togglePlatform(platform)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium ${
                        formData.supportedPlatforms.includes(platform)
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {platform}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingProvider ? "Cập nhật" : "Tạo"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingProvider(null);
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
