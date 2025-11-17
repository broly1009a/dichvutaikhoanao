
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Product from '@/lib/models/Product';



// GET /api/products/[id] - Lấy chi tiết sản phẩm từ MongoDB
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }): Promise<Response> {
  const params = await context.params;
  await connectDB();
  const product = await Product.findOne({ id: params.id });
  if (!product) {
    return new Response(JSON.stringify({ success: false, error: 'Product not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return new Response(JSON.stringify({ success: true, data: product }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

// PUT /api/products/[id] - Cập nhật sản phẩm
export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }): Promise<Response> {
  const params = await context.params;
  await connectDB();
  const body = await request.json();
  const product = await Product.findOneAndUpdate({ id: params.id }, body, { new: true });
  if (!product) {
    return new Response(JSON.stringify({ success: false, error: 'Product not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return new Response(JSON.stringify({ success: true, message: 'Product updated successfully', data: product }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

// DELETE /api/products/[id] - Xóa sản phẩm
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }): Promise<Response> {
  const params = await context.params;
  await connectDB();
  const product = await Product.findOneAndDelete({ id: params.id });
  if (!product) {
    return new Response(JSON.stringify({ success: false, error: 'Product not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return new Response(JSON.stringify({ success: true, message: 'Product deleted successfully' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
