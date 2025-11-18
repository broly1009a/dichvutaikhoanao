import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';
import { verifyToken, getTokenFromCookies } from '@/lib/jwt';
import { verifyPassword, hashPassword, isStrongPassword } from '@/lib/auth';

// POST /api/auth/change-password - Đổi mật khẩu
export async function POST(request: NextRequest) {
  try {
    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json(
        { success: false, error: 'Database not available' },
        { status: 503 }
      );
    }

    // Lấy token từ header hoặc cookies
    let token = request.headers.get('authorization')?.replace('Bearer ', '');
    
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
    const { oldPassword, newPassword, confirmPassword } = body;

    // Validation
    if (!oldPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (!isStrongPassword(newPassword)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Password must be at least 8 characters with uppercase, lowercase, and numbers',
        },
        { status: 400 }
      );
    }

    // Kiểm tra password match
    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    // Lấy user từ database
    const user = await User.findById(payload.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Kiểm tra mật khẩu cũ
    const isOldPasswordValid = await verifyPassword(oldPassword, user.password);
    if (!isOldPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Old password is incorrect' },
        { status: 401 }
      );
    }

    // Hash mật khẩu mới
    const hashedNewPassword = await hashPassword(newPassword);

    // Cập nhật mật khẩu
    user.password = hashedNewPassword;
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to change password' },
      { status: 500 }
    );
  }
}
