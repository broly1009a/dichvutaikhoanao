
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Webhook from '@/lib/models/Webhook';
// import Invoice from '@/lib/models/Invoice';
// import { paymentCache } from '@/lib/payment-cache';
// import {
//   verifyPayOSSignature,
//   requestDeduplicator,
//   retryWithBackoff,
//   isRetryableError
// } from '@/lib/utils/payment-utils';

interface WebhookRequestData {
  code?: string;
  desc?: string;
  success?: boolean;
  signature?: string; // Add signature at root level
  data: {
    accountNumber: string;
    amount: number;
    description: string;
    reference: string;
    transactionDateTime: string;
    virtualAccountNumber?: string;
    counterAccountBankId?: string;
    counterAccountBankName?: string;
    counterAccountName?: string;
    counterAccountNumber?: string;
    virtualAccountName?: string;
    currency?: string;
    orderCode?: string | number; // Support both string and number for int64
    paymentLinkId?: string;
    code?: string;
    desc?: string;
  };
}

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const description: string | null = searchParams.get('description');
    const amount: string | null = searchParams.get('amount');
    const orderCode: string | null = searchParams.get('orderCode');
    const page: string | null = searchParams.get('page');
    const limitParam: string | null = searchParams.get('limit');

    console.log('🔍 Webhook GET request - Params:', {
      description,
      amount,
      orderCode,
      page,
      limitParam
    });

    let query: any = {};
    let limit: number = 10;
    let skip: number = 0;

    // If description and amount provided, search for specific transaction (VietQR)
    if (description && amount) {
      query = {
        'data.description': { $regex: description, $options: "i" },
        'data.amount': parseInt(amount)
      };
      limit = 5;
    }
    // If orderCode provided, search for PayOS transaction
    else if (orderCode) {
      console.log('🔍 Searching for orderCode:', orderCode);
      query = {
        'data.orderCode': parseInt(orderCode)
      };
      limit = 1;
    }
    else {
      // Handle pagination for list view
      const pageNum = page ? parseInt(page) : 1;
      const limitNum = limitParam ? parseInt(limitParam) : 10;
      limit = Math.min(limitNum, 100);
      skip = (pageNum - 1) * limit;
    }

    const webhooks = await Webhook.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    console.log('📊 Query:', query);
    console.log('📊 Found webhooks:', webhooks.length);

    // If searching for specific transaction, return simplified response
    if ((description && amount) || orderCode) {
      if (webhooks.length > 0) {
        const status = "done";
        console.log('✅ Webhook found for orderCode:', orderCode);
        console.log('📋 Webhook data:', webhooks[0]);
        
        return NextResponse.json({
          success: true,
          data: "done",
          webhooks: webhooks
        });
      } else {
        console.log('❌ No webhook found for orderCode:', orderCode);
        return NextResponse.json({
          success: true,
          data: "none"
        });
      }
    }

    // Regular list response with pagination info
    const total = await Webhook.countDocuments(query);
    return NextResponse.json({
      success: true,
      data: webhooks,
      pagination: {
        page: page ? parseInt(page) : 1,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    await connectDB();

    const webhookData: WebhookRequestData = await req.json();

    // Create webhook document with signature at root level
    const webhook = new Webhook({
      code: webhookData.code || '00',
      desc: webhookData.desc || 'success',
      success: webhookData.success !== undefined ? webhookData.success : true,
      data: webhookData.data, // Store the data object from PayOS
      signature: webhookData.signature, // Move signature to root level
    });

    const savedWebhook = await webhook.save();

    return NextResponse.json({
      success: true,
      message: "Webhook received successfully",
      data: savedWebhook
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}
// export async function POST(req: NextRequest): Promise<NextResponse> {
//   try {
//     await connectDB();

//     const webhookData: WebhookRequestData = await req.json();

//     // Check if webhook already exists (prevent duplicates)
//     // const existingWebhook = await Webhook.findOne({
//     //   'data.reference': webhookData.data.reference,
//     //   'data.amount': webhookData.data.amount
//     // });

//     // if (existingWebhook) {
//     //   return NextResponse.json({
//     //     success: true,
//     //     message: "Webhook already exists",
//     //     data: existingWebhook
//     //   });
//     // }

//     // Create webhook document with TTL and status
//     const webhook = new Webhook({
//       code: webhookData.code || '00',
//       desc: webhookData.desc || 'success',
//       success: webhookData.success !== undefined ? webhookData.success : true,
//       data: webhookData.data,
//       status: 'completed', // Payment received and completed
//       // expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Auto-delete after 24 hours
//     });

//     const savedWebhook = await webhook.save();

//     // Update cache with payment status using UUID from description
//     // const uuid = webhookData.data.description;
//     // paymentCache.set(uuid, "done", webhookData.data.amount);

//     // Also update cache with orderCode if available
//     // if (webhookData.data.orderCode) {
//     //   paymentCache.set(
//     //     webhookData.data.orderCode.toString(),
//     //     "done",
//     //     webhookData.data.amount
//     //   );
//     // }

//     // Try to update associated invoice if exists
//     // try {
//     //   const invoice = await Invoice.findOne({ uuid });
//     //   if (invoice) {
//     //     invoice.status = 'completed';
//     //     invoice.paymentDate = new Date();
//     //     await invoice.save();
//     //     console.log(`Invoice ${uuid} marked as completed`);
//     //   }
//     // } catch (error) {
//     //   console.error('Error updating invoice:', error);
//     // }

//     return NextResponse.json({
//       success: true,
//       message: "Webhook received successfully",
//       data: savedWebhook
//     });
//   } catch (error) {
//     return NextResponse.json({
//       success: false,
//       error: (error as Error).message
//     }, { status: 500 });
//   }
// }
