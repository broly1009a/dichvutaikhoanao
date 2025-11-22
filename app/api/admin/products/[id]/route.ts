
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

// PUT /api/products/[id] - Cập nhật sản phẩm
export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  const params = await context.params;
  const conn = await connectDB();
  if (!conn) {
    return NextResponse.json({ success: false, error: 'Database not available' }, { status: 503 });
  }
  const body = await request.json();
  const product = await Product.findByIdAndUpdate(params.id, body, { new: true });
  if (!product) {
    return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, message: 'Product updated successfully', data: product });
}

// DELETE /api/products/[id] - Xóa sản phẩm
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  const params = await context.params;
  const conn = await connectDB();
  if (!conn) {
    return NextResponse.json({ success: false, error: 'Database not available' }, { status: 503 });
  }
  const product = await Product.findByIdAndDelete(params.id);
  if (!product) {
    return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, message: 'Product deleted successfully' });
}
