import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';
import { verifyToken, getTokenFromCookies } from '@/lib/jwt';
import { sanitizeUser } from '@/lib/auth';

// GET /api/auth/me - Lấy thông tin user hiện tại
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

    // Lấy user từ database
    const user = await User.findById(payload.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Kiểm tra status
    if (user.status === 'blocked') {
      return NextResponse.json(
        { success: false, error: 'Your account has been blocked' },
        { status: 403 }
      );
    }

    const sanitizedUser = sanitizeUser(user);

    return NextResponse.json({
      success: true,
      data: sanitizedUser,
    });
  } catch (error) {
    console.error('Get me error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get user info' },
      { status: 500 }
    );
  }
}
