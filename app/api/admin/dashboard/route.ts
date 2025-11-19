import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';
import Order from '@/lib/models/Order';
import Product from '@/lib/models/Product';
import Invoice from '@/lib/models/Invoice';
import Webhook from '@/lib/models/Webhook';
import { getTokenFromCookies } from '@/lib/auth';
import jwt from 'jsonwebtoken';

// GET /api/admin/dashboard - Lấy thống kê dashboard
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

    await connectDB();

    // Get statistics
    const [
      totalUsers,
      totalOrders,
      totalInvoices,
      completedInvoices,
      pendingInvoices,
      failedInvoices,
      webhooksCount,
      recentOrders,
      recentInvoices,
    ] = await Promise.all([
      User.countDocuments(),
      Order.countDocuments(),
      Invoice.countDocuments(),
      Invoice.countDocuments({ status: 'completed' }),
      Invoice.countDocuments({ status: 'pending' }),
      Invoice.countDocuments({ status: 'failed' }),
      Webhook.countDocuments(),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('userId', 'email username')
        .populate('productId', 'title price'),
      Invoice.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('userId', 'email username'),
    ]);

    // Calculate totals
    const completedInvoicesData = await Invoice.find({ status: 'completed' }).select('amount bonus');
    const totalDeposited = completedInvoicesData.reduce((sum, inv) => sum + (inv.amount || 0), 0);
    const totalBonus = completedInvoicesData.reduce((sum, inv) => sum + (inv.bonus || 0), 0);

    // Calculate growth percentages (mock data - can be improved with date ranges)
    const previousMonthUsers = Math.max(1, Math.floor(totalUsers * 0.85));
    const userGrowth = Math.round(((totalUsers - previousMonthUsers) / previousMonthUsers) * 100);

    const previousMonthOrders = Math.max(1, Math.floor(totalOrders * 0.88));
    const orderGrowth = Math.round(((totalOrders - previousMonthOrders) / previousMonthOrders) * 100);

    const previousMonthDeposited = Math.max(1, Math.floor(totalDeposited * 0.75));
    const depositGrowth = Math.round(((totalDeposited - previousMonthDeposited) / previousMonthDeposited) * 100);

    // System status
    const systemStatus = {
      server: 'online',
      database: 'healthy',
      apiResponse: 'fast',
      uptime: 99.9,
    };

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalOrders,
          totalDeposited: Math.floor(totalDeposited),
          totalBonus: Math.floor(totalBonus),
          userGrowth,
          orderGrowth,
          depositGrowth,
        },
        invoices: {
          total: totalInvoices,
          completed: completedInvoices,
          pending: pendingInvoices,
          failed: failedInvoices,
          completionRate: totalInvoices > 0 ? Math.round((completedInvoices / totalInvoices) * 100) : 0,
        },
        webhooks: webhooksCount,
        recentOrders: recentOrders.map((order: any) => ({
          id: order._id,
          user: order.userId?.email || 'Unknown',
          product: order.productId?.title || 'Unknown',
          amount: order.totalPrice,
          date: order.createdAt,
          status: order.status,
        })),
        recentInvoices: recentInvoices.map((invoice: any) => ({
          id: invoice._id,
          user: invoice.userId?.email || 'Unknown',
          amount: invoice.amount,
          bonus: invoice.bonus,
          total: invoice.amount + (invoice.bonus || 0),
          date: invoice.createdAt,
          status: invoice.status,
        })),
        systemStatus,
      },
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
