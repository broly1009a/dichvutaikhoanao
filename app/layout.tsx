import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/lib/context/AuthContext";
import "./index.css";
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "HH-SHOPEE - Bán Tài Khoản Ảo",
  description: "Dịch vụ bán tài khoản ảo cho nhiều nền tảng: TikTok, Shopee, Lazada, Gmail, Hotmail",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${inter.variable} antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
