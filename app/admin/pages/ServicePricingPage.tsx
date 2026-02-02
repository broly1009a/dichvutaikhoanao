"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Edit2, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

interface QualityOption {
  level: string;
  multiplier: number;
}

interface Server {
  name: string;
  multiplier: number;
  speed: string;
}

interface Region {
  code: string;
  name: string;
}

interface ServicePricing {
  _id: string;
  serviceType: string;
  platform: string;
  basePrice: number;
  minQuantity: number;
  servers: Server[];
  qualityOptions: QualityOption[];
  regions: Region[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export function ServicePricingPage() {
  const [pricings, setPricings] = useState<ServicePricing[]>([]);
  const [filteredPricings, setFilteredPricings] = useState<ServicePricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPlatform, setFilterPlatform] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPricing, setEditingPricing] = useState<ServicePricing | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Form state
  const [formData, setFormData] = useState({
    serviceType: "",
    platform: "",
    basePrice: 50,
    minQuantity: 100,
    servers: [
      { name: "Fast", multiplier: 1.5, speed: "2-4 hours" },
      { name: "Standard", multiplier: 1.0, speed: "6-12 hours" },
      { name: "Economy", multiplier: 0.8, speed: "12-24 hours" }
    ],
    qualityOptions: [
      { level: "standard", multiplier: 1.0 },
      { level: "high", multiplier: 1.3 },
      { level: "premium", multiplier: 1.6 }
    ],
    regions: [
      { code: "vn", name: "Vietnam" },
      { code: "global", name: "Global" }
    ],
    isActive: true
  });

  const platforms = ["tiktok", "shopee", "lazada", "facebook", "instagram", "youtube"];

  useEffect(() => {
    fetchPricings();
  }, []);

  useEffect(() => {
    let result = pricings;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((pricing) =>
        pricing.serviceType.toLowerCase().includes(query) ||
        pricing.platform.toLowerCase().includes(query)
      );
    }

    if (filterPlatform !== "all") {
      result = result.filter((pricing) => pricing.platform === filterPlatform);
    }

    if (filterStatus !== "all") {
      result = result.filter((pricing) => 
        filterStatus === "active" ? pricing.isActive : !pricing.isActive
      );
    }

    setFilteredPricings(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [pricings, searchQuery, filterPlatform, filterStatus]);

  const fetchPricings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/service-pricing");
      const data = await response.json();
      if (data.success) {
        setPricings(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch pricings:", error);
      toast.error("Không thể tải dữ liệu pricing");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (pricingId: string, currentStatus: boolean) => {
    try {
      const response = await fetch("/api/admin/service-pricing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _id: pricingId,
          isActive: !currentStatus
        })
      });

      const data = await response.json();
      if (data.success) {
        setPricings(pricings.map(p => 
          p._id === pricingId ? { ...p, isActive: !currentStatus } : p
        ));
        toast.success(`Đã ${!currentStatus ? "kích hoạt" : "vô hiệu hóa"} dịch vụ`);
      } else {
        toast.error(data.error || "Cập nhật thất bại");
      }
    } catch (error) {
      console.error("Toggle error:", error);
      toast.error("Có lỗi xảy ra");
    }
  };

