import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Product from '@/lib/models/Product';

export async function GET() {
  await connectDB();
  const products = await Product.find();
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();
  const product = await Product.create(body);
  return NextResponse.json(product);
}

export async function PUT(req: Request) {
  await connectDB();
  const body = await req.json();
  const { id, ...update } = body;
  const product = await Product.findOneAndUpdate({ id }, update, { new: true });
  return NextResponse.json(product);
}

export async function DELETE(req: Request) {
  await connectDB();
  const { id } = await req.json();
  await Product.findOneAndDelete({ id });
  return NextResponse.json({ success: true });
}
