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

// POST /api/categories - Tạo category mới
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

    const { name, slug, platform, description, icon, image, displayOrder } = body;

    // Validation
    if (!name || !slug || !platform) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Kiểm tra category đã tồn tại (chỉ kiểm tra slug)
    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
      return NextResponse.json(
        { success: false, error: 'Category already exists' },
        { status: 400 }
      );
    }

    // Tạo category mới
    const category = await Category.create({
      name,
      slug: slug.toLowerCase(),
      platform,
      description,
      icon,
      image,
      displayOrder: displayOrder || 0,
      status: 'active',
      productCount: 0,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Category created successfully',
        data: category,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create category error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
