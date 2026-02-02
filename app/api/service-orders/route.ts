import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import ServiceOrder from '@/lib/models/ServiceOrder';
import User from '@/lib/models/User';
import Transaction from '@/lib/models/Transaction';
import { getTokenFromCookies } from '@/lib/auth';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

// Service configurations
const servers = [
  { id: "sv1", name: "Server 1 - Nhanh", priceMultiplier: 1.5, speed: "2-4 giờ" },
  { id: "sv2", name: "Server 2 - Chuẩn", priceMultiplier: 1.0, speed: "6-12 giờ" },
  { id: "sv3", name: "Server 3 - Tiết kiệm", priceMultiplier: 0.8, speed: "12-24 giờ" },
];

const qualityOptions = [
  { id: "standard", name: "Standard - Thường", priceMultiplier: 1.0 },
  { id: "high", name: "High Quality - Cao", priceMultiplier: 1.3 },
  { id: "premium", name: "Premium - Đặc Biệt", priceMultiplier: 1.6 },
];

const serviceTypes = [
  { id: "tiktok-follow", name: "TikTok - Tăng Follow", platform: "tiktok" },
  { id: "tiktok-like", name: "TikTok - Tăng Like", platform: "tiktok" },
  { id: "tiktok-view", name: "TikTok - Tăng View", platform: "tiktok" },
  { id: "shopee-follow", name: "Shopee - Tăng Follow Shop", platform: "shopee" },
  { id: "shopee-like", name: "Shopee - Tăng Like Sản Phẩm", platform: "shopee" },
  { id: "shopee-view", name: "Shopee - Tăng View Shop", platform: "shopee" },
  { id: "shopee-order", name: "Shopee - Buff Đơn", platform: "shopee" },
  { id: "lazada-follow", name: "Lazada - Tăng Follower", platform: "lazada" },
  { id: "lazada-like", name: "Lazada - Tăng Like", platform: "lazada" },
  { id: "lazada-order", name: "Lazada - Buff Đơn", platform: "lazada" },
  { id: "facebook-like", name: "Facebook - Tăng Like Page", platform: "facebook" },
  { id: "facebook-follow", name: "Facebook - Tăng Follow", platform: "facebook" },
  { id: "instagram-follow", name: "Instagram - Tăng Follower", platform: "instagram" },
  { id: "instagram-like", name: "Instagram - Tăng Like", platform: "instagram" },
  { id: "youtube-view", name: "YouTube - Tăng View", platform: "youtube" },
  { id: "youtube-sub", name: "YouTube - Tăng Subscribe", platform: "youtube" },
];

// GET /api/service-orders - Lấy danh sách đơn dịch vụ
export async function GET(request: NextRequest) {
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
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
      userId = decoded.userId;
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const platform = searchParams.get('platform');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build query
    const query: any = { userId: new mongoose.Types.ObjectId(userId) };
    if (status) {
      query.status = status;
    }
    if (platform) {
      query.platform = platform;
    }

    const total = await ServiceOrder.countDocuments(query);
    const orders = await ServiceOrder.find(query)
      .populate('userId', 'email username fullName')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({
      success: true,
      data: orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get service orders error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch service orders' },
      { status: 500 }
    );
  }
}

