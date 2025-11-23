import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware, adminMiddleware } from './lib/middleware/auth';

export const runtime = 'nodejs'; // Allow DB calls

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for non-API routes
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Skip auth for auth routes
  if (pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  // Skip auth for webhook routes (PayOS payment webhooks)
  if (pathname.startsWith('/api/webhooks')) {
    return NextResponse.next();
  }

  // Skip auth for public routes (products and categories)
  if (pathname.startsWith('/api/products') || pathname.startsWith('/api/categories')) {
    return NextResponse.next();
  }

  // Apply admin middleware for admin routes
  if (pathname.startsWith('/api/admin/')) {
    return adminMiddleware(request);
  }

  // Apply auth middleware for other API routes
  return authMiddleware(request);
}