import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Account from '@/lib/models/Account';
import Product from '@/lib/models/Product';

// POST /api/accounts/upload - Upload tài khoản từ file text
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
    const { productId, accountData, separator = '|', format } = body;

    if (!productId || !accountData) {
      return NextResponse.json(
        { success: false, error: 'Missing productId or accountData' },
        { status: 400 }
      );
    }

    // Kiểm tra product tồn tại
    // Sử dụng _id thay vì id, productId là _id
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Parse dữ liệu account từ format
    const accounts = parseAccountData(accountData, separator, format);

    if (accounts.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid accounts to upload' },
        { status: 400 }
      );
    }

    // Thêm productId và accountType vào mỗi account
    // Không gán id, để MongoDB tự sinh _id
    const accountsToInsert = accounts.map((acc) => ({
      ...acc,
      productId,
      accountType: product.platform,
      status: 'available',
    }));

    console.log('DEBUG: First account to insert:', accountsToInsert[0]);

    // Insert vào database
    const result = await Account.insertMany(accountsToInsert, { ordered: false }).catch(
      (err) => {
        // Bỏ qua lỗi duplicate key
        if (err.code === 11000) {
          return err.result?.insertedDocs || [];
        }
        throw err;
      }
    );

    // Cập nhật số lượng account trong product
    const availableCount = await Account.countDocuments({
      productId,
      status: 'available',
    });

    await Product.findByIdAndUpdate(product._id, {
      availableCount,
      accountCount: availableCount,
      status: availableCount > 0 ? 'available' : 'soldout',
    });

    return NextResponse.json(
      {
        success: true,
        message: `Uploaded ${result.length} accounts successfully`,
        data: {
          uploaded: result.length,
          duplicates: accounts.length - result.length,
          totalAvailable: availableCount,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload accounts' },
      { status: 500 }
    );
  }
}

// Helper function để parse account data
function parseAccountData(
  data: string,
  separator: string = '|',
  format?: string
): any[] {
  const lines = data.split('\n').filter((line) => line.trim());
  const accounts: any[] = [];

  for (const line of lines) {
    const parts = line.trim().split(separator).map((p) => p.trim());

    if (parts.length === 0 || !parts[0]) continue;

    // Format mặc định: username|password|phone|email|emailPassword|addInfo1|addInfo2|...
    // Ví dụ: user1|pass1|0123456789|user@email.com|emailPass456|extra1|extra2
    const account: any = {
      username: parts[0],
      password: parts[1] || '',
      phone: parts[2] || '',
      email: parts[3] || '',
      emailPassword: parts[4] || '',
      additionalInfo: {},
    };

    // Lưu các trường thêm vào additionalInfo
    if (parts.length > 5) {
      account.additionalInfo.extra1 = parts[5];
    }
    if (parts.length > 6) {
      account.additionalInfo.extra2 = parts[6];
    }
    if (parts.length > 7) {
      // Parse thêm thông tin nếu có
      const extraInfo = parts.slice(7).join(separator);
      account.additionalInfo.extra_data = extraInfo;
    }

    // Validate username & password
    if (account.username && account.password) {
      accounts.push(account);
    }
  }

  return accounts;
}

// GET /api/accounts?productId=xxx&page=1&limit=50
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
    const productId = searchParams.get('productId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status') || 'available';

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Missing productId' },
        { status: 400 }
      );
    }

    const total = await Account.countDocuments({ productId, status });
    const accounts = await Account.find({ productId, status })
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: accounts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get accounts error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get accounts' },
      { status: 500 }
    );
  }
}
