import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication - HH Shopee",
  description: "Đăng nhập hoặc đăng ký tài khoản",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-50 dark:bg-slate-950">
      {children}
    </div>
  );
}
