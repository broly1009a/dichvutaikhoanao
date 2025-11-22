import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Category from '@/lib/models/Category';

// GET /api/categories - Lấy danh sách categories
export async function GET(request: NextRequest) {
  try {
    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json(
        { success: false, error: 'Database not available' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');
    const status = searchParams.get('status') || 'active';

    const query: any = {};
    if (platform) query.platform = platform;
    if (status) query.status = status;

    const categories = await Category.find(query)
      .sort({ displayOrder: 1 })
      .exec();

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get categories' },
      { status: 500 }
    );
  }
}
