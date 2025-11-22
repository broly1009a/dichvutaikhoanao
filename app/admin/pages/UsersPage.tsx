"use client";

import { useState } from "react";
import { useEffect } from "react";
import { users, User } from "../data/mockData";
import { PencilIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";

interface UsersPageProps {
  onOpenUserModal: (user?: User, onSuccess?: () => void) => void;
}

export function UsersPage({ onOpenUserModal }: UsersPageProps) {
  const [userList, setUserList] = useState<User[]>([]);

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/user");
      const data = await res.json();
      if (data.success) {
        setUserList(
          (data.data || []).map((u: any) => ({
            id: u._id,
            name: u.fullName || u.name || "",
            email: u.email,
            avatar: u.avatar,
            phone: u.phone,
            role: u.role,
            status: u.status,
            balance: u.balance,
            createdAt: u.createdAt,
            updatedAt: u.updatedAt,
            lastLogin: u.lastLogin,
            totalPurchased: u.totalPurchased,
            totalSpent: u.totalSpent,
          }))
        );
      }
    } catch (error) {
      toast.error("Lỗi khi tải danh sách người dùng");
    }
  };

  // Load users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (userId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) return;
    try {
      const res = await fetch(`/api/admin/user/${userId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Đã xóa người dùng thành công");
        fetchUsers();
      } else {
        toast.error(data.error || "Lỗi khi xóa người dùng");
      }
    } catch (error) {
      toast.error("Lỗi khi xóa người dùng");
    }
  } 

  const getRoleBadge = (role: string) => {
    const badges = {
      admin: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
      staff: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      user: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    };
    return badges[role as keyof typeof badges] || badges.user;
  };

  const getStatusBadge = (status: string) => {
    return status === "active"
      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-gray-900 dark:text-white">Quản lý người dùng</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Tổng số {userList.length} người dùng
          </p>
        </div>
        <button
          onClick={() => onOpenUserModal(undefined, fetchUsers)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all"
        >
          <PlusIcon className="w-5 h-5" />
          Thêm người dùng
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                  Người dùng
                </th>
                <th className="px-6 py-4 text-left text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                  Email
                </th>
                <th className="px-6 py-4 text-center text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                  Vai trò
                </th>
                <th className="px-6 py-4 text-center text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                  Trạng thái
                </th>
                <th className="px-6 py-4 text-center text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                  Số dư
                </th>
                <th className="px-6 py-4 text-left text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                  Ngày tạo
                </th>
                <th className="px-6 py-4 text-center text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {userList.map((user, index) => (
                <tr
                  key={user.id}
                  className={`hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors ${
                    index % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-gray-50/50 dark:bg-slate-800/50"
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full ring-2 ring-gray-200 dark:ring-slate-700"
                      />
                      <span className="text-gray-900 dark:text-white font-medium">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{user.email}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadge(user.role)}`}>
                      {user.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(user.status)}`}>
                      {user.status === "active" ? "Hoạt động" : "Bị cấm"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-gray-900 dark:text-white font-medium">
                    {user.balance.toLocaleString("vi-VN")} đ
                  </td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{user.createdAt}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onOpenUserModal(user, fetchUsers)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Chỉnh sửa"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Xóa"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
