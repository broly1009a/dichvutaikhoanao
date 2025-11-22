import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../jwt';
import User from '../models/User';
import { connectDB } from '../db';

// Function to get authenticated user from request
async function getAuthenticatedUser(request: NextRequest): Promise<{ user: any | null, error: NextResponse | null }> {
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
      return {
        user: null,
        error: NextResponse.json(
          {
            success: false,
            error: 'Unauthorized - No token provided',
          },
          { status: 401 }
        )
      };
    }

    // Verify JWT token
    const decoded = verifyToken(token);
    if (!decoded) {
      return {
        user: null,
        error: NextResponse.json(
          {
            success: false,
            error: 'Unauthorized - Invalid token',
          },
          { status: 401 }
        )
      };
    }

    // Fetch user from DB
    const user = await User.findById(decoded.userId);
    if (!user || user.status !== 'active') {
      return {
        user: null,
        error: NextResponse.json(
          {
            success: false,
            error: 'Unauthorized - User not found or inactive',
          },
          { status: 401 }
        )
      };
    }

    return { user, error: null };
  } catch (error) {
    console.error('Auth error:', error);
    return {
      user: null,
      error: NextResponse.json(
        {
          success: false,
          error: 'Unauthorized - Invalid token',
        },
        { status: 401 }
      )
    };
  }
}

// Middleware để verify JWT token
export async function authMiddleware(request: NextRequest) {
  const { user, error } = await getAuthenticatedUser(request);
  if (error) {
    return error;
  }

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
}

// Middleware để check admin role
export async function adminMiddleware(request: NextRequest) {
  const { user, error } = await getAuthenticatedUser(request);
  if (error) {
    return error;
  }

  if (user.role !== 'admin') {
    return NextResponse.json(
      {
        success: false,
        error: 'Forbidden - Admin access required',
      },
      { status: 403 }
    );
  }

  // Create new request with user info in headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', user._id.toString());
  requestHeaders.set('x-user-role', user.role);
  requestHeaders.set('x-user-email', user.email);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}
