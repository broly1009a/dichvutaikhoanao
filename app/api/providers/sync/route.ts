import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Provider from '@/lib/models/Provider';
import Account from '@/lib/models/Account';
import Product from '@/lib/models/Product';
import { ProviderClient } from '@/lib/provider-client';

// POST /api/providers/sync - Sync accounts từ external provider
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
    const { providerId, productId, endpoint, params } = body;

    if (!providerId || !productId || !endpoint) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Lấy provider config
    const provider = await Provider.findById(providerId);
    if (!provider) {
      return NextResponse.json(
        { success: false, error: 'Provider not found' },
        { status: 404 }
      );
    }

    if (provider.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'Provider is not active' },
        { status: 400 }
      );
    }

    // Kiểm tra product
    const product = await Product.findOne({ id: productId });
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Kiểm tra provider hỗ trợ platform
    if (!provider.supportedPlatforms.includes(product.platform)) {
      return NextResponse.json(
        {
          success: false,
          error: `Provider does not support ${product.platform}`,
        },
        { status: 400 }
      );
    }

    // Tạo provider client
    const client = new ProviderClient({
      apiUrl: provider.apiUrl || '',
      apiKey: provider.apiKey,
      apiSecret: provider.apiSecret,
      authenticationType: provider.authenticationType || 'bearer',
      requestsPerMinute: provider.requestsPerMinute,
    });

    // Fetch accounts từ external API
    const accountsData = await client.fetchAccounts(endpoint, params);

    if (!Array.isArray(accountsData) || accountsData.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No accounts returned from provider' },
        { status: 400 }
      );
    }

    // Transform và insert accounts
    const accountsToInsert = accountsData.map((acc: any) => ({
      productId,
      accountType: product.platform,
      username: acc.username || acc.email,
      password: acc.password,
      email: acc.email,
      phone: acc.phone,
      recoveryEmail: acc.recoveryEmail,
      recoveryPhone: acc.recoveryPhone,
      additionalInfo: {
        externalId: acc.id,
        source: provider.name,
        ...acc.additionalInfo,
      },
      status: 'available',
    }));

    // Insert vào database
    const result = await Account.insertMany(accountsToInsert, {
      ordered: false,
    }).catch((err) => {
      if (err.code === 11000) {
        return err.result?.insertedDocs || [];
      }
      throw err;
    });

    // Cập nhật provider stats
    provider.totalAccountsFetched += result.length;
    provider.lastSyncTime = new Date();
    await provider.save();

    // Cập nhật product count
    const availableCount = await Account.countDocuments({
      productId,
      status: 'available',
    });

    await Product.findByIdAndUpdate(product._id, {
      availableCount,
      accountCount: availableCount,
      status: availableCount > 0 ? 'available' : 'soldout',
    });

    return NextResponse.json({
      success: true,
      message: `Synced ${result.length} accounts from ${provider.name}`,
      data: {
        synced: result.length,
        duplicates: accountsData.length - result.length,
        totalAvailable: availableCount,
      },
    });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { success: false, error: 'Sync failed' },
      { status: 500 }
    );
  }
}

// GET /api/providers - Lấy danh sách providers
export async function GET(request: NextRequest) {
  try {
    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json(
        { success: false, error: 'Database not available' },
        { status: 503 }
      );
    }

    const providers = await Provider.find().select('-apiSecret'); // Không trả secret

    return NextResponse.json({
      success: true,
      data: providers,
    });
  } catch (error) {
    console.error('Get providers error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get providers' },
      { status: 500 }
    );
  }
}
