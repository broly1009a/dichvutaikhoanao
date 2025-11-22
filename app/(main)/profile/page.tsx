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
  ArrowPathIcon,
  KeyIcon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner";

interface UserProfile {
  _id: string;
  email: string;
  phone: string;
  fullName: string;
  username: string;
  role: "customer" | "admin" | "seller";
  status: "active" | "blocked" | "pending";
  balance: number;
  totalPurchased: number;
  totalSpent: number;
  createdAt: string;
  lastLogin: string;
  avatar?: string;
}

export default function ProfilePage() {
  const { user, updateUser } = useAuthContext();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [editForm, setEditForm] = useState({
    fullName: "",
    phone: "",
    email: "",
  });

  // Fetch profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/user/profile');

        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const result = await response.json();

        if (result.success) {
          setProfileData(result.data);
          setEditForm({
            fullName: result.data.fullName || "",
            phone: result.data.phone || "",
            email: result.data.email || "",
          });
        } else {
          toast.error(result.error || 'Không thể tải thông tin profile');
        }
      } catch (error) {
        console.error('Fetch profile error:', error);
        toast.error('Lỗi khi tải thông tin profile');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  const handleEdit = () => {
    if (profileData) {
      setEditForm({
        fullName: profileData.fullName,
        phone: profileData.phone,
        email: profileData.email,
      });
    }
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      setUpdating(true);

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setProfileData(result.data);
        updateUser(result.data);
        toast.success("Cập nhật thông tin thành công!");
        setIsEditing(false);
      } else {
        toast.error(result.error || "Lỗi khi cập nhật thông tin");
      }
    } catch (error) {
      console.error('Update profile error:', error);
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (loading || !profileData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Đang tải thông tin profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <UserIcon className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                <ShieldCheckIcon className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {profileData.fullName}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-1">
                @{profileData.username}
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <ShieldCheckIcon className="w-4 h-4" />
                  {profileData.role === 'admin' ? 'Quản trị viên' :
                   profileData.role === 'seller' ? 'Người bán' : 'Khách hàng'}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  profileData.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                  profileData.status === 'blocked' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                }`}>
                  {profileData.status === 'active' ? 'Hoạt động' :
                   profileData.status === 'blocked' ? 'Đã khóa' : 'Chờ duyệt'}
                </span>
              </div>
            </div>

            {/* Balance Card */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <CurrencyDollarIcon className="w-5 h-5" />
                <span className="text-sm font-medium">Số dư hiện tại</span>
              </div>
              <div className="text-3xl font-bold mb-1">
                {formatCurrency(profileData.balance)}
              </div>
              <div className="text-sm opacity-90">
                Sẵn sàng sử dụng
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Personal Info */}
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
                        {profileData.fullName}
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
                      {profileData.username}
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
                        {profileData.email}
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
                        {profileData.phone}
                      </span>
                    </div>
                  )}
                </div>

                {/* Registration Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Thời gian đăng ký
                  </label>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl">
                    <CalendarIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900 dark:text-white font-medium">
                      {formatDate(profileData.createdAt)}
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
                      {formatDate(profileData.lastLogin)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Financial Stats */}
          <div className="space-y-6">
            {/* Financial Overview */}
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-slate-700/50 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Tổng quan tài chính
              </h3>

              <div className="space-y-4">
                {/* Current Balance */}
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                        Số dư hiện tại
                      </p>
                      <p className="text-2xl font-bold text-green-800 dark:text-green-300">
                        {formatCurrency(profileData.balance)}
                      </p>
                    </div>
                    <CurrencyDollarIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                </div>

                {/* Total Deposited */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-700 dark:text-blue-400 font-medium">
                        Tổng tiền nạp
                      </p>
                      <p className="text-2xl font-bold text-blue-800 dark:text-blue-300">
                        {formatCurrency(1803400)}
                      </p>
                    </div>
                    <ArrowPathIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>

                {/* Total Spent */}
                <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-orange-700 dark:text-orange-400 font-medium">
                        Đã sử dụng
                      </p>
                      <p className="text-2xl font-bold text-orange-800 dark:text-orange-300">
                        {formatCurrency(profileData.totalSpent)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {profileData.totalPurchased} đơn hàng
                      </p>
                    </div>
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
                  Nạp tiền
                </button>
                <button className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl">
                  Lịch sử giao dịch
                </button>
                <button
                  onClick={() => router.push('/change-password')}
                  className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <div className="flex items-center justify-center gap-2">
                    <KeyIcon className="w-4 h-4" />
                    Đổi mật khẩu
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}