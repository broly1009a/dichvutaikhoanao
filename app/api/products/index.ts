import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Product from '@/lib/models/Product';

export async function GET() {
  await connectDB();
  const products = await Product.find();
  return NextResponse.json(products);
}

