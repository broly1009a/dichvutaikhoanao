import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import CardDeposit from '@/lib/models/CardDeposit';
import User from '@/lib/models/User';
import { getTokenFromCookies } from '@/lib/auth';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

// Card type configurations with fees
const CARD_CONFIGS = {
  viettel: { fee: 0.3, name: 'Viettel' },
  mobifone: { fee: 0.3, name: 'Mobifone' },
  vinaphone: { fee: 0.3, name: 'Vinaphone' },
  vietnamobile: { fee: 0.3, name: 'Vietnamobile' },
  gmobile: { fee: 0.3, name: 'Gmobile' },
  zing: { fee: 0.2, name: 'Zing' },
  gate: { fee: 0.2, name: 'Gate' },
  garena: { fee: 0.2, name: 'Garena' },
  vcoin: { fee: 0.2, name: 'Vcoin' },
};

const CARD_DENOMINATIONS = [10000, 20000, 30000, 50000, 100000, 200000, 300000, 500000];

/**
 * GET /api/card
 * Get user's card deposits with optional filters
 *
 * Query params:
 * - status: pending|completed|failed|processing (optional)
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10, max: 50)
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';

    // Get user from token
    const token = getTokenFromCookies(req);
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let userId: string;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
      userId = decoded.userId;
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Build query
    const query: any = { userId: new mongoose.Types.ObjectId(userId) };
    if (status) {
      query.status = status;
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Get card deposits
    const cardDeposits = await CardDeposit.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Get total count
    const total = await CardDeposit.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: cardDeposits,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get card deposits error:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/card
 * Create a new card deposit
 *
 * Body:
 * {
 *   cardType: string,
 *   serial: string,
 *   pin: string,
 *   amount: number
 * }
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    await connectDB();

    // Get user from token
    const token = getTokenFromCookies(req);
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let userId: string;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
      userId = decoded.userId;
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { cardType, serial, pin, amount } = body;

    // Validate required fields
    if (!cardType || !serial || !pin || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate card type
    if (!CARD_CONFIGS[cardType as keyof typeof CARD_CONFIGS]) {
      return NextResponse.json(
        { error: 'Invalid card type' },
        { status: 400 }
      );
    }

    // Validate denomination
    if (!CARD_DENOMINATIONS.includes(amount)) {
      return NextResponse.json(
        { error: 'Invalid card denomination' },
        { status: 400 }
      );
    }

    // Check if card already exists (by serial)
    const existing = await CardDeposit.findOne({ serial: serial.trim() });
    if (existing) {
      return NextResponse.json(
        {
          error: 'Card with this serial number already exists',
          data: existing
        },
        { status: 400 }
      );
    }

    // Calculate actual amount after fee
    const config = CARD_CONFIGS[cardType as keyof typeof CARD_CONFIGS];
    const fee = amount * config.fee;
    const actualAmount = amount - fee;

    // Create card deposit
    const cardDeposit = new CardDeposit({
      userId: new mongoose.Types.ObjectId(userId),
      cardType,
      serial: serial.trim(),
      pin: pin.trim(),
      amount,
      actualAmount: Math.floor(actualAmount),
      status: 'pending'
    });

    const saved = await cardDeposit.save();

    return NextResponse.json(
      {
        success: true,
        message: 'Card deposit created successfully',
        data: saved
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create card deposit error:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/card
 * Update card deposit status (admin only)
 *
 * Body:
 * {
 *   id: string,
 *   status: 'pending'|'completed'|'failed'|'processing',
 *   reason?: string
 * }
 */
export async function PATCH(req: NextRequest): Promise<NextResponse> {
  try {
    await connectDB();

    // Verify admin token
    const token = getTokenFromCookies(req);
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    try {
      jwt.verify(token, process.env.JWT_SECRET || 'secret');
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { id, status, reason } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'id and status are required' },
        { status: 400 }
      );
    }

    const validStatuses = ['pending', 'completed', 'failed', 'processing'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Update card deposit
    const updated = await CardDeposit.findByIdAndUpdate(
      id,
      {
        status,
        processedAt: status === 'completed' || status === 'failed' ? new Date() : undefined,
        reason: reason || undefined
      },
      { new: true }
    ).populate('userId', 'email username balance');

    if (!updated) {
      return NextResponse.json(
        { error: 'Card deposit not found' },
        { status: 404 }
      );
    }

    // If completed, add balance to user
    if (status === 'completed' && updated.userId) {
      await User.findByIdAndUpdate(updated.userId, {
        $inc: { balance: updated.actualAmount }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Card deposit updated successfully',
      data: updated
    });
  } catch (error) {
    console.error('Update card deposit error:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}