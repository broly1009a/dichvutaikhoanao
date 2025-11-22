import type { Metadata } from "next";
import { AdminAuthGuard } from "./components/AdminAuthGuard";

export const metadata: Metadata = {
  title: "Admin Dashboard - HH-SHOPEE",
  description: "Bảng điều khiển quản trị hệ thống bán tài khoản ảo",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
        {children}
      </div>
    </AdminAuthGuard>
  );
}
