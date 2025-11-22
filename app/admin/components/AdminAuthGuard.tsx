"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/lib/context/AuthContext";
import { toast } from "sonner";

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

export function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const { user, isLoading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Chưa đăng nhập, chuyển về trang login
        toast.error("Vui lòng đăng nhập để truy cập trang quản trị");
        router.push("/auth/login");
        return;
      }

      if (user.role !== 'admin') {
        // Không phải admin, chuyển về trang chủ
        toast.error("Bạn không có quyền truy cập trang quản trị");
        router.push("/");
        return;
      }
    }
  }, [user, isLoading, router]);

  // Hiển thị loading khi đang check auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6 shadow-lg"></div>
          <p className="text-gray-600 dark:text-gray-400 text-xl font-medium">Đang kiểm tra quyền truy cập...</p>
          <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    );
  }

  // Nếu không phải admin, không render gì (sẽ redirect)
  if (!user || user.role !== 'admin') {
    return null;
  }

  return <>{children}</>;
}