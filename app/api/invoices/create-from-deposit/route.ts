import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Invoice from '@/lib/models/Invoice';

/**
 * POST /api/invoices/create-from-deposit
 * 
 * Called by DepositModal when user clicks "Tạo mã QR"
 * Creates an invoice record for tracking
 * 
 * Body:
 * {
 *   userId: string,
 *   uuid: string,
 *   orderCode: number,
 *   amount: number,
 *   bonus: number,
 *   description: string
 * }
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    await connectDB();

    const body = await req.json();
    const { userId, uuid, orderCode, amount, bonus = 0, description } = body;

    if (!userId || !uuid || !orderCode || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, uuid, orderCode, amount' },
        { status: 400 }
      );
    }

    // Check if invoice already exists
    const existing = await Invoice.findOne({ uuid });
    if (existing) {
      return NextResponse.json(
        {
          success: true,
          message: 'Invoice already exists',
          data: existing
        },
        { status: 200 }
      );
    }

    // Create invoice
    const invoice = new Invoice({
      userId,
      uuid,
      orderCode,
      amount,
      bonus,
      totalAmount: amount + bonus,
      status: 'pending',
      description: description || `Nạp tiền ${amount.toLocaleString('vi-VN')} VNĐ`,
      paymentMethod: 'payos',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    });

    const saved = await invoice.save();

    return NextResponse.json(
      {
        success: true,
        message: 'Invoice created successfully',
        data: saved
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create invoice error:', error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message
      },
      { status: 500 }
    );
  }
}
