"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Check, X } from "lucide-react";

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  // Password strength validation
  const getPasswordStrength = (): PasswordStrength => {
    const pwd = formData.password;
    let score = 0;

    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) score++;

    const strengths: PasswordStrength[] = [
      { score: 0, label: "Quá yếu", color: "bg-red-500" },
      { score: 1, label: "Yếu", color: "bg-orange-500" },
      { score: 2, label: "Trung bình", color: "bg-yellow-500" },
      { score: 3, label: "Tốt", color: "bg-blue-500" },
      { score: 4, label: "Rất tốt", color: "bg-green-500" },
      { score: 5, label: "Rất mạnh", color: "bg-green-600" },
    ];

    return strengths[Math.min(score, 5)];
  };

  // Validation checks
  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPhone = (phone: string) => /^[0-9]{10,11}$/.test(phone);
  const isValidPassword = (pwd: string) => pwd.length >= 8;
  const passwordsMatch = formData.password === formData.confirmPassword;

  const passwordStrength = getPasswordStrength();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validation
    if (!formData.fullName.trim()) {
      setError("Vui lòng nhập họ tên");
      return;
    }

    if (!isValidEmail(formData.email)) {
      setError("Email không hợp lệ");
      return;
    }

    if (!isValidPhone(formData.phone)) {
      setError("Số điện thoại phải có 10-11 chữ số");
      return;
    }

    if (!isValidPassword(formData.password)) {
      setError("Mật khẩu phải có ít nhất 8 ký tự");
      return;
    }

    if (!passwordsMatch) {
      setError("Mật khẩu không trùng khớp");
      return;
    }

    if (!formData.agreeTerms) {
      setError("Bạn phải đồng ý với Điều khoản & Chính sách");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Đăng ký thất bại");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/auth/login?registered=true");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Lỗi khi đăng ký");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8">
            <h1 className="text-3xl font-bold text-white text-center">Đăng ký</h1>
            <p className="text-blue-100 text-center mt-2">Tạo tài khoản mới</p>
          </div>

          {/* Form */}
          <div className="p-8 space-y-5">
            {/* Success message */}
            {success && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-green-700 dark:text-green-400 text-center font-medium">
                  ✓ Đăng ký thành công! Đang chuyển hướng...
                </p>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-700 dark:text-red-400 text-sm font-medium">
                  ✕ {error}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Họ tên *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Nguyễn Văn A"
                  disabled={loading}
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="user@example.com"
                  disabled={loading}
                />
                {formData.email && (
                  <p
                    className={`text-xs mt-1 ${
                      isValidEmail(formData.email)
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {isValidEmail(formData.email) ? "✓ Email hợp lệ" : "✕ Email không hợp lệ"}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Số điện thoại *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="0912345678"
                  disabled={loading}
                />
                {formData.phone && (
                  <p
                    className={`text-xs mt-1 ${
                      isValidPhone(formData.phone)
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {isValidPhone(formData.phone)
                      ? "✓ Số điện thoại hợp lệ"
                      : "✕ Phải có 10-11 chữ số"}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mật khẩu *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="••••••••"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>

                {/* Password strength */}
                {formData.password && (
                  <div className="mt-2 space-y-2">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`flex-1 h-2 rounded ${
                            i < passwordStrength.score
                              ? passwordStrength.color
                              : "bg-gray-200 dark:bg-slate-700"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Độ mạnh: <span className={`font-medium ${
                        passwordStrength.score < 2 ? "text-red-600" : 
                        passwordStrength.score < 4 ? "text-yellow-600" :
                        "text-green-600"
                      }`}>{passwordStrength.label}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Xác nhận mật khẩu *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="••••••••"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
                {formData.confirmPassword && (
                  <p
                    className={`text-xs mt-1 ${
                      passwordsMatch
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {passwordsMatch ? "✓ Mật khẩu trùng khớp" : "✕ Mật khẩu không trùng khớp"}
                  </p>
                )}
              </div>

              {/* Terms & Conditions */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  className="mt-1 w-4 h-4 rounded border-gray-300 dark:border-slate-600 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
                <label className="text-sm text-gray-600 dark:text-gray-400">
                  Tôi đồng ý với{" "}
                  <Link href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
                    Điều khoản dịch vụ
                  </Link>{" "}
                  và{" "}
                  <Link href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
                    Chính sách bảo mật
                  </Link>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !formData.agreeTerms}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                {loading ? "Đang xử lý..." : "Đăng ký"}
              </button>
            </form>

            {/* Login link */}
            <div className="text-center pt-4 border-t border-gray-200 dark:border-slate-700">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Đã có tài khoản?{" "}
                <Link
                  href="/auth/login"
                  className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                >
                  Đăng nhập
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
