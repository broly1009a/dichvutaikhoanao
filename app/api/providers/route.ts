import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Provider from '@/lib/models/Provider';
import { ProviderClient } from '@/lib/provider-client';

// POST /api/providers - Tạo provider mới
export async function POST(request: NextRequest) {
  try {
    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json(
        { success: false, error: 'Database not available' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const {
      name,
      type,
      description,
      apiUrl,
      apiKey,
      apiSecret,
      authenticationType,
      supportedPlatforms,
      requestsPerMinute = 100,
      maxRequestsPerDay = 10000,
    } = body;

    if (!name || !type) {
      return NextResponse.json(
        { success: false, error: 'Name and type are required' },
        { status: 400 }
      );
    }

    // Nếu là external API, validate config
    if (type === 'external_api') {
      if (!apiUrl || !apiKey || !authenticationType) {
        return NextResponse.json(
          {
            success: false,
            error: 'apiUrl, apiKey, and authenticationType are required for external API',
          },
          { status: 400 }
        );
      }

      // Test connection
      try {
        const client = new ProviderClient({
          apiUrl,
          apiKey,
          apiSecret,
          authenticationType,
          requestsPerMinute,
        });

        const isHealthy = await client.healthCheck();
        if (!isHealthy) {
          return NextResponse.json(
            { success: false, error: 'Cannot connect to external API' },
            { status: 400 }
          );
        }
      } catch (error) {
        return NextResponse.json(
          { success: false, error: 'Failed to test external API connection' },
          { status: 400 }
        );
      }
    }

    // Kiểm tra provider đã tồn tại
    const existingProvider = await Provider.findOne({ name });
    if (existingProvider) {
      return NextResponse.json(
        { success: false, error: 'Provider with this name already exists' },
        { status: 400 }
      );
    }

    // Tạo provider mới
    const provider = await Provider.create({
      name,
      type,
      description,
      apiUrl,
      apiKey,
      apiSecret,
      authenticationType,
      supportedPlatforms: supportedPlatforms || [],
      requestsPerMinute,
      maxRequestsPerDay,
      status: type === 'external_api' ? 'testing' : 'active',
      isHealthy: true,
      lastHealthCheck: new Date(),
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Provider created successfully',
        data: provider,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create provider error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create provider' },
      { status: 500 }
    );
  }
}

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
