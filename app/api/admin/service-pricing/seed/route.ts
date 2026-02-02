import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import ServicePricing from '@/lib/models/ServicePricing';

// Seed initial data cho service pricing
export async function GET(request: NextRequest) {
  try {
    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json(
        { success: false, error: 'Database not available' },
        { status: 503 }
      );
    }

    // Check if already seeded
    const existing = await ServicePricing.countDocuments();
    if (existing > 0) {
      return NextResponse.json({
        success: false,
        message: 'Service pricing already seeded'
      }, { status: 400 });
    }

    const defaultServers = [
      { id: "sv1", name: "Server 1 - Nhanh", priceMultiplier: 1.5, estimatedTime: "2-4 giờ", isActive: true },
      { id: "sv2", name: "Server 2 - Chuẩn", priceMultiplier: 1.0, estimatedTime: "6-12 giờ", isActive: true },
      { id: "sv3", name: "Server 3 - Tiết kiệm", priceMultiplier: 0.8, estimatedTime: "12-24 giờ", isActive: true },
    ];

    const defaultQualityOptions = [
      { id: "standard", name: "Standard - Thường", priceMultiplier: 1.0, isActive: true },
      { id: "high", name: "High Quality - Cao", priceMultiplier: 1.3, isActive: true },
      { id: "premium", name: "Premium - Đặc Biệt", priceMultiplier: 1.6, isActive: true },
    ];

    const defaultRegions = [
      { id: "vn", name: "Việt Nam", isActive: true },
      { id: "global", name: "Global (Toàn Cầu)", isActive: true },
      { id: "asia", name: "Châu Á", isActive: true },
      { id: "us", name: "Hoa Kỳ", isActive: true },
      { id: "eu", name: "Châu Âu", isActive: true },
    ];

    const services = [
      { id: "tiktok-follow", name: "TikTok - Tăng Follow", platform: "tiktok", basePrice: 50 },
      { id: "tiktok-like", name: "TikTok - Tăng Like", platform: "tiktok", basePrice: 40 },
      { id: "tiktok-view", name: "TikTok - Tăng View", platform: "tiktok", basePrice: 30 },
      { id: "shopee-follow", name: "Shopee - Tăng Follow Shop", platform: "shopee", basePrice: 60 },
      { id: "shopee-like", name: "Shopee - Tăng Like Sản Phẩm", platform: "shopee", basePrice: 45 },
      { id: "shopee-view", name: "Shopee - Tăng View Shop", platform: "shopee", basePrice: 35 },
      { id: "shopee-order", name: "Shopee - Buff Đơn", platform: "shopee", basePrice: 100 },
      { id: "lazada-follow", name: "Lazada - Tăng Follower", platform: "lazada", basePrice: 55 },
      { id: "lazada-like", name: "Lazada - Tăng Like", platform: "lazada", basePrice: 40 },
      { id: "lazada-order", name: "Lazada - Buff Đơn", platform: "lazada", basePrice: 95 },
      { id: "facebook-like", name: "Facebook - Tăng Like Page", platform: "facebook", basePrice: 70 },
      { id: "facebook-follow", name: "Facebook - Tăng Follow", platform: "facebook", basePrice: 65 },
      { id: "instagram-follow", name: "Instagram - Tăng Follower", platform: "instagram", basePrice: 80 },
      { id: "instagram-like", name: "Instagram - Tăng Like", platform: "instagram", basePrice: 55 },
      { id: "youtube-view", name: "YouTube - Tăng View", platform: "youtube", basePrice: 90 },
      { id: "youtube-sub", name: "YouTube - Tăng Subscribe", platform: "youtube", basePrice: 120 },
    ];

    const pricings = [];
    for (const service of services) {
      const pricing = new ServicePricing({
        serviceType: service.id,
        serviceName: service.name,
        platform: service.platform,
        basePrice: service.basePrice,
        minQuantity: 100,
        maxQuantity: 100000,
        description: `Dịch vụ ${service.name} chất lượng cao, giao hàng nhanh chóng`,
        servers: defaultServers,
        qualityOptions: defaultQualityOptions,
        regions: defaultRegions,
        isActive: true
      });
      await pricing.save();
      pricings.push(pricing);
    }

    return NextResponse.json({
      success: true,
      data: pricings,
      message: `Seeded ${pricings.length} service pricings successfully`
    });

  } catch (error) {
    console.error('Seed service pricing error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to seed service pricing' },
      { status: 500 }
    );
  }
}
