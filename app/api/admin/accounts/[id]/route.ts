import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Account from '@/lib/models/Account';
import Order from '@/lib/models/Order';

// GET /api/accounts/[id] - Lấy chi tiết account (chỉ sau khi mua)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json(
        { success: false, error: 'Database not available' },
        { status: 503 }
      );
    }

    const accountId = id;
    const userId = request.headers.get('x-user-id'); // Lấy từ header

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const account = await Account.findById(accountId);
    if (!account) {
      return NextResponse.json(
        { success: false, error: 'Account not found' },
        { status: 404 }
      );
    }

    // Kiểm tra user đã mua account này chưa
    const order = await Order.findOne({
      accountId: account._id.toString(),
      userId,
      status: 'completed',
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'You do not own this account' },
        { status: 403 }
      );
    }

    // Trả account có password
    return NextResponse.json({
      success: true,
      data: account,
    });
  } catch (error) {
    console.error('Get account error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get account' },
      { status: 500 }
    );
  }
}
