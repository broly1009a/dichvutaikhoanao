import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';
// GET /api/user - Lấy danh sách người dùng (admin only)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const users = await User.find({}, {
      _id: 1,
      name: 1,
      email: 1,
      avatar: 1,
      role: 1,
      status: 1,
      balance: 1,
      phone: 1,
      fullName: 1,
      password: 1,
      totalPurchased: 1,
      totalSpent: 1,
      createdAt: 1,
      updatedAt: 1,
      lastLogin: 1
    });
    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch users' }, { status: 500 });
  }
}

// POST /api/user - Tạo mới người dùng (admin only)
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const user = new User(body);
    await user.save();
    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create user' }, { status: 500 });
  }
}
