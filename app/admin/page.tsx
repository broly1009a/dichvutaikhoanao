"use client";

import { useState } from "react";
import { AdminSidebar } from "./components/AdminSidebar";
import { AdminNavbar } from "./components/AdminNavbar";
import { DashboardPage } from "./pages/DashboardPage";
import { UsersPage } from "./pages/UsersPage";
import { BookingsPage } from "./pages/BookingsPage";
import { PaymentsPage } from "./pages/PaymentsPage";
import { ReportsPage } from "./pages/ReportsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { ProvidersPage } from "./pages/ProvidersPage";
import { CategoriesPage } from "./pages/CategoriesPage";
import { ProductsPage } from "./pages/ProductsPage";
import { UserModal } from "./components/UserModal";
import { TransactionModal } from "./components/TransactionModal";
import { User, Transaction } from "./data/mockData";
import { Toaster } from "../components/ui/sonner";

export default function AdminPage() {
  const [activePage, setActivePage] = useState("dashboard");
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const handleOpenUserModal = (user?: User) => {
    setSelectedUser(user);
    setIsUserModalOpen(true);
  };

  const handleCloseUserModal = () => {
    setIsUserModalOpen(false);
    setSelectedUser(undefined);
  };

  const handleOpenTransactionModal = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsTransactionModalOpen(true);
  };

  const handleCloseTransactionModal = () => {
    setIsTransactionModalOpen(false);
    setSelectedTransaction(null);
  };

  const getPageTitle = () => {
    const titles: Record<string, string> = {
      dashboard: "Dashboard",
      users: "Quản lý người dùng",
      products: "Quản lý sản phẩm",
      bookings: "Quản lý đơn đặt lịch",
      payments: "Quản lý giao dịch",
      providers: "Quản lý Providers",
      categories: "Quản lý Categories",
      services: "Quản lý dịch vụ",
      promotions: "Quản lý khuyến mãi",
      reports: "Báo cáo & Thống kê",
      settings: "Cấu hình hệ thống",
    };
    return titles[activePage] || "Dashboard";
  };

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <DashboardPage />;
      case "users":
        return <UsersPage onOpenUserModal={handleOpenUserModal} />;
      case "products":
        return <ProductsPage />;
      case "bookings":
        return <BookingsPage />;
      case "payments":
        return <PaymentsPage onOpenTransactionModal={handleOpenTransactionModal} />;
      case "providers":
        return <ProvidersPage />;
      case "categories":
        return <CategoriesPage />;
      case "reports":
        return <ReportsPage />;
      case "settings":
        return <SettingsPage />;
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-500 dark:text-gray-400">Trang đang được phát triển</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-950">
      {/* Sidebar */}
      <AdminSidebar activePage={activePage} onNavigate={setActivePage} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden ml-64">
        {/* Navbar */}
        <AdminNavbar title={getPageTitle()} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {renderPage()}
        </main>
      </div>

      {/* Modals */}
      <UserModal
        isOpen={isUserModalOpen}
        onClose={handleCloseUserModal}
        user={selectedUser}
      />

      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={handleCloseTransactionModal}
        transaction={selectedTransaction}
      />

      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
}
