import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Invoice from '@/lib/models/Invoice';
import User from '@/lib/models/User';
import Order from '@/lib/models/Order';
import { getTokenFromCookies } from '@/lib/auth';
import jwt from 'jsonwebtoken';

// GET /api/admin/reports - Lấy dữ liệu báo cáo
export async function GET(request: NextRequest) {
  try {
    // Verify admin token
    const token = getTokenFromCookies(request);
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    try {
      jwt.verify(token, process.env.JWT_SECRET || 'secret');
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get('month') || String(new Date().getMonth() + 1));
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()));

    await connectDB();

    // Get date range for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    // Get monthly revenue data for chart (all months of selected year)
    const monthlyData = [];
    for (let m = 1; m <= 12; m++) {
      const mStart = new Date(year, m - 1, 1);
      const mEnd = new Date(year, m, 1);
      
      const revenue = await Invoice.aggregate([
        {
          $match: {
            status: 'completed',
            createdAt: { $gte: mStart, $lt: mEnd },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
          },
        },
      ]);

      monthlyData.push({
        month: `T${m}`,
        revenue: revenue[0]?.total || 0,
      });
    }

    // Get transaction types data
    const transactionTypes = await Invoice.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const colors = {
      completed: '#10b981',
      pending: '#f59e0b',
      failed: '#ef4444',
      expired: '#6b7280',
    };

    const transactionsByType = transactionTypes.map((t: any) => ({
      name: t._id.charAt(0).toUpperCase() + t._id.slice(1),
      value: t.count,
      color: colors[t._id as keyof typeof colors] || '#6b7280',
    }));

    // Get top users by balance
    const topUsers = await User.find()
      .sort({ balance: -1 })
      .limit(10)
      .select('_id email username balance role createdAt totalSpent totalPurchased')
      .lean();

    const formattedTopUsers = topUsers.map((user: any, index: number) => ({
      id: user._id,
      rank: index + 1,
      email: user.email,
      username: user.username,
      balance: user.balance,
      role: user.role || 'user',
      totalSpent: user.totalSpent || 0,
      totalPurchased: user.totalPurchased || 0,
      createdAt: user.createdAt,
    }));

    // Get monthly statistics
    const currentMonthInvoices = await Invoice.find({
      createdAt: { $gte: startDate, $lt: endDate },
    });

    const completedCount = currentMonthInvoices.filter((inv: any) => inv.status === 'completed').length;
    const pendingCount = currentMonthInvoices.filter((inv: any) => inv.status === 'pending').length;
    const failedCount = currentMonthInvoices.filter((inv: any) => inv.status === 'failed').length;

    const totalRevenue = currentMonthInvoices
      .filter((inv: any) => inv.status === 'completed')
      .reduce((sum: number, inv: any) => sum + (inv.amount || 0), 0);

    const totalBonus = currentMonthInvoices
      .filter((inv: any) => inv.status === 'completed')
      .reduce((sum: number, inv: any) => sum + (inv.bonus || 0), 0);

    return NextResponse.json({
      success: true,
      data: {
        monthlyRevenue: monthlyData,
        transactionsByType,
        topUsers: formattedTopUsers,
        monthlyStats: {
          month,
          year,
          total: currentMonthInvoices.length,
          completed: completedCount,
          pending: pendingCount,
          failed: failedCount,
          totalRevenue: Math.floor(totalRevenue),
          totalBonus: Math.floor(totalBonus),
        },
      },
    });
  } catch (error) {
    console.error('Get reports error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reports data' },
      { status: 500 }
    );
  }
}
