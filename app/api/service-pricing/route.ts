import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import ServicePricing from '@/lib/models/ServicePricing';

// GET /api/service-pricing - Lấy danh sách giá dịch vụ (Public)
export async function GET(request: NextRequest) {
  try {
    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json(
        { success: false, error: 'Database not available' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');
    const serviceType = searchParams.get('serviceType');

    const query: any = { isActive: true };
    if (platform) query.platform = platform;
    if (serviceType) query.serviceType = serviceType;

    const pricings = await ServicePricing.find(query)
      .select('-createdAt -updatedAt')
      .sort({ platform: 1, serviceName: 1 });

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
