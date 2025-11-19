import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Webhook from '@/lib/models/Webhook';

/**
 * GET /api/webhooks/cleanup
 * 
 * Manual cleanup endpoint to remove expired webhooks.
 * Can be called by a cron job (e.g., every 6 hours)
 * 
 * MongoDB TTL index should auto-cleanup, but this provides manual control.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    // Optional: Add API key validation for security
    const apiKey = req.headers.get('x-cleanup-key');
    const expectedKey = process.env.CLEANUP_API_KEY;
    
    if (expectedKey && apiKey !== expectedKey) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Remove webhooks with expired timestamps
    const result = await Webhook.deleteMany({
      expiresAt: { $lt: new Date() }
    });

    // Also mark very old pending sessions as expired (older than 24h with no update)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const updateResult = await Webhook.updateMany(
      {
        status: 'pending',
        updatedAt: { $lt: twentyFourHoursAgo }
      },
      { 
        status: 'expired',
        expiresAt: new Date() // Mark for immediate deletion
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Cleanup completed',
      deletedCount: result.deletedCount,
      expiredCount: updateResult.modifiedCount,
      stats: {
        webhooksDeleted: result.deletedCount,
        sessionsExpired: updateResult.modifiedCount
      }
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: (error as Error).message 
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/webhooks/cleanup
 * 
 * Scheduled cleanup (call this from your cron job service)
 * Example cron setup with Vercel Crons in vercel.json:
 * 
 * "crons": [
 *   {
 *     "path": "/api/webhooks/cleanup",
 *     "schedule": "0 *\/6 * * *"
 *   }
 * ]
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Verify it's from Vercel Cron or your cron service
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    // For Vercel Crons, check the Authorization header
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const now = new Date();
    
    // Delete expired webhooks
    const deleteResult = await Webhook.deleteMany({
      $or: [
        { expiresAt: { $lt: now } },
        { status: 'expired' }
      ]
    });

    // Count remaining pending sessions
    const pendingCount = await Webhook.countDocuments({ status: 'pending' });
    const completedCount = await Webhook.countDocuments({ status: 'completed' });

    console.log(`[Webhook Cleanup] Deleted: ${deleteResult.deletedCount}, Pending: ${pendingCount}, Completed: ${completedCount}`);

    return NextResponse.json({
      success: true,
      message: 'Scheduled cleanup executed',
      deletedCount: deleteResult.deletedCount,
      stats: {
        pendingSessions: pendingCount,
        completedSessions: completedCount,
        expiredDeleted: deleteResult.deletedCount
      }
    });
  } catch (error) {
    console.error('Scheduled cleanup error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: (error as Error).message 
      },
      { status: 500 }
    );
  }
}
