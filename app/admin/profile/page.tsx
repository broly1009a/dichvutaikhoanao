"use client";

import { useState, useEffect } from "react";
import { useAuthContext } from "@/lib/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  UsersIcon,
  ShoppingBagIcon,
  BanknotesIcon,
  Cog6ToothIcon,
  ArrowPathIcon,
  EyeIcon,
  DocumentTextIcon,
  BellIcon,
  KeyIcon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner";

interface AdminProfile {
  _id: string;
  email: string;
  phone: string;
  fullName: string;
  username: string;
  role: "admin";
  status: "active" | "blocked" | "pending";
  permissions: string[];
  createdAt: string;
  lastLogin: string;
  avatar?: string;
}

interface AdminStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  todayRevenue: number;
  activeUsers: number;
}

export default function AdminProfilePage() {
  const { user, updateUser } = useAuthContext();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [editForm, setEditForm] = useState({
    fullName: "",
    phone: "",
    email: "",
  });

  // Fetch admin profile data on mount
  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/profile');

        if (!response.ok) {
          throw new Error('Failed to fetch admin profile');
        }

        const result = await response.json();

        if (result.success) {
          setAdminProfile(result.data);
          setStats(result.data.stats);
          setEditForm({
            fullName: result.data.fullName || "",
            phone: result.data.phone || "",
            email: result.data.email || "",
          });
        } else {
          toast.error(result.error || 'Không thể tải thông tin admin profile');
        }
      } catch (error) {
        console.error('Fetch admin profile error:', error);
        toast.error('Lỗi khi tải thông tin admin profile');
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === 'admin') {
      fetchAdminProfile();
    }
  }, [user]);

  const handleEdit = () => {
    if (adminProfile) {
      setEditForm({
        fullName: adminProfile.fullName,
        phone: adminProfile.phone,
        email: adminProfile.email,
      });
    }
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      setUpdating(true);

      const response = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setAdminProfile(result.data);
        updateUser(result.data);
        toast.success("Cập nhật thông tin thành công!");
        setIsEditing(false);
      } else {
        toast.error(result.error || "Lỗi khi cập nhật thông tin");
      }
    } catch (error) {
      console.error('Update admin profile error:', error);
      toast.error("Lỗi kết nối, vui lòng thử lại");
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("vi-VN") + "đ";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN");
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-red-600 dark:text-red-400 font-medium">Truy cập bị từ chối</p>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Bạn không có quyền truy cập trang này</p>
        </div>
      </div>
    );
  }

  if (loading || !adminProfile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Đang tải thông tin admin profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                <ShieldCheckIcon className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                <ShieldCheckIcon className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {adminProfile.fullName}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-1">
                @{adminProfile.username}
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <ShieldCheckIcon className="w-4 h-4 text-red-500" />
                  Quản trị viên hệ thống
                </span>
                <span className="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 rounded-full text-xs font-medium">
                  {adminProfile.status === 'active' ? 'Đang hoạt động' : 'Tạm khóa'}
                </span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-4 text-white shadow-lg">
                <div className="flex items-center gap-2 mb-1">
                  <UsersIcon className="w-4 h-4" />
                  <span className="text-xs font-medium">Người dùng</span>
                </div>
                <div className="text-xl font-bold">
                  {stats?.totalUsers.toLocaleString()}
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-4 text-white shadow-lg">
                <div className="flex items-center gap-2 mb-1">
                  <CurrencyDollarIcon className="w-4 h-4" />
                  <span className="text-xs font-medium">Doanh thu</span>
                </div>
                <div className="text-lg font-bold">
                  {(stats?.totalRevenue || 0) / 1000000}M
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Personal Info & Permissions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-slate-700/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Thông tin cá nhân
                </h2>
                {!isEditing ? (
                  <button
                    onClick={handleEdit}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
                  >
                    <PencilIcon className="w-4 h-4" />
                    Chỉnh sửa
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      disabled={updating}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-xl transition-colors disabled:cursor-not-allowed"
                    >
                      {updating ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <CheckIcon className="w-4 h-4" />
                      )}
                      {updating ? 'Đang lưu...' : 'Lưu'}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-xl transition-colors"
                    >
                      <XMarkIcon className="w-4 h-4" />
                      Hủy
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Họ và tên
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.fullName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, fullName: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    />
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl">
                      <UserIcon className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900 dark:text-white font-medium">
                        {adminProfile.fullName}
                      </span>
                    </div>
                  )}
                </div>

                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tên đăng nhập
                  </label>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl">
                    <span className="text-blue-600 dark:text-blue-400">@</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {adminProfile.username}
                    </span>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Địa chỉ Email
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    />
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl">
                      <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900 dark:text-white font-medium">
                        {adminProfile.email}
                      </span>
                    </div>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Số điện thoại
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    />
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl">
                      <PhoneIcon className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900 dark:text-white font-medium">
                        {adminProfile.phone}
                      </span>
                    </div>
                  )}
                </div>

                {/* Registration Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Thời gian tạo tài khoản
                  </label>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl">
                    <CalendarIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900 dark:text-white font-medium">
                      {formatDate(adminProfile.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Last Login */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Đăng nhập gần đây
                  </label>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl">
                    <ClockIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900 dark:text-white font-medium">
                      {formatDate(adminProfile.lastLogin)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Permissions */}
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-slate-700/50 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Quyền hạn quản trị
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {adminProfile.permissions.map((permission, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                    <ShieldCheckIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="text-sm text-green-800 dark:text-green-300 font-medium">
                      {permission.replace('.', ' → ').replace('manage', 'quản lý')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Stats & Actions */}
          <div className="space-y-6">
            {/* Admin Statistics */}
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-slate-700/50 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Thống kê hệ thống
              </h3>

              <div className="space-y-4">
                {/* Total Users */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-700 dark:text-blue-400 font-medium">
                        Tổng người dùng
                      </p>
                      <p className="text-2xl font-bold text-blue-800 dark:text-blue-300">
                        {stats?.totalUsers.toLocaleString()}
                      </p>
                    </div>
                    <UsersIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>

                {/* Total Orders */}
                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-700 dark:text-purple-400 font-medium">
                        Tổng đơn hàng
                      </p>
                      <p className="text-2xl font-bold text-purple-800 dark:text-purple-300">
                        {stats?.totalOrders.toLocaleString()}
                      </p>
                    </div>
                    <ShoppingBagIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>

                {/* Total Revenue */}
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                        Tổng doanh thu
                      </p>
                      <p className="text-xl font-bold text-green-800 dark:text-green-300">
                        {formatCurrency(stats?.totalRevenue || 0)}
                      </p>
                    </div>
                    <BanknotesIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                </div>

                {/* Pending Orders */}
                <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-orange-700 dark:text-orange-400 font-medium">
                        Đơn hàng chờ xử lý
                      </p>
                      <p className="text-2xl font-bold text-orange-800 dark:text-orange-300">
                        {stats?.pendingOrders}
                      </p>
                    </div>
                    <DocumentTextIcon className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-slate-700/50 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Thao tác nhanh
              </h3>

              <div className="space-y-3">
                <button className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl">
                  <div className="flex items-center justify-center gap-2">
                    <ChartBarIcon className="w-4 h-4" />
                    Xem báo cáo
                  </div>
                </button>
                <button className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl">
                  <div className="flex items-center justify-center gap-2">
                    <UsersIcon className="w-4 h-4" />
                    Quản lý người dùng
                  </div>
                </button>
                <button className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl">
                  <div className="flex items-center justify-center gap-2">
                    <Cog6ToothIcon className="w-4 h-4" />
                    Cài đặt hệ thống
                  </div>
                </button>
                <button
                  onClick={() => router.push('/change-password')}
                  className="w-full px-4 py-3 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <div className="flex items-center justify-center gap-2">
                    <KeyIcon className="w-4 h-4" />
                    Đổi mật khẩu
                  </div>
                </button>
              </div>
            </div>

            {/* System Status */}
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-slate-700/50 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Trạng thái hệ thống
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <span className="text-sm text-green-800 dark:text-green-300 font-medium">Server Status</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-700 dark:text-green-400">Online</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <span className="text-sm text-blue-800 dark:text-blue-300 font-medium">Database</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-blue-700 dark:text-blue-400">Connected</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                  <span className="text-sm text-yellow-800 dark:text-yellow-300 font-medium">API Response</span>
                  <span className="text-xs text-yellow-700 dark:text-yellow-400">~120ms</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}