import { NextRequest, NextResponse } from "next/server";
import { paymentCache } from "@/lib/payment-cache";

/**
 * GET /api/webhooks/stream?uuid=xxx or /api/webhooks/stream?orderCode=xxx
 * Server-Sent Events endpoint for real-time payment status updates
 * 
 * Prefers UUID (persistent across QR recreations) over orderCode
 * 
 * Usage:
 * const eventSource = new EventSource('/api/webhooks/stream?uuid=xxx');
 * eventSource.onmessage = (event) => {
 *   const data = JSON.parse(event.data);
 *   console.log('Payment status:', data);
 * };
 */

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const uuid = searchParams.get("uuid");
  const orderCode = searchParams.get("orderCode");
  
  // UUID is preferred (persistent across QR recreations)
  const key = uuid || orderCode;

  if (!key) {
    return NextResponse.json(
      { error: "uuid or orderCode is required" },
      { status: 400 }
    );
  }

  // Set up Server-Sent Events response
  const encoder = new TextEncoder();
  let unsubscribe: (() => void) | null = null;

  const customReadable = new ReadableStream({
    async start(controller) {
      // Send initial status if exists in cache
      const cachedStatus = paymentCache.get(key);
      if (cachedStatus) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ ...cachedStatus, cached: true })}\n\n`
          )
        );
        
        // If already done or failed, close connection
        if (cachedStatus.status !== "pending") {
          controller.close();
          return;
        }
      }

      // Subscribe to updates
      unsubscribe = paymentCache.subscribe(key, (data) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
        );

        // Close connection if payment is done or failed
        if (data.status !== "pending") {
          controller.close();
        }
      });

      // Send heartbeat every 30 seconds to keep connection alive
      const heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": heartbeat\n\n"));
        } catch {
          clearInterval(heartbeatInterval);
          unsubscribe?.();
        }
      }, 30000);

      // Cleanup on abort
      (request as any).signal?.addEventListener("abort", () => {
        clearInterval(heartbeatInterval);
        unsubscribe?.();
        controller.close();
      });
    },
    cancel() {
      unsubscribe?.();
    }
  });

  return new Response(customReadable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive"
    }
  });
}
