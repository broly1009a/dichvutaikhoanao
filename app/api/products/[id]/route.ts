
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Product from '@/lib/models/Product';



// GET /api/products/[id] - Lấy chi tiết sản phẩm từ MongoDB
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  const params = await context.params;
  const conn = await connectDB();
  if (!conn) {
    return NextResponse.json({ success: false, error: 'Database not available' }, { status: 503 });
  }
  const product = await Product.findById(params.id);
  if (!product) {
    return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, data: product });
}

