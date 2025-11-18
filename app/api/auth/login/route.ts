import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';
import { verifyPassword, isValidEmail, sanitizeUser } from '@/lib/auth';
import { generateToken, setTokenCookie } from '@/lib/jwt';

// POST /api/auth/login - Đăng nhập
export async function POST(request: NextRequest) {
  try {
    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json(
        { success: false, error: 'Database not available' },
        { status: 503 }
      );
    }

    const body = await request.json();
    let { email, phone, password } = body;

    // Validation
    if (!password || (!email && !phone)) {
      return NextResponse.json(
        { success: false, error: 'Email/phone and password are required' },
        { status: 400 }
      );
    }

    // Tìm user bằng email hoặc phone
    const query = email
      ? { email: email.toLowerCase() }
      : { phone };

    const user = await User.findOne(query);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email/phone or password' },
        { status: 401 }
      );
    }

    // Kiểm tra status user
    if (user.status === 'blocked') {
      return NextResponse.json(
        { success: false, error: 'Your account has been blocked' },
        { status: 403 }
      );
    }

    if (user.status === 'pending') {
      return NextResponse.json(
        { success: false, error: 'Your account is pending verification' },
        { status: 403 }
      );
    }

    // Kiểm tra password
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid email/phone or password' },
        { status: 401 }
      );
    }

    // Cập nhật lastLogin
    user.lastLogin = new Date();
    await user.save();

    // Tạo JWT token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Lưu token vào cookies
    await setTokenCookie(token);

    const sanitizedUser = sanitizeUser(user);

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        user: sanitizedUser,
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    );
  }
}
