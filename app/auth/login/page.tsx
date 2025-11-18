"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useAuthContext } from "@/lib/context/AuthContext";

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login } = useAuthContext();
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [rememberMe, setRememberMe] = useState(false);

    const [formData, setFormData] = useState({
        emailOrPhone: "",
        password: "",
    });

    // Only run on client - delay all interactive states
    useEffect(() => {
        setMounted(true);
        if (searchParams.get("registered") === "true") {
            setSuccessMsg("Đăng ký thành công! Vui lòng đăng nhập.");
            setSuccess(true);
            const timer = setTimeout(() => setSuccess(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [searchParams]);

    // Don't render interactive form until client is ready
    if (!mounted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8">
                            <h1 className="text-3xl font-bold text-white text-center">Đăng nhập</h1>
                            <p className="text-blue-100 text-center mt-2">Chào mừng trở lại</p>
                        </div>
                        <div className="p-8 flex items-center justify-center min-h-96">
                            <div className="text-center">
                                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-gray-600 dark:text-gray-400">Đang tải biểu mẫu...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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

        const input = formData.emailOrPhone.trim();

        if (!input) {
            setError("Vui lòng nhập email hoặc số điện thoại");
            return;
        }

        if (!formData.password) {
            setError("Vui lòng nhập mật khẩu");
            return;
        }

        // Detect email or phone
        const isEmail = /\S+@\S+\.\S+/.test(input);
        const isPhone = /^[0-9]{8,12}$/.test(input);

        if (!isEmail && !isPhone) {
            setError("Vui lòng nhập email hợp lệ hoặc số điện thoại đúng (8–12 số)");
            return;
        }

        try {
            setLoading(true);

            // Use AuthContext login
            await login(input, formData.password);

            setSuccess(true);
            setSuccessMsg("Đăng nhập thành công!");

            setTimeout(() => {
                router.push("/");
            }, 1500);
        } catch (err: any) {
            setError(err.message || "Lỗi khi đăng nhập");
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
                        <h1 className="text-3xl font-bold text-white text-center">Đăng nhập</h1>
                        <p className="text-blue-100 text-center mt-2">Chào mừng trở lại</p>
                    </div>

                    {/* Form */}
                    <div className="p-8 space-y-5">
                        {/* Success message */}
                        {success && (
                            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg animate-in">
                                <p className="text-green-700 dark:text-green-400 text-center font-medium">
                                    ✓ {successMsg}
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
                            {/* Email/Phone */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Email hoặc Số điện thoại *
                                </label>
                                <input
                                    type="text"
                                    name="emailOrPhone"
                                    value={formData.emailOrPhone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                    placeholder="user@example.com hoặc 0912345678"
                                    disabled={loading}
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Mật khẩu *
                                    </label>
                                    <Link
                                        href="/auth/forgot-password"
                                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                    >
                                        Quên mật khẩu?
                                    </Link>
                                </div>
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
                            </div>

                            {/* Remember Me */}
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    name="rememberMe"
                                    checked={rememberMe}
                                    onChange={handleChange}
                                    className="w-4 h-4 rounded border-gray-300 dark:border-slate-600 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                    disabled={loading}
                                />
                                <label className="text-sm text-gray-600 dark:text-gray-400">
                                    Ghi nhớ đăng nhập
                                </label>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 mt-6"
                            >
                                {loading ? "Đang xử lý..." : "Đăng nhập"}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="flex items-center gap-4 my-6">
                            <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />
                            <span className="text-gray-400 text-sm">hoặc</span>
                            <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />
                        </div>

                        {/* Social Login - Optional */}
                        <div className="space-y-3">
                            <button
                                type="button"
                                className="w-full py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition disabled:opacity-50"
                                disabled={loading}
                            >
                                <span className="flex items-center justify-center gap-2">
                                    <span>🔵 Google</span>
                                </span>
                            </button>
                            <button
                                type="button"
                                className="w-full py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition disabled:opacity-50"
                                disabled={loading}
                            >
                                <span className="flex items-center justify-center gap-2">
                                    <span>📱 Facebook</span>
                                </span>
                            </button>
                        </div>

                        {/* Register link */}
                        <div className="text-center pt-4 border-t border-gray-200 dark:border-slate-700">
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                Chưa có tài khoản?{" "}
                                <Link
                                    href="/auth/register"
                                    className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                                >
                                    Đăng ký ngay
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return <LoginContent />;
}