// POST /api/service-orders - Tạo đơn dịch vụ mới
export async function POST(request: NextRequest) {
  let userUpdated = false;
  let createdOrder: any = null;
  let createdTransaction: any = null;
  let previousBalance = 0;
  let previousTotalSpent = 0;
  let userId: string = '';

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

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
      userId = decoded.userId;
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      serviceType,
      server,
      region,
      quality,
      productLinks,
      shippingInfo,
      note
    } = body;

    // Validation
    if (!serviceType || !server || !productLinks || productLinks.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate product links
    for (const link of productLinks) {
      if (!link.url || !link.quantity || link.quantity < 100) {
        return NextResponse.json(
          { success: false, error: 'Invalid product link. Minimum quantity is 100' },
          { status: 400 }
        );
      }
    }

    // Get service config
    const serviceConfig = serviceTypes.find(s => s.id === serviceType);
    if (!serviceConfig) {
      return NextResponse.json(
        { success: false, error: 'Invalid service type' },
        { status: 400 }
      );
    }

    // Get server config
    const serverConfig = servers.find(s => s.id === server);
    if (!serverConfig) {
      return NextResponse.json(
        { success: false, error: 'Invalid server' },
        { status: 400 }
      );
    }

    // Get quality config
    const qualityConfig = qualityOptions.find(q => q.id === (quality || 'standard'));
    const qualityMultiplier = qualityConfig?.priceMultiplier || 1.0;

    // Validate shipping info for buff orders
    const requiresShipping = serviceType.includes("order") || serviceType.includes("buff");
    if (requiresShipping) {
      if (!shippingInfo || !shippingInfo.fullName || !shippingInfo.phoneNumber || 
          !shippingInfo.address || !shippingInfo.province) {
        return NextResponse.json(
          { success: false, error: 'Missing shipping information for buff order' },
          { status: 400 }
        );
      }
      if (shippingInfo.phoneNumber.length < 10) {
        return NextResponse.json(
          { success: false, error: 'Invalid phone number' },
          { status: 400 }
        );
      }
    }

    // Calculate total price
    const basePrice = 50; // Base price per unit
    const serverMultiplier = serverConfig.priceMultiplier;
    
    const totalPrice = productLinks.reduce((sum: number, link: any) => {
      const qty = parseInt(link.quantity) || 0;
      return sum + (qty * basePrice * serverMultiplier * qualityMultiplier);
    }, 0);

    // Get user and check balance
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.balance < totalPrice) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Insufficient balance. Need ${(totalPrice - user.balance).toLocaleString('vi-VN')}đ more`,
          required: totalPrice,
          current: user.balance,
          shortage: totalPrice - user.balance
        },
        { status: 400 }
      );
    }

    // Save previous values for rollback
    previousBalance = user.balance;
    previousTotalSpent = user.totalSpent || 0;

    // Deduct balance
    user.balance -= totalPrice;
    user.totalSpent = (user.totalSpent || 0) + totalPrice;
    await user.save();
    userUpdated = true;

    // Create service order
    const serviceOrder = new ServiceOrder({
      userId: new mongoose.Types.ObjectId(userId),
      serviceType,
      platform: serviceConfig.platform,
      server,
      serverId: serverConfig.id,
      serverName: serverConfig.name,
      priceMultiplier: serverMultiplier,
      estimatedTime: serverConfig.speed,
      region,
      quality: quality || 'standard',
      qualityMultiplier,
      productLinks,
      shippingInfo: requiresShipping ? shippingInfo : undefined,
      note,
      totalPrice,
      basePrice,
      status: 'pending',
      paymentStatus: 'paid',
      paymentMethod: 'wallet'
    });

    createdOrder = await serviceOrder.save();

    // Create transaction record
    const transaction = new Transaction({
      userId: new mongoose.Types.ObjectId(userId),
      type: 'purchase',
      method: 'wallet',
      amount: totalPrice,
      balanceBefore: previousBalance,
      balanceAfter: user.balance,
      status: 'completed',
      description: `Service order: ${serviceConfig.name} - ${serverConfig.name}`,
      relatedOrderId: serviceOrder._id
    });

    createdTransaction = await transaction.save();

    return NextResponse.json({
      success: true,
      data: {
        order: createdOrder,
        transaction: createdTransaction
      },
      message: 'Service order created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Create service order error:', error);

    // Rollback on error
    try {
      if (userUpdated) {
        const user = await User.findById(userId);
        if (user) {
          user.balance = previousBalance;
          user.totalSpent = previousTotalSpent;
          await user.save();
        }
      }
      if (createdOrder) {
        await ServiceOrder.findByIdAndDelete(createdOrder._id);
      }
      if (createdTransaction) {
        await Transaction.findByIdAndDelete(createdTransaction._id);
      }
    } catch (rollbackError) {
      console.error('Rollback error:', rollbackError);
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create service order' },
      { status: 500 }
    );
  }
}
