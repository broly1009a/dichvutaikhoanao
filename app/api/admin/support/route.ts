import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import SupportTicket from '@/lib/models/SupportTicket';

/**
 * GET /api/admin/support - Lấy danh sách tất cả support tickets (admin only)
 * Query params:
 * - status: open|in_progress|resolved|closed (optional)
 * - priority: low|medium|high|urgent (optional)
 * - assignedTo: userId (optional)
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Get user from middleware headers (admin role already verified)
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    if (!userId || userRole !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const assignedTo = searchParams.get('assignedTo');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build query
    const query: any = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;

    // Pagination
    const pageNum = Math.max(1, page);
    const limitNum = Math.min(100, Math.max(1, limit));
    const skip = (pageNum - 1) * limitNum;

    // Get tickets with user info
    const tickets = await SupportTicket.find(query)
      .populate('userId', 'username email')
      .populate('assignedTo', 'username email')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Get total count
    const total = await SupportTicket.countDocuments(query);

    // Get statistics
    const stats = await SupportTicket.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusStats = {
      open: 0,
      in_progress: 0,
      resolved: 0,
      closed: 0,
    };

    stats.forEach(stat => {
      statusStats[stat._id as keyof typeof statusStats] = stat.count;
    });

    // Format response
    const formattedTickets = tickets.map(ticket => ({
      id: ticket._id,
      ticketId: ticket.ticketId,
      user: ticket.userId,
      subject: ticket.subject,
      category: ticket.category,
      priority: ticket.priority,
      status: ticket.status,
      assignedTo: ticket.assignedTo,
      messageCount: ticket.messages?.length || 0,
      lastMessage: ticket.messages?.[ticket.messages.length - 1],
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
      resolvedAt: ticket.resolvedAt,
      closedAt: ticket.closedAt,
    }));

    return NextResponse.json({
      success: true,
      data: {
        tickets: formattedTickets,
        stats: statusStats,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('Get admin support tickets error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch support tickets' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/support - Bulk update tickets (admin only)
 * Body:
 * {
 *   ticketIds: string[],
 *   status?: 'open'|'in_progress'|'resolved'|'closed',
 *   priority?: 'low'|'medium'|'high'|'urgent',
 *   assignedTo?: string
 * }
 */
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    // Get user from middleware headers (admin role already verified)
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    if (!userId || userRole !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { ticketIds, status, priority, assignedTo } = body;

    if (!ticketIds || !Array.isArray(ticketIds) || ticketIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'ticketIds array is required' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Validate priority
    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    if (priority && !validPriorities.includes(priority)) {
      return NextResponse.json(
        { success: false, error: 'Invalid priority' },
        { status: 400 }
      );
    }

    // Build update object
    const updateData: any = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (assignedTo) updateData.assignedTo = assignedTo;

    // Set timestamps based on status
    if (status === 'resolved' && !updateData.resolvedAt) {
      updateData.resolvedAt = new Date();
    }
    if (status === 'closed' && !updateData.closedAt) {
      updateData.closedAt = new Date();
    }

    // Update tickets
    const result = await SupportTicket.updateMany(
      { _id: { $in: ticketIds } },
      updateData
    );

    return NextResponse.json({
      success: true,
      message: `Updated ${result.modifiedCount} tickets successfully`,
      data: {
        matched: result.matchedCount,
        modified: result.modifiedCount,
      }
    });
  } catch (error) {
    console.error('Bulk update support tickets error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update support tickets' },
      { status: 500 }
    );
  }
}