import { NextRequest, NextResponse } from 'next/server';
import { clearTokenCookie } from '@/lib/jwt';

// POST /api/auth/logout - Đăng xuất
export async function POST(request: NextRequest) {
  try {
    // Xóa token từ cookies
    await clearTokenCookie();

    return NextResponse.json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Logout failed',
      },
      { status: 500 }
    );
  }
}
