import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import ServicePricing from '@/lib/models/ServicePricing';
import { getTokenFromCookies } from '@/lib/auth';
import jwt from 'jsonwebtoken';

// GET /api/admin/service-pricing - Lấy danh sách cấu hình giá (Admin)
export async function GET(request: NextRequest) {
  try {
    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json(
        { success: false, error: 'Database not available' },
        { status: 503 }
      );
    }

    // Check admin
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

    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');
    const isActive = searchParams.get('isActive');

    const query: any = {};
    if (platform) query.platform = platform;
    if (isActive !== null) query.isActive = isActive === 'true';

    const pricings = await ServicePricing.find(query).sort({ platform: 1, serviceName: 1 });

    return NextResponse.json({
      success: true,
      data: pricings
    });

  } catch (error) {
    console.error('Get service pricing error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch service pricing' },
      { status: 500 }
    );
  }
}

// POST /api/admin/service-pricing - Tạo cấu hình giá mới (Admin)
export async function POST(request: NextRequest) {
  try {
    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json(
        { success: false, error: 'Database not available' },
        { status: 503 }
      );
    }

    // Check admin
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

    const body = await request.json();
    const {
      serviceType,
      serviceName,
      platform,
      basePrice,
      minQuantity,
      maxQuantity,
      description,
      servers,
      qualityOptions,
      regions
    } = body;

    // Validation
    if (!serviceType || !serviceName || !platform || basePrice === undefined || !minQuantity) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (basePrice < 0) {
      return NextResponse.json(
        { success: false, error: 'Base price must be non-negative' },
        { status: 400 }
      );
    }

    // Check duplicate
    const existing = await ServicePricing.findOne({ serviceType });
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Service type already exists' },
        { status: 400 }
      );
    }

    const pricing = new ServicePricing({
      serviceType,
      serviceName,
      platform,
      basePrice,
      minQuantity,
      maxQuantity,
      description,
      servers: servers || [],
      qualityOptions: qualityOptions || [],
      regions: regions || [],
      isActive: true
    });

    await pricing.save();

    return NextResponse.json({
      success: true,
      data: pricing,
      message: 'Service pricing created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Create service pricing error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create service pricing' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/service-pricing - Cập nhật cấu hình giá (Admin)
export async function PUT(request: NextRequest) {
  try {
    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json(
        { success: false, error: 'Database not available' },
        { status: 503 }
      );
    }

    // Check admin
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

    const body = await request.json();
    const { serviceType, ...updates } = body;

    if (!serviceType) {
      return NextResponse.json(
        { success: false, error: 'Service type is required' },
        { status: 400 }
      );
    }

    const pricing = await ServicePricing.findOne({ serviceType });
    if (!pricing) {
      return NextResponse.json(
        { success: false, error: 'Service pricing not found' },
        { status: 404 }
      );
    }

    // Update fields
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        (pricing as any)[key] = updates[key];
      }
    });

    await pricing.save();

    return NextResponse.json({
      success: true,
      data: pricing,
      message: 'Service pricing updated successfully'
    });

  } catch (error) {
    console.error('Update service pricing error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update service pricing' },
      { status: 500 }
    );
  }
}
