import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';
import {
  hashPassword,
  isValidEmail,
  isValidPhone,
  isStrongPassword,
  sanitizeUser,
} from '@/lib/auth';
import { generateToken, setTokenCookie } from '@/lib/jwt';

// POST /api/auth/register - Đăng ký tài khoản mới
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
    const { email, phone, fullName, password, confirmPassword } = body;

    // Validation
    if (!email || !phone || !fullName || !password) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate phone format
    if (!isValidPhone(phone)) {
      return NextResponse.json(
        { success: false, error: 'Invalid phone format (Vietnam only)' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (!isStrongPassword(password)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Password must be at least 8 characters with uppercase, lowercase, and numbers',
        },
        { status: 400 }
      );
    }

    // Kiểm tra password match
    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    // Kiểm tra user đã tồn tại
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { phone }],
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: existingUser.email === email.toLowerCase() ? 'Email already registered' : 'Phone already registered',
        },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Tạo user mới
    const user = await User.create({
      email: email.toLowerCase(),
      phone,
      fullName,
      password: hashedPassword,
      role: 'customer',
      status: 'active',
      balance: 0,
    });

    // Tạo JWT token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Lưu token vào cookies
    await setTokenCookie(token);

    const sanitizedUser = sanitizeUser(user);

    return NextResponse.json(
      {
        success: true,
        message: 'Registration successful',
        data: {
          user: sanitizedUser,
          token,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { success: false, error: 'Registration failed' },
      { status: 500 }
    );
  }
}
