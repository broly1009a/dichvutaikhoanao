import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../jwt';
import User from '../models/User';
import { connectDB } from '../db';

// Middleware để verify JWT token
export async function authMiddleware(request: NextRequest) {
  try {
    // Connect to DB
    await connectDB();

    // Get token from Authorization header or cookie
    const authHeader = request.headers.get('authorization');
    let token = authHeader?.replace('Bearer ', '');

    if (!token) {
      // Try to get from cookies
      const cookieHeader = request.headers.get('cookie');
      if (cookieHeader) {
        const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=');
          if (key && value) {
            acc[key] = decodeURIComponent(value);
          }
          return acc;
        }, {} as Record<string, string>);
        token = cookies['auth_token'] || cookies['token'];
      }
    }

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized - No token provided',
        },
        { status: 401 }
      );
    }

    // Verify JWT token
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized - Invalid token',
        },
        { status: 401 }
      );
    }

    // Fetch user from DB
    const user = await User.findById(decoded.userId);
    if (!user || user.status !== 'active') {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized - User not found or inactive',
        },
        { status: 401 }
      );
    }

    // TODO: Check if token is blacklisted (implement later)

    // Create new request with user info in headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', user._id.toString());
    requestHeaders.set('x-user-role', user.role);
    requestHeaders.set('x-user-email', user.email);

    // Return NextResponse.next() with modified headers
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error('Auth middleware error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Unauthorized - Invalid token',
      },
      { status: 401 }
    );
  }
}

// Middleware để check admin role
export async function adminMiddleware(request: NextRequest) {
  try {
    // First apply auth middleware
    const authResult = await authMiddleware(request);
    if (authResult && authResult.status !== 200) {
      return authResult;
    }

    // Get user role from headers (set by authMiddleware)
    const userRole = request.headers.get('x-user-role');
    if (userRole !== 'admin') {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden - Admin access required',
        },
        { status: 403 }
      );
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Forbidden - Admin access required',
      },
      { status: 403 }
    );
  }
}
