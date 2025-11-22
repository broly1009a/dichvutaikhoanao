import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Webhook from '@/lib/models/Webhook';

/**
 * GET /api/webhooks/check-session-limit?orderCode=xxx&accountNumber=xxx
 * 
 * Check if user can create a new payment session or if session/orderCode exists
 * 
 * Returns: { exists: boolean, message: string }
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const orderCode = searchParams.get('orderCode');
    const accountNumber = searchParams.get('accountNumber');

    if (!orderCode && !accountNumber) {
      return NextResponse.json(
        { error: 'orderCode or accountNumber is required' },
        { status: 400 }
      );
    }

    // If orderCode provided, check if webhook exists with this orderCode
    if (orderCode) {
      const existing = await Webhook.findOne({
        'data.orderCode': parseInt(orderCode)
      });
      
      return NextResponse.json({
        success: true,
        exists: !!existing,
        message: existing 
          ? 'OrderCode already exists - please use a different orderCode' 
          : 'OrderCode is available'
      });
    }

    // If account number provided, just return that it's allowed (no limit check without status)
    if (accountNumber) {
      return NextResponse.json({
        success: true,
        exists: false,
        message: 'Account number check completed'
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
