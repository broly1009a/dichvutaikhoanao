import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';
import Order from '@/lib/models/Order';
import { verifyToken, getTokenFromCookies } from '@/lib/jwt';

// GET /api/admin/profile - Lấy thông tin profile admin
export async function GET(request: NextRequest) {
  try {
    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json(
        { success: false, error: 'Database not available' },
        { status: 503 }
      );
    }

    // Lấy token từ header hoặc cookies
    let token: string | null | undefined = request.headers
      .get('authorization')
      ?.replace('Bearer ', '');

    if (!token) {
      token = await getTokenFromCookies();
    }

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Xác thực token
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Lấy user từ database và kiểm tra role admin
    const user = await User.findById(payload.userId).select('-password');
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Access denied. Admin role required.' },
        { status: 403 }
      );
    }

    // Thống kê tổng quan cho admin
    const [
      totalUsers,
      totalOrders,
      pendingOrders,
      todayRevenue,
      totalRevenue
    ] = await Promise.all([
      User.countDocuments({ role: { $ne: 'admin' } }),
      Order.countDocuments(),
      Order.countDocuments({ status: 'pending' }),
      Order.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(new Date().setHours(0, 0, 0, 0))
            },
            status: { $in: ['completed', 'paid'] }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$totalAmount' }
          }
        }
      ]),
      Order.aggregate([
        {
          $match: {
            status: { $in: ['completed', 'paid'] }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$totalAmount' }
          }
        }
      ])
    ]);

    const todayRevenueAmount = todayRevenue[0]?.total || 0;
    const totalRevenueAmount = totalRevenue[0]?.total || 0;

    return NextResponse.json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
        permissions: user.permissions || ['users.manage', 'orders.manage', 'products.manage', 'settings.manage'],
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        stats: {
          totalUsers,
          totalOrders,
          totalRevenue: totalRevenueAmount,
          pendingOrders,
          todayRevenue: todayRevenueAmount,
          activeUsers: Math.floor(totalUsers * 0.7), // Mock active users (70% of total)
        }
      },
    });
  } catch (error) {
    console.error('Get admin profile error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get admin profile' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/profile - Cập nhật profile admin
export async function PUT(request: NextRequest) {
  try {
    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json(
        { success: false, error: 'Database not available' },
        { status: 503 }
      );
    }

    // Lấy token từ header hoặc cookies
    let token: string | null | undefined = request.headers
      .get('authorization')
      ?.replace('Bearer ', '');

    if (!token) {
      token = await getTokenFromCookies();
    }

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Xác thực token
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { fullName, phone, email } = body;

    // Validation
    if (!fullName || !phone || !email) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate phone format (Vietnam phone number)
    const phoneRegex = /^(\+84|84|0)[3|5|7|8|9][0-9]{8}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { success: false, error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Lấy user từ database và kiểm tra role admin
    const user = await User.findById(payload.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Access denied. Admin role required.' },
        { status: 403 }
      );
    }

    // Cập nhật thông tin
    user.fullName = fullName;
    user.phone = phone;
    user.email = email;
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Admin profile updated successfully',
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
        permissions: user.permissions || ['users.manage', 'orders.manage', 'products.manage', 'settings.manage'],
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    console.error('Update admin profile error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update admin profile' },
      { status: 500 }
    );
  }
}