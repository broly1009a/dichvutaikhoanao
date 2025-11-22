import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import SupportTicket from '@/lib/models/SupportTicket';
// import User from '@/lib/models/User';
import mongoose from 'mongoose';

/**
 * GET /api/support - Lấy danh sách support tickets của user
 * Query params:
 * - status: open|in_progress|resolved|closed (optional)
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    await connectDB();

    // Get user from middleware headers
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build query
    const query: any = { userId: new mongoose.Types.ObjectId(userId) };
    if (status) {
      query.status = status;
    }

    // Pagination
    const pageNum = Math.max(1, page);
    const limitNum = Math.min(50, Math.max(1, limit));
    const skip = (pageNum - 1) * limitNum;

    // Get tickets
    const tickets = await SupportTicket.find(query)
      .populate('assignedTo', 'username email')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Get total count
    const total = await SupportTicket.countDocuments(query);

    // Format response
    const formattedTickets = tickets.map(ticket => ({
      id: ticket._id,
      ticketId: ticket.ticketId,
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
      data: formattedTickets,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get support tickets error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch support tickets' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/support - Tạo support ticket mới
 * Body:
 * {
 *   subject: string,
 *   category: 'general'|'payment'|'technical'|'account'|'other',
 *   priority: 'low'|'medium'|'high'|'urgent',
 *   message: string
 * }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    await connectDB();

    // Get user from middleware headers
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { subject, category, priority, message } = body;

    // Validate required fields
    if (!subject || !message) {
      return NextResponse.json(
        { success: false, error: 'Subject and message are required' },
        { status: 400 }
      );
    }

    if (subject.length > 200) {
      return NextResponse.json(
        { success: false, error: 'Subject must be less than 200 characters' },
        { status: 400 }
      );
    }

    // Create ticket
    const ticket = new SupportTicket({
      userId: new mongoose.Types.ObjectId(userId),
      subject: subject.trim(),
      category: category || 'general',
      priority: priority || 'medium',
      status: 'open',
      messages: [{
        senderId: new mongoose.Types.ObjectId(userId),
        senderType: 'user',
        message: message.trim(),
        createdAt: new Date(),
        isRead: false,
      }],
    });

    const saved = await ticket.save();

    return NextResponse.json(
      {
        success: true,
        message: 'Support ticket created successfully',
        data: {
          id: saved._id,
          ticketId: saved.ticketId,
          subject: saved.subject,
          category: saved.category,
          priority: saved.priority,
          status: saved.status,
          createdAt: saved.createdAt,
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create support ticket error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create support ticket' },
      { status: 500 }
    );
  }
}