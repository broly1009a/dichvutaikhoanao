import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Invoice from '@/lib/models/Invoice';

/**
 * GET /api/invoices
 * Get user's invoices with optional filters
 * 
 * Query params:
 * - userId: User ID (required)
 * - status: pending|completed|failed|expired (optional)
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10, max: 50)
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Build query
    const query: any = { userId };
    if (status) {
      query.status = status;
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Get invoices
    const invoices = await Invoice.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Get total count
    const total = await Invoice.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: invoices,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get invoices error:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/invoices
 * Create a new invoice
 *
 * Body:
 * {
 *   userId: string,
 *   orderCode: number,
 *   amount: number,
 *   bonus: number,
 *   description: string,
 *   paymentMethod: 'payos'
 * }
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    await connectDB();

    const body = await req.json();
    const { userId, orderCode, amount, bonus = 0, description, paymentMethod = 'payos' } = body;

    // Validate required fields
    if (!userId || !orderCode || !amount || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, orderCode, amount, description' },
        { status: 400 }
      );
    }

    if (amount < 10000) {
      return NextResponse.json(
        { error: 'Amount must be at least 10,000 VND' },
        { status: 400 }
      );
    }

    // Check if invoice already exists by orderCode
    const existing = await Invoice.findOne({ orderCode });
    
    if (existing) {
      return NextResponse.json(
        { 
          error: 'Invoice already exists',
          data: existing
        },
        { status: 400 }
      );
    }

    // Create invoice
    const invoice = new Invoice({
      userId,
      orderCode,
      amount,
      bonus,
      totalAmount: amount + bonus,
      status: 'pending',
      description,
      paymentMethod,
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
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/invoices
 * Update invoice status
 * 
 * Body:
 * {
 *   orderCode: number,
 *   status: 'pending'|'completed'|'failed'|'expired',
 *   paymentDate?: Date
 * }
 */
export async function PATCH(req: NextRequest): Promise<NextResponse> {
  try {
    await connectDB();

    const body = await req.json();
    const { orderCode, status, paymentDate } = body;

    if (!orderCode || !status) {
      return NextResponse.json(
        { error: 'orderCode and status are required' },
        { status: 400 }
      );
    }

    const validStatuses = ['pending', 'completed', 'failed', 'expired'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Update invoice by orderCode
    const updated = await Invoice.findOneAndUpdate(
      { orderCode },
      {
        status,
        paymentDate: status === 'completed' ? (paymentDate || new Date()) : paymentDate
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Invoice updated successfully',
      data: updated
    });
  } catch (error) {
    console.error('Update invoice error:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/invoices/[orderCode]
 * Get single invoice by orderCode
 */
export async function GET_SINGLE(req: NextRequest): Promise<NextResponse> {
  try {
    await connectDB();

    const identifier = req.nextUrl.pathname.split('/').pop();

    if (!identifier) {
      return NextResponse.json(
        { error: 'orderCode is required' },
        { status: 400 }
      );
    }

    // Parse orderCode as number
    const orderCodeNum = parseInt(identifier);
    if (isNaN(orderCodeNum)) {
      return NextResponse.json(
        { error: 'Invalid orderCode format' },
        { status: 400 }
      );
    }

    const invoice = await Invoice.findOne({ orderCode: orderCodeNum });

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: invoice
    });
  } catch (error) {
    console.error('Get invoice error:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
