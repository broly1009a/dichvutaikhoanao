import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Webhook from '@/lib/models/Webhook';

/**
 * GET /api/webhooks/check-session-limit?uuid=xxx
 * 
 * Check if user can create a new payment session
 * Limits: max 5 pending sessions per day to prevent abuse
 * 
 * Returns: { canCreate: boolean, pendingCount: number, maxAllowed: number }
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const uuid = searchParams.get('uuid');
    const accountNumber = searchParams.get('accountNumber'); // Optional: track by account

    if (!uuid && !accountNumber) {
      return NextResponse.json(
        { error: 'uuid or accountNumber is required' },
        { status: 400 }
      );
    }

    // Get pending sessions created in last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    let query: any = {
      status: 'pending',
      createdAt: { $gte: twentyFourHoursAgo }
    };

    // If UUID provided, check specific session
    if (uuid) {
      query['data.description'] = { $regex: uuid, $options: 'i' };
      
      const existing = await Webhook.findOne(query);
      
      return NextResponse.json({
        success: true,
        exists: !!existing,
        status: existing?.status || null,
        message: existing 
          ? 'Session already exists - you can continue paying' 
          : 'No existing session found'
      });
    }

    // If account number provided, count pending sessions for this account
    if (accountNumber) {
      query['data.accountNumber'] = accountNumber;
      
      const pendingCount = await Webhook.countDocuments(query);
      const maxAllowed = 5;
      const canCreate = pendingCount < maxAllowed;

      return NextResponse.json({
        success: true,
        canCreate,
        pendingCount,
        maxAllowed,
        message: canCreate
          ? `You can create a new session (${pendingCount}/${maxAllowed})`
          : `Too many pending sessions. Please wait or check existing ones (${pendingCount}/${maxAllowed})`
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid parameters'
    }, { status: 400 });
    
  } catch (error) {
    console.error('Session limit check error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: (error as Error).message 
      },
      { status: 500 }
    );
  }
}
