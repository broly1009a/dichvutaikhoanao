import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Provider from '@/lib/models/Provider';

// PUT /api/providers/[id] - Cập nhật provider
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json(
        { success: false, error: 'Database not available' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const {
      status,
      requestsPerMinute,
      maxRequestsPerDay,
      supportedPlatforms,
    } = body;

    const provider = await Provider.findByIdAndUpdate(
      params.id,
      {
        status,
        requestsPerMinute,
        maxRequestsPerDay,
        supportedPlatforms,
      },
      { new: true }
    );

    if (!provider) {
      return NextResponse.json(
        { success: false, error: 'Provider not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Provider updated successfully',
      data: provider,
    });
  } catch (error) {
    console.error('Update provider error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update provider' },
      { status: 500 }
    );
  }
}

// DELETE /api/providers/[id] - Xóa provider
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json(
        { success: false, error: 'Database not available' },
        { status: 503 }
      );
    }

    const result = await Provider.findByIdAndDelete(params.id);

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Provider not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Provider deleted successfully',
    });
  } catch (error) {
    console.error('Delete provider error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete provider' },
      { status: 500 }
    );
  }
}
