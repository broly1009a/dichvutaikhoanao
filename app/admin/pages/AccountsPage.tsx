"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Search, Upload, Eye, EyeOff } from "lucide-react";

interface Account {
  _id: string;
  productId: string;
  username: string;
  password: string;
  email: string;
  emailPassword?: string;
  phone: string;
  accountType: string;
  status: "available" | "sold";
  additionalInfo?: Record<string, any>;
  createdAt: string;
}

interface Product {
  _id: string;
  title: string;
  platform: string;
}

export function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"upload" | "view">("upload");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [uploadData, setUploadData] = useState({
    separator: "|",
    format: "default",
  });
  const [accountDataText, setAccountDataText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchProducts();
    if (selectedProduct) {
      fetchAccounts(selectedProduct);
    }
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      const timer = setTimeout(() => {
        fetchAccounts(selectedProduct, 1); // Reset to page 1 when filter changes
        setCurrentPage(1);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [selectedProduct, filterStatus]);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      if (data.success) {
        setProducts(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  const fetchAccounts = async (productId: string, page: number = 1) => {
    if (!productId) return;
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("productId", productId);
      params.append("page", page.toString());
      params.append("limit", "50");
      if (filterStatus) params.append("status", filterStatus);

      const url = `/api/admin/accounts?${params.toString()}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setAccounts(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error("Failed to fetch accounts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadAccounts = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProduct || !accountDataText.trim()) {
      alert("Vui lòng chọn sản phẩm và nhập dữ liệu tài khoản!");
      return;
    }

    try {
      setUploading(true);
      const res = await fetch("/api/admin/accounts/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct,
          accountData: accountDataText,
          separator: uploadData.separator,
          format: uploadData.format,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert(`Thành công! Đã upload ${data.data.uploaded} tài khoản`);
        setAccountDataText("");
        setShowModal(false);
        await fetchAccounts(selectedProduct, 1); // Reset to page 1
      } else {
        alert("Lỗi: " + data.error);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Lỗi khi upload tài khoản");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    if (!confirm("Bạn chắc chắn muốn xóa tài khoản này?")) return;

    try {
      const res = await fetch("/api/admin/accounts/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountIds: [accountId],
          productId: selectedProduct,
        }),
      });

      const data = await res.json();
      if (data.success) {
        await fetchAccounts(selectedProduct, currentPage);
      } else {
        alert("Lỗi: " + data.error);
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Lỗi khi xóa tài khoản");
    }
  };

  const togglePasswordVisibility = (accountId: string) => {
    setShowPassword((prev) => {
      const newState = {
        ...prev,
        [accountId]: !prev[accountId],
      };
      console.log(`Toggle password for account ${accountId}:`, newState[accountId]);
      return newState;
    });
  };

  const filteredAccounts = accounts.filter((account) => {
    const matchSearch =
      account.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.phone.includes(searchTerm);
    const matchStatus = !filterStatus || account.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Quản lý Tài khoản
        </h1>
        <button
          onClick={() => {
            setModalType("upload");
            setShowModal(true);
          }}
          disabled={!selectedProduct}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload size={20} />
          Upload Tài khoản
        </button>
      </div>

      {/* Product Selection */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow p-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Chọn Sản phẩm
        </label>
        <select
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-800 text-gray-900 dark:text-white"
        >
          <option value="">-- Chọn sản phẩm --</option>
          {products.map((product) => (
            <option key={product._id} value={product._id}>
              {product.title} ({product.platform})
            </option>
          ))}
        </select>
      </div>

      {/* Filters */}
      {selectedProduct && (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow p-4 space-y-4">
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-800">
            <Search size={20} className="text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo username, email hoặc phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white"
            />
          </div>

          {/* Status Filter */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-800 text-gray-900 dark:text-white"
            >
              <option value="">Tất cả Trạng thái</option>
              <option value="available">Sẵn sàng</option>
              <option value="sold">Đã bán</option>
            </select>

            <button
              onClick={() => {
                setSearchTerm("");
                setFilterStatus("");
              }}
              className="px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600"
            >
              Xóa Filter
            </button>
          </div>
        </div>
      )}

      {/* Accounts Table */}
      {selectedProduct && (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow overflow-hidden">
          {loading ? (
            <div className="p-6 text-center">Đang tải...</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-100 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Password
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Email Password
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Phone
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
                {filteredAccounts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      Chưa có tài khoản nào
                    </td>
                  </tr>
                ) : (
                  filteredAccounts.map((account) => (
                    <tr
                      key={account._id}
                      className="hover:bg-gray-50 dark:hover:bg-slate-800 transition"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        {account.username}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        <button
                          onClick={() => togglePasswordVisibility(account._id)}
                          className="flex items-center gap-2 px-3 py-1 rounded bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition"
                        >
                          {showPassword[account._id] ? (
                            <>
                              <span className="text-sm text-blue-600 dark:text-blue-400">
                                {account.password}
                              </span>
                              <EyeOff size={16} className="text-blue-600 dark:text-blue-400" />
                            </>
                          ) : (
                            <>
                              <span className="text-sm text-gray-500">●●●●●●●●</span>
                              <Eye size={16} className="text-gray-500" />
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs">
                        {account.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {account.emailPassword ? (
                          <button
                            onClick={() => togglePasswordVisibility(`email-${account._id}`)}
                            className="flex items-center gap-2 px-3 py-1 rounded bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 transition"
                          >
                            {showPassword[`email-${account._id}`] ? (
                              <>
                                <span className="text-sm text-green-600 dark:text-green-400">
                                  {account.emailPassword}
                                </span>
                                <EyeOff size={16} className="text-green-600 dark:text-green-400" />
                              </>
                            ) : (
                              <>
                                <span className="text-sm text-gray-500">●●●●●●●●</span>
                                <Eye size={16} className="text-gray-500" />
                              </>
                            )}
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {account.phone}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={
                            account.status === "available"
                              ? "text-green-600 dark:text-green-400 font-medium"
                              : "text-red-600 dark:text-red-400 font-medium"
                          }
                        >
                          {account.status === "available"
                            ? "Sẵn sàng"
                            : "Đã bán"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteAccount(account._id)}
                          className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-slate-800 rounded"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Pagination */}
      {selectedProduct && !loading && accounts.length > 0 && (
        <div className="flex justify-center items-center gap-2">
          <button
            onClick={() => fetchAccounts(selectedProduct, currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-slate-800"
          >
            Trước
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => fetchAccounts(selectedProduct, page)}
              className={`px-3 py-2 rounded-lg ${
                page === currentPage
                  ? "bg-blue-600 text-white"
                  : "border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-800"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => fetchAccounts(selectedProduct, currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-slate-800"
          >
            Sau
          </button>

          <span className="ml-4 text-sm text-gray-600 dark:text-gray-400">
            Trang {currentPage} / {totalPages}
          </span>
        </div>
      )}

      {/* Upload Modal */}
      {showModal && modalType === "upload" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Upload Tài khoản
            </h2>

            <form onSubmit={handleUploadAccounts} className="space-y-4">
              {/* Separator */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ký tự phân tách
                </label>
                <input
                  type="text"
                  value={uploadData.separator}
                  onChange={(e) =>
                    setUploadData({ ...uploadData, separator: e.target.value })
                  }
                  maxLength={1}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-800 text-gray-900 dark:text-white"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Mặc định là "|" (pipe). Đổi nếu dữ liệu của bạn dùng ký tự khác
                </p>
              </div>

              {/* Format Info */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Định dạng
                </label>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-3">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>Định dạng mặc định:</strong>
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 font-mono">
                    username|password|phone|email|emailPassword|extra1|extra2|...
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                    Ví dụ:
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                    user123|pass@123|0123456789|user@email.com|emailPass456|data1|data2
                  </p>
                </div>
              </div>

              {/* Account Data */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Dữ liệu tài khoản (mỗi dòng một tài khoản) *
                </label>
                <textarea
                  value={accountDataText}
                  onChange={(e) => setAccountDataText(e.target.value)}
                  placeholder="user1|pass1|0123456789|user1@email.com
user2|pass2|0987654321|user2@email.com
..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-800 text-gray-900 dark:text-white font-mono text-sm"
                  rows={6}
                  required
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? "Đang upload..." : "Upload"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setAccountDataText("");
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
