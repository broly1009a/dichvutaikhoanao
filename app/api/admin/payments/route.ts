import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Invoice from '@/lib/models/Invoice';
import User from '@/lib/models/User';
import { getTokenFromCookies } from '@/lib/auth';
import jwt from 'jsonwebtoken';

// GET /api/admin/payments - Lấy danh sách giao dịch
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
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    await connectDB();

    // Build query
    const query: any = {};
    if (status) {
      query.status = status;
    }

    // Get total count
    const total = await Invoice.countDocuments(query);

    // Get invoices with user info
    const invoices = await Invoice.find(query)
      .populate('userId', 'email username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Format data for frontend
    const transactions = invoices.map((invoice: any) => ({
      id: invoice._id,
      transactionId: invoice._id.toString().slice(-12).toUpperCase(),
      userName: invoice.userId?.username || invoice.userId?.email || 'Unknown',
      userEmail: invoice.userId?.email || 'Unknown',
      type: 'deposit', // All invoices are deposits
      amount: invoice.amount,
      bonus: invoice.bonus || 0,
      totalAmount: (invoice.amount || 0) + (invoice.bonus || 0),
      status: invoice.status, // pending, completed, failed
      time: new Date(invoice.createdAt).toLocaleString('vi-VN'),
      date: invoice.createdAt,
      description: invoice.description || '',
      orderCode: invoice.orderCode,
      uuid: invoice.uuid,
    }));

    // Calculate stats
    const [depositStats, completedStats] = await Promise.all([
      Invoice.aggregate([
        {
          $match: { status: 'completed' },
        },
        {
          $group: {
            _id: null,
            totalDeposit: { $sum: '$amount' },
            totalBonus: { $sum: '$bonus' },
            count: { $sum: 1 },
          },
        },
      ]),
      Invoice.countDocuments({ status: 'completed' }),
    ]);

    const pendingCount = await Invoice.countDocuments({ status: 'pending' });

    const stats = {
      totalDeposit: depositStats[0]?.totalDeposit || 0,
      totalBonus: depositStats[0]?.totalBonus || 0,
      totalWithdraw: 0, // No withdrawal in current system
      pendingCount,
      completedCount: completedStats,
    };

    return NextResponse.json({
      success: true,
      data: {
        transactions,
        stats,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get payments error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch payments data' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/payments - Cập nhật trạng thái giao dịch
export async function PATCH(request: NextRequest) {
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

    const body = await request.json();
    const { invoiceId, status } = body;

    if (!invoiceId || !status) {
      return NextResponse.json(
        { success: false, error: 'Missing invoiceId or status' },
        { status: 400 }
      );
    }

    await connectDB();

    // Validate status
    const validStatuses = ['pending', 'completed', 'failed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      );
    }

    const invoice = await Invoice.findByIdAndUpdate(
      invoiceId,
      {
        status,
        paymentDate: status === 'completed' ? new Date() : null,
      },
      { new: true }
    ).populate('userId', 'email username');

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Update user balance if completed
    if (status === 'completed') {
      await User.findByIdAndUpdate(invoice.userId, {
        $inc: {
          balance: invoice.amount,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Invoice status updated successfully',
      data: invoice,
    });
  } catch (error) {
    console.error('Update payment error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update payment status' },
      { status: 500 }
    );
  }
}
