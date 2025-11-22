import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import SupportTicket from '@/lib/models/SupportTicket';
import { getTokenFromCookies } from '@/lib/auth';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

/**
 * POST /api/support/[id]/reply - Thêm reply vào support ticket
 * Body:
 * {
 *   message: string,
 *   attachments?: string[]
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    await connectDB();

    // Get user from token
    const token = getTokenFromCookies(request);
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let userId: string;
    let userRole: string = 'user';
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
      userId = decoded.userId;
      userRole = decoded.role || 'user';
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const ticketId = id;
    const body = await request.json();
    const { message, attachments } = body;

    // Validate message
    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    if (message.length > 2000) {
      return NextResponse.json(
        { success: false, error: 'Message must be less than 2000 characters' },
        { status: 400 }
      );
    }

    // Find ticket
    const ticket = await SupportTicket.findById(ticketId);
    if (!ticket) {
      return NextResponse.json(
        { success: false, error: 'Ticket not found' },
        { status: 404 }
      );
    }

    // Check if user owns this ticket or is admin
    if (userRole !== 'admin' && ticket.userId.toString() !== userId) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    // Create new message
    const newMessage = {
      senderId: new mongoose.Types.ObjectId(userId),
      senderType: userRole === 'admin' ? 'admin' : 'user',
      message: message.trim(),
      attachments: attachments || [],
      createdAt: new Date(),
      isRead: false,
    };

    // Add message to ticket
    ticket.messages.push(newMessage);

    // Update ticket status if needed
    if (userRole === 'admin' && ticket.status === 'open') {
      ticket.status = 'in_progress';
    }

    // Save ticket
    await ticket.save();

    return NextResponse.json({
      success: true,
      message: 'Reply added successfully',
      data: {
        messageId: ticket.messages[ticket.messages.length - 1]._id,
        senderType: newMessage.senderType,
        message: newMessage.message,
        attachments: newMessage.attachments,
        createdAt: newMessage.createdAt,
      }
    });
  } catch (error) {
    console.error('Add reply error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add reply' },
      { status: 500 }
    );
  }
}