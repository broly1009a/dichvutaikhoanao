import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import ServiceOrder from '@/lib/models/ServiceOrder';
import User from '@/lib/models/User';
import { getTokenFromCookies } from '@/lib/auth';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

// GET /api/service-orders/[orderId] - Lấy chi tiết đơn dịch vụ
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json(
        { success: false, error: 'Database not available' },
        { status: 503 }
      );
    }

    // Get user from token
    const token = getTokenFromCookies(request);
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let userId: string;
    let isAdmin = false;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
      userId = decoded.userId;
      isAdmin = decoded.role === 'admin';
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { orderId } = await params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid order ID' },
        { status: 400 }
      );
    }

    const order = await ServiceOrder.findById(orderId)
      .populate('userId', 'email username fullName phone');

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if user owns this order or is admin
    if (!isAdmin && order.userId._id.toString() !== userId) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Get service order error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch service order' },
      { status: 500 }
    );
  }
}

// PATCH /api/service-orders/[orderId] - Cập nhật trạng thái đơn (Admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json(
        { success: false, error: 'Database not available' },
        { status: 503 }
      );
    }

    // Get user from token
    const token = getTokenFromCookies(request);
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let isAdmin = false;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
      isAdmin = decoded.role === 'admin';
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { orderId } = await params;
    const body = await request.json();
    const { status, failureReason } = body;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid order ID' },
        { status: 400 }
      );
    }

    const order = await ServiceOrder.findById(orderId);

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Update status
    if (status) {
      order.status = status;

      if (status === 'processing' && !order.processStartedAt) {
        order.processStartedAt = new Date();
      }

      if (status === 'completed' && !order.processCompletedAt) {
        order.processCompletedAt = new Date();
      }

      if (status === 'failed' && failureReason) {
        order.failureReason = failureReason;
      }
    }

    await order.save();

    return NextResponse.json({
      success: true,
      data: order,
      message: 'Order updated successfully'
    });

  } catch (error) {
    console.error('Update service order error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update service order' },
      { status: 500 }
    );
  }
}
