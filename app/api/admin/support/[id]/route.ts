import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import SupportTicket from '@/lib/models/SupportTicket';
import { getTokenFromCookies } from '@/lib/auth';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

/**
 * GET /api/support/[id] - Lấy chi tiết support ticket
 */
export async function GET(
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

    // Find ticket
    const ticket = await SupportTicket.findById(ticketId)
      .populate('userId', 'username email')
      .populate('assignedTo', 'username email')
      .populate('messages.senderId', 'username email');

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

    return NextResponse.json({
      success: true,
      data: {
        id: ticket._id,
        ticketId: ticket.ticketId,
        userId: ticket.userId,
        subject: ticket.subject,
        category: ticket.category,
        priority: ticket.priority,
        status: ticket.status,
        assignedTo: ticket.assignedTo,
        messages: ticket.messages,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
        resolvedAt: ticket.resolvedAt,
        closedAt: ticket.closedAt,
      }
    });
  } catch (error) {
    console.error('Get support ticket error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch support ticket' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/support/[id] - Cập nhật trạng thái ticket (admin only)
 * Body:
 * {
 *   status: 'open'|'in_progress'|'resolved'|'closed',
 *   priority?: 'low'|'medium'|'high'|'urgent',
 *   assignedTo?: string
 * }
 */
export async function PATCH(
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

    // Only admin can update ticket status
    if (userRole !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const ticketId = id;
    const body = await request.json();
    const { status, priority, assignedTo } = body;

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
    if (assignedTo) updateData.assignedTo = new mongoose.Types.ObjectId(assignedTo);

    // Set timestamps based on status
    if (status === 'resolved' && !updateData.resolvedAt) {
      updateData.resolvedAt = new Date();
    }
    if (status === 'closed' && !updateData.closedAt) {
      updateData.closedAt = new Date();
    }

    // Update ticket
    const updated = await SupportTicket.findByIdAndUpdate(
      ticketId,
      updateData,
      { new: true }
    ).populate('assignedTo', 'username email');

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Ticket not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Ticket updated successfully',
      data: {
        id: updated._id,
        ticketId: updated.ticketId,
        status: updated.status,
        priority: updated.priority,
        assignedTo: updated.assignedTo,
        resolvedAt: updated.resolvedAt,
        closedAt: updated.closedAt,
        updatedAt: updated.updatedAt,
      }
    });
  } catch (error) {
    console.error('Update support ticket error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update support ticket' },
      { status: 500 }
    );
  }
}