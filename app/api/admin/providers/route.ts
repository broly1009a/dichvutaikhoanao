import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Provider from '@/lib/models/Provider';
import { ProviderClient } from '@/lib/provider-client';

// GET /api/providers - Lấy danh sách providers
export async function GET() {
  try {
    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json(
        { success: false, error: 'Database not available' },
        { status: 503 }
      );
    }

    const providers = await Provider.find().sort({ name: 1 });
    return NextResponse.json({ success: true, data: providers });
  } catch (error) {
    console.error('Fetch providers error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch providers' },
      { status: 500 }
    );
  }
}

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

// Note: PUT/DELETE for a specific provider are handled in
// `app/api/providers/[id]/route.ts` to match Next.js dynamic routing.
