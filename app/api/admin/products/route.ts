
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Product from '@/lib/models/Product';

// GET /api/products - Lấy danh sách sản phẩm từ MongoDB
export async function GET(request: Request) {
  const conn = await connectDB();
  if (!conn) {
    return NextResponse.json({ success: false, error: 'Database not available' }, { status: 503 });
  }
  const { searchParams } = new URL(request.url);
  const platform = searchParams.get('platform');
  const category = searchParams.get('category');
  const status = searchParams.get('status');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');

  const query: any = {};
  if (platform) query.platform = platform;
  if (category) query.category = category; // category phải là ObjectId, nhưng nếu truyền từ client là string thì vẫn đúng
  if (status) query.status = status;

  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .skip((page - 1) * limit)
    .limit(limit);

  return NextResponse.json({
    success: true,
    data: products,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
}

// POST /api/products - Tạo sản phẩm mới
export async function POST(request: Request) {
  const conn = await connectDB();
  if (!conn) {
    return NextResponse.json({ success: false, error: 'Database not available' }, { status: 503 });
  }
  const body = await request.json();
  const requiredFields = [
    'platform',
    'category',
    'title',
    'description',
    'price',
  ];
  for (const field of requiredFields) {
    if (!body[field]) {
      return NextResponse.json({ success: false, error: `Missing required field: ${field}` }, { status: 400 });
    }
  }
  const product = await Product.create(body);
  return NextResponse.json({ success: true, message: 'Product created successfully', data: product }, { status: 201 });
}
