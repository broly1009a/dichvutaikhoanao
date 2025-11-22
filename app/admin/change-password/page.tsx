"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/lib/context/AuthContext";
import {
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner";
import Link from "next/link";

interface ChangePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function AdminChangePasswordPage() {
  const router = useRouter();
  const { user } = useAuthContext();
  const [formData, setFormData] = useState<ChangePasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<ChangePasswordForm>>({});

  // Check if user is admin
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

  const validateForm = (): boolean => {
    const newErrors: Partial<ChangePasswordForm> = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = "Vui lòng nhập mật khẩu hiện tại";
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "Vui lòng nhập mật khẩu mới";
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "Mật khẩu phải có ít nhất 8 ký tự";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
      newErrors.newPassword = "Mật khẩu phải chứa chữ hoa, chữ thường và số";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng nhập lại mật khẩu mới";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = "Mật khẩu mới phải khác mật khẩu hiện tại";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof ChangePasswordForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          oldPassword: formData.currentPassword,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Đổi mật khẩu thành công!", {
          description: "Mật khẩu của bạn đã được cập nhật.",
        });

        // Reset form
        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });

        // Redirect to admin profile after 2 seconds
        setTimeout(() => {
          router.push("/admin/profile");
        }, 2000);
      } else {
        toast.error("Đổi mật khẩu thất bại", {
          description: data.error || "Có lỗi xảy ra, vui lòng thử lại.",
        });
      }
    } catch (error) {
      console.error("Change password error:", error);
      toast.error("Lỗi kết nối", {
        description: "Không thể kết nối đến máy chủ, vui lòng thử lại.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password: string): { level: number; label: string; color: string } => {
    if (password.length === 0) return { level: 0, label: "", color: "" };
    if (password.length < 8) return { level: 1, label: "Yếu", color: "bg-red-500" };
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) return { level: 2, label: "Trung bình", color: "bg-yellow-500" };
    if (password.length >= 12 && /(?=.*[!@#$%^&*])/.test(password)) return { level: 4, label: "Rất mạnh", color: "bg-green-500" };
    return { level: 3, label: "Mạnh", color: "bg-blue-500" };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-slate-700/50">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/profile"
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-xl">
                <ShieldCheckIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Thay đổi mật khẩu Admin
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Cập nhật mật khẩu quản trị để bảo mật hệ thống
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-slate-700/50 p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-xl">
              <KeyIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Đổi mật khẩu Admin
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Nhập thông tin để thay đổi mật khẩu quản trị
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mật khẩu hiện tại
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? "text" : "password"}
                  value={formData.currentPassword}
                  onChange={(e) => handleInputChange("currentPassword", e.target.value)}
                  className={`w-full px-4 py-3 pr-12 border-2 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-4 focus:ring-red-500/20 outline-none transition-all ${
                    errors.currentPassword
                      ? "border-red-300 dark:border-red-600 focus:border-red-500"
                      : "border-gray-200 dark:border-slate-600 focus:border-red-500"
                  }`}
                  placeholder="Vui lòng nhập mật khẩu hiện tại"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("current")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  {showPasswords.current ? (
                    <EyeSlashIcon className="w-5 h-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  {errors.currentPassword}
                </p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mật khẩu mới
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? "text" : "password"}
                  value={formData.newPassword}
                  onChange={(e) => handleInputChange("newPassword", e.target.value)}
                  className={`w-full px-4 py-3 pr-12 border-2 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-4 focus:ring-red-500/20 outline-none transition-all ${
                    errors.newPassword
                      ? "border-red-300 dark:border-red-600 focus:border-red-500"
                      : "border-gray-200 dark:border-slate-600 focus:border-red-500"
                  }`}
                  placeholder="Vui lòng nhập mật khẩu mới"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("new")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  {showPasswords.new ? (
                    <EyeSlashIcon className="w-5 h-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {formData.newPassword && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Độ mạnh:</span>
                    <span className={`text-xs font-medium ${
                      passwordStrength.level === 1 ? "text-red-600" :
                      passwordStrength.level === 2 ? "text-yellow-600" :
                      passwordStrength.level === 3 ? "text-blue-600" : "text-green-600"
                    }`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full ${
                          level <= passwordStrength.level
                            ? passwordStrength.color
                            : "bg-gray-200 dark:bg-slate-600"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {errors.newPassword && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  {errors.newPassword}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nhập lại mật khẩu mới
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  className={`w-full px-4 py-3 pr-12 border-2 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-4 focus:ring-red-500/20 outline-none transition-all ${
                    errors.confirmPassword
                      ? "border-red-300 dark:border-red-600 focus:border-red-500"
                      : "border-gray-200 dark:border-slate-600 focus:border-red-500"
                  }`}
                  placeholder="Vui lòng nhập lại mật khẩu mới"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("confirm")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  {showPasswords.confirm ? (
                    <EyeSlashIcon className="w-5 h-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Password Requirements */}
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
              <h4 className="text-sm font-medium text-red-800 dark:text-red-300 mb-2">
                Yêu cầu mật khẩu Admin:
              </h4>
              <ul className="text-xs text-red-700 dark:text-red-400 space-y-1">
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className={`w-3 h-3 ${formData.newPassword.length >= 8 ? 'text-green-500' : 'text-gray-400'}`} />
                  Ít nhất 8 ký tự
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className={`w-3 h-3 ${/(?=.*[a-z])/.test(formData.newPassword) ? 'text-green-500' : 'text-gray-400'}`} />
                  Chứa chữ thường (a-z)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className={`w-3 h-3 ${/(?=.*[A-Z])/.test(formData.newPassword) ? 'text-green-500' : 'text-gray-400'}`} />
                  Chứa chữ hoa (A-Z)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className={`w-3 h-3 ${/(?=.*\d)/.test(formData.newPassword) ? 'text-green-500' : 'text-gray-400'}`} />
                  Chứa số (0-9)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className={`w-3 h-3 ${formData.newPassword.length >= 12 ? 'text-green-500' : 'text-gray-400'}`} />
                  Khuyến nghị: 12+ ký tự
                </li>
              </ul>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-6 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Đang xử lý...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <KeyIcon className="w-5 h-5" />
                    Thay đổi mật khẩu Admin
                  </div>
                )}
              </button>
            </div>
          </form>

          {/* Security Tips */}
          <div className="mt-8 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
            <div className="flex items-start gap-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-orange-800 dark:text-orange-300 mb-1">
                  Lưu ý bảo mật Admin
                </h4>
                <ul className="text-xs text-orange-700 dark:text-orange-400 space-y-1">
                  <li>• Mật khẩu admin phải rất mạnh và phức tạp</li>
                  <li>• Không chia sẻ mật khẩu với bất kỳ ai</li>
                  <li>• Thay đổi mật khẩu định kỳ (khuyến nghị 30 ngày)</li>
                  <li>• Sử dụng 2FA nếu có thể</li>
                  <li>• Giám sát nhật ký truy cập thường xuyên</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}