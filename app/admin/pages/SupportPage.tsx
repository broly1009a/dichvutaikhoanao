"use client";

import { useState, useEffect } from "react";
import { ChatBubbleLeftRightIcon, EyeIcon, ClockIcon, CheckCircleIcon, XCircleIcon, XMarkIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { toast } from "sonner";

interface SupportTicket {
  id: string;
  ticketId: string;
  user: {
    username: string;
    email: string;
  };
  subject: string;
  category: string;
  priority: string;
  status: string;
  assignedTo?: {
    username: string;
    email: string;
  };
  messageCount: number;
  lastMessage?: {
    message: string;
    createdAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface SupportModalProps {
  ticket: SupportTicket;
  isOpen: boolean;
  onClose: () => void;
  onReply: () => void;
}

function SupportModal({ ticket, isOpen, onClose, onReply }: SupportModalProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [updating, setUpdating] = useState(false);
  const [ticketData, setTicketData] = useState(ticket);

  useEffect(() => {
    if (isOpen && ticket) {
      setTicketData(ticket);
      fetchTicketDetails();
    }
  }, [isOpen, ticket]);

  const fetchTicketDetails = async () => {
    try {
      const res = await fetch(`/api/admin/support/${ticket.id}`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.data.messages || []);
      }
    } catch (error) {
      toast.error("Lỗi khi tải chi tiết ticket");
    }
  };

  const handleUpdateTicket = async (updates: { status?: string; priority?: string }) => {
    setUpdating(true);
    try {
      const res = await fetch('/api/admin/support', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticketIds: [ticket.id],
          ...updates,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Đã cập nhật ticket');
        setTicketData({ ...ticketData, ...updates });
        onReply(); // Refresh list
      } else {
        toast.error(data.error || 'Lỗi khi cập nhật');
      }
    } catch (error) {
      toast.error('Lỗi khi cập nhật ticket');
    } finally {
      setUpdating(false);
    }
  };

  const handleReply = async () => {
    if (!replyMessage.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/support/${ticket.id}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: replyMessage }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Đã gửi reply thành công");
        setReplyMessage("");
        fetchTicketDetails();
        onReply();
      } else {
        toast.error(data.error || "Lỗi khi gửi reply");
      }
    } catch (error) {
      toast.error("Lỗi khi gửi reply");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
          <div>
            <h3 className="text-gray-900 dark:text-white font-semibold">
              Ticket #{ticket.ticketId}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {ticket.subject}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col h-[calc(90vh-120px)]">
          {/* Ticket Info */}
          <div className="p-6 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">User:</span>
                <p className="font-medium text-gray-900 dark:text-white">{ticketData.user.username}</p>
                <p className="text-gray-500 dark:text-gray-400">{ticketData.user.email}</p>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Category:</span>
                <p className="font-medium text-gray-900 dark:text-white">{ticketData.category}</p>
              </div>
              <div>
                <label className="block text-gray-600 dark:text-gray-400 mb-1">Priority:</label>
                <select
                  value={ticketData.priority}
                  onChange={(e) => handleUpdateTicket({ priority: e.target.value })}
                  disabled={updating}
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="low">Thấp</option>
                  <option value="medium">Trung bình</option>
                  <option value="high">Cao</option>
                  <option value="urgent">Khẩn cấp</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-600 dark:text-gray-400 mb-1">Status:</label>
                <select
                  value={ticketData.status}
                  onChange={(e) => handleUpdateTicket({ status: e.target.value })}
                  disabled={updating}
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="open">Mở</option>
                  <option value="in_progress">Đang xử lý</option>
                  <option value="resolved">Đã giải quyết</option>
                  <option value="closed">Đã đóng</option>
                </select>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.senderType === 'admin' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] p-4 rounded-lg ${
                    message.senderType === 'admin'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-gray-100'
                  }`}
                >
                  <p className="text-sm">{message.message}</p>
                  <p className={`text-xs mt-2 ${
                    message.senderType === 'admin' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {new Date(message.createdAt).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Reply Form */}
          <div className="p-6 border-t border-gray-200 dark:border-slate-700">
            <div className="flex gap-3">
              <textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Nhập tin nhắn reply..."
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
              />
              <button
                onClick={handleReply}
                disabled={loading || !replyMessage.trim()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <PaperAirplaneIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getPriorityBadge(priority: string) {
  const badges = {
    low: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    medium: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    high: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    urgent: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };
  return badges[priority as keyof typeof badges] || badges.medium;
}

function getStatusBadge(status: string) {
  const badges = {
    open: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    in_progress: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    resolved: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    closed: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  };
  return badges[status as keyof typeof badges] || badges.open;
}

export function SupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    open: 0,
    in_progress: 0,
    resolved: 0,
    closed: 0,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
  });

  // Fetch support tickets
  const fetchTickets = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      
      const res = await fetch(`/api/admin/support?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setTickets(data.data.tickets);
        setStats(data.data.stats);
      } else {
        toast.error("Lỗi khi tải danh sách ticket");
      }
    } catch (error) {
      toast.error("Lỗi khi tải danh sách ticket");
    } finally {
      setLoading(false);
    }
  };

  const handleViewTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTicket(null);
  };

  useEffect(() => {
    fetchTickets();
  }, [filters]);

  const getStatusBadge = (status: string) => {
    const badges = {
      open: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
      in_progress: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      resolved: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      closed: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    };
    return badges[status as keyof typeof badges] || badges.open;
  };

  const getPriorityBadge = (priority: string) => {
    const badges = {
      low: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
      medium: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      high: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
      urgent: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    };
    return badges[priority as keyof typeof badges] || badges.medium;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-gray-900 dark:text-white">Quản lý Support</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Tổng số {tickets.length} ticket
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <ClockIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Mở</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.open}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <ChatBubbleLeftRightIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Đang xử lý</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.in_progress}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Đã giải quyết</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.resolved}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <XCircleIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Đã đóng</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.closed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-gray-200 dark:border-slate-700 overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
          <div className="flex gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tất cả</option>
                <option value="open">Mở</option>
                <option value="in_progress">Đang xử lý</option>
                <option value="resolved">Đã giải quyết</option>
                <option value="closed">Đã đóng</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Priority
              </label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tất cả</option>
                <option value="low">Thấp</option>
                <option value="medium">Trung bình</option>
                <option value="high">Cao</option>
                <option value="urgent">Khẩn cấp</option>
              </select>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                  Ticket ID
                </th>
                <th className="px-6 py-4 text-left text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                  Subject
                </th>
                <th className="px-6 py-4 text-center text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                  Priority
                </th>
                <th className="px-6 py-4 text-center text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                  Status
                </th>
                <th className="px-6 py-4 text-center text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                  Messages
                </th>
                <th className="px-6 py-4 text-left text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                  Created
                </th>
                <th className="px-6 py-4 text-center text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wider font-bold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {tickets.map((ticket, index) => (
                <tr
                  key={ticket.id}
                  className={`hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors ${
                    index % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-gray-50/50 dark:bg-slate-800/50"
                  }`}
                >
                  <td className="px-6 py-4 text-gray-900 dark:text-white font-mono text-sm">
                    {ticket.ticketId}
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-gray-900 dark:text-white font-medium">{ticket.user.username}</p>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">{ticket.user.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                    {ticket.subject}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityBadge(ticket.priority)}`}>
                      {ticket.priority.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(ticket.status)}`}>
                      {ticket.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-gray-900 dark:text-white font-medium">
                    {ticket.messageCount}
                  </td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300 text-sm">
                    {new Date(ticket.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleViewTicket(ticket)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Xem chi tiết"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Support Modal */}
      {isModalOpen && selectedTicket && (
        <SupportModal
          ticket={selectedTicket}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onReply={() => {
            fetchTickets(); // Refresh list after reply
          }}
        />
      )}
    </div>
  );
}