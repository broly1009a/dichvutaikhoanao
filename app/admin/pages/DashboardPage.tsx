"use client";

import { useState, useEffect } from "react";
import { StatCard } from "../components/StatCard";
import {
  UsersIcon,
  ClipboardDocumentListIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
} from "@heroicons/react/24/outline";

interface DashboardData {
  stats: {
    totalUsers: number;
    totalOrders: number;
    totalDeposited: number;
    totalBonus: number;
    userGrowth: number;
    orderGrowth: number;
    depositGrowth: number;
  };
  invoices: {
    total: number;
    completed: number;
    pending: number;
    failed: number;
    completionRate: number;
  };
  webhooks: number;
  recentOrders: any[];
  recentInvoices: any[];
  systemStatus: {
    server: string;
    database: string;
    apiResponse: string;
    uptime: number;
  };
}

export function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/dashboard', {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const result = await response.json();
        setDashboardData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-200 dark:bg-slate-700 rounded-2xl h-32 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-600 dark:text-red-400">Error: {error || 'No data'}</p>
      </div>
    );
  }

  const { stats, invoices, recentOrders, recentInvoices, systemStatus } = dashboardData;

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<UsersIcon className="w-7 h-7 text-blue-600" />}
          title="Tổng số người dùng"
          value={stats.totalUsers.toLocaleString('vi-VN')}
          subtitle={`+${stats.userGrowth}% so với tháng trước`}
          color="text-blue-600"
          bgColor="bg-blue-50 dark:bg-blue-900/20"
        />
        <StatCard
          icon={<ClipboardDocumentListIcon className="w-7 h-7 text-green-600" />}
          title="Tổng đơn hàng"
          value={stats.totalOrders.toLocaleString('vi-VN')}
          subtitle={`+${stats.orderGrowth}% so với tháng trước`}
          color="text-green-600"
          bgColor="bg-green-50 dark:bg-green-900/20"
        />
        <StatCard
          icon={<ArrowDownTrayIcon className="w-7 h-7 text-purple-600" />}
          title="Tổng tiền nạp"
          value={`${Math.floor(stats.totalDeposited / 1000000)} Tr`}
          subtitle={`+${stats.depositGrowth}% so với tháng trước`}
          color="text-purple-600"
          bgColor="bg-purple-50 dark:bg-purple-900/20"
        />
        <StatCard
          icon={<ArrowUpTrayIcon className="w-7 h-7 text-orange-600" />}
          title="Hoàn thành thanh toán"
          value={`${invoices.completionRate}%`}
          subtitle={`${invoices.completed} / ${invoices.total} hóa đơn`}
          color="text-orange-600"
          bgColor="bg-orange-50 dark:bg-orange-900/20"
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-gray-200 dark:border-slate-700 p-6">
          <h3 className="text-gray-900 dark:text-white mb-4 font-semibold">Hóa đơn gần đây</h3>
          <div className="space-y-3">
            {recentInvoices.slice(0, 5).map((invoice: any) => (
              <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`w-2 h-2 rounded-full ${
                    invoice.status === 'completed' ? 'bg-green-600' :
                    invoice.status === 'pending' ? 'bg-yellow-600' :
                    'bg-red-600'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{invoice.user}</p>
                    <p className="text-xs text-gray-500">{invoice.amount.toLocaleString('vi-VN')} VNĐ</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">{new Date(invoice.date).toLocaleDateString('vi-VN')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-gray-200 dark:border-slate-700 p-6">
          <h3 className="text-gray-900 dark:text-white mb-4 font-semibold">Trạng thái hệ thống</h3>
          <div className="space-y-4">
            {[
              { label: "Server Status", value: systemStatus.server, percent: 100 },
              { label: "Database", value: systemStatus.database, percent: 98 },
              { label: "API Response", value: systemStatus.apiResponse, percent: 95 },
              { label: "Uptime", value: `${systemStatus.uptime}%`, percent: systemStatus.uptime },
            ].map((status, index) => {
              const isHealthy = status.percent >= 95;
              return (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{status.label}</span>
                    <span className={`text-sm font-medium ${isHealthy ? 'text-green-600' : 'text-yellow-600'}`}>
                      {status.value}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${isHealthy ? 'bg-green-600' : 'bg-yellow-600'}`}
                      style={{ width: `${status.percent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Invoice Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-4">
          <p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Tổng hóa đơn</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{invoices.total}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-4">
          <p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Hoàn thành</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{invoices.completed}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-4">
          <p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Đang chờ</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{invoices.pending}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-4">
          <p className="text-xs text-gray-600 dark:text-gray-400 uppercase">Thất bại</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{invoices.failed}</p>
        </div>
      </div>
    </div>
  );
}