  const handleDelete = async (pricingId: string) => {
    if (!confirm("Bạn chắc chắn muốn xóa pricing này?")) return;

    try {
      const response = await fetch(`/api/admin/service-pricing?id=${pricingId}`, {
        method: "DELETE"
      });

      if (response.ok) {
        setPricings(pricings.filter(p => p._id !== pricingId));
        toast.success("Đã xóa pricing");
      } else {
        toast.error("Xóa thất bại");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Có lỗi xảy ra");
    }
  };

  const handleOpenModal = (pricing?: ServicePricing) => {
    if (pricing) {
      setEditingPricing(pricing);
      setFormData({
        serviceType: pricing.serviceType,
        platform: pricing.platform,
        basePrice: pricing.basePrice,
        minQuantity: pricing.minQuantity,
        servers: pricing.servers,
        qualityOptions: pricing.qualityOptions,
        regions: pricing.regions,
        isActive: pricing.isActive
      });
    } else {
      setEditingPricing(null);
      setFormData({
        serviceType: "",
        platform: "",
        basePrice: 50,
        minQuantity: 100,
        servers: [
          { name: "Fast", multiplier: 1.5, speed: "2-4 hours" },
          { name: "Standard", multiplier: 1.0, speed: "6-12 hours" },
          { name: "Economy", multiplier: 0.8, speed: "12-24 hours" }
        ],
        qualityOptions: [
          { level: "standard", multiplier: 1.0 },
          { level: "high", multiplier: 1.3 },
          { level: "premium", multiplier: 1.6 }
        ],
        regions: [
          { code: "vn", name: "Vietnam" },
          { code: "global", name: "Global" }
        ],
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPricing(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.serviceType || !formData.platform) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (formData.basePrice < 0) {
      toast.error("Giá phải lớn hơn 0");
      return;
    }

    try {
      const method = editingPricing ? "PUT" : "POST";
      const body = editingPricing 
        ? { _id: editingPricing._id, ...formData }
        : formData;

      const response = await fetch("/api/admin/service-pricing", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      if (data.success) {
        toast.success(editingPricing ? "Cập nhật thành công" : "Tạo pricing thành công");
        fetchPricings();
        handleCloseModal();
      } else {
        toast.error(data.error || "Thao tác thất bại");
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Có lỗi xảy ra");
    }
  };

  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      tiktok: "bg-pink-100 dark:bg-pink-900/20 text-pink-700 dark:text-pink-400",
      shopee: "bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400",
      lazada: "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400",
      facebook: "bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400",
      instagram: "bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400",
      youtube: "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400"
    };
    return colors[platform] || "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300";
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredPricings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPricings = filteredPricings.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quản lý Service Pricing</h1>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={20} />
          Thêm Pricing
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm service type, platform..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
            />
          </div>

          <select
            value={filterPlatform}
            onChange={(e) => setFilterPlatform(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
          >
            <option value="all">Tất cả Platform</option>
            {platforms.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
          >
            <option value="all">Tất cả Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          Tìm thấy <span className="font-semibold">{filteredPricings.length}</span> services
          {filteredPricings.length > 0 && (
            <span> • Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredPricings.length)} của {filteredPricings.length}</span>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Đang tải dữ liệu...</p>
        </div>
      ) : filteredPricings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Không có pricing nào</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-lg overflow-hidden border border-gray-200 dark:border-slate-700">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Service Type</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Platform</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">Base Price</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">Min Qty</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">Servers</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">Quality</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {currentPricings.map((pricing) => (
                  <tr key={pricing._id} className="hover:bg-gray-50 dark:hover:bg-slate-800 transition">
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900 dark:text-white">{pricing.serviceType}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getPlatformColor(pricing.platform)}`}>
                        {pricing.platform}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {pricing.basePrice.toLocaleString("vi-VN")}đ
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">
                      {pricing.minQuantity}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">
                      {pricing.servers.length}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">
                      {pricing.qualityOptions.length}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggleActive(pricing._id, pricing.isActive)}
                        className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 mx-auto ${
                          pricing.isActive
                            ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400"
                        }`}
                      >
                        {pricing.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                        {pricing.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(pricing)}
                          className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-slate-800 rounded transition"
                          title="Chỉnh sửa"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(pricing._id)}
                          className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-slate-800 rounded transition"
                          title="Xóa"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && filteredPricings.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            {/* Items per page selector */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 dark:text-gray-400">Hiển thị:</label>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-3 py-1 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 text-sm"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span className="text-sm text-gray-600 dark:text-gray-400">mục/trang</span>
            </div>

            {/* Page info and navigation */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Trang {currentPage} / {totalPages}
              </span>
              
              <div className="flex gap-1">
                {/* First page */}
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm text-gray-700 dark:text-gray-300"
                >
                  ««
                </button>

                {/* Previous page */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm text-gray-700 dark:text-gray-300"
                >
                  «
                </button>

                {/* Page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 border rounded-lg text-sm ${
                        currentPage === pageNum
                          ? "bg-blue-600 text-white border-blue-600"
                          : "border-gray-300 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {/* Next page */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm text-gray-700 dark:text-gray-300"
                >
                  »
                </button>

                {/* Last page */}
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm text-gray-700 dark:text-gray-300"
                >
                  »»
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              {editingPricing ? "Cập nhật Service Pricing" : "Thêm Service Pricing Mới"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* ID chỉ hiển thị khi chỉnh sửa */}
              {editingPricing && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    ID
                  </label>
                  <input
                    type="text"
                    value={editingPricing._id}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-800 disabled:bg-gray-100 dark:disabled:bg-slate-700 text-gray-900 dark:text-white"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Service Type *
                  </label>
                  <input
                    type="text"
                    value={formData.serviceType}
                    onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                    placeholder="e.g., tiktok-follow"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Platform *
                  </label>
                  <select
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                    required
                  >
                    <option value="">Chọn platform</option>
                    {platforms.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Base Price (đ) *
                  </label>
                  <input
                    type="number"
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Min Quantity
                  </label>
                  <input
                    type="number"
                    value={formData.minQuantity}
                    onChange={(e) => setFormData({ ...formData, minQuantity: parseInt(e.target.value) || 100 })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                    min="1"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Active
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  {editingPricing ? "Cập nhật" : "Tạo"}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
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
